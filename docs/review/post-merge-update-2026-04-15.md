# Post-Merge Update

**Date:** 2026-04-15
**Scope:** Work completed after the original Codex handoff memo, plus the remaining follow-up items
**Branch state at write time:** `main`

## Work completed

### 1. Priority 3 shipped: harness verdict repair now covers GPT and Claude

The harness path now applies the same one-shot structured verdict repair strategy that replay already used, instead of limiting repair to Gemini-only failures.

What changed:
- `scripts/run-conflict-harness.mjs` now repairs known safe schema failures for GPT and Claude in the judge path
- regression coverage was added for harness-level repair behavior
- this closes the highest-leverage reliability gap from the handoff list

Practical effect:
- repairable missing-field verdict failures no longer force avoidable harness failures for GPT/Claude judges
- the reliability fix now applies in normal harness runs, not just replay tooling

### 2. Cross-platform CI gate shipped and was debugged to green

The repo now has real multi-OS validation coverage instead of a Linux-only assumption.

What changed:
- `.github/workflows/validate.yml` now runs the Node test suite on Linux, macOS, and Windows
- the Bash validation script remains Linux-only as a metadata check, while the Node suite is the actual cross-platform gate
- the Windows job initially failed in `run-parallel-variance`; that runner and its test were fixed in follow-up commit `4c86cd2`

Practical effect:
- Shipwright now has an explicit macOS/Windows proof path in CI
- the CI break uncovered and fixed another Windows portability issue before it could linger locally

### 3. Phase 4 Gemini tiebreaks completed

The three remaining governance disagreement scenarios were escalated to Gemini as the third-family judge.

Results:
- `bayer-breakup-not-now` -> `tie`
- `intel-foundry-separation` -> `tie`
- `paramount-skydance-deal` -> `side_a`

Interpretation:
- `paramount-skydance-deal` resolved toward Claude / Side A
- `bayer-breakup-not-now` remains genuinely unresolved
- `intel-foundry-separation` remains genuinely unresolved

Artifacts:
- result directories were committed
- memo written at `docs/review/phase-4-gemini-tiebreak-memo-2026-04-15.md`

### 4. PR #8 was merged to `main`

The merged PR contains:
- harness verdict repair for GPT/Claude-class failures
- cross-platform CI gate
- Windows fix for `run-parallel-variance`
- Phase 4 Gemini tiebreak artifacts and memo

This means the highest-priority harness-confidence work from the handoff is no longer just on a side branch.

### 5. Benchmark/result path lengths were shortened for future runs

To reduce Windows + OneDrive path-length failures, generated scenario IDs, run IDs, session IDs, and orchestrated subfolder names were compacted.

What changed:
- new helper: `scripts/path-ids.mjs`
- compact IDs are now used by fast analysis, conflict harness, session store, decision-session routing, and orchestrated output layout
- future generated paths are materially shorter than the previous repeated full-slug structure

Practical effect:
- new benchmark output trees are much less likely to trip OneDrive sync limits
- this does not rename old artifact trees retroactively

### 6. Stale generated output folders were cleaned up locally

Old untracked generated directories under:
- `benchmarks/results/conflict-harness/*/rejudges/`
- `benchmarks/results/fast-analysis/`
- `benchmarks/results/orchestrated/`
- `benchmarks/telemetry/`

were removed locally to stop OneDrive from continuing to complain about already-generated long paths.

### 7. New archive helper added for OneDrive-safe artifact relocation

A new utility was added:
- `scripts/archive-generated-outputs.mjs`

What it does:
- moves or copies generated output directories to a shorter root outside OneDrive
- defaults to archiving `benchmarks/results/` and `benchmarks/telemetry/`
- supports `--dry-run`, `--mode move|copy`, and repeatable `--path`

Documentation and verification:
- README now includes a short usage note
- focused tests added in `tests/archive-generated-outputs.test.mjs`
- verified with:
  - `node scripts/archive-generated-outputs.mjs --dry-run`
  - `node --test tests/archive-generated-outputs.test.mjs`

## What remains

### 1. Priority 2 is still open: v2 swap test for position bias

The cheap bias diagnostic from the original handoff has not been run yet.

Open task:
- pick one scenario, preferably `board-update-ambiguity`
- run the same matchup twice with sides swapped
- compare whether the winner changes under the v2 schema

This is still one of the fastest remaining ways to increase trust in the current harness.

### 2. Priority 4 is still open: decisive_dimension tally

The repo still does not have a summary of which rubric dimension most often becomes `decisive_dimension` under v2 verdicts.

Open task:
- scan existing `judge/verdict.json` files
- tally the decisive dimension distribution
- record whether the richer schema appears to overweight any one dimension

This is data analysis only; no new benchmark runs are required.

### 3. Install/update portability is improved but not fully unified

The runtime and CI story is much stronger now, but install/update is still not fully cross-platform-native.

Open task:
- either port `sync.sh` and `validate.sh` to Node
- or add first-class PowerShell equivalents and document them beside the shell scripts

This is lower urgency than the harness-confidence work, but still relevant for long-term Windows usability.

### 4. Existing old artifact trees outside the recent cleanup may still exist elsewhere

Future paths are shorter and there is now an archive helper, but OneDrive can still complain if older deep trees remain in other synced clones or if a not-yet-shortened path shows up in a less common workflow.

Recommended usage:
```powershell
node scripts/archive-generated-outputs.mjs --dry-run
node scripts/archive-generated-outputs.mjs --target-root C:\shipwright-artifacts
```

## Current confidence read

The highest-value confidence work is now done:
- GPT/Claude judge repair is in the harness path
- cross-platform CI is real and already caught a Windows bug
- the hardest remaining governance disagreements were actually escalated instead of left speculative
- future generated paths are shorter, and there is now a safe escape hatch for artifact relocation outside OneDrive

The main remaining trust-building work is diagnostic rather than architectural: run the v2 swap test and produce the decisive-dimension tally.
