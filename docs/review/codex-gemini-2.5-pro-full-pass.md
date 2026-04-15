# Codex Memo: Gemini 2.5 Pro Full-Pass Findings

Status: Complete
Date: 2026-04-14
Author: Codex

## Scope

This memo summarizes a full replay-judge pass across all 13 conflict-harness scenarios using `gemini-2.5-pro` on frozen artifacts. All runs used the replay path that reuses each scenario's saved `judge/verdict.prompt.txt` and writes results into `rejudges/gemini-tier{1,2,3}-pro/`.

## Bottom line

Gemini `2.5-pro` is substantively useful as a third-family judge. It produces scenario-aware verdicts, uses the richer schema in meaningful ways, and shows a credible willingness to return ties and low-confidence calls instead of forcing false precision.

Operationally, however, it is still not first-pass clean in this environment. All 13 completed replays required exactly one repair pass before producing a schema-valid verdict. That does not invalidate the results, but it means repair-aware telemetry is essential and raw first-pass outputs should not be treated as production-clean judge artifacts.

## Aggregate findings

- Scenarios completed: `13/13`
- Winner distribution:
  - `side_a`: `6`
  - `side_b`: `4`
  - `tie`: `3`
- Judge confidence:
  - `high`: `5`
  - `medium`: `3`
  - `low`: `5`
- `needs_human_review`:
  - `true`: `6`
  - `false`: `7`
- Average margin: `0.329`
- Repair telemetry:
  - `repair_attempted: true` on `13/13`
  - total repair attempts: `13`
- Decisive dimension distribution:
  - `decision_usefulness`: `10`
  - `responsiveness_to_critique`: `2`
  - `claim_quality`: `1`

## Scenario results

| Scenario | Winner | Margin | Confidence | Human Review | Decisive Dimension |
|---|---|---:|---|---|---|
| blockbuster-total-access | side_a | 0.20 | medium | false | responsiveness_to_critique |
| board-update-ambiguity | side_a | 0.60 | high | false | decision_usefulness |
| churn-conflicting-signals | side_b | 0.08 | low | true | decision_usefulness |
| event-automation-boundary | side_a | 0.20 | low | true | decision_usefulness |
| feature-weak-evidence | side_b | 0.20 | medium | false | claim_quality |
| handoff-contradiction | tie | 0.00 | low | true | decision_usefulness |
| meta-muse-spark | side_a | 0.20 | medium | false | responsiveness_to_critique |
| netflix-qwikster | side_b | 0.60 | high | false | decision_usefulness |
| prd-hidden-scope-creep | side_b | 0.80 | high | true | decision_usefulness |
| pricing-partial-data | tie | 0.00 | low | true | decision_usefulness |
| supermicro-export-controls | side_a | 0.60 | high | false | decision_usefulness |
| yahoo-microsoft | tie | 0.00 | low | true | decision_usefulness |
| zillow-offers | side_a | 0.80 | high | false | decision_usefulness |

## What stands out

### 1. Gemini is not just breaking ties

The verdicts are not trivial or mechanically balanced. Gemini produced:

- clear wins with high confidence and no human-review flag
- close calls with low confidence and explicit human-review escalation
- true ties with zero margin in cases where the evidence did not justify a forced winner

That behavior is healthy. It suggests the judge is willing to represent ambiguity rather than merely collapse every case into a decisive binary outcome.

### 2. `decision_usefulness` dominates Gemini's reasoning

`decision_usefulness` was the decisive dimension in `10/13` cases. That is the clearest structural pattern in the full pass.

This is partly encouraging:

- it means Gemini is consistently optimizing for artifact usefulness to a decision-maker
- it aligns with the board-ready / executive-usable framing that many scenarios implicitly reward

But it is also a risk:

- Gemini may be overweighting "useful synthesis" relative to other rubric dimensions
- if left unexamined, the judge could become a proxy for "which artifact feels most decision-ready" rather than a more balanced scorer across evidence discipline, critique response, and claim quality

This deserves explicit comparison against Claude/GPT patterns.

### 3. The tie/low-confidence behavior is a feature, not a bug

Three scenarios ended in ties:

- `handoff-contradiction`
- `pricing-partial-data`
- `yahoo-microsoft`

All three also carried low confidence and human-review escalation. That is a good sign. It indicates internal consistency between:

- winner selection
- margin
- confidence
- review gating

In other words, Gemini is not claiming certainty when it abstains.

### 4. Repair dependence remains the main operational concern

Every completed replay required exactly one repair pass. That is now too consistent to treat as noise.

The practical interpretation is:

- the substantive judging signal looks real
- the first-pass JSON contract remains brittle under long replay prompts
- replay telemetry must stay attached to any analysis of Gemini results

If we use Gemini in larger batches, repair rate should be reported alongside verdict outcomes, not buried as implementation detail.

## Interpretation

My current read is:

- **Methodological viability:** strong
- **Substantive signal quality:** strong enough to use
- **Operational cleanliness:** still weak without repair

That makes Gemini `2.5-pro` usable as a third-family replay judge, but only in a repair-aware evaluation setup. I would trust it for comparative analysis. I would not yet treat raw first-pass outputs as a stable production judge interface.

## Recommended next steps

1. Compare this full Gemini pass directly against Claude and GPT on the same 13 scenarios.
   Focus on winner deltas, tie behavior, decisive dimensions, and human-review flags.

2. Quantify whether `decision_usefulness` is overweighted.
   If Gemini is collapsing too much onto that dimension, we may need prompt adjustments or calibration guidance.

3. Measure repeatability on a small frozen subset.
   Rejudge 3-5 scenarios multiple times with Gemini `2.5-pro` to see whether winners, margins, and decisive dimensions are stable within-model.

4. Keep repair telemetry in all downstream summaries.
   Do not summarize Gemini outcomes without also reporting repair dependence.

5. Consider a stricter repair audit.
   Since repair is universal in this sample, it would be useful to diff first-pass and repaired outputs on a few cases to ensure the repair step is filling structure, not subtly changing substance.
