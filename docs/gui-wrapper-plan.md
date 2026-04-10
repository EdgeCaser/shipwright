# Shipwright GUI Wrapper — Plan

**Status:** Spike complete — Architecture B active (per-message spawn with `--resume`)  
**Branch:** `feature/gui-wrapper`  
**Scope:** Thought experiment → buildable spec

---

## Problem

Shipwright already supports plain-language routing via AGENTS.md for Codex users — slash commands are optional, not required. The real gap is narrower: Claude Code has no visual surface for project files or artifacts, and there is no entry point for PM collaborators who are not running a terminal at all. The friction is not syntax; it is the absence of a GUI.

**Wedge:** A visual, project-aware GUI for Claude Code users and non-terminal PM collaborators who want to run Shipwright workflows and review outputs without touching a terminal.

---

## Proposal

A lightweight desktop application that wraps the user's existing `claude` CLI installation in a three-panel GUI. No reimplementation of the underlying AI or orchestration — the CLI session runs behind the curtain, the app just provides a better surface.

**Key constraint:** Requires Claude Code already installed. This is a wrapper, not a replacement.

---

## Architecture

### Process model

**⚠ Unverified assumption — spike required before build.**

The plan assumes the app can spawn a long-lived `claude` subprocess with `--output-format stream-json`, pipe user input to its stdin, and consume a structured JSON event stream on its stdout across multiple turns. The CLI reference documents `--output-format` as a flag for print mode (`claude --print`), not general interactive mode. Whether it works across a persistent interactive session has not been confirmed.

This is the load-bearing assumption of the entire architecture. Everything downstream — the stream adapter, the panel routing, the session model — depends on it being true.

**Spike complete.** See [`docs/gui-wrapper-spike-result.md`](gui-wrapper-spike-result.md) for full findings.

**Summary:** Architecture A (long-lived subprocess with `--output-format stream-json`) is unconfirmed — claude requires a real interactive terminal for multi-turn operation and does not behave as a pipeable multi-turn server. Architecture B (per-message spawn with `--resume`) is confirmed: `--print --output-format stream-json --verbose --resume <id>` works cleanly, session context is preserved, and tool use events are captured.

**Active architecture: B.**

---

*The architecture operates as follows:*

The app spawns a `claude` subprocess in the user's chosen project directory, using `--output-format stream-json`. Every tool call, assistant message, and tool result arrives as a structured JSON event on stdout. The GUI consumes that stream and routes events to the appropriate panel.

```
┌─────────────────────────────────────────────┐
│              Shipwright App                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │File Tree │  │  Chat    │  │  Viewer   │  │
│  │          │  │  Window  │  │           │  │
│  └──────────┘  └────┬─────┘  └───────────┘  │
│                     │                       │
│              stdin / stdout pipe            │
│                     │                       │
│          ┌──────────▼──────────┐            │
│          │   claude CLI process │            │
│          │  --output-format    │            │
│          │  stream-json        │            │
│          └─────────────────────┘            │
└─────────────────────────────────────────────┘
```

### Stream adapter layer

The `stream-json` contract is the load-bearing seam of the entire app. If it is incomplete, noisy, or changes shape, the app gets brittle fast. This risk must be contained at the boundary.

The app introduces an explicit **stream adapter** between the raw subprocess output and the UI:

- Parses and validates each incoming JSON event against a known schema
- Routes valid events to the correct panel (text → chat, tool\_use → activity log, tool\_result → optionally surfaced)
- On parse failure or unknown event type: logs the raw line to a debug buffer and emits a **degraded mode** indicator in the UI rather than crashing
- On subprocess exit with non-zero code: displays a recoverable error state, not a blank screen

The adapter schema should be pinned to a specific Claude Code version and tested against that version's actual output. When Claude Code updates, the adapter tests catch regressions before users see them.

### Tech stack

**Framework:** Tauri (Rust shell + WebKit webview)
- Distributes as ~8MB `.dmg` vs ~150MB for Electron
- Uses macOS's native WebKit — no bundled Chromium
- Rust backend handles process management, fs watching, and subprocess lifecycle cleanly

**Frontend:** React + Tailwind
- Three-panel layout (resizable)
- Markdown rendering in viewer panel
- Standard web skills, no framework lock-in

**Target platform (v1):** macOS only. The primary Shipwright user base is on Mac. Windows/Linux can follow; Tauri supports both and the subprocess approach is cross-platform, so the architecture does not preclude it.

---

## The three panels

### 1. File Tree (left)
- Displays the working directory the user opened
- Native file watcher via the [`notify` crate](https://github.com/notify-rs/notify) — files written by Claude light up in real time
- Click any file to open it in the Viewer
- Badge count on files modified in the current session

### 2. Chat Window (center)
- User input → claude's stdin
- Stream adapter output rendered as:
  - Assistant text → chat bubble with markdown
  - Tool calls → collapsed activity indicator ("Reading 3 files..."), expandable on click
  - Tool results → hidden by default, accessible via toggle
- Auto-scrolls; session transcript saved locally as a plain `.md` file per session (append-only, not used for resume — see Session Model)

### 3. Viewer (right)
- Auto-detects file type:
  - `.md` → rendered markdown
  - `.json` → formatted/collapsible tree
  - `.txt`, code files → syntax-highlighted
- Refreshes automatically when the watched file changes
- "Copy" and "Export" actions per artifact

---

## Shipwright integration

On startup, the app checks the opened directory for `manifest.json`. If absent, the app works as a plain Claude Code GUI wrapper — three panels, file tree, viewer, full chat — just without the palette. If present, a **command and workflow palette** appears above the chat input.

### Palette derivation rule

The manifest provides three relevant sections: `commands` (flat array), `routing` (map of command → agent(s) + skills), and `skills` (map of category → skill names). There is no encoded hierarchy between commands and skill categories — the palette must not invent one.

The palette is built as two flat tabs:

**Commands tab** — one entry per item in `manifest.commands`, in manifest order:
- If the command exists in `manifest.routing`: show the routing agent(s) as a badge. Commands with `agents` (plural) in their routing entry get a "multi-agent" indicator signaling a longer-running workflow. Commands with a single `agent` get no additional indicator.
- `start` is the only command without a routing entry; it is shown first as the orchestrator entry point with a distinct "Start here" label.
- Label is the command name. Description is read from the first non-empty line of the matching file in `.claude/commands/<name>.md`. If the file is absent, the command is shown without a description rather than hidden.

**Skills tab** — one section per category key in `manifest.skills` (discovery, strategy, execution, etc.), each listing its skills alphabetically:
- Skills are not nested under or associated with specific commands — the routing map links commands to skills for orchestration purposes, but that relationship is not surfaced in the palette UI.
- Label is the skill name. Description is read from the first non-empty line of `.claude/skills/<category>/<name>.md`. If absent, shown without description.

Clicking any command injects `/<command>` into chat and submits. Clicking a skill injects the skill name as plain text (not a slash command) for use in freeform prompts.

For commands where context is clearly required before they can run usefully (`write-prd`, `strategy`, `plan-launch`, `discover`), a lightweight preflight form appears first — one or two plain-text fields prepended to the injected command. Preflight is opt-in per command; a hardcoded list in the app config specifies which commands get it. The form can be dismissed; users type context manually instead.

This is the GUI Shipwright never had. Same engine, lower friction.

---

## Distribution

The user downloads a single `.dmg`. Drags the `.app` to Applications. Opens it, picks a project directory, starts chatting.

**Startup sequence:**
1. **PATH check** — run `which claude`. If absent, show a setup screen with install instructions and a link; block until resolved.
2. **CLI health check** — run `claude --version`. If it fails or returns unexpected output, the binary exists but is not a usable Claude Code install (wrong binary, corrupted install, etc.). Show a distinct error — not the same screen as "not installed."
3. **Auth check** — run `claude auth status`. If it returns a non-authenticated state, surface a "Claude Code is not authenticated" screen with instructions to run `claude` in a terminal first. Block until resolved. Do not attempt to handle login flow inside the app. This is less brittle than probing with an empty print request, which would consume a token and parse ambiguous output.
4. Prompt for project directory (defaults to last opened).
5. Spawn `claude` in that directory with `--output-format stream-json`.
6. Load UI; stream adapter begins consuming output.

Steps 1–3 run on every launch; they are fast and must complete before the project directory prompt appears.

### Shipwright update check

The app includes a **Check for Updates** button in the Help menu (and on the startup screen). When triggered, it compares the local `manifest.json` version field against the latest release tag on the Shipwright GitHub repo. If a newer version is available, it surfaces a notification with a link to the release and the existing `shipwright-sync.sh` instructions. The app does not update itself or the Shipwright install — it informs and defers. No background polling; check is manual only in v1.

### Model selection

Claude Code supports `claude --model <id>` at startup and `/model <id>` mid-session. The wrapper exposes both, with guardrails.

**Session-start picker:** Before spawning the subprocess, the app presents a model selector with four aliases: `default`, `sonnet`, `opus`, `haiku`. Selecting anything other than `default` appends `--model <alias>` to the spawn command — the alias is passed as-is, not resolved to a raw model ID by the app. The CLI owns the alias-to-model mapping; freezing IDs in the wrapper would break silently whenever Anthropic updates them. The active alias is shown in the status bar throughout the session.

**Mid-session switching:** Available from an **Advanced** menu only, and only when Claude is idle (no streaming output in progress). Injecting `/model <id>` while Claude is mid-response risks corrupting the stream. The Advanced menu is not surfaced in the main UI.

**What is not built in v1:** A rich model picker with raw model IDs, org-policy awareness, or custom model options. These require knowing which models are actually available to a given account, which is not exposed by the CLI auth state. A safe alias set (`default`, `sonnet`, `opus`, `haiku`) avoids that problem without overpromising. Raw ID input is available as a text field in the Advanced menu for users who need it.

Model changes are recorded in the session transcript as a metadata line: `[model changed to sonnet at 14:32]`.

### Session model (revised by spike)

Each user message spawns a new `claude --print` subprocess:
```
claude --print "<message>" --output-format stream-json --verbose --resume <session-id>
```

The first message of a session omits `--resume`; the `session_id` from the returned `result` event is stored in app-local state and used for all subsequent messages in that session. The CLI owns session history; the app stores only the ID.

**Latency:** Each turn incurs subprocess startup overhead (~1–3 seconds observed). This is acceptable given Shipwright workflow responses take 5–30 seconds, but the UX pattern should be a per-turn startup spinner, not a typing indicator.

**Required flag:** `--verbose` is mandatory with `--output-format stream-json` in print mode. The process manager must always include it.

**On app close:** The current `session_id` is persisted to app-local state. On next open, if a saved session ID exists for the project directory, the user is offered "Resume last session?" — accepting chains the next message to that session ID; declining discards it and starts fresh. Unlike the earlier decision to defer `--resume` due to risk, the spike confirms the mechanism works cleanly and failure is easy to handle: if `--resume` returns an error, fall back to a fresh session automatically and notify the user.

**Transcript storage:** Each session's turns are appended to a plain `.md` file in app-local storage: `~/Library/Application Support/Shipwright/transcripts/<project-hash>/YYYY-MM-DD-HH-MM.md`. Append-only, human-readable reference record. Note: if the project directory is moved or renamed, the hash changes and prior transcripts become unreachable from the new path — acceptable in v1 but worth documenting.

---

## Open questions

1. **Multi-project** — tabs for multiple open directories, or one session per app window? One window per directory is simpler and safer for v1; tabs can follow.

2. **Tool call visibility** — collapsed by default is the right call for non-CLI users. Power-user toggle (show all tool activity) should exist but not be prominent.

3. **Windows/Linux** — architecture supports it; defer until there is user demand. Do not stub platform-specific code speculatively.

4. **Naming** — "Shipwright App" is a placeholder. Whether this ships as part of the Shipwright project or as a standalone product affects versioning, repo structure, and install story. Decision needed before build starts.

---

## Build estimate

The 2–3 week figure from the previous draft reflects a working demo, not a handoff-ready tool. An honest breakdown:

| Component | Effort | Notes |
|---|---|---|
| Tauri scaffolding + subprocess management | 2–3 days | Includes PATH detection, startup error states |
| Stream adapter + schema validation | 3–4 days | The highest-risk component; deserves extra time |
| Three-panel layout + file tree | 2–3 days | notify crate edge cases (permissions, symlinks) add time |
| Viewer with file type detection | 1–2 days | |
| Command/workflow palette + manifest parsing | 2 days | Preflight forms add a day if included in v1 |
| Session transcript persistence | 1 day | |
| Packaging + `.dmg` distribution | 1–2 days | Notarization, signing, and PATH in sandboxed env can surprise |
| Hardening: crash recovery, bad events, login state | 3–4 days | Non-CLI users will hit every edge case |
| **Demo-quality prototype** | **~2–3 weeks** | |
| **Handoff-ready for non-CLI PMs** | **~5–6 weeks** | |

The delta is real. PATH issues, macOS sandboxing, login state detection, interrupted runs, malformed events, and file-watch permissions are not polish — they are the product for users who cannot fall back to a terminal.

---

## What this is not

- Not a reimplementation of Claude Code
- Not an alternative to the CLI for power users
- Not a SaaS product (no auth server, no user accounts)
- Not a replacement for the terminal-based Shipwright workflow

It is a lower-friction entry point that uses everything already built.
