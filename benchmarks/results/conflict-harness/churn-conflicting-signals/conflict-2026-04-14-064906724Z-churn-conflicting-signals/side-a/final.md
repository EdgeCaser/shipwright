# Churn Reduction PRD: Resolving Conflicting Signals

## Decision Frame

**Problem Statement:** Churn metrics are sending conflicting signals relative to strategic growth targets. Monthly logo churn has increased 18% QoQ while NRR remains above 105%, suggesting we are losing smaller accounts but expanding within retained ones. The strategic plan targets 30% net-new ARR growth, which creates tension: aggressive acquisition spending may be masking a retention problem that compounds over time.

**Decision Required:** Should the product team prioritize churn reduction (defensive) or continue prioritizing features that drive expansion and acquisition (offensive), given that the two signal sets point in opposite directions?

**Stakeholders:** VP Product, VP Customer Success, CFO, Growth Lead

**Time Horizon:** Decision needed within 2 weeks; implementation roadmap spans Q3-Q4.

**Key Tension:** Logo churn rising signals dissatisfaction in the long tail of accounts. NRR holding signals the product delivers value to power users. Growth targets assume continued acquisition efficiency, but rising churn increases CAC payback period and erodes the denominator of every efficiency metric.

### Signal Conflict Matrix

| Signal | Direction | Implication | Confidence |
|---|---|---|---|
| Logo churn rate (monthly) | Rising (+18% QoQ) | Small/mid accounts churning faster | Medium — need cohort decomposition |
| Net Revenue Retention | Stable (105%+) | Expansion in retained accounts offsets losses | High |
| NPS (overall) | Flat (42) | No aggregate sentiment shift | Low — masks segment divergence |
| NPS (accounts < $10K ARR) | Declining (38 → 31) | Long-tail dissatisfaction concentrated | Medium |
| Support ticket volume | Rising (+22%) | More friction in onboarding or core workflows | Medium |
| Feature adoption (new releases) | Strong (65%+ in top tier) | Power users engaged | High |
| Time-to-value (new accounts) | Lengthening (+4 days median) | Onboarding friction growing | Medium |

### Why Signals Conflict

1. **Survivorship bias in NRR:** NRR only measures accounts that stay. If departing accounts are systematically smaller, NRR looks healthy while the customer base narrows.
2. **Growth masking:** Net-new logos replace churned ones in topline metrics, hiding the leak.
3. **Segment divergence:** Product investment has favored enterprise features, creating a value gap for SMB/mid-market.

## Unknowns & Evidence Gaps

### Critical Unknowns

1. **Churn reason decomposition:** We lack structured exit interview data. Current churn reasons are self-reported dropdown (unreliable). We do not know whether churn is driven by product gaps, pricing, competitive loss, or business closure.
   - **Required evidence:** Structured churn interviews (n≥30) across last-90-day churned accounts, segmented by ARR band.
   - **Owner:** Customer Success
   - **Timeline:** 3 weeks

2. **Cohort-level retention curves:** We report blended churn. We do not have cohort retention curves by signup quarter, plan tier, or acquisition channel. Without these, we cannot determine if churn is worsening in recent cohorts (acquisition quality problem) or stable cohorts (product problem).
   - **Required evidence:** Cohort retention analysis with 6-month lookback, segmented by tier and channel.
   - **Owner:** Data/Analytics
   - **Timeline:** 1 week

3. **Competitive displacement rate:** Support tickets reference competitor names, but we have no systematic competitive loss tracking. If churn is competitive, the intervention is different (feature parity) vs. if it is friction-driven (onboarding/UX).
   - **Required evidence:** Win/loss analysis on churned accounts, cross-referenced with competitive mentions in support and sales notes.
   - **Owner:** Product Marketing
   - **Timeline:** 2 weeks

4. **Expansion ceiling:** NRR stability assumes expansion headroom persists. If top-tier accounts approach contract caps or budget limits, NRR will compress, removing the mask on logo churn.
   - **Required evidence:** Expansion pipeline forecast and whitespace analysis for top-50 accounts.
   - **Owner:** Account Management
   - **Timeline:** 2 weeks

5. **Onboarding drop-off funnel:** Time-to-value is lengthening but we lack a step-by-step onboarding funnel to identify where users stall.
   - **Required evidence:** Instrumented onboarding funnel with step-level completion rates.
   - **Owner:** Product/Engineering
   - **Timeline:** 2 weeks to instrument, 4 weeks for meaningful data

### Known Constraints

- Engineering capacity is committed 70% to Q3 roadmap features aligned with growth targets. Any churn intervention competes for the remaining 30%.
- Customer Success team is staffed for current account load; structured interviews require temporary reallocation or contractor support.
- No budget allocated for churn-specific tooling (e.g., predictive churn models, health scoring platform).

## Pass/Fail Readiness

**Verdict: NOT READY to commit to a specific churn reduction initiative.**

### Readiness Assessment

| Criterion | Status | Blocker? |
|---|---|---|
| Root cause identified | No — signals conflict, no causal decomposition | YES |
| Segment isolation | Partial — know it is long-tail, but not why | YES |
| Intervention hypothesis testable | No — cannot design intervention without cause | YES |
| Resource plan viable | Unknown — depends on scope of intervention | Conditional |
| Success metric defined | Partially — logo churn rate is lagging indicator, need leading indicators | Conditional |
| Stakeholder alignment | No — growth vs. retention tension unresolved at exec level | YES |

### What Would Make This Ready

1. Complete the churn reason decomposition (Unknown #1) — this gates everything.
2. Deliver cohort retention curves (Unknown #2) — determines if this is a new-cohort or existing-cohort problem.
3. Exec alignment on growth-vs-retention resource allocation — cannot ship a churn PRD without capacity commitment.

### Candidate Low-Regret Actions

Even before full evidence, several low-regret actions could be pursued in parallel with the research sprint. These are ranked by cost and confidence, not presented as singular recommendations, because **we lack the evidence to identify which action has the highest expected value:**

| Action | Est. Engineering Cost | Serves Growth? | Serves Retention? | Evidence Dependency | Confidence |
|---|---|---|---|---|---|
| Onboarding funnel instrumentation | ~2 eng-weeks to instrument; 4 additional weeks before meaningful data | Yes (reduces time-to-value for new accounts) | Yes (identifies friction that may drive early churn) | None — observational, no intervention risk | Medium — time-to-value is lengthening, but we have not established onboarding as a top churn driver |
| Segment-level NPS pulse survey (< $10K ARR) | Minimal (CS-led, no eng work) | Indirect | Yes (surfaces dissatisfaction themes faster than interviews) | None | Medium |
| Support ticket categorization audit | Minimal (1 analyst-week) | Indirect | Yes (may surface competitive or friction themes) | None | Medium |
| Cohort retention dashboard (Unknown #2) | ~1 eng-week | Yes (acquisition quality signal) | Yes (retention curve visibility) | None — uses existing data | High |

Onboarding instrumentation remains a strong candidate because it produces data regardless of root cause direction, but calling it "the one safe intervention" overstates our confidence. The cohort retention dashboard is cheaper, faster, and directly resolves a critical unknown. The right move is to pursue the lowest-cost actions in parallel rather than betting on a single pre-diagnosis intervention.

## Recommended Next Artifact

### Immediate (Week 1-2)
1. **Discovery Brief:** Commission the five evidence-gathering workstreams above. Define owners, timelines, and output formats. This is a research sprint, not a product sprint.
2. **Low-Regret Action Selection:** From the candidate table above, select actions that fit within available capacity. Prioritize the cohort retention dashboard (1 eng-week, resolves Unknown #2 directly) and onboarding instrumentation (2 eng-weeks, produces diagnostic data) if the 30% uncommitted engineering capacity permits both.

### After Evidence Returns (Week 3-5)
3. **Churn Diagnosis Report:** Synthesize findings from the five workstreams into a single document that resolves the signal conflicts. This replaces speculation with data.
4. **Revised PRD:** With diagnosis in hand, write a properly scoped churn reduction PRD with specific interventions, measurable outcomes, and resource requirements.
5. **Resource Allocation Decision Memo:** Present the growth-vs-retention tradeoff to exec team with scenario modeling (e.g., "if we redirect 20% of roadmap capacity to retention, expected impact on logo churn vs. net-new ARR").

### Leading Indicators to Track Immediately
- Weekly logo churn by ARR band (not blended)
- Onboarding completion rate (once instrumented)
- Support ticket volume by category
- Days-to-first-value for new accounts
- NPS by segment (quarterly → monthly cadence for < $10K ARR band)
