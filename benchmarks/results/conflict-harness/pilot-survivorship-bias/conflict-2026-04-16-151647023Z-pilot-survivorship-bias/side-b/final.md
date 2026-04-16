# Revised artifact

## PRD: Validation-Gated Expansion for the New Onboarding Flow

### Summary
This PRD does not approve immediate expansion to all users. The reported 34% improvement in 30-day retention is promising but not decision-grade because the pilot cohort was opt-in and self-selected from an email outreach, there is no analysis separating selection effects from treatment effects, and pilot funnel drop-off is not reported. The required product outcome is a validation-gated rollout plan that can determine whether the onboarding flow causes better retention for the general population.

### Problem Statement
The team wants to expand a new onboarding flow based on a 90-day pilot. The current evidence is insufficient for full rollout because:
- pilot participation was voluntary and likely enriched for high-intent users
- no causal analysis tests whether opt-in intent explains the retention gap
- no within-flow completion or abandonment data is reported

### Goals
- Determine whether the onboarding flow causally improves 30-day retention in a representative population.
- Measure how the flow affects onboarding completion, abandonment, activation, and downstream quality.
- Define explicit rollout gates that block expansion when evidence remains biased or incomplete.

### Non-Goals
- Immediate 100% rollout based on the current pilot alone.
- Treating the pilot retention lift as proof of generalizable product impact.

### Users
- New users entering onboarding.
- Product, growth, and analytics teams responsible for rollout decisions.

### Requirements
1. Randomized assignment
Eligible new users must be assigned to treatment and control through randomized allocation rather than opt-in enrollment.

2. Full funnel instrumentation
Track exposure, step completion, abandonment, activation, and 30-day retention for both groups.

3. Selection-bias analysis
Compare treatment and control on observable pre-treatment traits such as acquisition source, device, geography, and baseline intent proxies.

4. Attrition reporting
Report step-level completion and abandonment so the team can distinguish broad flow improvement from a narrower effect concentrated among highly motivated completers.

5. Guardrail metrics
Track support contacts, activation quality, time-to-value, and downstream conversion.

6. Rollout gates
Broader rollout is permitted only if the randomized test shows credible retention improvement, acceptable funnel performance, and no material guardrail regressions.

### Success Metrics
- Primary: 30-day retention lift in randomized treatment vs. control.
- Secondary: onboarding completion, activation rate, time-to-value.
- Guardrails: support burden, downstream conversion, step-level abandonment.

### Launch Plan
- Phase 1: randomized validation on a representative slice of eligible new users.
- Phase 2: staged rollout only if pre-set success and guardrail thresholds are met.
- Phase 3: full rollout only after evidence supports causal benefit and acceptable tradeoffs.

## Decision Frame
Do not approve expansion to all users based on the current pilot alone. Approve a validation-gated PRD whose purpose is to test whether the onboarding flow itself, rather than self-selection by high-intent users, explains the observed retention difference.

## Unknowns & Evidence Gaps
- How much of the 34% retention gap is explained by opt-in intent versus the onboarding experience itself.
- Whether the flow improves outcomes broadly or mainly among users already inclined to persist.
- What the pilot step-level completion and abandonment pattern was relative to control.
- Whether any apparent retention benefit comes with worse activation quality, support burden, or downstream conversion.

## Pass/Fail Readiness
Pass if:
- randomized evidence shows meaningful retention improvement
- step-level completion and abandonment are fully reported
- no material guardrail regressions appear
- results hold across major user segments and intent proxies

Fail if:
- uplift disappears under randomization
- benefits appear limited to high-intent subgroups
- funnel performance or guardrails regress materially
- instrumentation gaps prevent causal interpretation

## Recommended Next Artifact
An experiment brief for a randomized controlled rollout, including assignment logic, instrumentation spec, success thresholds, guardrail thresholds, segment cuts, and decision rules for expansion.
