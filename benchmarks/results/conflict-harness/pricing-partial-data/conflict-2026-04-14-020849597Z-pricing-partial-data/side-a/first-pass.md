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

## Pass/Fail Readiness

**Verdict: CONDITIONAL PASS — proceed only with scoped pilot, not full rollout.**

Rationale:
- **FAIL for full rollout.** The evidence gaps (WTP, elasticity, competitive benchmarks) are too severe to justify changing prices for the entire customer base. The downside of a wrong move — accelerated churn, sales cycle friction, brand perception damage — is asymmetric and hard to reverse at scale even if the price change itself is technically reversible.
- **PASS for scoped pilot.** A controlled pricing experiment on new customers or a single segment can generate the missing elasticity data while bounding downside. This converts the pricing decision from a guess into a learning investment.

**Conditions for full-rollout readiness:**
1. Complete a WTP study (Van Westendorp or Gabor-Granger) with n ≥ 100 per target segment.
2. Run a 60-day pricing pilot on new customers measuring conversion rate delta and 30-day retention.
3. Collect ≥ 5 competitive pricing data points from direct competitors (public pricing pages, sales intel, or win/loss analysis).
4. Validate that cost-to-serve analysis holds under projected volume changes from the new pricing.

## Recommended Next Artifact

**Pricing Pilot Design Document** containing:
- Pilot segment selection criteria (recommend: new customers in mid-market segment, lowest risk of existing-customer backlash)
- Test and control pricing tiers with specific price points
- Success/failure metrics: conversion rate, 30-day retention, revenue per customer, support ticket volume
- Duration: 60 days minimum for statistical significance
- Kill criteria: if conversion drops >15% or 30-day churn exceeds 2x baseline, halt and revert
- Parallel workstream: commission WTP study to run concurrently with pilot

This approach converts a low-confidence pricing decision into a structured experiment that generates the missing evidence while keeping blast radius small.
