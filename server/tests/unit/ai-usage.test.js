/**
 * Unit Test: AI Token Usage & Limit Protection (server/tests/unit/ai-usage.test.js)
 */
import test from 'node:test';
import assert from 'node:assert';

import { AIUsageRepository } from '../../db/repositories/AIUsageRepository.js';
import { AIUsageGatekeeper } from '../../core/ai-usage-gatekeeper.js';
import { aiProvider } from '../../core/ai-provider.js';

test('AI Usage: Config is initialized with default limits', () => {
  const config = AIUsageRepository.getConfig();
  assert.ok(config);
  assert.strictEqual(config.tokenLimit, 100000);
  assert.strictEqual(config.warningThresholdPct, 80);
  assert.strictEqual(config.hardStopThresholdPct, 100);
  assert.strictEqual(config.periodType, 'MONTHLY');
  assert.strictEqual(config.isManuallyPaused, false);
});

test('AI Usage: Records usage in persistent ledger and updates aggregates', () => {
  const before = AIUsageGatekeeper.getDashboardMetrics();
  
  const entry = AIUsageGatekeeper.recordUsageAndEmit({
    agentId: 'job-intelligence',
    model: 'gemini-2.5-flash',
    operation: 'TEST_OP',
    promptTokens: 1500,
    completionTokens: 500,
    totalTokens: 2000,
    isAuthoritative: true
  });

  assert.ok(entry.id);
  assert.strictEqual(entry.totalTokens, 2000);
  assert.strictEqual(entry.isAuthoritative, true);

  const after = AIUsageGatekeeper.getDashboardMetrics();
  assert.strictEqual(after.tokensUsed, before.tokensUsed + 2000);
});

test('AI Usage: Manual pause blocks AI execution', async () => {
  // 1. Manually pause
  AIUsageRepository.setManualPause(true);
  const metrics = AIUsageGatekeeper.getDashboardMetrics();
  assert.strictEqual(metrics.status, 'PAUSED_MANUAL');
  assert.strictEqual(metrics.isManuallyPaused, true);

  // 2. Allowance check fails
  const check = await AIUsageGatekeeper.checkAllowance({ estimatedTokens: 100 });
  assert.strictEqual(check.allowed, false);
  assert.strictEqual(check.reason, 'MANUAL_PAUSE');

  // 3. Execution through aiProvider throws
  await assert.rejects(
    async () => {
      await aiProvider.generateText({ prompt: 'Hello world' });
    },
    /AI_USAGE_BLOCKED: AI Usage is temporarily paused by the user/
  );

  // 4. Manually resume
  AIUsageRepository.setManualPause(false);
  const resumed = AIUsageGatekeeper.getDashboardMetrics();
  assert.strictEqual(resumed.isManuallyPaused, false);
  assert.notStrictEqual(resumed.status, 'PAUSED_MANUAL');
});

test('AI Usage: Hard limit automatically pauses calls when reached', async () => {
  const config = AIUsageRepository.getConfig();
  const usage = AIUsageRepository.getPeriodUsage(config.periodStart, config.periodEnd);
  
  // Temporarily set token limit slightly below current usage to simulate limit breach
  AIUsageRepository.updateConfig({ tokenLimit: usage.totalTokens + 50 });

  // Next call exceeding limit trips auto-pause
  const check = await AIUsageGatekeeper.checkAllowance({ estimatedTokens: 100 });
  assert.strictEqual(check.allowed, false);
  assert.strictEqual(check.reason, 'LIMIT_REACHED');

  const afterBreach = AIUsageGatekeeper.getDashboardMetrics();
  assert.strictEqual(afterBreach.isAutoPaused, true);
  assert.strictEqual(afterBreach.status, 'LIMIT_REACHED');

  // Reset limit back to default 100,000 and clear auto-pause
  AIUsageRepository.updateConfig({ tokenLimit: 100000 });
  AIUsageRepository.setAutoPause(false);
});

test('AI Usage: Period rollover clears auto-pause but PRESERVES manual pause', () => {
  // Case A: Auto-paused due to limit
  AIUsageRepository.setAutoPause(true);
  AIUsageRepository.setManualPause(false);

  // Period expires
  const newBounds = AIUsageRepository.calculatePeriodBounds('MONTHLY', new Date());
  const rolled = AIUsageRepository.resetPeriod(newBounds.start, newBounds.end);
  assert.strictEqual(rolled.isAutoPaused, false);
  assert.strictEqual(rolled.pauseReason, null);

  // Case B: Manually paused by user
  AIUsageRepository.setManualPause(true);
  const rolledManual = AIUsageRepository.resetPeriod(newBounds.start, newBounds.end);
  assert.strictEqual(rolledManual.isManuallyPaused, true);
  assert.strictEqual(rolledManual.pauseReason, 'MANUAL');

  // Cleanup: resume
  AIUsageRepository.setManualPause(false);
});

test('AI Usage: Configuration validation and updates', () => {
  const updated = AIUsageRepository.updateConfig({
    tokenLimit: 250000,
    warningThresholdPct: 85,
    costLimitUsd: 10.00
  });

  assert.strictEqual(updated.tokenLimit, 250000);
  assert.strictEqual(updated.warningThresholdPct, 85);
  assert.strictEqual(updated.costLimitUsd, 10.00);

  // Reset back to 100,000 for standard suite
  AIUsageRepository.updateConfig({
    tokenLimit: 100000,
    warningThresholdPct: 80,
    costLimitUsd: 5.00
  });
});
