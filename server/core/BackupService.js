/**
 * BackupService (server/core/BackupService.js)
 * Local-first SQLite backup, automated PRAGMA integrity verification, restore, and AES-256 export
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { getDb } from '../db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUPS_DIR = path.resolve(__dirname, '../../data/backups');
const getDbPath = () => process.env.JOBOS_DB_PATH || path.resolve(__dirname, '../../data/jobos.db');

export class BackupService {
  static _ensureBackupDir() {
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }
  }

  /**
   * Performs database integrity check
   */
  static runIntegrityCheck() {
    const db = getDb();
    const integrityResult = db.prepare('PRAGMA integrity_check').get();
    const fkResult = db.prepare('PRAGMA foreign_key_check').all();

    const isHealthy = integrityResult && integrityResult.integrity_check === 'ok' && fkResult.length === 0;

    return {
      healthy: isHealthy,
      integrity: integrityResult ? integrityResult.integrity_check : 'error',
      foreignKeyViolations: fkResult.length,
      timestamp: Date.now()
    };
  }

  /**
   * Create an immediate WAL-checkpointed database backup
   */
  static createBackup() {
    this._ensureBackupDir();
    const db = getDb();

    // 1. Force WAL checkpoint to flush all pending writes to main DB file
    try {
      db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
    } catch (e) {
      console.warn('[JobOS Backup] Checkpoint note:', e.message);
    }

    // 2. Run integrity check before taking backup
    const check = this.runIntegrityCheck();
    if (!check.healthy) {
      throw new Error(`Cannot backup: database integrity check failed (${check.integrity})`);
    }

    // 3. Create timestamped backup file
    const timestamp = Date.now();
    const dateStr = new Date(timestamp).toISOString().replace(/[:.]/g, '-');
    const backupFileName = `jobos_backup_${dateStr}.db`;
    const backupFilePath = path.join(BACKUPS_DIR, backupFileName);

    fs.copyFileSync(getDbPath(), backupFilePath);
    const stats = fs.statSync(backupFilePath);

    return {
      success: true,
      filename: backupFileName,
      filePath: backupFilePath,
      sizeBytes: stats.size,
      sizeFormatted: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
      integrity: check.integrity,
      createdAt: timestamp
    };
  }

  /**
   * List all available backup files
   */
  static listBackups() {
    this._ensureBackupDir();
    const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.db') || f.endsWith('.json') || f.endsWith('.enc'));

    return files.map(filename => {
      const filePath = path.join(BACKUPS_DIR, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        filePath,
        sizeBytes: stats.size,
        sizeFormatted: `${(stats.size / 1024).toFixed(1)} KB`,
        createdAt: stats.mtimeMs
      };
    }).sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Restore database from backup file
   */
  static restoreBackup(filename) {
    this._ensureBackupDir();
    const safeName = path.basename(filename);
    const backupFilePath = path.join(BACKUPS_DIR, safeName);

    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup file not found: ${safeName}`);
    }

    // Replace DB file
    fs.copyFileSync(backupFilePath, getDbPath());

    // Verify restored database integrity
    const check = this.runIntegrityCheck();
    if (!check.healthy) {
      throw new Error(`Restored database failed integrity check: ${check.integrity}`);
    }

    return {
      success: true,
      restoredFrom: safeName,
      integrity: check.integrity
    };
  }

  /**
   * Export encrypted profile & application archive
   */
  static exportEncryptedArchive(passphrase = 'JobOS-Default-Key-2026') {
    const db = getDb();
    const profileRows = db.prepare('SELECT * FROM candidate_profile').all();
    const applications = db.prepare('SELECT * FROM applications').all();
    const resumes = db.prepare('SELECT id, title, role_category, original_name FROM resumes').all();

    const archiveData = JSON.stringify({
      version: '2.0.0',
      exportedAt: Date.now(),
      profile: profileRows,
      applications,
      resumes
    });

    const salt = crypto.randomBytes(16);
    const key = crypto.scryptSync(passphrase, salt, 32);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(archiveData, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();

    const exportPayload = JSON.stringify({
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      data: encrypted
    });

    return exportPayload;
  }
}
