/**
 * Event Repository (server/db/repositories/EventRepository.js)
 */
import { getDb } from '../database.js';

export class EventRepository {
  static append(event) {
    const db = getDb();
    const id = event.id || `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const timestamp = event.timestamp || Date.now();

    db.prepare(`
      INSERT INTO events (id, timestamp, type, agent_id, entity_type, entity_id, summary, metadata_json, log_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      timestamp,
      event.type || 'SYSTEM',
      event.agentId || event.agent_id || 'system',
      event.entityType || event.entity_type || 'SYSTEM',
      event.entityId || event.entity_id || 'system',
      event.summary || '',
      JSON.stringify(event.metadata || {}),
      event.logLevel || event.log_level || 'INFO'
    );

    return {
      ...event,
      id,
      timestamp
    };
  }

  static getRecent(limit = 50) {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM events ORDER BY timestamp DESC LIMIT ?').all(limit);
    return rows.map(r => ({
      ...r,
      metadata: JSON.parse(r.metadata_json || '{}')
    }));
  }

  static getSince(timestamp) {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM events WHERE timestamp > ? ORDER BY timestamp ASC').all(timestamp);
    return rows.map(r => ({
      ...r,
      metadata: JSON.parse(r.metadata_json || '{}')
    }));
  }
}
