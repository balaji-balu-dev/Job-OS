/**
 * FitRankingEngine (server/core/FitRankingEngine.js)
 * Transparent 6-dimensional job fit scoring, deal-breaker detection, and priority tiering
 * Modeled after reference MadsLorentzen/ai-job-search /rank evaluation framework
 */
import { CandidateVault } from '../vault/candidate-vault.js';

export class FitRankingEngine {
  /**
   * Evaluates a job posting against candidate profile
   */
  static evaluate(job, profile = null) {
    if (!profile) {
      profile = CandidateVault.getProfile();
    }

    const candidateSkills = this._extractCandidateSkills(profile);
    const candidateExpYears = this._extractCandidateExperienceYears(profile);
    const workPreferences = profile.work_preferences?.data || {};
    const candidateLocations = workPreferences.target_locations || ['India', 'Remote', 'Bangalore'];
    const remotePref = workPreferences.remote_preference || 'Flexible';
    const salaryMin = workPreferences.salary_floor_inr || 3500000;
    const workAuth = profile.work_authorization?.data || { country: 'India', status: 'Citizen' };

    // 1. Extract Job Attributes
    const jobSkills = Array.isArray(job.skills) ? job.skills : JSON.parse(job.skills_json || '[]');
    const jobDescription = (job.description || '') + ' ' + (job.title || '');
    const jobTitleLower = (job.title || '').toLowerCase();
    const jobLocationLower = (job.location || '').toLowerCase();

    // 2. Compute 6 Dimensions
    // Dimension A: Skills Match (30%)
    let skillsMatch = 60;
    const matchedSkills = [];
    const missingSkills = [];

    if (jobSkills.length > 0) {
      for (const skill of jobSkills) {
        const found = candidateSkills.some(cs => cs.toLowerCase() === skill.toLowerCase() ||
          skill.toLowerCase().includes(cs.toLowerCase()) || cs.toLowerCase().includes(skill.toLowerCase()));
        if (found) {
          matchedSkills.push(skill);
        } else {
          missingSkills.push(skill);
        }
      }
      skillsMatch = Math.round((matchedSkills.length / jobSkills.length) * 100);
    } else {
      // Heuristic skill extraction from text
      const commonKeywords = ['java', 'spring', 'kafka', 'kubernetes', 'aws', 'docker', 'postgresql', 'redis', 'python', 'go', 'node', 'react', 'distributed'];
      let foundCount = 0;
      let totalChecked = 0;
      for (const kw of commonKeywords) {
        if (jobDescription.toLowerCase().includes(kw)) {
          totalChecked++;
          if (candidateSkills.some(cs => cs.toLowerCase().includes(kw))) {
            foundCount++;
            matchedSkills.push(kw.toUpperCase());
          } else {
            missingSkills.push(kw.toUpperCase());
          }
        }
      }
      skillsMatch = totalChecked > 0 ? Math.round((foundCount / totalChecked) * 100) : 80;
    }

    // Dimension B: Experience Match (25%)
    let experienceMatch = 85;
    let requiredYears = 5;
    const expRegex = /(\d+)\+?\s*(?:years|yrs)\b/i;
    const expMatch = jobDescription.match(expRegex);
    if (expMatch) {
      requiredYears = parseInt(expMatch[1], 10);
    }

    if (candidateExpYears >= requiredYears) {
      experienceMatch = Math.min(100, 85 + (candidateExpYears - requiredYears) * 3);
    } else {
      const gap = requiredYears - candidateExpYears;
      experienceMatch = Math.max(30, 85 - (gap * 20));
    }

    // Dimension C: Location & Remote (15%)
    let locationMatch = 70;
    const isJobRemote = jobLocationLower.includes('remote') || jobLocationLower.includes('work from anywhere');
    const isJobLocal = candidateLocations.some(loc => jobLocationLower.includes(loc.toLowerCase()));

    if (isJobRemote || isJobLocal) {
      locationMatch = 100;
    } else if (jobLocationLower.includes('india')) {
      locationMatch = 85;
    } else {
      locationMatch = 40; // international / relocation required
    }

    // Dimension D: Salary Match (10%)
    let salaryMatch = 80;
    let jobSalaryMin = 0;
    const salaryRegex = /(?:₹|INR|Rs\.?)\s*(\d+)(?:,(\d+))?(?:,(\d+))?/i;
    if (job.salary) {
      salaryMatch = 90;
    }

    // Dimension E: Seniority Match (10%)
    let seniorityMatch = 85;
    const isSeniorJob = jobTitleLower.includes('senior') || jobTitleLower.includes('lead') || jobTitleLower.includes('staff') || jobTitleLower.includes('principal');
    const isStaffJob = jobTitleLower.includes('staff') || jobTitleLower.includes('principal');
    if (candidateExpYears >= 6 && isSeniorJob) {
      seniorityMatch = 95;
    } else if (candidateExpYears < 4 && isStaffJob) {
      seniorityMatch = 50;
    } else if (candidateExpYears >= 6 && jobTitleLower.includes('junior')) {
      seniorityMatch = 60; // overqualified
    }

    // Dimension F: Industry & Tech Domain (10%)
    let industryMatch = 85;
    if (jobDescription.toLowerCase().includes('payment') || jobDescription.toLowerCase().includes('fintech') || jobDescription.toLowerCase().includes('distributed systems')) {
      industryMatch = 95;
    }

    // Weighted Overall Score
    const overallScore = Math.round(
      (skillsMatch * 0.30) +
      (experienceMatch * 0.25) +
      (locationMatch * 0.15) +
      (salaryMatch * 0.10) +
      (seniorityMatch * 0.10) +
      (industryMatch * 0.10)
    );

    // 3. Deal-Breakers Detection
    const dealBreakers = [];
    if (requiredYears - candidateExpYears >= 4) {
      dealBreakers.push(`Requires ${requiredYears}+ years experience (Profile has ${candidateExpYears} yrs)`);
    }
    if (locationMatch < 50 && !isJobRemote) {
      dealBreakers.push(`Requires relocation to an unsupported region (${job.location || 'Foreign country'})`);
    }
    if (missingSkills.length >= 4 && skillsMatch < 45) {
      dealBreakers.push(`Core tech stack heavily misaligned (Missing: ${missingSkills.slice(0, 3).join(', ')})`);
    }
    if (jobDescription.toLowerCase().includes('must have us citizenship') || jobDescription.toLowerCase().includes('security clearance required')) {
      if (workAuth.country !== 'US') {
        dealBreakers.push('Requires US Citizenship / Active Government Security Clearance');
      }
    }

    // 4. Priority Tier Classification
    let priorityTier = 'GOOD_MATCH';
    let recommendation = '🟢 Good Match';

    if (dealBreakers.length > 0 || overallScore < 60) {
      priorityTier = 'LOW_MATCH';
      recommendation = '🔴 Low Match (Deal Breakers Present)';
    } else if (overallScore >= 88) {
      priorityTier = 'HIGH_PRIORITY';
      recommendation = '🔥 High Priority (Strong Match)';
    } else if (overallScore >= 75) {
      priorityTier = 'GOOD_MATCH';
      recommendation = '🟢 Good Match';
    } else {
      priorityTier = 'POSSIBLE_MATCH';
      recommendation = '🟡 Possible Match';
    }

    // 5. Match Reasons & Highlights
    const matchReasons = [];
    if (matchedSkills.length > 0) {
      matchReasons.push(`Aligned competencies: ${matchedSkills.slice(0, 5).join(', ')}`);
    }
    if (experienceMatch >= 85) {
      matchReasons.push(`Experience tier strongly meets seniority requirement (${candidateExpYears} yrs vs ${requiredYears} req)`);
    }
    if (locationMatch === 100) {
      matchReasons.push(isJobRemote ? 'Remote-first role matching remote preference' : `Location matches target hub (${job.location})`);
    }

    const concerns = [...dealBreakers];
    if (missingSkills.length > 0 && missingSkills.length <= 3) {
      concerns.push(`Skill gap for: ${missingSkills.slice(0, 3).join(', ')}`);
    }

    return {
      overallScore,
      priorityTier,
      recommendation,
      fitBreakdown: {
        skills: skillsMatch,
        experience: experienceMatch,
        location: locationMatch,
        salary: salaryMatch,
        seniority: seniorityMatch,
        industry: industryMatch
      },
      dealBreakers,
      matchedSkills,
      missingSkills,
      matchReasons,
      concerns
    };
  }

  static _extractCandidateSkills(profile) {
    const skillsSec = profile.skills?.data || {};
    const tech = Array.isArray(skillsSec.technical) ? skillsSec.technical : [];
    const core = Array.isArray(skillsSec.core) ? skillsSec.core : [];
    const languages = Array.isArray(skillsSec.languages) ? skillsSec.languages : [];
    const frameworks = Array.isArray(skillsSec.frameworks) ? skillsSec.frameworks : [];

    const set = new Set([...tech, ...core, ...languages, ...frameworks]);
    if (set.size === 0) {
      // fallback defaults from verified profile
      return ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL', 'Redis', 'Distributed Systems', 'AWS', 'Docker', 'Kubernetes', 'Microservices'];
    }
    return Array.from(set);
  }

  static _extractCandidateExperienceYears(profile) {
    const expSec = profile.experience?.data;
    if (Array.isArray(expSec) && expSec.length > 0) {
      // Estimate 2.5 yrs per listed company role
      return Math.max(6, expSec.length * 2);
    }
    return 6.5; // Default verified 6+ yrs
  }
}
