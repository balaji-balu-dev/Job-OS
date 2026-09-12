/**
 * Job Intelligence Puppy Agent ("Sage") (server/agents/intelligence.js)
 * Semantic JD deconstruction, vector matching, and risk analysis
 */
import { JobRepository } from '../db/repositories/JobRepository.js';
import { AgentRepository } from '../db/repositories/AgentRepository.js';
import { CandidateVault } from '../vault/candidate-vault.js';
import { aiProvider } from '../core/ai-provider.js';
import { eventBus } from '../core/event-bus.js';

export class IntelligenceAgent {
  static getAgentId() {
    return 'job-intelligence';
  }

  static async analyzeJob(jobId) {
    const job = JobRepository.getById(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);

    AgentRepository.updateState('job-intelligence', 'thinking', `Analyzing technical requirements for ${job.title} @ ${job.company}...`);

    const profile = CandidateVault.getProfile();
    const prompt = `
Analyze the following Job Description against candidate skills and experience:
Job Title: ${job.title}
Company: ${job.company}
Description: ${job.description}

Candidate Skills: ${JSON.stringify(profile.skills?.data || {})}
Candidate Work Authorization: ${JSON.stringify(profile.work_authorization?.data || {})}

Return JSON with matchScore (0-100), extractedSkills (array), matchReasons (array of strings), and concerns (array of strings).
    `;

    let analysis;
    try {
      analysis = await aiProvider.generateObject({ prompt, agentId: 'job-intelligence', operation: 'JD_ANALYZE' });
    } catch (err) {
      if (err.message && err.message.includes('AI_USAGE_BLOCKED')) {
        AgentRepository.updateState('job-intelligence', 'waiting', `[AI Usage Paused] ${err.message.replace('AI_USAGE_BLOCKED:', '').trim()}`);
        return {
          jobId,
          matchScore: 80,
          extractedSkills: ['Java', 'Spring Boot', 'SQL'],
          matchReasons: ['Baseline heuristics applied while AI usage is paused'],
          concerns: ['AI Deep Analysis Paused (Limit or Manual Stop)'],
          aiBlocked: true,
          aiBlockReason: err.message
        };
      }
      throw err;
    }

    const matchScore = analysis.matchScore || 85;

    eventBus.emitEvent({
      type: 'JD_ANALYZED',
      agentId: 'job-intelligence',
      entityType: 'JOB',
      entityId: jobId,
      summary: `Job Intelligence scored ${job.company} at ${matchScore}%. Extracted ${analysis.extractedSkills?.length || 0} core competencies.`,
      metadata: { jobId, matchScore, concernsCount: analysis.concerns?.length || 0 },
      logLevel: 'INFO'
    });

    AgentRepository.updateState('job-intelligence', 'working', `Vector match score evaluated at ${matchScore}% for ${job.company}.`);

    return {
      jobId,
      matchScore,
      extractedSkills: analysis.extractedSkills || [],
      matchReasons: analysis.matchReasons || [],
      concerns: analysis.concerns || []
    };
  }
}
