/**
 * Autonomous Missions REST Routes (server/routes/missions.js)
 */
import express from 'express';
import { MissionRepository } from '../db/repositories/MissionRepository.js';

export const missionsRoutes = express.Router();

missionsRoutes.get('/', (req, res) => {
  try {
    const missions = MissionRepository.getAll();
    res.json({ success: true, data: missions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

missionsRoutes.post('/', (req, res) => {
  try {
    const mission = MissionRepository.create(req.body);
    res.status(201).json({ success: true, data: mission });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

missionsRoutes.post('/:id/execute', (req, res) => {
  try {
    const mission = MissionRepository.updateStatus(req.params.id, 'active');
    res.json({ success: true, data: mission, message: 'Mission execution triggered.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

missionsRoutes.delete('/:id', (req, res) => {
  try {
    MissionRepository.delete(req.params.id);
    res.json({ success: true, message: 'Mission deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
