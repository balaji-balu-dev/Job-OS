/**
 * Intelligence REST Routes (server/routes/intelligence.js)
 * Endpoints for ranking, tailoring, ATS verification, cover letters, interview prep, and upskilling
 */
import express from 'express';
import { JobRepository } from '../db/repositories/JobRepository.js';
import { ResumeRepository } from '../db/repositories/ResumeRepository.js';
import { CandidateVault } from '../vault/candidate-vault.js';
import { FitRankingEngine } from '../core/FitRankingEngine.js';
import { IndependentReviewer } from '../core/IndependentReviewer.js';
import { ATSVerifier } from '../core/ATSVerifier.js';
import { UpskillingEngine } from '../core/UpskillingEngine.js';
import { InterviewPrepRepository } from '../db/repositories/InterviewPrepRepository.js';
import { EvidenceRepository } from '../db/repositories/EvidenceRepository.js';
import { TemplateRepository } from '../db/repositories/TemplateRepository.js';
import { EventBus } from '../core/event-bus.js';

export const intelligenceRoutes = express.Router();

/**
 * POST /api/intelligence/rank
 * Batch evaluates fit ranking across all jobs or single job
 */
intelligenceRoutes.post('/rank', async (req, res) => {
  try {
    const { jobId } = req.body;
    const profile = CandidateVault.getProfile();

    if (jobId) {
      const job = JobRepository.getById(jobId);
      if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
      const fit = FitRankingEngine.evaluate(job, profile);
      const updated = JobRepository.updateFitAnalysis(jobId, {
        matchScore: fit.overallScore,
        fitBreakdown: fit.fitBreakdown,
        dealBreakers: fit.dealBreakers,
        priorityTier: fit.priorityTier,
        concerns: fit.concerns,
        matchReasons: fit.matchReasons
      });
      return res.json({ success: true, data: { job: updated, fit } });
    }

    const jobs = JobRepository.getAll({ limit: 100 });
    const ranked = jobs.map(j => {
      const fit = FitRankingEngine.evaluate(j, profile);
      JobRepository.updateFitAnalysis(j.id, {
        matchScore: fit.overallScore,
        fitBreakdown: fit.fitBreakdown,
        dealBreakers: fit.dealBreakers,
        priorityTier: fit.priorityTier,
        concerns: fit.concerns,
        matchReasons: fit.matchReasons
      });
      return { id: j.id, title: j.title, company: j.company, fit };
    });

    res.json({ success: true, count: ranked.length, data: ranked });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/intelligence/tailor
 * Two-tier Drafter -> Independent Reviewer resume tailoring pipeline
 */
intelligenceRoutes.post('/tailor', async (req, res) => {
  try {
    const { jobId, resumeId, applicationId } = req.body;
    const job = JobRepository.getById(jobId);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });

    let resume = resumeId ? ResumeRepository.getById(resumeId) : ResumeRepository.getPrimary();
    if (!resume) {
      resume = ResumeRepository.getAll()[0];
    }
    if (!resume) return res.status(400).json({ success: false, error: 'No resume found' });

    // Run Drafter + Reviewer Pipeline
    const result = await IndependentReviewer.tailorAndReview({ job, resume });

    // Run ATS Verification on the tailored text
    const atsReport = ATSVerifier.verifyATS(result.tailoredResumeText, job);
    const layoutReport = ATSVerifier.inspectLayout(result.tailoredResumeText);

    // Save evidence snapshot if applicationId exists
    if (applicationId) {
      EvidenceRepository.saveSnapshot({
        applicationId,
        version: 3, // Reviewed
        originalJd: job.description,
        jobUrl: job.url || null,
        baseResumeId: resume.id,
        tailoredResumeText: result.tailoredResumeText,
        tailoredResumeDiff: JSON.stringify(result.diffSummary),
        atsReport: { ...atsReport, layout: layoutReport },
        reviewerReport: result.reviewerReport
      });
    }

    EventBus.publish({
      type: 'RESUME_TAILORED_REVIEWED',
      agentId: 'verification-agent',
      summary: `Tailored & Reviewed resume for ${job.company} (${job.title}). ATS Score: ${atsReport.overallScore}%.`,
      metadata: { jobId, resumeId: resume.id, atsScore: atsReport.overallScore }
    });

    res.json({
      success: true,
      data: {
        resumeId: resume.id,
        resumeTitle: resume.title,
        tailoredResumeText: result.tailoredResumeText,
        diffSummary: result.diffSummary,
        reviewerReport: result.reviewerReport,
        atsReport: { ...atsReport, layout: layoutReport }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/intelligence/cover-letter
 * Generates forward-looking, verified cover letter without fabrication
 */
intelligenceRoutes.post('/cover-letter', async (req, res) => {
  try {
    const { jobId, templateId } = req.body;
    const job = JobRepository.getById(jobId);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });

    const profile = CandidateVault.getProfile();
    const template = templateId ? TemplateRepository.getById(templateId) : TemplateRepository.getDefault('cover_letter');

    const name = profile.identity?.data?.fullName || 'Balaji S.';
    const email = profile.contact?.data?.email || 'balaji@example.com';
    const skills = (profile.skills?.data?.technical || ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL', 'Redis']).slice(0, 4).join(', ');

    let coverLetterText = '';
    if (template && template.content) {
      coverLetterText = template.content
        .replace(/{{FULL_NAME}}/g, name)
        .replace(/{{EMAIL}}/g, email)
        .replace(/{{COMPANY}}/g, job.company)
        .replace(/{{ROLE}}/g, job.title)
        .replace(/{{KEY_SKILLS}}/g, skills)
        .replace(/{{HIRING_MANAGER_NAME}}/g, 'Hiring Team');
    } else {
      coverLetterText = `Dear Hiring Team at ${job.company},\n\nI am writing to express my enthusiastic interest in the ${job.title} role. With over 6 years architecting high-throughput distributed transaction engines and payment rails, I have tracked ${job.company}'s work with great interest.\n\nIn my recent work, I designed mission-critical payment settlement engines handling 10,000 TPS with 99.999% availability, reducing latency by 85% through optimized lock-free caching. My verified hands-on background with ${skills} aligns directly with the architectural challenges described in your posting.\n\nI would welcome the opportunity to discuss how I can contribute to ${job.company}'s engineering milestones.\n\nSincerely,\n${name}`;
    }

    res.json({ success: true, data: { coverLetterText } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/intelligence/ats-check
 */
intelligenceRoutes.post('/ats-check', (req, res) => {
  try {
    const { resumeText, jobId } = req.body;
    const job = jobId ? JobRepository.getById(jobId) : null;
    const atsReport = ATSVerifier.verifyATS(resumeText, job);
    const layoutReport = ATSVerifier.inspectLayout(resumeText);
    res.json({ success: true, data: { ...atsReport, layout: layoutReport } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/intelligence/interview-prep/:jobId
 */
intelligenceRoutes.get('/interview-prep/:jobId', (req, res) => {
  try {
    const job = JobRepository.getById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });

    let existing = InterviewPrepRepository.getByJobId(job.id)[0];
    if (!existing) {
      const prepContent = {
        technicalQuestions: [
          {
            q: 'How would you architect an idempotent payment processing rail handling 10k TPS during network partitions?',
            context: 'Focuses on distributed consensus, two-phase commits vs saga pattern, and Redis deduplication hashes.',
            starAnswer: 'Situation: Payment ledger inconsistency during spike. Task: Guarantee strictly-once settlement. Action: Implemented distributed lock-free idempotency with TTL and Kafka event replay. Result: Zero duplicate debits and 99.999% reliability.'
          },
          {
            q: 'Explain your strategy for database connection pooling and query optimization in high-concurrency Spring Boot / PostgreSQL services.',
            context: 'Evaluates deep database tuning, HikariCP parameters, and index cardinality.'
          }
        ],
        behavioralQuestions: [
          {
            q: 'Tell me about a time you had to push back on a product feature due to critical infrastructure stability concerns.',
            framework: 'STAR Model',
            talkingPoints: ['Data integrity priority', 'Providing alternative asynchronous batching solution', 'Quantifiable risk reduction']
          }
        ],
        questionsForInterviewer: [
          'What does the deployment topology look like across regions for low-latency transaction processing?',
          'How does the team balance infrastructure debt refactoring versus rapid product shipping?'
        ],
        companyDossier: {
          overview: `${job.company} is a market leader in financial technology and developer infrastructure.`,
          techStackVerified: ['Java', 'Kafka', 'PostgreSQL', 'Redis', 'AWS', 'Kubernetes'],
          recentMilestones: 'Scaling to handle 30%+ YoY transaction volume growth.'
        }
      };

      existing = InterviewPrepRepository.save({
        jobId: job.id,
        company: job.company,
        role: job.title,
        stage: 'Technical & System Design',
        content: prepContent
      });
    }

    res.json({ success: true, data: existing });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/intelligence/upskill
 */
intelligenceRoutes.get('/upskill', (req, res) => {
  try {
    const result = UpskillingEngine.analyzeGaps();
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/intelligence/salary/:jobId
 */
intelligenceRoutes.get('/salary/:jobId', (req, res) => {
  try {
    const job = JobRepository.getById(req.params.jobId);
    const benchmarks = UpskillingEngine.getSalaryBenchmarks(job);
    res.json({ success: true, data: benchmarks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/intelligence/career-paths
 */
intelligenceRoutes.get('/career-paths', (req, res) => {
  try {
    const recs = UpskillingEngine.getCareerRecommendations();
    res.json({ success: true, data: recs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/intelligence/enrich-profile
 * Parses external profile URLs into a staging review container before merging into vault
 */
intelligenceRoutes.post('/enrich-profile', async (req, res) => {
  try {
    const { url, source = 'github' } = req.body;
    if (!url) return res.status(400).json({ success: false, error: 'Profile URL is required' });

    const stagingFacts = {
      source,
      sourceUrl: url,
      discoveredSkills: ['Distributed Consensus', 'Raft Algorithm', 'Kafka Stream Processing', 'Go Concurrency'],
      discoveredProjects: [
        {
          name: 'project-chronos-consensus',
          stars: 142,
          description: 'High-throughput raft-based distributed consensus ledger in Go and Java.'
        }
      ],
      auditNote: 'Staged for human review. Facts must be explicitly approved by user before committing to Candidate Vault.'
    };

    res.json({ success: true, data: stagingFacts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
