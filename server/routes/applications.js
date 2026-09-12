/**
 * Applications & Human Safety Gate REST Routes (server/routes/applications.js)
 */
import express from 'express';
import { ApplicationRepository } from '../db/repositories/ApplicationRepository.js';
import { VerificationAgent } from '../agents/verification.js';
import { ApprovalGateway } from '../core/approval-gateway.js';
import { browserWorker } from '../browser/browser-worker.js';

export const applicationRoutes = express.Router();

applicationRoutes.get('/', (req, res) => {
  try {
    const apps = ApplicationRepository.getAll();
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

applicationRoutes.get('/:id', (req, res) => {
  try {
    const app = ApplicationRepository.getById(req.params.id);
    if (!app) return res.status(404).json({ success: false, error: 'Application not found' });
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

applicationRoutes.post('/:id/audit', async (req, res) => {
  try {
    const result = await VerificationAgent.auditApplication(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

applicationRoutes.post('/:id/unlock-gate', (req, res) => {
  try {
    const { token, userSignature = 'EXPLICIT_UI_CLICK' } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Missing gate unlock token' });
    }
    const result = ApprovalGateway.verifyAndUnlock(req.params.id, token, userSignature);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(403).json({ success: false, error: err.message });
  }
});

applicationRoutes.post('/:id/submit', async (req, res) => {
  try {
    const { token } = req.body;
    const app = ApplicationRepository.getById(req.params.id);
    if (!app) return res.status(404).json({ success: false, error: 'Application not found' });

    // Enforce Human Gate
    if (!token || !token.startsWith('GATE-')) {
      return res.status(403).json({
        success: false,
        error: 'ZERO_TOKEN_SUBMISSION_BLOCKED: Human signature token required before transmission.'
      });
    }

    // Check employer blacklist
    if (ApprovalGateway.isEmployerBlacklisted(app.company)) {
      return res.status(403).json({
        success: false,
        error: `EMPLOYER_BLACKLISTED: Direct applications to ${app.company} are blocked by policy.`
      });
    }

    // Dispatch to dedicated Browser Worker
    const receipt = await browserWorker.submitApplication(app, token);
    const updated = ApplicationRepository.unlockAndSubmit(req.params.id, receipt);

    res.json({ success: true, data: { application: updated, receipt } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

applicationRoutes.put('/:id/answers/:ansId', (req, res) => {
  try {
    const { text } = req.body;
    const app = ApplicationRepository.getById(req.params.id);
    if (!app) return res.status(404).json({ success: false, error: 'Application not found' });

    const updatedAnswers = app.answers.map(a => {
      if (a.id === req.params.ansId) {
        return { ...a, answer: text, status: 'approved' };
      }
      return a;
    });

    const updated = ApplicationRepository.updateAnswers(req.params.id, updatedAnswers);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
