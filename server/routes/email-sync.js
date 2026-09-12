/**
 * Email Sync & Signals REST Routes (server/routes/email-sync.js)
 * Triage queue for inbound application emails with human sign-off
 */
import express from 'express';
import { EmailSignalRepository } from '../db/repositories/EmailSignalRepository.js';
import { ApplicationRepository } from '../db/repositories/ApplicationRepository.js';
import { EventBus } from '../core/event-bus.js';

export const emailSyncRoutes = express.Router();

emailSyncRoutes.get('/', (req, res) => {
  try {
    const { status } = req.query;
    const signals = EmailSignalRepository.getAll(status || null);
    res.json({ success: true, data: signals });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

emailSyncRoutes.post('/:id/approve', (req, res) => {
  try {
    const signal = EmailSignalRepository.getById(req.params.id);
    if (!signal) return res.status(404).json({ success: false, error: 'Email signal not found' });

    // Update signal status
    const updatedSignal = EmailSignalRepository.updateStatus(req.params.id, 'approved');

    // If mapped to an application, update application status safely
    if (signal.applicationId) {
      ApplicationRepository.updateStatus(signal.applicationId, signal.proposedStatus, `Updated via approved email signal: "${signal.subject}"`);
    }

    EventBus.publish({
      type: 'EMAIL_SIGNAL_APPROVED',
      agentId: 'email-agent',
      summary: `User approved recruiter email signal from ${signal.company}: Status updated to "${signal.proposedStatus}".`,
      metadata: { signalId: signal.id, company: signal.company, newStatus: signal.proposedStatus }
    });

    res.json({ success: true, data: updatedSignal });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

emailSyncRoutes.post('/:id/reject', (req, res) => {
  try {
    const updated = EmailSignalRepository.updateStatus(req.params.id, 'rejected');
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
