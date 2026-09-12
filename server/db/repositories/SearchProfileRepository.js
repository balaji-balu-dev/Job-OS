/**
 * SearchProfileRepository (server/db/repositories/SearchProfileRepository.js)
 * Local-first multi-profile search configuration management
 */
import { getDb } from '../database.js';

export class SearchProfileRepository {
  static _mapRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      isActive: Boolean(row.is_active),
      keywords: JSON.parse(row.keywords_json || '[]'),
      titles: JSON.parse(row.titles_json || '[]'),
      locations: JSON.parse(row.locations_json || '[]'),
      salaryMin: row.salary_min || 0,
      minMatchScore: row.min_match_score || 80,
      portals: JSON.parse(row.portals_json || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static getAll() {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM search_profiles ORDER BY is_active DESC, updated_at DESC').all();
    return rows.map(this._mapRow);
  }

  static getActive() {
    const db = getDb();
    const row = db.prepare('SELECT * FROM search_profiles WHERE is_active = 1 LIMIT 1').get();
    return this._mapRow(row) || this.getAll()[0] || null;
  }

  static getById(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM search_profiles WHERE id = ?').get(id);
    return this._mapRow(row);
  }

  static create(profile) {
    const db = getDb();
    const now = Date.now();
    const id = profile.id || `sp-${now}-${Math.random().toString(36).substring(2, 6)}`;
    const isActive = profile.isActive ? 1 : 0;

    if (isActive) {
      db.prepare('UPDATE search_profiles SET is_active = 0').run();
    }

    db.prepare(`
      INSERT INTO search_profiles (id, name, is_active, keywords_json, titles_json, locations_json, salary_min, min_match_score, portals_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      profile.name || 'Untitled Search Profile',
      isActive,
      JSON.stringify(profile.keywords || []),
      JSON.stringify(profile.titles || []),
      JSON.stringify(profile.locations || []),
      profile.salaryMin || 0,
      profile.minMatchScore || 80,
      JSON.stringify(profile.portals || []),
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
    const keywords = updates.keywords !== undefined ? updates.keywords : existing.keywords;
    const titles = updates.titles !== undefined ? updates.titles : existing.titles;
    const locations = updates.locations !== undefined ? updates.locations : existing.locations;
    const salaryMin = updates.salaryMin !== undefined ? updates.salaryMin : existing.salaryMin;
    const minMatchScore = updates.minMatchScore !== undefined ? updates.minMatchScore : existing.minMatchScore;
    const portals = updates.portals !== undefined ? updates.portals : existing.portals;

    db.prepare(`
      UPDATE search_profiles
      SET name = ?, keywords_json = ?, titles_json = ?, locations_json = ?, salary_min = ?, min_match_score = ?, portals_json = ?, updated_at = ?
      WHERE id = ?
    `).run(
      name,
      JSON.stringify(keywords),
      JSON.stringify(titles),
      JSON.stringify(locations),
      salaryMin,
      minMatchScore,
      JSON.stringify(portals),
      now,
      id
    );

    return this.getById(id);
  }

  static setActive(id) {
    const db = getDb();
    db.prepare('UPDATE search_profiles SET is_active = 0').run();
    db.prepare('UPDATE search_profiles SET is_active = 1, updated_at = ? WHERE id = ?').run(Date.now(), id);
    return this.getById(id);
  }

  static delete(id) {
    const db = getDb();
    const res = db.prepare('DELETE FROM search_profiles WHERE id = ?').run(id);
    const countActive = db.prepare('SELECT COUNT(*) as count FROM search_profiles WHERE is_active = 1').get();
    if (countActive.count === 0) {
      const first = db.prepare('SELECT id FROM search_profiles LIMIT 1').get();
      if (first) {
        db.prepare('UPDATE search_profiles SET is_active = 1 WHERE id = ?').run(first.id);
      }
    }
    return res.changes > 0;
  }
}
