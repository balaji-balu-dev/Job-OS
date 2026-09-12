/**
 * Attention Items Repository (server/db/repositories/AttentionRepository.js)
 */
import { getDb } from '../database.js';

export class AttentionRepository {
  static getAll({ status = 'PENDING' } = {}) {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM attention_items WHERE status = ? ORDER BY created_at DESC').all(status);
    return rows.map(this._mapRow);
  }

  static getById(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM attention_items WHERE id = ?').get(id);
    return row ? this._mapRow(row) : null;
  }

  static create(item) {
    const db = getDb();
    const id = item.id || `att-${Date.now()}`;
    const now = Date.now();
    db.prepare(`
      INSERT INTO attention_items (
        id, type, urgency, title, description, agent, time_elapsed,
        action_label, target_view, target_id, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, item.type, item.urgency || 'medium', item.title,
      item.description, item.agent, item.timeElapsed || item.time_elapsed || 'Just now',
      item.actionLabel || item.action_label || 'Review Action',
      item.targetView || item.target_view || 'dashboard',
      item.targetId || item.target_id,
      item.status || 'PENDING', now
    );
    return this.getById(id);
  }

  static resolve(id, status = 'APPROVED') {
    const db = getDb();
    db.prepare('UPDATE attention_items SET status = ? WHERE id = ?').run(status, id);
    return this.getById(id);
  }

  static _mapRow(row) {
    return {
      id: row.id,
      type: row.type,
      urgency: row.urgency,
      title: row.title,
      description: row.description,
      agent: row.agent,
      timeElapsed: row.time_elapsed || 'Just now',
      time_elapsed: row.time_elapsed || 'Just now',
      actionLabel: row.action_label || 'Review & Proceed',
      action_label: row.action_label || 'Review & Proceed',
      targetView: row.target_view || 'dashboard',
      target_view: row.target_view || 'dashboard',
      targetId: row.target_id,
      target_id: row.target_id,
      status: row.status,
      createdAt: row.created_at
    };
  }
}
