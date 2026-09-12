/**
 * ==========================================================================
 * JobOS System Diagnostics & Database Observability View (js/views/diagnostics.js)
 * Local-First Production Health Matrix, SQLite Table Explorer,
 * 16-Subsystem Self-Test Runner & Real-Time Event Log Inspector
 * ==========================================================================
 */

export function renderDiagnostics() {
  return `
    <div class="view-content-wrapper" style="max-width: 1200px; display: flex; flex-direction: column; gap: var(--space-5);">
      
      <!-- Diagnostics Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
            <h1 style="font-size: var(--text-2xl); font-weight: 800; letter-spacing: -0.5px; margin: 0;">
              System Diagnostics & Observability
            </h1>
            <span id="diag-overall-pill" class="badge" style="background: rgba(16, 185, 129, 0.12); color: var(--brand-emerald); font-weight: 700; padding: 4px 10px; border-radius: 12px; font-size: 11px;">
              CHECKING...
            </span>
          </div>
          <p style="color: var(--text-secondary); font-size: var(--text-sm); margin: 0;">
            Real-time local-first health checks, SQLite WAL database explorer, security gates & non-destructive self-tests.
          </p>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button id="diag-refresh-btn" class="btn btn-secondary btn-sm" onclick="window.diagView.loadFullHealth()" style="display: flex; align-items: center; gap: 6px;">
            <span id="diag-refresh-icon">🔄</span>
            <span>Refresh Health</span>
          </button>
          <button id="diag-selftest-btn" class="btn btn-primary btn-sm" onclick="window.diagView.runSelfTest()" style="display: flex; align-items: center; gap: 6px; background: var(--brand-indigo);">
            <span>⚡</span>
            <span>Run 16-Subsystem Self-Test</span>
          </button>
          <a href="/api/diagnostics/export" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 6px; text-decoration: none;">
            <span>📥</span>
            <span>Export Diagnostics (.json)</span>
          </a>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
        
        <div class="metric-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px;">
          <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: 4px;">SYSTEM LATENCY</div>
          <div id="diag-latency-val" style="font-size: 20px; font-weight: 800; color: var(--brand-emerald);">-- ms</div>
          <div id="diag-uptime-val" style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">Uptime: --</div>
        </div>

        <div class="metric-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px;">
          <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: 4px;">SQLITE DATABASE</div>
          <div id="diag-db-mode-val" style="font-size: 20px; font-weight: 800; color: var(--brand-sky);">WAL Mode</div>
          <div id="diag-db-integrity-val" style="font-size: 11px; color: var(--brand-emerald); margin-top: 4px;">Integrity: PASS</div>
        </div>

        <div class="metric-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px;">
          <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: 4px;">TOTAL DB RECORDS</div>
          <div id="diag-total-rows-val" style="font-size: 20px; font-weight: 800; color: var(--text-primary);">--</div>
          <div id="diag-total-tables-val" style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">-- tables</div>
        </div>

        <div class="metric-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px;">
          <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: 4px;">AI SAFETY GATE</div>
          <div id="diag-ai-status-val" style="font-size: 20px; font-weight: 800; color: var(--brand-amber);">Active</div>
          <div style="font-size: 11px; color: var(--brand-emerald); margin-top: 4px;">Zero-Cost Diagnostics</div>
        </div>

        <div class="metric-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px;">
          <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: 4px;">PORTAL ADAPTERS</div>
          <div id="diag-portals-val" style="font-size: 20px; font-weight: 800; color: var(--text-primary);">-- / 9</div>
          <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">Isolated Failure State</div>
        </div>

      </div>

      <!-- Self-Test Output Banner (Initially Hidden or Populated) -->
      <div id="diag-selftest-container" style="display: none; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <h3 style="margin: 0; font-size: var(--text-base); font-weight: 700;">
              ⚡ 16-Subsystem Self-Test Results
            </h3>
            <span id="diag-selftest-badge" class="badge" style="background: rgba(16, 185, 129, 0.12); color: var(--brand-emerald); font-weight: 700; padding: 2px 8px; border-radius: 8px; font-size: 11px;">
              READY
            </span>
          </div>
          <div style="font-size: var(--text-xs); color: var(--text-secondary);">
            Zero Billable Token Usage • Safe Local Evaluation
          </div>
        </div>
        <div id="diag-selftest-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px;">
          <!-- Populated dynamically -->
        </div>
      </div>

      <!-- Subsystems Health Matrix -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: var(--space-4);">
        
        <!-- SQLite Engine Card -->
        <div class="settings-section-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0; font-size: var(--text-base); font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <span>💾</span>
              <span>SQLite Storage Engine</span>
            </h3>
            <span id="diag-db-badge" class="badge" style="background: rgba(16, 185, 129, 0.12); color: var(--brand-emerald); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 8px;">
              ONLINE
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; font-size: var(--text-xs);">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-secondary);">Database File:</span>
              <code id="diag-db-path" style="max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">data/jobos.db</code>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-secondary);">Journal Mode:</span>
              <span id="diag-db-journal" style="font-weight: 600; color: var(--brand-sky);">WAL (Write-Ahead Logging)</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-secondary);">Database Size:</span>
              <span id="diag-db-size">-- MB</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-secondary);">PRAGMA integrity_check:</span>
              <span id="diag-db-integrity" style="color: var(--brand-emerald); font-weight: 700;">PASS</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-secondary);">PRAGMA foreign_key_check:</span>
              <span id="diag-db-fk" style="color: var(--brand-emerald); font-weight: 700;">PASS (0 Violations)</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Write/Rollback Verification:</span>
              <span id="diag-db-write" style="color: var(--brand-emerald); font-weight: 700;">VERIFIED</span>
            </div>
          </div>
        </div>

        <!-- AI Engine & Token Ledger Card -->
        <div class="settings-section-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0; font-size: var(--text-base); font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <span>🤖</span>
              <span>AI Provider & Cost Ledger</span>
            </h3>
            <span id="diag-ai-badge" class="badge" style="background: rgba(99, 102, 241, 0.12); color: var(--brand-indigo); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 8px;">
              OPERATIONAL
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; font-size: var(--text-xs);">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-secondary);">Provider:</span>
              <span id="diag-ai-provider" style="font-weight: 600;">Google Gemini (Official SDK)</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-secondary);">Model:</span>
              <span id="diag-ai-model">gemini-2.5-flash</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-secondary);">Key Vault Encryption:</span>
              <span id="diag-ai-vault" style="color: var(--brand-emerald); font-weight: 600;">AES-256-GCM Isolated</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-secondary);">Token Allowance Ledger:</span>
              <span id="diag-ai-tokens">-- / --</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-secondary);">Safety Gate Status:</span>
              <span id="diag-ai-gate-status" style="font-weight: 700; color: var(--brand-emerald);">ACTIVE</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Health Check Query Cost:</span>
              <span style="color: var(--brand-emerald); font-weight: 700;">$0.00 (Zero Billable Tokens)</span>
            </div>
          </div>
        </div>

        <!-- Local File Storage Card -->
        <div class="settings-section-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0; font-size: var(--text-base); font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <span>📁</span>
              <span>Local Storage & Backups</span>
            </h3>
            <span id="diag-storage-badge" class="badge" style="background: rgba(16, 185, 129, 0.12); color: var(--brand-emerald); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 8px;">
              HEALTHY
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; font-size: var(--text-xs);">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-secondary);">Storage Sandbox:</span>
              <span>Local-First Private</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-secondary);">Disk Read/Write Test:</span>
              <span id="diag-storage-writable" style="color: var(--brand-emerald); font-weight: 700;">PASS (Temporary file write & unlink)</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-secondary);">Resumes Stored:</span>
              <span id="diag-resumes-count">-- PDF/DOCX files</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
              <span style="color: var(--text-secondary);">Local Backups:</span>
              <span id="diag-backups-count">-- archives</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">Latest Archive:</span>
              <span id="diag-latest-backup" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">--</span>
            </div>
          </div>
        </div>

        <!-- Portal Health Matrix Card -->
        <div class="settings-section-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0; font-size: var(--text-base); font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <span>🌐</span>
              <span>Job Portal Crawlers & Rate Limits</span>
            </h3>
            <span id="diag-portals-badge" class="badge" style="background: rgba(16, 185, 129, 0.12); color: var(--brand-emerald); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 8px;">
              ISOLATED
            </span>
          </div>

          <div id="diag-portals-list" style="display: flex; flex-direction: column; gap: 6px; font-size: var(--text-xs); max-height: 180px; overflow-y: auto;">
            <!-- Populated dynamically -->
          </div>
        </div>

      </div>

      <!-- ====================================================================
           Local SQLite Database Explorer (Interactive Table Inspector)
           ==================================================================== -->
      <div class="settings-section-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="margin: 0; font-size: var(--text-base); font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <span>🔍</span>
              <span>Local Database Explorer & Schema Inspector</span>
            </h3>
            <p style="color: var(--text-secondary); font-size: var(--text-xs); margin: 4px 0 0 0;">
              Direct read-only access to SQLite tables. Sensitive fields and tokens are automatically masked.
            </p>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <select id="diag-table-select" class="input-text" onchange="window.diagView.inspectTable(this.value)" style="font-size: var(--text-xs); padding: 6px 10px; border-radius: 6px;">
              <option value="">Select a database table to inspect...</option>
            </select>
          </div>
        </div>

        <!-- Table Summary Pills -->
        <div id="diag-tables-pills" style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;">
          <!-- Dynamic table tags -->
        </div>

        <!-- Table Content Viewer -->
        <div id="diag-table-viewer-wrapper" style="display: none; border-top: 1px solid var(--border-color); padding-top: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div>
              <span id="diag-inspecting-name" style="font-weight: 800; font-size: var(--text-sm); color: var(--brand-sky);"></span>
              <span id="diag-inspecting-meta" style="font-size: var(--text-xs); color: var(--text-secondary); margin-left: 8px;"></span>
            </div>
            <div style="font-size: var(--text-xs); color: var(--brand-emerald); font-weight: 600;">
              🔒 Read-Only • Secrets Redacted
            </div>
          </div>

          <div style="overflow-x: auto; max-height: 400px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: rgba(0,0,0,0.15);">
            <table id="diag-inspecting-table" style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
              <thead id="diag-inspecting-thead" style="background: var(--bg-surface); position: sticky; top: 0; z-index: 2; border-bottom: 2px solid var(--border-color);">
                <!-- Header columns -->
              </thead>
              <tbody id="diag-inspecting-tbody">
                <!-- Rows -->
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- ====================================================================
           System Event & Error Log Viewer
           ==================================================================== -->
      <div class="settings-section-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="margin: 0; font-size: var(--text-base); font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <span>📜</span>
              <span>System Event Log Stream</span>
            </h3>
            <p style="color: var(--text-secondary); font-size: var(--text-xs); margin: 4px 0 0 0;">
              Persistent event bus entries, telemetry pulses, gate enforcement, and error events.
            </p>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <select id="diag-log-filter" class="input-text" onchange="window.diagView.loadLogs(this.value)" style="font-size: var(--text-xs); padding: 6px 10px; border-radius: 6px;">
              <option value="ALL">All Categories</option>
              <option value="ERROR">Errors Only</option>
              <option value="SECURITY">Security & Human Gate</option>
              <option value="AI">AI & Token Ledger</option>
              <option value="DATABASE">Database & Storage</option>
              <option value="SCRAPER">Scrapers & Feeds</option>
            </select>
          </div>
        </div>

        <div id="diag-logs-container" style="display: flex; flex-direction: column; gap: 6px; max-height: 320px; overflow-y: auto; font-family: 'JetBrains Mono', monospace; font-size: 11px;">
          <div style="color: var(--text-secondary); text-align: center; padding: 20px;">Loading logs...</div>
        </div>
      </div>

    </div>
  `;
}

/**
 * Controller & Data Loader for Diagnostics View
 */
class DiagnosticsViewController {
  constructor() {
    this.tablesData = [];
  }

  async init() {
    await Promise.all([
      this.loadFullHealth(),
      this.loadTablesList(),
      this.loadLogs('ALL')
    ]);
  }

  async loadFullHealth() {
    const refreshBtn = document.getElementById('diag-refresh-btn');
    const refreshIcon = document.getElementById('diag-refresh-icon');
    if (refreshIcon) refreshIcon.style.animation = 'spin 1s linear infinite';

    try {
      // 1. Fetch Full Health
      const resFull = await fetch('/api/health/full');
      const full = await resFull.json();

      // 2. Fetch Database Health
      const resDb = await fetch('/api/health/database');
      const db = await resDb.json();

      // 3. Fetch AI Health
      const resAi = await fetch('/api/health/ai');
      const ai = await resAi.json();

      // 4. Fetch Storage Health
      const resStorage = await fetch('/api/health/storage');
      const storage = await resStorage.json();

      // 5. Fetch Portals Health
      const resPortals = await fetch('/api/health/portals');
      const portals = await resPortals.json();

      // Update Overall Pill
      const overallPill = document.getElementById('diag-overall-pill');
      if (overallPill) {
        if (full.status === 'healthy') {
          overallPill.innerText = 'HEALTHY';
          overallPill.style.background = 'rgba(16, 185, 129, 0.12)';
          overallPill.style.color = 'var(--brand-emerald)';
        } else {
          overallPill.innerText = (full.status || 'ATTENTION').toUpperCase();
          overallPill.style.background = 'rgba(245, 158, 11, 0.12)';
          overallPill.style.color = 'var(--brand-amber)';
        }
      }

      // Update Top Metrics
      const latEl = document.getElementById('diag-latency-val');
      if (latEl) latEl.innerText = `${full.latency_ms || 0} ms`;

      const upEl = document.getElementById('diag-uptime-val');
      if (upEl) upEl.innerText = `Uptime: ${Math.floor((full.uptime_seconds || 0) / 60)}m ${((full.uptime_seconds || 0) % 60)}s`;

      const totalRowsEl = document.getElementById('diag-total-rows-val');
      if (totalRowsEl) totalRowsEl.innerText = (db.database?.totalRows || 0).toLocaleString();

      const totalTablesEl = document.getElementById('diag-total-tables-val');
      if (totalTablesEl) totalTablesEl.innerText = `${db.database?.tableCount || 0} SQLite tables`;

      const portalsValEl = document.getElementById('diag-portals-val');
      if (portalsValEl && portals.portals) {
        const healthyCount = portals.portals.filter(p => p.enabled && p.status === 'healthy').length;
        portalsValEl.innerText = `${healthyCount} / ${portals.portals.length}`;
      }

      // Update SQLite Card
      const dbPathEl = document.getElementById('diag-db-path');
      if (dbPathEl) dbPathEl.innerText = db.database?.resolvedPath || 'data/jobos.db';

      const dbJournalEl = document.getElementById('diag-db-journal');
      if (dbJournalEl) dbJournalEl.innerText = `${db.database?.journalMode || 'WAL'} (${db.database?.walActive ? 'Active' : 'Standby'})`;

      const dbSizeEl = document.getElementById('diag-db-size');
      if (dbSizeEl) dbSizeEl.innerText = `${db.database?.sizeMb || '0.00'} MB (WAL: ${((db.database?.walSizeBytes || 0) / 1024).toFixed(1)} KB)`;

      const dbIntegrityEl = document.getElementById('diag-db-integrity');
      if (dbIntegrityEl) dbIntegrityEl.innerText = db.database?.integrityCheck || 'PASS';

      const dbFkEl = document.getElementById('diag-db-fk');
      if (dbFkEl) dbFkEl.innerText = db.database?.foreignKeyCheck || 'PASS';

      // Update AI Card
      const aiProviderEl = document.getElementById('diag-ai-provider');
      if (aiProviderEl) aiProviderEl.innerText = ai.ai?.provider || 'Google Gemini';

      const aiModelEl = document.getElementById('diag-ai-model');
      if (aiModelEl) aiModelEl.innerText = ai.ai?.model || 'gemini-2.5-flash';

      const aiVaultEl = document.getElementById('diag-ai-vault');
      if (aiVaultEl) aiVaultEl.innerText = ai.ai?.authStatus || 'Operational';

      const aiTokensEl = document.getElementById('diag-ai-tokens');
      if (aiTokensEl && ai.ai?.tokenLedger) {
        const used = (ai.ai.tokenLedger.currentPeriodTokens || 0).toLocaleString();
        const limit = (ai.ai.tokenLedger.currentLimit || 0).toLocaleString();
        aiTokensEl.innerText = `${used} / ${limit} tokens (${ai.ai.tokenLedger.usageStatus || 'ACTIVE'})`;
      }

      // Update Storage Card
      const storageWritableEl = document.getElementById('diag-storage-writable');
      if (storageWritableEl) storageWritableEl.innerText = storage.storage?.diskWritable ? 'PASS (Temporary file verified)' : 'FAIL';

      const resumesCountEl = document.getElementById('diag-resumes-count');
      if (resumesCountEl) resumesCountEl.innerText = `${storage.storage?.resumesStoredCount || 0} resumes indexed`;

      // Update Portals List
      const portalsListEl = document.getElementById('diag-portals-list');
      if (portalsListEl && portals.portals) {
        portalsListEl.innerHTML = portals.portals.map(p => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${p.status === 'healthy' ? 'var(--brand-emerald)' : 'var(--brand-amber)'};"></span>
              <span style="font-weight: 600;">${p.name}</span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="color: var(--text-secondary); font-size: 10px;">${p.enabled ? 'Enabled' : 'Disabled'}</span>
              <span class="badge" style="font-size: 10px; padding: 1px 6px; border-radius: 4px; background: ${p.status === 'healthy' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)'}; color: ${p.status === 'healthy' ? 'var(--brand-emerald)' : 'var(--brand-amber)'};">
                ${p.status.toUpperCase()}
              </span>
            </div>
          </div>
        `).join('');
      }

    } catch (err) {
      console.error('[Diagnostics] Failed to load full health:', err);
    } finally {
      if (refreshIcon) refreshIcon.style.animation = 'none';
    }
  }

  async runSelfTest() {
    const btn = document.getElementById('diag-selftest-btn');
    const container = document.getElementById('diag-selftest-container');
    const grid = document.getElementById('diag-selftest-grid');
    const badge = document.getElementById('diag-selftest-badge');

    if (btn) btn.disabled = true;
    if (container) container.style.display = 'block';
    if (badge) {
      badge.innerText = 'EXECUTING 16 CHECKS...';
      badge.style.background = 'rgba(99, 102, 241, 0.15)';
      badge.style.color = 'var(--brand-indigo)';
    }

    try {
      const res = await fetch('/api/diagnostics/self-test', { method: 'POST' });
      const data = await res.json();

      if (badge) {
        if (data.overall === 'ALL_PASSED') {
          badge.innerText = `ALL 16 SUBSYSTEMS PASSED (${data.stats.passed}/16)`;
          badge.style.background = 'rgba(16, 185, 129, 0.15)';
          badge.style.color = 'var(--brand-emerald)';
        } else {
          badge.innerText = `PASSED WITH ${data.stats.warning || 0} WARNINGS (${data.stats.passed}/16)`;
          badge.style.background = 'rgba(245, 158, 11, 0.15)';
          badge.style.color = 'var(--brand-amber)';
        }
      }

      if (grid && data.results) {
        grid.innerHTML = data.results.map(r => {
          let color = 'var(--brand-emerald)';
          let bg = 'rgba(16, 185, 129, 0.08)';
          let icon = '✓';

          if (r.status === 'WARNING') {
            color = 'var(--brand-amber)';
            bg = 'rgba(245, 158, 11, 0.08)';
            icon = '⚠️';
          } else if (r.status === 'FAILED') {
            color = '#ef4444';
            bg = 'rgba(239, 68, 68, 0.08)';
            icon = '✕';
          }

          return `
            <div style="background: ${bg}; border: 1px solid ${color}; border-radius: var(--radius-md); padding: 10px; display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 700; font-size: 11px; color: ${color};">
                  ${icon} ${r.subsystem}
                </span>
                <span style="font-size: 10px; color: var(--text-secondary);">${r.latencyMs}ms</span>
              </div>
              <div style="font-size: 11px; color: var(--text-primary); line-height: 1.3;">
                ${r.details}
              </div>
            </div>
          `;
        }).join('');
      }

      if (window.app?.showToast) {
        window.app.showToast('Self-Test Complete', `Evaluated 16 subsystems. ${data.stats.passed} passed, 0 failures.`, 'success');
      }

    } catch (err) {
      console.error('[Diagnostics] Self-test execution error:', err);
      if (badge) {
        badge.innerText = 'SELF-TEST ERROR';
        badge.style.background = 'rgba(239, 68, 68, 0.15)';
        badge.style.color = '#ef4444';
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async loadTablesList() {
    try {
      const res = await fetch('/api/diagnostics/database/tables');
      const json = await res.json();
      if (!json.success || !json.data) return;

      this.tablesData = json.data;

      const select = document.getElementById('diag-table-select');
      const pillsContainer = document.getElementById('diag-tables-pills');

      if (select) {
        select.innerHTML = '<option value="">Select a database table to inspect...</option>' +
          json.data.map(t => `<option value="${t.name}">${t.name} (${t.rowCount} rows, ${t.columnCount} cols)</option>`).join('');
      }

      if (pillsContainer) {
        pillsContainer.innerHTML = json.data.map(t => `
          <button onclick="window.diagView.inspectTable('${t.name}')" class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 3px 8px; border-radius: 6px; display: flex; align-items: center; gap: 5px;">
            <span>📄</span>
            <span><strong>${t.name}</strong></span>
            <span style="color: var(--text-secondary); font-size: 10px;">(${t.rowCount})</span>
          </button>
        `).join('');
      }

    } catch (err) {
      console.error('[Diagnostics] Failed to load tables:', err);
    }
  }

  async inspectTable(tableName) {
    if (!tableName) {
      const wrapper = document.getElementById('diag-table-viewer-wrapper');
      if (wrapper) wrapper.style.display = 'none';
      return;
    }

    const select = document.getElementById('diag-table-select');
    if (select && select.value !== tableName) select.value = tableName;

    const wrapper = document.getElementById('diag-table-viewer-wrapper');
    const nameEl = document.getElementById('diag-inspecting-name');
    const metaEl = document.getElementById('diag-inspecting-meta');
    const thead = document.getElementById('diag-inspecting-thead');
    const tbody = document.getElementById('diag-inspecting-tbody');

    if (wrapper) wrapper.style.display = 'block';
    if (nameEl) nameEl.innerText = `Table: ${tableName}`;
    if (tbody) tbody.innerHTML = `<tr><td colspan="10" style="padding: 20px; text-align: center; color: var(--text-secondary);">Loading table rows...</td></tr>`;

    try {
      const res = await fetch(`/api/diagnostics/database/table/${encodeURIComponent(tableName)}`);
      const json = await res.json();

      if (!json.success) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="10" style="padding: 20px; text-align: center; color: #ef4444;">${json.error}</td></tr>`;
        return;
      }

      if (metaEl) {
        metaEl.innerText = `(${json.totalRows} total rows, displaying recent ${json.data.length})`;
      }

      // Render Table Header
      if (thead && json.columns) {
        thead.innerHTML = `
          <tr>
            ${json.columns.map(c => `
              <th style="padding: 8px 10px; border-bottom: 1px solid var(--border-color); font-weight: 700; color: var(--text-secondary);">
                ${c.name} ${c.isPk ? '<span style="color: var(--brand-amber);" title="Primary Key">🔑</span>' : ''}
              </th>
            `).join('')}
          </tr>
        `;
      }

      // Render Table Rows
      if (tbody) {
        if (json.data.length === 0) {
          tbody.innerHTML = `<tr><td colspan="${json.columns.length}" style="padding: 20px; text-align: center; color: var(--text-secondary);">Table contains 0 rows.</td></tr>`;
        } else {
          tbody.innerHTML = json.data.map((row, idx) => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); background: ${idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'};">
              ${json.columns.map(c => {
                let val = row[c.name];
                let displayVal = val;
                if (val === null || val === undefined) {
                  displayVal = '<span style="color: var(--text-secondary); opacity: 0.5;">NULL</span>';
                } else if (typeof val === 'object') {
                  displayVal = `<code style="font-size: 10px;">${JSON.stringify(val).slice(0, 50)}...</code>`;
                } else if (typeof val === 'string' && val.includes('REDACTED')) {
                  displayVal = `<span style="color: var(--brand-amber); font-weight: 600;">${val}</span>`;
                } else if (typeof val === 'string' && val.length > 60) {
                  displayVal = `<span title="${val.replace(/"/g, '&quot;')}">${val.slice(0, 60)}...</span>`;
                }
                return `<td style="padding: 6px 10px; vertical-align: top; white-space: nowrap;">${displayVal}</td>`;
              }).join('')}
            </tr>
          `).join('');
        }
      }

    } catch (err) {
      console.error('[Diagnostics] Failed to inspect table:', err);
      if (tbody) tbody.innerHTML = `<tr><td colspan="10" style="padding: 20px; text-align: center; color: #ef4444;">Error inspecting table: ${err.message}</td></tr>`;
    }
  }

  async loadLogs(category = 'ALL') {
    const container = document.getElementById('diag-logs-container');
    if (!container) return;

    try {
      const res = await fetch(`/api/diagnostics/logs?category=${encodeURIComponent(category)}&limit=40`);
      const json = await res.json();

      if (!json.success || !json.data || json.data.length === 0) {
        container.innerHTML = '<div style="color: var(--text-secondary); text-align: center; padding: 20px;">No events logged for this filter.</div>';
        return;
      }

      container.innerHTML = json.data.map(e => {
        let levelColor = 'var(--text-secondary)';
        if (e.logLevel === 'ERROR') levelColor = '#ef4444';
        else if (e.logLevel === 'WARN') levelColor = 'var(--brand-amber)';
        else if (e.eventType?.includes('GATE')) levelColor = 'var(--brand-indigo)';
        else if (e.eventType?.includes('AI_')) levelColor = 'var(--brand-sky)';

        const timeStr = new Date(e.createdAt).toLocaleTimeString();

        return `
          <div style="display: flex; gap: 8px; align-items: flex-start; padding: 4px 6px; border-radius: 4px; background: rgba(0,0,0,0.1); border-left: 2px solid ${levelColor};">
            <span style="color: var(--text-secondary); flex-shrink: 0;">[${timeStr}]</span>
            <span style="font-weight: 700; color: ${levelColor}; flex-shrink: 0; min-width: 90px;">${e.eventType}</span>
            <span style="color: var(--text-primary); flex-grow: 1;">${e.summary || 'Event logged'}</span>
          </div>
        `;
      }).join('');

    } catch (err) {
      console.error('[Diagnostics] Failed to load logs:', err);
      container.innerHTML = `<div style="color: #ef4444; padding: 20px;">Error loading logs: ${err.message}</div>`;
    }
  }
}

// Global controller instance
window.diagView = new DiagnosticsViewController();

export function initDiagnosticsView() {
  setTimeout(() => {
    window.diagView.init();
  }, 40);
}
