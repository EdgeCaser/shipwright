# Pricing Strategy Recommendation Under Partial Market Data

## Decision Frame

**Core question:** Should we proceed with a pricing change given incomplete market data, and if so, under what constraints?

**Stakes:** Pricing changes are high-leverage and partially irreversible — a price increase risks churn if misaligned with willingness-to-pay (WTP), while a decrease sacrifices margin that is difficult to reclaim. The cost of a wrong move exceeds the cost of a delayed move.

**Decision type:** This is a *staged commitment* decision, not a binary go/no-go. The partial data environment means we should design for learning, not for optimization.

**Boundary conditions:**
- We lack reliable competitive pricing intelligence (no systematic win/loss data by price point).
- We lack segment-level WTP data (no conjoint, Van Westendorp, or Gabor-Granger results).
- We have internal data only: current revenue, margins, churn rates, and usage patterns.
- We do not know price elasticity for our product in current market conditions.

## Unknowns & Evidence Gaps

| Unknown | Severity | What Internal Data Can Tell Us | What It Cannot Tell Us | Mitigable Before Decision? | Mitigation Path |
|---|---|---|---|---|---|
| Segment-level willingness-to-pay | **Critical** | Usage intensity and feature adoption patterns suggest relative value perception across segments | Absolute dollar thresholds customers would accept or reject | Partially — 2-4 week survey sprint | Van Westendorp or Gabor-Granger with N≥100 per segment |
| Competitive pricing landscape | **High** | Win/loss anecdotes from sales may indicate directional pressure | Systematic competitor price points, packaging, and discount structures | Partially — desk research + sales intel | Structured competitive audit with mystery shopping |
| Price elasticity of demand | **Critical** | If prior pricing changes exist, cohort analysis of churn/expansion around those events can yield directional elasticity estimates | Elasticity at untested price points or under current market conditions | Depends on historical data availability | A/B test or cohort-based rollout; historical cohort analysis as interim proxy |
| Customer perception of value metric alignment | **Medium** | Usage-to-revenue correlation analysis can reveal misalignment between pricing axis and value delivery | Whether customers consciously associate value with the metric we price on | Yes — qualitative interviews in 1-2 weeks | 15-20 customer interviews focused on value delivery |
| Impact on channel/partner economics | **Medium** | Full internal modeling possible | Partner reaction to margin compression | Yes — internal analysis + partner conversations | Model partner margin impact under proposed scenarios |
| Churn sensitivity to price changes by segment | **High** | Historical cohort analysis around prior changes (if any) can provide directional signal | Sensitivity to novel price points outside historical range | Partially — historical cohort analysis | Analyze prior price change cohorts if available |

**Key finding:** The internal data available — revenue, margins, churn rates, usage patterns, and potentially prior pricing cohorts — can provide *directional* elasticity estimates and relative value signals across segments. However, these sources cannot establish absolute WTP thresholds or predict behavior at untested price points with the confidence required for a large full-market adjustment. The question is not whether internal data is worthless (it is not), but whether it is sufficient for the magnitude of change under consideration.

## Pass/Fail Readiness

**Verdict: CONDITIONAL — readiness depends on scope of proposed change and strength of internal signal.**

The first-pass verdict of "conditional fail" overstated the case by treating missing WTP and elasticity data as automatic blockers without first testing what the existing internal record could yield. A more disciplined assessment:

**Ready now (with internal data only):**
- **Small, directional adjustments** (≤5-10% increase) where internal churn data and usage patterns suggest headroom — particularly if historical cohort analysis around prior changes shows low churn sensitivity. The risk of a modest adjustment is bounded, and internal data can provide enough directional confidence.
- **Packaging or value metric realignment** — internal usage data is directly informative here and may capture more revenue without changing headline price.
- **Segment-specific pricing introduction** where usage data clearly reveals divergent value profiles across customer groups.

**Not ready without primary research:**
- **Large price increases** (>15-20%) that move significantly beyond any historically tested range — internal data cannot extrapolate to untested territory.
- **New pricing model introduction** (e.g., switching from per-seat to usage-based) — this changes the customer's mental model of cost and requires WTP validation.
- **Across-the-board changes** applied uniformly without segment differentiation — internal data shows segments behave differently, so a uniform change ignores available signal.

**Critical prerequisite:** Before committing to either path, conduct a rapid internal data audit (1 week) to determine: (a) whether prior pricing changes exist that enable cohort-based elasticity estimation, (b) whether churn/expansion patterns show clear segment-level sensitivity differences, and (c) whether usage-to-revenue correlation reveals packaging misalignment. This audit converts "we might have useful data" into a concrete evidence base for the readiness decision.

## Recommended Strategy: Tiered Response Based on Change Magnitude

### Path A — Small Adjustment (Internal Data Sufficient)
If the proposed change is modest and directional:
1. Complete internal data audit (Week 1).
2. Model revenue impact using historical elasticity proxies.
3. Implement with grandfathering and monitoring guardrails.
4. Treat as a learning opportunity: instrument carefully to build elasticity data for future decisions.

### Path B — Large Change or Model Shift (Primary Research Required)

#### Phase 1 — Evidence Sprint (Weeks 1-3)
- Run Van Westendorp pricing survey across top 2-3 segments (N≥100 each).
- Conduct 15-20 qualitative interviews on value perception and price sensitivity.
- Complete competitive pricing desk research with structured battlecard output.
- Analyze historical churn cohorts around any prior pricing changes.

#### Phase 2 — Bounded Experiment (Weeks 4-8)
- Design A/B pricing test on new customers only (protects existing revenue base).
- Test 2-3 price points informed by Phase 1 WTP ranges.
- Define success metrics: conversion rate, revenue per customer, 30-day retention.
- Set kill criteria: if conversion drops >15% vs. control, halt and reassess.

#### Phase 3 — Decision Point (Week 9)
- Combine survey data, interview insights, competitive context, and experimental results.
- Model revenue scenarios with observed (not assumed) elasticity.
- Make go/no-go decision on full-market rollout with defensible evidence.

### Guardrails (Both Paths)
- **Grandfather existing customers** for minimum 1 billing cycle on any increase.
- **Monitor leading indicators** (support tickets, cancellation page visits, NPS) weekly.
- **Define rollback trigger before launch:** specific metric thresholds that automatically pause the change.
- **Instrument everything:** even small changes should generate data that informs future pricing decisions.

## Recommended Next Artifact

**Internal Data Audit Brief** — a 1-week scoped analysis to determine which path is appropriate:
1. Historical pricing change inventory and cohort analysis plan
2. Usage-to-revenue correlation analysis by segment
3. Churn sensitivity segmentation using available behavioral data
4. Gap assessment: what confidence level does internal data support, and for what magnitude of change?

This audit is the decision gate. Its output determines whether we proceed with Path A (small adjustment using internal data) or Path B (primary research sprint for larger changes). Without this audit, we are choosing a path based on intuition about our own data rather than examining it.
