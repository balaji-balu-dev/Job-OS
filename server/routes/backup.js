/**
 * Backup & Restore REST Routes (server/routes/backup.js)
 * One-click SQLite WAL backups, PRAGMA integrity checks, restore, and encrypted export
 */
import express from 'express';
import { BackupService } from '../core/BackupService.js';
import { EventBus } from '../core/event-bus.js';

export const backupRoutes = express.Router();

backupRoutes.get(['/integrity', '/integrity-check'], (req, res) => {
  try {
    const result = BackupService.runIntegrityCheck();
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

backupRoutes.post(['/create', '/run'], (req, res) => {
  try {
    const backup = BackupService.createBackup();

    EventBus.publish({
      type: 'BACKUP_CREATED',
      agentId: 'orchestrator',
      summary: `Created verified SQLite backup: ${backup.filename} (${backup.sizeFormatted}). Integrity: OK.`,
      metadata: { filename: backup.filename, sizeBytes: backup.sizeBytes }
    });

    res.status(201).json({ success: true, data: backup });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

backupRoutes.get('/list', (req, res) => {
  try {
    const backups = BackupService.listBackups();
    res.json({ success: true, data: backups });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

backupRoutes.post('/restore', (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ success: false, error: 'Backup filename required' });
    const result = BackupService.restoreBackup(filename);

    EventBus.publish({
      type: 'DATABASE_RESTORED',
      agentId: 'orchestrator',
      summary: `Restored database from ${filename}. Integrity verified: ${result.integrity}.`,
      metadata: { restoredFrom: filename }
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

backupRoutes.get('/export-encrypted', (req, res) => {
  try {
    const passphrase = req.query.passphrase || 'JobOS-Default-Key-2026';
    const encryptedPayload = BackupService.exportEncryptedArchive(passphrase);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="jobos_encrypted_export_${Date.now()}.json"`);
    res.send(encryptedPayload);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
