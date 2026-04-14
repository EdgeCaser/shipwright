# Pricing Strategy Recommendation Under Partial Market Data

## Decision Frame

**Context:** We are evaluating a pricing change with incomplete market data. The core decision is whether to proceed with a pricing adjustment now, delay until more data is gathered, or implement a staged rollout that generates data while limiting downside.

**Decision type:** Reversible with moderate friction. Pricing changes can be rolled back, but frequent changes erode customer trust and create operational overhead (billing system updates, sales enablement, contract amendments).

**Stakeholders affected:** Revenue/finance (forecast accuracy), sales (deal velocity and objection handling), customer success (renewal conversations), product (packaging implications).

**Key question:** Given that our market data is partial, is the expected value of acting now greater than the expected value of waiting for better data — accounting for the cost of delay?

## Unknowns & Evidence Gaps

### What we lack

1. **Willingness-to-pay (WTP) distribution:** No conjoint analysis or Van Westendorp study has been conducted on the current customer base or target segments. Without WTP data, any price point is a guess anchored to cost-plus or competitor benchmarks rather than value capture.

2. **Competitive pricing intelligence:** Partial data implies we have some competitor price points but not a complete landscape. We do not know competitors' discount structures, volume tiers, or bundling strategies — the effective price may differ significantly from list price.

3. **Price elasticity of demand:** We lack historical data on how prior price changes affected conversion, churn, and expansion revenue. Without elasticity estimates, we cannot model revenue impact with confidence.

4. **Segment-level sensitivity:** Even if aggregate data exists, we likely lack segment-level granularity. Enterprise buyers, mid-market, and SMB segments may respond very differently to the same price change.

5. **Cost structure trajectory:** If input costs are changing (infrastructure, labor, licensing), the margin implications of any price point depend on cost forecasts we may not have validated.

### What partial data we can work with

- Existing revenue per customer and distribution across tiers
- Anecdotal sales feedback on price objections and lost deals
- Publicly available competitor list prices (without discount/effective price data)
- Current gross margin by product line or tier
- Churn data (even if not causally linked to pricing)

### Risk of acting on partial data

- **Underpricing:** Leave revenue on the table, signal low value, attract price-sensitive customers who churn at any increase.
- **Overpricing:** Increase churn, slow acquisition, push prospects to competitors or substitutes.
- **Misaligned packaging:** Price change without packaging change may create value-metric mismatch, where customers pay more without perceiving more value.

## Pass/Fail Readiness

**Verdict: CONDITIONAL PASS — proceed only with a staged, data-generating approach.**

A full pricing overhaul fails readiness. The evidence gaps (no WTP study, no elasticity data, incomplete competitive landscape) mean that a confident, organization-wide price change would be speculative.

However, a narrow, instrumented pricing test passes readiness:

| Criterion | Status | Notes |
|---|---|---|
| Value metric identified | Partial | Need to validate that current metric aligns with perceived value |
| WTP data | Fail | No structured research conducted |
| Competitive landscape | Partial | List prices available; effective prices unknown |
| Elasticity model | Fail | No historical price-change data to calibrate |
| Segment definitions | Pass | Existing segmentation usable for test design |
| Billing system flexibility | Must verify | Can the system support A/B pricing or cohort-based tiers? |
| Rollback capability | Must verify | Can we revert pricing for a cohort without manual intervention? |

**Go/no-go gates for staged test:**

1. Billing system confirms ability to run parallel price points for new customers in a defined segment.
2. Finance agrees on a minimum test duration (recommend 60-90 days) and sample size for statistical significance.
3. Sales leadership aligns on how to handle objections during the test period.

If any gate fails, the recommendation shifts to "delay and invest in WTP research first."

## Recommended Next Artifact

**Immediate next step:** Commission a lightweight WTP study (Van Westendorp or Gabor-Granger) targeting 50-100 customers across key segments. This can be executed in 2-4 weeks and directly addresses the most critical evidence gap.

**Parallel workstream:** Design a pricing experiment for new customers in one segment. Define:
- Test and control price points (informed by whatever competitive data exists)
- Success metrics: conversion rate, average deal size, 30-day activation rate
- Guardrails: automatic pause if conversion drops below X% of baseline
- Duration and sample size requirements

**Artifact sequence:**
1. **WTP Research Brief** — scope, methodology, timeline, sample plan
2. **Pricing Experiment Design** — test parameters, metrics, guardrails, rollback plan
3. **Pricing Recommendation v2** — informed by WTP findings and experiment results, with confidence intervals on revenue impact

Do not skip to step 3. The cost of the research (2-4 weeks, modest budget) is far less than the cost of a mispriced product in market.
