/**
 * Portals & Job Sources REST Routes (server/routes/portals.js)
 * Health monitoring, error logs, rate-limit reset, and per-portal configuration
 */
import express from 'express';
import { PortalHealthRepository } from '../db/repositories/PortalHealthRepository.js';
import { portalRegistry } from '../adapters/PortalRegistry.js';
import { JobRepository } from '../db/repositories/JobRepository.js';
import { EventBus } from '../core/event-bus.js';

export const portalsRoutes = express.Router();

/**
 * GET /api/portals
 * Lists all portals with live health, last scrape, and error counts
 */
portalsRoutes.get('/', (req, res) => {
  try {
    const portals = PortalHealthRepository.getAll();
    res.json({ success: true, data: portals });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

portalsRoutes.get('/health', (req, res) => {
  try {
    const portals = PortalHealthRepository.getAll();
    res.json({ success: true, data: portals });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/portals/harvest
 * Triggers multi-source harvest with failure isolation across all enabled portals
 */
portalsRoutes.post('/harvest', async (req, res) => {
  try {
    const { query = {} } = req.body;
    const result = await portalRegistry.harvestAll(query);

    // Save discovered jobs with deduplication
    let insertedCount = 0;
    for (const job of result.jobs) {
      const existing = JobRepository.getByDedupHash(job.dedup_hash);
      if (!existing) {
        JobRepository.insert(job);
        insertedCount++;
      }
    }

    EventBus.publish({
      type: 'PORTALS_HARVEST_COMPLETED',
      agentId: 'scout',
      summary: `Scout harvested ${result.totalRetrieved} jobs across active portals (${insertedCount} new ingested).`,
      metadata: { totalRetrieved: result.totalRetrieved, newJobs: insertedCount, errors: result.errors }
    });

    res.json({
      success: true,
      data: {
        totalRetrieved: result.totalRetrieved,
        newIngested: insertedCount,
        errors: result.errors
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/portals/:id/toggle
 * Enables or disables an individual portal
 */
portalsRoutes.post('/:id/toggle', (req, res) => {
  try {
    const { isEnabled } = req.body;
    const updated = PortalHealthRepository.toggleEnabled(req.params.id, Boolean(isEnabled));
    if (!updated) return res.status(404).json({ success: false, error: 'Portal not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/portals/:id/config
 * Updates per-portal search parameters or rate limits
 */
portalsRoutes.post('/:id/config', (req, res) => {
  try {
    const { config } = req.body;
    const updated = PortalHealthRepository.updateConfig(req.params.id, config || {});
    if (!updated) return res.status(404).json({ success: false, error: 'Portal not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/portals/naukri/sync
 * Direct ingest endpoint for Naukri Extension and bulk job sync
 */
portalsRoutes.post('/naukri/sync', (req, res) => {
  try {
    const rawJobs = Array.isArray(req.body.jobs) ? req.body.jobs : (req.body.job ? [req.body.job] : []);
    if (rawJobs.length === 0) {
      return res.status(400).json({ success: false, error: 'No jobs provided in request body.' });
    }

    const adapter = portalRegistry.getAdapter('naukri') || portalRegistry.getAdapter('naukri_extension');
    let insertedCount = 0;
    const savedJobs = [];

    for (const raw of rawJobs) {
      const normalized = adapter ? adapter.normalize(raw) : {
        id: `job-naukri-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: raw.title,
        company: raw.company,
        location: raw.location || 'India',
        source: 'Naukri Enterprise',
        source_type: 'naukri',
        salary: raw.salary || 'Competitive',
        skills: raw.skills || [],
        description: raw.description || '',
        dedup_hash: raw.dedup_hash || (raw.company && raw.title ? `${raw.company.toLowerCase()}::${raw.title.toLowerCase()}` : `naukri-${Date.now()}`)
      };

      const existing = JobRepository.getByDedupHash(normalized.dedup_hash);
      if (!existing) {
        JobRepository.insert(normalized);
        insertedCount++;
        savedJobs.push(normalized);
      }
    }

    PortalHealthRepository.recordScrape('naukri', insertedCount);

    EventBus.publish({
      type: 'PORTALS_HARVEST_COMPLETED',
      agentId: 'scout',
      summary: `Synced ${insertedCount} new listings from Naukri Enterprise / Browser Extension queue.`,
      metadata: { portal: 'naukri', totalReceived: rawJobs.length, newIngested: insertedCount }
    });

    res.json({
      success: true,
      data: {
        totalReceived: rawJobs.length,
        newIngested: insertedCount,
        jobs: savedJobs
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

