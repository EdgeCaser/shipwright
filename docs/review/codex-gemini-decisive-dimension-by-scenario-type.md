# Codex Note: Gemini Decisive Dimension vs Scenario Type

Status: Complete
Date: 2026-04-14
Author: Codex

## Question

Does Gemini's `decisive_dimension` track scenario type in a useful way, or is `decision_usefulness` simply dominating regardless of scenario?

## Short answer

Partial signal, but not enough to clear Gemini of bias.

There are real exceptions where Gemini surfaces a different decisive dimension:

- `claim_quality` on `feature-weak-evidence`
- `responsiveness_to_critique` on `blockbuster-total-access`
- `responsiveness_to_critique` on `meta-muse-spark`

That is encouraging, because it means Gemini is not mechanically outputting `decision_usefulness` in every single case.

But `decision_usefulness` still dominates too broadly across both executive-framed and evidence/constraint-heavy cases:

- `board-update-ambiguity`
- `churn-conflicting-signals`
- `event-automation-boundary`
- `handoff-contradiction`
- `netflix-qwikster`
- `prd-hidden-scope-creep`
- `pricing-partial-data`
- `supermicro-export-controls`
- `yahoo-microsoft`
- `zillow-offers`

So the current evidence supports: **some scenario sensitivity, but likely a house-style bias toward decision usefulness.**

## Taxonomy-backed scenario buckets

These buckets are now encoded directly in the scenario metadata under `benchmarks/scenarios/*.json` as `taxonomy.scenario_type`.

### `executive_ambiguity` (`3` scenarios)

- `board-update-ambiguity`
- `churn-conflicting-signals`
- `pricing-partial-data`

Gemini decisive dimensions:

- all `decision_usefulness`

This is the strongest evidence in favor of the original hypothesis. These cases are relatively thin, decision-framed, and ambiguity-heavy. Gemini consistently optimizes for the usefulness of the recommendation under uncertainty.

### `historical_strategy` (`6` scenarios)

- `blockbuster-total-access`
- `meta-muse-spark`
- `netflix-qwikster`
- `supermicro-export-controls`
- `yahoo-microsoft`
- `zillow-offers`

Gemini decisive dimensions:

- `blockbuster-total-access` -> `responsiveness_to_critique`
- `meta-muse-spark` -> `responsiveness_to_critique`
- `netflix-qwikster` -> `decision_usefulness`
- `supermicro-export-controls` -> `decision_usefulness`
- `yahoo-microsoft` -> `decision_usefulness`
- `zillow-offers` -> `decision_usefulness`

This is mixed. The presence of `responsiveness_to_critique` on two of these is a real positive sign. But `decision_usefulness` still wins in four others, including evidence-rich board and strategy cases where `evidence_discipline` or `claim_quality` might have been more natural decisive lenses.

### `contradiction_or_boundary_prd` (`3` scenarios)

- `event-automation-boundary`
- `handoff-contradiction`
- `prd-hidden-scope-creep`

Gemini decisive dimensions:

- `event-automation-boundary` -> `decision_usefulness`
- `handoff-contradiction` -> `decision_usefulness`
- `prd-hidden-scope-creep` -> `decision_usefulness`

This is the clearest evidence of bias in the current sample. This bucket was intended to stress contradiction handling, scope discipline, and deterministic boundary control, yet Gemini resolves all three through `decision_usefulness`.

### `evidence_fragile_prd` (`1` scenario)

- `feature-weak-evidence`

Gemini decisive dimensions:

- `feature-weak-evidence` -> `claim_quality`

This is an encouraging counterexample. In the one explicitly weak-evidence scenario, Gemini did shift off `decision_usefulness` and onto a more natural lens.

## Interpretation

My current read:

1. `decision_usefulness` is not a hardcoded artifact.
   Gemini can and does switch to other dimensions.

2. But the switching threshold is too high.
   In several scenarios where evidence discipline, internal consistency, or boundary control seem like the natural decisive lenses, Gemini still resolves through `decision_usefulness`.

3. So the pattern is better described as:
   `decision_usefulness` is a strong default prior, not a universal rule.

That means the current behavior is partly a feature and partly a bias:

- feature: ambiguity-heavy executive cases naturally map to decision usefulness
- bias: the same lens continues to dominate many evidence-heavy and contradiction-heavy cases where other rubric dimensions should probably surface more often

## Recommendation

Now that the scenario taxonomy is in the benchmark metadata, the next follow-up should be mechanical rather than manual:

1. Update the analysis script to group Gemini verdicts by `taxonomy.scenario_type`.
2. Recompute decisive-dimension distribution directly from the typed benchmark set.
3. If `decision_usefulness` continues to dominate `contradiction_or_boundary_prd`, treat that as a judge bias worth correcting in prompt wording or calibration guidance.
