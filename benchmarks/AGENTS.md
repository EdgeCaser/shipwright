# Benchmarks Area Guidance

Use these instructions when working anywhere under `benchmarks/`.

## Purpose

This directory holds benchmark scenarios, fixtures, baselines, review artifacts, and run outputs for Shipwright evaluation work.

Optimize for:

- experimental clarity
- reproducibility
- minimal hidden variance
- accurate bookkeeping

Benchmark work is methodology work. Small inconsistencies in naming, orientation, inputs, or summary logic can invalidate conclusions.

## Directory Roles

- `benchmarks/scenarios/`: canonical scenario definitions
- `benchmarks/fixtures/`: fixture artifacts and expected packet inputs
- `benchmarks/baselines/`: baseline prompts, baselines, and reference runs
- `benchmarks/results/`: generated run outputs and summaries
- `benchmarks/reviews/`: benchmark-specific review notes if present

Treat `scenarios/` as source of truth. Treat `results/` as generated evidence.

## Working Rules

- Prefer replaying or rejudging existing completed runs when the goal is to compare judges. Do not rerun both sides unless generation variance is part of the experiment.
- Make role assignment explicit. Side A, Side B, judge family, and orientation should never be implicit in analysis writeups.
- Preserve run artifacts. Do not rewrite or “clean up” generated run outputs unless the user explicitly asks for regeneration.
- When adding summaries, clearly separate completed cells, partial cells, and failed cells.
- Fail closed on unknown scenario IDs, missing comparisons, or incomplete judge matrices.
- Treat new metrics conservatively until they are validated. Heuristic metrics should be labeled as heuristic in code or analysis.

## Analysis Guardrails

- Do not present single-run outcomes as stable findings when rerun variance is unmeasured.
- Distinguish:
  - generation variance
  - judge variance
  - position/orientation effects
  - family/model effects
- If a matrix is incomplete, say so plainly and avoid strong publishability claims.
- Prefer matched comparisons over aggregate storytelling when the sample is still small.
- If scenario counts, tables, and narrative claims disagree, fix bookkeeping before interpretation.

## Judge Principles

When acting as a judge in the conflict harness, follow the protocol already encoded in the judge prompt and schemas. Do not invent a new evaluation philosophy on the fly.

Useful default principles:

- Judge the artifacts that were actually produced, not the solution you wish either side had written.
- Judge relatively, not absolutely. One side can win even if both are imperfect.
- Reward evidence discipline, internal consistency, responsiveness to critique, and decision usefulness.
- Penalize unsupported certainty, hidden contradictions, and arguments that sound confident without earning it.
- Treat small margins as genuinely uncertain. Use `needs_human_review` when the result is close, noisy, or both sides are weak in different ways.
- Do not infer provider identity from tone, stylistic quirks, formatting habits, or priors about model families.
- If both sides miss the core decision or both artifacts are materially weak, reflect that in margin and confidence rather than forcing a theatrical verdict.

Do not add extra hidden criteria in analysis after the fact. If the judging standard needs to change, version the prompt or protocol explicitly.

## Scenario Authoring

When adding or editing scenarios:

- keep the decision crisp
- keep the evidence packet bounded
- avoid vague “what should the company do?” framing when a narrower board/product decision is available
- prefer evidence-rich cases over lore-heavy cases
- note whether the scenario is synthetic, historical real-world, or current-event real-world

## Result Hygiene

- Generated run directories should remain inspectable and diffable.
- Preserve prompt files, input packets, raw outputs, parsed JSON, and summaries together.
- Do not delete failed runs unless the user explicitly asks; failure artifacts are part of the evidence trail.
