# GUI Wrapper — Integration Spike Result

**Date:** 2026-04-10  
**Branch:** `feature/gui-wrapper`  
**Timebox:** ~2 hours  
**Verdict:** Architecture A (long-lived subprocess) unconfirmed. Architecture B (per-message spawn with `--resume`) confirmed. Proceed on Branch B.

## Tested environment

| Field | Value |
|---|---|
| Claude Code version | 2.1.98 |
| macOS version | 15.6.1 |
| Auth method | `claude.ai` (first-party, Max subscription) |
| Permission mode | default (not explicitly set during spike) |
| Working directory | `/Users/ianbrillembourg/Documents/GitHub/shipwright` |

Results may differ under API key auth, org-managed accounts, or custom permission modes.

---

## What was tested

### Test 1 — `--output-format stream-json` in print mode

**Command:**
```bash
claude --print "My secret word is ZEBRA. Reply with only: acknowledged." \
  --output-format stream-json --verbose
```

**Observed behavior:** Works. Emits a clean sequence of newline-delimited JSON events on stdout. The `--verbose` flag is required alongside `stream-json`; omitting it returns an error: `When using --print, --output-format=stream-json requires --verbose`.

**Sample output (abridged):**
```json
{"type":"system","subtype":"init","session_id":"3e0e669a-...","model":"claude-sonnet-4-6",...}
{"type":"assistant","message":{"content":[{"type":"text","text":"acknowledged."}],...},...}
{"type":"rate_limit_event",...}
{"type":"result","subtype":"success","result":"acknowledged.","session_id":"3e0e669a-...","num_turns":1,...}
```

**Event types observed:** `system/init`, `assistant`, `rate_limit_event`, `result/success`.

---

### Test 2 — `--resume` session chaining (statefulness)

**Commands:**
```bash
# Turn 1 — captures session_id from result event
claude --print "My secret word is ZEBRA. Reply with only: acknowledged." \
  --output-format stream-json --verbose

# Turn 2 — resumes with session_id from turn 1
claude --print "What was the secret word I gave you?" \
  --output-format stream-json --verbose \
  --resume 3e0e669a-a78d-4b88-ac77-670c41230a30
```

**Observed behavior:** Works. Turn 2 correctly recalled "ZEBRA" without it being repeated in the prompt. The `session_id` is stable across both calls. The `result` event in each call contains the same session ID, confirming the session is continuous.

**Turn 2 result event (abridged):**
```json
{"type":"result","result":"ZEBRA.","session_id":"3e0e669a-...","num_turns":1,...}
```

**Conclusion:** Context is preserved across per-message spawn calls. Each call reports `num_turns: 1` (turns within that print call), but the underlying session accumulates history.

---

### Test 3 — Tool use events in stream-json

**Command:**
```bash
claude --print "Use the Bash tool to run: echo spike-tool-test" \
  --output-format stream-json --verbose
```

**Observed behavior:** Tool use appears as an `assistant` event whose `message.content` array contains a `tool_use` block, followed by a second `assistant` event with the text response. Tool results are not emitted as a separate top-level event type — they are embedded in the assistant message sequence.

**Event sequence:**
```
TYPE: system/init
TYPE: assistant  → thinking block
TYPE: assistant  → tool_use block (Bash, input: {command: "echo spike-tool-test"})
TYPE: assistant  → text block ("spike-tool-test")
TYPE: result
```

**Conclusion:** Tool use IS captured in the stream. The stream adapter can detect tool invocations by inspecting `assistant` event content for `tool_use` type items.

---

### Test 4 — Long-lived subprocess (Architecture A)

**Approaches tried:**
1. `printf "msg1\nmsg2\n" | claude --output-format stream-json --verbose` — piped input with EOF. Produced output but treated both lines as a single prompt (one turn). Not multi-turn.
2. Python `subprocess.Popen` with `stdin=PIPE, stdout=PIPE` — sent turn 1 message to stdin, kept pipe open. Process hung; no output received within 15-second timeout.
3. Python `pty.openpty()` — spawned claude with a synthetic PTY, sent turn 1 via master fd. Process started but produced no output.

**Observed behavior:** None of the approaches produced a persistent multi-turn session via a long-lived process. The process either treats all piped stdin as a single prompt (when EOF is received), or hangs waiting for input in ways that don't produce output (when stdin remains open).

**Conclusion:** Architecture A is not viable without further investigation. Claude appears to require a real interactive terminal for multi-turn operation, and does not behave as a pipeable multi-turn server when given a synthetic PTY or a piped stdin/stdout pair.

---

## Verdict

| Architecture | Status | Notes |
|---|---|---|
| A — long-lived subprocess with stream-json | **Unconfirmed** | Requires real TTY for multi-turn; synthetic PTY and piped stdin both failed |
| B — per-message spawn with `--resume` | **Confirmed** | Works cleanly; session context preserved; tool events captured |
| C — plain stdout, unstructured | **Not tested** | Fallback if needed; known to work for basic use |

**Active architecture: B — per-message spawn with `--resume`.**

---

## Implications for the plan

The session model section of `docs/gui-wrapper-plan.md` stated "each app launch starts a fresh Claude session." That decision is now reversed by the architecture.

**Revised session model:**
- Each user message spawns a new `claude --print` process with `--output-format stream-json --verbose --resume <session-id>`
- The first message of a session spawns without `--resume`; the returned `session_id` from the `result` event is stored in app-local state and used for all subsequent messages
- Session context is maintained by the CLI, not the app
- The app stores only the `session_id` — identical to the mechanism originally proposed and then deferred

**Latency implication:** Each turn incurs subprocess startup overhead (observed: ~1–3 seconds per call in testing). This is acceptable for a Shipwright workflow tool where responses already take 5–30 seconds, but should be disclosed. A startup spinner per turn rather than a typing indicator is the right UX pattern.

**Stream adapter adjustment:** The adapter schema should handle `assistant` events that contain mixed content arrays (`thinking`, `tool_use`, `text` blocks in sequence). Tool use is not a separate top-level event type.

**Required flag:** `--verbose` is mandatory alongside `--output-format stream-json` in print mode. The process manager must always include it or the subprocess will error immediately.

---

## What does not change

- Three-panel layout, file tree, viewer: unaffected
- Palette derivation from manifest: unaffected
- Startup health checks (`claude auth status`): unaffected
- Model alias passing (`--model sonnet`): unaffected, append to spawn command
- Transcript storage in app-local: unaffected
- Shipwright update check: unaffected

---

## Permission spike (follow-on, 2026-04-10)

### Test 4 — `--disallowedTools` case sensitivity

**Commands:**
```bash
# lowercase — no effect
claude --print "Use the Bash tool to run: echo test" --output-format stream-json --verbose --disallowedTools bash

# capital B — blocks
claude --print "Use the Bash tool to run: echo test" --output-format stream-json --verbose --disallowedTools Bash
```

**Observed behavior:**
- `--disallowedTools bash` (lowercase): Bash ran successfully. Tool name matching is case-sensitive; lowercase has no effect.
- `--disallowedTools Bash` (capital B): Bash never appeared as a `tool_use` event — Claude received no Bash tool in its context, degraded gracefully via text, `result.subtype=success`, `is_error=False`.

**Conclusion:** Use `Bash` (capital B) in `--disallowedTools`. The plan's permission section must specify the exact casing.

---

### Test 5 — Permission blocking signal

**Commands:**
```bash
# default permission mode — Write to /tmp (outside project dir)
claude --print "Use the Write tool to create /tmp/spike-perm-test.txt containing: hello" \
  --output-format stream-json --verbose

# --permission-mode acceptEdits — Write to /tmp (outside project dir)
claude --print "..." --output-format stream-json --verbose --permission-mode acceptEdits

# --permission-mode acceptEdits — Write inside project dir
claude --print "..." --output-format stream-json --verbose --permission-mode acceptEdits
```

**Observed behavior:**
- Default mode, `/tmp/` path: `tool_use` event emitted for Write, then a `user` event whose `tool_result.content` = `"Claude requested permissions to write to /tmp/spike-perm-test.txt, but you haven't granted it yet."` File not created. `result.subtype=success`, `is_error=False`.
- `acceptEdits`, `/tmp/` path: same blocking behavior — `acceptEdits` is scoped to the CWD (project directory), not all paths.
- `acceptEdits`, project-dir path: Write succeeded. File created. `result.subtype=success`.
- `--permission-mode reject`: not a valid value (CLI error at startup).

**Key finding:** Permission blocks do NOT surface as `result.is_error=True`. The signal is in the `user` event's `tool_result.content` string, which contains "requested permissions... but you haven't granted it yet." The `result` event is `success` regardless.

**Conclusion:** The stream adapter must inspect `user(tool_result).content` to detect permission blocks — checking `result.is_error` alone is insufficient. `--permission-mode acceptEdits` is the correct default for project-directory file operations; paths outside the project dir remain protected.

---

### Test 6 — Invalid `--resume` failure semantics

**Command:**
```bash
claude --print "say: hello" --output-format stream-json --verbose \
  --resume "00000000-0000-0000-0000-000000000000"
```

**Observed behavior:** `result` event emitted with `subtype=error_during_execution`, `is_error=True`. No assistant event. Clean, detectable.

**Conclusion:** Invalid or stale `--resume` IDs produce a `result.is_error=True` signal the app can catch. Correct handling: detect `is_error=True`, discard the stale session ID, notify user, offer to start fresh session automatically.
