# Pricing Strategy Recommendation Under Partial Market Data

## Decision Frame

**Core question:** Should we proceed with a pricing change given that our market data is incomplete?

**Decision type:** Reversible pricing adjustment with monitoring gates, not a permanent structural commitment.

**Stakes:** Pricing changes directly impact revenue, customer acquisition/retention, and competitive positioning. Acting on partial data risks mispricing in either direction — leaving money on the table or triggering churn. However, *not* acting also carries cost: if current pricing is misaligned, every week of delay compounds the revenue gap.

**Framing constraint:** We lack complete market data. This means our recommendation must be structured as a phased approach with explicit go/no-go checkpoints rather than a single decisive move. The strategy must make the uncertainty *visible* in the decision, not hide it behind false precision.

**Who decides:** This recommendation is addressed to the pricing owner (typically Product + Finance), with input required from Sales (deal velocity signals) and Customer Success (churn/upgrade signals).

## Unknowns & Evidence Gaps

| Gap ID | Unknown | Impact on Decision | Mitigation Available |
|--------|---------|-------------------|---------------------|
| G-1 | Competitor pricing for comparable tier | Cannot benchmark willingness-to-pay ceiling | Proxy: use publicly available pricing pages for 2-3 nearest competitors; accept ±15% error band |
| G-2 | Price elasticity of current customer base | Cannot predict churn rate from increase or uptake from decrease | Proxy: analyze historical plan-change behavior around past pricing events; run Van Westendorp or Gabor-Granger on 50-customer sample |
| G-3 | Segment-level willingness-to-pay | Cannot differentiate pricing by segment | Proxy: use existing usage data as WTP signal (heavy users tolerate more); defer segmented pricing until data exists |
| G-4 | Cost-to-serve per tier | Cannot validate margin safety of any price point | Proxy: use infrastructure cost data from engineering; estimate within ±20% |
| G-5 | Market growth rate and new entrant timeline | Cannot assess whether window for pricing power is narrowing | Proxy: industry analyst reports, job posting velocity at competitors |

**Critical gap:** G-2 (price elasticity) is the highest-impact unknown. Without it, any specific price point is a guess. The entire strategy below is designed to *generate* this data rather than assume it.

## Pass/Fail Readiness

**Readiness verdict: CONDITIONAL PASS — proceed only with staged rollout and kill criteria.**

We have enough information to act, but not enough to act *decisively*. The conditions for proceeding:

### Pass conditions (all must hold)
1. **Staged rollout only.** No big-bang repricing. New pricing applies to new customers first (cohort A), then expanding to renewals (cohort B) after 30-day observation window.
2. **Kill criteria defined in advance.** If cohort A shows >10% increase in sales cycle length or >5% decrease in conversion rate within 30 days, pause and reassess. These thresholds must be agreed *before* launch, not debated after data arrives.
3. **Grandfather clause for existing customers.** Current customers retain current pricing for at least one renewal cycle. This limits blast radius and separates acquisition-price signal from retention-price signal.
4. **Data collection is mandatory, not optional.** The staged rollout must instrument: conversion rate by price point, time-to-close, upgrade/downgrade rate, and stated reason for churn (exit survey). If instrumentation is not ready, the pricing change is not ready.

### Fail conditions (any one blocks launch)
- No agreement on kill criteria before launch
- Instrumentation for conversion and churn tracking not deployed
- Cost-to-serve data unavailable even at ±20% accuracy (margin safety unknown)
- Pricing change is framed internally as "permanent" rather than "testable"

### Confidence calibration
- **Confidence in direction** (whether to raise, lower, or restructure): LOW — partial data means we are pattern-matching, not modeling
- **Confidence in mechanism** (staged rollout with gates): HIGH — this is a well-established pricing experimentation pattern
- **Confidence in reversibility**: HIGH — grandfathering + cohort isolation means we can revert without customer trust damage

## Recommended Next Artifact

**Immediate next step:** Pricing Experiment Design Document

This document should specify:
1. **Exact cohort definitions** — who sees new pricing first, sample size requirements for statistical significance
2. **Price points to test** — informed by whatever competitive proxy data we can gather (G-1 mitigation), structured as A/B or multivariate test
3. **Success/failure metrics with thresholds** — not just "we'll watch conversion" but "conversion must remain above X% at the 95% confidence level"
4. **Timeline and decision points** — 30-day cohort A observation, 14-day analysis, go/no-go for cohort B
5. **Escalation path** — what happens if results are ambiguous (neither clearly pass nor fail)

**Secondary artifact:** Customer WTP Research Brief — a lightweight (50-customer) willingness-to-pay study using Van Westendorp or Gabor-Granger methodology to close gap G-2 before or in parallel with the staged rollout.

**What this strategy explicitly does NOT do:**
- Recommend a specific price point (insufficient data to do so responsibly)
- Assume current pricing is correct (status quo bias is not evidence)
- Promise revenue impact projections (any number would be fabricated precision)
- Treat pricing as a one-time event (it is an ongoing capability to build)
