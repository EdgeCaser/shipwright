# Codex Handoff Memo

**Date:** 2026-04-15 (end of session)
**Author:** Claude Sonnet 4.6
**Audience:** Next Codex or Claude session picking up Shipwright work
**Branch:** `main` — clean, all tests green (350/350)

---

## What was accomplished this session

### 1. Session layer (Slices 1–8) — v2.2.0

The full decision analysis session layer was built and wired:

- `scripts/decision-session-store.mjs` — session state machine (pending → fast → rigor → complete / failed)
- `scripts/decision-execution.mjs` — Fast Mode and Rigor Mode runners
- `scripts/decision-session-controller.mjs` — orchestrates multi-turn flow
- `scripts/decision-presenter.mjs` — formats output for humans and agents
- `scripts/decision-service.mjs` — top-level service facade (what orchestrators call)
- `scripts/decision-follow-up-actions.mjs` — `gather_more_evidence` executable action with telemetry
- `scripts/decision-session-telemetry.mjs` — session-scoped telemetry
- 163 tests for all of the above; all passing

Key behavior: a decision analysis session takes a question, runs Fast Mode, offers to escalate to Rigor Mode for governance/publication class, and surfaces follow-up actions (`gather_more_evidence`, `schedule_review`, `escalate_to_panel`) when the verdict is uncertain.

**CHANGELOG entry:** v2.2.0 covers all of this.

### 2. Decision analysis routed into both chat surfaces

**orchestrator.md** — Claude Code path. Decision analysis questions are detected by `route-request.mjs`, dispatched inline via the `Agent` tool (NOT a subprocess), and produce structured output. Offers a stress-test (opposing-position pass) for governance/publication class.

**AGENTS.md** — Codex CLI path. Codex IS the analysis model; runs inline without any subprocess. Same structured output format. Key: do not shell out from Codex; the system prompt itself is the instruction.

Important: `/start` invokes the orchestrator as a Claude Code agent. Running `node scripts/shipwright.mjs` directly is terminal-only and does NOT trigger orchestrator routing.

### 3. sync.sh now propagates AGENTS.md

`ROOT_FILES=("AGENTS.md")` in `scripts/sync.sh` ensures AGENTS.md is copied to destination projects on both `--install` and sync. This is the mechanism for keeping the Codex path up to date in installed projects.

### 4. Phase 1.7 calibration — Claude replay on governance scenarios

Claude was used as judge on frozen GPT v2 artifacts for the 6 new governance scenarios. Results: 3 agreements (google-adtech, nissan-honda, openai-nonprofit), 3 disagreements (bayer, intel-foundry, paramount). The 6/6 GPT side_b pattern was 50% bias, 50% genuine signal.

This result is written up in the addendum section of `docs/review/v1-vs-v2-reconciliation.md`.

**Phase 4 escalation candidates:** `bayer-breakup-not-now`, `intel-foundry-separation`, `paramount-skydance-deal`.

### 5. Phase 2 uncertainty payload — implemented

When a verdict is a tie, low-confidence, or `needs_human_review: true`, the harness now requires and surfaces 7 additional fields:

```
uncertainty_drivers
disambiguation_questions
needed_evidence
recommended_next_artifact
recommended_next_action
can_resolve_with_more_evidence
escalation_recommendation
```

These are validated in `scripts/rejudge-conflict-run.mjs` → `validatePhase2VerdictPayload()`. The batch summary (`scripts/run-conflict-batch.mjs`) surfaces them in a "Flagged Verdicts — Uncertainty Payload" section when triggered.

**Note:** The 6 Phase 2-triggered existing verdicts (from the 2026-04-15 13-scenario rebaseline, which predates enforcement) were re-judged to populate these fields. This is done; those results are on disk.

### 6. All 10 pre-existing test failures fixed

**Root cause:** `loadArtifactSchema` in `scripts/extract-structured-artifact.mjs` used `new URL(import.meta.url).pathname` which produces a double drive-letter path on Windows (`C:\C:\...`). Fixed with `fileURLToPath`. This cascaded into 6 failures across extract-structured-artifact, run-benchmarks.

**Other fixes:**
- `tests/extract-structured-artifact.test.mjs` — path comparison was Unix-only; now uses `path.resolve()` on both sides
- `tests/pricing-diff.test.mjs` — had a hardcoded macOS cwd path (`/Users/ianbrillembourg/...`); replaced with `process.cwd()`
- `tests/rejudge-conflict-run.test.mjs` — `repairedVerdict` was missing Phase 2 fields; `needs_human_review: true` triggers Phase 2 validation
- `tests/run-benchmarks.test.mjs` — "default suite" test now pins to the 7 scenario IDs that have actual fixture content (others are stubs without fixtures)
- `tests/collector-sync.test.mjs` — ENOENT on gitignored fallback paths now skips rather than fails (`.claude/` and `.codex/scripts/` are gitignored installs)

**Test status:** 350/350 passing. The 1-in-3-run flake on `createShellSessionRunner supports prompt-file placeholders` is a pre-existing timing issue; it resolves on rerun and is not caused by these changes.

---

## What is left to do

### Priority 1 — Phase 4: triple-panel escalation (3 scenarios)

The three scenarios where GPT and Claude disagreed need a third judge family to break the tie:

- `bayer-breakup-not-now` (sharpest disagreement: Claude `side_a` high confidence, GPT `side_b` medium)
- `intel-foundry-separation` (Claude `side_a` medium, GPT `side_b` medium)
- `paramount-skydance-deal` (Claude `side_a` medium, GPT `side_b` medium)

**How to run:**
```bash
# For each contested scenario, find the latest run dir, then:
node scripts/rejudge-conflict-run.mjs \
  --run-dir "benchmarks/results/conflict-harness/<scenario>/<run-id>" \
  --judge-agent gemini \
  --label gemini-phase4-tiebreak \
  --format text
```

Expected outcome: if Gemini agrees with Claude on bayer, the balance tips to `side_a`; if it agrees with GPT, the scenario is genuinely split. Record the outcome in a memo — this is the Phase 4 deliverable.

**Batching them:**
```bash
for scenario in bayer-breakup-not-now intel-foundry-separation paramount-skydance-deal; do
  run_dir=$(ls -d benchmarks/results/conflict-harness/$scenario/*/  | sort | tail -1)
  node scripts/rejudge-conflict-run.mjs \
    --run-dir "$run_dir" \
    --judge-agent gemini \
    --label gemini-phase4-tiebreak \
    --format json > /tmp/$scenario-gemini.json
done
```

### Priority 2 — v2 swap test (position bias check)

The 44-run swap matrix from Phase 1 was v1-era. We do not know whether v2 schema changes affected position neutrality. Pick one scenario (recommended: `board-update-ambiguity`) and run:

1. Claude as Side A, GPT as Side B — judge with current default
2. Swap: GPT as Side A, Claude as Side B — same judge

If winner flips with the position swap, position bias is present under v2. If it holds, the selection is position-neutral. This is a cheap diagnostic (2 runs) with a clear result.

### Priority 3 — Judge-output repair pass for GPT/Claude

Gemini has a repair loop on verdict JSON failures. GPT and Claude do not. The observed failure rate was ~16% (3/19 runs had JSON failures). Adding a one-shot repair prompt on parse failure for GPT and Claude would likely recover ~66% of those without scenario-specific work.

The repair logic is already in `scripts/rejudge-conflict-run.mjs` → `repairVerdict()`. The gap is that `parseAndValidateVerdict()` in the harness (not rejudge) only calls repair for Gemini. Extending to GPT/Claude is a small change.

### Priority 4 — v2 decisive_dimension distribution tally

All v2 verdicts are on disk under `benchmarks/results/conflict-harness/*/judge/verdict.json`. A quick scan to tally which dimension is `decisive_dimension` would tell us whether the richer schema has a structural bias toward any particular dimension. This is pure data analysis, no new runs.

```bash
# Extract decisive_dimension from all v2 judge verdicts
for f in benchmarks/results/conflict-harness/*/conflict-*/judge/verdict.json; do
  node -e "const v=JSON.parse(require('fs').readFileSync('$f','utf8')); console.log(v.decisive_dimension)"
done 2>/dev/null | sort | uniq -c | sort -rn
```

---

## Important learnings / gotchas

### Architecture

- **Orchestrator uses `Agent` tool, not subprocess.** When decision analysis is invoked via `/start`, it dispatches via the `Agent` tool in `agents/orchestrator.md`. It does NOT run `node scripts/shipwright.mjs`. Never add a `Bash` subprocess for decision analysis in the orchestrator.

- **Codex is the model.** In AGENTS.md, the routing says "run inline." Codex reads AGENTS.md as its system prompt and IS the analysis model. No dispatch needed.

- **sync.sh ROOT_FILES.** This is new. Adding a file to the `ROOT_FILES=()` array in `scripts/sync.sh` causes it to be synced to destination project roots on every `--install` and `--yes` run. Currently only `AGENTS.md` is in there.

### Testing

- **The Windows path bug pattern.** If you see `ENOENT: C:\C:\Users\...` (double drive letter), the cause is `new URL(import.meta.url).pathname` being passed to `path.resolve()` on Windows. Always use `fileURLToPath(import.meta.url)` instead. This same bug could exist in other scripts that load files relative to their own location — search for `import.meta.url).pathname` to find candidates.

- **Benchmark fixtures vs conflict harness scenarios.** `benchmarks/scenarios/` contains 19 JSON files, but only 7 have actual fixture content in `benchmarks/fixtures/`. The test `runBenchmarkSuite evaluates the default benchmark fixture suite` now pins to those 7 IDs explicitly (`BENCHMARK_FIXTURE_SCENARIO_IDS` in `tests/run-benchmarks.test.mjs`). If you add fixture content for more scenarios, add them to that constant.

- **`collector-sync.test.mjs`** checks that `.claude/scripts/collect-research.mjs` and `.codex/scripts/collect-research.mjs` match the canonical. These are gitignored; the test now skips (not fails) if they don't exist. If they DO exist and drift, the test will catch it.

- **Timing flake in `run-parallel-variance.test.mjs`.** `createShellSessionRunner supports prompt-file placeholders` occasionally fails when the full test suite runs in parallel. It passes on rerun and when run in isolation. Pre-existing, not caused by any recent change.

### Harness

- **Phase 2 payload enforcement.** Once a verdict has `needs_human_review: true`, `winner: "tie"`, or `judge_confidence: "low"`, all 7 Phase 2 fields are required. If you write a new test that creates such a verdict, the `repairedVerdict` in the test MUST include those fields too, or it will fail validation.

- **Schema version matters.** v1 and v2 verdicts are not comparable. See `docs/review/v1-vs-v2-reconciliation.md`. The 77% flip-or-collapse rate means any memo quoting v1 numbers as "current harness behavior" is wrong.

- **Frozen-artifact replay.** Run `node scripts/rejudge-conflict-run.mjs --run-dir <path>` to re-judge an existing run without regenerating the sides. This is the correct tool for judge-family bias diagnostics. Do not regenerate sides when replay answers the question.

### Repository conventions

- Benchmark results live in `benchmarks/results/conflict-harness/`. Stage explicitly when committing — large directories, don't `git add -A`.
- `docs/outreach/` is gitignored. Leave it out of commits.
- `benchmarks/results/fast-analysis/` and `benchmarks/results/orchestrated/` are currently untracked — these are from session layer test runs, probably fine to leave untracked for now.
- Git user is "Ian" on this machine. Commits co-authored with Claude show as `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`.

---

## Current git state

```
branch: main (up to date with origin/main)
last commit: e644b5b  Fix 10 pre-existing test failures
test suite: 350/350 passing
uncommitted: benchmarks/results/... (untracked run outputs, not staged)
```

No unresolved conflicts, no stash, nothing in-flight.
