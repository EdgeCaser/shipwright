# Shipwright v2 Benchmark Scoring Spec

**Date:** April 2, 2026
**Purpose:** Define the measurement contract for Shipwright v2 so Week 1, Week 4, and Week 6 reviews are decided by rules, not interpretation.

## Benchmark Measures

### 1. Time to First Usable Artifact

Measured from the start of the run to the first artifact version that meets all of the following:

- zero validator `error` findings
- all required sections present
- structured payload valid when the artifact type is schema-backed
- evidence contract satisfied
- no unresolved critical challenge findings

If no artifact reaches this state, record `DNF` for the scenario.

### 2. Revision Count

The number of full artifact rewrites or re-generations after the initial output until the first usable artifact is produced.

- Initial usable output: `0`
- Formatting-only edits: ignored
- Minor manual edits under 10 changed lines with no content change: ignored
- Any contentful regenerated artifact: `+1`

### 3. Contradiction Count

Count unique validator findings of these types on the first usable artifact:

- `metric-contradiction`
- `segment-contradiction`
- `challenge-finding-unresolved`

If a scenario never reaches a usable artifact, count these findings on the final artifact for reporting.

### 4. Blind Human Rating

Use 3 raters minimum. Strip all system identifiers before review.

Each rater scores the artifact from `1` to `5` on:

- decision usefulness
- evidence discipline
- internal consistency
- actionability

Final blind rating:

1. Average the 4 dimension scores per rater
2. Average across raters
3. Normalize to a 100-point scale: `(average / 5) * 100`

## Operational Definitions

### High-Confidence Obvious Ask

A request qualifies only if:

- exactly one workflow or skill wins the routing rubric
- no external research is required
- no multi-agent chain is required
- no mandatory input is missing from the selected workflow or skill
- no auto-escalation trigger fires

### Materially Worse First-Pass Quality

Shipwright v2 is materially worse on first pass if any of these are true across the benchmark suite:

- mean blind human rating on the first output drops by `>= 10` normalized points vs baseline
- first-pass usable rate drops by `>= 20` percentage points vs baseline
- first-pass validator `error` rate rises by `>= 20` percentage points vs baseline

### Materially Different Baselines or Targets

Two metric values are materially different only when metric name, segment, unit, and timeframe match, and:

- rate metrics differ by more than `2` percentage points or `10%` relative, whichever is larger
- absolute metrics differ by more than `10%` relative

If an artifact includes an explicit explanation or superseding assumption, the finding downgrades from contradiction to informational note.

### Unresolved Contradiction Flag

A contradiction is unresolved when a validator finding of type `metric-contradiction`, `segment-contradiction`, or `challenge-finding-unresolved` has no recorded explanation, waiver, deferment, or resolution state.

## Benchmark Review Output

Each scenario result must report:

- usable artifact status: `PASS`, `FAIL`, or `DNF`
- time to first usable artifact
- revision count
- contradiction count
- blind human rating
- first-pass vs final-pass comparison

### Required Result Shape

Each benchmark result must serialize this shape exactly:

```json
{
  "scenario_id": "prd-hidden-scope-creep",
  "status": "PASS",
  "first_pass": {
    "usable": false,
    "validator_error_count": 2,
    "contradiction_count": 1,
    "blind_rating": 64
  },
  "final_pass": {
    "usable": true,
    "time_to_first_usable_artifact_seconds": 420,
    "revision_count": 1,
    "validator_error_count": 0,
    "contradiction_count": 0,
    "blind_rating": 82
  },
  "delta": {
    "usable_changed": true,
    "blind_rating_change": 18,
    "contradiction_count_change": -1,
    "validator_error_count_change": -2
  }
}
```

`first_pass` must always describe the initial artifact.
`final_pass` must always describe the artifact used for final scenario judgment.
`delta` must always be computed from `final_pass - first_pass`.
`blind_rating` may be `null` only when human review has not yet been run; any published benchmark summary or Week 6 proof artifact must replace `null` with a numeric score.

For v2, benchmark summaries may include extra diagnostic fields, but they may not omit or rename any of the fields above.

### DNF Rating Rule

If a scenario ends in `DNF`:

- raters must still score the final failed artifact for diagnostic comparison
- `status` remains `DNF`
- `final_pass.usable` remains `false`
- `time_to_first_usable_artifact_seconds` is `null`

This preserves comparability across scenarios while keeping `usable artifact` judgment strict.

## Pass/Fail Readiness

PASS if this scoring spec is used unchanged during the v2 cycle unless an explicit revision is logged before rerunning baselines.
FAIL if benchmark terms are changed mid-cycle after seeing results.

## Recommended Next Artifact

An implementation plan that maps this scoring contract to:

- benchmark fixtures in `benchmarks/`
- validator output types in `scripts/validate-artifact.mjs`
- routing confidence logic in orchestration files or a deterministic helper
