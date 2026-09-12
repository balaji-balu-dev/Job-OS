/**
 * ==========================================================================
 * JobOS Application Timeline View (js/views/timeline.js)
 * Chronological audit trail of agent actions, verification milestones & approvals
 * ==========================================================================
 */

import { store } from '../store.js';

export function renderTimeline() {
  const steps = [
    { title: 'Interview Scheduled', agent: 'Tracking Agent ("Radar")', time: 'Today, 11:20 AM', type: 'interview', desc: 'Parsed Google Meet invite from Datadog recruiter. Scheduled Technical Screening for tomorrow 4:00 PM.' },
    { title: 'Application Submitted to Greenhouse', agent: 'Orchestrator ("Chief")', time: 'Today, 10:55 AM', type: 'verified', desc: 'User approved final gate for Razorpay. Direct ATS API payload dispatched with HTTP 201 Created.' },
    { title: 'Application Verified & Sealed', agent: 'Verification Agent ("Sentry")', time: 'Today, 10:45 AM', type: 'verified', desc: 'All 14 field responses corroborated against candidate profile. 0 hallucinations detected.' },
    { title: 'Application Responses Prepared', agent: 'Application Agent ("Quill")', time: 'Today, 10:20 AM', type: 'working', desc: 'Drafted custom responses using Project Chronos metrics and notice period data.' },
    { title: 'Candidate Approved Shortlist', agent: 'User / Human Sign-off', time: 'Today, 09:40 AM', type: 'approval', desc: 'User reviewed 94% match recommendation and authorized application preparation.' },
    { title: 'Job Description Analyzed & Match Calculated', agent: 'Job Intelligence ("Sage")', time: 'Today, 09:12 AM', type: 'working', desc: 'Evaluated Razorpay Core Payments JD. Calculated 94% match score with 0 blockers.' },
    { title: 'Job Discovered on Greenhouse ATS Feed', agent: 'Scout ("Tracker")', time: 'Today, 08:50 AM', type: 'working', desc: 'Scout harvested requisition #94821 during scheduled "Senior Backend India" crawl.' }
  ];

  return `
    <div class="view-content-wrapper" style="max-width: 860px; display: flex; flex-direction: column; gap: var(--space-5);">
      
      <!-- Timeline Header -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h1 style="font-size: var(--text-2xl); font-weight: 800; letter-spacing: -0.5px;">Application Timeline</h1>
          <p style="color: var(--text-secondary); font-size: var(--text-sm);">
            Granular immutable audit trail of every agent action and human authorization.
          </p>
        </div>

        <button class="btn btn-secondary btn-sm" onclick="window.location.hash='#tracker'">
          📊 Switch to Kanban Board
        </button>
      </div>

      <!-- Timeline Stream -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span>Razorpay — Senior Backend Engineer Lifecycle</span>
          </div>
          <span class="badge-audit verified">LIVE AUDIT LOG</span>
        </div>

        <div class="timeline-stream">
          ${steps.map(s => `
            <div class="timeline-node">
              <div class="timeline-marker ${s.type}"></div>
              <div style="display: flex; align-items: baseline; justify-content: space-between;">
                <strong style="font-size: var(--text-base); color: var(--text-primary);">${s.title}</strong>
                <span style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted);">${s.time}</span>
              </div>
              <div style="font-size: 12px; color: var(--brand-sky); font-weight: 600;">
                Actor: ${s.agent}
              </div>
              <div style="font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.5; margin-top: 2px;">
                ${s.desc}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}
