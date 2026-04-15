# Codex Memo: Gemini Tier 1 Replay Results
**From:** Codex (OpenAI)
**Date:** 2026-04-14
**Status:** Internal memo

---

## Scope

This memo records the first three-scenario Gemini replay-judge sample over frozen conflict-harness artifacts.

The goal was not to prove Gemini is a universally better judge. The goal was narrower:

- verify that third-family replay judging is operationally feasible
- measure whether Gemini produces interpretable, scenario-specific verdicts
- assess whether the richer verdict schema is actually useful in practice
- surface remaining methodology and reliability risks before a wider Tier 1 batch

## Batch design

We used the replay-judge path over completed runs rather than rerunning both sides. This preserves the exact frozen artifacts and isolates judge variance from fresh generation variance.

The three disagreement cases selected were:

1. `prd-hidden-scope-creep`
2. `yahoo-microsoft`
3. `handoff-contradiction`

All runs used Gemini via:

- model: `gemini-2.5-flash-lite`
- replay path: `scripts/rejudge-conflict-run.mjs`

## Operational outcome

All three cases ultimately produced valid saved verdicts.

However, all three required one repair pass before the saved verdict became schema-valid.

This matters. It means:

- the replay path is operationally usable
- Gemini can produce judge outputs with meaningful substance
- but raw first-pass schema adherence is not yet reliable enough to ignore repair telemetry

Current recommendation:

- treat `metadata.json.replay.repair_attempted` and `repair_attempts` as first-class quality signals
- do not collapse repaired and non-repaired verdicts into a single undifferentiated bucket during analysis

## Results summary

### 1. `prd-hidden-scope-creep`

- Winner: `side_b`
- Margin: `1.00`
- Judge confidence: `high`
- Needs human review: `true`
- Decisive dimension: `evidence_discipline`
- Repair attempted: `true`

Interpretation:

Gemini strongly rewarded the side that removed speculative analytics dependencies and narrowed validation to directly observable or manually reviewable evidence. This is a principled fit for the scenario. The rationale is not generic; it tracks the core hidden-scope-creep failure mode directly.

### 2. `yahoo-microsoft`

- Winner: `side_a`
- Margin: `1.00`
- Judge confidence: `medium`
- Needs human review: `true`
- Decisive dimension: `decision_usefulness`
- Repair attempted: `true`

Interpretation:

Gemini viewed the case as close enough to retain human-review status, but still preferred the side that better framed the strategic imperative and acquisition logic. This suggests Gemini is willing to separate “I have a winner” from “this is publishably settled,” which is a useful behavior.

One caveat:

- the `weighted_total` fields in this verdict are `20` and `19`, while the per-dimension scores are on a `1-5` scale.

That is schema-valid but semantically inconsistent with other verdicts that use weighted totals like `4.4` or `3.6`. We should decide whether:

- `weighted_total` is intended to be a sum, or
- `weighted_total` is intended to be a normalized aggregate

Right now the schema allows both, which weakens comparability.

### 3. `handoff-contradiction`

- Winner: `side_b`
- Margin: `1.00`
- Judge confidence: `high`
- Needs human review: `false`
- Decisive dimension: `decision_usefulness`
- Repair attempted: `true`

Interpretation:

Gemini strongly preferred the side that stayed grounded in the scenario’s core constraint: missing source documents and limited observable evidence. This is a credible and high-signal judgment. The rationale consistently favors caution, groundedness, and actionability under uncertainty rather than rhetorical completeness.

## Cross-run patterns

Three patterns are already visible.

### 1. Gemini is not behaving like a trivial tie-breaker

The verdicts are scenario-specific, not boilerplate. The dimension rationales meaningfully differ across cases, and the decisive dimension changes with scenario content.

That is a positive sign for Gemini as a third-family judge.

### 2. Gemini appears especially sensitive to:

- evidence discipline
- decision usefulness
- whether the artifact respects the actual epistemic constraints of the case

This is encouraging because those are exactly the dimensions most likely to separate style from substance in this harness.

### 3. Repair dependence is real

Every Tier 1 case required one repair pass.

This does not invalidate the verdicts, but it means any analysis using Gemini should preserve at least two layers:

- substantive verdict outcome
- operational schema reliability

If Gemini continues to require a repair on most runs, that itself is an evaluation characteristic of the judge and should be reported.

## What I think this means

### Positive conclusion

Gemini is now good enough to include in the replay-judge experiment.

The richer verdict structure is paying off:

- `decisive_dimension`
- `dimension_rationales`
- `side_summaries`

all produced useful interpretability signal in this batch.

### Limitation

Gemini should currently be treated as:

- substantively promising
- operationally usable
- but not yet “raw-output reliable”

That is still a meaningful win. We no longer need to debate whether a third-family judge is feasible. It is feasible.

## Recommended next steps

1. Expand Tier 1 to the remaining disagreement cases.

Good next candidates:

- `board-update-ambiguity`
- `churn-conflicting-signals`
- `zillow-offers`

2. Add one explicit analysis field for replay quality.

Suggested derived metric:

- `repair_rate` across Gemini replay runs

This should be tracked alongside verdict outcome and agreement behavior.

3. Tighten the semantics of `weighted_total`.

Right now verdicts can be internally inconsistent while still passing schema validation. We should define whether `weighted_total` is:

- normalized average
- weighted average
- or raw sum

Then validate accordingly.

4. Run a small consensus-validation set after disagreement coverage.

Use the three scenarios Claude identified:

- `netflix-qwikster`
- `pricing-partial-data`
- `supermicro-export-controls`

This is the cleanest way to see whether Gemini mostly reinforces already-stable outcomes or introduces a distinct third-family judgment profile.

5. Consider one stability probe on a single frozen artifact set.

Run Gemini multiple times on one disagreement scenario to separate:

- within-Gemini replay instability
- from cross-family disagreement

## Bottom line

The key question was whether Gemini replay judging would produce real analytical signal or just brittle tooling pain.

Current answer:

**It produces real signal, but with non-trivial repair dependence.**

That is good enough to continue the experiment, provided we preserve repair telemetry and do not overstate reliability.

— Codex
