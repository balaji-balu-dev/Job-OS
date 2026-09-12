/**
 * AI Usage & Limit Protection REST Routes (server/routes/ai-usage.js)
 * Live telemetry, emergency pause/resume controls, and safety limit configuration
 */
import express from 'express';
import { z } from 'zod';
import { AIUsageRepository } from '../db/repositories/AIUsageRepository.js';
import { AIUsageGatekeeper } from '../core/ai-usage-gatekeeper.js';
import { eventBus } from '../core/event-bus.js';
import { getActiveAIProviderInfo } from '../core/ai-provider.js';

export const aiUsageRoutes = express.Router();

// Validation Schemas
const updateConfigSchema = z.object({
  tokenLimit: z.number().int().min(1000).max(100000000).optional(),
  costLimitUsd: z.number().min(0.1).max(10000).optional(),
  warningThresholdPct: z.number().min(10).max(99).optional(),
  hardStopThresholdPct: z.number().min(50).max(100).optional(),
  periodType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional()
});

/**
 * GET /api/ai-usage
 * Returns consolidated live metrics, safety status, and recent execution ledger
 */
aiUsageRoutes.get('/', (req, res) => {
  try {
    const metrics = AIUsageGatekeeper.getDashboardMetrics();
    const recentLedger = AIUsageRepository.getRecentLedger(50);
    const providerInfo = getActiveAIProviderInfo();

    res.json({
      success: true,
      data: {
        ...metrics,
        providerInfo,
        ledger: recentLedger
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, code: 'FETCH_USAGE_FAILED' });
  }
});

/**
 * POST /api/ai-usage/pause
 * Manual Emergency Pause for AI requests
 */
aiUsageRoutes.post('/pause', (req, res) => {
  try {
    const updated = AIUsageRepository.setManualPause(true);

    eventBus.emitEvent({
      type: 'AI_USAGE_PAUSED',
      agentId: 'orchestrator',
      entityType: 'SYSTEM',
      entityId: 'ai-usage',
      summary: 'Emergency Stop: AI usage manually paused by user. All non-essential AI requests blocked.',
      metadata: { pausedAt: updated.pausedAt, reason: 'MANUAL' },
      logLevel: 'GATE'
    });

    const metrics = AIUsageGatekeeper.getDashboardMetrics();
    res.json({ success: true, data: metrics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, code: 'PAUSE_FAILED' });
  }
});

/**
 * POST /api/ai-usage/resume
 * Manually resume AI requests (validates allowance before unpausing)
 */
aiUsageRoutes.post('/resume', (req, res) => {
  try {
    const config = AIUsageRepository.getConfig();
    const usage = AIUsageRepository.getPeriodUsage(config.periodStart, config.periodEnd);

    // Check if usage is currently at or above the hard stop threshold
    if (usage.totalTokens >= config.tokenLimit) {
      return res.status(400).json({
        success: false,
        error: `Cannot resume: Token usage (${usage.totalTokens.toLocaleString()}) has already reached the limit (${config.tokenLimit.toLocaleString()}). Increase limit or wait for period reset.`,
        code: 'LIMIT_ALREADY_EXCEEDED'
      });
    }

    const updated = AIUsageRepository.setManualPause(false);

    eventBus.emitEvent({
      type: 'AI_USAGE_RESUMED',
      agentId: 'orchestrator',
      entityType: 'SYSTEM',
      entityId: 'ai-usage',
      summary: 'AI usage resumed by user. Agent AI capabilities re-enabled.',
      metadata: { resumedAt: Date.now() },
      logLevel: 'INFO'
    });

    const metrics = AIUsageGatekeeper.getDashboardMetrics();
    res.json({ success: true, data: metrics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, code: 'RESUME_FAILED' });
  }
});

/**
 * POST /api/ai-usage/config
 * Updates safety limits and warning thresholds
 */
aiUsageRoutes.post('/config', (req, res) => {
  try {
    const parsed = updateConfigSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid configuration parameters',
        validationErrors: parsed.error.format(),
        code: 'VALIDATION_ERROR'
      });
    }

    const updated = AIUsageRepository.updateConfig(parsed.data);

    eventBus.emitEvent({
      type: 'AI_USAGE_CONFIG_UPDATED',
      agentId: 'orchestrator',
      entityType: 'SYSTEM',
      entityId: 'ai-usage',
      summary: `AI safety limits updated: ${updated.tokenLimit.toLocaleString()} tokens limit (${updated.periodType}).`,
      metadata: parsed.data,
      logLevel: 'INFO'
    });

    const metrics = AIUsageGatekeeper.getDashboardMetrics();
    res.json({ success: true, data: metrics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, code: 'UPDATE_CONFIG_FAILED' });
  }
});

/**
 * POST /api/ai-usage/reset-period
 * Manually rolls over or recalculates current period
 */
aiUsageRoutes.post('/reset-period', (req, res) => {
  try {
    const config = AIUsageRepository.getConfig();
    const bounds = AIUsageRepository.calculatePeriodBounds(config.periodType, new Date());
    AIUsageRepository.resetPeriod(bounds.start, bounds.end);

    const metrics = AIUsageGatekeeper.getDashboardMetrics();
    res.json({ success: true, data: metrics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, code: 'RESET_PERIOD_FAILED' });
  }
});
