/**
 * Agent Repository (server/db/repositories/AgentRepository.js)
 */
import { getDb } from '../database.js';

export class AgentRepository {
  static getAll() {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM agents ORDER BY id ASC').all();
    return rows.map(r => ({
      ...r,
      details: JSON.parse(r.details_json || '{}')
    }));
  }

  static getById(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
    if (!row) return null;
    return {
      ...row,
      details: JSON.parse(row.details_json || '{}')
    };
  }

  static updateState(id, state, currentTask = null) {
    const db = getDb();
    const now = Date.now();
    if (currentTask !== null) {
      db.prepare(`
        UPDATE agents 
        SET state = ?, current_task = ?, last_activity = 'Just now', updated_at = ? 
        WHERE id = ?
      `).run(state, currentTask, now, id);
    } else {
      db.prepare(`
        UPDATE agents 
        SET state = ?, last_activity = 'Just now', updated_at = ? 
        WHERE id = ?
      `).run(state, now, id);
    }
    return this.getById(id);
  }

  static updateTelemetry(id, { progress, queueCount, tokensSpent, clusterEfficiency }) {
    const db = getDb();
    const now = Date.now();
    db.prepare(`
      UPDATE agents
      SET progress = COALESCE(?, progress),
          queue_count = COALESCE(?, queue_count),
          tokens_spent = COALESCE(?, tokens_spent),
          cluster_efficiency = COALESCE(?, cluster_efficiency),
          updated_at = ?
      WHERE id = ?
    `).run(progress, queueCount, tokensSpent, clusterEfficiency, now, id);
    return this.getById(id);
  }
}
