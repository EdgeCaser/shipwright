# Revised artifact

## PRD: Controlled Expansion Under Evidence Uncertainty

## Summary
This PRD does not support an immediate universal rollout. The 2-week experiment showed a directional positive result: a 6% lift in the primary metric with p=0.08. That is not the same as a null result, but it is also not strong enough evidence for an irreversible all-user launch because the estimate is still too imprecise and the data science team explicitly judged the test underpowered relative to the claimed effect size and recommended a minimum 6-week run. The recommended path is controlled expansion with a persistent randomized holdout so the business can move faster without pretending the current readout is conclusive.

## Problem
The PM wants to expand the feature to all users based on a short A/B test that suggests upside. The analytics team warned that the experiment was underpowered and should run longer. The organization needs a path that acknowledges directional evidence without overstating certainty.

## Goal
Capture potential business value sooner while preserving a valid decision path, protecting against false-positive rollout, and keeping rollback viable.

## Non-Goals
- Treating the current test as proof of no effect
- Treating the current test as proof sufficient for full rollout
- Waiting for perfect certainty before any action
- Making the rollout irreversible before uncertainty is reduced

## Decision Frame
Proceed with staged expansion, not immediate universal release. The observed result is better described as directionally positive but imprecise, not conclusively negative or conclusively validated. Expand exposure only in controlled gates while maintaining a persistent randomized holdout until either:

1. Additional runtime and sample reduce uncertainty enough to satisfy predeclared launch thresholds, or
2. The observed effect weakens, reverses, or creates guardrail harm that justifies halting or rollback.

## Product Requirements
1. Preserve a persistent randomized holdout throughout the expanded rollout period.
2. Predeclare the decision framework before the first expansion gate, including:
- minimum runtime or sample target
- target effect threshold
- acceptable confidence standard
- guardrail and rollback triggers
3. Expand in predefined gates rather than moving directly to 100% exposure.
4. Continue measuring the original primary metric against holdout.
5. Add mandatory guardrails for retention, support burden, revenue risk, reliability, and UX complaints.
6. Require written gate reviews jointly owned by product, analytics, and engineering.
7. Ensure rollback can be executed within one release cycle.

## Rollout Plan
- Gate 1: expand to a limited additional cohort while preserving clean randomization and holdout integrity.
- Gate 2: expand further only if the point estimate remains positive, no guardrail is breached, and the cumulative sample is tracking toward the predeclared evidence target.
- Gate 3: move to broad but not full exposure only after the added runtime materially reduces uncertainty.
- Final release: move to full availability only if launch thresholds are met under the predeclared decision framework.

## Decision Logic
The current result should be treated as directional evidence, not as decisive proof. The key issue is estimate precision, not merely failure to cross a conventional p-value cutoff. Therefore:

- Do not describe the test as showing "no effect."
- Do not describe the test as sufficient evidence for full rollout.
- Do treat the result as enough to justify a faster controlled expansion if business urgency is real and measurement discipline is preserved.

## Success Metrics
- Primary: lift in the tested primary metric versus persistent holdout
- Secondary: adoption, repeat usage, and downstream conversion where relevant
- Guardrails: retention, complaints, error rate, latency, and revenue-risk metrics tied to the feature

## Risks
- The true effect may be smaller than the current 6% estimate.
- A short-run positive estimate may regress with longer observation.
- Early expansion may create social pressure to declare victory before uncertainty is acceptably reduced.
- Aggregate improvement may conceal segment-specific harm.

## Unknowns & Evidence Gaps
- What minimum detectable effect, target power, and significance standard informed the data science recommendation for a 6-week run
- What confidence interval surrounds the observed 6% lift
- Whether the plausible effect range still supports the business case after accounting for downside cases
- Whether longer-run or segment-level behavior changes the decision
- Whether the system can operationally support a persistent randomized holdout during expansion

## Pass/Fail Readiness
Pass if:
- a persistent holdout is maintained
- the decision thresholds are predeclared
- the team aligns on runtime or sample requirements to reduce uncertainty
- guardrail monitoring is live
- rollback is operational

Fail if:
- the team removes the holdout before the uncertainty is reduced
- the team treats p=0.08 as either proof of success or proof of failure
- success criteria change during rollout
- broad release proceeds without agreed launch thresholds or rollback readiness

## Recommended Next Artifact
A rollout decision memo that quantifies the missing statistical frame: assumed effect size, target power, required runtime or sample, confidence interval interpretation, gate thresholds, guardrails, and named decision owners. That memo should be approved by product, analytics, and engineering before Gate 1 expansion.
