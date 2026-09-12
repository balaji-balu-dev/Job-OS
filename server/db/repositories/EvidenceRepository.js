/**
 * EvidenceRepository (server/db/repositories/EvidenceRepository.js)
 * Immutable application evidence packages, document versioning, and submission audits
 */
import { getDb } from '../database.js';

export class EvidenceRepository {
  static _mapRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      applicationId: row.application_id,
      version: row.version, // 1=Base, 2=Tailored, 3=Reviewed, 4=Submitted
      originalJd: row.original_jd,
      jobUrl: row.job_url,
      baseResumeId: row.base_resume_id,
      tailoredResumeText: row.tailored_resume_text,
      tailoredResumeDiff: row.tailored_resume_diff,
      coverLetterText: row.cover_letter_text,
      atsReport: JSON.parse(row.ats_report_json || '{}'),
      reviewerReport: JSON.parse(row.reviewer_report_json || '{}'),
      submissionToken: row.submission_token,
      receipt: JSON.parse(row.receipt_json || '{}'),
      createdAt: row.created_at
    };
  }

  static getByApplicationId(applicationId) {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM application_evidence WHERE application_id = ? ORDER BY version ASC').all(applicationId);
    return rows.map(this._mapRow);
  }

  static getLatestVersion(applicationId) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM application_evidence WHERE application_id = ? ORDER BY version DESC LIMIT 1').get(applicationId);
    return this._mapRow(row);
  }

  static saveSnapshot(evidence) {
    const db = getDb();
    const now = Date.now();
    const id = evidence.id || `ev-${evidence.applicationId}-v${evidence.version || 1}-${now}`;

    db.prepare(`
      INSERT INTO application_evidence (id, application_id, version, original_jd, job_url, base_resume_id, tailored_resume_text, tailored_resume_diff, cover_letter_text, ats_report_json, reviewer_report_json, submission_token, receipt_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      evidence.applicationId,
      evidence.version || 1,
      evidence.originalJd || '',
      evidence.jobUrl || null,
      evidence.baseResumeId || null,
      evidence.tailoredResumeText || null,
      evidence.tailoredResumeDiff || null,
      evidence.coverLetterText || null,
      JSON.stringify(evidence.atsReport || {}),
      JSON.stringify(evidence.reviewerReport || {}),
      evidence.submissionToken || null,
      JSON.stringify(evidence.receipt || {}),
      now
    );

    return this.getByApplicationId(evidence.applicationId);
  }
}
