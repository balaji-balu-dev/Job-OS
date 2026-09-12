/**
 * EmailSignalRepository (server/db/repositories/EmailSignalRepository.js)
 * Inbound application and recruiter email signals with human approval triage
 */
import { getDb } from '../database.js';

export class EmailSignalRepository {
  static _mapRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      applicationId: row.application_id,
      company: row.company,
      sender: row.sender,
      subject: row.subject,
      date: row.date,
      detectedSignal: row.detected_signal,
      confidence: row.confidence,
      proposedStatus: row.proposed_status,
      status: row.status, // pending_approval, approved, rejected
      rawSnippet: row.raw_snippet,
      createdAt: row.created_at
    };
  }

  static getAll(status = null) {
    const db = getDb();
    let query = 'SELECT * FROM email_signals';
    const params = [];
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    const rows = db.prepare(query).all(...params);
    return rows.map(this._mapRow);
  }

  static getById(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM email_signals WHERE id = ?').get(id);
    return this._mapRow(row);
  }

  static create(signal) {
    const db = getDb();
    const now = Date.now();
    const id = signal.id || `sig-${now}-${Math.random().toString(36).substring(2, 6)}`;

    db.prepare(`
      INSERT INTO email_signals (id, application_id, company, sender, subject, date, detected_signal, confidence, proposed_status, status, raw_snippet, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      signal.applicationId || null,
      signal.company,
      signal.sender,
      signal.subject,
      signal.date || 'Just now',
      signal.detectedSignal,
      signal.confidence || 90,
      signal.proposedStatus,
      signal.status || 'pending_approval',
      signal.rawSnippet || '',
      now
    );

    return this.getById(id);
  }

  static updateStatus(id, status) {
    const db = getDb();
    db.prepare('UPDATE email_signals SET status = ? WHERE id = ?').run(status, id);
    return this.getById(id);
  }

  static delete(id) {
    const db = getDb();
    const res = db.prepare('DELETE FROM email_signals WHERE id = ?').run(id);
    return res.changes > 0;
  }
}
