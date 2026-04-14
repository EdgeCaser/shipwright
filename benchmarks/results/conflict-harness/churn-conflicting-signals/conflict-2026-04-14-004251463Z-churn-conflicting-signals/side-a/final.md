# Churn Reduction PRD: Resolving Conflicting Signals

## Decision Frame

**Problem statement:** Churn metrics are sending conflicting signals relative to strategic growth targets. Specifically:

- **Signal conflict 1:** Net revenue retention (NRR) appears healthy at 105%, but logo retention has dropped from 88% to 81% over two quarters. This means expansion revenue from surviving accounts is masking accelerating customer loss.
- **Signal conflict 2:** NPS scores remain stable (42), yet support ticket volume and escalation severity have both increased 30%+. Satisfied customers on surveys are simultaneously filing more complaints — suggesting survey fatigue, selection bias, or a lagging indicator problem.
- **Signal conflict 3:** Product usage metrics show increased feature adoption breadth, but session depth (time-in-feature, workflow completion rate) is declining. Customers are trying more features but completing fewer workflows — a possible sign of confusion or poor onboarding rather than healthy exploration.

**Strategic tension:** Leadership targets assume 90%+ logo retention to fund planned acquisition-cost increases. If true logo retention is 81% and declining, the growth model breaks — CAC payback extends beyond 18 months and LTV/CAC falls below the 3:1 threshold.

**Decision this PRD enables:** Should we (a) invest in retention intervention now based on the pessimistic signal interpretation, (b) invest in signal clarification first to avoid misallocating resources, or (c) run both in parallel with a phase gate?

**Recommendation:** Option (c) — parallel tracks with a 6-week phase gate — but with explicit cost bounds and kill conditions on Track 2 interventions to prevent resource drain before signal clarity is achieved.

## Unknowns & Evidence Gaps

| # | Unknown | Why It Matters | Current Evidence | What Would Resolve It | Priority |
|---|---------|---------------|-----------------|----------------------|----------|
| U1 | Is logo churn concentrated in a specific segment (size, industry, cohort)? | Targeted intervention vs. broad program design | None — churn reporting is aggregate only | Cohort analysis by segment, vintage, and plan tier | **Critical** |
| U2 | Are NPS respondents representative of the full customer base? | If non-responders churn at higher rates, NPS is a false floor | Response rate is ~22%, no non-responder churn correlation | Cross-reference NPS response status with churn outcomes over last 4 quarters | **Critical** |
| U3 | What is driving the usage breadth-up / depth-down pattern? | Determines whether the fix is onboarding, UX, or feature quality | Aggregate product analytics only; no qualitative interviews | 15-20 customer interviews segmented by usage pattern; funnel analysis per top-10 workflows | **High** |
| U4 | What does the competitive landscape look like for churned accounts? | Win/loss data determines if churn is push (our problem) or pull (market shift) | No systematic win/loss process exists | Implement exit surveys + conduct 10 churned-customer interviews | **High** |
| U5 | Is expansion revenue sustainable or concentrated in a few accounts? | If NRR depends on <10% of accounts expanding, the metric is fragile | Unknown — revenue expansion not broken out by account count | Expansion revenue distribution analysis (Gini coefficient of account-level expansion) | **Medium** |
| U6 | What is the actual cost and capacity impact of Track 2 interventions? | Without cost bounds, "low-risk" interventions may consume scarce analytics/CX capacity needed for Track 1 signal clarification | No resource utilization baseline for analytics or CX teams | Capacity audit of analytics and CX teams before launch; explicit hour budgets per intervention | **High** |

## Proposed Solution: Parallel-Track Churn Program

### Track 1: Signal Clarification (Weeks 1–6)

**Objective:** Close the top 3 evidence gaps (U1, U2, U4) to determine whether the pessimistic or optimistic signal interpretation is correct.

- **Deliverable 1.1:** Cohort churn analysis segmented by ARR band, industry, acquisition cohort, and plan tier. Owner: Analytics. Deadline: Week 2.
- **Deliverable 1.2:** NPS responder vs. non-responder churn correlation study. Owner: CX Research. Deadline: Week 3.
- **Deliverable 1.3:** Churned customer exit interviews (minimum 10). Owner: CX Research + CSM team. Deadline: Week 5.
- **Deliverable 1.4:** Expansion revenue concentration analysis. Owner: Finance/Analytics. Deadline: Week 3.

**Track 1 has resource priority over Track 2.** If capacity conflicts arise, Track 1 deliverables take precedence because signal clarity determines whether Track 2 interventions are correctly aimed.

### Track 2: Bounded Retention Interventions (Weeks 1–6)

**Objective:** Deploy interventions with high expected value across signal interpretations, subject to explicit cost caps and failure conditions.

- **Intervention 2.1:** Health score early warning system — combine usage depth decline + support escalation signals into a composite risk score surfaced to CSMs.
  - **Cost bound:** ≤40 engineering hours for MVP; manual scoring acceptable in Week 1–2 before automation.
  - **Failure mode to monitor:** Alert fatigue — if >30% of flagged accounts receive no CSM follow-up within 48 hours, the alert volume exceeds capacity and must be throttled or the threshold raised.
  - **Kill condition:** If cohort analysis (Deliverable 1.1) reveals churn is concentrated in a segment not covered by the health score inputs, pause and redesign scoring for the affected segment.

- **Intervention 2.2:** Workflow completion audit — identify the top 5 workflows with the steepest completion-rate declines and fix UX blockers.
  - **Cost bound:** ≤1 design sprint (5 days) for audit + fix recommendations; implementation deferred to post-phase-gate unless fixes are trivial (<4 hours each).
  - **Failure mode to monitor:** If workflow completion declines are driven by intentional user behavior changes (e.g., customers shifting to API usage), UX fixes address the wrong problem.

- **Intervention 2.3:** At-risk account playbook — create a standardized CSM intervention sequence for accounts flagged by the health score.
  - **Cost bound:** ≤20 hours CSM leadership time for playbook design; pilot on 15 accounts before broader rollout.
  - **Failure mode to monitor:** If CSMs report that playbook steps feel mismatched to actual customer conversations (i.e., the risk signals don't correlate with expressed customer concerns), the playbook is built on the wrong signal interpretation.
  - **Decision threshold:** If pilot save rate on the 15 accounts is <10% (i.e., fewer than 2 accounts show measurable engagement improvement), escalate to phase gate review rather than continuing rollout.

**Aggregate Track 2 capacity constraint:** Total Track 2 effort must not exceed 25% of analytics and CX team capacity during Weeks 1–6. If Track 1 deliverables slip due to resource contention, Track 2 interventions are paused until Track 1 is back on schedule.

### Phase Gate (Week 6)

At Week 6, Track 1 findings determine Track 2 expansion:

- **If churn is segment-concentrated:** Design targeted save programs for the affected segments. Reallocate broad retention spend to segment-specific interventions.
- **If churn is broad-based:** Escalate to executive review. The growth model assumptions need revision before further acquisition investment.
- **If NPS is masking true sentiment:** Redesign the feedback loop (consider in-app micro-surveys, support-ticket-triggered CSAT, or relationship NPS replacement).
- **If Track 2 pilot data conflicts with Track 1 findings:** Sunset misaligned interventions rather than continuing them on momentum.

## Pass/Fail Readiness

| Criterion | Status | Rationale |
|-----------|--------|-----------|
| Problem clearly defined | **PASS** | Three specific signal conflicts identified with quantified metrics |
| Evidence sufficient for full commitment | **FAIL** | Critical unknowns U1 and U2 unresolved — cannot confidently size the problem or target interventions |
| Low-risk interventions identified with cost bounds | **PASS** | Track 2 interventions have explicit hour caps, failure modes, kill conditions, and a 25% capacity ceiling |
| Resource ask justified | **CONDITIONAL** | Track 1 (signal clarification) is justified now; Track 2 expansion depends on Week 6 findings |
| Strategic alignment confirmed | **FAIL** | Growth model assumes 90% logo retention; if true rate is 81%, strategy needs revision before this PRD's scope can be finalized |
| Intervention risk mitigated | **PASS** | Alert fatigue, capacity contention, and signal mismatch explicitly identified as failure modes with monitoring thresholds |

**Overall readiness: NOT READY for full program commitment. READY for parallel-track approach with phase gate and bounded Track 2 interventions.**

The conflicting signals are themselves the strongest argument against committing to a large retention program now — we risk building the wrong intervention for the wrong segment. But the signals are also too alarming to ignore while we gather data. The parallel-track structure resolves this tension, and the explicit cost bounds and kill conditions on Track 2 prevent the "low-risk" interventions from becoming an unmonitored resource drain.

## Recommended Next Artifact

1. **Churn Cohort Analysis Dashboard** (Analytics, Week 2) — resolves U1 and U5, determines whether this is a segment problem or a platform problem.
2. **Customer Exit Interview Synthesis** (CX Research, Week 5) — resolves U4, provides qualitative grounding for quantitative patterns.
3. **Revised Growth Model Scenarios** (Finance/Strategy, Week 6) — three scenarios (optimistic, base, pessimistic) with updated logo retention assumptions feeding into H2 planning.
4. **Phase Gate Decision Brief** (PM, Week 6) — synthesizes Track 1 findings and Track 2 pilot results into a go/no-go recommendation for Track 2 expansion, with specific intervention designs if go.

The most important next artifact is **#1 (Churn Cohort Analysis)** because it determines whether every subsequent decision is targeted or broad — the single highest-leverage unknown to resolve.
