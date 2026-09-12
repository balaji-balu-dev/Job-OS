/**
 * Templates REST Routes (server/routes/templates.js)
 * Resume & cover letter template management (Markdown, LaTeX, Typst, Plain Text)
 */
import express from 'express';
import { TemplateRepository } from '../db/repositories/TemplateRepository.js';

export const templatesRoutes = express.Router();

templatesRoutes.get('/', (req, res) => {
  try {
    const { type } = req.query;
    const templates = TemplateRepository.getAll(type || null);
    res.json({ success: true, data: templates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

templatesRoutes.get('/:id', (req, res) => {
  try {
    const template = TemplateRepository.getById(req.params.id);
    if (!template) return res.status(404).json({ success: false, error: 'Template not found' });
    res.json({ success: true, data: template });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

templatesRoutes.post('/', (req, res) => {
  try {
    const created = TemplateRepository.create(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

templatesRoutes.put('/:id', (req, res) => {
  try {
    const updated = TemplateRepository.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Template not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

templatesRoutes.post('/:id/set-default', (req, res) => {
  try {
    const updated = TemplateRepository.setDefault(req.params.id);
    if (!updated) return res.status(404).json({ success: false, error: 'Template not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

templatesRoutes.post('/:id/duplicate', (req, res) => {
  try {
    const duplicated = TemplateRepository.duplicate(req.params.id);
    if (!duplicated) return res.status(404).json({ success: false, error: 'Template not found' });
    res.status(201).json({ success: true, data: duplicated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

templatesRoutes.delete('/:id', (req, res) => {
  try {
    const deleted = TemplateRepository.delete(req.params.id);
    res.json({ success: true, message: 'Template deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
