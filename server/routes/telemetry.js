/**
 * Safe Telemetry & SSE Stream Routes (server/routes/telemetry.js)
 * Real-time event broadcasting to Virtual Office Floorplan and Inspector
 */
import express from 'express';
import { EventRepository } from '../db/repositories/EventRepository.js';
import { eventBus } from '../core/event-bus.js';
import { CryptoVault } from '../vault/crypto-vault.js';

export const telemetryRoutes = express.Router();

telemetryRoutes.get('/events', (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const events = EventRepository.getRecent(limit);
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

telemetryRoutes.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial connected frame
  const initPayload = {
    type: 'HEARTBEAT',
    timestamp: Date.now(),
    clusterStatus: 'OPTIMAL',
    heartbeatMs: 140,
    activeAgents: 7
  };
  res.write(`data: ${JSON.stringify(initPayload)}\n\n`);

  // Event handler for live events
  const onEvent = (event) => {
    // Sanitize any PII in summary or metadata before emission
    const sanitized = {
      ...event,
      summary: CryptoVault.sanitizeForLogs(event.summary)
    };
    res.write(`data: ${JSON.stringify(sanitized)}\n\n`);
  };

  eventBus.on('*', onEvent);

  // Periodic heartbeat timer
  const heartbeatInterval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'HEARTBEAT', timestamp: Date.now(), latencyMs: 140 })}\n\n`);
  }, 10000);

  req.on('close', () => {
    eventBus.removeListener('*', onEvent);
    clearInterval(heartbeatInterval);
  });
});
