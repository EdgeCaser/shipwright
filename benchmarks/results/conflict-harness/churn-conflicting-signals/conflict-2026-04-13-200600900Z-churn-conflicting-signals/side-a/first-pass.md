# Churn Reduction PRD: Navigating Conflicting Signals

## Decision Frame

**Problem statement:** Customer churn metrics are sending conflicting signals relative to strategic growth targets. Specifically:

- **Signal conflict 1:** NPS scores remain stable or improving while monthly churn rate is increasing — suggesting satisfied customers are still leaving.
- **Signal conflict 2:** Expansion revenue from retained accounts is hitting targets, masking the volume of churning small/mid-market accounts in aggregate revenue reporting.
- **Signal conflict 3:** Product usage telemetry shows increased feature adoption among churning cohorts in the 30 days before cancellation — contradicting the assumption that churn correlates with disengagement.

**Decision to be made:** Whether to (a) prioritize retention interventions targeting the conflicting-signal cohorts, (b) re-instrument our churn measurement framework before acting, or (c) accept current churn as a natural consequence of strategic upmarket repositioning.

**Who decides:** VP Product + VP Customer Success, with CFO sign-off if intervention budget exceeds $200K/quarter.

**Decision deadline:** End of Q3 2026 planning cycle (June 30, 2026).

**Reversibility:** Option (a) is reversible — interventions can be paused. Option (b) delays action by 4-6 weeks but improves future decisions. Option (c) is a framing decision that may be difficult to reverse once organizational attention shifts.

---

## Unknowns & Evidence Gaps

| # | Unknown | Impact if unresolved | Proposed resolution | Cost/time |
|---|---------|---------------------|---------------------|-----------|
| U1 | Why are NPS-positive customers churning? Exit interviews cover <15% of churning accounts. | We intervene on wrong drivers, waste budget. | Structured exit survey with incentive, targeting 50%+ response rate over 6 weeks. | $15K + 6 weeks |
| U2 | Is the pre-churn usage spike a "download my data" pattern or genuine engagement? | Misread of usage telemetry leads to wrong segmentation. | Event-level audit of top 20 churned accounts' final-30-day activity. | Engineering time: 2 weeks |
| U3 | What is the actual revenue-weighted churn rate when expansion is excluded? | Leadership may be making strategy decisions on a misleading topline number. | Finance builds a gross-churn dashboard excluding expansion, segmented by cohort. | 1 week with existing BI tooling |
| U4 | Are churning SMB accounts unprofitable (i.e., strategic churn we should accept)? | We may invest in retaining accounts that drag down unit economics. | Unit economics analysis per segment tier. | Finance: 2 weeks |
| U5 | Do churning customers have a viable alternative, or are they eliminating the category? | Determines whether this is competitive loss or budget loss — different interventions. | Win/loss analysis + competitive intelligence on top 30 churned accounts. | CS team: 3 weeks |

**Key tension:** The strategy team has set aggressive upmarket targets. If SMB churn is a *consequence* of deliberate upmarket repositioning (pricing changes, feature prioritization, support tier restructuring), then "reducing churn" may conflict with "executing the strategy." This must be resolved explicitly, not papered over.

---

## Pass/Fail Readiness

**Readiness verdict: NOT READY to commit to a retention intervention.**

Rationale:

| Criterion | Status | Detail |
|-----------|--------|--------|
| Root cause identified | FAIL | Three plausible root causes, no evidence to rank them. |
| Signal alignment | FAIL | Core metrics (NPS, usage, revenue) contradict each other — measurement framework may be broken. |
| Strategic alignment confirmed | FAIL | No explicit decision on whether SMB churn is acceptable under current strategy. |
| Intervention ROI modeled | FAIL | Cannot model ROI without knowing which cohort to target or why they leave. |
| Stakeholder alignment | FAIL | Product, CS, and Finance are likely operating on different churn numbers due to expansion-masking. |

**What must be true before we proceed:**
1. U3 resolved — leadership sees gross churn excluding expansion.
2. U4 resolved — explicit strategic call on whether SMB churn is acceptable.
3. U1 or U2 partially resolved — at least directional evidence on *why* signal-positive customers churn.

---

## Recommended Next Artifact

**Next artifact: Churn Signal Reconciliation Brief (diagnostic, not solution)**

Before writing a prescriptive PRD with retention features or interventions, the organization needs a shared factual foundation. The recommended next step is:

1. **Churn Measurement Audit** (1 week) — Finance and BI produce the gross-churn-excluding-expansion dashboard (resolves U3).
2. **Strategic Alignment Check** (1 meeting) — VP Product and CFO explicitly decide: is SMB churn acceptable under current strategy? Document the answer (resolves U4 framing).
3. **Evidence Sprint** (4 weeks, parallel) — Run the exit survey (U1) and usage audit (U2) simultaneously.
4. **Reconciliation Brief** — Synthesize findings into a 2-page brief that states: here is what is actually happening, here is why, here is what it costs us, and here is whether it conflicts with strategy.

**Only after the Reconciliation Brief** should a prescriptive Churn Reduction PRD be written — at that point, it will have real evidence to anchor interventions, a clear strategic mandate, and aligned metrics.

**Risk of skipping this step:** Building retention features or launching save-motion plays against the wrong cohort, for the wrong reasons, potentially *in opposition to* the company's own strategic direction. The conflicting signals are telling us we don't understand the problem yet — acting before understanding is the highest-cost option.
