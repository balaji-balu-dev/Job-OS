/**
 * Unit Test: Crypto Vault & PII Redactor (server/tests/unit/crypto-vault.test.js)
 */
import test from 'node:test';
import assert from 'node:assert';
import { CryptoVault } from '../../vault/crypto-vault.js';

test('Crypto Vault: Encrypts and decrypts with AES-256-GCM', () => {
  const secret = 'Candidate_Secret_API_Key_12345';
  const sealed = CryptoVault.encrypt(secret);

  assert.ok(sealed.encrypted);
  assert.ok(sealed.iv);
  assert.ok(sealed.tag);
  assert.notStrictEqual(sealed.encrypted, secret);

  const decrypted = CryptoVault.decrypt(sealed);
  assert.strictEqual(decrypted, secret);
});

test('Crypto Vault: Redacts sensitive PII from telemetry', () => {
  const text = 'User balaji.dev@example.com with phone +91 98765 43210 unlocked token GATE-8821 with Bearer abc123def456';
  const sanitized = CryptoVault.sanitizeForLogs(text);

  assert.ok(!sanitized.includes('balaji.dev@example.com'));
  assert.ok(sanitized.includes('***@***.***'));
  assert.ok(!sanitized.includes('98765 43210'));
  assert.ok(sanitized.includes('GATE-****'));
  assert.ok(sanitized.includes('Bearer [REDACTED]'));
});
