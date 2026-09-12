/**
 * Candidate Profile Vault Repository (server/db/repositories/ProfileRepository.js)
 * Enhanced with bidirectional key normalization, bulk update transaction, and field validation
 */
import { getDb } from '../database.js';

// Canonical section key mappings to bridge camelCase frontend & snake_case backend
const SECTION_ALIASES = {
  'workAuthorization': 'work_authorization',
  'work_authorization': 'work_authorization',
  'noticePeriod': 'notice_period',
  'notice_period': 'notice_period',
  'resumeVersions': 'resume_versions',
  'resume_versions': 'resume_versions',
  'approvedAnswers': 'approved_answers',
  'approved_answers': 'approved_answers'
};

export class ProfileRepository {
  static normalizeKey(key) {
    return SECTION_ALIASES[key] || key;
  }

  static getAll() {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM candidate_profile').all();
    const profile = {};

    for (const r of rows) {
      const parsedData = JSON.parse(r.content_json);
      const entry = {
        data: parsedData,
        provenance: r.provenance,
        updatedAt: r.updated_at
      };

      // Set canonical key
      profile[r.section_key] = entry;

      // Provide camelCase aliases for seamless frontend compatibility
      if (r.section_key === 'work_authorization') profile.workAuthorization = entry;
      if (r.section_key === 'notice_period') profile.noticePeriod = entry;
      if (r.section_key === 'resume_versions') profile.resumeVersions = entry;
      if (r.section_key === 'approved_answers') profile.approvedAnswers = entry;
    }
    return profile;
  }

  static getSection(sectionKey) {
    const canonicalKey = this.normalizeKey(sectionKey);
    const db = getDb();
    const row = db.prepare('SELECT * FROM candidate_profile WHERE section_key = ?').get(canonicalKey);
    if (!row) return null;
    return {
      sectionKey: row.section_key,
      data: JSON.parse(row.content_json),
      provenance: row.provenance,
      updatedAt: row.updated_at
    };
  }

  static updateSection(sectionKey, data, provenance = 'USER_VERIFIED') {
    if (!data || typeof data !== 'object') {
      throw new Error(`Invalid data provided for profile section "${sectionKey}"`);
    }

    const canonicalKey = this.normalizeKey(sectionKey);
    const db = getDb();
    const now = Date.now();

    db.prepare(`
      INSERT INTO candidate_profile (section_key, content_json, provenance, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(section_key) DO UPDATE SET
        content_json = excluded.content_json,
        provenance = excluded.provenance,
        updated_at = excluded.updated_at
    `).run(canonicalKey, JSON.stringify(data), provenance, now);

    return this.getSection(canonicalKey);
  }

  static updateBulk(sectionsObj, provenance = 'USER_VERIFIED') {
    if (!sectionsObj || typeof sectionsObj !== 'object') {
      throw new Error('Invalid bulk update payload: expected an object of sections');
    }

    const db = getDb();
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO candidate_profile (section_key, content_json, provenance, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(section_key) DO UPDATE SET
        content_json = excluded.content_json,
        provenance = excluded.provenance,
        updated_at = excluded.updated_at
    `);

    // Perform inside transaction for atomicity
    db.exec('BEGIN TRANSACTION;');
    try {
      for (const [rawKey, sectionVal] of Object.entries(sectionsObj)) {
        if (!sectionVal) continue;
        const canonicalKey = this.normalizeKey(rawKey);
        // If sectionVal has a 'data' property, use that; otherwise sectionVal itself is the data
        const content = sectionVal.data !== undefined ? sectionVal.data : sectionVal;
        const prov = sectionVal.provenance || provenance;
        stmt.run(canonicalKey, JSON.stringify(content), prov, now);
      }
      db.exec('COMMIT;');
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }

    return this.getAll();
  }
}
