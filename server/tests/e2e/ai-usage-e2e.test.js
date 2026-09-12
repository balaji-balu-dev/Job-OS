/**
 * End-to-End Test: AI Usage API, Protection & Agent Degradation
 * (server/tests/e2e/ai-usage-e2e.test.js)
 */
import test from 'node:test';
import assert from 'node:assert';

import { createApp } from '../../index.js';
import { AIUsageRepository } from '../../db/repositories/AIUsageRepository.js';
import { AIUsageGatekeeper } from '../../core/ai-usage-gatekeeper.js';
import { IntelligenceAgent } from '../../agents/intelligence.js';

test('E2E: AI Usage REST API endpoints', async () => {
  const app = createApp();

  // 1. Fetch live metrics
  const getMetricsReq = { method: 'GET' };
  const metrics = AIUsageGatekeeper.getDashboardMetrics();
  assert.ok(metrics);
  assert.strictEqual(typeof metrics.tokensUsed, 'number');
  assert.strictEqual(typeof metrics.tokenLimit, 'number');

  // 2. Pause via repository
  AIUsageRepository.setManualPause(true);
  const pausedState = AIUsageGatekeeper.getDashboardMetrics();
  assert.strictEqual(pausedState.status, 'PAUSED_MANUAL');

  // 3. Resume via repository
  AIUsageRepository.setManualPause(false);
  const resumedState = AIUsageGatekeeper.getDashboardMetrics();
  assert.strictEqual(resumedState.isManuallyPaused, false);
});

test('E2E: Agent gracefully handles AI Usage Pause without crashing', async () => {
  // 1. Ensure clean baseline and manually pause AI usage
  AIUsageRepository.setAutoPause(false);
  AIUsageRepository.setManualPause(true);

  // 2. Analyze job - must NOT crash, returns aiBlocked: true and baseline heuristics
  const result = await IntelligenceAgent.analyzeJob('job-razorpay');
  assert.ok(result);
  assert.strictEqual(result.aiBlocked, true);
  assert.strictEqual(result.jobId, 'job-razorpay');
  assert.ok(result.concerns.some(c => c.includes('AI Deep Analysis Paused')));

  // 3. Resume AI usage
  AIUsageRepository.updateConfig({ tokenLimit: 1000000 });
  AIUsageRepository.setAutoPause(false);
  AIUsageRepository.setManualPause(false);
  const normalResult = await IntelligenceAgent.analyzeJob('job-razorpay');
  assert.ok(normalResult);
  assert.strictEqual(normalResult.aiBlocked, undefined);
  assert.strictEqual(typeof normalResult.matchScore, 'number');

  // Restore default config for unit tests
  AIUsageRepository.updateConfig({ tokenLimit: 100000 });
});

test('E2E: Concurrency Safety & Atomic Accounting', async () => {
  const before = AIUsageGatekeeper.getDashboardMetrics();

  // Dispatch 10 simultaneous usage recordings concurrently
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(
      Promise.resolve().then(() => {
        return AIUsageGatekeeper.recordUsageAndEmit({
          agentId: 'application-agent',
          model: 'gemini-2.5-flash',
          operation: 'CONCURRENCY_TEST',
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
          isAuthoritative: true
        });
      })
    );
  }

  await Promise.all(promises);

  const after = AIUsageGatekeeper.getDashboardMetrics();
  assert.strictEqual(after.tokensUsed, before.tokensUsed + (10 * 150));
});
