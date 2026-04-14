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

| Unknown | Severity | Mitigable Before Decision? | Mitigation Path |
|---|---|---|---|
| Segment-level willingness-to-pay | **Critical** | Partially — 2-4 week survey or interview sprint | Van Westendorp or Gabor-Granger with N≥100 per segment |
| Competitive pricing landscape | **High** | Partially — desk research + sales intel | Structured competitive audit with mystery shopping |
| Price elasticity of demand | **Critical** | No — requires observed behavior at multiple price points | A/B test or cohort-based rollout |
| Customer perception of value metric alignment | **Medium** | Yes — qualitative interviews in 1-2 weeks | 15-20 customer interviews focused on value delivery |
| Impact on channel/partner economics | **Medium** | Yes — internal analysis | Model partner margin impact under proposed scenarios |
| Churn sensitivity to price changes by segment | **High** | Partially — historical cohort analysis | Analyze prior price change cohorts if available |

**Key finding:** Two critical unknowns (WTP and elasticity) cannot be fully resolved without primary research or controlled experimentation. Any recommendation that ignores these gaps is overfit to assumptions.

## Pass/Fail Readiness

**Verdict: CONDITIONAL FAIL — not ready for a full-market pricing change.**

Rationale:
- Without segment-level WTP data, any new price point is a guess decorated with confidence. We cannot distinguish between "we think customers will pay X" and "customers will pay X."
- Without elasticity data, we cannot model revenue impact with any rigor. Margin projections under a new price are fiction.
- Internal usage data can inform *packaging* (which features anchor value) but not *price level* (what dollar amount captures that value).

**However, we ARE ready for:**
1. **A bounded pricing experiment** on a single segment or new-customer cohort, designed to generate the missing elasticity signal.
2. **A value metric audit** using existing usage data to validate whether our current pricing axis (per-seat, per-usage, flat) aligns with how customers derive value.
3. **Rapid WTP research** (2-4 weeks) to close the most critical evidence gap before committing to a price point.

## Recommended Strategy: Staged Learning Approach

### Phase 1 — Evidence Sprint (Weeks 1-3)
- Run Van Westendorp pricing survey across top 2-3 segments (N≥100 each).
- Conduct 15-20 qualitative interviews on value perception and price sensitivity.
- Complete competitive pricing desk research with structured battlecard output.
- Analyze historical churn cohorts around any prior pricing changes.

### Phase 2 — Bounded Experiment (Weeks 4-8)
- Design A/B pricing test on new customers only (protects existing revenue base).
- Test 2-3 price points informed by Phase 1 WTP ranges.
- Define success metrics: conversion rate, revenue per customer, 30-day retention.
- Set kill criteria: if conversion drops >15% vs. control, halt and reassess.

### Phase 3 — Decision Point (Week 9)
- Combine survey data, interview insights, competitive context, and experimental results.
- Model revenue scenarios with observed (not assumed) elasticity.
- Make go/no-go decision on full-market rollout with defensible evidence.

### Guardrails
- **No full-market price change without Phase 1 data.** Internal conviction is not evidence.
- **Grandfather existing customers** for minimum 1 billing cycle on any increase.
- **Monitor leading indicators** (support tickets, cancellation page visits, NPS) weekly during any experiment.
- **Define rollback trigger** before launch: specific metric thresholds that automatically pause the change.

## Recommended Next Artifact

**Pricing Research Brief** — a scoped research plan specifying:
1. Survey instrument design (Van Westendorp or Gabor-Granger, segment definitions, sample targets)
2. Interview guide for qualitative WTP conversations
3. Competitive audit template and data sources
4. A/B experiment design with power analysis, segment selection, and success/kill criteria

This artifact converts the strategy into executable research that closes the evidence gaps identified above. Without it, any pricing decision remains speculative.
