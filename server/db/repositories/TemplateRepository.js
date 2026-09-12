/**
 * TemplateRepository (server/db/repositories/TemplateRepository.js)
 * Resume & cover letter template storage with support for Markdown, LaTeX, Typst, and Text
 */
import { getDb } from '../database.js';

export class TemplateRepository {
  static _mapRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      type: row.type, // resume, cover_letter
      format: row.format, // markdown, latex, typst, text
      content: row.content,
      styleRules: JSON.parse(row.style_rules_json || '{}'),
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static getAll(type = null) {
    const db = getDb();
    let query = 'SELECT * FROM templates';
    const params = [];
    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }
    query += ' ORDER BY is_default DESC, name ASC';
    const rows = db.prepare(query).all(...params);
    return rows.map(this._mapRow);
  }

  static getById(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM templates WHERE id = ?').get(id);
    return this._mapRow(row);
  }

  static getDefault(type) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM templates WHERE type = ? AND is_default = 1 LIMIT 1').get(type);
    return this._mapRow(row) || this.getAll(type)[0] || null;
  }

  static create(template) {
    const db = getDb();
    const now = Date.now();
    const id = template.id || `tmpl-${now}-${Math.random().toString(36).substring(2, 6)}`;
    const isDefault = template.isDefault ? 1 : 0;

    if (isDefault) {
      db.prepare('UPDATE templates SET is_default = 0 WHERE type = ?').run(template.type);
    }

    db.prepare(`
      INSERT INTO templates (id, name, type, format, content, style_rules_json, is_default, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      template.name || 'Untitled Template',
      template.type || 'resume',
      template.format || 'markdown',
      template.content || '',
      JSON.stringify(template.styleRules || {}),
      isDefault,
      now,
      now
    );

    return this.getById(id);
  }

  static update(id, updates) {
    const db = getDb();
    const existing = this.getById(id);
    if (!existing) return null;

    const now = Date.now();
    const name = updates.name !== undefined ? updates.name : existing.name;
    const format = updates.format !== undefined ? updates.format : existing.format;
    const content = updates.content !== undefined ? updates.content : existing.content;
    const styleRules = updates.styleRules !== undefined ? updates.styleRules : existing.styleRules;

    db.prepare(`
      UPDATE templates
      SET name = ?, format = ?, content = ?, style_rules_json = ?, updated_at = ?
      WHERE id = ?
    `).run(name, format, content, JSON.stringify(styleRules), now, id);

    return this.getById(id);
  }

  static setDefault(id) {
    const db = getDb();
    const existing = this.getById(id);
    if (!existing) return null;

    db.prepare('UPDATE templates SET is_default = 0 WHERE type = ?').run(existing.type);
    db.prepare('UPDATE templates SET is_default = 1, updated_at = ? WHERE id = ?').run(Date.now(), id);
    return this.getById(id);
  }

  static duplicate(id) {
    const existing = this.getById(id);
    if (!existing) return null;

    return this.create({
      name: `${existing.name} (Copy)`,
      type: existing.type,
      format: existing.format,
      content: existing.content,
      styleRules: existing.styleRules,
      isDefault: false
    });
  }

  static delete(id) {
    const db = getDb();
    const res = db.prepare('DELETE FROM templates WHERE id = ?').run(id);
    return res.changes > 0;
  }
}
