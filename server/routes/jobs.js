/**
 * Jobs REST Routes (server/routes/jobs.js)
 */
import express from 'express';
import { JobRepository } from '../db/repositories/JobRepository.js';
import { ScoutAgent } from '../agents/scout.js';
import { IntelligenceAgent } from '../agents/intelligence.js';

export const jobRoutes = express.Router();

jobRoutes.get('/', (req, res) => {
  try {
    const { status, limit, offset } = req.query;
    const jobs = JobRepository.getAll({
      status,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0
    });
    res.json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

jobRoutes.get('/:id', (req, res) => {
  try {
    const job = JobRepository.getById(req.params.id);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

jobRoutes.post('/scout/rescan', async (req, res) => {
  try {
    const result = await ScoutAgent.runHarvest();
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

jobRoutes.post('/:id/analyze', async (req, res) => {
  try {
    const result = await IntelligenceAgent.analyzeJob(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

jobRoutes.post('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const updated = JobRepository.updateStatus(req.params.id, status);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
