/**
 * Multi-Role Resume Repository (server/db/repositories/ResumeRepository.js)
 * Local-first persistence and management of role-specific resumes
 */
import fs from 'node:fs';
import { getDb } from '../database.js';

export class ResumeRepository {
  static getAll() {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM resumes ORDER BY is_primary DESC, created_at DESC').all();
    return rows.map(this._mapRow);
  }

  static getById(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM resumes WHERE id = ?').get(id);
    return row ? this._mapRow(row) : null;
  }

  static getPrimary() {
    const db = getDb();
    const row = db.prepare('SELECT * FROM resumes WHERE is_primary = 1 LIMIT 1').get();
    return row ? this._mapRow(row) : null;
  }

  static getByRole(roleCategory) {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM resumes WHERE role_category = ? ORDER BY is_primary DESC').all(roleCategory);
    return rows.map(this._mapRow);
  }

  static create({ id, title, roleCategory, filename, originalName, filePath, fileSize, mimeType, isPrimary = false }) {
    const db = getDb();
    const now = Date.now();
    const primaryInt = isPrimary ? 1 : 0;

    // If marked primary, clear existing primary
    if (isPrimary) {
      db.prepare('UPDATE resumes SET is_primary = 0').run();
    }

    db.prepare(`
      INSERT INTO resumes (id, title, role_category, filename, original_name, file_path, file_size, mime_type, is_primary, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, roleCategory, filename, originalName, filePath, fileSize, mimeType, primaryInt, now, now);

    return this.getById(id);
  }

  static update(id, { title, roleCategory, isPrimary }) {
    const db = getDb();
    const current = this.getById(id);
    if (!current) return null;

    const now = Date.now();
    const newTitle = title !== undefined ? title : current.title;
    const newRole = roleCategory !== undefined ? roleCategory : current.roleCategory;
    
    if (isPrimary === true) {
      db.prepare('UPDATE resumes SET is_primary = 0').run();
    }
    const newPrimary = isPrimary !== undefined ? (isPrimary ? 1 : 0) : (current.isPrimary ? 1 : 0);

    db.prepare(`
      UPDATE resumes
      SET title = ?, role_category = ?, is_primary = ?, updated_at = ?
      WHERE id = ?
    `).run(newTitle, newRole, newPrimary, now, id);

    return this.getById(id);
  }

  static setPrimary(id) {
    const db = getDb();
    db.prepare('UPDATE resumes SET is_primary = 0').run();
    db.prepare('UPDATE resumes SET is_primary = 1, updated_at = ? WHERE id = ?').run(Date.now(), id);
    return this.getById(id);
  }

  static delete(id) {
    const db = getDb();
    const current = this.getById(id);
    if (!current) return false;

    // Remove file from disk if exists
    if (fs.existsSync(current.filePath)) {
      try {
        fs.unlinkSync(current.filePath);
      } catch (err) {
        console.warn(`[JobOS] Failed to delete file on disk: ${current.filePath}`, err.message);
      }
    }

    db.prepare('DELETE FROM resumes WHERE id = ?').run(id);

    // If deleted resume was primary, auto-promote the most recent remaining resume
    if (current.isPrimary) {
      const remaining = db.prepare('SELECT id FROM resumes ORDER BY created_at DESC LIMIT 1').get();
      if (remaining) {
        db.prepare('UPDATE resumes SET is_primary = 1 WHERE id = ?').run(remaining.id);
      }
    }

    return true;
  }

  static _mapRow(row) {
    return {
      id: row.id,
      title: row.title,
      roleCategory: row.role_category,
      filename: row.filename,
      originalName: row.original_name,
      filePath: row.file_path,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      isPrimary: Boolean(row.is_primary),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
