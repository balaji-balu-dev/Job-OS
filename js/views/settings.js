/**
 * ==========================================================================
 * JobOS Settings View (js/views/settings.js)
 * Autonomous boundaries, AI multi-provider & model management, and SQLite backup/restore
 * ==========================================================================
 */

import { store } from '../store.js';

export function renderSettings() {
  const creds = store.userAICredentials || {};

  return `
    <div class="view-content-wrapper" style="max-width: 960px; display: flex; flex-direction: column; gap: var(--space-5);">
      
      <!-- Settings Header -->
      <div>
        <h1 style="font-size: var(--text-2xl); font-weight: 800; letter-spacing: -0.5px; margin: 0;">Agent Controls, AI Models & Local Backups</h1>
        <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-top: 4px;">
          Configure autonomous agent boundaries, human approval gates, per-feature AI model routing, and local-first SQLite WAL backups.
        </p>
      </div>

      <!-- Autonomous Boundaries & Toggles -->
      <div class="settings-section-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
        <h3 class="card-title" style="margin: 0 0 var(--space-4) 0; font-size: var(--text-base); font-weight: 700;">
          🤖 Autonomous Agent Capabilities & Safety Gates
        </h3>

        <div class="setting-toggle-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
          <div>
            <strong style="color: var(--text-primary); font-size: var(--text-sm);">Autonomous Multi-Portal Discovery</strong>
            <p style="color: var(--text-secondary); font-size: var(--text-xs); margin: 2px 0 0 0;">
              Allow Scout to continuously crawl ATS feeds (Greenhouse, Lever, Ashby, LinkedIn, Indeed) with failure isolation.
            </p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" checked onchange="window.app.toggleSetting('autoDiscovery')">
            <span class="slider-track"></span>
          </label>
        </div>

        <div class="setting-toggle-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
          <div>
            <strong style="color: var(--text-primary); font-size: var(--text-sm);">Multi-Dimensional Fit Ranking Engine</strong>
            <p style="color: var(--text-secondary); font-size: var(--text-xs); margin: 2px 0 0 0;">
              Calculate 6-dimension fit scores and detect explicit deal-breakers for discovered roles.
            </p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" checked onchange="window.app.toggleSetting('autoAnalysis')">
            <span class="slider-track"></span>
          </label>
        </div>

        <div class="setting-toggle-row" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-top: 12px; background: rgba(245, 158, 11, 0.08); border-radius: var(--radius-md); border: 1px solid rgba(245, 158, 11, 0.25);">
          <div>
            <strong style="color: var(--brand-amber); font-size: var(--text-sm);">Mandatory Human Gate: Application Submission</strong>
            <p style="color: var(--text-secondary); font-size: var(--text-xs); margin: 2px 0 0 0;">
              ZERO automated submission. Explicit human signature token required before transmission.
            </p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" checked disabled>
            <span class="slider-track"></span>
          </label>
        </div>
      </div>

      <!-- AI Provider & Per-Feature Model Management -->
      <div class="settings-section-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); flex-wrap: wrap; gap: 8px;">
          <div>
            <h3 class="card-title" style="margin: 0; font-size: var(--text-base); font-weight: 700;">
              ⚡ AI Provider & Per-Feature Model Routing
            </h3>
            <p style="color: var(--text-secondary); font-size: var(--text-xs); margin: 2px 0 0 0;">
              Encrypted at rest with AES-256-GCM. Configure dedicated models for fast discovery vs high-reasoning review.
            </p>
          </div>
          <span class="badge" style="background: rgba(16, 185, 129, 0.12); color: var(--brand-emerald); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px;">
            ${creds.hasUserKey ? '✓ USER KEY ACTIVE' : 'SYSTEM DEFAULT KEY'}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div>
            <label class="profile-field-label" style="display: block; margin-bottom: 4px; font-size: var(--text-xs); font-weight: 700;">Primary AI Provider</label>
            <select id="settings-ai-provider" class="input-select" style="width: 100%;">
              <option value="gemini" selected>Google Gemini (Recommended)</option>
              <option value="openai">OpenAI (GPT-4o)</option>
              <option value="anthropic">Anthropic Claude</option>
              <option value="ollama">Local / Ollama Endpoint</option>
            </select>
          </div>

          <div>
            <label class="profile-field-label" style="display: block; margin-bottom: 4px; font-size: var(--text-xs); font-weight: 700;">API Key</label>
            <div style="display: flex; gap: 8px;">
              <input type="password" id="settings-ai-key-input" class="input-text" style="flex: 1; font-family: var(--font-mono); font-size: var(--text-xs);" placeholder="${creds.maskedKey || 'Enter API Key (AIza...)'}">
              <button class="btn btn-secondary btn-sm" type="button" onclick="window.app.toggleAPIKeyVisibility()">👁</button>
            </div>
          </div>
        </div>

        <!-- Per-Feature Model Routing -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 14px; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 16px;">
          <div>
            <label style="font-size: var(--text-xs); font-weight: 700; color: var(--text-primary); display: block; margin-bottom: 4px;">Discovery & Ranking Model (Fast)</label>
            <select class="input-select" style="width: 100%; font-size: var(--text-xs);">
              <option>gemini-2.5-flash (Lowest Latency, High Efficiency)</option>
              <option>gpt-4o-mini</option>
              <option>claude-3-5-haiku</option>
            </select>
          </div>

          <div>
            <label style="font-size: var(--text-xs); font-weight: 700; color: var(--text-primary); display: block; margin-bottom: 4px;">Tailoring & Reviewer Model (Reasoning)</label>
            <select class="input-select" style="width: 100%; font-size: var(--text-xs);">
              <option>gemini-2.5-pro (Complex Reasoning & Audit)</option>
              <option>claude-3-7-sonnet</option>
              <option>o3-mini</option>
            </select>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <button class="btn btn-secondary btn-sm" onclick="window.app.testCurrentAIConnection()">
            🔌 Test Connection & Latency
          </button>

          <div style="display: flex; gap: 8px;">
            ${creds.hasUserKey ? `
              <button class="btn btn-secondary btn-sm" onclick="window.app.deleteUserAPIKey()" style="color: var(--brand-rose);">
                Remove Key
              </button>
            ` : ''}
            <button class="btn btn-primary btn-sm" onclick="window.app.saveUserAPIKey()">
              Save Key & Models
            </button>
          </div>
        </div>
      </div>

      <!-- Local-First SQLite Backup & Restore -->
      <div class="settings-section-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
          <div>
            <h3 class="card-title" style="margin: 0; font-size: var(--text-base); font-weight: 700;">
              💾 Data Backups & Health
            </h3>
            <p style="color: var(--text-secondary); font-size: var(--text-xs); margin: 2px 0 0 0;">
              Local-first data privacy. One-click backup snapshots and verified archive exports.
            </p>
          </div>
          <span class="badge" id="db-integrity-badge" style="background: rgba(16, 185, 129, 0.12); color: var(--brand-emerald); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px;">
            DATABASE: HEALTHY
          </span>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap;">
          <button class="btn btn-primary btn-sm" onclick="window.app.createImmediateBackup()" style="display: flex; align-items: center; gap: 6px;">
            <span>📦</span>
            <span>Create Backup Snapshot</span>
          </button>
          <a href="/api/backup/export-encrypted" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 6px; text-decoration: none;">
            <span>🔒</span>
            <span>Export Encrypted Vault (.json)</span>
          </a>
          <button class="btn btn-secondary btn-sm" onclick="window.app.runDatabaseIntegrityCheck()">
            🔍 Run Integrity Check
          </button>
        </div>

        <div style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);">
          <strong>Storage Path:</strong> <code>data/jobos.db</code> • Mode: <code>WAL (Write-Ahead Logging)</code> • Automatic auto-migration active on boot.
        </div>
      </div>

      <!-- Real-Time Diagnostics & Database Explorer Card -->
      <div class="settings-section-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <h3 class="card-title" style="margin: 0; font-size: var(--text-base); font-weight: 700; display: flex; align-items: center; gap: 8px;">
            <span>🔬</span>
            <span>Real-Time Diagnostics & Database Explorer</span>
          </h3>
          <p style="color: var(--text-secondary); font-size: var(--text-xs); margin: 4px 0 0 0;">
            16-subsystem live health matrix, local SQLite table viewer, system log stream, and diagnostic export.
          </p>
        </div>
        <a href="#diagnostics" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px; text-decoration: none;">
          <span>Launch Diagnostics</span>
          <span>→</span>
        </a>
      </div>

    </div>
  `;
}
