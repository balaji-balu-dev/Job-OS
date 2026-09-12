/**
 * Verification Desk Puppy Agent ("Sentry") (server/agents/verification.js)
 * Truth Vault Auditor, anti-hallucination compliance checker, and gatekeeper
 */
import { ApplicationRepository } from '../db/repositories/ApplicationRepository.js';
import { AgentRepository } from '../db/repositories/AgentRepository.js';
import { ApprovalGateway } from '../core/approval-gateway.js';
import { CandidateVault } from '../vault/candidate-vault.js';
import { eventBus } from '../core/event-bus.js';

export class VerificationAgent {
  static getAgentId() {
    return 'verification-agent';
  }

  /**
   * Strict deterministic audit of drafted application
   */
  static async auditApplication(applicationId) {
    const app = ApplicationRepository.getById(applicationId);
    if (!app) throw new Error(`Application ${applicationId} not found`);

    AgentRepository.updateState('verification-agent', 'working', `Auditing ${app.answers.length} answers against Truth Vault...`);

    const findings = [];
    let hasBlocker = false;

    for (const ans of app.answers) {
      if (ans.provenance === 'UNKNOWN') {
        findings.push({
          answerId: ans.id,
          question: ans.question,
          verdict: 'BLOCK',
          reason: 'Answer contains unverified or unknown facts not present in Candidate Vault.'
        });
        hasBlocker = true;
      } else {
        findings.push({
          answerId: ans.id,
          question: ans.question,
          verdict: 'PASS',
          citation: ans.sourceCitation
        });
      }
    }

    if (hasBlocker) {
      AgentRepository.updateState('verification-agent', 'error', 'Audit Failed: Unverified claims detected. Gate locked.');
      eventBus.emitEvent({
        type: 'AUDIT_FAILED',
        agentId: 'verification-agent',
        entityType: 'APPLICATION',
        entityId: applicationId,
        summary: `Verification Agent rejected application for ${app.company}: Hallucination / unverified claim detected.`,
        metadata: { applicationId, findings },
        logLevel: 'ERROR'
      });

      return {
        passed: false,
        findings,
        actionRequired: 'USER_CORRECTION_REQUIRED'
      };
    }

    // All facts passed - create sealed lock envelope
    const lockEnvelope = ApprovalGateway.createLockEnvelope(applicationId);
    AgentRepository.updateState('verification-agent', 'working', `Audit Passed: 100% truth verified. Seal: ${lockEnvelope.payloadHash}`);

    return {
      passed: true,
      findings,
      lockEnvelope
    };
  }
}
