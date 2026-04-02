# Blind Reviews

Blind-review runs should be created under:

- `benchmarks/reviews/runs/<review-run-id>/`

Recommended contents:

- `review-packet.json`
- `review-packet.md`
- `review-template.json`
- `admin-manifest.json`
- `responses/`
- `review-aggregate.json`

Generate these files with:

```bash
node scripts/prepare-blind-review.mjs --out-dir benchmarks/reviews/runs/<review-run-id>
```

Then compile reviewer scorecards into updated benchmark summaries with:

```bash
node scripts/compile-blind-review.mjs \
  --current-summary benchmarks/results/current-pre-review.json \
  --baseline-summary benchmarks/baselines/<method-name>/suite-summary-pre-review.json \
  --admin-manifest benchmarks/reviews/runs/<review-run-id>/admin-manifest.json \
  --reviews-dir benchmarks/reviews/runs/<review-run-id>/responses \
  --current-out benchmarks/results/current-reviewed.json \
  --baseline-out benchmarks/baselines/<method-name>/suite-summary-reviewed.json
```

See `docs/shipwright-v2-proof-runbook.md` for the full workflow and provenance rules.
