/**
 * ==========================================================================
 * JobOS Candidate Profile View (js/views/profile.js)
 * 16 Structured Sections, Multi-Role Resume Management & Bidirectional Editing
 * ==========================================================================
 */

import { store } from '../store.js';

export function renderProfile() {
  const p = store.candidateProfile || {};
  const resumes = store.resumes || [];

  function getFieldVal(fieldObj, defaultVal = 'Not Specified') {
    if (fieldObj === undefined || fieldObj === null) return defaultVal;
    if (typeof fieldObj === 'object' && fieldObj !== null) {
      return fieldObj.value !== undefined ? fieldObj.value : defaultVal;
    }
    return String(fieldObj);
  }

  function getFieldStatus(fieldObj, defaultStatus = 'USER VERIFIED') {
    if (fieldObj === undefined || fieldObj === null) return defaultStatus;
    if (typeof fieldObj === 'object' && fieldObj !== null) {
      return fieldObj.status || defaultStatus;
    }
    return defaultStatus;
  }

  function renderField(label, fieldObj) {
    const val = getFieldVal(fieldObj);
    const status = getFieldStatus(fieldObj);

    let badgeClass = 'verified';
    if (String(status).includes('DERIVED')) badgeClass = 'derived';
    else if (String(status).includes('UNKNOWN')) badgeClass = 'unknown';

    return `
      <div class="profile-field-row">
        <span class="profile-field-label">${label}</span>
        <div class="profile-field-value">
          <span style="color: var(--text-primary); font-weight: 500;">${val}</span>
          <span class="badge-audit ${badgeClass}">${status}</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="view-content-wrapper" style="display: flex; flex-direction: column; gap: var(--space-5);">
      
      <!-- Profile Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div>
          <h1 style="font-size: var(--text-2xl); font-weight: 800; letter-spacing: -0.5px;">Verified Personal Profile Vault</h1>
          <p style="color: var(--text-secondary); font-size: var(--text-sm);">
            Your single source of truth. Autonomous agents accurately cite these facts when preparing applications.
          </p>
        </div>

        <div style="display: flex; gap: var(--space-3); align-items: center;">
          <span class="badge-audit verified" style="padding: 6px 12px; font-size: 12px;">
            ✓ Verified by You
          </span>
          <button class="btn btn-primary btn-sm" id="btn-open-profile-edit" onclick="window.app.triggerProfileEdit()">
            ✏️ Update Profile Data
          </button>
        </div>
      </div>

      <!-- Quick Notification Toast Target -->
      <div id="profile-toast-container"></div>

      <!-- 16 Structured Sections Grid -->
      <div class="profile-sections-grid">
        
        <!-- 1. Identity -->
        <div class="card">
          <h3 class="card-title">1. Identity & Legal</h3>
          ${renderField('Full Legal Name', p.identity?.fullName)}
          ${renderField('Preferred Name', p.identity?.preferredName)}
          ${renderField('Pronouns', p.identity?.pronouns)}
          ${renderField('Citizenship', p.identity?.citizenship)}
        </div>

        <!-- 2. Contact Information -->
        <div class="card">
          <h3 class="card-title">2. Contact Information</h3>
          ${renderField('Primary Email', p.contact?.email)}
          ${renderField('Phone Number', p.contact?.phone)}
          ${renderField('LinkedIn Profile', p.contact?.linkedin)}
          ${renderField('GitHub Handle', p.contact?.github)}
        </div>

        <!-- 3. Location & Mobility -->
        <div class="card">
          <h3 class="card-title">3. Location & Mobility</h3>
          ${renderField('Current Residence', p.location?.currentCity)}
          ${renderField('Open to Relocation', p.location?.openToRelocation)}
          ${renderField('Work Model', p.location?.workModelPreference)}
        </div>

        <!-- 4. Work Authorization -->
        <div class="card">
          <h3 class="card-title">4. Work Authorization</h3>
          ${renderField('India Citizen', (p.workAuthorization || p.work_authorization)?.indiaCitizen)}
          ${renderField('US Visa Sponsorship', (p.workAuthorization || p.work_authorization)?.usVisaStatus)}
          ${renderField('EU Visa Status', (p.workAuthorization || p.work_authorization)?.euVisaStatus)}
        </div>

        <!-- 5. Employment History -->
        <div class="card" style="grid-column: span 2;">
          <h3 class="card-title">5. Verified Employment History</h3>
          <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-3);">
            ${(p.employment || []).map(emp => `
              <div style="background: var(--bg-surface-0); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <strong style="font-size: var(--text-base); color: var(--text-primary);">${emp.title} @ ${emp.company}</strong>
                  <span class="badge-audit verified">${emp.status || 'USER VERIFIED'}</span>
                </div>
                <div style="font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px;">
                  ${emp.period}
                </div>
                <div style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px;">
                  ${emp.highlights}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 6. Education -->
        <div class="card">
          <h3 class="card-title">6. Education</h3>
          ${renderField('Highest Degree', p.education?.degree)}
          ${renderField('Institution', p.education?.institution)}
          ${renderField('Graduation Year', p.education?.year)}
        </div>

        <!-- 7. Verified Skills -->
        <div class="card">
          <h3 class="card-title">7. Technical Skills Matrix</h3>
          ${renderField('Languages', p.skills?.languages)}
          ${renderField('Frameworks', p.skills?.frameworks)}
          ${renderField('Databases', p.skills?.databases)}
          ${renderField('Message Brokers', p.skills?.messaging)}
          ${renderField('Cloud / DevOps', p.skills?.cloudDevops)}
        </div>

        <!-- 8. Projects & Open Source -->
        <div class="card">
          <h3 class="card-title">8. Key Verified Projects</h3>
          ${(p.projects || []).map(proj => `
            <div style="padding: var(--space-2) 0; border-bottom: 1px solid var(--border-subtle);">
              <div style="display: flex; justify-content: space-between;">
                <strong>${proj.name}</strong>
                <span class="badge-audit verified">${proj.status || 'USER VERIFIED'}</span>
              </div>
              <div style="font-size: 11px; color: var(--brand-sky);">${proj.tech}</div>
              <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px;">${proj.impact}</div>
            </div>
          `).join('')}
        </div>

        <!-- 9. Certifications -->
        <div class="card">
          <h3 class="card-title">9. Certifications</h3>
          ${(p.certifications || []).map(cert => `
            <div style="display: flex; justify-content: space-between; padding: 6px 0;">
              <span>${cert.name} (${cert.date})</span>
              <span class="badge-audit verified">${cert.status || 'USER VERIFIED'}</span>
            </div>
          `).join('')}
        </div>

        <!-- 10. Achievements -->
        <div class="card">
          <h3 class="card-title">10. Verified Achievements</h3>
          ${(p.achievements || []).map(ach => `
            <div style="display: flex; justify-content: space-between; padding: 6px 0;">
              <span style="font-size: var(--text-sm);">${ach.name}</span>
              <span class="badge-audit verified">${ach.status || 'USER VERIFIED'}</span>
            </div>
          `).join('')}
        </div>

        <!-- 11. Compensation & CTC -->
        <div class="card">
          <h3 class="card-title">11. Compensation & Expectations</h3>
          ${renderField('Current CTC', p.salary?.currentCTC)}
          ${renderField('Target CTC', p.salary?.expectedCTC)}
          ${renderField('Absolute Floor', p.salary?.minimumAcceptable)}
        </div>

        <!-- 12. Notice Period -->
        <div class="card">
          <h3 class="card-title">12. Notice Period & Availability</h3>
          ${renderField('Official Period', (p.noticePeriod || p.notice_period)?.official)}
          ${renderField('Negotiable (Buyout)', (p.noticePeriod || p.notice_period)?.negotiableDays)}
          ${renderField('Current Status', (p.noticePeriod || p.notice_period)?.lastWorkingDay)}
        </div>

        <!-- 13. Search Preferences -->
        <div class="card">
          <h3 class="card-title">13. Search Preferences</h3>
          ${renderField('Target Roles', p.preferences?.targetRoles)}
          ${renderField('Company Stages', p.preferences?.companyStages)}
          ${renderField('Sectors to Avoid', p.preferences?.domainsAvoid)}
        </div>

        <!-- 14. Portfolio & Links -->
        <div class="card">
          <h3 class="card-title">14. Portfolio & Writings</h3>
          ${renderField('Personal Site', p.portfolio?.personalSite)}
          ${renderField('Architecture Posts', p.portfolio?.blogPosts)}
        </div>

        <!-- 15. Multi-Role Resume Management -->
        <div class="card" style="grid-column: span 2; border: 1px solid var(--border-subtle);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
            <div>
              <h3 class="card-title" style="margin-bottom: 2px;">15. Multi-Role Resumes (${resumes.length} Tailored Versions)</h3>
              <p style="font-size: var(--text-xs); color: var(--text-secondary);">
                Maintain separate targeted resumes for different job families. All files stored privately in local vault.
              </p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.app.openResumeUploadModal()">
              ➕ Upload Resume
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${resumes.length === 0 ? `
              <div style="padding: 24px; text-align: center; color: var(--text-muted); background: var(--bg-surface-0); border-radius: var(--radius-md);">
                No resumes uploaded yet. Click "Upload Resume" above to add your first role-tailored resume (PDF, DOC, DOCX up to 10MB).
              </div>
            ` : resumes.map(r => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--bg-surface-0); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="font-size: 24px;">📄</div>
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <strong style="color: var(--text-primary); font-size: var(--text-sm);">${r.title}</strong>
                      <span class="badge-audit" style="background: rgba(99, 102, 241, 0.1); color: var(--brand-indigo); border: 1px solid rgba(99, 102, 241, 0.2); font-size: 10px;">
                        ${r.roleCategory}
                      </span>
                      ${r.isPrimary ? `
                        <span class="badge-audit verified" style="font-size: 10px;">
                          ★ PRIMARY DEFAULT
                        </span>
                      ` : ''}
                    </div>
                    <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px;">
                      ${r.originalName} • ${(r.fileSize / 1024).toFixed(0)} KB • ${new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style="display: flex; gap: 6px; align-items: center;">
                  <button class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 4px 8px;" onclick="window.app.downloadResume('${r.id}')">
                    ⬇ Download
                  </button>
                  ${!r.isPrimary ? `
                    <button class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 4px 8px;" onclick="window.app.setPrimaryResume('${r.id}')">
                      ★ Make Primary
                    </button>
                  ` : ''}
                  <button class="btn btn-secondary btn-sm" style="font-size: 11px; padding: 4px 8px; color: var(--brand-rose);" onclick="window.app.deleteResume('${r.id}')">
                    🗑 Delete
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 16. Approved Answers Bank -->
        <div class="card">
          <h3 class="card-title">16. Approved Answers Bank</h3>
          ${((p.approvedAnswers || p.approved_answers) || []).map(ans => `
            <div style="padding: 6px 0; border-bottom: 1px solid var(--border-subtle); font-size: var(--text-xs);">
              <div style="font-family: var(--font-mono); color: var(--brand-amber); font-weight: 700;">${ans.key}</div>
              <div style="color: var(--text-secondary); margin-top: 2px;">${ans.value}</div>
            </div>
          `).join('')}
        </div>

      </div>

      <!-- ====================================================================
           Profile Edit Modal Backdrop & Dialog
           ==================================================================== -->
      <div id="profile-edit-modal" style="display: none; position: fixed; inset: 0; background: rgba(10, 15, 29, 0.8); z-index: 1000; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
        <div class="card" style="width: 100%; max-width: 760px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: var(--shadow-xl); border: 1px solid var(--border-medium);">
          
          <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--space-3); border-bottom: 1px solid var(--border-subtle);">
            <div>
              <h2 style="font-size: var(--text-lg); font-weight: 800;">✏️ Edit Candidate Profile</h2>
              <p style="font-size: var(--text-xs); color: var(--text-secondary);">Changes are committed directly to SQLite and update the Single Truth Vault.</p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.app.closeProfileModal()">✕</button>
          </div>

          <div id="profile-edit-error" style="display: none; margin-top: 12px; padding: 8px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-md); color: var(--brand-rose); font-size: var(--text-xs);"></div>

          <!-- Scrollable Form Container -->
          <div style="flex: 1; overflow-y: auto; padding: var(--space-4) 0; display: flex; flex-direction: column; gap: var(--space-4);">
            
            <!-- Section A: Identity -->
            <div style="background: var(--bg-surface-0); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <h4 style="font-size: var(--text-xs); text-transform: uppercase; color: var(--brand-indigo); font-weight: 700; margin-bottom: 8px;">1. Identity & Legal</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div>
                  <label class="profile-field-label" style="display: block; margin-bottom: 4px;">Full Legal Name *</label>
                  <input type="text" id="edit-identity-fullName" class="search-input" style="width: 100%;" value="${getFieldVal(p.identity?.fullName, '')}">
                </div>
                <div>
                  <label class="profile-field-label" style="display: block; margin-bottom: 4px;">Preferred Name</label>
                  <input type="text" id="edit-identity-preferredName" class="search-input" style="width: 100%;" value="${getFieldVal(p.identity?.preferredName, '')}">
                </div>
                <div>
                  <label class="profile-field-label" style="display: block; margin-bottom: 4px;">Pronouns</label>
                  <input type="text" id="edit-identity-pronouns" class="search-input" style="width: 100%;" value="${getFieldVal(p.identity?.pronouns, '')}">
                </div>
                <div>
                  <label class="profile-field-label" style="display: block; margin-bottom: 4px;">Citizenship</label>
                  <input type="text" id="edit-identity-citizenship" class="search-input" style="width: 100%;" value="${getFieldVal(p.identity?.citizenship, '')}">
                </div>
              </div>
            </div>

            <!-- Section B: Contact -->
            <div style="background: var(--bg-surface-0); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <h4 style="font-size: var(--text-xs); text-transform: uppercase; color: var(--brand-indigo); font-weight: 700; margin-bottom: 8px;">2. Contact Information</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div>
                  <label class="profile-field-label" style="display: block; margin-bottom: 4px;">Primary Email *</label>
                  <input type="email" id="edit-contact-email" class="search-input" style="width: 100%;" value="${getFieldVal(p.contact?.email, '')}">
                </div>
                <div>
                  <label class="profile-field-label" style="display: block; margin-bottom: 4px;">Phone Number</label>
                  <input type="text" id="edit-contact-phone" class="search-input" style="width: 100%;" value="${getFieldVal(p.contact?.phone, '')}">
                </div>
                <div>
                  <label class="profile-field-label" style="display: block; margin-bottom: 4px;">LinkedIn URL</label>
                  <input type="text" id="edit-contact-linkedin" class="search-input" style="width: 100%;" value="${getFieldVal(p.contact?.linkedin, '')}">
                </div>
                <div>
                  <label class="profile-field-label" style="display: block; margin-bottom: 4px;">GitHub Profile</label>
                  <input type="text" id="edit-contact-github" class="search-input" style="width: 100%;" value="${getFieldVal(p.contact?.github, '')}">
                </div>
              </div>
            </div>

            <!-- Section C: Location & Authorization -->
            <div style="background: var(--bg-surface-0); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <h4 style="font-size: var(--text-xs); text-transform: uppercase; color: var(--brand-indigo); font-weight: 700; margin-bottom: 8px;">3. Location & Work Authorization</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div>
                  <label class="profile-field-label" style="display: block; margin-bottom: 4px;">Current City</label>
                  <input type="text" id="edit-location-currentCity" class="search-input" style="width: 100%;" value="${getFieldVal(p.location?.currentCity, '')}">
                </div>
                <div>
                  <label class="profile-field-label" style="display: block; margin-bottom: 4px;">Work Model Preference</label>
                  <input type="text" id="edit-location-workModelPreference" class="search-input" style="width: 100%;" value="${getFieldVal(p.location?.workModelPreference, '')}">
                </div>
                <div>
                  <label class="profile-field-label" style="display: block; margin-bottom: 4px;">Open to Relocation</label>
                  <input type="text" id="edit-location-openToRelocation" class="search-input" style="width: 100%;" value="${getFieldVal(p.location?.openToRelocation, '')}">
                </div>
                <div>
                  <label class="profile-field-label" style="display: block; margin-bottom: 4px;">US Visa Sponsorship</label>
                  <input type="text" id="edit-auth-usVisaStatus" class="search-input" style="width: 100%;" value="${getFieldVal((p.workAuthorization || p.work_authorization)?.usVisaStatus, '')}">
                </div>
              </div>
            </div>

            <!-- Section D: Compensation & Notice -->
            <div style="background: var(--bg-surface-0); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <h4 style="font-size: var(--text-xs); text-transform: uppercase; color: var(--brand-indigo); font-weight: 700; margin-bottom: 8px;">4. Compensation & Notice Period</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                <div>
                  <label class="profile-field-label" style="display: block; margin-bottom: 4px;">Current CTC</label>
                  <input type="text" id="edit-salary-currentCTC" class="search-input" style="width: 100%;" value="${getFieldVal(p.salary?.currentCTC, '')}">
                </div>
                <div>
                  <label class="profile-field-label" style="display: block; margin-bottom: 4px;">Target Expected CTC</label>
                  <input type="text" id="edit-salary-expectedCTC" class="search-input" style="width: 100%;" value="${getFieldVal(p.salary?.expectedCTC, '')}">
                </div>
                <div>
                  <label class="profile-field-label" style="display: block; margin-bottom: 4px;">Absolute Floor</label>
                  <input type="text" id="edit-salary-minimumAcceptable" class="search-input" style="width: 100%;" value="${getFieldVal(p.salary?.minimumAcceptable, '')}">
                </div>
                <div>
                  <label class="profile-field-label" style="display: block; margin-bottom: 4px;">Official Notice Period</label>
                  <input type="text" id="edit-notice-official" class="search-input" style="width: 100%;" value="${getFieldVal((p.noticePeriod || p.notice_period)?.official, '')}">
                </div>
                <div style="grid-column: span 2;">
                  <label class="profile-field-label" style="display: block; margin-bottom: 4px;">Negotiable Days / Buyout</label>
                  <input type="text" id="edit-notice-negotiableDays" class="search-input" style="width: 100%;" value="${getFieldVal((p.noticePeriod || p.notice_period)?.negotiableDays, '')}">
                </div>
              </div>
            </div>

          </div>

          <!-- Modal Footer -->
          <div style="display: flex; justify-content: flex-end; gap: var(--space-3); padding-top: var(--space-3); border-top: 1px solid var(--border-subtle);">
            <button class="btn btn-secondary btn-sm" onclick="window.app.closeProfileModal()">Cancel</button>
            <button class="btn btn-primary btn-sm" id="btn-save-profile" onclick="window.app.saveProfileData()">💾 Save & Persist Profile</button>
          </div>

        </div>
      </div>

      <!-- ====================================================================
           Resume Upload Modal Backdrop & Dialog
           ==================================================================== -->
      <div id="resume-upload-modal" style="display: none; position: fixed; inset: 0; background: rgba(10, 15, 29, 0.8); z-index: 1000; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
        <div class="card" style="width: 100%; max-width: 520px; box-shadow: var(--shadow-xl); border: 1px solid var(--border-medium);">
          
          <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--space-3); border-bottom: 1px solid var(--border-subtle);">
            <div>
              <h2 style="font-size: var(--text-base); font-weight: 800;">📄 Upload Role-Tailored Resume</h2>
              <p style="font-size: var(--text-xs); color: var(--text-secondary);">Formats: PDF, DOC, DOCX up to 10MB.</p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.app.closeResumeModal()">✕</button>
          </div>

          <div id="resume-upload-error" style="display: none; margin-top: 12px; padding: 8px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-md); color: var(--brand-rose); font-size: var(--text-xs);"></div>

          <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-3);">
            <div>
              <label class="profile-field-label" style="display: block; margin-bottom: 4px;">Resume Title *</label>
              <input type="text" id="resume-upload-title" class="search-input" style="width: 100%;" placeholder="e.g. Senior Frontend Engineer (React/TypeScript)">
            </div>

            <div>
              <label class="profile-field-label" style="display: block; margin-bottom: 4px;">Target Role Category *</label>
              <select id="resume-upload-role" class="search-input" style="width: 100%; cursor: pointer;">
                <option value="Backend Developer">Backend Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="Data/AI">Data / AI Systems</option>
              </select>
            </div>

            <div>
              <label class="profile-field-label" style="display: block; margin-bottom: 4px;">Select File (PDF, DOC, DOCX) *</label>
              <input type="file" id="resume-upload-file" accept=".pdf,.doc,.docx" class="search-input" style="width: 100%; padding: 6px;">
            </div>

            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              <input type="checkbox" id="resume-upload-isPrimary">
              <label for="resume-upload-isPrimary" style="font-size: var(--text-xs); color: var(--text-primary); cursor: pointer;">Set as Primary Default Resume</label>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: var(--space-3); padding-top: var(--space-4); border-top: 1px solid var(--border-subtle); margin-top: var(--space-4);">
            <button class="btn btn-secondary btn-sm" onclick="window.app.closeResumeModal()">Cancel</button>
            <button class="btn btn-primary btn-sm" id="btn-submit-resume" onclick="window.app.submitResumeUpload()">⬆ Upload & Save</button>
          </div>

        </div>
      </div>

    </div>
  `;
}
