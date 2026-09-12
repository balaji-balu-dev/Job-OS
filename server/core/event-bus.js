/**
 * Event Bus (server/core/event-bus.js)
 * High-reliability event dispatcher with persistent SQLite audit ledger
 */
import { EventEmitter } from 'node:events';
import { EventRepository } from '../db/repositories/EventRepository.js';

class JobOSEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  emitEvent(event) {
    // 1. Write to persistent audit log first
    let persisted;
    try {
      persisted = EventRepository.append(event);
    } catch (err) {
      console.error('Failed to persist event:', err);
      persisted = { ...event, timestamp: Date.now() };
    }

    // 2. Emit typed event and wildcard event
    this.emit(event.type, persisted);
    this.emit('*', persisted);
    return persisted;
  }
}

export const eventBus = new JobOSEventBus();
export const EventBus = {
  publish: (event) => eventBus.emitEvent(event),
  emitEvent: (event) => eventBus.emitEvent(event),
  on: (...args) => eventBus.on(...args)
};

