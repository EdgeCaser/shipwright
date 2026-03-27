import { WebClient } from '@slack/web-api';
import { config } from './config.js';
import { runClaude } from './claude-runner.js';

const slack = new WebClient(config.slackBotToken);

// Deduplication: track processed event timestamps with a 5-minute TTL
const processedEvents = new Map<string, number>();
const DEDUP_TTL_MS = 5 * 60 * 1000;

// Session continuity: map thread_ts -> Claude session ID
const threadSessions = new Map<string, string>();

function cleanExpiredEvents() {
  const now = Date.now();
  for (const [key, timestamp] of processedEvents) {
    if (now - timestamp > DEDUP_TTL_MS) {
      processedEvents.delete(key);
    }
  }
}

function stripMention(text: string): string {
  return text.replace(new RegExp(`<@${config.slackBotUserId}>`, 'g'), '').trim();
}

function buildPrompt(event: AppMentionEvent): string {
  const cleanedText = stripMention(event.text);

  return `You are a helpful assistant responding to a Slack message.

The user said: "${cleanedText}"

Respond concisely and directly. Your response will be posted as a Slack message, so use Slack markdown formatting (bold with *text*, code with \`code\`, lists with bullet points). Do not include any preamble like "Here's my response" — just answer directly.`;
}

export interface AppMentionEvent {
  type: 'app_mention';
  user: string;
  text: string;
  channel: string;
  ts: string;
  thread_ts?: string;
}

export async function handleMention(event: AppMentionEvent): Promise<void> {
  // Dedup check
  cleanExpiredEvents();
  if (processedEvents.has(event.ts)) {
    console.log(`[skip] Duplicate event ${event.ts}`);
    return;
  }
  processedEvents.set(event.ts, Date.now());

  const prompt = buildPrompt(event);
  const threadTs = event.thread_ts || event.ts;
  const existingSession = threadSessions.get(threadTs);

  console.log(`[mention] channel=${event.channel} user=${event.user} thread=${threadTs}${existingSession ? ' (continuing session)' : ''}`);

  try {
    const { reply, sessionId } = await runClaude(prompt, existingSession);

    // Store session ID for thread continuity
    if (sessionId) {
      threadSessions.set(threadTs, sessionId);
    }

    console.log(`[done] Claude replied (${reply.length} chars, session=${sessionId?.slice(0, 8) || 'none'})`);

    await slack.chat.postMessage({
      channel: event.channel,
      thread_ts: threadTs,
      text: reply,
    });
    console.log(`[posted] Reply sent to thread ${threadTs}`);
  } catch (err) {
    console.error(`[error] Failed for event ${event.ts}:`, err);

    try {
      await slack.chat.postMessage({
        channel: event.channel,
        thread_ts: threadTs,
        text: "Sorry, I couldn't complete that in time.",
      });
    } catch (fallbackErr) {
      console.error('[error] Fallback message failed:', fallbackErr);
    }
  }
}
