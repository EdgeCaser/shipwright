# Your artifact

## PRD: Validation-Gated Rollout for the New Onboarding Flow

### Summary
This PRD does not authorize immediate expansion to all users. The available pilot result is directionally promising, but the pilot cohort was opt-in and self-selected, so the observed 34% lift in 30-day retention cannot be treated as causal evidence that the onboarding flow itself will improve retention for the full population. The product requirement is therefore to run a controlled validation phase that can support or reject a broader rollout decision.

### Problem Statement
The team wants to expand a new onboarding flow based on a 90-day pilot showing materially better 30-day retention than control. The current evidence is not decision-grade because:
- pilot enrollment was self-selected from an email response
- no analysis isolates selection effects from product effects
- pilot drop-off is not reported

### Goals
- Determine whether the onboarding flow causes retention improvement in the general user population.
- Measure funnel performance across the full onboarding journey, including drop-off.
- Define rollout gates that prevent broad launch on biased or incomplete evidence.

### Non-Goals
- Immediate 100% rollout to all users.
- Using pilot retention lift alone as launch justification.

### Users
- New users entering onboarding.
- Product and growth teams making rollout decisions.

### Requirements
1. Randomized assignment
The next phase must assign eligible new users into treatment and control through randomized allocation rather than opt-in participation.

2. Funnel instrumentation
Track impression, step completion, abandonment, activation, and 30-day retention for both groups.

3. Segment reporting
Report results by acquisition channel, baseline engagement proxy, geography, device, and account type to detect uneven effects.

4. Attrition visibility
Report within-flow drop-off for each onboarding step and total completion rate.

5. Guardrail metrics
Track activation quality, support contacts, time-to-value, and any negative effect on downstream conversion.

6. Rollout gates
Broader rollout is allowed only if the randomized test shows a statistically credible retention improvement without unacceptable guardrail regressions.

### Success Metrics
- Primary: 30-day retention lift in randomized treatment vs. control.
- Secondary: onboarding completion, activation rate, time-to-value.
- Guardrails: support burden, downstream conversion, step-level abandonment.

### Launch Plan
- Phase 1: randomized validation on a representative slice of new users.
- Phase 2: staged rollout to a larger percentage only if pre-set success criteria are met.
- Phase 3: full rollout only after validation confirms causal benefit and acceptable guardrails.

## Decision Frame
Do not approve expansion to all users based on the current pilot alone. Approve a validation-gated PRD whose purpose is to establish whether the onboarding flow, rather than self-selection, drives the observed retention difference.

## Unknowns & Evidence Gaps
- How much of the 34% retention gap is explained by opt-in intent rather than the new flow.
- Whether the pilot flow improves or worsens onboarding completion and step-level abandonment.
- Whether effects generalize beyond users motivated enough to answer an email and volunteer.
- Whether any retention gain comes with negative tradeoffs on activation quality or downstream conversion.

## Pass/Fail Readiness
Pass if:
- randomized evidence shows meaningful retention improvement
- pilot and treatment funnel drop-off are fully reported
- no material guardrail regressions appear
- results hold across major user segments

Fail if:
- uplift disappears under randomization
- drop-off worsens enough to offset retention gains
- effects are confined to unusually motivated users
- important instrumentation gaps remain

## Recommended Next Artifact
An experiment brief for a randomized controlled rollout, including assignment logic, instrumentation spec, success thresholds, guardrail thresholds, segment cuts, and rollout decision rules.
