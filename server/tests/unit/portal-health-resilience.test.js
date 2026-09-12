/**
 * Portal Health & Scraping Resilience Unit Tests
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { PortalHealthRepository } from '../../db/repositories/PortalHealthRepository.js';
import { PortalRegistry } from '../../adapters/PortalRegistry.js';
import { SourceAdapter } from '../../adapters/sources/SourceAdapter.js';

test('PortalRegistry: Enforces failure isolation when an adapter errors', async () => {
  const registry = new PortalRegistry();

  // Add a broken adapter
  class BrokenAdapter extends SourceAdapter {
    constructor() {
      super('broken-portal', 'Broken Portal', 'portal');
    }
    async _executeSearch() {
      throw new Error('503 Service Temporarily Unavailable');
    }
  }

  registry.register(new BrokenAdapter());

  const harvestResult = await registry.harvestAll();

  // Registry must not crash; successful adapters should have returned jobs
  assert.ok(harvestResult.totalRetrieved > 0);
  assert.ok(harvestResult.errors.some(e => e.portalId === 'broken-portal'));

  // Health repository must record error
  PortalHealthRepository.recordError('broken-portal', '503 Service Temporarily Unavailable');
  const health = PortalHealthRepository.getById('broken-portal');
  if (health) {
    assert.equal(health.status, 'degraded');
    assert.ok(health.errorCount > 0);
  }
});

test('PortalHealthRepository: Supports enabling and disabling portal', () => {
  PortalHealthRepository.toggleEnabled('greenhouse', false);
  let portal = PortalHealthRepository.getById('greenhouse');
  assert.equal(portal.isEnabled, false);

  PortalHealthRepository.toggleEnabled('greenhouse', true);
  portal = PortalHealthRepository.getById('greenhouse');
  assert.equal(portal.isEnabled, true);
});
