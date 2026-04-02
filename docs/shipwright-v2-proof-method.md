# Shipwright v2 Proof Method

Shipwright v2 proof artifacts must clear a higher bar than internal demos. This document defines that bar.

Operational steps for collecting those inputs live in `docs/shipwright-v2-proof-runbook.md`.

## Baseline Provenance

A baseline comparison is publishable only when the baseline artifacts are produced outside Shipwright's own orchestration and are traceable to a real comparison method.

Minimum requirement:

- the baseline run identifies the alternative method used
- the baseline artifacts are generated on the same frozen scenario set
- the baseline summary marks `provenance.artifact_generation.independent: true`

If those conditions are not met, the comparison may still be useful for internal calibration, but it is not publishable proof.

## Blind Review Independence

Blind-review evidence is publishable only when reviewers do not know whether an artifact came from Shipwright or the baseline method.

Minimum requirement:

- at least 3 raters
- blinded artifact presentation
- reviewers do not know artifact origin
- the suite summary marks:
  - `provenance.blind_review.independent: true`
  - `provenance.blind_review.blinded: true`

If those conditions are not met, the run is not publishable proof.

## Threshold Interpretation

The current scoring thresholds from `docs/shipwright-v2-benchmark-scoring-spec.md` are precise enough to implement now, but the first live comparison should still be treated as provisional.

Why:

- the first real comparison is also the first time those thresholds meet live data
- a provisional interpretation avoids overstating rigor before independent proof exists

Until an explicit later revision says otherwise, suite summaries should default to:

- `threshold_policy.status: "provisional"`

## Publishability Gate

README proof claims, case studies, and external-facing benchmark summaries require all of the following:

- current Shipwright run has independent artifact provenance
- baseline run has independent artifact provenance
- current blind review is independent and blinded
- baseline blind review is independent and blinded
- blind ratings are complete for every scenario
- the summaries use the current provenance and threshold-policy schema

If any of these are missing, Shipwright may publish an internal proof-status report, but not a publishable proof claim.

## Pre-Schema Baselines

Older benchmark summaries that do not include `provenance` or `threshold_policy` are not valid comparison inputs for the proof tooling.

Operators should:

- regenerate the summary with the current tooling, or
- upgrade it into the current schema before use

Pre-schema summaries should fail fast with an actionable error rather than being silently interpreted.
