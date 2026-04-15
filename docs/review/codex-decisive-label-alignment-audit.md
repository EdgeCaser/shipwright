# Codex Memo: Decisive-Label Alignment Audit

Status: Complete
Date: 2026-04-14
Author: Codex

## Scope

This audit examines the artifact-matched three-family replay set on five frozen scenarios:

- `prd-hidden-scope-creep`
- `handoff-contradiction`
- `event-automation-boundary`
- `feature-weak-evidence`
- `board-update-ambiguity`

The goal is to determine whether each judge's named `decisive_dimension` aligns with its own:

- `rubric_scores`
- `dimension_rationales`
- `decisive_findings`

## Classification rubric

- `aligned`: decisive label matches the strongest score/rationale pattern
- `selection_bias`: underlying reasoning emphasizes one dimension, but the final decisive label names another
- `mixed`: more than one dimension plausibly supports the verdict, so the final label is not obviously wrong but not uniquely compelled either

## High-level finding

The strongest Gemini anomaly remains `handoff-contradiction`.

In that case:

- Claude chose `evidence_discipline`
- GPT chose `evidence_discipline`
- Gemini chose `decision_usefulness`

And Gemini's own rationale still acknowledges Side A's stronger evidence discipline. That is the clearest `selection_bias` result in the matched set.

Outside that case, the picture is more mixed than uniformly pathological. Gemini still leans hard toward `decision_usefulness`, but not every such choice is misaligned.

## Scenario audit

### `prd-hidden-scope-creep`

#### Claude

- winner: `side_b`
- decisive dimension: `decision_usefulness`
- classification: `aligned`

Why:

- Claude scores Side B higher on most dimensions, but the largest practical separation in the rationale is that Side B gives an explicit NOT READY verdict, gate conditions, and a concrete artifact sequence.
- `decisive_findings` are explicitly centered on actionability and verdict usefulness.

#### GPT

- winner: `side_a`
- decisive dimension: `decision_usefulness`
- classification: `aligned`

Why:

- GPT's rationale repeatedly argues that Side A is more usable as the PRD the prompt asked for.
- The score spread is broad, but the label matches the narrative emphasis on prompt-fit and buildability.

#### Gemini

- winner: `side_b`
- decisive dimension: `decision_usefulness`
- classification: `mixed`

Why:

- Gemini explicitly recognizes the core contradiction and strong evidence-discipline issue.
- But in this matched verdict, Side B is scored higher across nearly every dimension, not just usefulness.
- So this is not a clean mislabel. It is better read as an over-broad usefulness framing layered on top of a generally favorable judgment for Side B.

### `handoff-contradiction`

#### Claude

- winner: `tie`
- decisive dimension: `evidence_discipline`
- classification: `aligned`

Why:

- Claude's own rationale says the central tradeoff is Side A's stronger evidence discipline versus Side B's greater operational specificity.
- The tie is explained by that exact tension.
- Naming `evidence_discipline` as decisive fits the logic of the verdict.

#### GPT

- winner: `side_a`
- decisive dimension: `evidence_discipline`
- classification: `aligned`

Why:

- GPT strongly emphasizes that Side B's concrete specificity is undermined by unsupported details.
- The score gap is driven mainly by evidence-discipline and defensibility.

#### Gemini

- winner: `tie`
- decisive dimension: `decision_usefulness`
- classification: `selection_bias`

Why:

- Gemini explicitly says:
  - Side A is stronger on `evidence_discipline`
  - both sides are strong on `internal_consistency`
  - Side B is more concrete on `decision_usefulness`
- Its own `decisive_findings` describe a balance: Side B's usefulness is offset by Side A's stronger evidence discipline.
- Yet the final decisive label still lands on usefulness.

This is the clearest case where Gemini appears to reason about the right tension but still crowns the wrong dimension.

### `event-automation-boundary`

#### Claude

- winner: `side_a`
- decisive dimension: `decision_usefulness`
- classification: `aligned`

Why:

- Claude's rationale is explicitly centered on Side A being more actionable and better calibrated for the next build step.
- The label fits the verdict.

#### GPT

- winner: `side_b`
- decisive dimension: `evidence_discipline`
- classification: `aligned`

Why:

- GPT's reasoning consistently penalizes Side A for unsupported thresholds and praises Side B for deferring specifics until evidence exists.
- The decisive label matches the rationale.

#### Gemini

- winner: `side_a`
- decisive dimension: `decision_usefulness`
- classification: `aligned`

Why:

- Gemini rates evidence-discipline and internal-consistency roughly even, then clearly prefers Side A for being more implementation-ready.
- This is a legitimate usefulness-led call, not an obvious mislabel.

## Interim conclusion

The matched-set audit sharpens the earlier hypothesis:

1. Gemini is not uniformly broken at the dimension level.
   Some `decision_usefulness` calls are reasonable and aligned.

2. But Gemini does show a real selection-layer problem in at least one critical contradiction case.
   `handoff-contradiction` is the strongest example.

3. The anomaly is more specific than "Gemini always picks the wrong dimension."
   A better claim is:
   Gemini appears more likely than Claude or GPT to resolve multi-dimensional tensions by naming `decision_usefulness` as decisive, even when its own reasoning gives comparable or stronger weight to evidence-discipline concerns.

## What this supports

This audit supports the following stronger statement:

- Gemini's `decision_usefulness` concentration is not just a harness artifact.
- At least some of the effect is a **decisive-label selection bias**, not a total inability to reason about evidence discipline or consistency.

## Recommended next step

Proceed to the repeatability study on the three contradiction/boundary cases:

- `prd-hidden-scope-creep`
- `handoff-contradiction`
- `event-automation-boundary`

If Gemini keeps selecting `decision_usefulness` on repeated frozen replays of `handoff-contradiction`, the case for a stable house-style bias becomes much stronger.
