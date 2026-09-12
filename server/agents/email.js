/**
 * Email Puppy Agent ("Courier") (server/agents/email.js)
 * Recruiter correspondence drafting, polite tone calibration, and review queue staging
 */
import { AgentRepository } from '../db/repositories/AgentRepository.js';
import { AttentionRepository } from '../db/repositories/AttentionRepository.js';
import { aiProvider } from '../core/ai-provider.js';
import { eventBus } from '../core/event-bus.js';

export class EmailAgent {
  static getAgentId() {
    return 'email-agent';
  }

  static async draftRecruiterReply({ recruiterName, company, incomingMessage }) {
    AgentRepository.updateState('email-agent', 'working', `Drafting response to ${recruiterName} @ ${company}...`);

    const prompt = `
Draft a polite, professional, and technically calibrated email reply to this recruiter inquiry:
Recruiter: ${recruiterName} (${company})
Message: "${incomingMessage}"
Candidate: Balaji S. (Senior Backend / Distributed Systems Engineer)

Tone: Highly professional, appreciative, confirming interview availability.
    `;

    let body;
    try {
      body = await aiProvider.generateText({ prompt, agentId: 'email-agent', operation: 'RECRUITER_REPLY' });
    } catch (err) {
      if (err.message && err.message.includes('AI_USAGE_BLOCKED')) {
        AgentRepository.updateState('email-agent', 'waiting', `[AI Usage Paused] ${err.message.replace('AI_USAGE_BLOCKED:', '').trim()}`);
        body = `Hi ${recruiterName},\n\nThank you for reaching out regarding the opportunity at ${company}! I would be glad to connect for a technical discussion. Please let me know what times work best for your team.\n\nBest regards,\nBalaji S.`;
      } else {
        throw err;
      }
    }

    // Stage draft in Attention Items (Human Gate)
    const attentionItem = AttentionRepository.create({
      type: 'email_approval',
      urgency: 'medium',
      title: `${company} — Recruiter Confirmation Draft`,
      description: `Email Agent drafted a personalized confirmation for ${recruiterName}. Awaiting your explicit approval to send.`,
      agent: 'email-agent',
      action_label: 'Review Draft Email',
      target_view: 'interviews',
      target_id: `email-${company.toLowerCase()}`
    });

    AgentRepository.updateState('email-agent', 'waiting', `Draft staged for ${recruiterName}. Enforcing human review gate.`);

    eventBus.emitEvent({
      type: 'EMAIL_DRAFT_STAGED',
      agentId: 'email-agent',
      entityType: 'APPLICATION',
      entityId: attentionItem.id,
      summary: `Email Agent drafted recruiter reply for ${company}. Staged in Attention Queue.`,
      metadata: { recruiterName, company, attentionItemId: attentionItem.id },
      logLevel: 'INFO'
    });

    return {
      attentionItemId: attentionItem.id,
      subject: `Confirmation: Technical Discussion — Balaji S. & ${company}`,
      body
    };
  }
}
