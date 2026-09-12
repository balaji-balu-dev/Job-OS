/**
 * ==========================================================================
 * JobOS Application Review View (js/views/app-review.js)
 * Drafter + Independent Reviewer pipeline, ATS verification, cover letter editor, and submission preview
 * ==========================================================================
 */

import { store } from '../store.js';

export function renderAppReview() {
  const app = store.currentApplication;

  return `
    <div class="view-content-wrapper" style="display: flex; flex-direction: column; gap: var(--space-5);">
      
      <!-- Top Navigation & Audit Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <button class="btn btn-ghost btn-sm" onclick="window.location.hash='#jobs'">
          ← Back to Jobs
        </button>
        <div style="display: flex; align-items: center; gap: var(--space-3);">
          <button class="btn btn-secondary btn-sm" onclick="window.app.openSubmissionPreviewModal()">
            👁️ Full Submission Preview
          </button>
          <span class="badge-audit verified">100% TRUTH AUDITED</span>
          <button class="btn btn-amber" onclick="window.location.hash='#submission-gate'">
            Proceed to Final Submission Gate →
          </button>
        </div>
      </div>

      <!-- Application Banner -->
      <div class="card" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%); border-color: rgba(16, 185, 129, 0.3);">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="font-size: var(--text-xs); text-transform: uppercase; font-weight: 700; color: var(--brand-emerald); letter-spacing: 0.5px;">
              Application Verification & Document Pipeline
            </div>
            <h1 style="font-size: var(--text-2xl); font-weight: 800; margin-top: 2px;">
              ${app.company} — ${app.role}
            </h1>
            <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px;">
              Every bullet point, answer, and metric is verified against your Candidate Truth Vault. The Drafter synthesizes; the Independent Reviewer audits.
            </p>
          </div>

          <div style="text-align: right;">
            <div class="match-score-badge very-high" style="font-size: var(--text-lg); padding: 6px 16px;">
              ${app.matchScore}% MATCH
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
              ${app.verificationScore}
            </div>
          </div>
        </div>
      </div>

      <!-- Multi-Resume Selection & Intelligent Auto-Recommendation -->
      <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; padding: var(--space-4);">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; color: var(--brand-sky);">Selected Base Resume</span>
            <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: var(--brand-emerald); font-size: 10px; padding: 1px 6px; font-weight: 700;">★ RECOMMENDED FOR BACKEND</span>
          </div>
          <div style="font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); margin-top: 2px;">
            System selected best fit: <strong>Senior Backend Systems Architect (v3.2)</strong>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <select id="app-selected-resume" class="input-select" style="min-width: 280px; cursor: pointer;" onchange="window.app.setApplicationResume(this.value)">
            ${(store.resumes || []).map(r => `
              <option value="${r.id}" ${r.isPrimary ? 'selected' : ''}>
                ${r.title} (${r.roleCategory})
              </option>
            `).join('')}
          </select>
          <button class="btn btn-secondary btn-sm" onclick="window.app.runResumeTailoringAndReview()">
            ⚡ Re-Tailor & Review
          </button>
        </div>
      </div>

      <!-- 2-Tier AI Pipeline Reviewer Card & ATS Report -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        
        <!-- Drafter vs Reviewer Critique -->
        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: var(--text-base); font-weight: 700; margin: 0; display: flex; align-items: center; gap: 8px;">
              <span>🤖</span>
              <span>Independent Reviewer Audit (Tier 2)</span>
            </h3>
            <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: var(--brand-emerald); font-size: 10px; font-weight: 700;">ACCURACY: 100%</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5;">
            <div style="padding: 8px 12px; background: rgba(16, 185, 129, 0.08); border-left: 3px solid var(--brand-emerald); border-radius: 4px;">
              ✓ <strong>Zero-Fabrication Seal:</strong> All company names, dates, metrics, and technology claims match Candidate Vault provenance.
            </div>
            <div style="padding: 8px 12px; background: rgba(56, 189, 248, 0.08); border-left: 3px solid var(--brand-sky); border-radius: 4px;">
              ✓ <strong>Relevance Score (94%):</strong> Emphasized high-throughput Kafka settlement rails directly addressing Razorpay core transaction infrastructure.
            </div>
            <div style="padding: 8px 12px; background: rgba(245, 158, 11, 0.08); border-left: 3px solid var(--brand-amber); border-radius: 4px;">
              ✓ <strong>Tailoring Changes Applied:</strong> 4 bullet points rephrased with active verbs, p99 latency metrics elevated to top summary.
            </div>
          </div>
        </div>

        <!-- ATS Readiness Scorecard -->
        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: var(--text-base); font-weight: 700; margin: 0; display: flex; align-items: center; gap: 8px;">
              <span>🎯</span>
              <span>ATS Verification Report</span>
            </h3>
            <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: var(--brand-emerald); font-size: 10px; font-weight: 700;">94% READINESS</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: var(--text-xs); margin-bottom: 12px;">
            <div style="background: rgba(255,255,255,0.02); padding: 8px; border-radius: 6px;">
              <span style="color: var(--text-secondary);">Text Extraction:</span> <strong style="color: var(--brand-emerald);">PASS</strong>
            </div>
            <div style="background: rgba(255,255,255,0.02); padding: 8px; border-radius: 6px;">
              <span style="color: var(--text-secondary);">Contact Details:</span> <strong style="color: var(--brand-emerald);">PASS</strong>
            </div>
            <div style="background: rgba(255,255,255,0.02); padding: 8px; border-radius: 6px;">
              <span style="color: var(--text-secondary);">Section Detection:</span> <strong style="color: var(--brand-emerald);">PASS</strong>
            </div>
            <div style="background: rgba(255,255,255,0.02); padding: 8px; border-radius: 6px;">
              <span style="color: var(--text-secondary);">Formatting Safety:</span> <strong style="color: var(--brand-emerald);">PASS</strong>
            </div>
          </div>

          <div style="font-size: 11px; color: var(--text-secondary);">
            Visual layout test: Estimated 2 pages, standard 0.75in margins, zero line overflow.
          </div>
        </div>

      </div>

      <!-- In-Place Editable Cover Letter -->
      <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <h3 style="font-size: var(--text-base); font-weight: 700; margin: 0;">Tailored Cover Letter (In-Place Editor)</h3>
            <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px;">Forward-looking, technical framing tailored to ${app.company}</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="window.app.regenerateCoverLetter()">Regenerate</button>
            <button class="btn btn-secondary btn-sm" onclick="window.app.downloadCoverLetter()">Download .txt</button>
          </div>
        </div>

        <textarea id="cover-letter-editor" class="input-textarea" style="width: 100%; min-height: 160px; font-family: var(--font-mono); font-size: var(--text-xs); line-height: 1.6; background: rgba(0,0,0,0.25); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px;">Dear Hiring Team at ${app.company},

I am writing to express my enthusiastic interest in the ${app.role} role. With over 6 years architecting high-throughput distributed transaction engines and payment rails, I have tracked ${app.company}'s work with great interest.

In my recent work, I designed mission-critical payment settlement engines handling 10,000 TPS with 99.999% availability, reducing latency by 85% through optimized lock-free caching. My verified hands-on background with Java, Spring Boot, Kafka, and PostgreSQL aligns directly with the architectural challenges described in your posting.

I would welcome the opportunity to discuss how I can contribute to ${app.company}'s engineering milestones.

Sincerely,
Balaji S.</textarea>
      </div>

      <!-- Question and Answer Review Deck -->
      <div class="review-questions-deck">
        <h3 style="font-size: var(--text-base); font-weight: 700; margin: 0 0 14px 0;">Application Form Answers & Provenance</h3>
        ${app.answers.map((item, idx) => {
          let badgeClass = 'verified';
          if (item.provenance === 'DERIVED') badgeClass = 'derived';
          else if (item.provenance === 'NEEDS REVIEW') badgeClass = 'needs-review';

          return `
            <div class="review-question-card status-${badgeClass}" id="q-card-${item.id}">
              
              <!-- Question Header -->
              <div class="review-question-header">
                <div>
                  <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
                    Question ${idx + 1} of ${app.answers.length}
                  </div>
                  <h3 class="question-prompt" style="margin-top: 2px;">
                    "${item.question}"
                  </h3>
                </div>

                <div style="display: flex; align-items: center; gap: var(--space-2);">
                  <span class="badge-audit ${badgeClass}">
                    ${item.provenance}
                  </span>
                  <span style="font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary); background: var(--bg-surface-0); padding: 2px 7px; border-radius: var(--radius-xs); border: 1px solid var(--border-subtle);">
                    ${item.confidence}% Confidence
                  </span>
                </div>
              </div>

              <!-- Answer Area (Editable) -->
              <div class="answer-box" id="ans-box-${item.id}">
                ${item.answer}
              </div>

              <!-- Provenance Citation & Actions -->
              <div class="answer-provenance-meta">
                <div class="provenance-citation">
                  <span>📎 Source Citation:</span>
                  <strong style="color: var(--text-primary); font-family: var(--font-mono);">${item.sourceCitation}</strong>
                </div>

                <div style="display: flex; align-items: center; gap: var(--space-2);">
                  <button class="btn btn-ghost btn-sm" onclick="window.app.editAnswer('${item.id}')">
                    ✏️ Edit Answer
                  </button>
                  <button class="btn btn-ghost btn-sm" onclick="window.app.rederiveAnswer('${item.id}')">
                    🔄 Re-Synthesize
                  </button>
                </div>
              </div>

            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}
