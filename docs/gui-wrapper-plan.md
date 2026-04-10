# Shipwright GUI Wrapper — Plan

**Status:** Draft v2 — tightened for build-readiness  
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
- `fs.watch` updates in real time — files written by Claude light up
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

On startup, the app checks the opened directory for `manifest.json`. If present, a **command and workflow palette** appears above the chat input.

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
3. **Auth check** — run `claude --print "" --output-format stream-json` as a lightweight probe. If the response contains an auth error or login prompt, surface a "Claude Code is not authenticated" screen with instructions to run `claude` in a terminal first. Block until resolved. Do not attempt to handle login flow inside the app.
4. Prompt for project directory (defaults to last opened).
5. Spawn `claude` in that directory with `--output-format stream-json`.
6. Load UI; stream adapter begins consuming output.

No API key input. No model selection. The user's existing Claude setup (credentials, model, config) is inherited by the subprocess. Steps 1–3 run on every launch; they are fast and must complete before the project directory prompt appears.

### Session model (v1 decision)

Each app launch starts a **fresh Claude session**. No resume, no replay.

The transcript of each session is saved as a plain `.md` file in app-local storage: `~/Library/Application Support/Shipwright/transcripts/<project-hash>/YYYY-MM-DD-HH-MM.md`. Append-only, human-readable, not used to reconstruct Claude state.

**Why app-local, not in-repo:** Transcripts placed inside the project directory (e.g., `.shipwright/transcripts/`) will be accidentally committed unless every Shipwright user correctly configures `.gitignore`. Transcripts can contain sensitive product strategy content. App-local storage is the macOS convention for user data that belongs to the app, not the project, and it is never at risk of being pushed to a remote. The project hash (derived from the directory path) keeps transcripts organized per project without requiring repo modifications. Users who want transcripts alongside their project can symlink the directory.

The `--resume` mechanism is real and could be wired in a future version, but v1 should not ship with it. The risk is that a stale or invalidated session ID produces a confusing failure state for non-CLI users who have no frame of reference for what "resume failed" means.

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
| Three-panel layout + file tree | 2–3 days | fs.watch edge cases (permissions, symlinks) add time |
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
