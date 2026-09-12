/**
 * Agent REST Routes (server/routes/agents.js)
 */
import express from 'express';
import { AgentRepository } from '../db/repositories/AgentRepository.js';
import { OrchestratorAgent } from '../agents/orchestrator.js';

export const agentRoutes = express.Router();

agentRoutes.get('/', (req, res) => {
  try {
    const agents = AgentRepository.getAll();
    res.json({ success: true, data: agents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

agentRoutes.get('/:id', (req, res) => {
  try {
    const agent = AgentRepository.getById(req.params.id);
    if (!agent) return res.status(404).json({ success: false, error: 'Agent not found' });
    res.json({ success: true, data: agent });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

agentRoutes.post('/:id/state', (req, res) => {
  try {
    const { state, currentTask } = req.body;
    const updated = AgentRepository.updateState(req.params.id, state, currentTask);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

agentRoutes.post('/pause-all', (req, res) => {
  try {
    const { paused = true } = req.body;
    const result = OrchestratorAgent.toggleEmergencyPause(paused);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
