/**
 * AI Usage & Limit Protection Repository (server/db/repositories/AIUsageRepository.js)
 * Persistent token accounting, safety thresholds, and atomic limit management
 */
import { getDb } from '../database.js';

export class AIUsageRepository {
  /**
   * Retrieves active AI usage configuration and limits
   */
  static getConfig() {
    const db = getDb();
    let row = db.prepare('SELECT * FROM ai_usage_config WHERE id = ?').get('default');
    if (!row) {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      db.prepare(`
        INSERT INTO ai_usage_config (id, is_manually_paused, is_auto_paused, pause_reason, paused_at, token_limit, cost_limit_usd, warning_threshold_pct, hard_stop_threshold_pct, period_type, period_start, period_end, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run('default', 0, 0, null, null, 100000, 5.00, 80.0, 100.0, 'MONTHLY', monthStart.getTime(), monthEnd.getTime(), Date.now());

      row = db.prepare('SELECT * FROM ai_usage_config WHERE id = ?').get('default');
    }

    return {
      id: row.id,
      isManuallyPaused: Boolean(row.is_manually_paused),
      isAutoPaused: Boolean(row.is_auto_paused),
      pauseReason: row.pause_reason,
      pausedAt: row.paused_at,
      tokenLimit: row.token_limit,
      costLimitUsd: row.cost_limit_usd,
      warningThresholdPct: row.warning_threshold_pct,
      hardStopThresholdPct: row.hard_stop_threshold_pct,
      periodType: row.period_type,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      updatedAt: row.updated_at
    };
  }

  /**
   * Updates safety limit settings
   */
  static updateConfig(updates) {
    const db = getDb();
    const now = Date.now();
    const current = this.getConfig();

    const tokenLimit = updates.tokenLimit !== undefined ? Number(updates.tokenLimit) : current.tokenLimit;
    const costLimitUsd = updates.costLimitUsd !== undefined ? Number(updates.costLimitUsd) : current.costLimitUsd;
    const warningThresholdPct = updates.warningThresholdPct !== undefined ? Number(updates.warningThresholdPct) : current.warningThresholdPct;
    const hardStopThresholdPct = updates.hardStopThresholdPct !== undefined ? Number(updates.hardStopThresholdPct) : current.hardStopThresholdPct;
    const periodType = updates.periodType || current.periodType;

    db.prepare(`
      UPDATE ai_usage_config
      SET token_limit = ?,
          cost_limit_usd = ?,
          warning_threshold_pct = ?,
          hard_stop_threshold_pct = ?,
          period_type = ?,
          updated_at = ?
      WHERE id = 'default'
    `).run(tokenLimit, costLimitUsd, warningThresholdPct, hardStopThresholdPct, periodType, now);

    return this.getConfig();
  }

  /**
   * User-controlled manual pause toggle
   */
  static setManualPause(isPaused) {
    const db = getDb();
    const now = Date.now();
    const pauseReason = isPaused ? 'MANUAL' : null;
    const pausedAt = isPaused ? now : null;

    db.prepare(`
      UPDATE ai_usage_config
      SET is_manually_paused = ?,
          pause_reason = CASE WHEN ? = 1 THEN 'MANUAL' WHEN is_auto_paused = 1 THEN 'LIMIT_REACHED' ELSE NULL END,
          paused_at = CASE WHEN ? = 1 THEN ? ELSE paused_at END,
          updated_at = ?
      WHERE id = 'default'
    `).run(isPaused ? 1 : 0, isPaused ? 1 : 0, isPaused ? 1 : 0, pausedAt, now);

    return this.getConfig();
  }

  /**
   * System-controlled automatic pause on limit breach
   */
  static setAutoPause(isPaused, reason = 'LIMIT_REACHED') {
    const db = getDb();
    const now = Date.now();

    db.prepare(`
      UPDATE ai_usage_config
      SET is_auto_paused = ?,
          pause_reason = CASE WHEN ? = 1 THEN ? WHEN is_manually_paused = 1 THEN 'MANUAL' ELSE NULL END,
          paused_at = CASE WHEN ? = 1 THEN ? ELSE paused_at END,
          updated_at = ?
      WHERE id = 'default'
    `).run(isPaused ? 1 : 0, isPaused ? 1 : 0, reason, isPaused ? 1 : 0, now, now);

    return this.getConfig();
  }

  /**
   * Records authoritative/estimated token usage into the persistent ledger
   */
  static recordUsage(entry) {
    const db = getDb();
    const id = entry.id || `usage-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = entry.timestamp || Date.now();

    db.prepare(`
      INSERT INTO ai_usage_ledger (
        id, timestamp, agent_id, model, operation,
        prompt_tokens, completion_tokens, total_tokens,
        estimated_cost_usd, is_authoritative,
        period_start, period_end, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, timestamp, entry.agentId, entry.model, entry.operation,
      entry.promptTokens || 0, entry.completionTokens || 0, entry.totalTokens || 0,
      entry.estimatedCostUsd || 0.0, entry.isAuthoritative !== undefined ? (entry.isAuthoritative ? 1 : 0) : 1,
      entry.periodStart, entry.periodEnd,
      JSON.stringify(entry.metadata || {})
    );

    // Also update agent's tokens_spent counter
    db.prepare(`
      UPDATE agents
      SET tokens_spent = tokens_spent + ?,
          last_activity = 'Just now',
          updated_at = ?
      WHERE id = ?
    `).run(entry.totalTokens || 0, timestamp, entry.agentId);

    return {
      ...entry,
      id,
      timestamp
    };
  }

  /**
   * Computes aggregate token and cost usage for a given period
   */
  static getPeriodUsage(periodStart, periodEnd) {
    const db = getDb();
    const row = db.prepare(`
      SELECT 
        COUNT(*) as total_requests,
        COALESCE(SUM(prompt_tokens), 0) as prompt_tokens,
        COALESCE(SUM(completion_tokens), 0) as completion_tokens,
        COALESCE(SUM(total_tokens), 0) as total_tokens,
        COALESCE(SUM(estimated_cost_usd), 0.0) as estimated_cost_usd
      FROM ai_usage_ledger
      WHERE timestamp >= ? AND timestamp < ?
    `).get(periodStart, periodEnd);

    return {
      totalRequests: row.total_requests || 0,
      promptTokens: row.prompt_tokens || 0,
      completionTokens: row.completion_tokens || 0,
      totalTokens: row.total_tokens || 0,
      estimatedCostUsd: Number((row.estimated_cost_usd || 0.0).toFixed(6))
    };
  }

  /**
   * Retrieves recent audit ledger items
   */
  static getRecentLedger(limit = 50) {
    const db = getDb();
    const rows = db.prepare(`
      SELECT * FROM ai_usage_ledger
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(limit);

    return rows.map(r => ({
      id: r.id,
      timestamp: r.timestamp,
      agentId: r.agent_id,
      model: r.model,
      operation: r.operation,
      promptTokens: r.prompt_tokens,
      completionTokens: r.completion_tokens,
      totalTokens: r.total_tokens,
      estimatedCostUsd: r.estimated_cost_usd,
      isAuthoritative: Boolean(r.is_authoritative),
      metadata: JSON.parse(r.metadata_json || '{}')
    }));
  }

  /**
   * Calculates start and end timestamps based on period type
   */
  static calculatePeriodBounds(periodType, refDate = new Date()) {
    const start = new Date(refDate);

    if (periodType === 'DAILY') {
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return { start: start.getTime(), end: end.getTime() };
    }

    if (periodType === 'WEEKLY') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return { start: start.getTime(), end: end.getTime() };
    }

    // Default: MONTHLY
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    return { start: start.getTime(), end: end.getTime() };
  }

  /**
   * Resets usage period when expired.
   * Clears automatic limit pause, but PRESERVES manual user pause.
   */
  static resetPeriod(newStart, newEnd) {
    const db = getDb();
    const now = Date.now();

    db.prepare(`
      UPDATE ai_usage_config
      SET period_start = ?,
          period_end = ?,
          is_auto_paused = 0,
          pause_reason = CASE WHEN is_manually_paused = 1 THEN 'MANUAL' ELSE NULL END,
          updated_at = ?
      WHERE id = 'default'
    `).run(newStart, newEnd, now);

    return this.getConfig();
  }
}
