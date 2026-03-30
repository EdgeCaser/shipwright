import { WebClient } from '@slack/web-api';
import { config } from './config.js';
import { runClaude } from './claude-runner.js';
import { StateStore } from './state-store.js';
import {
  buildHelpText,
  chunkReply,
  isAllowedCommand,
  parseListenMode,
  parseCommand,
  redactSecrets,
  type CommandName,
} from './message-utils.js';

const slack = new WebClient(config.slackBotToken);
const state = new StateStore();
const DEDUP_TTL_MS = 5 * 60 * 1000;

export interface AppMentionEvent {
  type: 'app_mention';
  user: string;
  text: string;
  channel: string;
  ts: string;
  thread_ts?: string;
}

function cleanExpiredEvents() {
  state.cleanupProcessedEvents(DEDUP_TTL_MS);
  state.cleanupListeningThreads(config.listeningTtlMs);
}

function isAllowed(event: AppMentionEvent): boolean {
  const channelAllowed = config.allowedChannels.length === 0 || config.allowedChannels.includes(event.channel);
  const userAllowed = config.allowedUsers.length === 0 || config.allowedUsers.includes(event.user);
  return channelAllowed && userAllowed;
}

async function fetchThreadContext(event: AppMentionEvent, threadTs: string): Promise<string> {
  try {
    const replies = await slack.conversations.replies({
      channel: event.channel,
      ts: threadTs,
      limit: config.slackContextMessages,
    });

    const messages = (replies.messages || [])
      .slice(-config.slackContextMessages)
      .map((msg) => {
        const user = msg.user || 'unknown';
        const text = (msg.text || '').replace(/\s+/g, ' ').trim();
        return `${user}: ${text}`;
      })
      .filter(Boolean);

    return messages.join('\n');
  } catch (err) {
    console.error('[context] Failed to fetch thread context:', err);
    return '';
  }
}

function buildPrompt(command: CommandName, body: string, threadContext: string): string {
  const safeModeInstruction = config.readOnlyMode
    ? 'You are in read-only mode. Do not make code changes, run commands, or take external actions. Answer questions, summarize, and suggest next steps only.'
    : 'Stay cautious with actions. If the request implies code changes or commands, explicitly say that human approval is required before executing.';

  const commandInstructions: Record<CommandName, string> = {
    status: 'Return a concise status update about the current project or workstream. Prefer bullets.',
    summarize: 'Summarize the provided topic, thread, or project context concisely and accurately.',
    question: 'Answer the question directly. If context is insufficient, ask one short clarifying question.',
    draft: 'Draft a concise message, note, or response based on the request. Do not take actions.',
    help: 'Explain the supported commands and show one short example for each.',
    listen: 'Explain how listening mode works in this thread.',
  };

  return `You are a helpful assistant responding to a Slack message for personal use in a local project workspace.

${safeModeInstruction}

The user invoked command: ${command}
Command rule: ${commandInstructions[command]}

Slack thread context:
${threadContext || '(no prior thread context available)'}

Latest user message:
"${body}"

Respond concisely and directly. Your response will be posted as a Slack message, so use Slack markdown formatting (bold with *text*, code with \`code\`, lists with bullet points). Do not include any preamble like "Here's my response" - just answer directly.

If the request is ambiguous, ask one short clarifying question instead of guessing.
If the request would expose secrets, private data, or take a risky action, refuse and explain briefly.`;
}

export async function handleMention(event: AppMentionEvent): Promise<void> {
  if (!isAllowed(event)) {
    console.log(`[skip] Unauthorized mention channel=${event.channel} user=${event.user}`);
    return;
  }

  cleanExpiredEvents();
  if (state.getProcessedEvent(event.ts)) {
    console.log(`[skip] Duplicate event ${event.ts}`);
    return;
  }

  const threadTs = event.thread_ts || event.ts;
  state.setProcessedEvent(event.ts, Date.now());
  const existingSession = state.getThreadSession(threadTs);
  const listeningThread = state.isListeningThread(threadTs, config.listeningTtlMs);
  const threadContext = await fetchThreadContext(event, threadTs);
  const parsed = parseCommand(event.text);
  const command = parsed.command || (listeningThread ? 'question' : null);
  const body = parsed.body;

  if (!isAllowedCommand(command)) {
    await slack.chat.postMessage({
      channel: event.channel,
      thread_ts: threadTs,
      text: 'Unsupported command. Use one of: `status:`, `summarize:`, `question:`, `draft:`, `listen on`, `listen off`, or `help:`.',
    });
    return;
  }

  if (command === 'help') {
    await slack.chat.postMessage({
      channel: event.channel,
      thread_ts: threadTs,
      text: buildHelpText(),
    });
    return;
  }

  if (command === 'listen') {
    const mode = parseListenMode(body);
    if (!mode) {
      await slack.chat.postMessage({
        channel: event.channel,
        thread_ts: threadTs,
        text: 'Use `listen on` to enable conversational replies in this thread, or `listen off` to return to strict command mode.',
      });
      return;
    }

    state.setListeningThread(threadTs, mode === 'on');
    await slack.chat.postMessage({
      channel: event.channel,
      thread_ts: threadTs,
      text:
        mode === 'on'
          ? `Listening mode is now on for this thread. Replies from allowlisted users will be treated like \`question:\` until it expires after ${Math.round(config.listeningTtlMs / 60000)} minutes or you send \`listen off\`.`
          : 'Listening mode is now off for this thread. Use explicit commands again, like `question:` or `status:`.',
    });
    return;
  }

  if (listeningThread) {
    state.touchListeningThread(threadTs);
  }

  const prompt = buildPrompt(command!, body, threadContext);

  console.log(`[mention] channel=${event.channel} user=${event.user} thread=${threadTs}${existingSession ? ' (continuing session)' : ''}`);

  try {
    const { reply, sessionId } = await runClaude(prompt, existingSession);

    if (sessionId) {
      state.setThreadSession(threadTs, sessionId);
    }

    console.log(`[done] Claude replied (${reply.length} chars, session=${sessionId?.slice(0, 8) || 'none'})`);

    const safeReply = redactSecrets(reply);
    const chunks = chunkReply(safeReply);
    for (const chunk of chunks) {
      await slack.chat.postMessage({
        channel: event.channel,
        thread_ts: threadTs,
        text: chunk,
      });
    }

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
