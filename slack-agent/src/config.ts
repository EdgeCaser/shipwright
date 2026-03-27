import 'dotenv/config';

function required(key: string): string {
  const val = process.env[key];
  if (!val) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
  return val;
}

export const config = {
  slackAppToken: required('SLACK_APP_TOKEN'),
  slackBotToken: required('SLACK_BOT_TOKEN'),
  slackBotUserId: required('SLACK_BOT_USER_ID'),
  claudePath: process.env.CLAUDE_PATH || 'claude',
  claudeTimeoutMs: parseInt(process.env.CLAUDE_TIMEOUT_MS || '120000', 10),
  projectCwd: required('PROJECT_CWD'),
};
