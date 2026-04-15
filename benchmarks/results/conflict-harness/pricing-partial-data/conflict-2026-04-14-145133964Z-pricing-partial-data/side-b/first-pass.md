# Pricing Strategy Recommendation Under Partial Market Data

## Decision Frame

**Core question:** Should we change pricing now with incomplete market data, or defer until we can close critical evidence gaps?

**Stakes:** Pricing changes are high-inertia decisions. Raising prices risks churn if the market won't bear it; lowering prices risks margin erosion that's difficult to reverse. Under partial data, the cost of a wrong move exceeds the cost of a structured delay.

**Decision type:** This is a *reversibility-gated* decision. The recommendation depends entirely on whether the proposed change is easily reversible (e.g., promotional pricing, A/B test on new cohorts) or structurally sticky (e.g., published rate card, contractual commitments, grandfathering obligations).

**Recommendation posture:** Do not commit to a permanent pricing change. Instead, design a bounded experiment that generates the missing data while limiting downside exposure.

## Unknowns & Evidence Gaps

| Gap ID | Unknown | Impact on Decision | Closable? | Method to Close |
|--------|---------|-------------------|-----------|----------------|
| G-1 | Competitor pricing and recent moves | Cannot assess relative positioning | Yes | Competitive audit (1-2 weeks) |
| G-2 | Customer willingness-to-pay distribution | Cannot set optimal price point | Yes | Van Westendorp or Gabor-Granger survey (2-3 weeks) |
| G-3 | Price elasticity of current customer base | Cannot model churn risk from increase | Partially | Cohort analysis on historical plan changes; A/B test on new signups |
| G-4 | Segment-level margin contribution | Cannot identify which segments subsidize others | Yes | Internal data pull from finance (days) |
| G-5 | Contractual or regulatory constraints on price changes | Could block execution entirely | Yes | Legal/compliance review (1 week) |

**Critical gap:** G-2 and G-3 together represent the minimum evidence threshold. Without willingness-to-pay data AND elasticity estimates, any price point is a guess dressed as strategy.

**What we likely DO know (even with partial data):**
- Current unit economics and margin structure
- Historical conversion rates at current price
- Customer acquisition cost trends
- Qualitative signals from sales/support about price sensitivity

These are necessary but insufficient for a pricing commitment.

## Pass/Fail Readiness

**Readiness verdict: FAIL — not ready for a permanent pricing change.**

| Criterion | Status | Rationale |
|-----------|--------|-----------|
| We know our cost floor | PASS | Internal data should be available |
| We know competitor range | FAIL | Gap G-1 unresolved |
| We have WTP data | FAIL | Gap G-2 unresolved |
| We can model churn impact | FAIL | Gap G-3 unresolved |
| Legal/ops can execute | UNKNOWN | Gap G-5 unresolved |
| We have a rollback plan | CONDITIONAL | Depends on change reversibility |

**Gate rule:** A pricing change requires PASS on at least cost floor + WTP + churn model. We currently pass 1 of 3. This is a clear fail.

**What IS ready:** We can launch a structured pricing experiment on a bounded segment (new customers only, single geography, time-limited) that generates real elasticity data without contaminating existing revenue.

## Recommended Next Artifact

**Immediate next step:** Commission a **Pricing Experiment Design** artifact that specifies:

1. **Test structure:** A/B price test on new customer cohorts only (protects existing revenue)
2. **Variables:** 2-3 price points informed by cost floor + qualitative signals
3. **Sample size and duration:** Statistical power calculation for detecting meaningful conversion differences
4. **Kill criteria:** Pre-committed thresholds for abandoning a price point (e.g., conversion drops >20% relative to control)
5. **Data collection plan:** What G-1 through G-5 gaps this experiment will and won't close

**Parallel workstreams:**
- Competitive pricing audit (closes G-1, 1-2 week turnaround)
- Internal margin analysis by segment (closes G-4, days)
- Legal/compliance review of pricing change mechanics (closes G-5, 1 week)

**Decision checkpoint:** Reconvene pricing decision in 3-4 weeks with experiment results + competitive audit + WTP survey data. At that point, the decision should clear the pass/fail gate.

**What this is NOT:** This is not a recommendation to do nothing. It is a recommendation to generate evidence at speed while avoiding an irreversible commitment on insufficient data. The experiment itself is the strategy.
