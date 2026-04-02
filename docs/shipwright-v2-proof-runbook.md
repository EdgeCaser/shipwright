# Shipwright v2 Proof Runbook

This runbook explains how to produce non-circular proof inputs for Shipwright v2.

Use it when you are ready to collect:

- a real baseline method on the frozen benchmark set
- blinded reviewer scores that do not reveal artifact origin
- publishable or internal proof-pack inputs for `scripts/generate-proof-pack.mjs`

## 1. Prepare a Baseline Method

Create a baseline scenario tree under:

- `benchmarks/baselines/<method-name>/scenarios/`
- `benchmarks/baselines/<method-name>/fixtures/`

The baseline scenario JSON files should mirror the canonical benchmark contract:

- same `id`
- same scenario titles
- same expected artifact type
- same `run_metadata`
- baseline fixture paths instead of Shipwright fixture paths

Do not mark provenance as independent just because the files exist. Independence is an attestation that the baseline method was produced outside Shipwright's orchestration and is traceable to a real comparison process.

## 2. Generate Non-Blinded Suite Summaries

Run the benchmark harness separately for the Shipwright fixtures and the baseline fixtures.

Example:

```bash
node scripts/run-benchmarks.mjs --out benchmarks/results/current-pre-review.json --format json
node scripts/run-benchmarks.mjs \
  --scenario-dir benchmarks/baselines/strong-prompt-v1/scenarios \
  --out benchmarks/baselines/strong-prompt-v1/suite-summary-pre-review.json \
  --format json
```

These pre-review summaries should still have conservative provenance and `blind_rating: null`.

## 3. Prepare the Blind Review Packet

Generate a reviewer packet and an admin-only manifest:

```bash
node scripts/prepare-blind-review.mjs \
  --current-scenarios benchmarks/scenarios \
  --baseline-scenarios benchmarks/baselines/strong-prompt-v1/scenarios \
  --review-run-id strong-prompt-v1-round-1 \
  --out-dir benchmarks/reviews/runs/strong-prompt-v1-round-1
```

This creates:

- `review-packet.json`
- `review-packet.md`
- `review-template.json`
- `admin-manifest.json`

Rules:

- share `review-packet.*` and copies of `review-template.json` with reviewers
- do not share `admin-manifest.json` with reviewers
- reviewers should score each artifact independently using the 1-5 rubric
- use at least 3 independent reviewers

The packet intentionally strips the embedded structured payload from artifact markdown so reviewers see the human-facing artifact, not the hidden machine payload.

## 4. Collect Reviewer Scorecards

Ask each reviewer to copy `review-template.json`, fill every score, and save it under a reviews directory, for example:

- `benchmarks/reviews/runs/strong-prompt-v1-round-1/responses/reviewer-a.json`
- `benchmarks/reviews/runs/strong-prompt-v1-round-1/responses/reviewer-b.json`
- `benchmarks/reviews/runs/strong-prompt-v1-round-1/responses/reviewer-c.json`

Each scorecard must:

- keep the same `review_run_id`
- provide a unique `reviewer_id`
- score every listed `artifact_id`
- use numeric 1-5 scores on all four dimensions

## 5. Complete Provenance Attestations

Before compiling blind review results, update `admin-manifest.json`:

- set `provenance.current.artifact_generation.independent` only if the Shipwright benchmark run is frozen and attributable
- set `provenance.baseline.artifact_generation.independent` only if the baseline was produced outside Shipwright
- set `provenance.*.blind_review.independent` and `provenance.*.blind_review.blinded` only when the review process actually met those bars

This manifest is the source of truth for provenance overlays during blind-review compilation.

## 6. Compile Reviewer Scores Into Suite Summaries

Use the compiler to inject blind ratings and provenance overlays into updated suite summaries:

```bash
node scripts/compile-blind-review.mjs \
  --current-summary benchmarks/results/current-pre-review.json \
  --baseline-summary benchmarks/baselines/strong-prompt-v1/suite-summary-pre-review.json \
  --admin-manifest benchmarks/reviews/runs/strong-prompt-v1-round-1/admin-manifest.json \
  --reviews-dir benchmarks/reviews/runs/strong-prompt-v1-round-1/responses \
  --current-out benchmarks/results/current-reviewed.json \
  --baseline-out benchmarks/baselines/strong-prompt-v1/suite-summary-reviewed.json \
  --aggregate-out benchmarks/reviews/runs/strong-prompt-v1-round-1/review-aggregate.json
```

The compiler will:

- fail if fewer than 3 scorecards are provided
- fail if any reviewer skipped an artifact
- fail if scenario IDs drift between current, baseline, and assignments
- normalize scores into the benchmark suite's `blind_rating` fields

## 7. Generate a Proof Pack

Once the reviewed summaries exist, feed them into the existing proof tool:

```bash
node scripts/generate-proof-pack.mjs \
  --current benchmarks/results/current-reviewed.json \
  --baseline benchmarks/baselines/strong-prompt-v1/suite-summary-reviewed.json \
  --json-out benchmarks/results/proof-pack.json \
  --markdown-out benchmarks/results/proof-pack.md
```

If provenance or threshold policy is still provisional, the proof pack will say so explicitly.

## 8. Publishability Checklist

You are ready for README proof claims or case studies only when:

- baseline production was real and independently attributable
- reviewers did not know artifact origin
- at least 3 complete scorecards were collected
- both updated suite summaries carry the correct provenance metadata
- comparison remains valid against the unchanged scoring spec or an explicitly versioned revision
