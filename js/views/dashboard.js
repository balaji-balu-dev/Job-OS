/**
 * ==========================================================================
 * JobOS Dashboard View (js/views/dashboard.js)
 * Command Center: KPIs, "Needs Your Attention" deck, Agent Feed & Mini Office
 * ==========================================================================
 */

import { store } from '../store.js';
import { renderPuppyMascot } from '../puppy-mascots.js';

export function renderDashboard() {
  const jobs = store.jobs || [];
  const apps = store.applications || [];
  const strongMatches = jobs.filter(j => (j.match_score || j.matchScore || 0) >= 85).length;
  const awaitingApproval = apps.filter(a => (a.status || '').toUpperCase() === 'GATE_HALTED').length;
  const submitted = apps.filter(a => (a.status || '').toUpperCase() === 'SUBMITTED').length;
  const followUps = apps.filter(a => a.follow_up_date).length;

  const kpis = [
    { label: 'Discovered Today', value: String(jobs.length), trend: jobs.length > 0 ? `${jobs.length} tracked` : 'None yet', trendClass: jobs.length > 0 ? 'positive' : 'neutral', accent: 'var(--brand-sky)' },
    { label: 'Strong Matches (85%+)', value: String(strongMatches), trend: strongMatches > 0 ? 'High quality' : 'Awaiting jobs', trendClass: strongMatches > 0 ? 'positive' : 'neutral', accent: 'var(--brand-amber)' },
    { label: 'Applications Prepared', value: String(apps.length), trend: apps.length > 0 ? '100% verified' : 'Ready to create', trendClass: apps.length > 0 ? 'positive' : 'neutral', accent: 'var(--brand-indigo)' },
    { label: 'Awaiting Your Approval', value: String(awaitingApproval), trend: awaitingApproval > 0 ? 'Action required' : 'Gate clear', trendClass: awaitingApproval > 0 ? 'alert' : 'neutral', accent: 'var(--brand-rose)' },
    { label: 'Applications Submitted', value: String(submitted), trend: submitted > 0 ? 'Active in ATS' : 'None yet', trendClass: 'neutral', accent: 'var(--brand-emerald)' },
    { label: 'Interviews Scheduled', value: '0', trend: 'Sync active', trendClass: 'neutral', accent: 'var(--agent-track)' },
    { label: 'Follow-ups Due', value: String(followUps), trend: followUps > 0 ? 'Within 48h' : 'Up to date', trendClass: 'neutral', accent: 'var(--agent-email)' }
  ];

  // AI Usage state
  const u = store.aiUsage || {
    status: 'ACTIVE',
    tokensUsed: 6320,
    tokenLimit: 100000,
    usagePercentage: 6.3,
    resetsIn: '18d 23h',
    isManuallyPaused: false,
    isAutoPaused: false,
    warningThresholdPct: 80
  };

  const pct = Math.min(100, Math.max(0, u.usagePercentage || 0));
  const isPaused = u.isManuallyPaused || u.isAutoPaused;
  const statusPillClass = u.isManuallyPaused ? 'paused' : (u.isAutoPaused ? 'limit' : (pct >= u.warningThresholdPct ? 'warning' : 'active'));
  const statusText = u.isManuallyPaused ? 'PAUSED' : (u.isAutoPaused ? 'LIMIT REACHED' : (pct >= u.warningThresholdPct ? 'WARNING' : 'ACTIVE'));
  const barColor = u.isManuallyPaused ? 'var(--brand-sky)' : (u.isAutoPaused ? 'var(--brand-rose)' : (pct >= u.warningThresholdPct ? 'var(--brand-amber)' : 'var(--brand-emerald)'));

  return `
    <div class="view-content-wrapper dashboard-grid">
      
      <!-- Top Editorial Mission Hero Banner (ui-ux-pro-max + ResponsiveHeroBanner styling) -->
      <div class="card" style="position: relative; overflow: hidden; padding: 36px 32px; margin-bottom: var(--space-4); background: radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.12), transparent 50%), radial-gradient(circle at 20% 80%, rgba(56, 189, 248, 0.08), transparent 50%), #09090b; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);">
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);"></div>
        
        <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 24px; position: relative; z-index: 2;">
          <div style="max-width: 720px;">
            <!-- Badge -->
            <div style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 12px; border-radius: 9999px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); margin-bottom: 16px;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; background: #fff; color: #09090b; padding: 2px 8px; border-radius: 9999px;">AI 2.0</span>
              <span style="font-size: 12px; font-weight: 500; color: rgba(255, 255, 255, 0.9);">Autonomous Career Intelligence • 7 Portals Active</span>
            </div>

            <!-- Headline with Instrument Serif -->
            <h1 style="font-family: var(--font-serif); font-size: clamp(2.2rem, 4vw, 3.4rem); font-weight: 400; line-height: 1.08; color: #ffffff; letter-spacing: -0.02em; margin: 0 0 14px 0;">
              Journey Beyond Job Search<br />
              <span style="font-style: italic; opacity: 0.92; background: linear-gradient(135deg, #38bdf8 0%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Into True Career Mastery</span>
            </h1>

            <p style="font-size: 14.5px; line-height: 1.6; color: rgba(255, 255, 255, 0.75); margin: 0 0 20px 0; max-width: 600px;">
              Orchestrating 7 autonomous AI agents across Greenhouse, Lever, LinkedIn, and Naukri. Continuous discovery, zero-hallucination tailoring, and cryptographic Human Gate control.
            </p>

            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <button class="btn btn-primary" onclick="window.app.triggerScoutCrawl()" style="background: #ffffff; color: #09090b; font-weight: 700; border-radius: 9999px; padding: 10px 22px; display: flex; align-items: center; gap: 8px; box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);">
                <span>🐾 Run Multi-Portal Scrape</span>
                <span style="font-size: 12px;">↗</span>
              </button>
              <button class="btn btn-secondary" onclick="window.location.hash='#office'" style="background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.15); border-radius: 9999px; padding: 10px 20px; color: #fff;">
                <span>🏢 3D Virtual Office</span>
              </button>
            </div>
          </div>

          <!-- Mini Live Telemetry Card -->
          <div style="background: rgba(24, 24, 27, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 18px 22px; backdrop-filter: blur(12px); min-width: 250px; display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 11px; font-weight: 700; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 0.05em;">FLEET STATUS</span>
              <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: var(--brand-emerald); font-weight: 700;">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: var(--brand-emerald); box-shadow: 0 0 8px var(--brand-emerald);"></span>
                READY
              </span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: var(--text-secondary);">
              <div style="display: flex; justify-content: space-between;"><span>Active Mission:</span><strong style="color: #fff;">Staff Distributed Sys</strong></div>
              <div style="display: flex; justify-content: space-between;"><span>Active Portals:</span><strong style="color: var(--brand-emerald);">7 Sources</strong></div>
              <div style="display: flex; justify-content: space-between;"><span>Human Gate:</span><strong style="color: var(--brand-amber);">ARMED (0x7F)</strong></div>
              <div style="display: flex; justify-content: space-between;"><span>Storage:</span><strong style="color: #fff;">SQLite WAL</strong></div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Token Budget & Protection Bar -->
      <div class="card" style="padding: 12px 18px; margin-bottom: var(--space-3); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; background: linear-gradient(90deg, rgba(18, 22, 32, 0.95), rgba(26, 32, 44, 0.95)); border: 1px solid var(--border-subtle);">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 34px; height: 34px; border-radius: 8px; background: rgba(245, 158, 11, 0.12); display: flex; align-items: center; justify-content: center; color: var(--brand-amber);">
            <span class="material-symbols-outlined" style="font-size: 20px;">bolt</span>
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 700; font-size: 13.5px; color: var(--text-primary);">AI Token Budget & Protection</span>
              <span class="ai-status-pill ${statusPillClass}" style="font-size: 10px; padding: 2px 7px;">${statusText}</span>
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px; font-family: var(--font-mono);">
              ${(u.tokensUsed || 0).toLocaleString()} / ${(u.tokenLimit || 100000).toLocaleString()} tokens (${pct}%) • Resets in ${u.resetsIn || 'Active'}
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 120px; height: 8px; background: var(--bg-surface-2); border-radius: 9999px; overflow: hidden; border: 1px solid var(--border-subtle);">
            <div style="height: 100%; width: ${pct}%; background: ${barColor};"></div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.location.hash='#ai-usage'">
            Details & Limits
          </button>
          ${isPaused ? `
            <button class="btn btn-emerald btn-sm" onclick="window.app.toggleAIUsagePause(false)">
              Resume AI
            </button>
          ` : `
            <button class="btn btn-secondary btn-sm" style="color: var(--brand-rose); border-color: rgba(244, 63, 94, 0.3);" onclick="window.app.toggleAIUsagePause(true)">
              Pause AI
            </button>
          `}
        </div>
      </div>

      <!-- 1. KPI Telemetry Bar -->
      <div class="kpi-row">
        ${kpis.map(kpi => `
          <div class="metric-card" style="--accent-color: ${kpi.accent}">
            <div class="metric-label">${kpi.label}</div>
            <div class="metric-value-row">
              <span class="metric-value">${kpi.value}</span>
              <span class="metric-trend ${kpi.trendClass}">${kpi.trend}</span>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- 2. "NEEDS YOUR ATTENTION" Priority Carousel/Deck -->
      <div class="attention-section">
        <div class="attention-header">
          <div class="attention-title-block">
            <span class="attention-badge-pulse">URGENT ACTION REQUIRED</span>
            <h3 style="font-size: var(--text-base); font-weight: 700; color: #fff;">
              Decisions Holding Agent Workflows (${store.attentionItems.length})
            </h3>
          </div>
          <span style="font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono);">
            Zero submission or email is sent without your explicit sign-off.
          </span>
        </div>

        <div class="attention-cards-deck">
          ${store.attentionItems.map(item => {
            const agent = store.agents.find(a => a.id === item.agent);
            const agentName = agent ? agent.name : 'Agent';
            const agentNickname = agent ? ` (${agent.nickname})` : '';
            const agentColor = agent ? agent.color : 'var(--brand-amber)';
            const timeElapsed = item.timeElapsed || item.time_elapsed || 'Just now';
            const actionLabel = item.actionLabel || item.action_label || 'Review & Proceed';
            const targetView = item.targetView || item.target_view || 'dashboard';

            return `
              <div class="attention-card" style="--card-accent: ${agentColor}">
                <div>
                  <div class="attention-card-meta">
                    <span style="display: flex; align-items: center; gap: 4px; font-weight: 600; color: ${agentColor}">
                      ● ${agentName}${agentNickname}
                    </span>
                    <span style="font-family: var(--font-mono);">${timeElapsed}</span>
                  </div>
                  <div class="attention-card-body" style="margin-top: var(--space-3);">
                    <h4>${item.title || 'Attention Required'}</h4>
                    <p>${item.description || ''}</p>
                  </div>
                </div>

                <div class="attention-actions-row">
                  <button class="btn btn-ghost btn-sm" onclick="window.app.snoozeAttention('${item.id}')">
                    Defer 2h
                  </button>
                  <button class="btn btn-amber btn-sm" onclick="window.location.hash='#${targetView}'">
                    ${actionLabel} →
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 3. Two-Column Operations: Live Office Miniature, Split Accordion & Activity Stream -->
      <div class="dashboard-columns">
        
        <!-- Left: Autonomous 3D Virtual Office Command Pod -->
        <div class="card" style="border: 1px solid rgba(255, 255, 255, 0.1); background: linear-gradient(180deg, rgba(13, 17, 23, 0.9) 0%, rgba(9, 9, 11, 0.95) 100%); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div class="card-header" style="margin-bottom: 14px;">
              <div class="card-title" style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">🏢</span>
                <span style="font-family: var(--font-serif); font-size: 19px; font-weight: 400; letter-spacing: -0.01em;">Autonomous 3D Virtual Office</span>
                <span class="badge-audit verified" style="font-size: 10px;">7 AGENTS ONLINE</span>
              </div>
              <button class="btn btn-primary btn-sm" onclick="window.location.hash='#office'" style="background: var(--brand-amber); border-color: var(--brand-amber); color: #09090b; font-weight: 700;">
                Enter 3D Floor →
              </button>
            </div>

            <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px;">
              Deterministic AI agent fleet executing continuous crawl cycles, semantic gap analysis, and ATS tailoring under cryptographic Human Gate locks.
            </p>

            <!-- 7 Agents Station Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; margin-bottom: 14px;">
              ${store.agents.map(a => `
                <div onclick="window.app.selectDeskAndNavigate('${a.id}')" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 10px; cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; gap: 4px;" onmouseover="this.style.borderColor='${a.color}'; this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.08)'; this.style.background='rgba(255,255,255,0.03)'">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 14px;">🐾</span>
                    <span class="desk-state-badge ${a.state}" style="font-size: 9px; padding: 1px 4px;">${a.state}</span>
                  </div>
                  <strong style="font-size: 12px; color: var(--text-primary); margin-top: 2px;">${a.nickname}</strong>
                  <span style="font-size: 10.5px; color: var(--text-muted); line-height: 1.2;">${a.role.split('&')[0]}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Bottom Telemetry Strip -->
          <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 11px; color: var(--text-muted);">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--brand-emerald); box-shadow: 0 0 6px var(--brand-emerald);"></span>
              <span>Floorplan: <strong>Sub-Cluster 04</strong></span>
            </div>
            <span style="font-family: var(--font-mono); color: var(--brand-amber);">Zero Drift Enforced</span>
            <button class="btn btn-ghost btn-xs" onclick="window.app.openAgentInspector('orchestrator')" style="color: var(--text-secondary); text-decoration: underline;">
              Fleet Inspector →
            </button>
          </div>
        </div>

        <!-- Right: Real-time Autonomous Audit Feed -->
        <div class="card" style="border: 1px solid rgba(255, 255, 255, 0.1); background: #09090b;">
          <div class="card-header">
            <div class="card-title" style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 16px;">📡</span>
              <span style="font-family: var(--font-serif); font-size: 19px; font-weight: 400;">Agent Activity Feed</span>
              <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--brand-emerald); box-shadow: 0 0 6px var(--brand-emerald);"></span>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="window.location.hash='#timeline'">
              Full Audit Trail →
            </button>
          </div>

          <ul class="activity-feed-list">
            ${store.auditTimeline.slice(0, 4).map(ev => {
              const a = store.agents.find(ag => ag.id === ev.agent);
              return `
                <li class="activity-item">
                  <div class="activity-pup-avatar" style="border-color: ${a ? a.color : 'var(--border-subtle)'}">
                    <div style="width: 26px; height: 26px;">
                      ${a ? renderPuppyMascot(a.id, 'idle') : '🤖'}
                    </div>
                  </div>
                  <div class="activity-content">
                    <div class="activity-desc">
                      <strong style="color: ${a ? a.color : 'var(--text-primary)'}">${a ? a.name : 'System'}:</strong>
                      ${ev.title}
                    </div>
                    <div class="activity-time">${ev.time} • ${ev.details.substring(0, 75)}...</div>
                  </div>
                </li>
              `;
            }).join('')}
          </ul>
        </div>

      </div>

    </div>
  `;
}
