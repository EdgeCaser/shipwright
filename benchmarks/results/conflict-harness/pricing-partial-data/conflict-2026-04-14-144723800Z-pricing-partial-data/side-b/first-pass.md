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

**Critical gap:** The absence of segment-level WTP data is the most dangerous gap. Any across-the-board pricing change without this risks subsidizing low-value segments at the expense of high-value ones, or worse, triggering churn in the most price-sensitive segment while gaining nothing from the least sensitive.

## Pass/Fail Readiness

**Verdict: CONDITIONAL PASS — proceed only with a staged, data-generating approach. Do not execute a full pricing change.**

**Rationale:**

- **FAIL condition for full rollout:** We lack segment-level WTP and real competitor transacted pricing. A full pricing change under these conditions is a bet, not a strategy. The reversibility-with-friction nature of pricing means a wrong move costs more than the delay.

- **PASS condition for staged approach:** We have enough signal to design a controlled pricing experiment that (a) limits blast radius, (b) generates the missing WTP data, and (c) preserves optionality for a full rollout within 1-2 quarters.

**Staged approach specification:**

1. **Segment selection:** Identify 1-2 segments where we have the strongest prior signal on price sensitivity (e.g., new business in a specific tier, or renewals in a cohort with known competitive pressure).
2. **Test design:** A/B or sequential test with the proposed new pricing vs. current pricing. Minimum sample size must be pre-calculated to detect a meaningful effect on conversion/churn (recommend ≥15% detectable difference at 80% power).
3. **Duration:** 6-8 weeks minimum to capture a full decision cycle.
4. **Kill criteria:** Pre-define failure thresholds — e.g., if conversion drops >10% in the test group at the 4-week mark, halt and revert.
5. **Data capture:** Instrument the test to capture not just win/loss but stated objections, competitive mentions, and negotiation behavior.

**Risks of the staged approach:**
- Sales team inconsistency if test and control pricing coexist in the same market.
- Prospect/customer discovery of differential pricing (mitigate via segment isolation or positioning as a "pilot program").
- Slower time-to-revenue if the optimal price is indeed higher and we delay the full rollout.

## Recommended Next Artifact

**Immediate next step:** Commission a **Pricing Experiment Design Document** that specifies:
- Target segments for the test
- Exact price points to test (derived from available competitive intel and cost-plus floor)
- Sample size and duration calculations
- Kill criteria and escalation path
- Instrumentation requirements for sales and product analytics

**Parallel workstream:** Initiate lightweight WTP research (even 15-20 structured customer interviews using Van Westendorp questions) to supplement the experiment with qualitative signal. This can run concurrently and inform interpretation of experiment results.

**Decision gate:** After the experiment concludes (8-10 weeks), reconvene with full data to make the go/no-go decision on broad pricing change. At that point, we will have segment-level empirical data rather than assumptions, making the decision dramatically more defensible.
