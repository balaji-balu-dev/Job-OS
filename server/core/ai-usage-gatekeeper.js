/**
 * AI Usage Gatekeeper & Limit Protection Engine (server/core/ai-usage-gatekeeper.js)
 * Strict server-side fail-safe architecture preventing unexpected AI spending
 */
import { AIUsageRepository } from '../db/repositories/AIUsageRepository.js';
import { eventBus } from './event-bus.js';

export class AIUsageGatekeeper {
  /**
   * Pre-execution authorization check for every AI request.
   * Enforces manual pause, period expiration rollovers, and hard limits.
   */
  static async checkAllowance({ estimatedTokens = 500, agentId = 'system' } = {}) {
    let config = AIUsageRepository.getConfig();
    if (!config) {
      return { allowed: false, reason: 'CONFIG_ERROR', error: 'AI usage configuration not found' };
    }

    const now = Date.now();

    // 1. Period Rollover Check
    if (now >= config.periodEnd) {
      const newBounds = AIUsageRepository.calculatePeriodBounds(config.periodType, new Date());
      config = AIUsageRepository.resetPeriod(newBounds.start, newBounds.end);

      eventBus.emitEvent({
        type: 'AI_USAGE_PERIOD_RESET',
        agentId: 'orchestrator',
        entityType: 'SYSTEM',
        entityId: 'ai-usage',
        summary: `AI Usage period reset (${config.periodType}). New allowance period started.`,
        metadata: { periodStart: config.periodStart, periodEnd: config.periodEnd },
        logLevel: 'INFO'
      });
    }

    // 2. Check User-Controlled Manual Pause
    if (config.isManuallyPaused) {
      return {
        allowed: false,
        reason: 'MANUAL_PAUSE',
        error: 'AI Usage is temporarily paused by the user. Non-essential AI requests blocked.'
      };
    }

    // 3. Check System Auto-Pause (Limit Reached)
    if (config.isAutoPaused) {
      return {
        allowed: false,
        reason: 'LIMIT_REACHED',
        error: `AI usage limit of ${config.tokenLimit.toLocaleString()} tokens reached. AI requests paused.`
      };
    }

    // 4. Calculate Aggregate Period Usage
    const usage = AIUsageRepository.getPeriodUsage(config.periodStart, config.periodEnd);
    const hardLimitTokens = Math.floor(config.tokenLimit * (config.hardStopThresholdPct / 100));

    // 5. Hard Limit Enforcement
    if (usage.totalTokens + estimatedTokens > hardLimitTokens || (config.costLimitUsd && usage.estimatedCostUsd >= config.costLimitUsd)) {
      // Trip auto-pause immediately
      AIUsageRepository.setAutoPause(true, 'LIMIT_REACHED');

      eventBus.emitEvent({
        type: 'AI_USAGE_LIMIT_REACHED',
        agentId: 'orchestrator',
        entityType: 'SYSTEM',
        entityId: 'ai-usage',
        summary: `SAFETY LIMIT TRIPPED: Token usage reached ${usage.totalTokens.toLocaleString()} / ${config.tokenLimit.toLocaleString()}. All AI requests paused.`,
        metadata: {
          currentTokens: usage.totalTokens,
          limit: config.tokenLimit,
          estimatedCostUsd: usage.estimatedCostUsd
        },
        logLevel: 'GATE'
      });

      return {
        allowed: false,
        reason: 'LIMIT_REACHED',
        error: `SAFETY LIMIT: AI usage threshold reached (${usage.totalTokens.toLocaleString()} / ${config.tokenLimit.toLocaleString()} tokens). Automatic protection paused further calls.`
      };
    }

    // 6. Warning Threshold Check (e.g. 80%)
    const warningLimitTokens = Math.floor(config.tokenLimit * (config.warningThresholdPct / 100));
    if (usage.totalTokens >= warningLimitTokens) {
      eventBus.emitEvent({
        type: 'AI_USAGE_WARNING',
        agentId: 'orchestrator',
        entityType: 'SYSTEM',
        entityId: 'ai-usage',
        summary: `Warning: AI Token usage at ${Math.round((usage.totalTokens / config.tokenLimit) * 100)}% of limit (${usage.totalTokens.toLocaleString()} / ${config.tokenLimit.toLocaleString()}).`,
        metadata: {
          currentTokens: usage.totalTokens,
          limit: config.tokenLimit,
          pct: Math.round((usage.totalTokens / config.tokenLimit) * 100)
        },
        logLevel: 'WARN'
      });
    }

    return {
      allowed: true,
      config,
      currentUsage: usage
    };
  }

  /**
   * Records committed tokens after AI execution and broadcasts SSE telemetry
   */
  static recordUsageAndEmit({
    agentId,
    model,
    operation,
    promptTokens = 0,
    completionTokens = 0,
    totalTokens = 0,
    isAuthoritative = true,
    metadata = {}
  }) {
    const config = AIUsageRepository.getConfig();
    const periodStart = config?.periodStart || Date.now();
    const periodEnd = config?.periodEnd || (Date.now() + 86400000);

    // Compute estimated cost: Gemini 2.5 Flash pricing ($0.075 / 1M prompt, $0.30 / 1M completion)
    const estimatedCostUsd = Number(((promptTokens * 0.000000075) + (completionTokens * 0.00000030)).toFixed(6));

    const entry = AIUsageRepository.recordUsage({
      agentId,
      model,
      operation,
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCostUsd,
      isAuthoritative,
      periodStart,
      periodEnd,
      metadata
    });

    const aggregate = AIUsageRepository.getPeriodUsage(periodStart, periodEnd);

    // Broadcast updated telemetry over SSE
    eventBus.emitEvent({
      type: 'AI_USAGE_UPDATED',
      agentId,
      entityType: 'SYSTEM',
      entityId: entry.id,
      summary: `AI Usage Recorded: ${totalTokens.toLocaleString()} tokens by ${agentId} (${operation}). Total: ${aggregate.totalTokens.toLocaleString()} / ${config?.tokenLimit?.toLocaleString() || '100,000'}.`,
      metadata: {
        operation,
        lastRequestTokens: totalTokens,
        aggregateTokens: aggregate.totalTokens,
        promptTokens: aggregate.promptTokens,
        completionTokens: aggregate.completionTokens,
        estimatedCostUsd: aggregate.estimatedCostUsd,
        tokenLimit: config?.tokenLimit,
        usagePct: config?.tokenLimit ? Math.round((aggregate.totalTokens / config.tokenLimit) * 100) : 0
      },
      logLevel: 'INFO'
    });

    return entry;
  }

  /**
   * Returns current consolidated dashboard telemetry
   */
  static getDashboardMetrics() {
    let config = AIUsageRepository.getConfig();
    if (!config) return null;

    const now = Date.now();
    // Check period rollover
    if (now >= config.periodEnd) {
      const newBounds = AIUsageRepository.calculatePeriodBounds(config.periodType, new Date());
      config = AIUsageRepository.resetPeriod(newBounds.start, newBounds.end);
    }

    const usage = AIUsageRepository.getPeriodUsage(config.periodStart, config.periodEnd);
    const tokenLimit = config.tokenLimit || 100000;
    const remainingTokens = Math.max(0, tokenLimit - usage.totalTokens);
    const usagePct = Number(((usage.totalTokens / tokenLimit) * 100).toFixed(1));

    let status = 'ACTIVE';
    if (config.isManuallyPaused) {
      status = 'PAUSED_MANUAL';
    } else if (config.isAutoPaused || usage.totalTokens >= tokenLimit) {
      status = 'LIMIT_REACHED';
    } else if (usagePct >= config.warningThresholdPct) {
      status = 'WARNING';
    }

    // Time until reset
    const msRemaining = Math.max(0, config.periodEnd - now);
    const days = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const resetsInFormatted = `${days}d ${hours}h ${minutes}m`;

    return {
      status,
      isManuallyPaused: config.isManuallyPaused,
      isAutoPaused: config.isAutoPaused,
      pauseReason: config.pauseReason,
      pausedAt: config.pausedAt,
      tokensUsed: usage.totalTokens,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
      tokenLimit,
      remainingTokens,
      usagePercentage: usagePct,
      estimatedCostUsd: usage.estimatedCostUsd,
      costLimitUsd: config.costLimitUsd,
      warningThresholdPct: config.warningThresholdPct,
      hardStopThresholdPct: config.hardStopThresholdPct,
      periodType: config.periodType,
      periodStart: config.periodStart,
      periodEnd: config.periodEnd,
      resetsIn: resetsInFormatted,
      resetDateIso: new Date(config.periodEnd).toISOString()
    };
  }
}
