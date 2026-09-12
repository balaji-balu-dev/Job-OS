/**
 * Job Repository (server/db/repositories/JobRepository.js)
 */
import { getDb } from '../database.js';

export class JobRepository {
  static getAll({ status, limit = 50, offset = 0 } = {}) {
    const db = getDb();
    let query = 'SELECT * FROM jobs';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY match_score DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = db.prepare(query).all(...params);
    return rows.map(this._hydrate);
  }

  static getById(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
    return row ? this._hydrate(row) : null;
  }

  static getByDedupHash(hash) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM jobs WHERE dedup_hash = ?').get(hash);
    return row ? this._hydrate(row) : null;
  }

  static insert(job) {
    const db = getDb();
    const now = Date.now();
    db.prepare(`
      INSERT INTO jobs (
        id, external_id, title, company, location, source, source_type,
        match_score, salary, employment_type, discovered_time, application_method,
        difficulty, status, dedup_hash, match_reasons_json, concerns_json,
        skills_json, description, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      job.id, job.external_id || null, job.title, job.company, job.location,
      job.source, job.source_type, job.match_score || 80, job.salary || null,
      job.employment_type || 'Full-time', job.discovered_time || 'Just now',
      job.application_method || 'Direct ATS Integration', job.difficulty || 'Moderate',
      job.status || 'discovered', job.dedup_hash,
      JSON.stringify(job.match_reasons || []),
      JSON.stringify(job.concerns || []),
      JSON.stringify(job.skills || []),
      job.description || '', now, now
    );
    return this.getById(job.id);
  }

  static updateStatus(id, status) {
    const db = getDb();
    const now = Date.now();
    db.prepare('UPDATE jobs SET status = ?, updated_at = ? WHERE id = ?').run(status, now, id);
    return this.getById(id);
  }

  static updateFitAnalysis(id, { matchScore, fitBreakdown, dealBreakers, priorityTier, concerns, matchReasons }) {
    const db = getDb();
    const now = Date.now();
    db.prepare(`
      UPDATE jobs
      SET match_score = COALESCE(?, match_score),
          fit_breakdown_json = COALESCE(?, fit_breakdown_json),
          deal_breakers_json = COALESCE(?, deal_breakers_json),
          priority_tier = COALESCE(?, priority_tier),
          concerns_json = COALESCE(?, concerns_json),
          match_reasons_json = COALESCE(?, match_reasons_json),
          updated_at = ?
      WHERE id = ?
    `).run(
      matchScore,
      fitBreakdown ? JSON.stringify(fitBreakdown) : null,
      dealBreakers ? JSON.stringify(dealBreakers) : null,
      priorityTier,
      concerns ? JSON.stringify(concerns) : null,
      matchReasons ? JSON.stringify(matchReasons) : null,
      now,
      id
    );
    return this.getById(id);
  }

  static _hydrate(row) {
    return {
      ...row,
      match_reasons: JSON.parse(row.match_reasons_json || '[]'),
      concerns: JSON.parse(row.concerns_json || '[]'),
      skills: JSON.parse(row.skills_json || '[]'),
      fit_breakdown: JSON.parse(row.fit_breakdown_json || 'null'),
      deal_breakers: JSON.parse(row.deal_breakers_json || '[]'),
      priority_tier: row.priority_tier || 'GOOD_MATCH',
      deadline: row.deadline || null,
      is_expired: Boolean(row.is_expired)
    };
  }
}
