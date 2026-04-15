# Pricing Strategy Recommendation

## Recommendation
Adopt a staged pricing change rather than a full immediate repricing. Move to a limited-scope test with modest price uplift, preserve a fallback path for existing customers, and instrument conversion, expansion, and churn before broader rollout. Under partial market data, the objective is not to find the theoretically optimal price now; it is to make the next pricing move safely, learn quickly, and avoid irreversible demand damage.

## Decision Frame
- Decision: pursue a measured pricing increase through a controlled experiment, not a portfolio-wide reset.
- Why now: current information is sufficient to justify learning-oriented action, but insufficient to support a one-way strategic pricing commit.
- Guardrails: protect renewal risk, isolate effects by segment, and require predefined rollback thresholds.
- Operating principle: optimize for decision quality under uncertainty, not for apparent confidence.

## Approach
1. Apply the pricing change first to the lowest-risk segment: new customers or a clearly bounded cohort.
2. Keep packaging stable unless there is direct evidence that packaging, not price level, is the primary problem.
3. Test one core variable at a time: headline price, discount policy, or feature gate.
4. Define success on a contribution basis, not just top-line ARPU: conversion quality, gross retention, and payback all matter.
5. Preserve comparability by running the test long enough to observe early retention and sales-cycle effects.

## Rationale
- Partial market data supports directional movement, not precision pricing.
- A staged test creates real willingness-to-pay evidence faster than waiting for perfect external benchmarks.
- Pricing errors are asymmetric: overpricing can damage pipeline and retention faster than underpricing modestly suppresses upside.
- The highest-value near-term output is a cleaner pricing signal by segment.

## Execution Guidance
- Start with a moderate uplift range rather than an aggressive step-change.
- Exempt current contracted customers unless retention risk is already understood.
- Track funnel progression, win rate, discounting behavior, sales objections, activation quality, and early churn signals.
- Predefine stop conditions: significant win-rate degradation, rising discount dependence, or retention deterioration.
- At test close, decide among four paths: expand, refine, revert, or redesign packaging.

## Unknowns & Evidence Gaps
- True competitive price positioning is unclear because market data is incomplete.
- Segment-level willingness to pay is not yet validated.
- It is unknown whether current monetization issues are driven more by price point, packaging, or sales execution.
- Retention sensitivity to a pricing change is uncertain, especially for existing accounts.
- Discounting behavior may obscure whether nominal price changes are real pricing changes in practice.

## Pass/Fail Readiness
- Pass if the team can isolate a cohort, measure conversion and retention outcomes, and commit to explicit rollback thresholds.
- Pass if finance, sales, and product agree on the success metrics and experiment window.
- Fail if the change must be rolled out universally with no protected segment or rollback path.
- Fail if instrumentation cannot separate price effects from packaging or sales-process changes.

## Recommended Next Artifact
Create a pricing experiment brief that specifies target segment, hypothesis, tested price points, success metrics, guardrails, experiment duration, and decision rules for rollout or reversal.
