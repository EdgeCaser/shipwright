# Pricing Strategy Recommendation Under Partial Market Data

## Decision Frame

**Context:** We are evaluating a pricing change with incomplete market data. The core decision is whether to proceed with a pricing adjustment now, delay until more data is available, or run a structured experiment to fill critical gaps before committing.

**Decision type:** Reversible with cost. Pricing changes signal to customers and competitors. A wrong move can be walked back, but not without brand/trust friction and internal operational cost.

**Stakeholders affected:** Revenue/finance (margin impact), sales (deal velocity and objection handling), customers (value perception and switching calculus), product (packaging implications).

**Key assumption under test:** That the partial data we hold is sufficient to bound the downside risk of a pricing move, even if it cannot precisely predict the upside.

**Scope distinction:** This frame distinguishes between a *full pricing commitment* (across-the-board rate change affecting all segments and existing customers) and *narrower pricing actions* (segmented adjustments, packaging changes, new-cohort-only experiments). The readiness bar differs for each.

## Unknowns & Evidence Gaps

| Gap ID | Unknown | Impact if wrong | Fillable? | Method to fill | Timeline | Required for full commit? | Required for narrow action? |
|--------|---------|-----------------|-----------|----------------|----------|--------------------------|----------------------------|
| G-1 | Competitor pricing response | Could trigger race-to-bottom or leave money on table | Yes | Win/loss interviews + sales intel structured debrief (n≥15) | 2-3 weeks | Yes | No — segmented test limits exposure |
| G-2 | Customer willingness-to-pay distribution | May over- or under-price relative to value delivered | Yes | Van Westendorp or Gabor-Granger survey on current customer base (n≥50) | 3-4 weeks | Yes | Partially — directional signal from sales suffices for narrow test |
| G-3 | Price elasticity of demand for our segment | Volume impact of price change is unbounded without this | Partially | A/B test on new cohort pricing; historical churn correlation analysis | 4-6 weeks (A/B); 1 week (historical) | Yes | No — narrow test *generates* this data |
| G-4 | Internal cost structure changes pending | Margin assumptions may shift if COGS change | Yes | Finance review of upcoming vendor contract renewals | 1 week | Yes | Yes — low cost to close, no reason to skip |

**What we do know:**
- Current pricing has not changed in >12 months (staleness risk).
- Anecdotal sales feedback suggests we are "leaving money on table" with enterprise tier.
- At least two competitors have adjusted pricing in the last 6 months (direction unclear without G-1).
- Gross margin is healthy enough to absorb a moderate downward adjustment if needed.

**What we do not know is more important than what we know** for a full pricing commitment. However, the known facts — particularly the enterprise-tier sales signal and 12-month staleness — are sufficient to justify a bounded action.

## Pass/Fail Readiness

**Full pricing commitment: FAIL — not ready.**

A broad pricing change affecting all segments and existing customers requires G-1 through G-3 at minimum. The anecdotal sales signal is directional but not sized — it could justify a 5% increase or a 30% increase, and the difference matters enormously for churn risk. Reversibility is overstated because annual contracts lock in for 12 months, sales compensation plans are built on current pricing, and repeated public price changes signal instability.

**Narrower action (segmented enterprise increase or new-cohort test): CONDITIONAL PASS.**

The current evidence — enterprise-tier sales feedback, 12-month pricing staleness, healthy gross margin — is sufficient to justify a limited action with the following guardrails:

1. **Scope:** Enterprise tier only, new deals or renewals only (no mid-contract changes).
2. **Magnitude:** Bounded to ≤15% increase, informed by the directional sales signal. This limits downside to observable churn within one renewal cycle.
3. **Measurement:** Structure as a deliberate test — track win rate, deal velocity, and churn at the adjusted price vs. historical baseline.
4. **Exit criteria:** If win rate drops >10pp or enterprise churn exceeds baseline by >2pp within 60 days, revert and accelerate the full research plan.
5. **Prerequisite:** G-4 (cost structure review) must be closed first. It takes 1 week and costs nothing — there is no reason to act without it.

This narrow action does not substitute for the full research plan. It runs *in parallel* with gap-closing work, generating elasticity signal (G-3) empirically while the WTP survey (G-2) and win/loss interviews (G-1) proceed.

**What would upgrade the full commitment to PASS:**
- G-2 (WTP data) collected with n≥50 and clear clustering.
- G-3 (elasticity) bounded via historical churn analysis at minimum, supplemented by narrow-test results.
- G-1 (competitor intel) synthesized from at least 15 structured win/loss interviews.

## Recommended Next Artifact

**Artifact:** Pricing Research Brief with Parallel Test Design — a scoped plan that closes G-1 through G-4 within 4 weeks while running a bounded enterprise pricing test concurrently.

**Contents should include:**
1. **Enterprise pricing test spec:** Price points, cohort definition (new deals + upcoming renewals), measurement plan, exit criteria, rollback protocol.
2. **WTP survey design** (Van Westendorp preferred for simplicity) targeting current customers, segmented by tier.
3. **Win/loss interview protocol** for sales team, structured to extract competitor pricing signals without leading.
4. **Historical churn analysis spec** — correlate past price-adjacent changes (packaging, discounting patterns) with retention data.
5. **Finance review request** for pending COGS changes (G-4, prerequisite to test launch).

**Decision checkpoint:** Reconvene in 4 weeks with research results and test data. At that point, produce a Pricing Decision Memo with specific price points across all segments, expected volume impact ranges, and a rollout plan (including grandfather policy for existing customers).

**If research is blocked or delayed:** The narrow test generates its own signal. After 60 days of test data, elasticity bounds from the test alone may be sufficient to inform a broader rollout — but WTP and competitive data remain strongly recommended before full commitment.
