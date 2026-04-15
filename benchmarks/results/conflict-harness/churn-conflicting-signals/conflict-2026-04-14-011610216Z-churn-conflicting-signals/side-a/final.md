# Churn Reduction PRD: Navigating Conflicting Signals

## Decision Frame

**Problem statement:** Churn metrics are sending signals that conflict with current strategic growth targets. Specifically, retention interventions that reduce churn (discounts, feature gating relaxation, dedicated CSM allocation) directly erode unit economics targets the business has committed to for this fiscal year. Meanwhile, doing nothing risks accelerating churn beyond the rate the growth engine can replace.

**Decision to be made:** Should we prioritize churn reduction tactics that conflict with margin/growth targets, or hold strategy course and accept elevated churn as a cost of the current growth model?

**Stakeholders:** Product (owns retention surface), Finance (owns unit economics targets), Growth (owns acquisition targets that subsidize churn), CS (owns renewal pipeline), Exec team (owns strategic trade-off authority).

**Signal conflicts identified:**

| Signal | Says | Conflicts With |
|---|---|---|
| 90-day cohort retention dropping 4pp QoQ | Urgent intervention needed | Growth strategy assumes current retention floor holds |
| NPS among churned users: 38 (vs. 52 active) | Product-experience gap driving churn | Roadmap is allocated 70% to new-logo features |
| Win-back discount campaigns show 22% reactivation | Price sensitivity is a lever | Finance has flagged discount programs as margin-dilutive |
| CS-touched accounts churn at 0.5x rate | High-touch works | Scaling CSM headcount breaks current CAC:LTV model |
| Power-user churn is flat; casual-tier churn is accelerating | Churn is segment-specific | Strategy treats all users as single cohort for planning |

**Framing principle:** This PRD does not resolve the conflict. It frames the decision, identifies what we don't know, and specifies what evidence would tip the decision. Premature resolution without evidence would be worse than the current ambiguity.

## Unknowns & Evidence Gaps

### Critical unknowns (must resolve before committing)

1. **Churn-cause segmentation is missing.** We know *who* is churning (casual tier) but not *why* at sufficient granularity. Exit surveys have 11% response rate and skew toward price complaints, which may not represent silent churners. **Evidence needed:** Instrument cancellation flow with structured reason capture (mandatory 1-click before confirmation); run 30 qualitative exit interviews within 3 weeks.

2. **Revenue impact by segment is unquantified.** If casual-tier users contribute <15% of revenue, elevated churn there may be acceptable under current strategy. If they represent pipeline to power-tier conversion, the compounding loss is much larger. **Evidence needed:** Cohort revenue analysis showing (a) direct revenue contribution by tier, (b) historical upgrade rate from casual → power, (c) projected 12-month revenue delta under current churn trajectory vs. 2pp improvement.

3. **Retention intervention ROI is modeled on small samples.** The 22% win-back rate and 0.5x CS-touch churn rate come from non-randomized observations. Selection bias is likely (CS is allocated to highest-value accounts; discount campaigns target recent churners). **Evidence needed:** Controlled experiments — (a) randomized CSM allocation to mid-tier accounts (n≥200, 60-day window), (b) A/B discount vs. feature-unlock win-back offers.

4. **Strategy target flexibility is unknown.** We don't know whether Finance treats unit economics targets as hard constraints or aspirational guides this quarter. A 2pp margin concession to fund retention may be available but hasn't been asked for. **Evidence needed:** Direct conversation with CFO to establish negotiable vs. non-negotiable targets for Q3.

### Secondary unknowns (inform tactics, not the go/no-go)

5. Competitive churn contribution — are we losing users to alternatives or to non-consumption?
6. Seasonal patterns — does the 4pp drop persist when normalized for annual cycles?
7. Feature adoption correlation — which product surfaces predict retention?

## Pass/Fail Readiness

**Current readiness: NOT READY for decision.**

The conflicting signals exist precisely because we lack the evidence to resolve them. Committing to a churn reduction program now means either:
- (a) Accepting margin dilution based on anecdotal evidence (risky if churn cause is not price-sensitive), or
- (b) Doing nothing based on strategic-target orthodoxy (risky if compounding churn undermines the growth model within 2 quarters).

**Pass criteria — what would make this ready:**

| # | Criterion | Status | Dependency / Feasibility Gate | Estimated time to resolve |
|---|---|---|---|---|
| 1 | Churn-cause segmentation with ≥30% response rate | ❌ Not started | Requires eng capacity to instrument cancellation flow (~2 days); 30 exit interviews require UXR or CS bandwidth and a recruiter pipeline for recently-churned users. **Gate:** Confirm eng sprint capacity and UXR availability in week 1 before committing to this timeline. | 3-4 weeks *if* gates clear |
| 2 | Revenue impact model by tier with upgrade funnel | ❌ Not started | Depends on whether tier and upgrade-event data already exists in the warehouse in queryable form. **Gate:** Analytics team confirms data availability and allocates ≤1 analyst-week. | 1-2 weeks *if* data exists |
| 3 | At least one controlled retention experiment result | ❌ Not started | Requires experiment infrastructure, sample size availability, and 60-day observation window. Not on the critical path for the initial decision. | 8-10 weeks |
| 4 | CFO confirmation on target flexibility | ❌ Not started | Requires exec calendar access. Low-effort but scheduling-dependent. **Gate:** PM or sponsor secures meeting within 1 week. | 1 week *if* meeting secured |

**Minimum viable decision point — conditional timeline:** Criteria 1, 2, and 4 *could* be met within 4-6 weeks, but this timeline is contingent on clearing the feasibility gates listed above. The first action is not evidence-gathering itself but a 1-week feasibility check to confirm that the required instrumentation capacity, data availability, and stakeholder access exist. If any gate fails, the timeline extends or the criterion must be descoped (e.g., substituting behavioral-log analysis for exit interviews if UXR bandwidth is unavailable). Criterion 3 informs *how* — the specific intervention design — and runs in parallel.

**Fail criteria — signals that would kill this initiative:**
- Casual-tier contributes <10% of revenue AND <5% upgrade rate to power tier → churn is acceptable, redirect effort
- CFO confirms zero margin flexibility AND no budget reallocation path → intervention is unfundable regardless of evidence
- Churn-cause analysis reveals >60% of churn is non-consumption (users leaving the category) → retention interventions won't work

## Recommended Next Artifact

**Immediate next step:** Feasibility gate check (week 1), then evidence-gathering sprint.

1. **This week (feasibility gates):**
   - Confirm eng sprint capacity for cancellation flow instrumentation (≤2 days of work).
   - Confirm analytics data availability for tier revenue and upgrade-funnel queries.
   - Confirm UXR or CS bandwidth for 30 exit interviews (or identify fallback: behavioral-log churn-reason inference).
   - Schedule CFO conversation on target flexibility.
   - **Checkpoint:** If ≥1 critical gate fails, reconvene to adjust evidence plan scope before proceeding.
2. **Weeks 2-4 (evidence sprint, contingent on gates clearing):** Ship instrumented cancellation flow. Run cohort revenue analysis. Begin qualitative exit interviews.
3. **Week 4-6:** Reconvene with Decision Frame updated with evidence. Produce **v2 PRD** that either:
   - (a) Specifies a funded churn reduction program with segment targeting, success metrics, and guardrails against margin erosion, OR
   - (b) Documents the explicit decision to accept current churn rate with monitoring tripwires that re-trigger this review.
4. **Parallel (weeks 1-10):** Launch controlled CSM and win-back experiments so intervention data is available when the v2 PRD ships.

**Artifact sequence:** Feasibility Gate Check → Evidence Sprint → v2 PRD (decision-ready) → Experiment Design Doc (if intervention approved) → Metrics Dashboard Spec (monitoring regardless of decision).

**Escalation trigger:** If 90-day cohort retention drops another 2pp before evidence sprint completes, escalate to exec team for emergency intervention authorization under explicit margin-risk acceptance.
