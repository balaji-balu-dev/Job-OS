/**
 * ==========================================================================
 * JobOS Final Submission Gate View (js/views/submission-gate.js)
 * High-stakes pre-flight verification gate. Submission is never accidental.
 * ==========================================================================
 */

import { store } from '../store.js';

export function renderSubmissionGate() {
  const app = store.currentApplication;

  return `
    <div class="view-content-wrapper" style="display: flex; flex-direction: column; gap: var(--space-5); max-width: 960px;">
      
      <!-- Back Navigation -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <button class="btn btn-ghost btn-sm" onclick="window.location.hash='#app-review'">
          ← Return to Application Review
        </button>
        <span class="badge-audit verified">REVIEW REQUIRED</span>
      </div>

      <!-- Submission Hero Banner -->
      <div class="submission-gate-banner">
        <div style="font-size: 32px; margin-bottom: 8px;">🛡️</div>
        <h1 style="font-size: var(--text-2xl); font-weight: 800; color: #fff;">
          Application Ready for Final Submission
        </h1>
        <p style="font-size: var(--text-base); color: var(--text-secondary); max-width: 600px; margin: 6px auto 0;">
          You are about to transmit this application directly to <strong>${app.company}</strong>.
        </p>
      </div>

      <!-- Pre-Flight Checklist -->
      <div class="preflight-checklist">
        <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-2);">
          Pre-Flight Verification Checklist
        </h3>

        ${app.preflightChecks.map(check => `
          <div class="checklist-item">
            <div class="check-icon">✓</div>
            <div>
              <div style="font-weight: 600; color: var(--text-primary); font-size: var(--text-sm);">
                ${check.name}
              </div>
              <div style="font-size: var(--text-xs); color: var(--text-muted);">
                ${check.details}
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Document Previews Side-by-Side -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
        
        <!-- Attached Resume -->
        <div class="card">
          <div class="card-header">
            <div class="card-title" style="font-size: var(--text-sm);">
              📄 Verified Attached Resume
            </div>
            <span class="badge-audit verified">v3.2 BACKEND</span>
          </div>
          <div style="background: var(--bg-surface-0); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.6;">
            <strong>Balaji S.</strong> — Senior Backend Engineer<br>
            • 6+ yrs Distributed Systems, Java, Go, Kafka, PostgreSQL<br>
            • Core Payments & Transaction Ledger Specialist<br>
          </div>
        </div>

        <!-- Cover Letter -->
        <div class="card">
          <div class="card-header">
            <div class="card-title" style="font-size: var(--text-sm);">
              ✉️ Tailored Cover Letter
            </div>
            <span class="badge-audit verified">VERIFIED ACCURATE</span>
          </div>
          <div style="background: var(--bg-surface-0); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.6;">
            "Dear Razorpay Payments Engineering Team,<br>
            Having engineered distributed ledger systems processing 4M+ daily transactions, I am eager to contribute to Razorpay's mission-critical transaction rails..."
          </div>
        </div>

      </div>

      <!-- High-Stakes Double-Action Submission Lock -->
      <div class="gate-dual-action-box">
        <div>
          <div style="font-size: var(--text-base); font-weight: 700; color: #fff;">
            Confirm Final Submission to ${app.company}
          </div>
          <div style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px;">
            By clicking below, your application and verified documents will be transmitted to the employer.
          </div>
        </div>

        <div style="display: flex; gap: var(--space-3);">
          <button class="btn btn-secondary" onclick="window.location.hash='#dashboard'">
            Cancel & Return
          </button>
          <button class="btn btn-emerald btn-lg" id="btn-final-submit" onclick="window.app.executeFinalSubmission()">
            🚀 APPROVE & SUBMIT APPLICATION
          </button>
        </div>
      </div>

    </div>
  `;
}
