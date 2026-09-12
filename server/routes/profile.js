/**
 * Candidate Profile Vault REST Routes (server/routes/profile.js)
 * High-reliability CRUD and bulk updates with schema validation and provenance tracking
 */
import express from 'express';
import { CandidateVault } from '../vault/candidate-vault.js';
import { EventBus } from '../core/event-bus.js';

export const profileRoutes = express.Router();

/**
 * GET /api/profile
 * Retrieves full candidate profile with all 16 sections
 */
profileRoutes.get('/', (req, res) => {
  try {
    const profile = CandidateVault.getProfile();
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/profile
 * Bulk updates multiple candidate profile sections
 */
profileRoutes.put('/', (req, res) => {
  try {
    const { sections, provenance = 'USER_VERIFIED' } = req.body;
    if (!sections || typeof sections !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid payload: "sections" must be an object of profile sections'
      });
    }

    // Validation: Contact email if present
    if (sections.contact && sections.contact.email) {
      const email = String(sections.contact.email).trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email address in contact section'
        });
      }
    }

    // Validation: Identity legal name if present
    if (sections.identity && sections.identity.fullName !== undefined) {
      if (!String(sections.identity.fullName).trim()) {
        return res.status(400).json({
          success: false,
          error: 'Full Legal Name cannot be empty'
        });
      }
    }

    const updated = CandidateVault.updateBulk(sections, provenance);

    EventBus.publish({
      type: 'PROFILE_UPDATED',
      agentId: 'verification-agent',
      summary: `Candidate Profile updated (${Object.keys(sections).length} sections). Verification sealed.`,
      metadata: { sectionsUpdated: Object.keys(sections), provenance }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/profile/:sectionKey
 * Retrieves single candidate profile section
 */
profileRoutes.get('/:sectionKey', (req, res) => {
  try {
    const section = CandidateVault.getSection(req.params.sectionKey);
    if (!section) return res.status(404).json({ success: false, error: 'Section not found' });
    res.json({ success: true, data: section });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/profile/:sectionKey
 * Updates single candidate profile section
 */
profileRoutes.put('/:sectionKey', (req, res) => {
  try {
    const { data, provenance = 'USER_VERIFIED' } = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid section data: expected an object'
      });
    }

    // Basic email validation if updating contact
    if (req.params.sectionKey === 'contact' && data.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email).trim())) {
        return res.status(400).json({ success: false, error: 'Invalid email address format' });
      }
    }

    const updated = CandidateVault.updateSection(req.params.sectionKey, data, provenance);

    EventBus.publish({
      type: 'PROFILE_SECTION_UPDATED',
      agentId: 'verification-agent',
      summary: `Candidate profile section "${req.params.sectionKey}" updated.`,
      metadata: { sectionKey: req.params.sectionKey, provenance }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
