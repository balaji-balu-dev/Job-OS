/**
 * Task Repository (server/db/repositories/TaskRepository.js)
 */
import { getDb } from '../database.js';

export class TaskRepository {
  static create(task) {
    const db = getDb();
    const now = Date.now();
    db.prepare(`
      INSERT INTO tasks (
        id, correlation_id, type, agent_id, status, priority,
        payload_json, result_json, error_json, checkpoint_json,
        idempotency_key, retry_count, max_retries, dependencies_json,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      task.id, task.correlationId, task.type, task.agentId,
      task.status || 'PENDING', task.priority || 5,
      JSON.stringify(task.payload || {}),
      task.result ? JSON.stringify(task.result) : null,
      task.error ? JSON.stringify(task.error) : null,
      task.checkpoint ? JSON.stringify(task.checkpoint) : null,
      task.idempotencyKey, task.retryCount || 0, task.maxRetries || 0,
      JSON.stringify(task.dependencies || []), now
    );
    return this.getById(task.id);
  }

  static getById(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    return row ? this._hydrate(row) : null;
  }

  static getByIdempotencyKey(key) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM tasks WHERE idempotency_key = ?').get(key);
    return row ? this._hydrate(row) : null;
  }

  static getPending(limit = 10) {
    const db = getDb();
    const rows = db.prepare(`
      SELECT * FROM tasks
      WHERE status = 'PENDING'
      ORDER BY priority ASC, created_at ASC
      LIMIT ?
    `).all(limit);
    return rows.map(this._hydrate);
  }

  static updateStatus(id, status, { result, error, checkpoint } = {}) {
    const db = getDb();
    const now = Date.now();
    let query = 'UPDATE tasks SET status = ?';
    const params = [status];

    if (status === 'RUNNING') {
      query += ', started_at = ?';
      params.push(now);
    } else if (status === 'COMPLETED' || status === 'FAILED') {
      query += ', completed_at = ?';
      params.push(now);
    }

    if (result !== undefined) {
      query += ', result_json = ?';
      params.push(JSON.stringify(result));
    }
    if (error !== undefined) {
      query += ', error_json = ?';
      params.push(JSON.stringify(error));
    }
    if (checkpoint !== undefined) {
      query += ', checkpoint_json = ?';
      params.push(JSON.stringify(checkpoint));
    }

    query += ' WHERE id = ?';
    params.push(id);

    db.prepare(query).run(...params);
    return this.getById(id);
  }

  static _hydrate(row) {
    return {
      ...row,
      payload: JSON.parse(row.payload_json || '{}'),
      result: row.result_json ? JSON.parse(row.result_json) : null,
      error: row.error_json ? JSON.parse(row.error_json) : null,
      checkpoint: row.checkpoint_json ? JSON.parse(row.checkpoint_json) : null,
      dependencies: JSON.parse(row.dependencies_json || '[]')
    };
  }
}
