# Churn Reduction PRD: Navigating Conflicting Signals

## Decision Frame

**Problem Statement:** Monthly churn has risen from 4.2% to 6.1% over the past two quarters, but the signals driving this increase conflict with current strategy targets. Specifically:

- **Signal A (Usage data):** Power users (top 20% by session frequency) show *increased* engagement (+18% DAU) but *higher* churn (+1.4pp vs. baseline). This contradicts the assumption that engagement correlates with retention.
- **Signal B (NPS/survey data):** Detractors cite "too many changes" and "feature bloat" as top complaints, yet strategy targets call for accelerating feature velocity to hit competitive parity by Q3.
- **Signal C (Pricing signal):** Win-back campaigns at 20% discount show 38% acceptance, suggesting price sensitivity — but the strategic roadmap includes a 15% price increase to fund platform investment.

These signals cannot all be true inputs to a single coherent plan without resolving the contradictions. This PRD does NOT recommend a unified churn reduction program. Instead, it frames the decision the leadership team must make before any program can be scoped.

**Decision Required:** Which signal do we trust, and what are we willing to sacrifice?

| Option | Trusts Signal | Sacrifices | Churn Impact (est.) | Strategy Cost |
|--------|--------------|------------|---------------------|---------------|
| A: Slow feature velocity | B (NPS feedback) | Competitive parity timeline | -0.8pp over 2Q | Delays Q3 parity target by ~1Q |
| B: Hold pricing, fund via efficiency | C (price sensitivity) | Near-term margin | -0.5pp over 2Q | $2.1M margin gap vs. plan |
| C: Segment and diverge | A (usage paradox) | Unified product experience | -1.1pp over 2Q | Doubles roadmap complexity |
| D: Investigate before committing | All (insufficient confidence) | 6-8 weeks of continued elevated churn | Unknown | Delays all strategic bets |

**Recommendation:** Option D — investigate before committing. The conflicting signals suggest we do not yet understand the causal mechanism. Acting on the wrong signal risks compounding churn rather than reducing it.

## Unknowns & Evidence Gaps

### Critical Unknowns (must resolve before any intervention)

1. **Why are power users churning?** Usage is up but so is churn — are these the *same* users, or is high engagement masking a cohort split? We lack cohort-level retention curves segmented by feature adoption pattern.
   - *Evidence needed:* Cohort survival analysis by feature adoption cluster (not just frequency).
   - *Effort:* 2 weeks data science work.

2. **Is "feature bloat" a real driver or a post-hoc rationalization?** NPS detractor verbatims are notoriously poor at identifying actual behavioral causes.
   - *Evidence needed:* Correlate churn events with feature release timeline — do churn spikes follow releases, or are they calendar-correlated (billing cycles, budget reviews)?
   - *Effort:* 1 week analytics.

3. **What is the true price elasticity of the churning segment?** Win-back acceptance at 20% discount tells us price matters *after* the decision to leave, not whether price *caused* the decision.
   - *Evidence needed:* Cancellation flow survey with forced-rank trade-off (would you stay at current price with fewer features? same features at lower price? etc.).
   - *Effort:* 3 weeks to instrument, collect, and analyze.

4. **Are we measuring churn correctly?** If contract terms or billing changes shifted in the same period, the 4.2% → 6.1% increase may be a measurement artifact (e.g., annual-to-monthly migration inflates monthly churn rate without changing annual retention).
   - *Evidence needed:* Reconcile churn metric definition against billing system changes in the period.
   - *Effort:* 3 days.

5. **What are the actual cost parameters for the investigation-vs-action trade-off?** The directional case for investigation before commitment rests on a cost comparison that requires validation. Specifically, the following inputs are not yet confirmed and must be gathered during the first week of investigation:
   - Revenue base and MRR attributable to the excess churn rate (1.9pp above baseline).
   - Fully-loaded engineering cost model for a churn reduction program (team size, duration, opportunity cost of displaced roadmap work).
   - Estimated probability of selecting the wrong intervention lever given current signal ambiguity.
   - Without these inputs, the relative cost advantage of investigation over premature action is a reasonable assumption but not a demonstrated fact. The Evidence Collection Plan (see Recommended Next Artifact) includes producing this cost model in Week 1.

### Secondary Unknowns (inform program design but not the go/no-go)

6. Competitive landscape: are churned users going to a specific competitor, or lapsing from the category entirely?
7. Support ticket correlation: do churning users have higher unresolved ticket counts?
8. Onboarding vintage: is churn concentrated in recent cohorts (onboarding quality issue) or distributed (product-market fit erosion)?

## Pass/Fail Readiness

**Verdict: FAIL — Not ready to commit to a churn reduction program.**

Readiness checklist:

| Criterion | Status | Detail |
|-----------|--------|--------|
| Causal mechanism identified | ❌ FAIL | Three conflicting hypotheses, no discriminating evidence |
| Signal reliability validated | ❌ FAIL | Churn metric definition not reconciled against billing changes |
| Strategy alignment resolved | ❌ FAIL | Proposed interventions contradict active strategy targets; no executive decision on trade-offs |
| Intervention scoped with measurable outcome | ❌ FAIL | Cannot scope without resolving which signal to act on |
| Stakeholder alignment on trade-offs | ❌ FAIL | Product, Finance, and Growth have incompatible assumptions |
| Cost model for investigation vs. action validated | ❌ FAIL | Directional cost comparison asserted but not yet grounded in confirmed revenue/cost inputs |
| Downside risk bounded | ⚠️ PARTIAL | Continued elevated churn is costly but not existential in the investigation window; exact MRR impact requires revenue base confirmation |

**Why this matters:** Launching a churn reduction initiative against the wrong signal is worse than doing nothing. If power-user churn is driven by feature fatigue and we *accelerate* feature delivery to hit parity targets, we amplify the problem. If price sensitivity is the true driver and we raise prices, we accelerate exodus. The directional case for investigation first is strong — three mutually contradictory signals mean at least two of three possible interventions would target the wrong lever — but the precise cost comparison depends on revenue and engineering cost inputs that should be confirmed in Week 1 of the investigation phase.

## Recommended Next Artifact

**Next artifact: Evidence Collection Plan (research brief)**

Before producing a program PRD, the team should produce a structured research brief that:

1. **Resolves Unknown #4 first** (3 days) — if churn measurement is artifactual, the entire urgency frame changes.
2. **Produces validated cost model** (Unknown #5, Week 1 parallel with #4) — confirm the MRR impact of excess churn rate and engineering cost baseline so the investigation-vs-action trade-off rests on real numbers, not estimates.
3. **Runs cohort survival analysis** (Unknown #1, 2 weeks) — this is the highest-leverage investigation because it can discriminate between the three competing hypotheses.
4. **Instruments cancellation flow trade-off survey** (Unknown #3, 3 weeks parallel) — price elasticity data will be needed regardless of which option is chosen.
5. **Schedules a Decision Gate** at week 4 where leadership reviews findings and commits to Option A, B, or C with explicit trade-off acceptance.

Only after the Decision Gate should a full churn reduction PRD be authored — at that point, it will have a clear causal model, a chosen lever, and aligned stakeholders.

**Escalation trigger:** If churn accelerates beyond 7.5% monthly before the investigation completes, skip to Option C (segment and diverge) as the defensive play with the highest estimated impact, accepting the roadmap complexity cost.
