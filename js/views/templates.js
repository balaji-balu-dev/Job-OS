/**
 * ============================================================================
 * JobOS Document Templates View (js/views/templates.js)
 * Resume and cover letter template manager (Markdown, LaTeX, Typst, Plain Text)
 * Modeled after reference MadsLorentzen/ai-job-search /add-template architecture
 * ============================================================================
 */

export function renderTemplates() {
  return `
    <div class="view-content" style="padding: 24px 32px; max-width: 1300px; margin: 0 auto;">
      
      <!-- Header Banner -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <span style="font-size: 24px;">📝</span>
            <h1 style="font-size: var(--text-2xl); font-weight: 800; color: var(--text-primary); margin: 0;">Resume & Cover Letter Templates</h1>
            <span class="badge" style="background: rgba(168, 85, 247, 0.12); color: var(--brand-purple); border: 1px solid rgba(168, 85, 247, 0.3); font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight: 700;">ATS-OPTIMIZED</span>
          </div>
          <p style="color: var(--text-secondary); font-size: var(--text-sm); margin: 0;">
            Manage and test custom CV and cover letter toolchains. Supports Markdown, LaTeX (LuaLaTeX/XeLaTeX), Typst, and clean plain text.
          </p>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary btn-sm" onclick="window.app.openCreateTemplateModal()" style="display: flex; align-items: center; gap: 6px;">
            <span>+</span>
            <span>Create New Template</span>
          </button>
        </div>
      </div>

      <!-- Templates Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px;">
        
        <!-- Template 1: Markdown ATS -->
        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div>
                <span class="badge" style="background: rgba(16, 185, 129, 0.12); color: var(--brand-emerald); font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 10px;">DEFAULT RESUME</span>
                <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: 6px 0 2px 0;">Executive Systems Architect</h3>
                <div style="font-size: var(--text-xs); color: var(--text-secondary);">Format: Markdown (ATS Clean) • Max 2 Pages</div>
              </div>
              <span style="font-size: 20px;">📄</span>
            </div>

            <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px; max-height: 140px; overflow: hidden;">
              # {{FULL_NAME}}<br>
              {{EMAIL}} | {{PHONE}} | {{LOCATION}}<br><br>
              ## PROFESSIONAL SUMMARY<br>
              {{SUMMARY}}<br><br>
              ## CORE TECHNICAL COMPETENCIES<br>
              {{SKILLS}}
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 12px;">
            <span style="font-size: var(--text-xs); color: var(--brand-emerald); font-weight: 600;">✓ In Use by Drafter</span>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" onclick="window.app.previewTemplate('tmpl-resume-modern')">Preview</button>
              <button class="btn btn-secondary btn-sm" onclick="window.app.duplicateTemplate('tmpl-resume-modern')">Duplicate</button>
            </div>
          </div>
        </div>

        <!-- Template 2: LaTeX Deedy -->
        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div>
                <span class="badge" style="background: rgba(56, 189, 248, 0.12); color: var(--brand-sky); font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 10px;">LATEX COMPILED</span>
                <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: 6px 0 2px 0;">Deedy Academic & Research</h3>
                <div style="font-size: var(--text-xs); color: var(--text-secondary);">Compiler: LuaLaTeX • Two-Column Classic</div>
              </div>
              <span style="font-size: 20px;">🔬</span>
            </div>

            <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px; max-height: 140px; overflow: hidden;">
              \\documentclass[letterpaper]{article}<br>
              \\usepackage{geometry}<br>
              \\section*{{{FULL_NAME}}}<br>
              {{SUMMARY}}<br>
              \\section*{Experience}<br>
              {{EXPERIENCE}}
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 12px;">
            <button class="btn btn-ghost btn-sm" onclick="window.app.setDefaultTemplate('tmpl-resume-latex')" style="color: var(--text-secondary); font-size: var(--text-xs);">Set as Default</button>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" onclick="window.app.previewTemplate('tmpl-resume-latex')">Preview</button>
              <button class="btn btn-secondary btn-sm" onclick="window.app.duplicateTemplate('tmpl-resume-latex')">Duplicate</button>
            </div>
          </div>
        </div>

        <!-- Template 3: Cover Letter Standard -->
        <div class="card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div>
                <span class="badge" style="background: rgba(16, 185, 129, 0.12); color: var(--brand-emerald); font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 10px;">DEFAULT COVER LETTER</span>
                <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: 6px 0 2px 0;">Forward-Looking Strategic Letter</h3>
                <div style="font-size: var(--text-xs); color: var(--text-secondary);">Tone: Professional & Technical • Max 350 words</div>
              </div>
              <span style="font-size: 20px;">✉️</span>
            </div>

            <div style="background: rgba(0,0,0,0.25); padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px; max-height: 140px; overflow: hidden;">
              Dear {{HIRING_MANAGER_NAME}} & {{COMPANY}} Team,<br><br>
              I am writing to express my strong interest in the {{ROLE}} opportunity at {{COMPANY}}...
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 12px;">
            <span style="font-size: var(--text-xs); color: var(--brand-emerald); font-weight: 600;">✓ Default Cover Letter</span>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" onclick="window.app.previewTemplate('tmpl-cl-forward')">Preview</button>
              <button class="btn btn-secondary btn-sm" onclick="window.app.duplicateTemplate('tmpl-cl-forward')">Duplicate</button>
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
}
