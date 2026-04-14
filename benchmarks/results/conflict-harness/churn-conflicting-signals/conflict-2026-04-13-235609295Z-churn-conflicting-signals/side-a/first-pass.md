# Churn Reduction PRD: Navigating Conflicting Signals

## Decision Frame

**Problem statement:** Customer churn metrics are sending conflicting signals relative to strategic growth targets. Usage-based indicators suggest increasing engagement among active cohorts, yet revenue churn is accelerating and NPS scores are declining in segments the strategy prioritizes for expansion. The core tension: optimizing for retention in high-churn segments may require investment reallocation away from growth initiatives that leadership has committed to.

**Decision to be made:** Should the organization (a) pause or slow growth-oriented feature investment to fund targeted retention interventions, (b) maintain current growth trajectory and treat churn as an acceptable cost of acquisition-led strategy, or (c) pursue a hybrid approach that ring-fences a retention budget without materially slowing growth commitments?

**Stakeholders:** Product leadership, Growth team, Customer Success, Finance, Engineering capacity planners.

**Time horizon:** 90-day diagnostic + intervention pilot; 180-day measurement window for cohort-level impact.

**Constraints:**
- Engineering capacity is already allocated 70/30 growth vs. maintenance through Q3.
- Strategic plan commits to 40% ARR growth, creating tension with any retention-first reallocation.
- Customer Success team reports anecdotal signals (pricing sensitivity, competitor mentions) that contradict product analytics showing healthy feature adoption.

## Unknowns & Evidence Gaps

| # | Unknown | Impact if unresolved | Current evidence quality | Recommended investigation |
|---|---------|---------------------|------------------------|---------------------------|
| U1 | Which churn cohort drives the revenue signal? Logo churn may be flat while revenue churn rises due to contraction in mid-market accounts. | High — interventions will be mis-targeted if we treat all churn as homogeneous. | **Weak.** Current dashboards aggregate all segments. No cohort-level revenue churn view exists. | Build segmented churn waterfall by plan tier, tenure, and ARR band within 2 weeks. |
| U2 | Is the NPS decline causal or coincident with churn? NPS surveys may oversample dissatisfied users post-support-ticket. | Medium — NPS-driven prioritization could chase noise. | **Weak.** Survey sampling methodology not audited in 12+ months. | Audit NPS sampling frame; run parallel CSAT pulse on random sample. |
| U3 | Are CS anecdotal signals (pricing, competitor mentions) representative or availability-biased? | High — pricing intervention is expensive and irreversible if wrong. | **Very weak.** Anecdotal only; no structured win/loss data. | Implement structured exit survey + 10 churned-customer interviews within 30 days. |
| U4 | Does increased engagement among active cohorts mask a bimodal distribution where power users grow while casual users silently disengage? | High — engagement metrics would be misleading. | **Medium.** DAU/MAU ratio available but not segmented by account health score. | Segment engagement metrics by account health quartile. |
| U5 | What is the actual competitive displacement rate vs. budget cuts / consolidation churn? | Medium — different root causes require fundamentally different responses. | **None.** No competitive churn tagging exists. | Add churn reason taxonomy to CS workflow + exit surveys. |

## Pass/Fail Readiness

**Verdict: NOT READY to commit to a specific churn intervention.**

**Rationale:** The conflicting signals are not yet diagnosed — they are symptoms of measurement gaps, not a well-understood problem. Committing resources to a retention program now risks:

1. **Mis-targeting:** Without U1 resolved, interventions may address the wrong segment.
2. **Misattribution:** Without U2 and U3 resolved, we cannot distinguish signal from noise in qualitative feedback.
3. **Opportunity cost miscalculation:** Without U4 resolved, we cannot accurately model the revenue impact of inaction vs. intervention.

**What would make this ready:**
- [ ] Segmented churn waterfall completed (U1) — **hard gate, no intervention design without this**
- [ ] At least 10 structured exit interviews completed (U3) — **hard gate for any pricing-related intervention**
- [ ] Engagement segmentation by health quartile available (U4) — **hard gate for engagement-based retention tactics**
- [ ] NPS sampling audit complete (U2) — soft gate; can proceed with caveat
- [ ] Churn reason taxonomy deployed (U5) — soft gate; improves future measurement but not blocking

**Risk of waiting:** If revenue churn is accelerating at current rate (~2% MoM increase assumed), a 90-day diagnostic window could cost an estimated 6% incremental ARR loss. This is acceptable if the alternative is a poorly targeted intervention that costs more and delays correct action.

## Recommended Next Artifact

**Next artifact:** Churn Diagnostic Research Brief (target: 30 days)

**Scope:** Resolve U1, U3, and U4 (the three hard gates) through:
1. Data engineering sprint to build segmented churn waterfall (1-2 weeks, requires analytics + data eng)
2. Customer research: 10 structured exit interviews with churned accounts from highest-revenue-impact segment (2-3 weeks, requires CS + UXR)
3. Engagement bimodality analysis segmented by health score (1 week, requires product analytics)

**Decision point after diagnostic:** With hard gates resolved, reconvene to select intervention approach (a, b, or c from Decision Frame) with evidence-backed targeting. The diagnostic brief should include a recommendation with confidence interval and expected ROI range for each option.

**What this PRD deliberately does NOT do:** Prescribe a solution. The conflicting signals indicate a diagnosis problem, not a solution problem. Jumping to intervention design (e.g., "add onboarding flow," "launch save offer") before resolving the unknowns would be premature optimization against ambiguous data.
