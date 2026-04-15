# Pricing Strategy Recommendation Under Partial Market Data

## Decision Frame

**Core question:** Should we proceed with a pricing change given incomplete market data, and if so, under what conditions?

**Decision type:** Reversible pricing adjustment with staged rollout — not a one-way door.

**Stakeholders:** Product, Finance, Sales, Customer Success.

**Current state:** We lack sufficient market data to make a high-confidence pricing decision. Specifically, we are missing competitive pricing benchmarks, customer willingness-to-pay (WTP) research, and segment-level price elasticity estimates. What we have is internal cost structure, current revenue per customer cohort, and anecdotal churn feedback.

**Decision criteria:** We should proceed only if (1) the expected value of acting now exceeds the expected value of waiting for better data, and (2) we can structure the change to be reversible or scoped narrowly enough that downside is bounded.

## Unknowns & Evidence Gaps

| Gap | Severity | Mitigation Available? |
|-----|----------|----------------------|
| Competitive pricing landscape | High | Partial — can infer from public pages and win/loss anecdotes, but no systematic collection |
| Customer willingness-to-pay | High | No — requires Van Westendorp or conjoint study not yet conducted |
| Price elasticity by segment | High | No — requires historical A/B or cohort analysis we haven't run |
| Churn attribution to price vs. product | Medium | Partial — exit surveys exist but sample is small and self-selected |
| Cost-to-serve by tier | Low | Available — internal finance data is reliable |
| Current contract renewal rates | Low | Available — CRM data is clean |

**Key risk:** Without WTP data, any price increase is a bet on retention inertia. If we are wrong about customers' price ceiling, we discover it through churn — a lagging indicator that arrives too late to prevent damage.

**What partial data tells us:** Internal cost-to-serve data confirms current pricing leaves thin margins on the lowest tier. Anecdotal churn feedback suggests price is a factor but rarely the primary driver. These signals are necessary but not sufficient for a confident across-the-board change.

### Expected-Value Tradeoff: Act Now vs. Wait

The first-pass version of this artifact asserted asymmetric downside without quantifying either side of the tradeoff. The critique is valid — the case for waiting must be grounded in directional estimates, not just an appeal to uncertainty. Here is the corrected reasoning:

**Upside of acting now (full rollout):** If thin margins on the lowest tier represent, say, a 5-15% revenue lift opportunity from repricing, and if retention is unaffected, the gain accrues immediately across the full base. However, the *probability* of retention being unaffected is the unknown we cannot bound — we have no WTP data, no elasticity curve, and no competitive anchoring to assess whether the new price falls within or outside customers' acceptable range.

**Downside of acting now:** Churn from mispriced tiers is a compounding loss (lost LTV, not just lost monthly revenue), carries reputational cost that persists after reversion, and creates sales cycle friction that is slow to unwind. Critically, price decreases after a failed increase signal instability and erode trust more than never raising in the first place.

**Cost of waiting:** The thin-margin problem persists, and if margins are deteriorating (e.g., rising infrastructure costs), delay has a real carrying cost. This is the strongest argument against waiting and should be quantified: if the margin gap is widening at a known rate, that sets a time horizon for how long delay is tolerable.

**Net assessment:** The asymmetry is not that the downside of acting is infinitely worse — it is that the downside is *harder to reverse* than the downside of waiting. A failed price increase produces churn and reputational damage that a reversion cannot fully undo, whereas waiting produces a quantifiable margin cost that can be offset by a better-informed move. The expected value favors waiting *conditional on* the wait being used to actively generate the missing data (WTP study, pilot), not passive delay. If no research is commissioned, the calculus shifts toward acting because the information gap never closes.

## Pass/Fail Readiness

**Verdict: CONDITIONAL PASS — proceed only with scoped pilot, not full rollout.**

Rationale:
- **FAIL for full rollout.** The evidence gaps (WTP, elasticity, competitive benchmarks) leave us unable to estimate the probability that a price increase falls within customers' acceptable range. The downside of a wrong move — accelerated churn (compounding LTV loss), sales cycle friction, and brand perception damage — is harder to reverse than the carrying cost of thin margins during a structured data-gathering period. This asymmetry in *reversibility*, not just magnitude, is what tips the balance.
- **PASS for scoped pilot.** A controlled pricing experiment on new customers or a single segment can generate the missing elasticity data while bounding downside. This converts the pricing decision from a guess into a learning investment.
- **Important caveat:** If margin erosion is accelerating (e.g., cost-to-serve rising faster than revenue), the cost of waiting must be quantified and weighed against pilot timeline. Finance should provide a month-by-month margin trajectory to validate that a 60-day pilot window is affordable.

**Conditions for full-rollout readiness:**
1. Complete a WTP study (Van Westendorp or Gabor-Granger) with n ≥ 100 per target segment.
2. Run a 60-day pricing pilot on new customers measuring conversion rate delta and 30-day retention.
3. Collect ≥ 5 competitive pricing data points from direct competitors (public pricing pages, sales intel, or win/loss analysis).
4. Validate that cost-to-serve analysis holds under projected volume changes from the new pricing.
5. Quantify the carrying cost of current thin margins to confirm the pilot timeline is economically justified.

## Recommended Next Artifact

**Pricing Pilot Design Document** containing:
- Pilot segment selection criteria (recommend: new customers in mid-market segment, lowest risk of existing-customer backlash)
- Test and control pricing tiers with specific price points
- Success/failure metrics: conversion rate, 30-day retention, revenue per customer, support ticket volume
- Duration: 60 days minimum for statistical significance
- Kill criteria: if conversion drops >15% or 30-day churn exceeds 2x baseline, halt and revert
- Parallel workstream: commission WTP study to run concurrently with pilot
- **Margin trajectory analysis** from Finance to confirm the 60-day window is affordable given current margin trends
