/**
 * Reports REST Routes (server/routes/reports.js)
 * Funnel metrics and offline HTML report downloads
 */
import express from 'express';
import { ReportGenerator } from '../core/ReportGenerator.js';

export const reportsRoutes = express.Router();

reportsRoutes.get('/funnel', (req, res) => {
  try {
    const metrics = ReportGenerator.getFunnelMetrics();
    res.json({ success: true, data: metrics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

reportsRoutes.get('/export-html', (req, res) => {
  try {
    const html = ReportGenerator.generateOfflineHtml();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="jobos_pipeline_report_${Date.now()}.html"`);
    res.send(html);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
