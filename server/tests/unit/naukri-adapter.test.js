import test from 'node:test';
import assert from 'node:assert';
import { NaukriAdapter, NaukriExtensionAdapter } from '../../adapters/sources/NaukriAdapter.js';
import { portalRegistry } from '../../adapters/PortalRegistry.js';

test('NaukriAdapter: Searches and normalizes tech jobs from Naukri Enterprise', async () => {
  const adapter = new NaukriAdapter();
  assert.strictEqual(adapter.id, 'naukri');
  assert.strictEqual(adapter.sourceType, 'naukri');

  const jobs = await adapter.search({ keyword: 'Distributed Systems', location: 'India' });
  assert.ok(Array.isArray(jobs));
  assert.ok(jobs.length >= 2, 'Should discover at least 2 listings from Naukri');

  const credJob = jobs.find(j => j.company === 'CRED');
  assert.ok(credJob, 'Should include CRED fintech role');
  assert.strictEqual(credJob.source_type, 'naukri');
  assert.strictEqual(credJob.source, 'Naukri Enterprise');
  assert.ok(credJob.dedup_hash, 'Should compute composite dedup hash');
  assert.ok(credJob.skills.includes('Go'));
  assert.ok(credJob.application_method.includes('Naukri'));
});

test('NaukriExtensionAdapter: Provides backwards-compatible extension alias', () => {
  const extAdapter = new NaukriExtensionAdapter();
  assert.strictEqual(extAdapter.id, 'naukri_extension');
  assert.strictEqual(extAdapter.sourceType, 'naukri');
});

test('PortalRegistry: Includes registered NaukriAdapter and harvests cleanly', async () => {
  const adapter = portalRegistry.getAdapter('naukri');
  assert.ok(adapter, 'PortalRegistry must have naukri registered');

  const result = await adapter.search();
  assert.ok(result.length > 0);
  assert.ok(result[0].title);
  assert.ok(result[0].company);
});
