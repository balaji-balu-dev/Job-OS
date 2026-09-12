/**
 * Search Profiles REST Routes (server/routes/search-profiles.js)
 * Multi-profile search configuration management
 */
import express from 'express';
import { SearchProfileRepository } from '../db/repositories/SearchProfileRepository.js';

export const searchProfilesRoutes = express.Router();

searchProfilesRoutes.get('/', (req, res) => {
  try {
    const profiles = SearchProfileRepository.getAll();
    res.json({ success: true, data: profiles });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

searchProfilesRoutes.get('/active', (req, res) => {
  try {
    const active = SearchProfileRepository.getActive();
    res.json({ success: true, data: active });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

searchProfilesRoutes.post('/', (req, res) => {
  try {
    const created = SearchProfileRepository.create(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

searchProfilesRoutes.put('/:id', (req, res) => {
  try {
    const updated = SearchProfileRepository.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Search profile not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

searchProfilesRoutes.post('/:id/activate', (req, res) => {
  try {
    const activated = SearchProfileRepository.setActive(req.params.id);
    if (!activated) return res.status(404).json({ success: false, error: 'Search profile not found' });
    res.json({ success: true, data: activated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

searchProfilesRoutes.delete('/:id', (req, res) => {
  try {
    const deleted = SearchProfileRepository.delete(req.params.id);
    res.json({ success: true, message: 'Search profile deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
