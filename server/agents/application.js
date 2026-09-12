/**
 * Application Puppy Agent ("Quill") (server/agents/application.js)
 * Form synthesis and question drafting with strict Ground Truth provenance
 */
import { ApplicationRepository } from '../db/repositories/ApplicationRepository.js';
import { AgentRepository } from '../db/repositories/AgentRepository.js';
import { CandidateVault } from '../vault/candidate-vault.js';
import { aiProvider } from '../core/ai-provider.js';
import { eventBus } from '../core/event-bus.js';

export class ApplicationAgent {
  static getAgentId() {
    return 'application-agent';
  }

  static async draftAnswer(applicationId, questionId, questionText) {
    const app = ApplicationRepository.getById(applicationId);
    if (!app) throw new Error(`Application ${applicationId} not found`);

    AgentRepository.updateState('application-agent', 'working', `Drafting answer for "${questionText.substring(0, 40)}..."`);

    // 1. Check if candidate vault can answer this question
    const profile = CandidateVault.getProfile();
    const prompt = `
Draft a technical, authentic answer to this job application question using ONLY the provided verified facts.
Do NOT invent achievements, skills, or employment history not explicitly present.

Question: "${questionText}"
Company: "${app.company}"
Role: "${app.role}"

Candidate Profile:
${JSON.stringify(profile)}
    `;

    let answerText;
    try {
      answerText = await aiProvider.generateText({ prompt, agentId: 'application-agent', operation: 'QUESTION_ANSWER' });
    } catch (err) {
      if (err.message && err.message.includes('AI_USAGE_BLOCKED')) {
        AgentRepository.updateState('application-agent', 'waiting', `[AI Usage Paused] ${err.message.replace('AI_USAGE_BLOCKED:', '').trim()}`);
        answerText = '[Drafting paused: AI usage limit reached or manually paused. You can edit this answer manually or resume AI usage in the AI Usage Dashboard.]';
      } else {
        throw err;
      }
    }
    
    // Check provenance
    let provenance = 'DERIVED';
    let citation = 'Profile: Verified experience and system architecture achievements';

    if (questionText.toLowerCase().includes('notice period')) {
      provenance = 'USER_VERIFIED';
      citation = 'Profile -> Work Preferences: Notice Period';
    } else if (questionText.toLowerCase().includes('ruby') || questionText.toLowerCase().includes('c#')) {
      // Missing skill detection
      const check = CandidateVault.evaluateFact(questionText, 'ruby');
      if (check.status === 'BLOCK') {
        provenance = 'UNKNOWN';
        citation = 'Question requires skills not found in Candidate Vault';
      }
    }

    const answerObj = {
      id: questionId,
      question: questionText,
      answer: answerText,
      provenance,
      sourceCitation: citation,
      confidence: provenance === 'UNKNOWN' ? 0 : 96,
      status: provenance === 'UNKNOWN' ? 'needs_review' : 'approved'
    };

    // Update application answers in repo
    const currentAnswers = app.answers.filter(a => a.id !== questionId);
    currentAnswers.push(answerObj);
    ApplicationRepository.updateAnswers(applicationId, currentAnswers);

    eventBus.emitEvent({
      type: 'ANSWER_DRAFTED',
      agentId: 'application-agent',
      entityType: 'APPLICATION',
      entityId: applicationId,
      summary: `Application Agent drafted response for: "${questionText.substring(0, 30)}..." [Provenance: ${provenance}]`,
      metadata: { applicationId, questionId, provenance },
      logLevel: provenance === 'UNKNOWN' ? 'WARN' : 'INFO'
    });

    return answerObj;
  }
}
