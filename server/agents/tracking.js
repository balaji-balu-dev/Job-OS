/**
 * Tracking Puppy Agent ("Radar") (server/agents/tracking.js)
 * Pipeline telemetry, ATS status polling, and interview calendar sync
 */
import { ApplicationRepository } from '../db/repositories/ApplicationRepository.js';
import { JobRepository } from '../db/repositories/JobRepository.js';
import { AgentRepository } from '../db/repositories/AgentRepository.js';
import { eventBus } from '../core/event-bus.js';

export class TrackingAgent {
  static getAgentId() {
    return 'tracking-agent';
  }

  static async updateApplicationStage(jobId, newStatus) {
    AgentRepository.updateState('tracking-agent', 'working', `Updating pipeline status for job ${jobId} to "${newStatus}"`);

    const updatedJob = JobRepository.updateStatus(jobId, newStatus);

    eventBus.emitEvent({
      type: 'PIPELINE_STAGE_TRANSITION',
      agentId: 'tracking-agent',
      entityType: 'JOB',
      entityId: jobId,
      summary: `Tracking Agent updated ${updatedJob.company} (${updatedJob.title}) to stage: "${newStatus}".`,
      metadata: { jobId, newStatus },
      logLevel: 'INFO'
    });

    AgentRepository.updateState('tracking-agent', 'idle', 'Monitoring active application telemetry.');

    return updatedJob;
  }
}
