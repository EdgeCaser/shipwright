# Churn Reduction PRD: Conflicting Signals Edition

**Status:** Draft — Awaiting Signal Reconciliation
**Owner:** PM
**Last Updated:** 2026-04-15

---

## Decision Frame

### Problem Statement
Churn is elevated, but the diagnostic signals contradict each other and conflict with stated strategy targets. We face a compound problem: we do not yet know *why* customers are leaving, and we have strategic commitments that may be incompatible with the remedies implied by our partial evidence.

This PRD does not commit to a solution. It frames the decision space, surfaces the conflicts explicitly, and specifies what must be resolved before build work begins.

### Conflicting Signals Summary

| Signal | Source | Implied Cause | Strategic Conflict |
|--------|--------|---------------|--------------------|
| Churn spikes in month 2-3 | Cohort retention data | Onboarding failure / value gap | Growth target requires faster activation, which may worsen depth |
| High churn among power-feature users | Support ticket tagging | Feature regression or reliability | Roadmap de-prioritizes infra work for 2 quarters |
| Price-sensitivity exits in survey | Exit survey (n=214) | Pricing mismatch | Pricing team froze changes pending rebrand |
| NPS stable despite churn increase | NPS survey (n=1,800) | Churners not captured in NPS sample; or churn is predictive, not reactive | Creates false signal of health at exec level |

### Strategic Targets in Conflict
- **Target A:** Reduce net churn from 4.2% to 2.5% MoM within 2 quarters
- **Target B:** Maintain 15% MoM new logo growth (funnel volume)
- **Target C:** Ship 3 major new features per quarter (roadmap commitment)

**Core tension:** The leading candidate interventions (deeper onboarding, reliability fixes, pricing flexibility) each consume capacity or contradict one of A, B, or C. We cannot pursue all three targets simultaneously with current team size without a prioritization ruling.

### Decision Required
Before any churn reduction initiative is scoped, an exec-level ruling is needed on:
1. Which target is primary if they conflict? (Net churn rate vs. new logo growth vs. feature velocity)
2. Is the NPS gap a measurement problem or a real signal of health? (Determines urgency tier)
3. Are any of the three conflicting levers (onboarding, infra, pricing) off the table?

**Without this ruling, engineering capacity will be allocated to whichever PM argues loudest — not to the highest-leverage intervention.**

---

## Unknowns & Evidence Gaps

### Critical Unknowns (Block Launch)

**U1 — Churn cause is not isolated**
We have four conflicting hypotheses. Each implies a different fix. Building without isolation risks shipping the wrong solution at scale.
- *Gap:* No controlled analysis linking specific behaviors to churn outcome
- *Needed:* Survival analysis on behavioral event data (activation milestones, feature usage depth, support contact) segmented by cohort and plan tier
- *Owner:* Data / Analytics
- *Effort:* 1-2 weeks

**U2 — NPS sample bias unconfirmed**
If churned users are systematically excluded from NPS surveys (e.g., survey sent post-cancel with low response rate), stable NPS is a lagging artifact, not a health signal.
- *Gap:* No cross-tabulation of NPS respondents vs. churn cohort membership
- *Needed:* Respondent-level join of NPS dataset and churn event log
- *Owner:* Data
- *Effort:* 3 days

**U3 — Exit survey representativeness unknown**
Exit survey n=214 with unknown response rate. If only vocal detractors respond, price-sensitivity hypothesis is inflated.
- *Gap:* No denominator (total churned users in survey window)
- *Needed:* Response rate calculation; non-responder sampling or passive exit-intent instrumentation
- *Owner:* Research / PM
- *Effort:* 1 week

### Important Unknowns (Inform Scope)

**U4 — Segmentation of churn by ICP fit**
Are churning users within ICP or outside? High churn among out-of-ICP users may be acceptable; high churn among core ICP is a product-market fit signal.
- *Needed:* CRM-to-product join with ICP scoring

**U5 — Churn velocity trend**
Is 4.2% a new baseline or a spike? Trend direction changes intervention urgency.
- *Needed:* 12-month rolling churn rate with confidence intervals

**U6 — Competitive displacement rate**
How much churn is competitive loss vs. disengagement vs. budget cuts? Conflating these leads to wrong fixes.
- *Needed:* Win/loss data from sales + expanded exit survey categorization

---

## Pass/Fail Readiness

### Readiness Gates

This initiative is **NOT ready to enter build** until the following gates pass:

| Gate | Criterion | Status | Owner | Due |
|------|-----------|--------|-------|-----|
| G1 | Survival analysis complete; primary churn cause identified with ≥70% behavioral signal confidence | OPEN | Data | +2 weeks |
| G2 | NPS sample bias confirmed or ruled out | OPEN | Data | +3 days |
| G3 | Exec prioritization ruling on conflicting targets | OPEN | CEO / CPO | +1 week |
| G4 | Exit survey response rate calculated; hypothesis confidence reassessed | OPEN | PM | +1 week |
| G5 | ICP-segmented churn breakdown available | OPEN | Data + Sales | +2 weeks |

**Current Gate Status: 0/5 PASS**

All five gates must pass before PRD moves to solution definition. Attempting to scope features before G1 and G3 close is the highest-risk failure mode for this initiative.

### What Happens If We Skip Gates
- **Skip G1:** We build onboarding improvements while the real driver is reliability — low impact, wasted quarter
- **Skip G3:** Teams self-prioritize; targets collide in Q execution; churn worsens due to half-measures
- **Skip G2:** Leadership believes NPS health signal is real; urgency is deprioritized; churn continues unaddressed

---

## Recommended Next Artifact

**Do not write a solution PRD next.**

The correct next artifact is a **Churn Signal Reconciliation Brief** — a 2-page analysis deliverable (not a PRD) that:

1. Closes U1 and U2 with data team (2-week sprint)
2. Presents the reconciled hypothesis to exec for G3 ruling
3. Returns a single prioritized churn cause with confidence level and affected segment

Only after that brief is approved does a solution-scoped PRD make sense.

**Artifact owner:** PM + Data lead
**Target delivery:** 2026-04-29
**Format:** Memo, not PRD — avoids premature commitment to scope

### Branching Paths After Reconciliation

Depending on what the brief reveals, the initiative will fork into one of:

- **Path A (Onboarding gap confirmed):** PRD for activation milestone redesign + time-to-value instrumentation
- **Path B (Reliability confirmed):** Escalation memo to CPO for roadmap trade-off; infra spike scoped separately
- **Path C (Pricing confirmed):** Pricing strategy workshop; PRD deferred until pricing freeze lifted
- **Path D (Multi-causal / segment-specific):** Segment-gated rollout PRD with ICP-first intervention ordering

---

## Appendix: Signal Conflict Log

This section records the conflict and the reasoning for deferral, so future readers understand why this PRD reached a gate-check conclusion rather than a solution scope.

- Behavioral data implies onboarding failure (month 2-3 spike)
- Support data implies reliability failure (power-user churn)
- Survey data implies pricing failure (exit interviews)
- NPS data implies no failure (stable scores)

Three of four signals point to product problems. One (NPS) points to health. The NPS signal is structurally suspect (sample bias risk). The three problem signals do not agree on root cause. The strategic targets (growth, velocity, churn rate) are in tension with all leading remedies.

**A PRD that ignores this conflict and proceeds to solution definition is not a decision-useful document. It is theater.**

This PRD's value is in making the conflict legible and the gates explicit — not in proposing a fix before the evidence warrants one.
