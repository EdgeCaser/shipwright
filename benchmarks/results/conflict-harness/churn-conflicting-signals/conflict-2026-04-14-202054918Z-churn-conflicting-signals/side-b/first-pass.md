# Churn Reduction PRD

## Problem
Churn signals are directionally important but currently conflict with top-down strategy targets. A full churn program should not be approved until the team separates reversible experience failures from intentional strategy tradeoffs.

## Goal
Reduce avoidable churn without undermining the strategy target mix of customers, plans, or product focus.

## Non-Goals
- Broad retention discounts without segment evidence
- Reprioritizing strategy targets based on one ambiguous churn readout
- Shipping permanent lifecycle changes before signal validation

## Users / Segments
- Strategic-fit customers with recent churn or downgrade risk
- Borderline-fit customers whose churn may reflect deliberate targeting
- Account teams and product teams that need a shared decision rule

## Decision Frame
Build a churn reduction program in two stages: first resolve signal conflict through segment-level instrumentation and targeted interventions; then scale only the interventions that reduce avoidable churn in strategy-aligned segments. The core decision is not "how do we lower churn overall" but "which churn should be reduced without weakening strategy targets."

## Product Requirements
1. Introduce a churn taxonomy that classifies exits into at least: onboarding failure, missing capability, value-realization failure, pricing friction, competitor displacement, and intentional strategic mismatch.
2. Require all churn reporting to be segmented by customer cohort, acquisition source, plan tier, tenure band, and strategy-fit score.
3. Launch a limited retention experiment set for strategy-fit accounts only, including onboarding rescue, proactive success outreach, and value-realization prompts.
4. Block generic save offers for accounts tagged as low strategic fit unless a human override is recorded.
5. Add a weekly decision dashboard that shows gross churn, avoidable churn, and churn among target accounts separately.
6. Define escalation rules when churn-reduction tactics improve retention but worsen target-segment mix or margin.

## User Stories
- As a PM, I need churn broken down by strategy-fit segment so I do not optimize the wrong population.
- As a CS leader, I need intervention playbooks tied to churn reasons so teams can act on specific failure modes.
- As an executive, I need a dashboard that separates healthy pruning from harmful churn so retention work supports strategy.

## Success Metrics
- Primary: reduction in avoidable churn for strategy-fit accounts
- Secondary: improvement in early value-realization rate, onboarding completion, and retained revenue in target segments
- Guardrails: no material decline in target-customer mix, gross margin, or strategic-plan adoption

## Rollout
- Phase 1: instrument taxonomy, segment reporting, and baseline measurement
- Phase 2: run narrow interventions on highest-confidence avoidable churn drivers
- Phase 3: scale only interventions that pass guardrails and improve target-segment retention

## Unknowns & Evidence Gaps
- Current packet provides no direct evidence on whether churn is concentrated in target or non-target segments.
- There is no verified reason-code quality check; self-reported churn reasons may be noisy.
- The conflict between churn signals and strategy targets is underspecified: acquisition mix, pricing, product gaps, and deliberate customer pruning could each explain it.
- No causal evidence yet shows which intervention would reduce churn without harming strategic focus.

## Pass/Fail Readiness
Pass if the team can measure churn by strategy-fit segment, trust reason coding enough to rank drivers, and run limited experiments with clear retention and guardrail metrics.

Fail if churn remains aggregated, strategy-fit is undefined, or teams are asked to lower churn broadly without distinguishing harmful churn from intentional attrition.

## Recommended Next Artifact
A segmented churn diagnostic memo with baseline tables for churn by strategy-fit cohort, top exit reasons, and recommended experiment candidates ranked by expected retention impact and strategic alignment.
