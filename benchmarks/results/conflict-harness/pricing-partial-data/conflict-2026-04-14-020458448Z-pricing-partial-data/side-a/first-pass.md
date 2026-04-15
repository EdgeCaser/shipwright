# Pricing Strategy Recommendation Under Partial Market Data

## Decision Frame

**Context:** We are evaluating a pricing change with incomplete market data. The core decision is whether to proceed with a pricing adjustment now, delay until more data is available, or run a structured experiment to fill critical gaps before committing.

**Decision type:** Reversible with cost. Pricing changes signal to customers and competitors. A wrong move can be walked back, but not without brand/trust friction and internal operational cost.

**Stakeholders affected:** Revenue/finance (margin impact), sales (deal velocity and objection handling), customers (value perception and switching calculus), product (packaging implications).

**Key assumption under test:** That the partial data we hold is sufficient to bound the downside risk of a pricing move, even if it cannot precisely predict the upside.

## Unknowns & Evidence Gaps

| Gap ID | Unknown | Impact if wrong | Fillable? | Method to fill | Timeline |
|--------|---------|-----------------|-----------|----------------|----------|
| G-1 | Competitor pricing response | Could trigger race-to-bottom or leave money on table | Yes | Win/loss interviews + sales intel structured debrief (n≥15) | 2-3 weeks |
| G-2 | Customer willingness-to-pay distribution | May over- or under-price relative to value delivered | Yes | Van Westendorp or Gabor-Granger survey on current customer base (n≥50) | 3-4 weeks |
| G-3 | Price elasticity of demand for our segment | Volume impact of price change is unbounded without this | Partially | A/B test on new cohort pricing; historical churn correlation analysis | 4-6 weeks (A/B); 1 week (historical) |
| G-4 | Internal cost structure changes pending | Margin assumptions may shift if COGS change | Yes | Finance review of upcoming vendor contract renewals | 1 week |

**What we do know:**
- Current pricing has not changed in >12 months (staleness risk).
- Anecdotal sales feedback suggests we are "leaving money on table" with enterprise tier.
- At least two competitors have adjusted pricing in the last 6 months (direction unclear without G-1).
- Gross margin is healthy enough to absorb a moderate downward adjustment if needed.

**What we do not know is more important than what we know.** The gaps above (G-1 through G-3 especially) represent the primary inputs to any credible pricing model. Without them, a pricing recommendation is a guess decorated with confidence.

## Pass/Fail Readiness

**Readiness verdict: FAIL — not ready to commit to a pricing change.**

**Rationale:**

1. **Evidence threshold not met.** Of the four critical gaps identified, zero have been filled. The anecdotal sales signal ("leaving money on table") is directional but not sized — it could justify a 5% increase or a 30% increase, and the difference matters enormously.

2. **Downside is asymmetric.** Raising price too aggressively risks churn in a segment we cannot observe elasticity for (G-3). Lowering price sacrifices margin permanently for volume gains we cannot forecast. Either direction carries material risk without G-2 and G-3.

3. **Reversibility is overstated.** While pricing can technically be changed again, mid-contract customers on annual deals lock in for 12 months, sales compensation plans are built on current pricing, and public price changes signal instability if done repeatedly.

4. **Time cost of waiting is low.** The fastest gap (G-4) can be closed in 1 week. The most impactful gaps (G-1, G-2) can be closed in 3-4 weeks. There is no stated urgency (e.g., competitive threat, margin crisis) that would justify acting before these are filled.

**What would change this to PASS:**
- G-2 (WTP data) collected with n≥50 and clear clustering.
- G-3 (elasticity) bounded via historical churn analysis at minimum.
- G-1 (competitor intel) synthesized from at least 15 structured win/loss interviews.
- If any of these reveal urgent signal (e.g., we are 40%+ below WTP median), that changes the urgency calculus.

## Recommended Next Artifact

**Artifact:** Pricing Research Brief — a scoped research plan to close G-1 through G-4 within 4 weeks.

**Contents should include:**
1. WTP survey design (Van Westendorp preferred for simplicity) targeting current customers, segmented by tier.
2. Win/loss interview protocol for sales team, structured to extract competitor pricing signals without leading.
3. Historical churn analysis spec — correlate past price-adjacent changes (packaging, discounting patterns) with retention data.
4. Finance review request for pending COGS changes.

**Decision checkpoint:** Reconvene in 4 weeks with research results. At that point, produce a Pricing Decision Memo with specific price points, expected volume impact ranges, and a rollout plan (including grandfather policy for existing customers).

**If research is blocked or delayed:** Fall back to a limited A/B test on new customer cohort only (no existing customer exposure), using 2-3 price points to generate elasticity signal empirically. This is slower but self-contained.
