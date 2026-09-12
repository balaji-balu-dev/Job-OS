/**
 * Application Repository (server/db/repositories/ApplicationRepository.js)
 */
import { getDb } from '../database.js';

export class ApplicationRepository {
  static getAll() {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM applications ORDER BY updated_at DESC').all();
    return rows.map(this._hydrate);
  }

  static getById(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
    return row ? this._hydrate(row) : null;
  }

  static getByJobId(jobId) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM applications WHERE job_id = ?').get(jobId);
    return row ? this._hydrate(row) : null;
  }

  static insert(app) {
    const db = getDb();
    const now = Date.now();
    db.prepare(`
      INSERT INTO applications (
        id, job_id, company, role, status, verification_score, verification_hash,
        lock_token, lock_expires_at, preflight_checks_json, answers_json,
        submitted_at, receipt_json, resume_version, resume_id, ats_score,
        follow_up_date, notes, salary_offered, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      app.id, app.job_id, app.company, app.role, app.status || 'DRAFTING',
      app.verification_score || '0%', app.verification_hash || null,
      app.lock_token || null, app.lock_expires_at || null,
      JSON.stringify(app.preflight_checks || []),
      JSON.stringify(app.answers || []),
      null, null,
      app.resume_version || 1, app.resume_id || null, app.ats_score || 0,
      app.follow_up_date || null, app.notes || null, app.salary_offered || null,
      now, now
    );
    return this.getById(app.id);
  }

  static sealAndLock(id, { verificationScore, verificationHash, lockToken, ttlMs = 900000 }) {
    const db = getDb();
    const now = Date.now();
    const expiresAt = now + ttlMs;

    db.prepare(`
      UPDATE applications
      SET status = 'GATE_HALTED',
          verification_score = ?,
          verification_hash = ?,
          lock_token = ?,
          lock_expires_at = ?,
          updated_at = ?
      WHERE id = ?
    `).run(verificationScore, verificationHash, lockToken, expiresAt, now, id);

    return this.getById(id);
  }

  static unlockAndSubmit(id, receipt) {
    const db = getDb();
    const now = Date.now();

    db.prepare(`
      UPDATE applications
      SET status = 'SUBMITTED',
          submitted_at = ?,
          receipt_json = ?,
          lock_token = NULL,
          updated_at = ?
      WHERE id = ?
    `).run(now, JSON.stringify(receipt), now, id);

    return this.getById(id);
  }

  static updateStatus(id, status, notes = null) {
    const db = getDb();
    const now = Date.now();
    db.prepare(`
      UPDATE applications
      SET status = ?,
          notes = COALESCE(?, notes),
          updated_at = ?
      WHERE id = ?
    `).run(status, notes, now, id);
    return this.getById(id);
  }

  static updateLifecycle(id, updates) {
    const db = getDb();
    const existing = this.getById(id);
    if (!existing) return null;

    const now = Date.now();
    const status = updates.status !== undefined ? updates.status : existing.status;
    const resumeVersion = updates.resumeVersion !== undefined ? updates.resumeVersion : existing.resume_version;
    const resumeId = updates.resumeId !== undefined ? updates.resumeId : existing.resume_id;
    const atsScore = updates.atsScore !== undefined ? updates.atsScore : existing.ats_score;
    const followUpDate = updates.followUpDate !== undefined ? updates.followUpDate : existing.follow_up_date;
    const notes = updates.notes !== undefined ? updates.notes : existing.notes;
    const salaryOffered = updates.salaryOffered !== undefined ? updates.salaryOffered : existing.salary_offered;

    db.prepare(`
      UPDATE applications
      SET status = ?, resume_version = ?, resume_id = ?, ats_score = ?, follow_up_date = ?, notes = ?, salary_offered = ?, updated_at = ?
      WHERE id = ?
    `).run(status, resumeVersion, resumeId, atsScore, followUpDate, notes, salaryOffered, now, id);

    return this.getById(id);
  }

  static updateAnswers(id, answers) {
    const db = getDb();
    const now = Date.now();
    db.prepare('UPDATE applications SET answers_json = ?, updated_at = ? WHERE id = ?')
      .run(JSON.stringify(answers), now, id);
    return this.getById(id);
  }

  static _hydrate(row) {
    return {
      ...row,
      preflight_checks: JSON.parse(row.preflight_checks_json || '[]'),
      answers: JSON.parse(row.answers_json || '[]'),
      receipt: row.receipt_json ? JSON.parse(row.receipt_json) : null,
      resume_version: row.resume_version || 1,
      resume_id: row.resume_id || null,
      ats_score: row.ats_score || 0,
      follow_up_date: row.follow_up_date || null,
      notes: row.notes || null,
      salary_offered: row.salary_offered || null
    };
  }
}
