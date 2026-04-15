# Revised artifact

## Problem
Churn signals conflict with strategy targets, so the team risks either overreacting to aggregate churn or ignoring avoidable losses in high-fit customers. The PRD should reduce harmful churn without reversing deliberate strategy choices.

## Goal
Reduce avoidable churn in strategy-aligned segments while preserving target-customer mix, margin, and product focus.

## Non-Goals
- Lowering aggregate churn at any cost
- Retention discounts or save tactics applied broadly without segment logic
- Reversing deliberate pruning of low-fit customers
- Waiting for perfect instrumentation before taking any bounded action

## Users / Segments
- High strategy-fit customers at churn or downgrade risk
- Low strategy-fit customers whose attrition may be acceptable or intentional
- PM, CS, Finance, and executive stakeholders who need a common decision rule

## Decision Frame
Run a dual-track churn program: improve segmentation and reason-code quality quickly, while in parallel testing a small set of bounded interventions on already high-confidence avoidable-churn cases. Scale only the interventions that improve retention in strategy-fit segments without violating guardrails. The decision is not whether to act now or instrument now; it is how to act narrowly while building enough evidence to avoid optimizing the wrong churn.

## Product Requirements
1. Define a churn taxonomy covering onboarding failure, missing capability, value-realization failure, pricing friction, competitor displacement, and strategic mismatch.
2. Segment churn reporting by cohort, plan tier, tenure band, acquisition source, and strategy-fit score where available.
3. Launch limited interventions immediately for high-confidence avoidable-churn cases, starting with onboarding rescue, proactive success outreach, and value-realization prompts.
4. Restrict generic save offers for accounts tagged low strategic fit unless an override is recorded.
5. Publish a weekly dashboard showing aggregate churn, churn in target accounts, avoidable-churn estimates, intervention exposure, and guardrail movement.
6. Define explicit escalation rules if an intervention improves retention but worsens target mix, margin, or strategic-plan adoption.
7. Set Phase 1 exit criteria: proceed to broader rollout when at least 80% of churned revenue is segment-classified, top reason buckets are stable for two reporting cycles, and at least one intervention shows positive movement in target-segment retention without guardrail breach.

## User Stories
- As a PM, I need churn split by strategy-fit and reason so I do not optimize the wrong population.
- As a CS leader, I need a small approved playbook for obvious avoidable-churn cases so action does not stall behind analysis.
- As an executive, I need guardrails that distinguish healthy pruning from harmful churn so retention work supports strategy.

## Success Metrics
- Primary: reduced avoidable churn rate in strategy-fit accounts
- Secondary: improved onboarding completion, value-realization rate, and retained revenue in target segments
- Guardrails: no material deterioration in target-customer mix, gross margin, or strategic-plan adoption

## Rollout
- Phase 1: stand up taxonomy, improve segmentation coverage, and start narrow tests for obvious avoidable-churn cases
- Phase 2: expand only the interventions that show positive retention signal in strategy-fit segments and pass guardrails
- Phase 3: operationalize reporting and playbooks for scaled use across target cohorts

## Unknowns & Evidence Gaps
- The packet does not show whether churn is concentrated in high-fit or low-fit segments.
- Existing churn reason codes may be noisy or inconsistently applied.
- The exact strategy conflict is underspecified: customer mix, tier mix, margin, or product focus could each be involved.
- Some causal signal will come from intervention tests, not instrumentation alone.

## Pass/Fail Readiness
Pass if the team can classify most churn into usable segments, run narrow intervention tests on high-confidence avoidable-churn cases, and monitor clear retention plus guardrail metrics.

Fail if churn remains fully aggregated, strategy-fit remains undefined, interventions are either blocked pending perfect data or launched broadly without segment controls, or no explicit Phase 1 exit criteria exist.

## Recommended Next Artifact
A churn diagnostic and experiment memo that includes baseline churn by strategy-fit cohort, reason-code quality assessment, 2-3 immediate intervention candidates, and the threshold table for Phase 1 exit and scale decisions.
