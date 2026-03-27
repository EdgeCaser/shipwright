# Slack Mention Agent — Technical Spec

## Overview

Build a local service that listens for @mentions of a Slack bot and routes them to Claude Code CLI for processing. The agent can use the existing Slack MCP integration to read context and respond in-channel.

This lives in the `shipwright` repo.

## Architecture

```
Slack workspace
  └─ @mention event
       └─ Slack Socket Mode (WebSocket)
            └─ Local Node.js service (this project)
                 └─ Spawns: claude -p "<prompt>" --allowedTools "mcp__slack__*"
                      └─ Claude Code uses Slack MCP tools to:
                           - Read thread context
                           - Post reply in channel
```

### Why Socket Mode

- No public URL or ngress tunnel required
- Runs entirely local — ideal for a personal workspace
- Uses an App-Level Token (begins with `xapp-`) instead of exposing an HTTP endpoint
- WebSocket connection initiated outbound from this service

### Why Claude CLI (not the API directly)

- Inherits the user's existing MCP server config (Slack, etc.) without re-implementing auth
- Handles tool orchestration, permissions, and context natively
- Non-interactive mode (`-p` flag) accepts a prompt and runs to completion
- The agent IS Claude Code — we're just giving it a trigger

## Slack App Setup

The Slack app needs these additional configurations beyond what the MCP connector already provides. This may require a separate app or extending the existing one.

### Required Scopes (Bot Token)

- `app_mentions:read` — receive @mention events
- `channels:history` — read messages in public channels (for thread context)
- `chat:write` — post replies
- `groups:history` — read messages in private channels (if needed)

### Event Subscriptions

- Subscribe to `app_mention` event (Bot Events)
- Use Socket Mode (not Request URL)

### App-Level Token

- Generate under Settings > Basic Information > App-Level Tokens
- Scope: `connections:write`
- This token (`xapp-...`) is used ONLY for the Socket Mode WebSocket connection
- It is NOT the same as the bot token (`xoxb-...`) or the MCP OAuth token

## Project Structure

```
shipwright/
├── slack-agent/
│   ├── package.json
│   ├── src/
│   │   ├── index.ts          # Entry point — Socket Mode connection
│   │   ├── event-handler.ts  # Parses app_mention events, extracts context
│   │   ├── claude-runner.ts  # Spawns claude CLI with prompt
│   │   └── config.ts         # Environment/config management
│   ├── .env.example
│   └── README.md
```

## Core Implementation Details

### 1. Socket Mode Connection (`index.ts`)

Use `@slack/socket-mode` and `@slack/web-api`:

```bash
npm install @slack/socket-mode @slack/web-api
```

```typescript
import { SocketModeClient } from '@slack/socket-mode';

const socketClient = new SocketModeClient({
  appToken: process.env.SLACK_APP_TOKEN, // xapp-...
});

socketClient.on('app_mention', async ({ event, ack }) => {
  await ack();
  handleMention(event);
});

await socketClient.start();
```

### 2. Event Parsing (`event-handler.ts`)

The `app_mention` event payload contains:

```typescript
interface AppMentionEvent {
  type: 'app_mention';
  user: string;        // Who mentioned the bot
  text: string;        // Full message text including the @mention
  channel: string;     // Channel ID
  ts: string;          // Message timestamp (used as thread ID)
  thread_ts?: string;  // Parent thread timestamp (if in a thread)
}
```

Strip the bot's `<@USER_ID>` from the text to get the actual instruction. If `thread_ts` exists, the mention is inside a thread — the agent should read thread context before responding.

### 3. Claude CLI Invocation (`claude-runner.ts`)

Spawn claude in non-interactive mode:

```typescript
import { execFile } from 'child_process';

function runClaude(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = execFile('claude', [
      '-p', prompt,
      '--output-format', 'text',
      '--max-turns', '10',
      '--allowedTools', 'mcp__slack__*'
    ], {
      timeout: 120_000,  // 2 minute timeout
      cwd: process.cwd(),
    }, (error, stdout, stderr) => {
      if (error) return reject(error);
      resolve(stdout);
    });
  });
}
```

### 4. Prompt Construction

The prompt sent to Claude should include:

```
You were mentioned in Slack channel #{channel_name} by @{username}.

Their message: "{cleaned_text}"

{if thread_ts: "This is in a thread. Read the thread first for context using the Slack MCP tools."}

Instructions:
- Use the Slack MCP tools to respond in the channel.
- Reply in the same thread if this was a threaded message (thread_ts: {thread_ts}).
- Keep responses concise and actionable.
- If you need more context, read recent channel messages first.
- Do NOT use any tools other than the Slack MCP tools.
```

## Concurrency & Safety

### Queue Processing

Do NOT spawn multiple Claude CLI instances simultaneously. Use a simple FIFO queue:

```typescript
class MentionQueue {
  private queue: MentionEvent[] = [];
  private processing = false;

  async add(event: MentionEvent) {
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
      console.error('Failed to handle mention:', err);
    }
    this.processNext();
  }
}
```

This keeps things predictable and avoids rate limit issues with both Claude and Slack.

### Timeout Handling

- Set a 2-minute timeout on the Claude CLI process
- If it times out, post a fallback message: "Sorry, I couldn't complete that in time."
- Use the Slack Web API directly (not MCP) for this fallback so it doesn't depend on Claude

### Deduplication

Slack may retry event delivery. Track processed `event.ts` values in a Set with a TTL to avoid double-processing.

## Environment Variables

```bash
# .env
SLACK_APP_TOKEN=xapp-...         # App-Level Token for Socket Mode
SLACK_BOT_TOKEN=xoxb-...         # Bot token for fallback messages (Web API)
SLACK_BOT_USER_ID=U0123456789    # Bot's user ID (to strip from mentions)
CLAUDE_PATH=claude               # Path to claude CLI if not in PATH
MAX_CONCURRENT=1                 # Max concurrent Claude processes
CLAUDE_TIMEOUT_MS=120000         # CLI timeout
```

## Running

```bash
cd shipwright/slack-agent
npm install
npm run build
npm start
```

For development:

```bash
npm run dev  # ts-node with watch
```

Consider running as a background service via PM2 or a simple systemd unit if on Linux/WSL. On Windows, can run in a persistent terminal session or as a scheduled task at login.

## Known Risks & Limitations

1. **Slack MCP OAuth token expiry** — The MCP OAuth token may expire. If Claude CLI fails to use Slack tools, the user needs to re-authenticate the MCP connection in an interactive Claude Code session.

2. **Claude CLI availability** — The `claude` binary must be in PATH and authenticated. If the session expires, the agent will fail silently until re-authenticated.

3. **No streaming** — The bot won't show typing indicators or partial responses. The reply appears all at once after Claude finishes.

4. **Single-user** — This is designed for one person's workspace. The Claude CLI runs as the authenticated user with their MCP config.

5. **MCP scope** — The Slack MCP tools available depend on which scopes were granted during OAuth. If the agent can't perform an action, the OAuth flow may need to be re-done with broader scopes.

6. **Cost** — Every mention triggers a Claude API call. In a busy channel, this could add up. Consider adding a rate limit or allowlist of channels/users.

## Future Enhancements

- **Reaction-based triggers** — React with a specific emoji (e.g., 🤖) to trigger the agent on any message, not just @mentions
- **Channel allowlist** — Only respond in specific channels
- **User allowlist** — Only respond to specific users
- **Persistent context** — Pass a CLAUDE.md or system prompt that gives the agent persona/instructions specific to your team
- **Thread memory** — On follow-up mentions in the same thread, include prior thread context automatically
- **Health check endpoint** — Simple HTTP server for monitoring uptime
- **Webhook mode** — Alternative to Socket Mode if running on a server with a public URL
