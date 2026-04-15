# Codex Memo: Cross-Model Judge Comparison

Status: Complete
Date: 2026-04-14
Author: Codex

## Scope

This memo compares the latest available scenario-level judge outcomes across:

- Claude (`anthropic` / `claude-max`)
- GPT (`openai` / `chatgpt-pro`)
- Gemini (`google` / `gemini-2.5-pro`)

## Method note

This is a **scenario-level** comparison, not a perfectly artifact-matched replay for all three families.

- Gemini results come from replay judging over frozen artifacts saved under `rejudges/gemini-tier{1,2,3}-pro/`.
- Claude and GPT results come from the latest completed `run.json` available for each scenario/provider.
- In some scenarios, Gemini judged the same frozen run that GPT originally judged; in others, the latest Claude and latest GPT runs are sibling scenario runs rather than the exact same artifact pair.

So the comparison below is strong enough to detect family-level patterns, but it should not be oversold as a fully controlled like-for-like replay comparison for all three judges on every row.

## Bottom line

The three judge families are materially different.

- Latest Claude judgments lean strongly toward `side_b`.
- Latest GPT judgments lean strongly toward `side_a`.
- Gemini sits between them, returns ties more readily, and flags human review more often.

That overall pattern reinforces the earlier concern that no single family should be treated as a neutral arbiter by default.

## Family-level patterns

### Claude (latest per scenario)

- Total scenarios: `13`
- Winners:
  - `side_b`: `9`
  - `side_a`: `2`
  - `tie`: `2`
- Confidence:
  - `medium`: `9`
  - `high`: `3`
  - `low`: `1`
- `needs_human_review: true`: `1`

### GPT (latest per scenario)

- Total scenarios: `13`
- Winners:
  - `side_a`: `8`
  - `side_b`: `5`
- Confidence:
  - `medium`: `9`
  - `low`: `3`
  - `high`: `1`
- `needs_human_review: true`: `5`

### Gemini 2.5 Pro (full replay pass)

- Total scenarios: `13`
- Winners:
  - `side_a`: `6`
  - `side_b`: `4`
  - `tie`: `3`
- Confidence:
  - `high`: `5`
  - `medium`: `3`
  - `low`: `5`
- `needs_human_review: true`: `6`
- Repair telemetry:
  - `repair_attempted: true` on `13/13`
- Decisive dimension:
  - `decision_usefulness`: `10`
  - `responsiveness_to_critique`: `2`
  - `claim_quality`: `1`

## Agreement structure

Across 13 scenarios:

- Unanimous across all three families: `3`
- Two-versus-one split: `7`
- All three different: `3`

Gemini is the dissenting judge in `6/13` scenarios, and Gemini alone produces a `tie` where both Claude and GPT pick a side in `3` scenarios.

That is not a trivial amount of disagreement. It suggests Gemini is not merely echoing one existing family and is instead acting as a genuinely distinct evaluator.

## Scenario table

| Scenario | Claude | GPT | Gemini |
|---|---|---|---|
| blockbuster-total-access | side_b | side_b | side_a |
| board-update-ambiguity | side_b | side_a | side_a |
| churn-conflicting-signals | side_b | side_b | side_b |
| event-automation-boundary | tie | side_b | side_a |
| feature-weak-evidence | side_a | side_a | side_b |
| handoff-contradiction | side_b | side_a | tie |
| meta-muse-spark | tie | side_a | side_a |
| netflix-qwikster | side_b | side_b | side_b |
| prd-hidden-scope-creep | side_b | side_a | side_b |
| pricing-partial-data | side_b | side_b | tie |
| supermicro-export-controls | side_a | side_a | side_a |
| yahoo-microsoft | side_b | side_a | tie |
| zillow-offers | side_b | side_a | side_a |

## What stands out

### 1. Claude and GPT still show opposite directional lean

At the scenario level, the latest Claude outcomes are heavily `side_b` (`9/13`), while the latest GPT outcomes lean `side_a` (`8/13`).

That asymmetry is the clearest high-level signal in the comparison. Even allowing for scenario reruns and imperfect artifact matching, the directional split is large enough that it is hard to dismiss as noise.

### 2. Gemini behaves like a balancing or abstaining third judge

Gemini does not simply copy Claude or GPT:

- it sides with Claude in some contested scenarios (`prd-hidden-scope-creep`)
- it sides with GPT in others (`board-update-ambiguity`, `zillow-offers`)
- it abstains with ties in places where the other two diverge (`handoff-contradiction`, `yahoo-microsoft`)
- it occasionally breaks from both (`blockbuster-total-access`, `feature-weak-evidence`)

That makes Gemini useful as a triangulation judge, especially in disagreement-heavy cases.

### 3. Gemini is meaningfully more willing to surface uncertainty

Compared with Claude and GPT, Gemini uses:

- more `tie` outcomes
- more `low` confidence
- more `needs_human_review: true`

That could mean Gemini is better calibrated to ambiguity, or simply more conservative. Either way, it is behaviorally distinct and likely valuable in cases where we want abstention instead of forced resolution.

### 4. Gemini's substantive lens is concentrated

On the replay pass, Gemini chose `decision_usefulness` as the decisive dimension in `10/13` cases.

That is helpful because it gives us a concrete lens to audit, but it also introduces a concern: Gemini may be overweighting executive usefulness relative to other rubric dimensions. If so, its value as a third judge comes with a recognizable bias profile of its own.

### 5. Repair dependence remains the main caveat on Gemini

The methodological upside of Gemini is real, but so is the operational downside:

- all `13/13` Gemini replay outputs required one repair pass

That does not erase the comparative signal, but it means any downstream analysis should keep repair telemetry visible instead of treating Gemini verdicts as natively schema-clean.

## Interpretation

My current read is:

- Claude and GPT remain too directionally different to trust either as a standalone default judge.
- Gemini is useful because it is neither redundant nor naively decisive.
- The strongest current use for Gemini is as a replay-based third-family judge in disagreement cases and confidence calibration, not as a drop-in replacement for the existing judge stack.

## Recommended next steps

1. Run an artifact-matched three-family comparison subset.
   Pick 3-5 scenarios and ensure Claude, GPT, and Gemini all judge the exact same frozen artifact bundle.

2. Compare dimension-level reasoning, not just winners.
   Gemini already exposes `decisive_dimension`; older Claude/GPT outputs should be upgraded or replayed into the richer schema if we want a cleaner apples-to-apples reasoning comparison.

3. Measure within-family variance explicitly.
   The latest-per-scenario view already hints at instability inside Claude and GPT across reruns. That should be quantified rather than inferred.

4. Keep Gemini in the loop for disagreement adjudication.
   The current evidence supports using Gemini as a third-family triangulation judge, especially where Claude and GPT split or where a forced winner looks unjustified.
