# strong-prompt-v1

This directory is reserved for the first named comparison method used in Shipwright v2 proof runs.

Expected contents:

- `scenarios/`
- `fixtures/`
- `suite-summary-pre-review.json`
- `suite-summary-reviewed.json`

The scenario files should mirror the canonical benchmark contract from `benchmarks/scenarios/` while pointing to baseline-produced fixtures instead of Shipwright fixtures.

Do not commit invented outputs here just to satisfy the structure. This directory should only receive real baseline artifacts and summaries generated through the workflow documented in `docs/shipwright-v2-proof-runbook.md`.
