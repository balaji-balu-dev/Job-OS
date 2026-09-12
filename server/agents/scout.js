/**
 * Scout Puppy Agent ("Tracker") (server/agents/scout.js)
 * Autonomous job discovery, feed crawling, and SHA-256 deduplication
 */
import { JobRepository } from '../db/repositories/JobRepository.js';
import { AgentRepository } from '../db/repositories/AgentRepository.js';
import { GreenhouseAdapter } from '../adapters/sources/GreenhouseAdapter.js';
import { eventBus } from '../core/event-bus.js';

export class ScoutAgent {
  static getAgentId() {
    return 'scout';
  }

  static async runHarvest(missionParams = {}) {
    AgentRepository.updateState('scout', 'searching', 'Harvesting career feeds and ATS boards for active missions...');

    const adapter = new GreenhouseAdapter();
    const rawListings = await adapter.fetchListings(missionParams);
    const discovered = [];
    let duplicatesSkipped = 0;

    for (const raw of rawListings) {
      const normalized = adapter.normalize(raw);
      const existing = JobRepository.getByDedupHash(normalized.dedup_hash);

      if (existing) {
        duplicatesSkipped++;
        continue;
      }

      const inserted = JobRepository.insert(normalized);
      discovered.push(inserted);

      eventBus.emitEvent({
        type: 'JOB_DISCOVERED',
        agentId: 'scout',
        entityType: 'JOB',
        entityId: inserted.id,
        summary: `Scout discovered new posting: "${inserted.title}" @ ${inserted.company}.`,
        metadata: { jobId: inserted.id, matchScore: inserted.match_score },
        logLevel: 'INFO'
      });
    }

    AgentRepository.updateState('scout', 'working', `Harvest complete: ${discovered.length} new jobs ingested, ${duplicatesSkipped} duplicates filtered.`);

    return {
      discoveredCount: discovered.length,
      duplicatesSkipped,
      jobs: discovered
    };
  }
}
