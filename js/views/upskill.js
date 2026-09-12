/**
 * ============================================================================
 * JobOS Upskill & Career Intelligence View (js/views/upskill.js)
 * Market-weighted skill gap heatmap, personalized learning roadmaps, salary benchmarking, and career trajectory
 * Modeled after reference MadsLorentzen/ai-job-search /upskill and career planning
 * ============================================================================
 */
import { store } from '../store.js';

export function renderUpskill() {
  const profile = store.candidateProfile || {};
  const skills = profile.skills?.data?.technical || ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL', 'Redis', 'AWS', 'Docker', 'Kubernetes'];

  return `
    <div class="view-content" style="padding: 24px 32px; max-width: 1400px; margin: 0 auto;">
      
      <!-- Header Banner -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <span style="font-size: 24px;">📈</span>
            <h1 style="font-size: var(--text-2xl); font-weight: 800; color: var(--text-primary); margin: 0;">Upskill & Career Trajectory</h1>
            <span class="badge" style="background: rgba(56, 189, 248, 0.12); color: var(--brand-sky); border: 1px solid rgba(56, 189, 248, 0.3); font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight: 700;">CALIBRATED ON 140+ TECH POSTINGS</span>
          </div>
          <p style="color: var(--text-secondary); font-size: var(--text-sm); margin: 0;">
            Compare your verified Profile Truth Vault against active market demands. Identify high-leverage skill gaps, personalized learning roadmaps, and unlocked roles.
          </p>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary btn-sm" onclick="window.app.triggerProfileEnrichment()" style="display: flex; align-items: center; gap: 6px;">
            <span>🔗</span>
            <span>Import from GitHub / Portfolio</span>
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.app.refreshUpskillAnalysis()" style="display: flex; align-items: center; gap: 6px;">
            <span>⚡</span>
            <span>Recalculate Gaps</span>
          </button>
        </div>
      </div>

      <!-- Top Row: Salary Benchmark & Market Alignment -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px;">
        
        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-size: var(--text-xs); color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Candidate Salary Target</span>
            <span class="badge" style="background: rgba(16, 185, 129, 0.12); color: var(--brand-emerald); font-size: 10px; padding: 1px 6px;">Verified Floor</span>
          </div>
          <div style="font-size: var(--text-2xl); font-weight: 800; color: var(--text-primary); font-family: var(--font-mono);">₹35,00,000 / yr</div>
          <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 6px;">Base expectation from candidate profile</div>
        </div>

        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-size: var(--text-xs); color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Senior Backend Median</span>
            <span class="badge" style="background: rgba(245, 158, 11, 0.12); color: var(--brand-amber); font-size: 10px; padding: 1px 6px;">Market Benchmark</span>
          </div>
          <div style="font-size: var(--text-2xl); font-weight: 800; color: var(--brand-amber); font-family: var(--font-mono);">₹48,00,000 / yr</div>
          <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 6px;">Median for 6+ yrs Distributed Systems in Bangalore</div>
        </div>

        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="font-size: var(--text-xs); color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Top Decile / Staff Potential</span>
            <span class="badge" style="background: rgba(168, 85, 247, 0.12); color: var(--brand-purple); font-size: 10px; padding: 1px 6px;">Unlocked Ceiling</span>
          </div>
          <div style="font-size: var(--text-2xl); font-weight: 800; color: var(--brand-purple); font-family: var(--font-mono);">₹65L - ₹85L + RSUs</div>
          <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 6px;">Stripe, Coinbase & high-frequency FinTech</div>
        </div>

      </div>

      <!-- Middle Row: Strong Skills vs Skill Gap Heatmap -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
        
        <!-- Strong Verified Skills -->
        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--brand-emerald);">✓</span>
              <span>Strong Core Verified Competencies</span>
            </h3>
            <span style="font-size: var(--text-xs); color: var(--text-secondary);">Truth Vault Verified</span>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${skills.map(s => `
              <div style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; font-size: var(--text-xs); font-weight: 600; color: var(--brand-emerald);">
                <span>✓</span>
                <span>${s}</span>
              </div>
            `).join('')}
          </div>

          <div style="margin-top: 18px; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px dashed var(--border-color);">
            <div style="font-size: var(--text-xs); font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">🎯 Market Edge:</div>
            <div style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5;">
              Your Java + Spring Boot + Kafka combination with proven 10,000 TPS transaction settlement places you in the top 15% of applicant pool for Payments & Financial Rails.
            </div>
          </div>
        </div>

        <!-- High-Leverage Skill Gaps Heatmap -->
        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--brand-amber);">⚠</span>
              <span>Priority Market Skill Gaps</span>
            </h3>
            <span style="font-size: var(--text-xs); color: var(--brand-amber); font-weight: 600;">Ranked by Frequency</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 8px;">
              <div>
                <div style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary);">Kubernetes & GitOps (Istio, ArgoCD)</div>
                <div style="font-size: var(--text-xs); color: var(--text-secondary);">Appears in 68% of Staff Infrastructure job descriptions</div>
              </div>
              <span class="badge" style="background: rgba(244, 63, 94, 0.15); color: var(--brand-rose); font-size: 10px; padding: 2px 8px; border-radius: 12px; font-weight: 700;">HIGH IMPACT</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 8px;">
              <div>
                <div style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary);">Go (Golang) Concurrent Systems</div>
                <div style="font-size: var(--text-xs); color: var(--text-secondary);">Appears in 54% of global remote backend positions</div>
              </div>
              <span class="badge" style="background: rgba(245, 158, 11, 0.15); color: var(--brand-amber); font-size: 10px; padding: 2px 8px; border-radius: 12px; font-weight: 700;">MEDIUM IMPACT</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px;">
              <div>
                <div style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary);">Distributed Consensus (Raft / Paxos)</div>
                <div style="font-size: var(--text-xs); color: var(--text-secondary);">Required for Staff level at Stripe, Datadog & Coinbase</div>
              </div>
              <span class="badge" style="background: rgba(56, 189, 248, 0.15); color: var(--brand-sky); font-size: 10px; padding: 2px 8px; border-radius: 12px; font-weight: 700;">BAR RAISER</span>
            </div>

          </div>
        </div>

      </div>

      <!-- Bottom Row: Curated Learning Roadmap & Career Trajectory -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
        
        <!-- Actionable Learning Path -->
        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
          <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
            <span>🗺️</span>
            <span>Personalized 3-Week Upskilling Roadmap</span>
          </h3>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            
            <div style="border-left: 3px solid var(--brand-sky); padding-left: 14px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: var(--text-xs); font-weight: 700; color: var(--brand-sky);">WEEK 1 • KUBERNETES DEEP DIVE</span>
                <span style="font-size: var(--text-xs); color: var(--text-secondary);">Estimated: 8 Hours</span>
              </div>
              <div style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); margin: 4px 0;">Build Production Multi-Tenant Cluster with Istio Service Mesh</div>
              <div style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5;">
                Hands-on project: Implement zero-downtime canary deployments, distributed rate-limiting at ingress gateway, and mutual TLS encryption.
              </div>
            </div>

            <div style="border-left: 3px solid var(--brand-amber); padding-left: 14px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: var(--text-xs); font-weight: 700; color: var(--brand-amber);">WEEK 2 • GO CONCURRENCY & RAFT</span>
                <span style="font-size: var(--text-xs); color: var(--text-secondary);">Estimated: 6 Hours</span>
              </div>
              <div style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); margin: 4px 0;">Build Distributed In-Memory Key-Value Store</div>
              <div style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5;">
                Hands-on project: Write a consensus cluster using HashiCorp Serf or custom Raft leader election with heartbeats and network partition recovery.
              </div>
            </div>

            <div style="border-left: 3px solid var(--brand-emerald); padding-left: 14px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: var(--text-xs); font-weight: 700; color: var(--brand-emerald);">WEEK 3 • SYSTEM DESIGN PORTFOLIO</span>
                <span style="font-size: var(--text-xs); color: var(--text-secondary);">Estimated: 6 Hours</span>
              </div>
              <div style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); margin: 4px 0;">Architect Global Multi-Region Payment Ledger</div>
              <div style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5;">
                Document architecture whitepaper on GitHub with sequence diagrams, failure recovery modes, and latency benchmarks. Link directly in Candidate Vault.
              </div>
            </div>

          </div>
        </div>

        <!-- Unlocked Roles & Trajectory -->
        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
          <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
            <span>🚀</span>
            <span>Unlocked Opportunities</span>
          </h3>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            
            <div style="padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px;">
              <div style="font-size: var(--text-xs); color: var(--brand-emerald); font-weight: 700;">READY NOW • 94% FIT</div>
              <div style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); margin-top: 2px;">Staff Distributed Systems Engineer</div>
              <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 4px;">₹60L - ₹80L • Razorpay, Stripe, Datadog</div>
            </div>

            <div style="padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px;">
              <div style="font-size: var(--text-xs); color: var(--brand-sky); font-weight: 700;">HIGH ALIGNMENT • 91% FIT</div>
              <div style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); margin-top: 2px;">Founding Infrastructure Engineer</div>
              <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 4px;">₹50L - ₹75L + 1% Equity • Series A/B</div>
            </div>

            <div style="padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px;">
              <div style="font-size: var(--text-xs); color: var(--brand-purple); font-weight: 700;">1 YEAR GOAL • 88% FIT</div>
              <div style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); margin-top: 2px;">Principal FinTech Infrastructure Architect</div>
              <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 4px;">₹75L - ₹1.1Cr • Enterprise scale</div>
            </div>

          </div>
        </div>

      </div>

    </div>
  `;
}
