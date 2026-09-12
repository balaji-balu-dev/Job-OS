/**
 * Unit Test: Candidate Profile Vault Persistence & Validation (server/tests/unit/profile-update.test.js)
 */
import test from 'node:test';
import assert from 'node:assert';
import { CandidateVault } from '../../vault/candidate-vault.js';
import { ProfileRepository } from '../../db/repositories/ProfileRepository.js';

test('Profile Vault: Updates individual section and persists to SQLite', () => {
  const updated = CandidateVault.updateSection('contact', {
    email: 'test.balaji@example.com',
    phone: '+91 99999 88888',
    linkedin: 'https://linkedin.com/in/test-balaji',
    github: 'https://github.com/test-balaji'
  });

  assert.ok(updated);
  assert.strictEqual(updated.data.email, 'test.balaji@example.com');
  assert.strictEqual(updated.provenance, 'USER_VERIFIED');

  // Verify direct read from repository
  const fetched = ProfileRepository.getSection('contact');
  assert.strictEqual(fetched.data.email, 'test.balaji@example.com');
});

test('Profile Vault: Bulk update commits multiple sections atomically', () => {
  const payload = {
    identity: {
      fullName: 'Balaji S. Test',
      preferredName: 'Balaji',
      pronouns: 'He/Him',
      citizenship: 'Citizen of India'
    },
    location: {
      currentCity: 'Bangalore, India',
      workModelPreference: 'Remote',
      openToRelocation: 'Yes'
    },
    salary: {
      currentCTC: '₹40,00,000',
      expectedCTC: '₹55,00,000',
      minimumAcceptable: '₹45,00,000'
    }
  };

  const allUpdated = CandidateVault.updateBulk(payload, 'USER_VERIFIED');
  assert.ok(allUpdated);
  assert.strictEqual(allUpdated.identity.data.fullName, 'Balaji S. Test');
  assert.strictEqual(allUpdated.location.data.currentCity, 'Bangalore, India');
  assert.strictEqual(allUpdated.salary.data.expectedCTC, '₹55,00,000');
});

test('Profile Vault: Key normalization maps camelCase and snake_case interchangeably', () => {
  const all = ProfileRepository.getAll();
  assert.ok(all.work_authorization);
  assert.ok(all.workAuthorization);
  assert.deepStrictEqual(all.work_authorization.data, all.workAuthorization.data);

  assert.ok(all.notice_period);
  assert.ok(all.noticePeriod);
  assert.deepStrictEqual(all.notice_period.data, all.noticePeriod.data);
});
