# Slack Mention Agent

A local service that listens for `@mentions` of a Slack bot and routes them to Claude Code CLI for processing. Claude generates a response, and the agent posts it back to the Slack thread.

## Personal-Use Only

This tool is intended for personal use by the authenticated Claude Code user.

It is not designed to be:

- a shared team service
- a multi-user Claude proxy
- a way for coworkers to indirectly use your Claude subscription or local authenticated session
- an unrestricted bot in broad Slack channels

The recommended pattern is:

- one operator
- one or two allowlisted channels
- one or a few allowlisted users
- read-only mode enabled by default
- a small command allowlist

If you want a true multi-user integration, use a proper API-key-backed product architecture instead of routing requests through a local Claude Code session.

## How It Works

```text
Slack workspace
  -> @mention event
     -> Slack Socket Mode
        -> Local Node.js service
           -> Fetch recent thread context
           -> Spawn Claude Code CLI in the configured project
           -> Post the reply back to the Slack thread
```

Key behaviors:

- Socket Mode only, so no public inbound URL is required
- session continuity by Slack thread
- local project context via `PROJECT_CWD`
- persistent local state for dedupe and session mapping
- optional channel and user allowlists
- command allowlist
- read-only mode support
- Slack reply chunking for long outputs
- thread-scoped conversational listening mode with expiry

## Prerequisites

- Node.js 18+
- Claude Code CLI installed and authenticated
- a Slack workspace where you can create apps

## Slack App Setup

1. Create or reuse a Slack app at `https://api.slack.com/apps`
2. Enable Socket Mode
3. Generate an app-level token with `connections:write`
4. Add bot token scopes:
   - `app_mentions:read`
   - `channels:history`
   - `chat:write`
   - `groups:history` if private channels matter
5. Subscribe to the `app_mention` bot event
6. Install the app to the workspace
7. Copy the bot user ID

## Install

```bash
cd slack-agent
npm install
cp .env.example .env
```

## Configure

Edit `.env`:

```bash
SLACK_APP_TOKEN=xapp-...
SLACK_BOT_TOKEN=xoxb-...
SLACK_BOT_USER_ID=U0123456789
CLAUDE_PATH=claude
CLAUDE_TIMEOUT_MS=120000
PROJECT_CWD=/path/to/your/project
STATE_PATH=/path/to/state.json
ALLOWED_CHANNELS=C12345,C67890
ALLOWED_USERS=U12345
MAX_QUEUE_SIZE=20
SLACK_CONTEXT_MESSAGES=8
MAX_REPLY_CHARS=3000
LISTENING_TTL_MS=3600000
READ_ONLY_MODE=true
ALLOWED_COMMANDS=status,question,summarize,draft,help,listen
```

Recommended minimum settings for safe personal use:

- `PROJECT_CWD`
- `ALLOWED_CHANNELS`
- `ALLOWED_USERS`
- `READ_ONLY_MODE=true`
- `ALLOWED_COMMANDS`

## Run

```bash
npm run build
npm start
```

For development:

```bash
npm run dev
```

Invite the bot to a channel and mention it there.

## Architecture

| Module | Responsibility |
|---|---|
| `src/config.ts` | Loads and validates config |
| `src/state-store.ts` | Persists dedupe and thread session state locally |
| `src/claude-runner.ts` | Spawns Claude Code CLI |
| `src/event-handler.ts` | Enforces allowlists, fetches Slack context, builds prompt, posts replies |
| `src/index.ts` | Connects to Socket Mode and manages per-thread queues |

## Guardrails Added

This version includes the following hardening steps:

1. Authorization controls
   - optional channel allowlist
   - optional user allowlist

2. Tighter prompt contract
   - personal-use framing
   - read-only mode
   - refusal guidance for risky or secret-exposing requests

3. Persistent state
   - processed event timestamps survive restarts
   - thread-to-session mapping survives restarts

4. Explicit thread context ingestion
   - recent Slack thread messages are fetched and included in the prompt

5. Safer Slack delivery
   - long outputs are chunked before posting
   - queue size can be capped

6. Interaction narrowing
   - only explicit commands are accepted
   - free-form mentions are rejected instead of treated as open-ended instructions
   - simple secret redaction runs before replies are posted

7. Optional thread listening mode
   - `listen on` enables conversational replies in just that thread
   - `listen off` disables it
   - listening mode expires automatically after `LISTENING_TTL_MS`

## Limitations

- still a local automation bridge, not a hardened multi-user service
- no streaming replies
- one queue per thread, but still no broad workload scheduler
- no deep policy engine beyond allowlists and read-only guidance
- if your local Claude auth expires, requests will fail

## Recommended Operating Rules

- keep the bot out of broad team channels
- keep `READ_ONLY_MODE=true`
- keep `ALLOWED_COMMANDS` narrow
- point `PROJECT_CWD` at only one repo at a time
- do not use this with repositories containing secrets unless you understand the local risk
- monitor logs while it is running

## Supported Commands

Mentions should use one of these prefixes:

- `status:`
- `summarize:`
- `question:`
- `draft:`
- `listen on`
- `listen off`
- `help:`

Examples:

```text
@bot status: what's currently broken in this repo?
@bot question: why does this worker retry twice?
@bot summarize: the last few messages in this thread
@bot draft: a short reply to this stakeholder update
@bot listen on
reply normally in-thread without a command
@bot listen off
```

Messages without a supported command prefix are rejected unless listening mode is active for that thread. In listening mode, plain replies are treated as `question:` requests until the mode expires or is turned off.

## Build Check

```bash
npm run build
```

If the build passes, the TypeScript surface is sound. That does not guarantee runtime safety, so test in a low-risk Slack channel first.
