/**
 * Orchestrator Puppy Agent ("Chief") (server/agents/orchestrator.js)
 * Master command podium, DAG dependency coordinator, and concurrency manager
 */
import { AgentRepository } from '../db/repositories/AgentRepository.js';
import { TaskRepository } from '../db/repositories/TaskRepository.js';
import { eventBus } from '../core/event-bus.js';

export class OrchestratorAgent {
  static getAgentId() {
    return 'orchestrator';
  }

  /**
   * Schedules a new task into the orchestrator execution ledger
   */
  static async scheduleTask({ type, agentId, payload, priority = 5, dependencies = [] }) {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const correlationId = payload.correlationId || `corr-${Date.now()}`;
    const idempotencyKey = `${type}::${payload.targetId || 'global'}::${JSON.stringify(payload).length}`;

    // Check for existing task with same idempotency key
    const existing = TaskRepository.getByIdempotencyKey(idempotencyKey);
    if (existing && (existing.status === 'COMPLETED' || existing.status === 'RUNNING')) {
      return existing;
    }

    const task = TaskRepository.create({
      id: taskId,
      correlationId,
      type,
      agentId,
      status: 'PENDING',
      priority,
      payload,
      idempotencyKey,
      dependencies
    });

    eventBus.emitEvent({
      type: 'TASK_SCHEDULED',
      agentId: 'orchestrator',
      entityType: 'SYSTEM',
      entityId: taskId,
      summary: `Orchestrator dispatched task "${type}" to agent "${agentId}".`,
      metadata: { taskId, type, agentId, priority },
      logLevel: 'INFO'
    });

    return task;
  }

  /**
   * Emergency Pause / Resume for entire fleet
   */
  static toggleEmergencyPause(paused) {
    const agents = AgentRepository.getAll();
    const newState = paused ? 'waiting' : 'working';

    for (const a of agents) {
      AgentRepository.updateState(a.id, newState);
    }

    eventBus.emitEvent({
      type: paused ? 'EMERGENCY_PAUSE_ACTIVE' : 'FLEET_RESUMED',
      agentId: 'orchestrator',
      entityType: 'SYSTEM',
      entityId: 'fleet-all',
      summary: paused ? 'Emergency Pause Active: All 7 autonomous agent tasks safely paused.' : 'Office Resumed: All agents active.',
      metadata: { paused },
      logLevel: paused ? 'WARN' : 'INFO'
    });

    return { paused, activeCount: paused ? 0 : 7 };
  }
}
