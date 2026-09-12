/**
 * Candidate Vault (server/vault/candidate-vault.js)
 * Truth Vault enforcing Ground Truth provenance checking
 */
import { ProfileRepository } from '../db/repositories/ProfileRepository.js';

export class CandidateVault {
  static getProfile() {
    return ProfileRepository.getAll();
  }

  static getSection(sectionKey) {
    return ProfileRepository.getSection(sectionKey);
  }

  static updateSection(sectionKey, data, provenance = 'USER_VERIFIED') {
    return ProfileRepository.updateSection(sectionKey, data, provenance);
  }

  static updateBulk(sectionsObj, provenance = 'USER_VERIFIED') {
    return ProfileRepository.updateBulk(sectionsObj, provenance);
  }

  /**
   * Evaluates whether a claim or skill is verified against the candidate vault.
   * Returns: { status: 'PASS' | 'WARN' | 'BLOCK', reason: string, citation: string }
   */
  static evaluateFact(claimText, skillOrKey) {
    const profile = this.getProfile();
    const cleanSkill = (skillOrKey || '').toLowerCase();

    // 1. Check Skills
    const skillsSec = profile.skills?.data || {};
    const allSkillsStr = Object.values(skillsSec).join(' ').toLowerCase();

    if (cleanSkill && allSkillsStr.includes(cleanSkill)) {
      return {
        status: 'PASS',
        provenance: 'USER_VERIFIED',
        citation: `Candidate Profile -> Skills: "${cleanSkill}" verified`,
        reason: 'Explicitly verified in candidate profile skills'
      };
    }

    // 2. Check Employment Highlights & Projects
    const employment = profile.employment?.data || [];
    const matchedEmp = employment.find(e => 
      (e.highlights && e.highlights.toLowerCase().includes(cleanSkill)) ||
      (e.title && e.title.toLowerCase().includes(cleanSkill))
    );
    if (matchedEmp) {
      return {
        status: 'PASS',
        provenance: 'DERIVED',
        citation: `Candidate Profile -> Employment: ${matchedEmp.company} (${matchedEmp.title})`,
        reason: 'Derived from verified employment highlights'
      };
    }

    // 3. Unknown claim - block hallucination
    return {
      status: 'BLOCK',
      provenance: 'UNKNOWN',
      citation: 'None (Claim not found in Candidate Vault)',
      reason: `Claim "${skillOrKey}" does not exist in candidate profile. Zero-guessing rule enforced.`
    };
  }
}
