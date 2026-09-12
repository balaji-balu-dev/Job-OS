/**
 * Unit Test: User AI Credential Encryption & Priority Resolution (server/tests/unit/api-key-priority.test.js)
 */
import test from 'node:test';
import assert from 'node:assert';
import { AICredentialRepository } from '../../db/repositories/AICredentialRepository.js';
import { getActiveAIProviderInfo, resolveAIProvider } from '../../core/ai-provider.js';
import { getDb } from '../../db/database.js';

test('AI Credential: Encrypts key with AES-256-GCM and never stores plaintext', () => {
  const testPlainKey = 'AIzaSyD-SecretIntegrationKeyForTesting998877';
  const saved = AICredentialRepository.saveCredential({
    provider: 'gemini',
    apiKey: testPlainKey
  });

  assert.ok(saved);
  assert.strictEqual(saved.hasUserKey, true);
  assert.strictEqual(saved.maskedKey.startsWith('AIza'), true);
  assert.strictEqual(saved.maskedKey.endsWith('8877'), true);
  assert.ok(!saved.maskedKey.includes('SecretIntegrationKey'));

  // Inspect raw SQLite row to guarantee plaintext is not stored
  const db = getDb();
  const rawRow = db.prepare('SELECT * FROM user_ai_credentials WHERE is_active = 1').get();
  assert.ok(rawRow);
  assert.notStrictEqual(rawRow.encrypted_key, testPlainKey);
  assert.ok(!rawRow.encrypted_key.includes(testPlainKey));
  assert.ok(rawRow.iv);
  assert.ok(rawRow.tag);

  // Decryption for authorized worker execution succeeds
  const activeCred = AICredentialRepository.getActiveCredential();
  assert.strictEqual(activeCred.apiKey, testPlainKey);
});

test('AI Credential: Priority resolution prioritizes user key over system defaults', () => {
  const info = getActiveAIProviderInfo();
  assert.strictEqual(info.credentialSource, 'USER_KEY');
  assert.strictEqual(info.isDirectBilling, true);

  const provider = resolveAIProvider();
  assert.strictEqual(provider.credentialSource, 'USER_KEY');

  // Deleting user key falls back safely
  AICredentialRepository.deleteCredential();
  const afterDeleteInfo = getActiveAIProviderInfo();
  assert.notStrictEqual(afterDeleteInfo.credentialSource, 'USER_KEY');
  assert.strictEqual(afterDeleteInfo.isDirectBilling, false);
});
