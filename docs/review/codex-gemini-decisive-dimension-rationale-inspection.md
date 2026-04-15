# Codex Note: Gemini Decisive-Dimension Rationale Inspection

Status: Complete
Date: 2026-04-14
Author: Codex

## Question

When Gemini picks `decision_usefulness` as the `decisive_dimension` on contradiction and boundary cases, is that because its underlying reasoning is shallow, or because the final decisive-label selection is biased?

## Cases inspected

- `prd-hidden-scope-creep`
- `handoff-contradiction`
- `event-automation-boundary`

All three were inspected from the saved Gemini replay verdicts under `rejudges/gemini-tier3-pro/verdict.json`.

## Short answer

The bias appears to be mostly at the **decisive-dimension selection layer**, not a total failure of underlying rubric reasoning.

Gemini often does notice the right evidentiary and consistency issues in `dimension_rationales`, but still names `decision_usefulness` as decisive at the end.

## Case readouts

### `prd-hidden-scope-creep`

Gemini clearly identifies the right issues:

- `evidence_discipline`: Side B correctly prioritized resolving evidence gaps before committing resources.
- `internal_consistency`: Side A had a major internal contradiction.
- `responsiveness_to_critique`: Side B exposed a fundamental contradiction in Side A.

Despite that, Gemini still names `decision_usefulness` as decisive, framing Side B's discovery-first recommendation as more useful for a real-world decision.

Interpretation:

- Gemini is not missing the contradiction or scope-discipline issue.
- It is seeing those issues and then translating them into a final usefulness judgment.

This is strong evidence for a **selection-layer bias** rather than a deep reasoning failure.

### `handoff-contradiction`

Gemini again shows the right underlying reasoning:

- `evidence_discipline`: Side A is stronger because it stays grounded in prompt ambiguity.
- `internal_consistency`: both sides are strong in the final artifact.
- `decision_usefulness`: Side B is more concrete and immediately actionable.

Final outcome:

- winner: `tie`
- decisive dimension: `decision_usefulness`

Interpretation:

- Gemini is explicitly tracking evidence discipline.
- The tie outcome suggests it understands the tradeoff.
- But the final decisive label still collapses toward usefulness.

This again points to a **selection-layer skew** more than a failure to reason about the other dimensions.

### `event-automation-boundary`

This case is less suspicious.

Gemini scores:

- `evidence_discipline`: effectively even
- `internal_consistency`: effectively even
- `decision_usefulness`: Side A is more concrete and implementation-ready

Interpretation:

- Here, `decision_usefulness` is a more plausible decisive label.
- The case does not provide the same strong evidence of mislabeling as the other two.

## Conclusion

Current best read:

- `prd-hidden-scope-creep`: likely selection-layer bias
- `handoff-contradiction`: likely selection-layer bias
- `event-automation-boundary`: plausibly legitimate usefulness dominance

So the contradiction/boundary bucket is not uniformly a deep reasoning failure. The more likely issue is:

Gemini often reasons about evidence discipline and internal consistency correctly, but over-selects `decision_usefulness` as the final decisive label.

## Why this matters

This is a narrower problem than "Gemini cannot detect evidence discipline or internal consistency."

If the issue is primarily at the decisive-label step, then potential interventions are more targeted:

- clarify how `decisive_dimension` should be chosen
- require tighter alignment between `decisive_dimension` and `dimension_rationales`
- audit whether the winning margin is actually explained by the named decisive dimension

Those are cleaner fixes than trying to overhaul the whole prompt or rubric.

## Recommended next step

Run the same rationale inspection on a few more cases where Gemini chose `decision_usefulness` but another dimension looked viable, then compare against Claude/GPT richer-schema runs where available.
