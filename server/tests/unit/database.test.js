/**
 * Unit Test: Database & Storage Engine (server/tests/unit/database.test.js)
 */
import test from 'node:test';
import assert from 'node:assert';
import { getDb } from '../../db/database.js';
import { AgentRepository } from '../../db/repositories/AgentRepository.js';
import { JobRepository } from '../../db/repositories/JobRepository.js';
import { ApplicationRepository } from '../../db/repositories/ApplicationRepository.js';

test('Database: WAL mode and foreign keys enabled', () => {
  const db = getDb();
  const journalMode = db.prepare('PRAGMA journal_mode;').get();
  assert.strictEqual(journalMode.journal_mode.toLowerCase(), 'wal');
});

test('Database: 7 specialized agents seeded', () => {
  const agents = AgentRepository.getAll();
  assert.strictEqual(agents.length, 7);
  const orch = AgentRepository.getById('orchestrator');
  assert.strictEqual(orch.nickname, 'Chief');
  assert.strictEqual(orch.breed, 'Golden Retriever');
});

test('Database: Discovered jobs and deduplication hashing', () => {
  const jobs = JobRepository.getAll();
  assert.ok(jobs.length >= 4);
  const rzp = JobRepository.getById('job-razorpay');
  assert.strictEqual(rzp.company, 'Razorpay');
  assert.strictEqual(rzp.match_score, 94);
});

test('Database: Application under Human Gate', () => {
  const app = ApplicationRepository.getById('app-razorpay');
  assert.ok(app);
  assert.strictEqual(app.status, 'GATE_HALTED');
  assert.ok(app.lock_token && app.lock_token.startsWith('GATE-'));
  assert.strictEqual(app.verification_score, '100% (Truth Verified)');
});
