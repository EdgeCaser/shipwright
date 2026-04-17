# Revised artifact

## Summary
This PRD does not approve expansion of the new onboarding flow to all users based on the current 90-day pilot. The pilot signal is directionally positive, but the available evidence is not decision-ready for full rollout because the cohort was opt-in and self-selected, there is no analysis testing whether the opt-in signal explains the retention gap, and pilot drop-off is not reported.

## Problem Statement
A decision is needed on whether to expand the new onboarding flow to all users. The current pilot does not establish that the observed retention difference is caused by the onboarding flow itself rather than by who chose to join the pilot.

## Goal
Reach a rollout decision using evidence that is applicable to the broader user population rather than to a self-selected email-response cohort.

## Non-Goals
- Expanding the onboarding flow to all users based only on the current pilot
- Treating the reported retention lift as causal without resolving selection effects
- Ignoring within-flow drop-off when evaluating rollout readiness

## Decision Frame
Do not approve expansion to all users on the current pilot evidence alone. Approve only a controlled next phase that tests the onboarding flow outside the opt-in recruitment condition, reports within-flow drop-off, and produces a readout suitable for a broad-launch decision.

## Requirements
1. The next phase must compare the new onboarding flow against the current experience using a cohort not defined by volunteering through the pilot email.
2. The analysis must explicitly address whether the opt-in signal explains some or all of the observed retention difference.
3. The team must report within-flow drop-off for the onboarding experience so retention is not evaluated in isolation.
4. Any interim rollout activity must remain a controlled validation step rather than a full-population expansion decision.
5. The final readout must clearly separate observed results from causal conclusions and state remaining uncertainty.

## Success Criteria
- A decision memo exists that evaluates the onboarding flow on a non-self-selected population.
- The readout includes both retention outcomes and onboarding drop-off reporting.
- Broad rollout readiness is judged on evidence that is applicable to the general user population.

## Risks
- Expanding to all users now would rely on survivorship-biased pilot evidence.
- The apparent retention lift may reflect who opted in rather than the onboarding flow.
- Missing drop-off reporting may conceal onboarding friction that becomes important in a broader launch.

## Unknowns & Evidence Gaps
- Whether pilot participants were already more likely to retain than typical users
- Whether the reported 34% better 30-day retention persists outside the self-selected cohort
- Where users dropped within the pilot onboarding flow
- Whether the observed result generalizes to all users or only to motivated responders

## Pass/Fail Readiness
Pass for a controlled validation phase only. Fail for expansion to all users until selection bias and within-flow drop-off are addressed in a decision-quality readout.

## Recommended Next Artifact
A rollout decision memo based on a controlled validation cohort outside the original opt-in recruitment path, including retention comparison, analysis of selection effects, and complete onboarding drop-off reporting.
