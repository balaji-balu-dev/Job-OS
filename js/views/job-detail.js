/**
 * ==========================================================================
 * JobOS Job Detail View (js/views/job-detail.js)
 * Deep intelligence match analysis, extracted requirements, concerns & action
 * ==========================================================================
 */

import { store } from '../store.js';

export function renderJobDetail(jobId = 'job-razorpay') {
  const job = store.jobs.find(j => j.id === jobId) || store.jobs[0];

  return `
    <div class="view-content-wrapper" style="display: flex; flex-direction: column; gap: var(--space-5);">
      
      <!-- Top Navigation Breadcrumb -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <button class="btn btn-ghost btn-sm" onclick="window.location.hash='#jobs'">
          ← Back to All Discovered Jobs
        </button>
        <div style="display: flex; gap: var(--space-2);">
          <span class="pipeline-pill">
            <span class="dot" style="background-color: var(--brand-emerald);"></span> Status: ${job.status.replace('_', ' ').toUpperCase()}
          </span>
          <button class="btn btn-primary btn-sm" onclick="window.location.hash='#app-review'">
            Review Prepared Application →
          </button>
        </div>
      </div>

      <!-- Job Title & Company Hero -->
      <div class="card" style="display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4);">
        <div style="display: flex; align-items: center; gap: var(--space-4);">
          <div class="job-company-logo" style="width: 56px; height: 56px; font-size: 20px;">
            ${job.company.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 style="font-size: var(--text-xl); font-weight: 800;">${job.title}</h1>
            <div style="display: flex; align-items: center; gap: var(--space-3); color: var(--text-secondary); font-size: var(--text-sm); margin-top: 4px;">
              <span><strong>${job.company}</strong></span>
              <span>•</span>
              <span>📍 ${job.location}</span>
              <span>•</span>
              <span>💰 ${job.salary}</span>
              <span>•</span>
              <span>🕒 Discovered ${job.discoveredTime}</span>
            </div>
          </div>
        </div>

        <div style="text-align: right;">
          <div class="match-score-badge very-high" style="font-size: var(--text-lg); padding: 6px 16px;">
            ${job.matchScore}% MATCH
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
            Job Intelligence Rating
          </div>
        </div>
      </div>

      <!-- Two-Column Layout: Match Analysis vs Original JD -->
      <div class="job-detail-layout">
        
        <!-- Left Column: Intelligence Breakdown & Match Reasoning -->
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          
          <!-- Match Breakdown Hero -->
          <div class="intelligence-match-hero">
            <div class="match-score-display">
              <div>
                <div style="font-size: var(--text-xs); text-transform: uppercase; font-weight: 700; color: var(--brand-amber); letter-spacing: 0.5px;">
                  AI Vector Match Synthesis
                </div>
                <h3 style="font-size: var(--text-base); font-weight: 700; color: #fff; margin-top: 2px;">
                  Why Job Intelligence recommends applying:
                </h3>
              </div>
              <span class="badge-audit verified">VERIFIED FIT</span>
            </div>

            <ul style="list-style: none; display: flex; flex-direction: column; gap: var(--space-2);">
              ${job.matchReasons.map(reason => `
                <li style="display: flex; align-items: flex-start; gap: var(--space-2); font-size: var(--text-sm); color: var(--text-primary);">
                  <span style="color: var(--brand-emerald); font-weight: 800;">✓</span>
                  <span>${reason}</span>
                </li>
              `).join('')}
            </ul>

            <!-- Potential Concerns Block -->
            ${job.concerns.length > 0 ? `
              <div class="concerns-card">
                <div style="font-size: var(--text-xs); font-weight: 700; color: #fda4af; text-transform: uppercase; margin-bottom: 4px;">
                  ⚠️ Flagged Tradeoffs & Considerations:
                </div>
                <ul style="list-style: none; display: flex; flex-direction: column; gap: 4px; font-size: var(--text-sm); color: #fecdd3;">
                  ${job.concerns.map(c => `
                    <li>• ${c}</li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
          </div>

          <!-- Extracted Required Skills -->
          <div class="card">
            <h3 class="card-title">Extracted Skill Requirements & Candidate Alignment</h3>
            <div style="display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-3);">
              ${job.skills.map(s => `
                <span class="badge-audit verified" style="font-size: 12px; padding: 4px 10px;">
                  ✓ ${s}
                </span>
              `).join('')}
            </div>
          </div>

          <!-- Original Job Description -->
          <div class="card">
            <h3 class="card-title" style="margin-bottom: var(--space-3);">Full Job Description from ATS</h3>
            <div style="background: var(--bg-surface-0); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); font-size: var(--text-sm); line-height: 1.6; white-space: pre-line; color: var(--text-secondary);">
              ${job.description}
            </div>
          </div>

        </div>

        <!-- Right Column: Meta Telemetry & Fast-Track Actions -->
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          
          <div class="card">
            <h3 class="card-title" style="margin-bottom: var(--space-4);">Application Intelligence</h3>
            
            <div class="form-group">
              <div class="form-label">Discovery Source</div>
              <div style="font-weight: 600; font-size: var(--text-sm); color: var(--text-primary);">
                ${job.source}
              </div>
            </div>

            <div class="form-group">
              <div class="form-label">Application Method</div>
              <div style="font-weight: 600; font-size: var(--text-sm); color: var(--brand-sky);">
                ${job.applicationMethod}
              </div>
            </div>

            <div class="form-group">
              <div class="form-label">Estimated Effort</div>
              <div style="font-weight: 600; font-size: var(--text-sm); color: var(--text-primary);">
                ${job.difficulty}
              </div>
            </div>

            <div style="border-top: 1px solid var(--border-subtle); padding-top: var(--space-4); margin-top: var(--space-4);">
              <div style="font-size: 11px; color: var(--text-muted); margin-bottom: var(--space-3);">
                Application Agent has already drafted verified responses using Candidate Profile v3.2.
              </div>
              <button class="btn btn-primary" style="width: 100%;" onclick="window.location.hash='#app-review'">
                Review Application Answers →
              </button>
            </div>
          </div>

          <div class="card">
            <h3 class="card-title">Assigned Agents</h3>
            <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-3); font-size: var(--text-xs);">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Scout:</span>
                <span style="color: var(--brand-sky); font-weight: 600;">Harvested Listing</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Job Intelligence:</span>
                <span style="color: var(--brand-amber); font-weight: 600;">94% Score Calculated</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Application Agent:</span>
                <span style="color: var(--brand-emerald); font-weight: 600;">Answers Prepared</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Verification Agent:</span>
                <span style="color: var(--agent-verify); font-weight: 600;">Passed Pre-Flight Seal</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  `;
}
