import 'dotenv/config';
import fs from 'fs';
import path from 'path';

function required(key: string): string {
  const val = process.env[key];
  if (!val) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
  return val;
}

function parseList(key: string): string[] {
  const val = process.env[key];
  if (!val) return [];
  return val.split(',').map((item) => item.trim()).filter(Boolean);
}

function parseIntWithDefault(value: string | undefined, fallback: number): number {
  const parsed = parseInt(value || '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const projectCwd = required('PROJECT_CWD');
const statePath = process.env.STATE_PATH || path.join(projectCwd, '.slack-agent-state.json');
const stateDir = path.dirname(statePath);

if (!fs.existsSync(stateDir)) {
  fs.mkdirSync(stateDir, { recursive: true });
}

export const config = {
  slackAppToken: required('SLACK_APP_TOKEN'),
  slackBotToken: required('SLACK_BOT_TOKEN'),
  slackBotUserId: required('SLACK_BOT_USER_ID'),
  claudePath: process.env.CLAUDE_PATH || 'claude',
  claudeTimeoutMs: parseIntWithDefault(process.env.CLAUDE_TIMEOUT_MS, 120000),
  projectCwd,
  statePath,
  allowedChannels: parseList('ALLOWED_CHANNELS'),
  allowedUsers: parseList('ALLOWED_USERS'),
  maxQueueSize: parseIntWithDefault(process.env.MAX_QUEUE_SIZE, 20),
  slackContextMessages: parseIntWithDefault(process.env.SLACK_CONTEXT_MESSAGES, 8),
  maxReplyChars: parseIntWithDefault(process.env.MAX_REPLY_CHARS, 3000),
  readOnlyMode: (process.env.READ_ONLY_MODE || 'true').toLowerCase() !== 'false',
  allowedCommands: parseList('ALLOWED_COMMANDS'),
};
