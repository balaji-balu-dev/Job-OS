/**
 * ============================================================================
 * JobOS Pipeline Reports & Analytics View (js/views/reports.js)
 * Funnel conversion rates, outcome metrics, and self-contained offline HTML export
 * Modeled after reference MadsLorentzen/ai-job-search /html-report architecture
 * ============================================================================
 */

export function renderReports() {
  return `
    <div class="view-content" style="padding: 24px 32px; max-width: 1400px; margin: 0 auto;">
      
      <!-- Header Banner -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <span style="font-size: 24px;">📊</span>
            <h1 style="font-size: var(--text-2xl); font-weight: 800; color: var(--text-primary); margin: 0;">Application Funnel & Pipeline Reports</h1>
            <span class="badge" style="background: rgba(16, 185, 129, 0.12); color: var(--brand-emerald); border: 1px solid rgba(16, 185, 129, 0.3); font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight: 700;">OFFLINE SYSTEM OF RECORD</span>
          </div>
          <p style="color: var(--text-secondary); font-size: var(--text-sm); margin: 0;">
            Real-time analytics across your job discovery, tailoring conversion, interview rates, and offer outcomes.
          </p>
        </div>

        <div style="display: flex; gap: 10px;">
          <a href="/api/reports/export-html" download="jobos_pipeline_report.html" class="btn btn-primary btn-sm" style="display: flex; align-items: center; gap: 6px; text-decoration: none;">
            <span>📥</span>
            <span>Download Offline HTML Report</span>
          </a>
        </div>
      </div>

      <!-- KPI Stat Cards Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 24px;">
        
        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px;">
          <div style="font-size: var(--text-xs); color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Discovered</div>
          <div style="font-size: var(--text-3xl); font-weight: 800; color: var(--text-primary); margin-top: 4px; font-family: var(--font-mono);">18</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Across 6 portals</div>
        </div>

        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px;">
          <div style="font-size: var(--text-xs); color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Ranked ≥80%</div>
          <div style="font-size: var(--text-3xl); font-weight: 800; color: var(--brand-sky); margin-top: 4px; font-family: var(--font-mono);">14</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">78% pass rate</div>
        </div>

        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px;">
          <div style="font-size: var(--text-xs); color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Applied</div>
          <div style="font-size: var(--text-3xl); font-weight: 800; color: var(--brand-amber); margin-top: 4px; font-family: var(--font-mono);">16</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Human-signed</div>
        </div>

        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px;">
          <div style="font-size: var(--text-xs); color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Interviews</div>
          <div style="font-size: var(--text-3xl); font-weight: 800; color: var(--brand-purple); margin-top: 4px; font-family: var(--font-mono);">3</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Active stages</div>
        </div>

        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px;">
          <div style="font-size: var(--text-xs); color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Offers</div>
          <div style="font-size: var(--text-3xl); font-weight: 800; color: var(--brand-emerald); margin-top: 4px; font-family: var(--font-mono);">1</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Under negotiation</div>
        </div>

        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px;">
          <div style="font-size: var(--text-xs); color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Interview Rate</div>
          <div style="font-size: var(--text-3xl); font-weight: 800; color: var(--brand-emerald); margin-top: 4px; font-family: var(--font-mono);">18.8%</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Benchmark: 8-12%</div>
        </div>

      </div>

      <!-- Application Conversion Funnel Visualization -->
      <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
        <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: 0 0 20px 0;">Pipeline Conversion Funnel</h3>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          
          <div style="display: flex; align-items: center;">
            <div style="width: 160px; font-size: var(--text-sm); font-weight: 600; color: var(--text-primary);">1. Discovered</div>
            <div style="flex: 1; height: 28px; background: rgba(255,255,255,0.05); border-radius: 6px; overflow: hidden; margin: 0 16px;">
              <div style="width: 100%; height: 100%; background: #6366f1; border-radius: 6px; display: flex; align-items: center; padding-left: 10px; color: #fff; font-size: 11px; font-weight: 700;">100% (18 Listings)</div>
            </div>
            <div style="width: 60px; text-align: right; font-weight: 800; font-size: var(--text-sm); font-family: var(--font-mono);">18</div>
          </div>

          <div style="display: flex; align-items: center;">
            <div style="width: 160px; font-size: var(--text-sm); font-weight: 600; color: var(--text-primary);">2. Ranked ≥80%</div>
            <div style="flex: 1; height: 28px; background: rgba(255,255,255,0.05); border-radius: 6px; overflow: hidden; margin: 0 16px;">
              <div style="width: 78%; height: 100%; background: #06b6d4; border-radius: 6px; display: flex; align-items: center; padding-left: 10px; color: #fff; font-size: 11px; font-weight: 700;">78% (14 Matches)</div>
            </div>
            <div style="width: 60px; text-align: right; font-weight: 800; font-size: var(--text-sm); font-family: var(--font-mono);">14</div>
          </div>

          <div style="display: flex; align-items: center;">
            <div style="width: 160px; font-size: var(--text-sm); font-weight: 600; color: var(--text-primary);">3. Tailored & Applied</div>
            <div style="flex: 1; height: 28px; background: rgba(255,255,255,0.05); border-radius: 6px; overflow: hidden; margin: 0 16px;">
              <div style="width: 89%; height: 100%; background: #f59e0b; border-radius: 6px; display: flex; align-items: center; padding-left: 10px; color: #fff; font-size: 11px; font-weight: 700;">89% of High-Fit (16 Applications)</div>
            </div>
            <div style="width: 60px; text-align: right; font-weight: 800; font-size: var(--text-sm); font-family: var(--font-mono);">16</div>
          </div>

          <div style="display: flex; align-items: center;">
            <div style="width: 160px; font-size: var(--text-sm); font-weight: 600; color: var(--text-primary);">4. Interview Landed</div>
            <div style="flex: 1; height: 28px; background: rgba(255,255,255,0.05); border-radius: 6px; overflow: hidden; margin: 0 16px;">
              <div style="width: 18.8%; height: 100%; background: #10b981; border-radius: 6px; display: flex; align-items: center; padding-left: 10px; color: #fff; font-size: 11px; font-weight: 700;">18.8%</div>
            </div>
            <div style="width: 60px; text-align: right; font-weight: 800; font-size: var(--text-sm); font-family: var(--font-mono); color: var(--brand-emerald);">3</div>
          </div>

          <div style="display: flex; align-items: center;">
            <div style="width: 160px; font-size: var(--text-sm); font-weight: 600; color: var(--text-primary);">5. Formal Offer</div>
            <div style="flex: 1; height: 28px; background: rgba(255,255,255,0.05); border-radius: 6px; overflow: hidden; margin: 0 16px;">
              <div style="width: 6.2%; height: 100%; background: #a855f7; border-radius: 6px; display: flex; align-items: center; padding-left: 10px; color: #fff; font-size: 11px; font-weight: 700;">6.2%</div>
            </div>
            <div style="width: 60px; text-align: right; font-weight: 800; font-size: var(--text-sm); font-family: var(--font-mono); color: var(--brand-purple);">1</div>
          </div>

        </div>
      </div>

      <!-- Bottom Tables: Top Sources & Resumes -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        
        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
          <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: 0 0 14px 0;">Top Job Sources Performance</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: var(--text-xs);">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); text-align: left;">
                <th style="padding: 8px;">Source</th>
                <th style="padding: 8px;">Volume</th>
                <th style="padding: 8px;">Interview Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding: 10px 8px;">Greenhouse ATS</td><td>42</td><td><span style="color: var(--brand-emerald); font-weight: 700;">24%</span></td></tr>
              <tr><td style="padding: 10px 8px;">LinkedIn Jobs</td><td>38</td><td><span style="color: var(--brand-emerald); font-weight: 700;">19%</span></td></tr>
              <tr><td style="padding: 10px 8px;">Wellfound</td><td>14</td><td><span style="color: var(--brand-emerald); font-weight: 700;">21%</span></td></tr>
              <tr><td style="padding: 10px 8px;">Naukri Enterprise</td><td>26</td><td><span style="color: var(--brand-amber); font-weight: 700;">15%</span></td></tr>
            </tbody>
          </table>
        </div>

        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
          <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: 0 0 14px 0;">Best-Performing Resumes</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: var(--text-xs);">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); text-align: left;">
                <th style="padding: 8px;">Resume Version</th>
                <th style="padding: 8px;">Interviews</th>
                <th style="padding: 8px;">Conversion</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding: 10px 8px;">Senior Backend Systems Architect (v3.2)</td><td>2</td><td><span style="color: var(--brand-emerald); font-weight: 700;">67%</span></td></tr>
              <tr><td style="padding: 10px 8px;">Full Stack & Cloud Applications (v2.1)</td><td>1</td><td><span style="color: var(--brand-sky); font-weight: 700;">33%</span></td></tr>
            </tbody>
          </table>
        </div>

      </div>

    </div>
  `;
}
