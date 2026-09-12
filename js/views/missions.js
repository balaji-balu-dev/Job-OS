/**
 * ==========================================================================
 * JobOS Missions View (js/views/missions.js)
 * Reusable autonomous campaigns with criteria, skills & manual triggers
 * ==========================================================================
 */

import { store } from '../store.js';

export function renderMissions() {
  return `
    <div class="view-content-wrapper" style="display: flex; flex-direction: column; gap: var(--space-5);">
      
      <!-- Missions Header -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h1 style="font-size: var(--text-2xl); font-weight: 800; letter-spacing: -0.5px;">Job-Search Missions</h1>
          <p style="color: var(--text-secondary); font-size: var(--text-sm);">
            Autonomous search directives continuously monitored by Scout and Job Intelligence.
          </p>
        </div>

        <button class="btn btn-primary" onclick="window.app.createNewMissionModal()">
          + Create New Search Mission
        </button>
      </div>

      <!-- Missions Grid -->
      <div class="missions-grid">
        ${store.missions.map(m => `
          <div class="mission-card">
            
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2);">
                <span class="badge-audit verified">ACTIVE CAMPAIGN</span>
                <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
                  Runs ${m.schedule}
                </span>
              </div>

              <h3 style="font-size: var(--text-lg); font-weight: 800; color: var(--text-primary); margin-top: 4px;">
                ${m.name}
              </h3>

              <div style="margin-top: var(--space-3); display: flex; flex-direction: column; gap: var(--space-2);">
                
                <div>
                  <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
                    Target Roles:
                  </div>
                  <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
                    ${m.titles.map(t => `<span class="job-pill-tag">${t}</span>`).join('')}
                  </div>
                </div>

                <div style="margin-top: 4px;">
                  <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
                    Locations:
                  </div>
                  <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px;">
                    📍 ${m.locations.join(' • ')}
                  </div>
                </div>

                <div style="margin-top: 4px;">
                  <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
                    Core Stack:
                  </div>
                  <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
                    ${m.skills.map(s => `<span class="job-pill-tag" style="color: var(--brand-sky);">${s}</span>`).join('')}
                  </div>
                </div>

                <div style="margin-top: 6px; display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 6px;">
                  <span>Min Match Threshold:</span>
                  <strong style="color: var(--brand-amber); font-family: var(--font-mono);">${m.minMatchScore}%</strong>
                </div>

              </div>
            </div>

            <div style="border-top: 1px solid var(--border-subtle); padding-top: var(--space-3); margin-top: var(--space-3); display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 11px; color: var(--text-muted);">
                Last run ${m.lastRun}
              </span>
              <button class="btn btn-secondary btn-sm" onclick="window.app.executeMissionNow('${m.id}')">
                ▶ Execute Now
              </button>
            </div>

          </div>
        `).join('')}
      </div>

    </div>
  `;
}
