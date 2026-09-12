/**
 * Multi-Role Resume Management Routes (server/routes/resumes.js)
 * Local-first secure storage, role-tagging, file validation, download, and primary selection
 */
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { ResumeRepository } from '../db/repositories/ResumeRepository.js';
import { RESUMES_DIR } from '../db/database.js';
import { EventBus } from '../core/event-bus.js';

export const resumesRoutes = express.Router();

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream' // generic binary fallback
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * GET /api/resumes
 * Lists all active resumes ordered by primary first, then creation date
 */
resumesRoutes.get('/', (req, res) => {
  try {
    const resumes = ResumeRepository.getAll();
    res.json({ success: true, data: resumes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/resumes/:id
 * Retrieves single resume metadata
 */
resumesRoutes.get('/:id', (req, res) => {
  try {
    const resume = ResumeRepository.getById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }
    res.json({ success: true, data: resume });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/resumes/upload
 * Handles file upload with base64 or raw buffer content
 * Body: { title, roleCategory, originalName, mimeType, fileData, isPrimary }
 */
resumesRoutes.post('/upload', (req, res) => {
  try {
    const { title, roleCategory, originalName, mimeType, fileData, isPrimary = false } = req.body;

    if (!originalName || typeof originalName !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing original file name' });
    }

    const ext = path.extname(originalName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return res.status(400).json({
        success: false,
        error: `Invalid file format "${ext}". Allowed formats: PDF, DOC, DOCX`
      });
    }

    if (!fileData) {
      return res.status(400).json({ success: false, error: 'Missing file content payload' });
    }

    // Decode base64 if provided as data URL or base64 string
    let buffer;
    if (typeof fileData === 'string') {
      const base64Clean = fileData.replace(/^data:.*?;base64,/, '');
      buffer = Buffer.from(base64Clean, 'base64');
    } else if (Buffer.isBuffer(fileData)) {
      buffer = fileData;
    } else {
      return res.status(400).json({ success: false, error: 'Invalid fileData format' });
    }

    if (buffer.length === 0) {
      return res.status(400).json({ success: false, error: 'Uploaded file cannot be empty' });
    }

    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        error: `File size exceeds 10MB limit (size: ${(buffer.length / (1024 * 1024)).toFixed(1)}MB)`
      });
    }

    // Verify magic bytes for PDF
    if (ext === '.pdf') {
      const header = buffer.subarray(0, 4).toString('utf-8');
      if (header !== '%PDF') {
        return res.status(400).json({
          success: false,
          error: 'File extension is .pdf but content is not a valid PDF document'
        });
      }
    }

    if (!fs.existsSync(RESUMES_DIR)) {
      fs.mkdirSync(RESUMES_DIR, { recursive: true });
    }

    const timestamp = Date.now();
    const safeRandom = Math.random().toString(36).substring(2, 8);
    const sanitizedBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const storedFilename = `${sanitizedBase}-${timestamp}-${safeRandom}${ext}`;
    const targetFilePath = path.join(RESUMES_DIR, storedFilename);

    // Save to private disk storage
    fs.writeFileSync(targetFilePath, buffer);

    const resumeId = `resume-${timestamp}-${safeRandom}`;
    const cleanTitle = (title && String(title).trim()) || originalName;
    const cleanRole = (roleCategory && String(roleCategory).trim()) || 'Software Engineer';
    const effectiveMime = mimeType || (ext === '.pdf' ? 'application/pdf' : 'application/octet-stream');

    const created = ResumeRepository.create({
      id: resumeId,
      title: cleanTitle,
      roleCategory: cleanRole,
      filename: storedFilename,
      originalName: originalName.trim(),
      filePath: targetFilePath,
      fileSize: buffer.length,
      mimeType: effectiveMime,
      isPrimary: Boolean(isPrimary)
    });

    EventBus.publish({
      type: 'RESUME_UPLOADED',
      agentId: 'application-agent',
      summary: `New resume "${cleanTitle}" uploaded for role "${cleanRole}".`,
      metadata: { resumeId, roleCategory: cleanRole, isPrimary }
    });

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('[JobOS Resumes] Upload failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/resumes/:id/download
 * Secure private file download stream
 */
resumesRoutes.get('/:id/download', (req, res) => {
  try {
    const resume = ResumeRepository.getById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    if (!fs.existsSync(resume.filePath)) {
      return res.status(404).json({ success: false, error: 'Resume file missing from local disk storage' });
    }

    // Set secure download headers
    res.setHeader('Content-Type', resume.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(resume.originalName)}"`);
    res.setHeader('Content-Length', resume.fileSize);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const fileStream = fs.createReadStream(resume.filePath);
    fileStream.pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/resumes/:id
 * Updates resume title or role category
 */
resumesRoutes.put('/:id', (req, res) => {
  try {
    const { title, roleCategory, isPrimary } = req.body;
    const updated = ResumeRepository.update(req.params.id, { title, roleCategory, isPrimary });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/resumes/:id/set-primary
 * Designates a specific resume as the primary default
 */
resumesRoutes.post('/:id/set-primary', (req, res) => {
  try {
    const updated = ResumeRepository.setPrimary(req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    EventBus.publish({
      type: 'RESUME_PRIMARY_CHANGED',
      agentId: 'application-agent',
      summary: `Primary default resume set to "${updated.title}" (${updated.roleCategory}).`,
      metadata: { resumeId: updated.id }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/resumes/:id
 * Removes resume file from disk and record from SQLite
 */
resumesRoutes.delete('/:id', (req, res) => {
  try {
    const deleted = ResumeRepository.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    EventBus.publish({
      type: 'RESUME_DELETED',
      agentId: 'application-agent',
      summary: `Resume ${req.params.id} deleted.`,
      metadata: { resumeId: req.params.id }
    });

    res.json({ success: true, message: 'Resume successfully removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
