# Churn Reduction PRD

## Problem
Churn signals are conflicting, while strategy targets still require action. Some signals may indicate acute retention issues, while others may reflect noise, segment mix, or measurement lag. Shipping a broad retention program without resolving that conflict risks optimizing the wrong failure mode.

## Goal
Reduce churn in the highest-risk, strategy-aligned customer segment by validating the true churn driver before scaling intervention.

## Non-Goals
- Launching a portfolio of retention tactics across all segments at once
- Rewriting long-term product strategy based on unverified churn signals
- Treating topline churn alone as sufficient diagnosis

## Users / Segments
- Primary: strategy-priority customer segment with meaningful revenue or strategic weight
- Secondary: adjacent segments used as comparison cohorts

## Product Requirements
1. Build a churn diagnosis layer that separates churn by segment, tenure, plan, and trigger window.
2. Define a single decision rule for prioritization: act first where churn risk and strategic value are both high.
3. Instrument a reason-coded churn taxonomy covering product fit, pricing, onboarding, support, and external factors.
4. Run one focused intervention per highest-risk hypothesis rather than parallel broad fixes.
5. Require pre/post measurement with guardrails so an intervention cannot be declared successful on anecdotal improvement.

## Proposed Approach
### Phase 1: Resolve Signal Conflict
- Reconcile churn views across billing churn, logo churn, revenue churn, voluntary vs involuntary churn, and early-life vs mature-user churn.
- Quantify which disagreement is definitional, which is segment-driven, and which is due to data latency.
- Produce one ranked hypothesis list tied to measured segment impact.

### Phase 2: Targeted Intervention
- Select the top strategy-aligned churn driver.
- Ship one intervention matched to that driver, such as onboarding repair, save offer, pricing packaging change, or lifecycle outreach.
- Limit rollout to the affected segment first.

### Phase 3: Decision Gate
- Expand only if the intervention improves retained customers or retained revenue without harming activation, margin, or strategic focus.
- Stop if results are flat, contradictory, or dependent on a non-strategic segment.

## Success Metrics
- Primary: churn reduction in the targeted strategy-priority segment
- Secondary: retained revenue, save rate, reactivation rate, and time-to-churn shift
- Guardrails: activation, support burden, gross margin, and discount dependency

## Risks
- False diagnosis from mixed churn definitions
- Local improvement in a low-value segment misread as strategic progress
- Tactics that reduce visible churn while weakening pricing or product direction

## Decision Frame
Proceed with a hypothesis-led churn program only after normalizing churn definitions and segmenting by strategic value. The decision is not whether to reduce churn in general; it is whether the company can identify one strategy-consistent churn problem worth solving now. If not, broad retention work should be deferred.

## Unknowns & Evidence Gaps
- No packet evidence identifies which churn signal is strongest or most credible.
- No segment-level churn distribution is provided.
- No evidence distinguishes voluntary, involuntary, early-life, or expansion-related churn.
- No baseline strategy target or acceptable tradeoff threshold is provided.

## Pass/Fail Readiness
- Pass if churn definitions are reconciled, target segment is named, top churn hypothesis is ranked, and one measurable intervention is selected.
- Fail if the team is still combining incompatible churn metrics, cannot isolate a segment, or proposes multiple interventions before diagnosis.

## Recommended Next Artifact
A churn-analysis brief with segmented baseline metrics, reconciled churn definitions, ranked hypotheses, and an experiment plan for the top driver.
