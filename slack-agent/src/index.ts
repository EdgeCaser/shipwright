import { SocketModeClient } from '@slack/socket-mode';
import { config } from './config.js';
import { handleMention, type AppMentionEvent } from './event-handler.js';

class ThreadQueueManager {
  private queues = new Map<string, AppMentionEvent[]>();
  private processing = new Set<string>();

  async add(event: AppMentionEvent) {
    const threadKey = event.thread_ts || event.ts;
    const queue = this.queues.get(threadKey) || [];

    if (queue.length >= config.maxQueueSize) {
      throw new Error(`Queue is full for thread ${threadKey} (${config.maxQueueSize})`);
    }

    queue.push(event);
    this.queues.set(threadKey, queue);

    if (!this.processing.has(threadKey)) {
      void this.processThread(threadKey);
    }
  }

  private async processThread(threadKey: string) {
    const queue = this.queues.get(threadKey);
    if (!queue || queue.length === 0) {
      this.processing.delete(threadKey);
      this.queues.delete(threadKey);
      return;
    }

    this.processing.add(threadKey);
    const event = queue.shift()!;

    try {
      await handleMention(event);
    } catch (err) {
      console.error(`[queue] Unhandled error in thread ${threadKey}:`, err);
    }

    if (queue.length === 0) {
      this.processing.delete(threadKey);
      this.queues.delete(threadKey);
      return;
    }

    void this.processThread(threadKey);
  }
}

async function main() {
  const socketClient = new SocketModeClient({
    appToken: config.slackAppToken,
  });

  const queueManager = new ThreadQueueManager();

  socketClient.on('app_mention', async ({ event, ack }) => {
    await ack();
    try {
      await queueManager.add(event as AppMentionEvent);
    } catch (err) {
      console.error('[queue] Rejected mention:', err);
    }
  });

  await socketClient.start();
  console.log('[slack-agent] Connected via Socket Mode. Listening for mentions...');
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exit(1);
});
