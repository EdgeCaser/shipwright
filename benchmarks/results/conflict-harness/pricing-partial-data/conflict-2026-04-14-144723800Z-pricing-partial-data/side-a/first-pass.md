# Pricing Strategy Recommendation Under Partial Market Data

## Recommendation
Adopt a staged pricing change rather than a full pricing reset: keep the current list price architecture intact, introduce one tightly scoped price increase or packaging upgrade on the highest-value segment first, and gate broader rollout on fast evidence collection. Under partial market data, the objective is not to find the globally optimal price now; it is to make a reversible move that improves monetization while limiting downside.

## Rationale
The case provides no direct market evidence, competitor benchmarks, willingness-to-pay data, segment elasticity, or churn sensitivity inputs. That rules out a high-confidence recommendation for a broad portfolio repricing. A narrower move is more defensible because it preserves optionality, limits revenue-at-risk, and creates the data needed for a stronger second decision.

Recommended operating approach:
1. Target the segment with the clearest delivered value and lowest expected price sensitivity.
2. Prefer packaging changes over blunt base-price increases when value communication is weak.
3. Protect existing customers where possible through grandfathering, renewal caps, or delayed enforcement.
4. Set explicit guardrails before launch: conversion, win rate, expansion, churn, and sales-cycle impact.
5. Treat the first change as an instrumented test with a fixed review window.

## Decision Frame
Recommend a partial, reversible pricing move now only if the business needs near-term monetization improvement and can instrument outcomes within one review cycle. Do not attempt a company-wide repricing based on the current packet because the evidence base is materially incomplete. The decision is therefore between:

- `Preferred`: limited rollout to a defined segment or package tier with clear success/fail thresholds.
- `Not Recommended`: full repricing across all segments and plans without supporting elasticity or competitive evidence.

The governing logic is simple: when market data is partial, optimize for downside control and learning velocity, not theoretical price maximization.

## Unknowns & Evidence Gaps
Critical missing inputs:

- Segment-level willingness to pay.
- Current win/loss reasons tied to price.
- Competitor pricing and packaging comparables.
- Gross retention and expansion sensitivity to price changes.
- Sales discounting behavior and realized price variance.
- Whether the pricing problem is price level, package design, or value communication.

Because these gaps are unresolved, any recommendation for a broad change would be under-evidenced.

## Pass/Fail Readiness
`Pass` if all of the following are true:

- The proposed change is limited to a defined segment, tier, or package.
- Success metrics and rollback thresholds are pre-specified.
- Customer communication and commercial exception handling are prepared.
- The business can observe impact on conversion, churn, and expansion quickly enough to intervene.

`Fail` if any of the following are true:

- The plan assumes uniform elasticity across segments.
- The rollout is broad and hard to reverse.
- No baseline metrics exist for comparison.
- Leadership expects high-confidence optimization rather than a measured learning step.

Current readiness: `Fail for broad repricing`, `Pass with conditions for a constrained test or phased rollout`.

## Recommended Next Artifact
Create a pricing experiment brief that includes:

- target segment and hypothesis
- current vs proposed package/price
- guardrail metrics and decision thresholds
- sales and customer-success exception rules
- evidence plan for competitor checks and customer willingness-to-pay follow-up

That artifact should be the decision vehicle for the next round because it converts partial market data into a controlled operating plan.
