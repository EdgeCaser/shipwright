# Pricing Strategy Recommendation Under Partial Market Data

## Decision Frame

**Context:** We are evaluating a pricing change with incomplete market data. The core decision is whether to proceed with a pricing adjustment now, delay until more data is available, or adopt a staged approach that generates data while limiting downside.

**Decision type:** Reversible with friction. Pricing changes can be rolled back, but each change carries switching costs: customer trust erosion, sales team retraining, contract renegotiation, and market signal noise. This is not a free option.

**Stakeholders affected:** Revenue/finance (margin impact), sales (deal velocity and objection handling), customer success (renewal risk on existing accounts), product (packaging implications), and executive leadership (strategic positioning signal).

**Key question:** Given that our market data is partial, can we construct a pricing move where the expected value is positive even under pessimistic assumptions about the missing data?

## Unknowns & Evidence Gaps

| Unknown | What We Have | What We Lack | Impact on Decision |
|---|---|---|---|
| Competitor pricing | Anecdotal deal-level intel, published list prices | Actual transacted prices, discount structures, bundling strategies | High — we may be anchoring to list prices that nobody pays |
| Customer willingness-to-pay (WTP) | Historical win/loss rates at current pricing | Van Westendorp or conjoint data segmented by use case | High — without WTP curves we cannot distinguish "too cheap" from "leaving money on the table" |
| Price elasticity by segment | Aggregate churn rates post-last-change | Segment-level elasticity estimates | Medium — aggregate masks segment-specific risk |
| Cost trajectory | Current COGS and margin structure | Forward-looking cost curve (especially if input costs are volatile) | Medium — margin sustainability depends on cost assumptions |
| Channel/partner economics | Direct sales margin data | Reseller and partner margin requirements | Low-Medium — relevant only if channel is >20% of revenue |
| Operational experiment feasibility | None confirmed | Sales team capacity for test/control discipline, volume sufficiency for statistical power, clean randomization capability | High — without confirming these, any experiment design is aspirational |

**Critical gap:** The absence of segment-level WTP data remains the most dangerous gap. Additionally, as noted below, the operational feasibility of running a controlled pricing experiment has not been established and must be validated before committing to that path.

## Pass/Fail Readiness

**Verdict: CONDITIONAL PASS — proceed only with a staged, data-generating approach, contingent on confirming operational feasibility. Do not execute a full pricing change.**

**Rationale:**

- **FAIL condition for full rollout:** We lack segment-level WTP and real competitor transacted pricing. A full pricing change under these conditions is a bet, not a strategy. The reversibility-with-friction nature of pricing means a wrong move costs more than the delay.

- **CONDITIONAL PASS for staged approach:** We have enough signal to *design* a controlled pricing test, but the viability of that test depends on operational prerequisites that have not yet been confirmed. Specifically:

**Prerequisites that must be validated before experiment launch:**

1. **Randomization feasibility:** Can pricing be cleanly assigned at the segment or cohort level without contamination? If the sales process involves negotiation, rep discretion, or multi-stakeholder deals, clean randomization may not be achievable. Fallback: sequential (before/after) test design with appropriate causal inference methods (e.g., interrupted time series), accepting weaker causal claims.
2. **Sales team discipline:** Can the team maintain test/control separation without leaking the lower price into the control group? If not, consider limiting the test to a channel or geography where enforcement is realistic.
3. **Volume sufficiency:** Pre-calculate minimum sample sizes. If deal volume is too low to detect a meaningful effect (≥15% conversion difference at 80% power) within 6-8 weeks, the experiment timeline must be extended or the design adjusted (e.g., wider price spread to increase effect size, or a Bayesian sequential design that allows early stopping).

**What a field test can and cannot tell us:**

- **Can tell us:** Whether a specific price point change causes observable shifts in conversion, churn, or deal velocity within the tested segment. This is a *revealed preference signal*, not a full WTP curve.
- **Cannot tell us:** Segment-level willingness-to-pay curves. A field test at one or two price points reveals response at those points; it does not recover the demand curve. To approximate WTP, the experiment must be supplemented with structured research (Van Westendorp interviews, conjoint analysis) or multiple price-point tests over successive waves.

This distinction matters: even a successful experiment reduces uncertainty about the tested price point but does not resolve the broader WTP gap. The recommendation should be understood as a *risk-reduction step*, not a complete solution to the partial-data problem.

**Staged approach specification (contingent on prerequisite validation):**

1. **Segment selection:** Identify 1-2 segments where we have the strongest prior signal on price sensitivity and where operational conditions support clean test execution.
2. **Test design:** A/B (if randomization is feasible) or sequential cohort test. Pre-register the design, including statistical power analysis, before launch.
3. **Duration:** 6-8 weeks minimum, subject to volume sufficiency check. Extend if required sample size demands it.
4. **Kill criteria:** Pre-define failure thresholds — e.g., if conversion drops >10% in the test group at the 4-week mark, halt and revert.
5. **Data capture:** Instrument to capture not just win/loss but stated objections, competitive mentions, and negotiation behavior to build qualitative context around the quantitative signal.

**Risks of the staged approach:**
- Sales team inconsistency if test and control pricing coexist in the same market.
- Prospect/customer discovery of differential pricing (mitigate via segment isolation or positioning as a "pilot program").
- Slower time-to-revenue if the optimal price is indeed higher and we delay the full rollout.
- The experiment may yield a directional signal but not the segment-level WTP resolution needed for confident broad rollout — requiring additional research rounds.

## Recommended Next Artifact

**Immediate next step:** Produce an **Operational Feasibility Assessment** covering:
- Can pricing be cleanly randomized or must we use a sequential design?
- Does sales have the operational discipline and tooling for test/control separation?
- What is the deal volume per target segment, and is it sufficient for statistical power within the proposed timeline?
- Are there contractual or regulatory barriers to differential pricing?

**Contingent on feasibility pass:** Commission a **Pricing Experiment Design Document** specifying target segments, exact price points, sample size and duration calculations, kill criteria, and instrumentation requirements.

**Parallel workstream:** Initiate lightweight WTP research (15-20 structured customer interviews using Van Westendorp questions) to build qualitative WTP signal that the field test alone cannot provide. This supplements the experiment by beginning to map the demand curve rather than testing a single point on it.

**Decision gate:** After the experiment concludes (8-12 weeks depending on volume), reconvene with empirical data *and* qualitative WTP findings to make the go/no-go decision on broad pricing change. Acknowledge that this gate may produce a directional recommendation rather than a definitive answer, and plan for that contingency.
