/**
 * ==========================================================================
 * JobOS Job Discovery View (js/views/jobs.js)
 * Multi-dimensional fit breakdown, deal-breaker callouts, priority sorting, search profiles & portal health
 * ==========================================================================
 */

import { store } from '../store.js';

export function renderJobs() {
  const jobs = store.jobs || [];

  return `
    <div class="view-content-wrapper" style="display: flex; flex-direction: column; gap: var(--space-5);">
      
      <!-- Header & Search Profile Bar -->
      <div class="job-discovery-header">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <h1 style="font-size: var(--text-2xl); font-weight: 800; letter-spacing: -0.5px; margin: 0;">Job Discovery & Multi-Portal Hub</h1>
              <span class="badge" style="background: rgba(16, 185, 129, 0.12); color: var(--brand-emerald); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px;">7 PORTALS ACTIVE (INC. NAUKRI)</span>
            </div>
            <p style="color: var(--text-secondary); font-size: var(--text-sm); margin: 0;">
              Autonomous discovery across Greenhouse, Lever, LinkedIn, Indeed, Wellfound, RemoteOK, and Naukri Enterprise. Evaluated against Profile Truth Vault.
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <!-- Portal Health Status Modal Trigger -->
            <button class="btn btn-secondary btn-sm" onclick="window.app.openPortalHealthModal()" style="display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--brand-emerald);"></span>
              <span>Portal Health</span>
            </button>

            <!-- Sync Naukri Extension Button -->
            <button class="btn btn-secondary btn-sm" onclick="window.app.syncNaukriExtension()" style="display: flex; align-items: center; gap: 6px; border-color: rgba(56, 189, 248, 0.3);">
              <span>⚡</span>
              <span>Sync Naukri</span>
            </button>

            <!-- Search Profile Switcher -->
            <div style="display: flex; align-items: center; gap: 6px; background: var(--bg-surface); padding: 4px 10px; border-radius: 8px; border: 1px solid var(--border-color);">
              <span style="font-size: 12px; color: var(--text-secondary);">Profile:</span>
              <select style="background: transparent; border: none; color: var(--text-primary); font-size: var(--text-xs); font-weight: 700; cursor: pointer;" onchange="window.app.switchSearchProfile(this.value)">
                <option value="sp-senior-backend">Senior Distributed Systems — India & Remote</option>
                <option value="sp-fullstack-cloud">Lead Full Stack & Cloud Architect — Global</option>
              </select>
            </div>

            <button class="btn btn-primary btn-sm" onclick="window.app.triggerScoutCrawl()" style="display: flex; align-items: center; gap: 6px;">
              <span>🐾</span>
              <span>Run Multi-Portal Scrape</span>
            </button>
          </div>
        </div>

        <!-- Priority Filters & Search Toolbar -->
        <div class="filter-toolbar" style="margin-top: 18px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" onclick="window.app.filterJobsByPriority('ALL')" style="font-weight: 700; font-size: 11px;">All Jobs</button>
            <button class="btn btn-secondary btn-sm" onclick="window.app.filterJobsByPriority('HIGH_PRIORITY')" style="font-weight: 700; font-size: 11px; color: var(--brand-amber);">🔥 High Priority</button>
            <button class="btn btn-secondary btn-sm" onclick="window.app.filterJobsByPriority('GOOD_MATCH')" style="font-weight: 700; font-size: 11px; color: var(--brand-emerald);">🟢 Good Match</button>
            <button class="btn btn-secondary btn-sm" onclick="window.app.filterJobsByPriority('DEAL_BREAKER')" style="font-weight: 700; font-size: 11px; color: var(--brand-rose);">⚠ Deal Breakers</button>
            <button class="btn btn-secondary btn-sm" onclick="window.app.filterJobsBySource('naukri')" style="font-weight: 700; font-size: 11px; color: var(--brand-sky);">🇮🇳 Naukri Only</button>
          </div>

          <div style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: var(--text-xs); color: var(--text-secondary);">Sort:</span>
            <select class="input-select" style="font-size: var(--text-xs);" onchange="window.app.sortJobsList(this.value)">
              <option value="score">Fit Score (Highest First)</option>
              <option value="date">Discovered Date (Newest)</option>
              <option value="company">Company Name</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Jobs Grid / List -->
      <div class="jobs-grid-list" id="jobs-cards-container">
        ${jobs.map(job => {
          const matchScore = job.match_score || job.matchScore || 85;
          let scoreClass = 'medium';
          if (matchScore >= 92) scoreClass = 'very-high';
          else if (matchScore >= 85) scoreClass = 'high';

          const dealBreakers = job.deal_breakers || [];
          const hasDealBreakers = dealBreakers.length > 0;
          const isHighPriority = matchScore >= 88 && !hasDealBreakers;
          const sourceType = (job.source_type || job.sourceType || '').toLowerCase();
          const sourceName = (job.source || '').toLowerCase();

          return `
            <div class="job-card-row" data-source-type="${sourceType}" data-source-name="${sourceName}" onclick="window.app.openJobDetail('${job.id}')" style="cursor: pointer; ${hasDealBreakers ? 'border-left: 4px solid var(--brand-rose);' : ''}">
              
              <!-- Left: Company Logo & Titles -->
              <div class="job-main-info" style="flex: 1;">
                <div class="job-company-logo">
                  ${(job.company || 'CO').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div class="job-title-line" style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-weight: 700;">${job.title}</span>
                    <span style="font-size: var(--text-sm); font-weight: 500; color: var(--text-muted);">• ${job.company}</span>
                    ${isHighPriority ? '<span class="badge" style="background: rgba(245, 158, 11, 0.15); color: var(--brand-amber); font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px;">🔥 HIGH PRIORITY</span>' : ''}
                  </div>

                  <div class="job-meta-line">
                    <span>📍 ${job.location || 'Remote'}</span>
                    <span>•</span>
                    <span>💰 ${job.salary || 'Salary Undisclosed'}</span>
                    <span>•</span>
                    <span>📡 Source: <strong>${job.source || 'Direct ATS'}</strong></span>
                    <span>•</span>
                    <span>🕒 Discovered ${job.discovered_time || job.discoveredTime || 'Recently'}</span>
                  </div>

                  <!-- Deal Breaker Alert Banner -->
                  ${hasDealBreakers ? `
                    <div style="margin: 8px 0; padding: 6px 10px; background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.25); border-radius: 6px; font-size: 11px; color: var(--brand-rose); font-weight: 600; display: flex; align-items: center; gap: 6px;">
                      <span>⚠ DEAL BREAKERS:</span>
                      <span>${dealBreakers.join(' • ')}</span>
                    </div>
                  ` : ''}

                  <div class="job-tags-row">
                    ${(job.skills || []).slice(0, 5).map(skill => `
                      <span class="job-pill-tag">${skill}</span>
                    `).join('')}
                    ${(job.skills || []).length > 5 ? `<span class="job-pill-tag">+${job.skills.length - 5} more</span>` : ''}
                  </div>
                </div>
              </div>

              <!-- Right: Match Telemetry & Actions -->
              <div style="display: flex; align-items: center; gap: var(--space-4);">
                <div style="text-align: right;">
                  <div class="match-score-badge ${scoreClass}">
                    ${matchScore}% MATCH
                  </div>
                  <button class="btn btn-ghost btn-xs" onclick="event.stopPropagation(); window.app.openFitBreakdownModal('${job.id}')" style="font-size: 10px; color: var(--brand-sky); text-decoration: underline; margin-top: 4px; padding: 0;">
                    Fit Breakdown (6D) ▾
                  </button>
                </div>

                <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); window.app.openJobDetail('${job.id}')">
                  Inspect JD →
                </button>
              </div>

            </div>
          `;
        }).join('')}
        ${jobs.length === 0 ? `
          <div style="padding: 48px 24px; text-align: center; background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: var(--radius-lg); margin-top: 8px;">
            <div style="font-size: 36px; margin-bottom: 12px;">🔍</div>
            <h3 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: 8px;">No jobs discovered yet</h3>
            <p style="color: var(--text-secondary); font-size: var(--text-sm); max-width: 480px; margin: 0 auto 16px;">
              Configure your search preferences and trigger Scout or connect job portals to start discovering matched opportunities.
            </p>
            <button class="btn btn-primary btn-sm" onclick="window.app.triggerScoutCrawl()">
              🐾 Run Discovery Scrape Now
            </button>
          </div>
        ` : ''}
      </div>

    </div>
  `;
}
