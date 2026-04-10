# Shipwright GUI Wrapper — Plan

**Status:** Draft for review  
**Branch:** `feature/gui-wrapper`  
**Scope:** Thought experiment → buildable spec

---

## Problem

Shipwright is powerful but requires comfort with the Claude Code CLI — slash commands, terminal, no visual context for project files or outputs. This is a meaningful friction barrier for PMs and collaborators who aren't CLI-native.

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

### Tech stack

**Framework:** Tauri (Rust shell + WebKit webview)
- Distributes as ~8MB `.dmg` vs ~150MB for Electron
- Uses macOS's native WebKit — no bundled Chromium
- Rust backend handles process management and fs watching cleanly

**Frontend:** React + Tailwind
- Three-panel layout (resizable)
- Markdown rendering in viewer panel
- Standard web skills, no framework lock-in

**Target platform (v1):** macOS only. The primary Shipwright user base is on Mac. Windows/Linux can follow.

---

## The three panels

### 1. File Tree (left)
- Displays the working directory the user opened
- `fs.watch` updates in real time — files written by Claude light up
- Click any file to open it in the Viewer
- Badge count on files modified in the current session

### 2. Chat Window (center)
- User input → claude's stdin
- `stream-json` output parsed and rendered:
  - Assistant text → chat bubble
  - Tool calls → collapsed indicator ("Reading 3 files..."), expandable
  - Tool results → hidden by default, toggleable
- Auto-scrolls, supports markdown in responses
- Session history persisted locally per project directory

### 3. Viewer (right)
- Auto-detects file type:
  - `.md` → rendered markdown
  - `.json` → formatted/collapsible tree
  - `.txt`, code files → syntax-highlighted
- Refreshes automatically when the watched file changes
- "Copy" and "Export" actions per artifact

---

## Shipwright integration

On startup, the app checks the opened directory for `manifest.json`. If present:

- A **skill palette** appears above the chat input — buttons for every command (`/write-prd`, `/strategy`, `/sprint`, etc.)
- Clicking a skill injects the slash command into chat
- Skills are grouped by category per the manifest
- No slash commands to memorize; the routing is surfaced visually

This is the GUI Shipwright never had. Same engine, lower friction.

---

## Distribution

The user downloads a single `.dmg`. Drags the `.app` to Applications. Opens it, picks a project directory, starts chatting.

**Startup sequence:**
1. Check for `claude` in PATH — if missing, show setup instructions with link
2. Prompt for project directory (or reopen last session)
3. Spawn `claude` in that directory
4. Load UI

No API key input. No model selection. The user's existing Claude setup (credentials, model, config) is inherited by the subprocess.

---

## Open questions for review

1. **Session persistence** — should the app maintain conversation history across app restarts, or treat each launch as a fresh session? Claude Code doesn't natively persist across invocations.

2. **Multi-project** — tabs for multiple open directories, or one session per app window? The latter is simpler but limits parallel workflows.

3. **Tool call visibility** — how much of the underlying tool activity should be visible by default? Power users want it; new users may find it noisy.

4. **Skill palette behavior** — inject the command and let Claude respond, or show a pre-flight form for structured inputs (e.g., "what's the PRD for?") before injecting?

5. **Windows/Linux** — defer entirely, or plan the architecture to support it from the start? Tauri supports both; the subprocess and stream-json approach is cross-platform.

6. **Naming** — "Shipwright App" is placeholder. Does this ship as part of the Shipwright project or as a standalone product?

---

## Rough build estimate

| Component | Effort |
|---|---|
| Tauri scaffolding + subprocess management | 2–3 days |
| stream-json parser + event routing | 2–3 days |
| Three-panel layout + file tree | 2–3 days |
| Viewer with file type detection | 1–2 days |
| Skill palette + manifest integration | 1 day |
| Packaging + `.dmg` distribution | 1 day |
| Polish, error states, edge cases | 2–3 days |
| **Total** | **~2–3 weeks** |

This assumes one engineer with web skills who is new to Tauri (mild learning curve). Could compress to 1–2 weeks with prior Tauri/Electron experience.

---

## What this is not

- Not a reimplementation of Claude Code
- Not an alternative to the CLI for power users
- Not a SaaS product (no auth server, no user accounts)
- Not a replacement for the terminal-based Shipwright workflow

It is a lower-friction entry point that uses everything already built.
