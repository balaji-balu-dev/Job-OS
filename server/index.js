/**
 * JobOS Modular Monolith Backend (server/index.js)
 * High-concurrency autonomous personal job command center API & static server
 */
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getDb, closeDb } from './db/database.js';
import { agentRoutes } from './routes/agents.js';
import { jobRoutes } from './routes/jobs.js';
import { applicationRoutes } from './routes/applications.js';
import { profileRoutes } from './routes/profile.js';
import { telemetryRoutes } from './routes/telemetry.js';
import { aiUsageRoutes } from './routes/ai-usage.js';
import { resumesRoutes } from './routes/resumes.js';
import { settingsRoutes } from './routes/settings.js';
import { intelligenceRoutes } from './routes/intelligence.js';
import { portalsRoutes } from './routes/portals.js';
import { searchProfilesRoutes } from './routes/search-profiles.js';
import { templatesRoutes } from './routes/templates.js';
import { emailSyncRoutes } from './routes/email-sync.js';
import { backupRoutes } from './routes/backup.js';
import { reportsRoutes } from './routes/reports.js';
import { diagnosticsRoutes } from './routes/diagnostics.js';
import { missionsRoutes } from './routes/missions.js';
import { AttentionRepository } from './db/repositories/AttentionRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Initialize DB on app creation
  getDb();

  // API Routes
  app.use('/api/agents', agentRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/telemetry', telemetryRoutes);
  app.use('/api/ai-usage', aiUsageRoutes);
  app.use('/api/resumes', resumesRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/intelligence', intelligenceRoutes);
  app.use('/api/portals', portalsRoutes);
  app.use('/api/search-profiles', searchProfilesRoutes);
  app.use('/api/templates', templatesRoutes);
  app.use('/api/missions', missionsRoutes);
  app.use('/api/email-sync', emailSyncRoutes);
  app.use('/api/backup', backupRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/health', diagnosticsRoutes);
  app.use('/api/diagnostics', diagnosticsRoutes);

  // Attention Items Route
  app.get('/api/attention', (req, res) => {
    try {
      const items = AttentionRepository.getAll();
      res.json({ success: true, data: items });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/attention/:id/resolve', (req, res) => {
    try {
      const { status = 'APPROVED' } = req.body;
      const updated = AttentionRepository.resolve(req.params.id, status);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Graceful shutdown endpoint for one-click stopping (Stop-JobOS.cmd)
  app.all('/api/shutdown', (req, res) => {
    res.json({ success: true, message: 'JobOS production server stopping safely...' });
    setTimeout(() => {
      import('./db/database.js').then(({ closeDb }) => {
        closeDb();
        process.exit(0);
      }).catch(() => process.exit(0));
    }, 150);
  });

  // Dedicated diagnostics view redirect
  app.get('/diagnostics', (req, res) => {
    res.redirect('/#diagnostics');
  });

  // Dedicated launch screen route
  app.get('/launch', (req, res) => {
    res.sendFile(path.join(ROOT_DIR, 'launch.html'));
  });

  // Serve static assets from project root
  app.use(express.static(ROOT_DIR, { index: false }));

  // SPA fallback
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
    res.sendFile(path.join(ROOT_DIR, 'index.html'));
  });

  return app;
}
