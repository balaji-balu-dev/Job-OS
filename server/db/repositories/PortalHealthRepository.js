/**
 * PortalHealthRepository (server/db/repositories/PortalHealthRepository.js)
 * Live status, rate-limit management, error telemetry, and per-portal configuration
 */
import { getDb } from '../database.js';

export class PortalHealthRepository {
  static _mapRow(row) {
    if (!row) return null;
    return {
      portalId: row.portal_id,
      name: row.name,
      status: row.status, // healthy, degraded, rate_limited, offline
      lastScrapedAt: row.last_scraped_at,
      jobsRetrievedToday: row.jobs_retrieved_today || 0,
      errorCount: row.error_count || 0,
      rateLimitResetAt: row.rate_limit_reset_at,
      config: JSON.parse(row.config_json || '{}'),
      isEnabled: Boolean(row.is_enabled),
      updatedAt: row.updated_at
    };
  }

  static getAll() {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM portal_health ORDER BY name ASC').all();
    return rows.map(this._mapRow);
  }

  static getById(portalId) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM portal_health WHERE portal_id = ?').get(portalId);
    return this._mapRow(row);
  }

  static recordScrape(portalId, jobsCount = 0) {
    const db = getDb();
    const now = Date.now();
    db.prepare(`
      UPDATE portal_health
      SET last_scraped_at = ?, jobs_retrieved_today = jobs_retrieved_today + ?, status = 'healthy', updated_at = ?
      WHERE portal_id = ?
    `).run(now, jobsCount, now, portalId);
    return this.getById(portalId);
  }

  static recordError(portalId, errorMsg = '') {
    const db = getDb();
    const now = Date.now();
    const isRateLimit = errorMsg.toLowerCase().includes('rate limit') || errorMsg.includes('429');
    const status = isRateLimit ? 'rate_limited' : 'degraded';
    const rateLimitReset = isRateLimit ? now + (15 * 60 * 1000) : null;

    db.prepare(`
      UPDATE portal_health
      SET error_count = error_count + 1, status = ?, rate_limit_reset_at = COALESCE(?, rate_limit_reset_at), updated_at = ?
      WHERE portal_id = ?
    `).run(status, rateLimitReset, now, portalId);
    return this.getById(portalId);
  }

  static toggleEnabled(portalId, isEnabled) {
    const db = getDb();
    const now = Date.now();
    const val = isEnabled ? 1 : 0;
    db.prepare('UPDATE portal_health SET is_enabled = ?, updated_at = ? WHERE portal_id = ?').run(val, now, portalId);
    return this.getById(portalId);
  }

  static updateConfig(portalId, configUpdates) {
    const db = getDb();
    const existing = this.getById(portalId);
    if (!existing) return null;

    const merged = { ...existing.config, ...configUpdates };
    const now = Date.now();
    db.prepare('UPDATE portal_health SET config_json = ?, updated_at = ? WHERE portal_id = ?')
      .run(JSON.stringify(merged), now, portalId);
    return this.getById(portalId);
  }
}
