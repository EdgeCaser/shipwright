# Codex Test Plan: Next Tests for Judge-Bias Conclusions

Status: Proposed
Date: 2026-04-14
Author: Codex

## Goal

Move from suggestive findings to stronger causal conclusions about judge behavior, especially:

- whether Gemini's `decision_usefulness` concentration is family-specific or harness-wide
- whether the problem is in underlying reasoning or only in `decisive_dimension` selection
- whether the observed behavior is stable across repeated runs

## Core hypotheses

### H1. Family-specific concentration

Gemini is more likely than Claude or GPT to select `decision_usefulness` as `decisive_dimension`, even when judging the same frozen artifact bundle.

### H2. Selection-layer bias

In contradiction and boundary cases, Gemini's `dimension_rationales` and per-dimension scores reflect evidence discipline or consistency concerns, but the final `decisive_dimension` still collapses to `decision_usefulness`.

### H3. Stable house style

Gemini's `decision_usefulness` concentration is not just one noisy pass. It remains visible across repeated replays of the same frozen cases.

## Test 1: Artifact-Matched Three-Family Replay

### Purpose

Test H1 directly by making Claude, GPT, and Gemini judge the exact same frozen artifact pair.

### Scenarios

Use these five scenarios:

- `prd-hidden-scope-creep`
- `handoff-contradiction`
- `event-automation-boundary`
- `feature-weak-evidence`
- `board-update-ambiguity`

Rationale:

- three contradiction / boundary cases where the bias signal is strongest
- one weak-evidence case where Gemini chose `claim_quality`
- one executive ambiguity case where `decision_usefulness` is plausibly appropriate

### Method

For each scenario:

1. Pick one completed run directory as the canonical frozen artifact set.
2. Replay judge that exact `judge/verdict.prompt.txt` and `judge/verdict.input.json` with:
   - Claude
   - GPT
   - Gemini
3. Save each verdict in a distinct labeled `rejudges/` subdirectory.
4. Record:
   - `winner`
   - `margin`
   - `judge_confidence`
   - `needs_human_review`
   - `decisive_dimension`
   - `repair_attempted`

### What would count as evidence

Evidence for H1:

- Gemini chooses `decision_usefulness` much more often than Claude/GPT on the same five frozen cases.

Evidence against H1:

- Claude/GPT show a similar concentration on `decision_usefulness` under the same replay conditions.

## Test 2: Decisive-Label Alignment Audit

### Purpose

Test H2 by checking whether Gemini's chosen `decisive_dimension` actually matches its own underlying reasoning.

### Cases

Required:

- `prd-hidden-scope-creep`
- `handoff-contradiction`
- `event-automation-boundary`

Nice to add:

- `feature-weak-evidence`
- `board-update-ambiguity`

### Method

For each verdict, inspect:

- `rubric_scores`
- `dimension_rationales`
- `decisive_dimension`
- `decisive_findings`

Ask these questions:

1. Does the named `decisive_dimension` correspond to the largest score separation?
2. Does it match the strongest language in `dimension_rationales`?
3. Do `decisive_findings` mostly argue in terms of a different dimension than the one named?

### Classification rubric

Classify each verdict as:

- `aligned`: decisive label matches scores and rationale
- `selection_bias`: underlying reasoning favors one dimension, final decisive label names another
- `deep_bias`: both scores/rationales and decisive label over-favor `decision_usefulness`

### What would count as evidence

Evidence for H2:

- multiple contradiction / boundary cases classify as `selection_bias`

Evidence against H2:

- the same cases classify as `deep_bias`, meaning the skew is upstream of the final label step

## Test 3: Within-Gemini Repeatability

### Purpose

Test H3 by measuring whether the observed pattern is stable across repeated runs.

### Scenarios

Use the three strongest bias cases:

- `prd-hidden-scope-creep`
- `handoff-contradiction`
- `event-automation-boundary`

### Method

For each scenario:

1. Freeze one canonical artifact set.
2. Replay Gemini `2.5-pro` `5` times.
3. Save each replay as a distinct label, e.g.:
   - `gemini-repeat-1`
   - `gemini-repeat-2`
   - `gemini-repeat-3`
   - `gemini-repeat-4`
   - `gemini-repeat-5`

Track:

- `winner`
- `margin`
- `judge_confidence`
- `needs_human_review`
- `decisive_dimension`
- `repair_attempted`

### What would count as evidence

Evidence for H3:

- `decisive_dimension` stays mostly or entirely `decision_usefulness` across repeats
- winner and review behavior are directionally stable

Evidence against H3:

- decisive dimension flips frequently among `evidence_discipline`, `internal_consistency`, and `decision_usefulness`

## Test 4: Cross-Family Dimension Distribution on Typed Scenarios

### Purpose

Use the new `taxonomy.scenario_type` metadata to compare dimension concentration by family.

### Method

Once Test 1 creates artifact-matched three-family verdicts with richer schema:

1. Group by `taxonomy.scenario_type`
2. Compute decisive-dimension counts for:
   - Claude
   - GPT
   - Gemini
3. Compare distributions in:
   - `executive_ambiguity`
   - `contradiction_or_boundary_prd`
   - `evidence_fragile_prd`
   - `historical_strategy`

### What would count as evidence

Strong evidence of Gemini-specific bias:

- only Gemini shows strong `decision_usefulness` dominance in `contradiction_or_boundary_prd`

Weakening evidence:

- Claude/GPT show the same pattern under matched conditions

## Minimum decision thresholds

I would consider the following sufficient to make a firmer claim:

1. At least `5` artifact-matched scenarios judged by all three families.
2. At least `3` contradiction / boundary cases in that matched set.
3. At least `5` repeated Gemini replays on those contradiction / boundary cases.

That gives us:

- cross-family comparison
- within-family stability
- separation of reasoning-vs-label effects

## Recommended order

1. Run Test 1 first.
2. Immediately perform Test 2 on the resulting verdicts.
3. If Gemini still looks anomalous, run Test 3.
4. Then summarize with Test 4 using taxonomy-backed grouping.

## Output artifacts to produce

- `docs/review/codex-artifact-matched-three-family-comparison.md`
- `docs/review/codex-decisive-label-alignment-audit.md`
- `docs/review/codex-gemini-repeatability-study.md`
- optional machine-readable summary:
  - `benchmarks/results/conflict-harness/judge-bias-analysis-2026-04-14.json`

## Practical note

Do not intervene on prompt wording until after Tests 1 and 2.

If Claude/GPT also collapse onto one dimension under matched replay conditions, then we are looking at a shared harness artifact, not a Gemini-specific problem. If Gemini alone remains concentrated and the alignment audit shows `selection_bias`, then a targeted decisive-label calibration change becomes justified.
