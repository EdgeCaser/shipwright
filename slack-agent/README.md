# Slack Mention Agent

A local service that listens for @mentions of a Slack bot and routes them to Claude Code CLI for processing. Claude generates a response, and the agent posts it back to the channel thread.

## How It Works

```
Slack workspace
  └─ @mention event
       └─ Slack Socket Mode (WebSocket)
            └─ Local Node.js service (this project)
                 └─ Spawns: claude -p "<prompt>" --resume <session>
                      └─ Claude generates reply text
                           └─ Agent posts reply via Slack Web API
```

- **Socket Mode**: No public URL or tunnel required — runs entirely local via outbound WebSocket
- **Session continuity**: Follow-up mentions in the same Slack thread resume the same Claude conversation
- **Project context**: Claude runs in your chosen project directory, so it has access to that project's files and CLAUDE.md
- **Queue processing**: Mentions are processed one at a time (FIFO) to avoid rate limits

## Prerequisites

- Node.js 18+
- Claude Code CLI installed and authenticated (`claude` in PATH)
- A Slack workspace where you can create apps

## Slack App Setup

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and create a new app (or use an existing one)

2. **Enable Socket Mode**: Settings > Socket Mode > toggle On

3. **Generate an App-Level Token**: Settings > Basic Information > App-Level Tokens > Generate Token
   - Name: anything (e.g., "socket-mode")
   - Scope: `connections:write`
   - Copy the `xapp-...` token

4. **Add Bot Token Scopes**: Features > OAuth & Permissions > Bot Token Scopes:
   - `app_mentions:read`
   - `channels:history`
   - `chat:write`
   - `groups:history` (optional, for private channels)

5. **Subscribe to events**: Features > Event Subscriptions > Enable Events > Subscribe to bot events:
   - Add `app_mention`

6. **Install the app** to your workspace (or reinstall if scopes changed)
   - Copy the Bot User OAuth Token (`xoxb-...`)

7. **Get the bot's user ID**: Click the bot's profile in Slack > ⋮ menu > Copy member ID (`U...`)

## Install & Configure

```bash
cd slack-agent
npm install
cp .env.example .env
```

Edit `.env` with your values:

```bash
SLACK_APP_TOKEN=xapp-...              # App-Level Token (step 3)
SLACK_BOT_TOKEN=xoxb-...              # Bot OAuth Token (step 6)
SLACK_BOT_USER_ID=U0123456789         # Bot's member ID (step 7)
CLAUDE_PATH=claude                    # Full path to claude CLI if not in PATH
CLAUDE_TIMEOUT_MS=120000              # Max time per Claude invocation
PROJECT_CWD=/path/to/your/project    # Directory Claude runs in
```

`PROJECT_CWD` controls which project Claude has context for. Set it to the repo you want the bot to assist with.

## Run

```bash
npm run build
npm start
```

For development with auto-reload:

```bash
npm run dev
```

Then invite the bot to a channel (`/invite @YourBot`) and @mention it.

## Architecture

| Module | Responsibility |
|--------|---------------|
| `src/config.ts` | Loads and validates environment variables |
| `src/claude-runner.ts` | Spawns `claude -p` with session resume support |
| `src/event-handler.ts` | Parses mentions, builds prompts, posts replies, tracks sessions |
| `src/index.ts` | Socket Mode connection and FIFO mention queue |

## Limitations

- **Single-user**: Designed for one person's workspace. Claude runs as the authenticated user.
- **No streaming**: The reply appears all at once after Claude finishes.
- **Cost**: Every mention triggers a Claude invocation. Consider which channels the bot is invited to.
- **Token expiry**: If the Claude CLI session expires, the agent will fail until re-authenticated.
