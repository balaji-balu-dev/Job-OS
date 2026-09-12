/**
 * InterviewPrepRepository (server/db/repositories/InterviewPrepRepository.js)
 * Persistent storage for stage-specific interview preparation packs and STAR stories
 */
import { getDb } from '../database.js';

export class InterviewPrepRepository {
  static _mapRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      jobId: row.job_id,
      company: row.company,
      role: row.role,
      stage: row.stage,
      content: JSON.parse(row.content_json || '{}'),
      createdAt: row.created_at
    };
  }

  static getByJobId(jobId) {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM interview_preps WHERE job_id = ? ORDER BY created_at DESC').all(jobId);
    return rows.map(this._mapRow);
  }

  static getById(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM interview_preps WHERE id = ?').get(id);
    return this._mapRow(row);
  }

  static save(prep) {
    const db = getDb();
    const now = Date.now();
    const id = prep.id || `prep-${now}-${Math.random().toString(36).substring(2, 6)}`;

    db.prepare(`
      INSERT INTO interview_preps (id, job_id, company, role, stage, content_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      prep.jobId,
      prep.company,
      prep.role,
      prep.stage || 'initial',
      JSON.stringify(prep.content || {}),
      now
    );

    return this.getById(id);
  }

  static delete(id) {
    const db = getDb();
    const res = db.prepare('DELETE FROM interview_preps WHERE id = ?').run(id);
    return res.changes > 0;
  }
}
