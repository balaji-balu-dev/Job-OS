/**
 * Unit Test: Verification Audit & Zero-Hallucination Truth Model
 * (server/tests/unit/verification-audit.test.js)
 */
import test from 'node:test';
import assert from 'node:assert';
import { CandidateVault } from '../../vault/candidate-vault.js';
import { VerificationAgent } from '../../agents/verification.js';
import { ApplicationRepository } from '../../db/repositories/ApplicationRepository.js';

test('Truth Model: Verified skill passes audit', () => {
  const checkJava = CandidateVault.evaluateFact('I have built microservices in Java', 'java');
  assert.strictEqual(checkJava.status, 'PASS');
  assert.strictEqual(checkJava.provenance, 'USER_VERIFIED');

  const checkKafka = CandidateVault.evaluateFact('Event streaming with Kafka', 'kafka');
  assert.strictEqual(checkKafka.status, 'PASS');
});

test('Truth Model: Unverified skill is BLOCKED (Zero Guessing)', () => {
  const checkScala = CandidateVault.evaluateFact('Built complex data systems in Scala for 5 years', 'scala');
  assert.strictEqual(checkScala.status, 'BLOCK');
  assert.strictEqual(checkScala.provenance, 'UNKNOWN');
  assert.ok(checkScala.reason.includes('Zero-guessing rule enforced'));
});

test('Verification Agent: Full audit on Razorpay passes and seals gate', async () => {
  const result = await VerificationAgent.auditApplication('app-razorpay');
  assert.strictEqual(result.passed, true);
  assert.ok(result.lockEnvelope.payloadHash.startsWith('0x'));
  assert.ok(result.lockEnvelope.lockToken.startsWith('GATE-'));

  const app = ApplicationRepository.getById('app-razorpay');
  assert.strictEqual(app.status, 'GATE_HALTED');
});
