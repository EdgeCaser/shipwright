# Churn Reduction PRD: Resolving Conflicting Signals

## Decision Frame

**Problem Statement:** Monthly churn has risen from 4.2% to 6.1% over the past two quarters, but conflicting signals make root-cause attribution unreliable. NPS scores remain stable (42→40), product usage metrics show *increased* engagement among churned cohorts in their final 30 days, and exit survey data points to pricing — yet our recent price increase correlates with a segment (SMB) that was already churning at elevated rates before the change.

**Strategic Tension:** The company's growth strategy targets upmarket expansion (increasing ARPU via enterprise features and pricing power). A churn reduction initiative that rolls back pricing or re-prioritizes SMB retention directly conflicts with this strategic direction. We must determine whether churn is a *symptom of healthy segment migration* or a *leading indicator of broader product-market fit erosion* before committing resources.

**Decision Required:** Should we (a) invest in targeted retention interventions, (b) accept elevated churn as a cost of upmarket repositioning, or (c) pause the pricing strategy pending further investigation?

**Decision Owner:** VP Product, with sign-off from CEO on any pricing strategy changes.

**Decision Deadline:** End of Q3 planning cycle (6 weeks from now). Delaying beyond this forces a default choice of (b) as the pricing strategy continues to execute.

## Unknowns & Evidence Gaps

| # | Unknown | Why It Matters | Current Evidence | Gap Severity |
|---|---------|---------------|-----------------|-------------|
| U1 | Is churned-cohort engagement spike genuine usage or "shopping for alternatives"? | If users increase usage before leaving, they may be extracting value before migrating to a competitor — fundamentally different from disengagement churn. | We have aggregate usage metrics but no feature-level or session-intent analysis for churned users. | **Critical** — misreading this signal could invert our intervention strategy. |
| U2 | What share of incremental churn is SMB vs. mid-market vs. enterprise? | If churn is concentrated in SMB, it may validate the upmarket thesis. If mid-market is rising, the pricing strategy is eroding the bridge segment. | Exit surveys skew SMB (70% of respondents) but SMB is also 65% of the base — no controlled comparison. | **High** — segment-level cohort analysis exists in raw data but has not been performed. |
| U3 | Are churned customers going to a specific competitor or going dark? | Competitor displacement signals product gap; going dark signals budget/need evaporation. Interventions differ completely. | Anecdotal sales team reports only. No systematic win/loss analysis for churn. | **High** — addressable with 2-week structured interview sprint. |
| U4 | Does the stable NPS mask bimodal distribution? | Aggregate NPS of 40 could hide a growing detractor segment offset by promoter growth — a classic "average masks divergence" failure. | We report top-line NPS only. Distribution data exists but is not analyzed by segment or tenure. | **Medium** — quick analysis, high interpretive value. |
| U5 | What is the revenue-weighted churn rate vs. logo churn? | If small logos churn but revenue retention is flat or improving, the business impact is fundamentally different from what the headline number suggests. | Logo churn reported; revenue churn not broken out in current dashboards. | **Critical** — this single metric could resolve the entire strategic tension. |

## Pass/Fail Readiness

**Readiness Verdict: FAIL — Not ready to commit to a churn reduction initiative.**

**Rationale:**

1. **We cannot distinguish healthy churn from dangerous churn.** Without U2 (segment-level analysis) and U5 (revenue-weighted churn), we risk building interventions that retain low-value customers at the expense of upmarket momentum. This is worse than doing nothing.

2. **The conflicting signals are not paradoxical — they are unresolved.** Rising engagement among churners (U1), stable NPS (U4), and pricing-correlated exit surveys could all be consistent with a single coherent story, but we haven't done the analysis to find it. Committing resources before resolving these unknowns means we're guessing.

3. **The cost of a 2-3 week investigation is low relative to the cost of a wrong intervention.** A misguided retention program (discounts, feature pivots, dedicated CSM allocation) could cost $200K-$500K in direct spend and opportunity cost, plus strategic confusion. The investigation costs analyst time only.

**What would change this to PASS:**
- Complete segment-level cohort analysis (U2) — 1 week, data team
- Calculate revenue-weighted churn (U5) — 2 days, data team
- Analyze NPS distribution by segment (U4) — 2 days, data team
- If these reveal mid-market or enterprise churn acceleration, escalate to structured churn interviews (U3) — additional 2 weeks

## Recommended Next Artifact

**Artifact:** Churn Signal Investigation Brief (research spike)

**Scope:** A time-boxed 2-week research sprint to resolve U2, U4, and U5 (all answerable from existing data within days), with a go/no-go gate for U1 and U3 (requiring new data collection).

**Deliverable:** A one-page decision memo that presents:
1. Segment-level churn rates (logo and revenue) with quarter-over-quarter trends
2. NPS distribution analysis by segment and tenure cohort
3. Feature-level usage patterns for churned vs. retained cohorts in their final 60 days
4. Preliminary competitor displacement signal from structured interviews (if gate is passed)
5. Revised recommendation: invest in retention, accept churn, or modify pricing strategy

**Owner:** Data/Analytics lead, with PM support for interview design.

**Timeline:** Results presented at Q3 planning kickoff (week 3 of 6 before decision deadline).

**Decision Gate:** If revenue-weighted churn is flat or improving AND churn is concentrated in SMB, recommend accepting elevated logo churn and closing this initiative. If revenue-weighted churn is accelerating OR mid-market/enterprise segments show rising churn, escalate to full retention PRD with intervention options.
