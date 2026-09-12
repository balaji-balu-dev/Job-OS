/**
 * ============================================================================
 * JobOS Email & Recruiter Signals View (js/views/email-sync.js)
 * Triage queue for inbound application emails with human sign-off before state changes
 * Modeled after reference MadsLorentzen/ai-job-search /gmail-sync architecture
 * ============================================================================
 */

export function renderEmailSync() {
  return `
    <div class="view-content" style="padding: 24px 32px; max-width: 1300px; margin: 0 auto;">
      
      <!-- Header Banner -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <span style="font-size: 24px;">📬</span>
            <h1 style="font-size: var(--text-2xl); font-weight: 800; color: var(--text-primary); margin: 0;">Email & Recruiter Signal Triage</h1>
            <span class="badge" style="background: rgba(245, 158, 11, 0.12); color: var(--brand-amber); border: 1px solid rgba(245, 158, 11, 0.3); font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight: 700;">HUMAN SIGN-OFF REQUIRED</span>
          </div>
          <p style="color: var(--text-secondary); font-size: var(--text-sm); margin: 0;">
            The Email Agent scans recruiter replies, interview invites, assessment links, and status changes. No pipeline status is ever modified without your explicit approval.
          </p>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary btn-sm" onclick="window.app.syncEmailsNow()" style="display: flex; align-items: center; gap: 6px;">
            <span>🔄</span>
            <span>Check Inbox Now</span>
          </button>
        </div>
      </div>

      <!-- Signals Queue List -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        
        <!-- Action Required Signal Card -->
        <div class="card" style="background: var(--bg-surface); border: 1px solid rgba(245, 158, 11, 0.3); border-left: 4px solid var(--brand-amber); border-radius: var(--radius-lg); padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span class="badge" style="background: rgba(245, 158, 11, 0.15); color: var(--brand-amber); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px;">INTERVIEW INVITATION DETECTED</span>
                <span style="font-size: var(--text-xs); color: var(--text-secondary);">Confidence: 98%</span>
                <span style="font-size: var(--text-xs); color: var(--text-secondary);">• Today at 10:14 AM</span>
              </div>
              <h3 style="font-size: var(--text-lg); font-weight: 700; color: var(--text-primary); margin: 0;">Datadog — Interview Invitation: Senior Systems Engineer</h3>
              <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px;">From: Sarah Miller &lt;sarah.miller@datadog.com&gt;</div>
            </div>

            <div style="display: flex; align-items: center; gap: 10px;">
              <button class="btn btn-secondary btn-sm" onclick="window.app.rejectEmailSignal('sig-datadog-invite')">Dismiss / Ignore</button>
              <button class="btn btn-primary btn-sm" onclick="window.app.approveEmailSignal('sig-datadog-invite', 'Technical Round 1 (Live Coding)')" style="background: var(--brand-emerald); border-color: var(--brand-emerald);">
                <span>✓</span>
                <span>Approve: Move to Technical Round 1</span>
              </button>
            </div>
          </div>

          <!-- Snippet Box -->
          <div style="padding: 12px 16px; background: rgba(0,0,0,0.25); border-radius: 8px; border: 1px solid var(--border-color); font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-primary); line-height: 1.6; margin-bottom: 12px;">
            "Hi Balaji, thanks for your patience. The engineering team was very impressed by your distributed systems background and we would like to schedule a 60-min technical round to discuss high-concurrency event pipelines. Please click below to pick a slot on my calendar..."
          </div>

          <!-- Target Pipeline Card -->
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--text-xs); color: var(--text-secondary); background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 6px;">
            <span>Target Application: <strong>Datadog (app-datadog)</strong></span>
            <span>Current Status: <strong style="color: var(--brand-sky);">Applied (14d ago)</strong> → Proposed Status: <strong style="color: var(--brand-emerald);">Technical Round 1</strong></span>
          </div>
        </div>

        <!-- Approved History Signal Card -->
        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px; opacity: 0.85;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span class="badge" style="background: rgba(16, 185, 129, 0.12); color: var(--brand-emerald); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px;">STATUS CONFIRMED</span>
                <span style="font-size: var(--text-xs); color: var(--text-secondary);">Yesterday at 4:32 PM</span>
              </div>
              <div style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary);">Stripe — Application Received: Staff Platform Engineer</div>
              <div style="font-size: var(--text-xs); color: var(--text-secondary);">From: talent-ops@stripe.com</div>
            </div>

            <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: var(--brand-emerald); font-size: 11px;">Applied to Pipeline</span>
          </div>

          <div style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5;">
            "We have received your application for Staff Platform Engineer. Our team is actively reviewing your qualifications."
          </div>
        </div>

      </div>

    </div>
  `;
}
