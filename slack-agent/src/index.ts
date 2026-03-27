import { SocketModeClient } from '@slack/socket-mode';
import { config } from './config.js';
import { handleMention, type AppMentionEvent } from './event-handler.js';

// FIFO queue — one Claude process at a time
class MentionQueue {
  private queue: AppMentionEvent[] = [];
  private processing = false;

  async add(event: AppMentionEvent) {
    this.queue.push(event);
    if (!this.processing) this.processNext();
  }

  private async processNext() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }
    this.processing = true;
    const event = this.queue.shift()!;
    try {
      await handleMention(event);
    } catch (err) {
      console.error('[queue] Unhandled error:', err);
    }
    this.processNext();
  }
}

async function main() {
  const socketClient = new SocketModeClient({
    appToken: config.slackAppToken,
  });

  const queue = new MentionQueue();

  socketClient.on('app_mention', async ({ event, ack }) => {
    await ack();
    queue.add(event as AppMentionEvent);
  });

  await socketClient.start();
  console.log('[slack-agent] Connected via Socket Mode. Listening for mentions...');
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exit(1);
});
