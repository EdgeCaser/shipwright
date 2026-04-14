# Pricing Strategy Recommendation Under Partial Market Data

## Decision Frame

**Core question:** Should we change pricing now with incomplete market data, or defer until we can close critical evidence gaps?

**Stakes:** Pricing changes are high-inertia decisions. Raising prices risks churn if the market won't bear it; lowering prices risks margin erosion that's difficult to reverse. Under partial data, the cost of a wrong move generally exceeds the cost of a structured delay — but this depends on the *type* of change proposed.

**Decision type:** This is a *reversibility-gated* decision. The recommendation depends on whether the proposed change is easily reversible (e.g., promotional pricing, A/B test on new cohorts) or structurally sticky (e.g., published rate card, contractual commitments, grandfathering obligations).

**Recommendation posture:** The default is to avoid permanent pricing commitments without adequate evidence. However, certain narrow permanent moves may clear a lower evidence bar — specifically when the change corrects a demonstrable misalignment (obvious underpricing relative to known cost floor, packaging simplification that removes confusion without altering effective price, or low-regret increases scoped to new customers only). The gate criteria below distinguish these cases.

## Unknowns & Evidence Gaps

| Gap ID | Unknown | Impact on Decision | Closable? | Method to Close |
|--------|---------|-------------------|-----------|----------------|
| G-1 | Competitor pricing and recent moves | Cannot assess relative positioning | Yes | Competitive audit (1-2 weeks) |
| G-2 | Customer willingness-to-pay distribution | Cannot set optimal price point | Yes | Van Westendorp or Gabor-Granger survey (2-3 weeks) |
| G-3 | Price elasticity of current customer base | Cannot model churn risk from increase | Partially | Cohort analysis on historical plan changes; A/B test on new signups |
| G-4 | Segment-level margin contribution | Cannot identify which segments subsidize others | Yes | Internal data pull from finance (days) |
| G-5 | Contractual or regulatory constraints on price changes | Could block execution entirely | Yes | Legal/compliance review (1 week) |

**Critical gap assessment depends on change type:**
- **Broad or structural repricing** (new rate card, tier restructure, increase across existing customers): G-2 and G-3 are both critical. Without WTP and elasticity data, any price point is a guess dressed as strategy.
- **Narrow corrective moves** (fixing known underpricing, simplifying packaging, new-customer-only adjustments): G-2 may be partially substitutable with cost-floor analysis and qualitative signals. G-3 is less critical when existing customers are unaffected.

**What we likely DO know (even with partial data):**
- Current unit economics and margin structure
- Historical conversion rates at current price
- Customer acquisition cost trends
- Qualitative signals from sales/support about price sensitivity

These are necessary but insufficient for broad repricing. They may be sufficient for narrow corrective moves.

## Pass/Fail Readiness

**Readiness verdict: CONDITIONAL — depends on scope and reversibility of the proposed change.**

### Scenario A: Broad or structural pricing change

| Criterion | Status | Rationale |
|-----------|--------|-----------|
| We know our cost floor | PASS | Internal data should be available |
| We know competitor range | FAIL | Gap G-1 unresolved |
| We have WTP data | FAIL | Gap G-2 unresolved |
| We can model churn impact | FAIL | Gap G-3 unresolved |
| Legal/ops can execute | UNKNOWN | Gap G-5 unresolved |
| We have a rollback plan | CONDITIONAL | Depends on change reversibility |

**Gate result: FAIL.** Passes 1 of 3 required gates (cost floor + WTP + churn model).

### Scenario B: Narrow corrective move (e.g., correct underpricing, new-customer-only change, packaging simplification)

| Criterion | Status | Rationale |
|-----------|--------|-----------|
| We know our cost floor | PASS | Internal data should be available |
| Change corrects demonstrable misalignment | REQUIRES VALIDATION | Must show current price is below cost floor or clearly misaligned with delivered value |
| Existing customer exposure is bounded | REQUIRES VALIDATION | New-customer-only or opt-in migration limits blast radius |
| Legal/ops can execute | UNKNOWN | Gap G-5 still applies |
| Downside is capped | CONDITIONAL | Must define maximum revenue-at-risk |

**Gate result: CONDITIONAL PASS — if the proposer can demonstrate the misalignment is obvious and the blast radius is contained, a permanent narrow move may proceed without full WTP/elasticity data.** The burden of proof shifts to the proposer to show why this specific change qualifies.

**What IS ready regardless of scenario:** A structured pricing experiment on a bounded segment (new customers only, single geography, time-limited) that generates real elasticity data without contaminating existing revenue.

## Recommended Next Artifact

**Fork based on change type:**

### If the proposed change is broad or structural:
Commission a **Pricing Experiment Design** artifact that specifies:
1. **Test structure:** A/B price test on new customer cohorts only (protects existing revenue)
2. **Variables:** 2-3 price points informed by cost floor + qualitative signals
3. **Sample size and duration:** Statistical power calculation for detecting meaningful conversion differences
4. **Kill criteria:** Pre-committed thresholds for abandoning a price point (e.g., conversion drops >20% relative to control)
5. **Data collection plan:** Which G-1 through G-5 gaps this experiment will and won't close

### If the proposed change is a narrow corrective move:
Commission a **Pricing Change Justification Brief** that demonstrates:
1. **Misalignment evidence:** Concrete data showing current price is below cost floor or clearly mispositioned
2. **Blast radius analysis:** Which customers are affected and maximum revenue-at-risk
3. **Rollback plan:** How to unwind if results disappoint
4. **Monitoring plan:** Leading indicators to watch in the first 30/60/90 days

**Parallel workstreams (both scenarios):**
- Competitive pricing audit (closes G-1, 1-2 week turnaround)
- Internal margin analysis by segment (closes G-4, days)
- Legal/compliance review of pricing change mechanics (closes G-5, 1 week)

**Decision checkpoint:** For broad changes, reconvene in 3-4 weeks with experiment results + competitive audit + WTP survey data. For narrow moves, the justification brief can be reviewed within 1 week.

**What this is NOT:** This is not a recommendation to do nothing. It is a recommendation to match the evidence bar to the scope and reversibility of the change, generate evidence at speed, and avoid over-indexing on caution when a narrow move may be clearly defensible.
