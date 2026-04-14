# Churn Reduction PRD: Resolving Conflicting Signals

## Decision Frame

**Problem statement:** Churn metrics are sending conflicting signals relative to strategic growth targets. Specifically:

- **Signal conflict 1:** Net revenue retention (NRR) appears healthy at 105%+, but logo churn is accelerating (monthly logo churn rising from 3.2% to 4.8% over two quarters). Expansion revenue from surviving accounts masks the loss of smaller accounts.
- **Signal conflict 2:** NPS scores remain stable (42-45 range), yet support ticket volume per account has increased 30%. Customers are dissatisfied but not yet at the point of scoring detractors — a lagging indicator problem.
- **Signal conflict 3:** Product usage metrics show increased DAU/MAU ratio, but session depth is declining. Users log in more frequently but do less each time — potentially a sign of workflow fragmentation rather than engagement.

**Strategic tension:** The current strategy prioritizes land-and-expand (upsell existing accounts). Churn reduction efforts that slow expansion motion (e.g., shifting CS resources from upsell to save plays) directly conflict with quarterly expansion targets. This PRD must resolve that tension with a clear recommendation.

**Decision to be made:** Should we (a) rebalance CS capacity toward retention at the cost of expansion velocity, (b) build product-led retention mechanisms that don't consume CS bandwidth, or (c) accept current logo churn as the cost of the expansion strategy and set a ceiling rather than a floor?

**Who decides:** VP Product + VP Customer Success, with CFO sign-off if CS headcount reallocation exceeds 20%.

**Decision deadline:** End of Q3 planning cycle.

## Unknowns & Evidence Gaps

| # | Unknown | Why it matters | Current evidence | What would resolve it |
|---|---------|---------------|-----------------|----------------------|
| U1 | Are churning accounts fundamentally different from expanding accounts (segment, ACV, use case)? | If churn is concentrated in a segment we're deprioritizing anyway, the conflict is illusory. | We have logo churn counts but no segmented cohort analysis by ACV band or use case. | Run cohort survival analysis segmented by ACV quartile, industry, and primary use case. |
| U2 | What is the revenue-weighted churn rate vs. logo churn rate? | Logo churn of 4.8% could represent 1% of revenue or 15%. The strategic response differs dramatically. | NRR is reported in aggregate. Revenue churn by cohort is not broken out. | Finance to produce revenue churn by monthly cohort for last 8 quarters. |
| U3 | Is declining session depth causal to churn or merely correlated? | If shallow sessions predict churn, product-led intervention is viable. If not, we're optimizing the wrong signal. | No predictive model exists linking usage patterns to churn probability. | Build a logistic regression churn predictor using usage telemetry from last 12 months. |
| U4 | What is the actual CS capacity split between expansion and retention today? | We cannot rebalance what we haven't measured. | CS leadership estimates 70/30 expansion/retention but no time-tracking data exists. | Two-week CS time audit with activity categorization. |
| U5 | Are churned customers recoverable, and at what cost? | Win-back economics inform whether prevention or recovery is the better investment. | Anecdotal: some accounts have returned. No systematic win-back data. | Survey last 6 months of churned accounts; track win-back attempts and conversion rates. |

## Pass/Fail Readiness

**Readiness verdict: NOT READY to commit to a specific churn intervention.**

Rationale:

- **FAIL — Evidence sufficiency:** The three signal conflicts cannot be resolved without U1 and U2 (segmented churn data). Without knowing *who* is churning and *how much revenue* they represent, any intervention is untargeted.
- **FAIL — Causal understanding:** U3 (session depth → churn causality) is unresolved. Product-led retention investment without this analysis risks building features that don't move the churn needle.
- **FAIL — Capacity baseline:** U4 (CS time allocation) is estimated, not measured. Rebalancing from an unknown baseline produces unpredictable results.
- **PASS — Strategic framing:** The decision frame is clear, the stakeholders are identified, and the three options are well-defined. We know what decision we need to make; we lack the evidence to make it.
- **PASS — Urgency calibration:** Logo churn trend (3.2% → 4.8%) is concerning but not crisis-level. We have one quarter to gather evidence before the trend becomes structural. Rushing a response risks misallocation.

**Minimum evidence required before proceeding:**
1. Segmented cohort churn analysis (U1 + U2) — 2 weeks to produce
2. CS capacity audit (U4) — 2 weeks to produce
3. Preliminary churn predictor (U3) — 4 weeks to produce (can run in parallel)

## Recommended Next Artifact

**Next artifact: Evidence Sprint Plan**

Before writing a full churn reduction roadmap, execute a 4-week evidence sprint to close U1-U4:

| Week | Deliverable | Owner | Feeds into |
|------|------------|-------|------------|
| 1-2 | Segmented cohort survival analysis (U1 + U2) | Data/Analytics | Decision between options (a), (b), (c) |
| 1-2 | CS time allocation audit (U4) | CS Ops | Feasibility of option (a) |
| 1-4 | Churn predictor v0 using usage telemetry (U3) | Data Science | Feasibility of option (b) |
| 3 | Win-back survey of last 6 months churned accounts (U5) | CS + Marketing | Recovery economics |
| 4 | Evidence review + decision meeting | VP Product + VP CS | Commit to (a), (b), or (c) with data |

After the evidence sprint, the recommended follow-on artifact is a **Prioritized Intervention Roadmap** — a PRD with specific retention features, CS process changes, or strategic acceptance criteria, depending on which option the evidence supports.

**What we will NOT do in the interim:**
- No reactive CS reallocation before the capacity audit completes.
- No new retention features until the churn predictor identifies actionable signals.
- No changes to expansion targets until revenue-weighted churn is quantified.

This deliberate pause is itself a decision: we are choosing evidence over speed because the signal conflicts mean that fast action is as likely to be wrong as right.
