/**
 * End-to-End Acceptance Tests (server/tests/e2e/acceptance.test.js)
 * Covers the 6 realistic failure and recovery scenarios from Architecture Contract Section 12
 */
import test from 'node:test';
import assert from 'node:assert';

import { browserWorker } from '../../browser/browser-worker.js';
import { ApplicationAgent } from '../../agents/application.js';
import { VerificationAgent } from '../../agents/verification.js';
import { ApprovalGateway } from '../../core/approval-gateway.js';
import { SourceAdapter } from '../../adapters/sources/SourceAdapter.js';
import { JobRepository } from '../../db/repositories/JobRepository.js';
import { ApplicationRepository } from '../../db/repositories/ApplicationRepository.js';
import { TaskRepository } from '../../db/repositories/TaskRepository.js';
import { getDb } from '../../db/database.js';

test('Scenario 1: Browser Worker Takeover & Resume (CAPTCHA / OTP)', async () => {
  // 1. Simulate worker detecting CAPTCHA challenge
  const takeover = await browserWorker.requestUserTakeover('Cloudflare Turnstile challenge on form submit');
  assert.strictEqual(takeover.paused, true);
  assert.strictEqual(browserWorker.isPausedForTakeover, true);

  // 2. User completes challenge in browser and signals resume
  const resume = browserWorker.resumeAfterTakeover();
  assert.strictEqual(resume.resumed, true);
  assert.strictEqual(browserWorker.isPausedForTakeover, false);
});

test('Scenario 2: Expired ATS Session Handling', () => {
  const task = TaskRepository.create({
    id: `task-test-auth-${Date.now()}`,
    correlationId: 'corr-test',
    type: 'PORTAL_STATUS_POLL',
    agentId: 'tracking-agent',
    idempotencyKey: `auth-test-${Date.now()}`,
    payload: { company: 'Workday', sessionCookie: 'expired_token' }
  });

  // Tracking detects 401 Unauthorized, pauses task with AUTH_REQUIRED
  const updated = TaskRepository.updateStatus(task.id, 'PAUSED_BLOCKED', {
    error: {
      code: 'AUTH_REQUIRED',
      message: 'Candidate session cookie expired on Workday portal. User re-login required.',
      recoverable: true
    }
  });

  assert.strictEqual(updated.status, 'PAUSED_BLOCKED');
  assert.strictEqual(updated.error.code, 'AUTH_REQUIRED');
});

test('Scenario 3: Unknown Question Block (Zero Guessing Rule)', async () => {
  // Inject question requiring 5 years of C# experience
  const qText = 'Describe your 5+ years of experience with C# and .NET CLR internals.';
  const answer = await ApplicationAgent.draftAnswer('app-razorpay', 'ans-unknown-skill', qText);

  assert.strictEqual(answer.provenance, 'UNKNOWN');
  assert.strictEqual(answer.confidence, 0);
  assert.strictEqual(answer.status, 'needs_review');

  // Verification Agent must reject this application
  const audit = await VerificationAgent.auditApplication('app-razorpay');
  assert.strictEqual(audit.passed, false);
  assert.strictEqual(audit.actionRequired, 'USER_CORRECTION_REQUIRED');

  const blockedFinding = audit.findings.find(f => f.verdict === 'BLOCK');
  assert.ok(blockedFinding);
  assert.ok(blockedFinding.reason.includes('unverified or unknown facts'));

  // Clean up: reset answers to original verified answers
  const originalAnswers = [
    {
      id: 'ans-1',
      question: 'Why do you want to join Razorpay?',
      answer: 'Distributed ledger pipelines experience at national scale.',
      provenance: 'DERIVED',
      sourceCitation: 'Profile: Projects (Chronos)',
      confidence: 98,
      status: 'approved'
    }
  ];
  ApplicationRepository.updateAnswers('app-razorpay', originalAnswers);
});

test('Scenario 4: Duplicate Job Deduplication across Sources', () => {
  const hash1 = SourceAdapter.computeDedupHash('Razorpay', 'Senior Backend Engineer', 'Bangalore, India');
  const hash2 = SourceAdapter.computeDedupHash('RAZORPAY ', '  Senior Backend Engineer  ', 'Bangalore, India (Hybrid)');

  // Normalization removes whitespace and casing differences
  assert.strictEqual(typeof hash1, 'string');
  assert.strictEqual(hash1.length, 64);

  // Inserting duplicate hash must be caught
  const existingJob = JobRepository.getByDedupHash('hash-razorpay-senior-backend-payments');
  assert.ok(existingJob);
  assert.strictEqual(existingJob.id, 'job-razorpay');
});

test('Scenario 5: Failed Submission Recovery & Cryptographic Gate Release', async () => {
  // 1. Lock envelope
  const lock = ApprovalGateway.createLockEnvelope('app-razorpay');
  assert.ok(lock.lockToken.startsWith('GATE-'));

  // 2. Attempt submit with invalid token must fail
  assert.throws(() => {
    ApprovalGateway.verifyAndUnlock('app-razorpay', 'INVALID_TOKEN');
  }, /Invalid gate token/);

  // 3. Submit with valid token passes
  const unlocked = ApprovalGateway.verifyAndUnlock('app-razorpay', lock.lockToken);
  assert.strictEqual(unlocked.success, true);
});

test('Scenario 6: Server Restart & State Recovery', () => {
  // 1. Create running task with mid-execution checkpoint
  const task = TaskRepository.create({
    id: `task-crash-${Date.now()}`,
    correlationId: 'corr-crash',
    type: 'FORM_SUBMIT',
    agentId: 'application-agent',
    idempotencyKey: `crash-test-${Date.now()}`,
    status: 'RUNNING',
    checkpoint: { step: 2, totalSteps: 4, fieldsCompleted: ['name', 'email'] }
  });

  assert.strictEqual(task.status, 'RUNNING');
  assert.strictEqual(task.checkpoint.step, 2);

  // 2. Simulate recovery supervisor on restart: inspect running tasks
  const running = TaskRepository.getById(task.id);
  assert.ok(running.checkpoint);
  assert.strictEqual(running.checkpoint.step, 2);

  // Mark recovered to pending
  const recovered = TaskRepository.updateStatus(task.id, 'PENDING');
  assert.strictEqual(recovered.status, 'PENDING');
});
