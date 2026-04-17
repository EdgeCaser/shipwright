# PRD: Controlled Validation Before Broad Onboarding Rollout

## Summary
This document defines a validation-first path for the new onboarding flow rather than immediate expansion to all users. The available pilot result is directionally encouraging, but the pilot design does not support a broad launch decision because the cohort was opt-in and self-selected, there is no analysis isolating whether selection explains the retention lift, and pilot drop-off is not reported.

## Problem Statement
A decision is needed on whether to expand the new onboarding flow beyond the 90-day pilot. The current evidence does not establish that the observed retention difference is caused by the onboarding flow itself rather than by differences in who chose to participate.

## Goal
Determine whether the new onboarding flow produces durable retention improvement for the general user population under conditions that support a rollout decision.

## Non-Goals
- Immediate expansion to all users based only on the pilot result
- Treating pilot retention lift as causal without resolving selection effects
- Finalizing broad-launch requirements before the evidence gap is closed

## Users
- New users who would receive onboarding
- Product and growth teams deciding rollout scope
- Operations and support teams affected by broad launch risk

## Decision Frame
Do not approve expansion to all users on the current pilot evidence alone. Approve only a controlled next phase designed to test the onboarding flow on a population that is not defined by opt-in self-selection and to report full within-flow drop-off.

## Requirements
1. The next validation phase must compare the new onboarding flow against the current experience using assignment that does not depend on a user volunteering through an email response.
2. The analysis must explicitly test whether the opt-in signal could account for the observed retention difference.
3. The team must report step-level or stage-level drop-off within the new onboarding flow so the retention result is not evaluated in isolation.
4. The rollout decision must be held until the validation phase produces evidence that is applicable to the broader user population.
5. The final readout must separate observed outcomes from causal claims and clearly state remaining uncertainty.

## Success Criteria
- A decision memo exists that can attribute the retention result to the onboarding experience with materially less ambiguity than the pilot allows.
- Drop-off within the onboarding flow is reported and reviewed alongside retention.
- Launch readiness is evaluated on evidence from a non-self-selected population.

## Risks
- Expanding now could lock in a decision based on survivorship-biased evidence.
- A broad rollout could underperform if the pilot users were unusually motivated independent of the product change.
- Missing drop-off reporting could hide friction that matters at full scale.

## Unknowns & Evidence Gaps
- Whether users who opted in were already more likely to retain than typical users
- Whether the reported 34% retention improvement persists outside a self-selected cohort
- Where users dropped within the pilot onboarding flow, since drop-off is not reported
- Whether the pilot result generalizes to all users or only to highly motivated responders

## Pass/Fail Readiness
Pass only for a controlled validation phase, not for full expansion. Fail for broad rollout readiness until selection bias and within-flow drop-off are addressed in a decision-quality analysis.

## Recommended Next Artifact
A rollout decision memo based on a non-self-selected validation cohort, including retention comparison, opt-in effect analysis, and complete onboarding drop-off reporting.
