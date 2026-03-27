import fs from 'fs';
import { config } from './config.js';

interface StoredState {
  processedEvents: Record<string, number>;
  threadSessions: Record<string, string>;
  listeningThreads: Record<string, number>;
}

const DEFAULT_STATE: StoredState = {
  processedEvents: {},
  threadSessions: {},
  listeningThreads: {},
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
        listeningThreads: parsed.listeningThreads || {},
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

  isListeningThread(threadTs: string, ttlMs: number): boolean {
    const timestamp = this.state.listeningThreads[threadTs];
    if (!timestamp) return false;
    if (Date.now() - timestamp > ttlMs) {
      delete this.state.listeningThreads[threadTs];
      this.persist();
      return false;
    }
    return true;
  }

  setListeningThread(threadTs: string, enabled: boolean) {
    if (enabled) {
      this.state.listeningThreads[threadTs] = Date.now();
    } else {
      delete this.state.listeningThreads[threadTs];
    }
    this.persist();
  }

  touchListeningThread(threadTs: string) {
    if (!this.state.listeningThreads[threadTs]) return;
    this.state.listeningThreads[threadTs] = Date.now();
    this.persist();
  }

  cleanupListeningThreads(ttlMs: number) {
    const now = Date.now();
    let changed = false;
    for (const [key, timestamp] of Object.entries(this.state.listeningThreads)) {
      if (now - timestamp > ttlMs) {
        delete this.state.listeningThreads[key];
        changed = true;
      }
    }
    if (changed) this.persist();
  }
}
