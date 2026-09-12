/**
 * Mission Repository (server/db/repositories/MissionRepository.js)
 * Persistent SQLite storage for autonomous crawl and application missions
 */
import { getDb } from '../database.js';

export class MissionRepository {
  static getAll() {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM missions ORDER BY created_at DESC').all();
    return rows.map(this._hydrate);
  }

  static getById(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM missions WHERE id = ?').get(id);
    return row ? this._hydrate(row) : null;
  }

  static create(data) {
    const db = getDb();
    const id = data.id || `mission-${Date.now()}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO missions (
        id, name, status, schedule, titles_json, locations_json, skills_json,
        min_match_score, applications_submitted, interviews_generated, last_run, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.name || 'Autonomous Mission',
      data.status || 'active',
      data.schedule || 'Daily at 09:00',
      JSON.stringify(data.titles || []),
      JSON.stringify(data.locations || []),
      JSON.stringify(data.skills || []),
      data.minMatchScore || 80,
      data.applicationsSubmitted || 0,
      data.interviewsGenerated || 0,
      data.lastRun || 'Never',
      now
    );

    return this.getById(id);
  }

  static updateStatus(id, status) {
    const db = getDb();
    db.prepare('UPDATE missions SET status = ? WHERE id = ?').run(status, id);
    return this.getById(id);
  }

  static delete(id) {
    const db = getDb();
    return db.prepare('DELETE FROM missions WHERE id = ?').run(id);
  }

  static _hydrate(row) {
    return {
      id: row.id,
      name: row.name,
      status: row.status,
      schedule: row.schedule,
      titles: JSON.parse(row.titles_json || '[]'),
      locations: JSON.parse(row.locations_json || '[]'),
      skills: JSON.parse(row.skills_json || '[]'),
      minMatchScore: row.min_match_score,
      applicationsSubmitted: row.applications_submitted,
      interviewsGenerated: row.interviews_generated,
      lastRun: row.last_run,
      createdAt: row.created_at
    };
  }
}
