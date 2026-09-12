/**
 * ==========================================================================
 * JobOS Interview Center View (js/views/interviews.js)
 * Upcoming interviews, company briefings, anticipated questions & prep notes
 * ==========================================================================
 */

import { store } from '../store.js';

export function renderInterviews() {
  const activeInterview = store.interviews.find(i => i.id === store.selectedInterviewId) || store.interviews[0];

  return `
    <div class="view-content-wrapper" style="display: flex; flex-direction: column; gap: var(--space-5);">
      
      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h1 style="font-size: var(--text-2xl); font-weight: 800; letter-spacing: -0.5px;">Interview Center</h1>
          <p style="color: var(--text-secondary); font-size: var(--text-sm);">
            ${store.interviews.length} active interview rounds scheduled. AI briefings and personalized prep notes ready.
          </p>
        </div>

        <button class="btn btn-primary btn-sm" onclick="window.app.triggerInterviewSync()">
          📅 Sync Calendar & Mail
        </button>
      </div>

      <!-- Pending Recruiter Email Approval Card (Human-in-the-loop) -->
      <div class="card" style="border-color: rgba(249, 115, 22, 0.4); background: linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, var(--bg-surface-1) 100%);">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4);">
          <div style="display: flex; gap: var(--space-3);">
            <div style="font-size: 28px;">✉️</div>
            <div>
              <div style="font-size: 11px; font-weight: 700; color: var(--agent-email); text-transform: uppercase;">
                Email Agent ("Courier") — Awaiting Your Approval
              </div>
              <h3 style="font-size: var(--text-base); font-weight: 700; margin-top: 2px;">
                Draft Confirmation Email to Datadog Recruiting Team
              </h3>
              <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px;">
                "Hi Sarah, thank you for coordinating! I confirm our Technical Screening for tomorrow, Thursday at 4:00 PM IST via Google Meet. Looking forward to discussing Datadog's distributed ingest architecture."
              </p>
            </div>
          </div>

          <div style="display: flex; gap: var(--space-2); flex-shrink: 0;">
            <button class="btn btn-secondary btn-sm" onclick="window.app.editEmailDraft()">
              Edit Draft
            </button>
            <button class="btn btn-amber btn-sm" onclick="window.app.approveAndSendEmail()">
              Approve & Send Email →
            </button>
          </div>
        </div>
      </div>

      <!-- Upcoming Interviews List & Detail Layout -->
      <div style="display: grid; grid-template-columns: 1fr 2fr; gap: var(--space-6);">
        
        <!-- Left: Upcoming Schedule Cards -->
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          <div style="font-size: var(--text-xs); font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
            Scheduled Rounds (${store.interviews.length})
          </div>

          ${store.interviews.map((intv) => {
            const isSelected = intv.id === activeInterview.id;
            return `
            <div class="card card-clickable ${isSelected ? 'selected-intv' : ''}" 
                 style="border-color: ${isSelected ? 'var(--brand-indigo)' : 'var(--border-subtle)'};"
                 onclick="window.app.selectInterview('${intv.id}')">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <strong style="font-size: var(--text-base); color: var(--text-primary);">${intv.company}</strong>
                <span class="badge-audit verified" style="font-size: 10px;">CONFIRMED</span>
              </div>
              <div style="font-size: var(--text-sm); color: var(--brand-sky); font-weight: 600;">
                ${intv.role}
              </div>
              <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 6px;">
                📅 ${intv.date}
              </div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                Round: ${intv.type}
              </div>
            </div>
          `;
          }).join('')}
        </div>

        <!-- Right: Active Interview Deep Briefing & Preparation -->
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          
          <!-- Company & Interviewer Briefing -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                🏢 Company Briefing: ${activeInterview.company}
              </div>
              <span style="font-size: var(--text-xs); font-family: var(--font-mono); color: var(--text-muted);">
                Generated by Job Intelligence
              </span>
            </div>
            <p style="font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6;">
              ${activeInterview.companyBriefing}
            </p>
            <div style="margin-top: var(--space-3); padding: var(--space-3); background: var(--bg-surface-0); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); font-size: var(--text-xs); color: var(--text-secondary);">
              <strong>Interviewer:</strong> ${activeInterview.interviewer}
            </div>
          </div>

          <!-- Anticipated Questions -->
          <div class="card">
            <h3 class="card-title" style="margin-bottom: var(--space-3);">
              🎯 Likely Behavioral & Technical Questions
            </h3>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: var(--space-2);">
              ${activeInterview.likelyQuestions.map((q, i) => `
                <li style="display: flex; gap: var(--space-2); font-size: var(--text-sm); color: var(--text-primary);">
                  <strong style="color: var(--brand-amber);">${i + 1}.</strong>
                  <span>${q}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- Candidate-Specific Preparation Guidance -->
          <div class="card">
            <h3 class="card-title" style="margin-bottom: var(--space-3);">
              💡 Candidate-Specific Talking Points
            </h3>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: var(--space-2);">
              ${activeInterview.candidatePrep.map(p => `
                <li style="display: flex; gap: var(--space-2); font-size: var(--text-sm); color: var(--text-secondary);">
                  <span style="color: var(--brand-emerald);">✓</span>
                  <span>${p}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- High-Impact Questions to Ask -->
          <div class="card">
            <h3 class="card-title" style="margin-bottom: var(--space-3);">
              🙋 Strategic Questions for You to Ask
            </h3>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: var(--space-2);">
              ${activeInterview.questionsToAsk.map(q => `
                <li style="display: flex; gap: var(--space-2); font-size: var(--text-sm); color: var(--text-primary);">
                  <span style="color: var(--brand-sky);">•</span>
                  <span>${q}</span>
                </li>
              `).join('')}
            </ul>
          </div>

        </div>

      </div>

    </div>
  `;
}
