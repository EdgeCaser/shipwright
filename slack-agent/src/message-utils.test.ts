import test from 'node:test';
import assert from 'node:assert/strict';

process.env.SLACK_APP_TOKEN = process.env.SLACK_APP_TOKEN || 'xapp-test';
process.env.SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || 'xoxb-test';
process.env.SLACK_BOT_USER_ID = process.env.SLACK_BOT_USER_ID || 'U_TEST';
process.env.PROJECT_CWD = process.env.PROJECT_CWD || process.cwd();
process.env.MAX_REPLY_CHARS = '40';
process.env.ALLOWED_COMMANDS = 'status,question,summarize,draft,help';

// Load after env setup so config.ts sees the test values.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  buildHelpText,
  chunkReply,
  isAllowedCommand,
  parseCommand,
  redactSecrets,
} = require('./message-utils.js');

test('parseCommand extracts command and body', () => {
  const parsed = parseCommand('<@U_TEST> status: what is blocked?');
  assert.equal(parsed.command, 'status');
  assert.equal(parsed.body, 'what is blocked?');
});

test('parseCommand rejects free-form mentions', () => {
  const parsed = parseCommand('<@U_TEST> just tell me what is happening');
  assert.equal(parsed.command, null);
  assert.equal(parsed.body, 'just tell me what is happening');
});

test('isAllowedCommand respects configured allowlist', () => {
  assert.equal(isAllowedCommand('status'), true);
  assert.equal(isAllowedCommand('help'), true);
  assert.equal(isAllowedCommand(null), false);
});

test('chunkReply splits long output into bounded chunks', () => {
  const chunks = chunkReply('1234567890 1234567890 1234567890 1234567890 1234567890');
  assert.ok(chunks.length > 1);
  for (const chunk of chunks) {
    assert.ok(chunk.length <= 40);
  }
});

test('redactSecrets masks common token patterns', () => {
  const redacted = redactSecrets('token xoxb-1234567890-secret and ghp_abcdefghijklmnopqrstuvwxyz123456');
  assert.ok(redacted.includes('[REDACTED_SLACK_TOKEN]'));
  assert.ok(redacted.includes('[REDACTED_GITHUB_TOKEN]'));
});

test('buildHelpText includes supported commands', () => {
  const text = buildHelpText();
  assert.ok(text.includes('`status:`'));
  assert.ok(text.includes('`help:`'));
});
