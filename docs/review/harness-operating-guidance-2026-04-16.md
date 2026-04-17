# Harness Operating Guidance

**Date:** 2026-04-16  
**Supersedes:** Operational Rules section of `verdict-trust-policy-2026-04-15.md`  
**Informed by:** `claude-judge-lean-findings-2026-04-16.md`, `real-world-scenarios-gpt-screen-2026-04-16.md`

---

## New Findings Since 2026-04-15

### Claude-as-judge has a documented positional lean

Claude-family judges call `side_a` at a ~100% rate in standard runs where Claude is Side A. This was confirmed by a swap test on `metric-definition-disagreement`: Claude-as-judge called side_a in both the original run (Claude in Side A) and the swapped run (GPT in Side A). Six out of six Claude-judged runs across the dataset produced `side_a` wins.

The mechanism is an actionability lean: Claude weights `decision_usefulness` as the decisive dimension in ~80% of verdicts (vs. ~60% for GPT). It consistently resolves tradeoffs between operational specificity and analytical rigor in favor of the more immediately executable artifact.

**This is not a bug in the harness — it is a documented, predictable behavior.** But it means Claude-judged verdicts cannot be read as standalone quality assessments in the default run configuration.

### The batch runner now warns automatically

As of harness schema v2.2, `run-conflict-batch.mjs` emits a stderr warning whenever a judge's provider family matches Side A's provider. The warning names the affected judges and recommends a cross-check. No code change is required to trigger it — it fires on every default run.

---

## Updated Operating Rules

### Rule 1: Never rely on a Claude-only judge panel as a standalone verdict

Claude-judged runs in the default configuration (Claude as Side A) have a near-100% prior toward side_a. Any single-family Claude verdict should be treated as:

- a signal about actionability quality, not overall artifact quality
- insufficient for a publishable or externally cited conclusion
- a candidate for cross-family confirmation, not a final answer

This applies even when the verdict is high-confidence and review is not flagged.

### Rule 2: Default run setup requires a cross-family judge

The default `run-conflict-batch.mjs` invocation includes both Claude and GPT as judges. **Do not remove the GPT judge from a standard run.** If only one judge family is available, use GPT — its review-flagging behavior is more conservative and its positional lean is not documented at the same magnitude.

### Rule 3: Read Claude margins as actionability signals, not quality signals

A Claude margin ≥ 0.7 means "Claude found this clearly more actionable." It does not mean "this is the objectively stronger artifact." Before treating a large Claude margin as definitive:

- Check whether the winning artifact's advantage is operational specificity or analytical quality
- If the winning side's advantage is primarily pass/fail tables, named owners, and executable next steps, the margin may overstate the quality gap

### Rule 4: Cross-family confirmation threshold for human escalation

`HUMAN_REVIEW_REQUIRED` requires `review_flag_family_count >= 2`. A single family's review flag routes to a second judge, not to a human. This is wired into the orchestrator. Do not override this threshold without a documented reason.

### Rule 5: Swap test is required for any Claude-solo adjudication

If Claude must be used as a sole judge (e.g., GPT unavailable), a swap test is required before treating the verdict as trustworthy. Run the scenario with sides reversed, check that the winner changes accordingly. A stable side_a win across both swap orientations is a strong signal that the lean is positional rather than quality-driven.

---

## Judge Selection Quick Reference

| Situation | Recommended setup |
|---|---|
| Standard run | Claude (Side A) + GPT (Side B) + both as judges |
| Budget-constrained | GPT judge only — more conservative, no positional lean documented |
| Governance / board / restructuring | Cross-family required (both judges), uncertainty payload is primary output |
| Scenario where "correct" answer is conservative / stop-and-gather-evidence | GPT judge preferred — Claude will systematically downgrade conservative options on `decision_usefulness` |
| Publication-grade claim | Cross-family required + swap test |
| Solo Claude run | Only valid with paired swap; flag all verdicts as provisional |

---

## Reading Batch Summary Output

The batch summary now includes a **Decisive Dimension by Judge Family** table. Use it to:

- Check whether `decision_usefulness` dominates for one family but not another — a family-level split here is a signal that the scenario may reward different rubric dimensions differently
- Confirm that dimension rates are consistent with the corpus prior (GPT ~60% `decision_usefulness`, Claude ~80%)
- Flag scenarios where the decisive dimension differs across families — these are candidates for cross-family scrutiny even when the winner agrees

---

## Single-Service Compatibility

The batch runner (`run-conflict-batch.mjs`) is designed for two-service operation (Claude + GPT). The following rules apply when only one service is available:

### Single-run harness (`run-conflict-harness.mjs`)

Fully service-agnostic. It accepts explicit `--side-a-command`, `--side-b-command`, and `--judge-command` strings. Any service combination works; the harness has no provider defaults of its own.

### Batch runner with explicit flags

Safe for single-service users. Pass `--side-a-agent`, `--side-b-agent`, and `--judge-agent` explicitly. The scenario-class routing (`conservative_answer_risk`) and swap test logic are both bypassed when judges are specified explicitly — they only fire on default judge selection.

### Batch runner with defaults

Requires both Claude and GPT. Default Side A = Claude, Side B = GPT, judges = both. Running defaults with only one service available will fail at command execution for the unavailable service.

### `--auto-swap` flag

Inherits the same two-service requirement as the main batch run. Swap tests re-run the scenario with sides reversed using the original agents — if GPT was Side B in the main run, GPT will be Side A in the swap. If GPT is unavailable, do not use `--auto-swap`.

### Conservative-answer scenario routing

When `conservative_answer_risk: true` scenarios are run with default judges, Claude is automatically skipped and GPT is used instead. If GPT is unavailable and default judges are used, the fallback will attempt to construct a GPT judge config and fail at execution. Workaround: pass `--judge-agent claude` explicitly (this bypasses the routing logic, but note that Claude is an unreliable judge for these scenarios — apply a manual swap test).

---

## Schema Version Compatibility

Runs with `harness_schema_version < 2.2` predate the grounding audit, evidence constraint, and cross-family confirmation policy. Do not compare margins or decisive dimensions across schema versions without a reconciliation note. The v2.2 rebaseline batch will bring the full corpus to a consistent baseline.
