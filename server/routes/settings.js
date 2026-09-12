/**
 * Settings & AI Credentials REST Routes (server/routes/settings.js)
 * Secure user-provided API key management with AES-256-GCM encryption and connection testing
 */
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { AICredentialRepository } from '../db/repositories/AICredentialRepository.js';
import { EventBus } from '../core/event-bus.js';

export const settingsRoutes = express.Router();

/**
 * GET /api/settings/ai-credentials
 * Returns masked user credential state (never exposes plaintext key)
 */
settingsRoutes.get(['/ai-credentials', '/credentials'], (req, res) => {
  try {
    const masked = AICredentialRepository.getMasked();
    res.json({ success: true, data: masked });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/settings/ai-credentials/test
 * Validates connection with the provider using the provided candidate key BEFORE saving
 */
settingsRoutes.post('/ai-credentials/test', async (req, res) => {
  try {
    const { provider = 'gemini', apiKey } = req.body;

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid API key string'
      });
    }

    const cleanKey = apiKey.trim();

    if (provider === 'gemini') {
      // Test with Gemini API
      try {
        const ai = new GoogleGenAI({ apiKey: cleanKey });
        const testModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        
        const response = await ai.models.generateContent({
          model: testModel,
          contents: 'Connection test. Reply with "OK".',
          config: { maxOutputTokens: 5, temperature: 0 }
        });

        if (response && response.text) {
          return res.json({
            success: true,
            message: 'Connected successfully to Google Gemini API!'
          });
        } else {
          return res.status(400).json({
            success: false,
            error: 'Provider reached, but unexpected response format received.'
          });
        }
      } catch (apiErr) {
        return res.status(400).json({
          success: false,
          error: `Connection test failed: ${apiErr.message || 'Authentication error with provider'}`
        });
      }
    } else if (provider === 'mock') {
      return res.json({
        success: true,
        message: 'Connected successfully to mock provider!'
      });
    } else {
      // Generic verification
      return res.json({
        success: true,
        message: `API Key format verified for ${provider}.`
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/settings/ai-credentials
 * Encrypts and saves user API key
 */
settingsRoutes.post(['/ai-credentials', '/credentials'], (req, res) => {
  try {
    const { provider = 'gemini', apiKey } = req.body;

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 8) {
      return res.status(400).json({
        success: false,
        error: 'API Key must be at least 8 characters long'
      });
    }

    const saved = AICredentialRepository.saveCredential({
      provider: provider.toLowerCase(),
      apiKey: apiKey.trim()
    });

    EventBus.publish({
      type: 'USER_AI_KEY_SAVED',
      agentId: 'orchestrator',
      summary: `User API key configured for provider "${provider}". Future AI calls will use this key.`,
      metadata: { provider, maskedKey: saved.maskedKey }
    });

    res.json({
      success: true,
      message: 'API Key securely encrypted and saved. Direct user provider billing active.',
      data: saved
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/settings/ai-credentials
 * Clears user API key and falls back to system defaults
 */
settingsRoutes.delete(['/ai-credentials', '/credentials'], (req, res) => {
  try {
    const cleared = AICredentialRepository.deleteCredential();

    EventBus.publish({
      type: 'USER_AI_KEY_REMOVED',
      agentId: 'orchestrator',
      summary: 'User API key removed. Reverting to system default AI provider configuration.',
      metadata: {}
    });

    res.json({
      success: true,
      message: 'User API key removed. Reverted to default system provider.',
      data: cleared
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
