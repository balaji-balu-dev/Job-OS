/**
 * ==========================================================================
 * JobOS Virtual Office View (js/views/office.js)
 * High-Fidelity 3D Simulation & Autonomous Desk Control Pods
 * Based on the attached autonomous office floorplan design
 * ==========================================================================
 */

import { store } from '../store.js';

export function renderVirtualOffice() {
  return `
    <div class="view-content-wrapper" style="display: flex; flex-direction: column;">
      
      <!-- 1. Ambient Workspace Canvas Glow & Header Bar -->
      <div class="office-workspace-canvas">
        <div class="ambient-glow-1"></div>
        <div class="ambient-glow-2"></div>

        <div class="office-telemetry-header">
          <div style="display: flex; flex-direction: column;">
            <div class="telemetry-status-strip">
              <span class="telemetry-live-dot"></span>
              <span style="font-weight: 700; color: var(--brand-emerald); text-transform: uppercase; letter-spacing: 0.08em;">
                Sub-Cluster 04 • Live Floorplan
              </span>
              <span style="color: var(--text-muted);">•</span>
              <span style="font-family: var(--font-mono); color: var(--text-secondary);">Heartbeat: 140ms</span>
              <span style="color: var(--text-muted);">•</span>
              <span style="font-weight: 700; color: var(--brand-amber); text-transform: uppercase;">0 Agent Drift Detected</span>
            </div>
            
            <h1 class="office-title-text">Autonomous Office Floorplan</h1>
            <p class="office-subtitle-text">
              Level 4 Executive Desk Pod • 7 Deterministic AI Agents operating under Human Gate Protocol
            </p>
          </div>

          <!-- View Switchers & Actions -->
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3);">
            <div class="view-switcher-group">
              <button class="view-switcher-btn active" id="tab-3d-sim" onclick="window.app.switchOfficeView('3d')">
                <span class="material-symbols-outlined" style="font-size: 18px; color: var(--brand-amber);">view_in_ar</span>
                3D Office Simulation
              </button>
              <button class="view-switcher-btn" id="tab-telemetry" onclick="window.app.switchOfficeView('telemetry')">
                <span class="material-symbols-outlined" style="font-size: 18px;">query_stats</span>
                Detailed Telemetry
              </button>
              <button class="view-switcher-btn" id="tab-compute" onclick="window.app.switchOfficeView('compute')">
                <span class="material-symbols-outlined" style="font-size: 18px;">memory</span>
                Tokens & Compute
              </button>
            </div>

            <button class="btn btn-amber" onclick="window.app.openAgentInspector('orchestrator')">
              <span class="material-symbols-outlined" style="font-size: 18px;">tune</span>
              Fleet Orchestration
            </button>
          </div>
        </div>

        <!-- Filter Chips Triage -->
        <div class="filter-chips-row">
          <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-right: 4px;">
            Filter Desks:
          </span>
          <button class="filter-chip active" data-filter="all" onclick="window.app.filterDesks('all', this)">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: currentColor;"></span>
            All Desks (7)
          </button>
          <button class="filter-chip" data-filter="active" onclick="window.app.filterDesks('active', this)">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--brand-sky);"></span>
            Active Work (4)
          </button>
          <button class="filter-chip" data-filter="gate" onclick="window.app.filterDesks('gate', this)">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--brand-amber);"></span>
            Paused at Gate (2)
          </button>
          <button class="filter-chip" data-filter="idle" onclick="window.app.filterDesks('idle', this)">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--text-muted);"></span>
            Idle / Vigilant (1)
          </button>
        </div>
      </div>

      <!-- 2. 3D VIRTUAL OFFICE VIEWPORT (Three.js Scene) -->
      <div class="threejs-viewport-container" id="office-3d-viewport">
        <div id="threejs-canvas-mount"></div>

        <!-- Overlays inside 3D Viewport -->
        <div class="viewport-overlay-dock">
          
          <!-- Top Overlay Controls (Reference Matched) -->
          <div class="viewport-top-controls">
            <div class="viewport-status-badge">
              <span style="width: 7px; height: 7px; border-radius: 50%; background-color: var(--brand-emerald); box-shadow: 0 0 8px var(--brand-emerald); flex-shrink: 0;"></span>
              <span style="font-weight: 700; color: #e2e8f0; letter-spacing: 0.02em;">Live Sub-Cluster 04: Isometric Floorplan • 7 Agents Synchronized • Zero Drift</span>
            </div>

            <div class="viewport-camera-btns">
              <button class="camera-btn active" id="btn-cam-iso" onclick="window.app.setCameraAngle('iso')">Isometric (Default)</button>
              <button class="camera-btn" id="btn-cam-orch" onclick="window.app.setCameraAngle('orch')">Orchestrator Focus</button>
              <button class="camera-btn" id="btn-cam-scout" onclick="window.app.setCameraAngle('scout')">Scout Pod</button>
              <button class="camera-btn" id="btn-cam-rotate" onclick="window.app.setCameraAngle('rotate')">Rotate 360°</button>
            </div>
          </div>

          <!-- Bottom Station Legend Bar -->
          <div class="viewport-bottom-legend">
            <span style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">
              Desk Stations:
            </span>
            <div class="station-legend-items">
              <span class="legend-pill" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border-color: rgba(245, 158, 11, 0.3);">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #fbbf24;"></span> Orchestrator
              </span>
              <span class="legend-pill" style="background: rgba(14, 165, 233, 0.15); color: #38bdf8; border-color: rgba(14, 165, 233, 0.3);">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #38bdf8;"></span> Scout
              </span>
              <span class="legend-pill" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border-color: rgba(168, 85, 247, 0.3);">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #c084fc;"></span> Job Intelligence
              </span>
              <span class="legend-pill" style="background: rgba(245, 158, 11, 0.25); color: #fbbf24; border-color: rgba(245, 158, 11, 0.5); font-weight: 700;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #fbbf24; animation: pulse-dot 1.5s infinite;"></span> Application (Gate)
              </span>
              <span class="legend-pill" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.3);">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #34d399;"></span> Verification
              </span>
              <span class="legend-pill" style="background: rgba(255, 255, 255, 0.08); color: #cbd5e1;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #cbd5e1;"></span> Email
              </span>
              <span class="legend-pill" style="background: rgba(255, 255, 255, 0.08); color: #94a3b8;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #94a3b8;"></span> Tracking
              </span>
            </div>
          </div>

        </div>
      </div>

      <!-- 3. High-Density Agent Workstation Control Pods (7 Desks Grid) -->
      <div class="desks-grid-container" id="desks-grid">
        
        <!-- DESK 01: ORCHESTRATOR PUPPY (Double Wide) -->
        <div class="desk-card-v2 desk-orchestrator-wide active-selected" data-agent="orchestrator" data-status="active" onclick="window.app.selectDesk('orchestrator', this)">
          <div>
            <div class="desk-v2-header">
              <div style="display: flex; align-items: center; gap: var(--space-3);">
                <!-- Golden Retriever Avatar -->
                <div class="puppy-avatar-box">
                  <svg class="w-10 h-10" viewBox="0 0 64 64" fill="none" style="width: 42px; height: 42px;">
                    <circle cx="32" cy="32" r="28" fill="#1A1510"></circle>
                    <path d="M14 26C14 18 20 12 32 12C44 12 50 18 50 26C50 36 44 48 32 48C20 48 14 36 14 26Z" fill="#D97706" fill-opacity="0.85"></path>
                    <ellipse cx="14" cy="30" rx="6" ry="12" fill="#B45309"></ellipse>
                    <ellipse cx="50" cy="30" rx="6" ry="12" fill="#B45309"></ellipse>
                    <ellipse cx="32" cy="38" rx="10" ry="8" fill="#FFDCC3"></ellipse>
                    <ellipse cx="32" cy="35" rx="3.5" ry="2.5" fill="#101319"></ellipse>
                    <circle cx="25" cy="27" r="3" fill="#101319"></circle>
                    <circle cx="39" cy="27" r="3" fill="#101319"></circle>
                    <circle cx="26" cy="26" r="1" fill="#FFFFFF"></circle>
                    <circle cx="40" cy="26" r="1" fill="#FFFFFF"></circle>
                    <rect x="20" y="23" width="10" height="8" rx="2" stroke="#FFB77D" stroke-width="1.5" fill="none"></rect>
                    <rect x="34" y="23" width="10" height="8" rx="2" stroke="#FFB77D" stroke-width="1.5" fill="none"></rect>
                    <line x1="30" y1="27" x2="34" y2="27" stroke="#FFB77D" stroke-width="1.5"></line>
                    <path d="M22 47C26 50 38 50 42 47L40 52C36 54 28 54 24 52L22 47Z" fill="#D97706"></path>
                    <polygon points="32,49 33,52 36,52 33.5,53.5 34.5,56 32,54 29.5,56 30.5,53.5 28,52 31,52" fill="#FFE600"></polygon>
                  </svg>
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 15px; font-weight: 700; color: var(--text-primary);">Orchestrator Puppy</span>
                    <span class="badge-audit verified" style="font-size: 10px; background: var(--brand-indigo-dim); color: var(--brand-indigo); border-color: rgba(99,102,241,0.3);">Working</span>
                  </div>
                  <p style="font-size: 12px; color: var(--text-secondary); margin-top: 1px;">The Boss • Master Command Podium & Hologram Node-01</p>
                </div>
              </div>

              <div style="text-align: right;">
                <span style="font-size: 10.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Concurrency Core</span>
                <div style="font-size: 13.5px; font-family: var(--font-mono); font-weight: 700; color: var(--brand-amber);">14 Sub-Tasks Queued</div>
              </div>
            </div>

            <!-- Directive Box -->
            <div class="desk-v2-directive-box">
              <div class="directive-badge">
                <span class="material-symbols-outlined" style="font-size: 14px;">terminal</span>
                CURRENT DIRECTIVE • Updated 4s ago
              </div>
              <p class="directive-body-text">
                Balancing Workday API crawler concurrency & routing approved Stripe payload to Verification agent.
              </p>
            </div>
          </div>

          <!-- Station Telemetry Bar -->
          <div class="station-telemetry-strip">
            <div class="telemetry-cell">
              <span class="telemetry-cell-label">Cluster Eff.</span>
              <span class="telemetry-cell-value" style="color: var(--brand-emerald);">99.4%</span>
            </div>
            <div class="telemetry-cell">
              <span class="telemetry-cell-label">Tokens Spent</span>
              <span class="telemetry-cell-value">12.4k</span>
            </div>
            <div class="telemetry-cell">
              <span class="telemetry-cell-label">Sub-Agents</span>
              <span class="telemetry-cell-value" style="color: var(--brand-amber);">6 Synchronized</span>
            </div>
          </div>
        </div>

        <!-- DESK 02: SCOUT PUPPY -->
        <div class="desk-card-v2" data-agent="scout" data-status="active" onclick="window.app.selectDesk('scout', this)">
          <div>
            <div class="desk-v2-header">
              <div style="display: flex; align-items: center; gap: var(--space-3);">
                <!-- Beagle Scout Avatar -->
                <div class="puppy-avatar-box">
                  <svg class="w-9 h-9" viewBox="0 0 64 64" fill="none" style="width: 38px; height: 38px;">
                    <circle cx="32" cy="32" r="28" fill="#111B24"></circle>
                    <path d="M16 26C16 18 22 13 32 13C42 13 48 18 48 26C48 37 42 47 32 47C22 47 16 37 16 26Z" fill="#F4F4F5"></path>
                    <path d="M12 22C10 28 11 38 16 40C18 36 17 26 15 22Z" fill="#78350F"></path>
                    <path d="M52 22C54 28 53 38 48 40C46 36 47 26 49 22Z" fill="#78350F"></path>
                    <ellipse cx="32" cy="36" rx="8" ry="6" fill="#D97706"></ellipse>
                    <ellipse cx="32" cy="34" rx="3" ry="2" fill="#101319"></ellipse>
                    <circle cx="26" cy="26" r="2.5" fill="#101319"></circle>
                    <circle cx="38" cy="26" r="2.5" fill="#101319"></circle>
                    <path d="M15 28C14 20 22 14 32 14C42 14 50 20 49 28" stroke="#38BDF8" stroke-width="2" fill="none"></path>
                    <circle cx="15" cy="28" r="3.5" fill="#38BDF8"></circle>
                    <path d="M15 28L24 37" stroke="#38BDF8" stroke-width="1.5"></path>
                    <circle cx="24" cy="37" r="1.5" fill="#FFB77D"></circle>
                  </svg>
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 14.5px; font-weight: 700; color: var(--text-primary);">Scout Puppy</span>
                    <span class="badge-audit derived" style="font-size: 10px;">Active</span>
                  </div>
                  <p style="font-size: 12px; color: var(--text-secondary);">The Explorer • Dual Radar Deck</p>
                </div>
              </div>
            </div>

            <div class="desk-v2-directive-box">
              <div class="directive-badge">Crawling Feeds</div>
              <p class="directive-body-text" style="font-size: 12.5px;">
                Crawling 18 career portals (Greenhouse, Lever, Ashby, Workday) + Naukri enterprise feed. Rapid typing.
              </p>
            </div>
          </div>

          <div style="border-top: 1px solid var(--border-subtle); padding-top: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
              <span style="color: var(--text-secondary);">Discovered Today:</span>
              <strong style="color: var(--brand-emerald); font-family: var(--font-mono);">142 Jobs</strong>
            </div>
            <div class="progress-track" style="height: 5px;">
              <div class="progress-fill" style="width: 82%; background: var(--brand-emerald);"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 10.5px; color: var(--text-muted); margin-top: 6px;">
              <span>Pending Ingest: 42</span>
              <span>8 APIs • 3 RSS</span>
            </div>
          </div>
        </div>

        <!-- DESK 03: JOB INTELLIGENCE PUPPY -->
        <div class="desk-card-v2" data-agent="intelligence" data-status="active" onclick="window.app.selectDesk('intelligence', this)">
          <div>
            <div class="desk-v2-header">
              <div style="display: flex; align-items: center; gap: var(--space-3);">
                <!-- Border Collie Analyst Avatar -->
                <div class="puppy-avatar-box">
                  <svg class="w-9 h-9" viewBox="0 0 64 64" fill="none" style="width: 38px; height: 38px;">
                    <circle cx="32" cy="32" r="28" fill="#1A1824"></circle>
                    <path d="M16 26C16 18 22 13 32 13C42 13 48 18 48 26C48 37 42 47 32 47C22 47 16 37 16 26Z" fill="#18181B"></path>
                    <path d="M26 14C28 20 28 32 24 46C30 48 34 48 40 46C36 32 36 20 38 14Z" fill="#F4F4F5"></path>
                    <circle cx="25" cy="27" r="2.5" fill="#F59E0B"></circle>
                    <circle cx="39" cy="27" r="2.5" fill="#F59E0B"></circle>
                    <circle cx="25" cy="27" r="4.5" stroke="#A78BFA" stroke-width="1.2" fill="none"></circle>
                    <circle cx="39" cy="27" r="4.5" stroke="#A78BFA" stroke-width="1.2" fill="none"></circle>
                    <line x1="29.5" y1="27" x2="34.5" y2="27" stroke="#A78BFA" stroke-width="1.2"></line>
                    <ellipse cx="32" cy="36" rx="3.5" ry="2.5" fill="#18181B"></ellipse>
                  </svg>
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 14.5px; font-weight: 700; color: var(--text-primary);">Job Intelligence</span>
                    <span class="badge-audit needs-review" style="font-size: 10px;">Thinking</span>
                  </div>
                  <p style="font-size: 12px; color: var(--text-secondary);">The Analyst • Vector Engine</p>
                </div>
              </div>
            </div>

            <div class="desk-v2-directive-box">
              <div class="directive-badge">Deconstructing JD</div>
              <p class="directive-body-text" style="font-size: 12.5px;">
                Deconstructing Stripe JD: parsing Raft/Paxos consensus vs candidate's 6 yrs open-source contributions.
              </p>
            </div>
          </div>

          <div style="border-top: 1px solid var(--border-subtle); padding-top: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
              <span style="color: var(--text-secondary);">Semantic Match:</span>
              <strong style="color: var(--brand-amber); font-family: var(--font-mono);">94.2% (0.918)</strong>
            </div>
            <div class="progress-track" style="height: 5px;">
              <div class="progress-fill" style="width: 94%; background: var(--brand-amber);"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 10.5px; color: var(--text-muted); margin-top: 6px;">
              <span>Extracted: 14 Core Skills</span>
              <span style="color: var(--brand-emerald); font-weight: 600;">0 Visa Blockers</span>
            </div>
          </div>
        </div>

        <!-- DESK 04: APPLICATION PUPPY (PAUSED AT GATE) -->
        <div class="desk-card-v2" style="border-left: 3px solid var(--brand-amber);" data-agent="application" data-status="gate" onclick="window.app.selectDesk('application', this)">
          <div>
            <div class="desk-v2-header">
              <div style="display: flex; align-items: center; gap: var(--space-3);">
                <!-- German Shepherd Avatar -->
                <div class="puppy-avatar-box">
                  <svg class="w-9 h-9" viewBox="0 0 64 64" fill="none" style="width: 38px; height: 38px;">
                    <circle cx="32" cy="32" r="28" fill="#1E1610"></circle>
                    <polygon points="18,30 22,10 30,22" fill="#78350F"></polygon>
                    <polygon points="46,30 42,10 34,22" fill="#78350F"></polygon>
                    <ellipse cx="32" cy="32" rx="14" ry="16" fill="#D97706"></ellipse>
                    <path d="M26 24C26 24 32 22 38 24C38 32 36 38 32 38C28 38 26 32 26 24Z" fill="#18181B"></path>
                    <ellipse cx="32" cy="35" rx="3.5" ry="2.5" fill="#000000"></ellipse>
                    <circle cx="27" cy="27" r="2" fill="#FFB77D"></circle>
                    <circle cx="37" cy="27" r="2" fill="#FFB77D"></circle>
                    <rect x="28" y="44" width="8" height="12" rx="1" fill="#3B82F6"></rect>
                  </svg>
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 14.5px; font-weight: 700; color: var(--text-primary);">Application Puppy</span>
                    <span class="badge-audit needs-review" style="font-size: 10px;">Gate Halt</span>
                  </div>
                  <p style="font-size: 12px; color: var(--text-secondary);">The Artisan • Drafting Table</p>
                </div>
              </div>
            </div>

            <div class="desk-v2-directive-box">
              <div class="directive-badge" style="justify-content: space-between;">
                <span style="display: flex; align-items: center; gap: 4px;">
                  <span class="material-symbols-outlined" style="font-size: 14px;">lock</span> HUMAN GATE ENFORCED
                </span>
                <span style="font-family: var(--font-mono); font-size: 10px;">GATE-8821</span>
              </div>
              <p class="directive-body-text" style="font-size: 12.5px;">
                Tailored resume and 4 custom question responses ready for Stripe. Awaiting explicit user sign-off.
              </p>
            </div>
          </div>

          <div style="margin-top: 4px;">
            <button class="btn btn-amber" style="width: 100%; font-size: 12px; padding: 7px;" onclick="event.stopPropagation(); window.location.hash='#submission-gate'">
              <span class="material-symbols-outlined" style="font-size: 16px;">fingerprint</span>
              Review Artifacts & Unlock Gate
            </button>
          </div>
        </div>

        <!-- DESK 05: VERIFICATION DESK -->
        <div class="desk-card-v2" data-agent="verification" data-status="active" onclick="window.app.selectDesk('verification', this)">
          <div>
            <div class="desk-v2-header">
              <div style="display: flex; align-items: center; gap: var(--space-3);">
                <!-- Doberman Auditor Avatar -->
                <div class="puppy-avatar-box">
                  <svg class="w-9 h-9" viewBox="0 0 64 64" fill="none" style="width: 38px; height: 38px;">
                    <circle cx="32" cy="32" r="28" fill="#131718"></circle>
                    <polygon points="20,26 23,8 29,20" fill="#1E293B"></polygon>
                    <polygon points="44,26 41,8 35,20" fill="#1E293B"></polygon>
                    <ellipse cx="32" cy="30" rx="12" ry="15" fill="#0F172A"></ellipse>
                    <circle cx="26" cy="24" r="2" fill="#D97706"></circle>
                    <circle cx="38" cy="24" r="2" fill="#D97706"></circle>
                    <circle cx="32" cy="46" r="6" fill="#00A572"></circle>
                    <path d="M30 46L31.5 47.5L34.5 44.5" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"></path>
                  </svg>
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 14.5px; font-weight: 700; color: var(--text-primary);">Verification Desk</span>
                    <span class="badge-audit verified" style="font-size: 10px;">Audited</span>
                  </div>
                  <p style="font-size: 12px; color: var(--text-secondary);">The Auditor • Truth Vault</p>
                </div>
              </div>
            </div>

            <div class="desk-v2-directive-box">
              <div class="directive-badge" style="color: var(--brand-emerald);">Audit Complete: 100% Truth</div>
              <p class="directive-body-text" style="font-size: 12.5px;">
                Truth Vault Audit complete: 100% of facts cross-verified against Profile Vault. Zero hallucinated claims.
              </p>
            </div>
          </div>

          <div style="border-top: 1px solid var(--border-subtle); padding-top: 8px; display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted);">
            <span>Hash: <strong style="color: var(--text-primary); font-family: var(--font-mono);">0x9B44F</strong></span>
            <span style="color: var(--brand-emerald); font-weight: 700;">✓ Zero Tolerance</span>
          </div>
        </div>

        <!-- DESK 06: EMAIL AGENT PUPPY -->
        <div class="desk-card-v2" data-agent="email" data-status="gate" onclick="window.app.selectDesk('email', this)">
          <div>
            <div class="desk-v2-header">
              <div style="display: flex; align-items: center; gap: var(--space-3);">
                <!-- Cocker Spaniel Avatar -->
                <div class="puppy-avatar-box">
                  <svg class="w-9 h-9" viewBox="0 0 64 64" fill="none" style="width: 38px; height: 38px;">
                    <circle cx="32" cy="32" r="28" fill="#1C1814"></circle>
                    <path d="M14 22C10 32 10 44 17 48C20 42 19 28 17 22Z" fill="#D97706"></path>
                    <path d="M50 22C54 32 54 44 47 48C44 42 45 28 47 22Z" fill="#D97706"></path>
                    <ellipse cx="32" cy="30" rx="11" ry="14" fill="#FFB77D"></ellipse>
                    <rect x="25" y="38" width="14" height="9" rx="1.5" fill="#E1E2EB"></rect>
                    <path d="M25 38L32 43L39 38" stroke="#101319" stroke-width="1"></path>
                  </svg>
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 14.5px; font-weight: 700; color: var(--text-primary);">Email Agent</span>
                    <span class="badge-audit needs-review" style="font-size: 10px;">Review Queued</span>
                  </div>
                  <p style="font-size: 12px; color: var(--text-secondary);">The Communicator • Bureau</p>
                </div>
              </div>
            </div>

            <div class="desk-v2-directive-box">
              <div class="directive-badge">Drafting Recruiter Response</div>
              <p class="directive-body-text" style="font-size: 12.5px;">
                Inbound recruiter reply drafted for Elena Vance (Coinbase). Tone: Warm, highly technical.
              </p>
            </div>
          </div>

          <div style="border-top: 1px solid var(--border-subtle); padding-top: 8px; display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted);">
            <span>Confidence: <strong style="color: var(--brand-emerald);">96%</strong></span>
            <span>Window: <strong style="color: var(--text-primary);">4 hrs</strong></span>
          </div>
        </div>

        <!-- DESK 07: TRACKING PUPPY -->
        <div class="desk-card-v2" data-agent="tracking" data-status="idle" onclick="window.app.selectDesk('tracking', this)">
          <div>
            <div class="desk-v2-header">
              <div style="display: flex; align-items: center; gap: var(--space-3);">
                <!-- Basset Hound Avatar -->
                <div class="puppy-avatar-box">
                  <svg class="w-9 h-9" viewBox="0 0 64 64" fill="none" style="width: 38px; height: 38px;">
                    <circle cx="32" cy="32" r="28" fill="#141820"></circle>
                    <ellipse cx="15" cy="38" rx="6" ry="14" fill="#78350F"></ellipse>
                    <ellipse cx="49" cy="38" rx="6" ry="14" fill="#78350F"></ellipse>
                    <ellipse cx="32" cy="32" rx="12" ry="15" fill="#E2E8F0"></ellipse>
                    <ellipse cx="32" cy="37" rx="6" ry="4.5" fill="#1E293B"></ellipse>
                    <circle cx="44" cy="18" r="5" fill="#3B82F6" fill-opacity="0.3"></circle>
                    <circle cx="44" cy="18" r="2" fill="#38BDF8"></circle>
                  </svg>
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 14.5px; font-weight: 700; color: var(--text-primary);">Tracking Puppy</span>
                    <span class="badge-audit unknown" style="font-size: 10px;">Vigilant</span>
                  </div>
                  <p style="font-size: 12px; color: var(--text-secondary);">The Watchdog • Application Radar</p>
                </div>
              </div>
            </div>

            <div class="desk-v2-directive-box">
              <div class="directive-badge" style="color: var(--text-secondary);">State: Listening</div>
              <p class="directive-body-text" style="font-size: 12.5px;">
                Monitoring 14 submitted ATS applications, tracking email receipts, and syncing calendar invites.
              </p>
            </div>
          </div>

          <div style="border-top: 1px solid var(--border-subtle); padding-top: 8px; display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted);">
            <span>Active Pipelines: <strong style="color: var(--text-primary);">6</strong></span>
            <span>Next Poll: <strong style="color: var(--brand-emerald);">2m 18s</strong></span>
          </div>
        </div>

      </div>

      <!-- 4. Deep Telemetry Inspector Panel (Interactive for Selected Desk) -->
      <div class="deep-inspector-panel" id="inspector-panel">
        <div class="inspector-header-row">
          <div class="inspector-agent-identity">
            <div class="inspector-icon-box">
              <span class="material-symbols-outlined" style="font-size: 28px;" id="inspector-icon">hub</span>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h2 style="font-size: 17px; font-weight: 800; color: var(--text-primary);" id="inspector-title">
                  Selected Desk Inspector — Orchestrator Puppy (Node-01)
                </h2>
                <span class="badge-audit verified" id="inspector-badge">Working</span>
              </div>
              <p style="font-size: 12.5px; color: var(--text-secondary); margin-top: 2px;" id="inspector-subtitle">
                Assigned Role: Fleet Commander, Concurrency Controller & Safety Dispatcher
              </p>
            </div>
          </div>

          <!-- Manual Overrides -->
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px;">
            <button class="btn btn-secondary btn-sm" onclick="window.app.showToast('Frequency Adjusted', 'Crawl frequency set to 15m polling interval.', 'info')">
              <span class="material-symbols-outlined" style="font-size: 16px;">speed</span>
              Adjust Frequency
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.app.triggerScoutCrawl()">
              <span class="material-symbols-outlined" style="font-size: 16px;">refresh</span>
              Force Instant Rescan
            </button>
            <button class="btn btn-danger btn-sm" onclick="window.app.triggerEmergencyPause()">
              <span class="material-symbols-outlined" style="font-size: 16px;">pause</span>
              Pause Node
            </button>
          </div>
        </div>

        <!-- Inspector Grid: Reasoning Log & Telemetry Sparklines -->
        <div class="inspector-grid-layout">
          
          <!-- Left: Agent Reasoning Chain (Chain of Thought Stream) -->
          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 11px; font-weight: 700; color: var(--brand-amber); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size: 16px;">psychology</span>
                Deterministic Agent Reasoning Stream (ReAct Loop)
              </span>
              <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">Live Sync: 0.1s</span>
            </div>

            <div class="react-reasoning-stream">
              <!-- Thought -->
              <div class="reasoning-item">
                <span class="reasoning-badge thought">Thought</span>
                <p class="reasoning-text" id="reasoning-thought">
                  Evaluating global crawl priority queue against token allotment for candidate profile 'Staff Distributed Systems'.
                </p>
              </div>
              <!-- Action -->
              <div class="reasoning-item">
                <span class="reasoning-badge action">Action</span>
                <p class="reasoning-text" id="reasoning-action">
                  Dispatching 4 parallel subprocesses to Job Intelligence Puppy for newly retrieved Stripe and Datadog listings.
                </p>
              </div>
              <!-- Observe -->
              <div class="reasoning-item">
                <span class="reasoning-badge observe">Observe</span>
                <p class="reasoning-text" id="reasoning-observe">
                  CPU load steady at 12%. Network jitter within 4ms bounds. Safety Gate on Desk 04 remains armed and locked.
                </p>
              </div>
            </div>

            <!-- Safe Autonomy Box -->
            <div class="safeguard-box">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined" style="color: var(--brand-emerald); font-size: 20px;">verified_user</span>
                <div>
                  <div style="font-size: 12.5px; font-weight: 700; color: var(--text-primary);">Safeguard Rule #4 Active</div>
                  <div style="font-size: 11px; color: var(--text-secondary);">Agents are restricted from POST actions without signed cryptographic token.</div>
                </div>
              </div>
              <span class="badge-audit verified" style="font-family: var(--font-mono);">STRICT_GATE</span>
            </div>
          </div>

          <!-- Right: Sparkline Chart & Ingest Activity -->
          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">
                Crawl Throughput (Last 6 Hours)
              </span>
              <span style="font-family: var(--font-mono); font-size: 13px; font-weight: 700; color: var(--brand-emerald);">2,140 RPM</span>
            </div>

            <div class="sparkline-container">
              <div style="height: 100px; width: 100%;">
                <svg viewBox="0 0 300 80" preserveAspectRatio="none" style="width: 100%; height: 100%;">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.3"></stop>
                      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"></stop>
                    </linearGradient>
                  </defs>
                  <path d="M0,60 Q30,20 60,40 T120,15 T180,35 T240,10 T300,25 L300,80 L0,80 Z" fill="url(#chartGrad)"></path>
                  <path d="M0,60 Q30,20 60,40 T120,15 T180,35 T240,10 T300,25" fill="none" stroke="#f59e0b" stroke-width="2.5"></path>
                  <circle cx="240" cy="10" r="3" fill="#f59e0b"></circle>
                </svg>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 10.5px; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 6px;">
                <span>06:00 UTC</span>
                <span>08:00 UTC</span>
                <span>10:00 UTC</span>
                <span style="color: var(--brand-amber); font-weight: 700;">Now (Peak Scan)</span>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
              <div style="background: var(--bg-surface-0); padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">HTTP 200 OK</span>
                <span style="display: block; font-family: var(--font-mono); font-weight: 700; font-size: 14px; color: var(--text-primary); margin-top: 2px;">99.88%</span>
              </div>
              <div style="background: var(--bg-surface-0); padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Ingest Latency</span>
                <span style="display: block; font-family: var(--font-mono); font-weight: 700; font-size: 14px; color: var(--brand-emerald); margin-top: 2px;">18ms</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  `;
}
