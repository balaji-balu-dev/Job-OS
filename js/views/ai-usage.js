/**
 * ==========================================================================
 * JobOS AI Token Usage & Safety Protection View (js/views/ai-usage.js)
 * Live token meter, fail-safe pause/resume, safety limits & execution ledger
 * ==========================================================================
 */

import { store } from '../store.js';

export function renderAIUsage() {
  const u = store.aiUsage || {
    status: 'ACTIVE',
    tokensUsed: 6320,
    promptTokens: 5080,
    completionTokens: 1240,
    tokenLimit: 100000,
    remainingTokens: 93680,
    usagePercentage: 6.3,
    estimatedCostUsd: 0.000752,
    periodType: 'MONTHLY',
    resetsIn: '18d 23h 15m',
    isManuallyPaused: false,
    isAutoPaused: false,
    warningThresholdPct: 80.0,
    hardStopThresholdPct: 100.0,
    costLimitUsd: 5.00,
    ledger: []
  };

  const pct = Math.min(100, Math.max(0, u.usagePercentage || 0));
  
  // Status style determination
  let statusBadgeClass = 'active';
  let statusLabel = 'ACTIVE';
  let barColor = 'var(--brand-emerald)';

  if (u.isManuallyPaused) {
    statusBadgeClass = 'paused';
    statusLabel = 'PAUSED (MANUAL)';
    barColor = 'var(--brand-sky)';
  } else if (u.isAutoPaused || u.status === 'LIMIT_REACHED') {
    statusBadgeClass = 'limit';
    statusLabel = 'LIMIT REACHED (AUTO-PAUSED)';
    barColor = 'var(--brand-rose)';
  } else if (u.status === 'WARNING' || pct >= u.warningThresholdPct) {
    statusBadgeClass = 'warning';
    statusLabel = `WARNING (${pct}%)`;
    barColor = 'var(--brand-amber)';
  }

  const isPaused = u.isManuallyPaused || u.isAutoPaused;

  return `
    <div class="view-content-wrapper" style="max-width: 1080px; display: flex; flex-direction: column; gap: var(--space-5);">
      
      <!-- Top Title Bar -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-3);">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <h1 style="font-size: var(--text-2xl); font-weight: 800; letter-spacing: -0.02em;">AI Token Usage & Limit Protection</h1>
            <span class="ai-status-pill ${statusBadgeClass}">${statusLabel}</span>
          </div>
          <p style="color: var(--text-secondary); font-size: 13.5px; margin-top: 4px;">
            Live token accounting, automated budget protection, and server-side fail-safe enforcement.
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: var(--space-2);">
          <button class="btn btn-secondary btn-sm" onclick="window.app.openAIConfigModal()">
            <span class="material-symbols-outlined" style="font-size: 16px;">tune</span>
            Configure Limits
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.app.refreshAIUsage()">
            <span class="material-symbols-outlined" style="font-size: 16px;">refresh</span>
            Refresh
          </button>
          ${isPaused ? `
            <button class="btn btn-emerald btn-sm" onclick="window.app.toggleAIUsagePause(false)">
              <span class="material-symbols-outlined" style="font-size: 16px;">play_arrow</span>
              Resume AI Usage
            </button>
          ` : `
            <button class="btn btn-danger btn-sm" onclick="window.app.toggleAIUsagePause(true)">
              <span class="material-symbols-outlined" style="font-size: 16px;">pause_circle</span>
              Pause AI Usage
            </button>
          `}
        </div>
      </div>

      <!-- Warning / Pause Alert Banner if triggered -->
      ${isPaused ? `
        <div style="background: rgba(244, 63, 94, 0.12); border: 1px solid var(--brand-rose); border-radius: var(--radius-lg); padding: var(--space-4); display: flex; align-items: flex-start; gap: var(--space-3);">
          <span class="material-symbols-outlined" style="color: var(--brand-rose); font-size: 24px;">shield_locked</span>
          <div style="flex: 1;">
            <strong style="color: var(--brand-rose); font-size: 14px;">
              ${u.isManuallyPaused ? 'AI Usage Manually Paused' : 'Automatic Protection Triggered: Safety Limit Reached'}
            </strong>
            <p style="color: var(--text-primary); font-size: 13px; margin-top: 2px;">
              ${u.isManuallyPaused 
                ? 'All non-essential AI API calls are currently blocked. You can still manually view, edit, and submit applications. Click "Resume AI Usage" when ready.' 
                : `Token consumption reached your safety threshold (${u.tokensUsed.toLocaleString()} / ${u.tokenLimit.toLocaleString()}). AI calls are safely paused until the billing period resets or you increase your limit.`}
            </p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.app.toggleAIUsagePause(${!u.isManuallyPaused})" style="shrink: 0;">
            ${u.isManuallyPaused ? 'Resume Now' : 'Adjust Limits'}
          </button>
        </div>
      ` : (pct >= u.warningThresholdPct ? `
        <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid var(--brand-amber); border-radius: var(--radius-lg); padding: var(--space-4); display: flex; align-items: center; gap: var(--space-3);">
          <span class="material-symbols-outlined" style="color: var(--brand-amber); font-size: 24px;">warning</span>
          <div style="flex: 1;">
            <strong style="color: var(--brand-amber); font-size: 14px;">Approaching Safety Limit: ${pct}% Consumed</strong>
            <p style="color: var(--text-secondary); font-size: 13px; margin-top: 2px;">
              ${u.remainingTokens.toLocaleString()} tokens remaining in this ${u.periodType.toLowerCase()} period before automatic protection halts calls.
            </p>
          </div>
        </div>
      ` : '')}

      <!-- Credential Attribution & Direct Provider Billing Indicator -->
      <div style="background: var(--bg-surface-0); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 18px;">🔑</span>
          <div>
            <div style="font-size: var(--text-xs); font-weight: 700; color: var(--text-primary);">
              ${store.userAICredentials?.hasUserKey ? `Personal API Key Active (${store.userAICredentials.maskedKey})` : 'System Default Provider Active'}
            </div>
            <div style="font-size: 11px; color: var(--text-secondary);">
              ${store.userAICredentials?.hasUserKey ? 'Token costs are billed directly to your provider account. Application limits act as your personal circuit breaker.' : 'Using the pre-configured system key. Application budget limits apply.'}
            </div>
          </div>
        </div>
        <a href="#settings" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 4px 8px;">
          ⚙️ Manage Key
        </a>
      </div>

      <!-- Main Live Visual Gauge Card -->
      <div class="settings-section-card" style="padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-4);">
        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">
              Current Allowance Period (${u.periodType})
            </span>
            <div style="display: flex; align-items: baseline; gap: 10px; margin-top: 4px;">
              <span style="font-size: 32px; font-weight: 800; font-family: var(--font-heading); color: var(--text-primary); letter-spacing: -0.02em;">
                ${u.tokensUsed.toLocaleString()}
              </span>
              <span style="font-size: 18px; color: var(--text-muted); font-weight: 600;">
                / ${u.tokenLimit.toLocaleString()} tokens
              </span>
            </div>
          </div>

          <div style="text-align: right;">
            <span style="font-size: 28px; font-weight: 800; font-family: var(--font-mono); color: ${barColor};">
              ${pct}%
            </span>
            <span style="display: block; font-size: 11.5px; color: var(--text-secondary);">
              ${u.remainingTokens.toLocaleString()} remaining
            </span>
          </div>
        </div>

        <!-- Visual Progress Bar -->
        <div style="position: relative; width: 100%; height: 16px; background: var(--bg-surface-2); border-radius: 9999px; overflow: hidden; border: 1px solid var(--border-subtle);">
          <div style="height: 100%; width: ${pct}%; background: ${barColor}; transition: width 0.4s ease; border-radius: 9999px;"></div>
        </div>

        <!-- Gauge Subtext & Legend -->
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); font-family: var(--font-mono);">
          <span>0 tokens</span>
          <span>Warning (${u.warningThresholdPct}%)</span>
          <span>Hard Stop (100%): ${u.tokenLimit.toLocaleString()} tokens</span>
        </div>
      </div>

      <!-- 4 Telemetry Metrics Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-4);">
        <!-- Prompt / Input Tokens -->
        <div class="card" style="padding: var(--space-4); display: flex; flex-direction: column; gap: 4px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Prompt / Input Tokens</span>
          <span style="font-size: 22px; font-weight: 800; font-family: var(--font-mono); color: var(--text-primary); margin-top: 4px;">
            ${(u.promptTokens || 0).toLocaleString()}
          </span>
          <span style="font-size: 11px; color: var(--brand-sky);">Context & Job Descriptions</span>
        </div>

        <!-- Completion / Output Tokens -->
        <div class="card" style="padding: var(--space-4); display: flex; flex-direction: column; gap: 4px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Completion / Output Tokens</span>
          <span style="font-size: 22px; font-weight: 800; font-family: var(--font-mono); color: var(--text-primary); margin-top: 4px;">
            ${(u.completionTokens || 0).toLocaleString()}
          </span>
          <span style="font-size: 11px; color: var(--brand-emerald);">Generated Answers & Analyses</span>
        </div>

        <!-- Estimated Cost -->
        <div class="card" style="padding: var(--space-4); display: flex; flex-direction: column; gap: 4px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Estimated Billing Cost</span>
          <span style="font-size: 22px; font-weight: 800; font-family: var(--font-mono); color: var(--brand-amber); margin-top: 4px;">
            $${(u.estimatedCostUsd || 0.0).toFixed(4)}
          </span>
          <span style="font-size: 11px; color: var(--text-secondary);">Cap: $${(u.costLimitUsd || 5.0).toFixed(2)} USD</span>
        </div>

        <!-- Period Reset Timer -->
        <div class="card" style="padding: var(--space-4); display: flex; flex-direction: column; gap: 4px;">
          <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Allowance Resets In</span>
          <span style="font-size: 20px; font-weight: 800; font-family: var(--font-mono); color: var(--text-primary); margin-top: 4px;">
            ${u.resetsIn || 'Active'}
          </span>
          <span style="font-size: 11px; color: var(--text-secondary);">${u.periodType} cycle auto-roll</span>
        </div>
      </div>

      <!-- Execution Audit Ledger Table -->
      <div class="settings-section-card" style="padding: var(--space-5);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4);">
          <h3 class="card-title" style="display: flex; align-items: center; gap: 8px;">
            <span class="material-symbols-outlined" style="color: var(--brand-amber); font-size: 20px;">history</span>
            Live AI Request Audit Ledger
          </h3>
          <span style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted);">
            Authoritative Provider Accounting
          </span>
        </div>

        <div style="overflow-x: auto;">
          <table class="ai-ledger-table" style="width: 100%; border-collapse: collapse; font-size: 12.5px; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 11px; text-transform: uppercase;">
                <th style="padding: 10px 8px;">Time</th>
                <th style="padding: 10px 8px;">Agent</th>
                <th style="padding: 10px 8px;">Operation</th>
                <th style="padding: 10px 8px;">Model</th>
                <th style="padding: 10px 8px; text-align: right;">Input</th>
                <th style="padding: 10px 8px; text-align: right;">Output</th>
                <th style="padding: 10px 8px; text-align: right;">Total Tokens</th>
                <th style="padding: 10px 8px; text-align: right;">Cost (USD)</th>
                <th style="padding: 10px 8px; text-align: center;">Accounting</th>
              </tr>
            </thead>
            <tbody>
              ${u.ledger && u.ledger.length > 0 ? u.ledger.map(row => `
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding: 10px 8px; font-family: var(--font-mono); color: var(--text-secondary); white-space: nowrap;">
                    ${new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td style="padding: 10px 8px; font-weight: 600; color: var(--text-primary);">
                    ${row.agentId}
                  </td>
                  <td style="padding: 10px 8px; font-family: var(--font-mono); color: var(--brand-amber);">
                    ${row.operation}
                  </td>
                  <td style="padding: 10px 8px; font-family: var(--font-mono); color: var(--text-muted);">
                    ${row.model}
                  </td>
                  <td style="padding: 10px 8px; text-align: right; font-family: var(--font-mono);">
                    ${row.promptTokens.toLocaleString()}
                  </td>
                  <td style="padding: 10px 8px; text-align: right; font-family: var(--font-mono);">
                    ${row.completionTokens.toLocaleString()}
                  </td>
                  <td style="padding: 10px 8px; text-align: right; font-family: var(--font-mono); font-weight: 700; color: var(--text-primary);">
                    ${row.totalTokens.toLocaleString()}
                  </td>
                  <td style="padding: 10px 8px; text-align: right; font-family: var(--font-mono); color: var(--brand-emerald);">
                    $${Number(row.estimatedCostUsd || 0).toFixed(5)}
                  </td>
                  <td style="padding: 10px 8px; text-align: center;">
                    <span class="badge-audit ${row.isAuthoritative ? 'verified' : 'derived'}" style="font-size: 10px;">
                      ${row.isAuthoritative ? 'VERIFIED API' : 'ESTIMATED'}
                    </span>
                  </td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="9" style="padding: 24px; text-align: center; color: var(--text-muted);">
                    No AI requests logged in this period yet.
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}
