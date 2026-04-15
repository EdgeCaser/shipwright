# Churn Reduction PRD: Conflicting Signals Edition

**Status:** Draft — Awaiting Signal Reconciliation
**Owner:** PM
**Last Updated:** 2026-04-15

---

## Decision Frame

### Problem Statement
Churn is elevated, but the diagnostic signals are unreconciled across segments, time windows, and plan tiers. We cannot determine which cause is primary or which population to intervene on first. We also face strategic commitments that conflict with all leading candidate remedies.

This PRD does not commit to a solution. It frames the decision space, surfaces the signal gaps explicitly, and specifies what must be resolved before build work is prioritized.

### Unreconciled Signals Summary

| Signal | Source | Implied Cause | What's Missing |
|--------|--------|---------------|----------------|
| Churn spikes in month 2-3 | Cohort retention data | Onboarding failure / value gap | No segment or plan-tier breakdown; may overlap with other signals |
| High churn among power-feature users | Support ticket tagging | Feature regression or reliability | Unknown incidence rate vs. total churned population |
| Price-sensitivity exits in survey | Exit survey (n=214) | Pricing mismatch | Response rate unknown; may skew toward vocal detractors |
| NPS stable despite churn increase | NPS survey (n=1,800) | Lagging artifact or sample bias (churners likely underrepresented) | No cross-tab of NPS respondents vs. churn cohort membership |

**Key framing shift from draft:** These signals are not necessarily contradictory — month-2/3 drop, power-user reliability pain, and price-sensitivity exits can coexist across different segments or lifecycle stages. The problem is that we have no overlap analysis, no shared population, and no incidence rates. We cannot determine which cause accounts for what share of the 4.2% churn rate, which means we cannot prioritize interventions or sequence a roadmap.

### Strategic Targets in Conflict
- **Target A:** Reduce net churn from 4.2% to 2.5% MoM within 2 quarters
- **Target B:** Maintain 15% MoM new logo growth (funnel volume)
- **Target C:** Ship 3 major new features per quarter (roadmap commitment)

**Core tension:** The leading candidate interventions (deeper onboarding, reliability fixes, pricing flexibility) each consume capacity or contradict one of A, B, or C. Capacity allocation without a prioritization ruling defaults to whichever PM argues loudest — not highest leverage.

### Decision Required
Before any churn reduction initiative is scoped, the following rulings are needed:
1. Which target is primary when they conflict? (Net churn rate vs. new logo growth vs. feature velocity)
2. Is the NPS gap a measurement problem or a real signal? (Determines urgency tier)
3. Which of the three candidate levers (onboarding, infra, pricing) is in-scope given roadmap and pricing-freeze constraints?

---

## Unknowns & Evidence Gaps

### Critical Unknowns (Block Prioritized Scoping)

**U1 — Churn cause incidence is unquantified across segments**
The signals may each be real — but we do not know their relative contribution to overall churn. Without a survival analysis linking behavioral events to churn outcome, segmented by cohort and plan tier, we cannot rank interventions by expected impact.
- *Gap:* No behavioral event analysis; no segment-level churn share attribution
- *Needed:* Survival analysis on activation milestones, feature depth, support contact — segmented by cohort and plan tier
- *Owner:* Data / Analytics
- *Effort:* 1-2 weeks

**U2 — NPS sample bias unconfirmed**
If churned users are systematically excluded from NPS surveys, stable NPS is a lagging artifact. But this is an assumption — it must be confirmed or ruled out before exec-level urgency is calibrated.
- *Gap:* No cross-tabulation of NPS respondents vs. churn event log
- *Needed:* Respondent-level join of NPS dataset and churn events
- *Owner:* Data
- *Effort:* 3 days

**U3 — Exit survey response rate and representativeness unknown**
Exit survey n=214 with unknown denominator. If vocal detractors are overrepresented, the price-sensitivity hypothesis is inflated relative to its true incidence.
- *Gap:* No denominator; no non-responder sampling
- *Needed:* Response rate calculation; passive exit-intent instrumentation or non-responder sample
- *Owner:* Research / PM
- *Effort:* 1 week

### Important Unknowns (Inform Scope)

**U4 — ICP-fit segmentation of churn**
High churn among out-of-ICP users may be acceptable; high churn among core ICP is a product-market fit signal requiring different urgency.
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

This initiative is **NOT ready to enter prioritized build scoping** until the following gates pass:

| Gate | Criterion | Status | Owner | Due |
|------|-----------|--------|-------|-----|
| G1 | Survival analysis complete; primary churn cause and its segment-level share identified | OPEN | Data | +2 weeks |
| G2 | NPS sample bias confirmed or ruled out | OPEN | Data | +3 days |
| G3 | Exec prioritization ruling on conflicting targets | OPEN | CEO / CPO | +1 week |
| G4 | Exit survey response rate calculated; hypothesis confidence reassessed | OPEN | PM | +1 week |
| G5 | ICP-segmented churn breakdown available | OPEN | Data + Sales | +2 weeks |

**Current Gate Status: 0/5 PASS**

**Note on narrow-scope exception:** If G2 closes quickly (3 days) and NPS bias is confirmed, a fast-follow exec memo on measurement integrity can proceed before G1 completes. Similarly, a narrow intervention targeting only the month-2/3 cohort (if G1 reveals high share concentration there) could be scoped before all gates close. The gates block *full-initiative* scoping, not every possible parallel workstream.

### What Happens If We Skip Gates
- **Skip G1:** We build onboarding improvements while the dominant driver is reliability — low impact, wasted quarter. Or we build reliability fixes while dominant driver is pricing — same outcome.
- **Skip G3:** Teams self-prioritize; targets collide in Q execution; half-measures across all three levers yield no target achieved
- **Skip G2:** Leadership accepts NPS stability as a health signal; urgency is deprioritized; churn continues unaddressed

---

## Recommended Next Artifact

**Do not write a solution PRD next.**

The correct next artifact is a **Churn Signal Reconciliation Brief** — a 2-page analysis deliverable (not a PRD) that:

1. Closes U1 and U2 with data team (2-week sprint)
2. Presents the reconciled hypothesis — including segment-level incidence shares — to exec for G3 ruling
3. Returns a ranked list of churn causes with confidence levels and affected segment sizes

Only after that brief is approved does a solution-scoped PRD make sense. The brief may reveal that multiple causes are real and addressable in parallel — in which case the subsequent PRD becomes a segment-gated rollout plan, not a single-hypothesis feature spec.

**Artifact owner:** PM + Data lead
**Target delivery:** 2026-04-29
**Format:** Memo, not PRD — avoids premature commitment to scope

### Branching Paths After Reconciliation

- **Path A (Onboarding gap dominant):** PRD for activation milestone redesign + time-to-value instrumentation
- **Path B (Reliability dominant):** Escalation memo to CPO for roadmap trade-off; infra spike scoped separately
- **Path C (Pricing dominant):** Pricing strategy workshop; PRD deferred until pricing freeze lifted
- **Path D (Multi-causal / segment-specific):** Segment-gated rollout PRD with ICP-first intervention ordering — each cause addressed for its identified segment without waiting for full signal convergence

---

## Appendix: Signal Conflict Log

This section records the reasoning for deferral so future readers understand why this PRD reached a gate-check conclusion rather than a solution scope.

The four signals may each describe real phenomena — likely affecting different segments or lifecycle stages. The problem is not that they cancel each other out; it is that without overlap analysis and incidence rates, we cannot rank them by impact. Prioritizing onboarding (month-2/3 signal) when reliability accounts for 60% of churned ARR is a category error, even if the onboarding signal is also real.

The NPS signal is structurally suspect (sample bias risk) and does not contradict the others so much as it creates a false executive-level impression of health that could suppress urgency.

**A PRD that proceeds to solution definition without knowing which cause accounts for what share of churn is not a decision-useful document. It is an intervention lottery.**

This PRD's value is in making the signal gaps legible, the incidence question explicit, and the gates clear — not in proposing a fix before the evidence warrants prioritization.
