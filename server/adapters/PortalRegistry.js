/**
 * PortalRegistry (server/adapters/PortalRegistry.js)
 * Extensible job portal coordinator with failure isolation, health monitoring, and rate-limit tracking
 */
import { GreenhouseAdapter } from './sources/GreenhouseAdapter.js';
import { NaukriAdapter, NaukriExtensionAdapter } from './sources/NaukriAdapter.js';
import { LinkedInAdapter } from './sources/LinkedInAdapter.js';
import { IndeedAdapter } from './sources/IndeedAdapter.js';
import { WellfoundAdapter } from './sources/WellfoundAdapter.js';
import { RemoteOKAdapter } from './sources/RemoteOKAdapter.js';
import { PortalHealthRepository } from '../db/repositories/PortalHealthRepository.js';

export class PortalRegistry {
  constructor() {
    this.adapters = new Map();
    this.registerDefaults();
  }

  registerDefaults() {
    this.register(new GreenhouseAdapter());
    this.register(new NaukriAdapter());
    this.register(new NaukriExtensionAdapter());
    this.register(new LinkedInAdapter());
    this.register(new IndeedAdapter());
    this.register(new WellfoundAdapter());
    this.register(new RemoteOKAdapter());
  }

  register(adapter) {
    this.adapters.set(adapter.id, adapter);
  }

  getAdapter(id) {
    return this.adapters.get(id);
  }

  getAllAdapters() {
    return Array.from(this.adapters.values());
  }

  /**
   * Harvest jobs across all enabled portals with complete failure isolation
   */
  async harvestAll(query = {}) {
    const healthList = PortalHealthRepository.getAll();
    const enabledMap = new Map(healthList.map(h => [h.portalId, h.isEnabled]));

    const results = [];
    const errors = [];

    const tasks = Array.from(this.adapters.entries()).map(async ([portalId, adapter]) => {
      // Check if disabled by user
      if (enabledMap.has(portalId) && !enabledMap.get(portalId)) {
        return;
      }

      try {
        const jobs = await adapter.search(query);
        PortalHealthRepository.recordScrape(portalId, jobs.length);
        results.push(...jobs);
      } catch (err) {
        PortalHealthRepository.recordError(portalId, err.message);
        errors.push({ portalId, error: err.message });
      }
    });

    await Promise.allSettled(tasks);

    return {
      totalRetrieved: results.length,
      jobs: results,
      errors
    };
  }
}

export const portalRegistry = new PortalRegistry();
