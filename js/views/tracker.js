/**
 * ==========================================================================
 * JobOS Application Tracker View (js/views/tracker.js)
 * 12-Stage Lifecycle Tracker, Evidence Package viewer, and Quiet Follow-Up alerts
 * Modeled after reference MadsLorentzen/ai-job-search /outcome architecture
 * ==========================================================================
 */

import { store } from '../store.js';

export function renderTracker() {
  const apps = store.applications || [];
  const jobs = store.jobs || [];

  const cards = apps.map(app => {
    let stage = 'ready';
    const status = (app.status || '').toUpperCase();
    if (status === 'GATE_HALTED') stage = 'ready';
    else if (status === 'APPROVED') stage = 'approved';
    else if (status === 'SUBMITTED') stage = 'submitted';
    else if (status === 'SCREENING') stage = 'screening';
    else if (status === 'INTERVIEW') stage = 'interview';
    else if (status === 'OFFER') stage = 'offer';
    else if (status === 'REJECTED') stage = 'rejected';
    else if (status === 'WITHDRAWN') stage = 'withdrawn';
    else if (status === 'SHORTLISTED') stage = 'shortlisted';

    const matchScore = app.verification_score ? parseInt(app.verification_score, 10) || 92 : 92;
    return {
      id: app.id,
      company: app.company,
      role: app.role,
      stage,
      match: matchScore,
      salary: app.salary_offered || 'Market Band',
      date: app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : 'Awaiting Gate',
      quietDays: app.follow_up_date ? Math.max(0, Math.floor((Date.now() - new Date(app.follow_up_date).getTime()) / 86400000)) : 0
    };
  });

  const fullStages = [
    { id: 'discovered', label: 'Discovered' },
    { id: 'shortlisted', label: 'Shortlisted' },
    { id: 'ready', label: 'Ready for Gate' },
    { id: 'approved', label: 'Approved' },
    { id: 'submitted', label: 'Applied / Submitted' },
    { id: 'screening', label: 'Viewed / Screening' },
    { id: 'recruiter', label: 'Recruiter Contacted' },
    { id: 'interview', label: 'Technical Rounds' },
    { id: 'final', label: 'Final Round' },
    { id: 'offer', label: 'Offer Received' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'withdrawn', label: 'Withdrawn' }
  ];

  return `
    <div class="view-content-wrapper" style="display: flex; flex-direction: column; gap: var(--space-4);">
      
      <!-- Tracker Header -->
      <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
            <h1 style="font-size: var(--text-2xl); font-weight: 800; letter-spacing: -0.5px; margin: 0;">Application Lifecycle Tracker</h1>
            <span class="badge" style="background: rgba(16, 185, 129, 0.12); color: var(--brand-emerald); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px;">12-STAGE PIPELINE</span>
          </div>
          <p style="color: var(--text-secondary); font-size: var(--text-sm); margin: 0;">
            Every application retains an immutable evidence audit trail with exact resume version and timestamped submission receipt.
          </p>
        </div>

        <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm" onclick="window.app.triggerQuietFollowUpCheck()">
            🔔 Run Follow-Up Check
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.location.hash='#reports'">
            📊 Conversion Analytics
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.app.triggerPipelineSync()">
            🔄 Sync ATS & Email Statuses
          </button>
        </div>
      </div>

      ${cards.length === 0 ? `
        <div style="padding: 24px 20px; text-align: center; background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: var(--radius-lg);">
          <div style="font-size: 24px; margin-bottom: 6px;">📋</div>
          <h3 style="font-size: var(--text-base); font-weight: 700; margin-bottom: 4px;">No applications yet</h3>
          <p style="color: var(--text-secondary); font-size: var(--text-xs); margin: 0;">
            Jobs vetted and approved at the Human Gate will appear here in the 12-stage pipeline.
          </p>
        </div>
      ` : ''}

      <!-- 12-Stage Kanban Horizontal Scroll Arena -->
      <div class="kanban-board" style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 16px;">
        ${fullStages.map(stage => {
          const stageCards = cards.filter(c => c.stage === stage.id);
          const stageCount = stage.id === 'discovered' ? jobs.length : stageCards.length;
          return `
            <div class="kanban-column" style="min-width: 260px; flex-shrink: 0; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 14px;">
              <div class="kanban-col-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-weight: 700; font-size: var(--text-xs); text-transform: uppercase; color: var(--text-primary);">
                  ${stage.label}
                </span>
                <span class="nav-counter" style="background: rgba(255,255,255,0.06); padding: 2px 7px; border-radius: 10px; font-size: 11px; font-weight: 700;">
                  ${stageCount}
                </span>
              </div>

              <div class="kanban-cards-stack" style="display: flex; flex-direction: column; gap: 10px;">
                ${stageCards.map(c => `
                  <div class="kanban-card" onclick="window.app.openApplicationEvidenceModal('${c.company}')" style="background: var(--bg-surface-0); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; cursor: pointer;">
                    
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                      <strong style="font-size: var(--text-sm); color: var(--text-primary);">${c.company}</strong>
                      <span class="match-score-badge very-high" style="font-size: 10px; padding: 1px 5px;">${c.match}%</span>
                    </div>

                    <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: 6px;">
                      ${c.role}
                    </div>

                    <!-- Quiet Follow-up Alert Banner -->
                    ${c.quietDays >= 8 ? `
                      <div style="margin-bottom: 8px; padding: 4px 8px; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 6px; font-size: 10px; color: var(--brand-amber); font-weight: 700; display: flex; align-items: center; justify-content: space-between;">
                        <span>⚠ ${c.quietDays}d Quiet</span>
                        <button class="btn btn-ghost btn-xs" onclick="event.stopPropagation(); window.app.draftFollowUpEmail('${c.company}')" style="padding: 0; text-decoration: underline; color: var(--brand-amber);">
                          Draft Follow-up →
                        </button>
                      </div>
                    ` : ''}

                    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 6px;">
                      <span>💰 ${c.salary}</span>
                      <span style="font-family: var(--font-mono); color: var(--brand-sky); font-size: 10px;">Evidence 📄</span>
                    </div>

                  </div>
                `).join('')}
                
                ${stageCards.length === 0 ? `
                  <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 11px; border: 1px dashed var(--border-subtle); border-radius: 8px;">
                    No active cards
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}
