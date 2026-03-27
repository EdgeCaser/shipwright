import fs from 'fs';
import { config } from './config.js';

interface StoredState {
  processedEvents: Record<string, number>;
  threadSessions: Record<string, string>;
}

const DEFAULT_STATE: StoredState = {
  processedEvents: {},
  threadSessions: {},
};

export class StateStore {
  private state: StoredState;

  constructor() {
    this.state = this.load();
  }

  private load(): StoredState {
    try {
      if (!fs.existsSync(config.statePath)) {
        return { ...DEFAULT_STATE };
      }
      const raw = fs.readFileSync(config.statePath, 'utf8');
      const parsed = JSON.parse(raw) as Partial<StoredState>;
      return {
        processedEvents: parsed.processedEvents || {},
        threadSessions: parsed.threadSessions || {},
      };
    } catch (err) {
      console.error('[state] Failed to load state, starting fresh:', err);
      return { ...DEFAULT_STATE };
    }
  }

  private persist() {
    fs.writeFileSync(config.statePath, JSON.stringify(this.state, null, 2), 'utf8');
  }

  getProcessedEvent(ts: string): number | undefined {
    return this.state.processedEvents[ts];
  }

  setProcessedEvent(ts: string, timestamp: number) {
    this.state.processedEvents[ts] = timestamp;
    this.persist();
  }

  cleanupProcessedEvents(ttlMs: number) {
    const now = Date.now();
    let changed = false;
    for (const [key, timestamp] of Object.entries(this.state.processedEvents)) {
      if (now - timestamp > ttlMs) {
        delete this.state.processedEvents[key];
        changed = true;
      }
    }
    if (changed) this.persist();
  }

  getThreadSession(threadTs: string): string | undefined {
    return this.state.threadSessions[threadTs];
  }

  setThreadSession(threadTs: string, sessionId: string) {
    this.state.threadSessions[threadTs] = sessionId;
    this.persist();
  }
}
