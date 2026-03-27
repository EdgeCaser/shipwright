import { config } from './config.js';

export type CommandName = 'status' | 'summarize' | 'question' | 'draft' | 'help';

export function stripMention(text: string): string {
  return text.replace(new RegExp(`<@${config.slackBotUserId}>`, 'g'), '').trim();
}

export function parseCommand(text: string): { command: CommandName | null; body: string } {
  const cleaned = stripMention(text);
  const match = cleaned.match(/^([a-zA-Z_-]+)\s*:\s*([\s\S]*)$/);
  if (!match) {
    return { command: null, body: cleaned };
  }

  const command = match[1].toLowerCase() as CommandName;
  const body = match[2].trim();
  return { command, body };
}

export function isAllowedCommand(command: CommandName | null): boolean {
  if (!command) return false;
  if (config.allowedCommands.length === 0) return true;
  return config.allowedCommands.includes(command);
}

export function buildHelpText(): string {
  return [
    '*Supported commands*',
    '- `status:` get a concise project or workstream status',
    '- `question:` ask a direct question about the current repo or thread',
    '- `summarize:` summarize a topic or thread',
    '- `draft:` draft a short message or response',
    '- `help:` show this command list',
    '',
    '*Examples*',
    '- `@bot status: what is blocked right now?`',
    '- `@bot question: why did this worker fail?`',
    '- `@bot summarize: the current thread`',
    '- `@bot draft: a short reply to this update`',
  ].join('\n');
}

export function redactSecrets(text: string): string {
  return text
    .replace(/\b(xox[baprs]-[A-Za-z0-9-]+)\b/g, '[REDACTED_SLACK_TOKEN]')
    .replace(/\b(xapp-[A-Za-z0-9-]+)\b/g, '[REDACTED_SLACK_APP_TOKEN]')
    .replace(/\b(sk-[A-Za-z0-9_-]{12,})\b/g, '[REDACTED_API_KEY]')
    .replace(/\b(AKIA[0-9A-Z]{16})\b/g, '[REDACTED_AWS_KEY]')
    .replace(/\b(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g, '[REDACTED_GITHUB_TOKEN]');
}

export function chunkReply(reply: string): string[] {
  const normalized = reply.trim();
  if (normalized.length <= config.maxReplyChars) return [normalized];

  const chunks: string[] = [];
  let remaining = normalized;

  while (remaining.length > config.maxReplyChars) {
    let splitAt = remaining.lastIndexOf('\n', config.maxReplyChars);
    if (splitAt < config.maxReplyChars * 0.5) {
      splitAt = remaining.lastIndexOf(' ', config.maxReplyChars);
    }
    if (splitAt <= 0) splitAt = config.maxReplyChars;
    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}
