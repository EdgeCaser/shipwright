# Revised artifact

# Churn Reduction PRD

## Problem
Churn signals conflict across metric definitions and segment views, while strategy targets still require near-term action. The core product need is not perfect diagnostic certainty; it is a bounded decision system that can distinguish whether the conflict is blocking, complementary, or strategically irrelevant before the team commits retention resources.

## Goal
Reduce churn in the highest-risk, strategy-aligned segment by reaching a minimum-confidence diagnosis and shipping one bounded intervention without waiting for full metric convergence.

## Non-Goals
- Delaying all retention action until every churn metric fully aligns
- Launching multiple broad retention tactics across all segments at once
- Rewriting company strategy based on unresolved topline churn movement alone
- Treating one churn view as definitive without checking cross-metric directional consistency

## Users / Segments
- Primary: strategy-priority customer segment with meaningful revenue or strategic importance
- Secondary: comparison cohorts used to test whether churn signals are segment-specific or systemic

## Product Requirements
1. Build a churn diagnosis view segmented by customer segment, tenure, plan, and churn type.
2. Classify metric disagreement into three buckets: definitional only, segment-specific, or decision-blocking contradiction.
3. Establish a minimum-confidence rule for action: proceed when at least one strategy-priority segment shows a repeatable churn pattern in two independent views and no guardrail metric shows likely strategic harm.
4. Instrument a reason-coded churn taxonomy covering product fit, pricing, onboarding, support, and external factors.
5. Run one focused intervention against the top ranked hypothesis in the strategy-priority segment.
6. Require a decision gate with explicit exit criteria for the diagnostic phase.

## Proposed Approach
### Phase 1: Bounded Diagnosis
- Compare billing churn, logo churn, revenue churn, voluntary vs involuntary churn, and early-life vs mature-user churn.
- Mark disagreement as acceptable if metrics differ in magnitude but point to the same segment or lifecycle risk.
- Mark disagreement as blocking only if different metrics imply different target segments or opposite intervention choices.
- Time-box diagnosis to a defined sprint or analysis window rather than waiting for perfect alignment.

### Phase 2: Proceed / Hold Gate
Proceed if all of the following are true:
- A strategy-priority segment is identified.
- At least two churn views indicate the same priority segment or failure stage.
- The leading hypothesis has a plausible mechanism and measurable intervention.
- No major guardrail suggests the likely fix would damage activation, margin, or strategy focus.

Hold and escalate only if either of the following is true:
- Competing churn views point to different segments requiring different actions.
- The team cannot distinguish voluntary/involuntary or early-life/mature churn well enough to choose an intervention.

### Phase 3: Targeted Intervention
- Select the top strategy-aligned churn driver under the proceed rule.
- Ship one intervention matched to that driver, such as onboarding repair, save offer, packaging change, or lifecycle outreach.
- Limit rollout to the affected segment first.

### Phase 4: Decision Gate
- Expand only if the intervention improves retained customers or retained revenue in the target segment without harming activation, support load, gross margin, or strategic positioning.
- Stop if gains appear only in a non-priority segment, depend on unsustainable discounts, or contradict the original churn hypothesis.

## Success Metrics
- Primary: churn reduction in the targeted strategy-priority segment
- Secondary: retained revenue, save rate, reactivation rate, and time-to-churn shift
- Guardrails: activation, support burden, gross margin, and discount dependency

## Risks
- False confidence from treating correlated metrics as confirmation when they reflect the same bias
- Delay from over-investing in diagnosis beyond the minimum-confidence threshold
- Local churn improvement in a low-value segment misread as strategic progress
- Retention tactics that reduce visible churn while weakening pricing power or product direction

## Decision Frame
Proceed with retention work once churn conflict is reduced to a decision-usable level, not eliminated entirely. The operating decision is whether the team has enough aligned evidence to choose one strategy-consistent segment and one intervention. If conflicting metrics still imply different segments or opposite actions, pause intervention and resolve the contradiction. If the conflict is only definitional or magnitude-based, move forward with a bounded test.

## Unknowns & Evidence Gaps
- No packet evidence identifies which churn signal is strongest or whether current disagreements are merely definitional.
- No segment-level churn distribution is provided.
- No evidence distinguishes voluntary, involuntary, early-life, or mature-user churn by segment.
- No explicit strategy target or acceptable tradeoff threshold is provided.
- No baseline indicates whether delay risk is greater than partial-information intervention risk.

## Pass/Fail Readiness
- Pass if the team names a strategy-priority segment, shows directional agreement across at least two churn views, ranks one primary churn hypothesis, and defines success and guardrail metrics for one intervention.
- Fail if different churn views still imply different target segments or opposite actions, if the team cannot separate operational churn categories enough to pick a tactic, or if the proposed intervention lacks measurable success criteria.

## Recommended Next Artifact
A churn-analysis brief with segmented baseline metrics, a disagreement classification table, minimum-confidence proceed/hold scoring, ranked hypotheses, and an experiment plan for the top driver.
