# Benchmark scoring contract

## What the harness measures

`scripts/run-benchmarks.mjs` replays saved first/final artifacts, validates their structured envelopes and compares them with related artifacts. It does not run a model, measure skill activation, verify source truth, or establish superiority over another workflow.

Every scenario result contains a scenario ID, PASS/FAIL/DNF, first-pass usability and validator counts, final-pass usability and counts, optional blind ratings, timing/revision metadata and deltas. The implementation is the executable contract; `schemas/artifacts/` defines the three structured artifact shapes; suite summaries are validated by the harness itself.

- PASS: final artifact satisfies applicable deterministic checks and declares PASS.
- FAIL: final artifact is valid but fails its declared intended-use readiness gate, including an honest explicit FAIL.
- DNF: the final artifact is missing or structurally incomplete, has unresolved blocking issues, or cannot satisfy the automated contract.
- Usable: valid and ready for its declared intended use, with no blocking warnings such as citation gaps and material contradictions. Informational findings do not block usability. A declared FAIL is not usable for an approved downstream handoff. Light PRD usability is directional only; the separate `readiness.engineeringReady` field must be checked for engineering delivery.

New replay results expose `valid` and `readiness` separately. `validator_error_count` counts contract errors, not honest unreadiness. These changes affect comparability with historical summaries; preserve prior results and label any new replay with its validator revision.

These are artifact readiness results, not whether the business recommendation is positive. A sound recommendation to stop a project can PASS. A useful exploratory artifact can remain FAIL.

## Blind ratings

At least three distinct reviewer IDs each supply first/final scores on decision_usefulness, evidence_discipline, internal_consistency and actionability. Each score is 1-5. Average the dimensions, then reviewers, divide by 5 and multiply by 100; round to one decimal. This yields 20-100 for complete reviews. Missing ratings are null, never zero. Stored summaries accept finite 0-100 ratings for compatibility and recompute means/counts from scenario results.

This scale is separate from `evals/rubric.md` (1-10 authoring feedback). Neither score overrides failed evidence or readiness checks.

## Comparison

Compare identical scenario sets with unique IDs. Current provisional regression triggers are any of:

- First-pass blind rating decreases by at least 10 points.
- First-pass usable rate decreases by at least 20 percentage points.
- First-pass validator error rate increases by at least 20 percentage points.

Timing and revision counts are descriptive metadata supplied by the run producer. Null timing means unmeasured. Fixed fixture replay cannot establish time savings. Report denominators and missing observations with means.

Thresholds remain provisional until a real blinded comparison has been assessed. Do not tune them after seeing the candidate's scores and then present that comparison as independently validated.
