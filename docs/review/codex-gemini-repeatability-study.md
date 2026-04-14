# Codex Memo: Gemini Repeatability Study

Status: Complete
Date: 2026-04-14
Author: Codex

## Scope

This study reran Gemini `2.5-pro` five times on the same frozen artifact sets for three contradiction and boundary scenarios:

- `prd-hidden-scope-creep`
- `handoff-contradiction`
- `event-automation-boundary`

Goal:

- test whether Gemini's `decision_usefulness` tendency is stable across repeated replays
- distinguish broad house style from case-specific behavior

## Summary

The broad "Gemini always collapses to `decision_usefulness`" hypothesis does **not** hold up.

Instead, the repeatability signal is scenario-specific:

- `prd-hidden-scope-creep`: stable winner, mixed decisive dimension
- `handoff-contradiction`: mostly stable usefulness-led pattern
- `event-automation-boundary`: stable winner, unstable decisive dimension

This means the strongest current bias claim should be narrowed to:

Gemini shows a stable `decision_usefulness` tendency on at least one contradiction case (`handoff-contradiction`), but not uniformly across all contradiction and boundary scenarios.

## Results

### `prd-hidden-scope-creep`

- winner: `side_b` in `5/5`
- decisive dimension:
  - `evidence_discipline`: `3/5`
  - `decision_usefulness`: `2/5`
- confidence:
  - `high`: `1`
  - `medium`: `4`
- `needs_human_review: true`: `2/5`

Interpretation:

- Winner behavior is perfectly stable.
- Decisive dimension is not.
- This is not good evidence of a stable `decision_usefulness` house style.

If anything, this case now looks more like a robust `side_b` preference with two plausible explanatory lenses.

### `handoff-contradiction`

- winner:
  - `side_b`: `4/5`
  - `side_a`: `1/5`
- decisive dimension:
  - `decision_usefulness`: `4/5`
  - `evidence_discipline`: `1/5`
- confidence:
  - `high`: `4`
  - `medium`: `1`
- `needs_human_review: true`: `0/5`

Interpretation:

- This is the strongest repeatability signal in the study.
- Gemini mostly converges on:
  - `side_b`
  - high confidence
  - `decision_usefulness`

This is especially important because the artifact-matched cross-family study showed:

- Claude: `evidence_discipline`
- GPT: `evidence_discipline`
- Gemini: usually `decision_usefulness`

So `handoff-contradiction` remains the clearest canary for a Gemini-specific decisive-label tendency.

### `event-automation-boundary`

- winner: `side_a` in `5/5`
- decisive dimension:
  - `responsiveness_to_critique`: `2/5`
  - `decision_usefulness`: `2/5`
  - `evidence_discipline`: `1/5`
- confidence:
  - `high`: `4`
  - `medium`: `1`
- `needs_human_review: true`: `1/5`

Interpretation:

- Winner behavior is perfectly stable.
- Decisive dimension is highly unstable.

This is not a clean bias case. It looks more like a scenario where multiple dimensions can plausibly explain the same winner.

## Operational note

All `15/15` repeat runs required repair.

That means the study is still informative for judge behavior, but all conclusions remain repair-aware.

One repeat (`event-automation-boundary`, repeat 4) initially failed due to a transient Gemini transport error (`ECONNRESET` / `ERR_STREAM_PREMATURE_CLOSE`) and was rerun successfully.

## Conclusions

### What the study rules out

It rules out the strongest broad claim:

- Gemini does **not** show a universal cross-case collapse to `decision_usefulness`.

### What the study strengthens

It strengthens a narrower claim:

- Gemini shows a stable `decision_usefulness` tendency on at least one important contradiction case: `handoff-contradiction`.

### What this means for future analysis

- `handoff-contradiction` is a strong canary case for judge-bias testing.
- `prd-hidden-scope-creep` should not be used as standalone proof of the same bias.
- `event-automation-boundary` should be treated as a multi-lens scenario, not a bias detector.

## Recommended next use

If we want one benchmark case to test decisive-label calibration changes, use:

- `handoff-contradiction`

If we want to test whether a prompt change causes collapse or overcorrection, use all three:

- `handoff-contradiction`
- `prd-hidden-scope-creep`
- `event-automation-boundary`

That combination gives:

- one strong bias detector
- one mixed contradiction case
- one stable-winner / unstable-dimension case
