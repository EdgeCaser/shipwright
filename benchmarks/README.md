# Benchmarks

Shipwright v2 benchmarks are fixture-based and deterministic by design.

Each scenario lives in `benchmarks/scenarios/` and points to:

- an initial markdown artifact fixture
- a final markdown artifact fixture
- optional related structured artifacts for contradiction and challenge checks
- optional blind review inputs

The harness in `scripts/run-benchmarks.mjs` validates those fixtures with the existing runtime validator and emits the required result shape from `docs/shipwright-v2-benchmark-scoring-spec.md`.

Proof-pack rules and publishability criteria live in `docs/shipwright-v2-proof-method.md`.

## Fixture Rules

- Markdown artifacts remain canonical for human review.
- Structured payloads embedded in artifact comments are extracted and validated.
- Related artifacts may be raw `.json` sidecars or markdown artifacts with an embedded structured payload.
- `blind_review` may be `null` until human review has been run.
- Every generated suite summary now includes `provenance` and `threshold_policy` metadata.
- Older baseline summaries without those metadata blocks are intentionally rejected and must be regenerated or upgraded before comparison.

## Default Run

```bash
node scripts/run-benchmarks.mjs
node scripts/run-benchmarks.mjs --format json
node scripts/run-benchmarks.mjs --out benchmarks/results/latest.json --format json
node scripts/run-benchmarks.mjs --publish --out benchmarks/results/publish-ready.json --format json
node scripts/run-benchmarks.mjs --publish --baseline benchmarks/baselines/example.json --out benchmarks/results/compared.json --format json
```

## Scenario Shape

```json
{
  "id": "prd-hidden-scope-creep",
  "title": "PRD with hidden scope creep",
  "inputs": {
    "prompt": "Write a PRD for ...",
    "context_files": [],
    "expected_artifact_type": "prd",
    "scoring_spec_ref": "docs/shipwright-v2-benchmark-scoring-spec.md"
  },
  "validator": {
    "expect_sections": [
      "Decision Frame",
      "Unknowns & Evidence Gaps",
      "Pass/Fail Readiness",
      "Recommended Next Artifact"
    ],
    "expect_structured": true
  },
  "fixtures": {
    "first_pass_artifact": "../fixtures/prd-hidden-scope-creep/first-pass.md",
    "final_pass_artifact": "../fixtures/prd-hidden-scope-creep/final-pass.md",
    "related_artifacts": [
      "../fixtures/prd-hidden-scope-creep/related/challenge-report.json"
    ],
    "blind_review": null
  },
  "run_metadata": {
    "time_to_first_usable_artifact_seconds": 420,
    "revision_count": 1
  },
  "measures": [
    "time_to_first_usable_artifact",
    "revision_count",
    "contradiction_count",
    "blind_human_rating"
  ]
}
```
