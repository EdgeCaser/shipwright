# Your artifact

# Churn Reduction PRD: Conflicting Signals

## Overview
Build a churn-reduction program that resolves conflicting churn signals without drifting from strategy targets. The product should prioritize interventions that are reversible, measurable, and segment-specific rather than applying a single global retention tactic.

## Problem
Current churn indicators point in different directions, creating decision risk:
- Quantitative churn may be elevated in one segment while strategic targets emphasize another.
- Qualitative feedback may suggest urgent fixes that do not align with the company’s intended customer or product direction.
- Teams risk overfitting to the loudest signal instead of the highest-value retention opportunity.

## Goal
Reduce avoidable churn in strategically important segments while preserving focus on long-term positioning.

## Non-Goals
- Lower churn at any cost across all segments.
- Build permanent solutions before validating root cause.
- Reposition the product based on one unverified churn narrative.

## Users
- Existing customers at risk of churn.
- PM, Success, and Growth teams making retention tradeoffs.
- Leadership evaluating retention performance against strategy targets.

## Product Requirements
1. Add churn-risk segmentation by customer type, tenure, plan, and use-case fit.
2. Require every proposed retention action to name the signal it responds to, the segment affected, and the expected retention impact.
3. Launch a decision layer that classifies churn drivers into:
- product gap
- onboarding failure
- value communication failure
- pricing/packaging mismatch
- wrong-customer acquisition
4. Prioritize interventions only when they improve retention in target segments or generate evidence strong enough to challenge current strategy.
5. Support low-cost experiments first: onboarding changes, lifecycle messaging, save offers, and targeted success outreach.
6. Track guardrails so retention gains are not driven by discounts, support burden, or expansion of low-fit customers.

## Success Metrics
- Primary: Gross and net revenue churn reduction in target segments.
- Secondary: save rate for at-risk accounts, early activation rate, and retained accounts after intervention.
- Guardrails: support cost per retained account, discount dependency, and retention of low-fit segments.

## Rollout
- Phase 1: instrument segmentation and intervention tracking.
- Phase 2: run targeted retention experiments on highest-risk strategic segment.
- Phase 3: scale only interventions that improve retention without violating guardrails.

## Decision Frame
The core decision is not "how do we reduce churn overall" but "which churn should we fight given strategy targets." When signals conflict, the default should be to retain customers in strategically aligned segments first, while treating churn in non-target segments as a diagnostic input rather than an automatic roadmap driver. Evidence that consistently shows the strategy target itself is wrong should trigger a separate strategy review, not silent PRD drift. [ctx-1]

## Unknowns & Evidence Gaps
- No direct evidence packet identifies which segment is churning most.
- No causal evidence distinguishes product failure from poor-fit acquisition.
- No baseline shows whether strategy targets and observed retention cohorts are materially misaligned.
- No experiment history indicates which retention levers have already failed.

## Pass/Fail Readiness
Pass if:
- churn is measurable by segment
- interventions are attributable to explicit churn hypotheses
- success metrics include strategic-segment retention and guardrails
- roadmap changes require stronger evidence than anecdotal churn complaints

Fail if:
- the plan treats all churn as equally important
- interventions are rolled out globally before segment validation
- retention wins come mainly from discounts or low-fit customer preservation
- the team cannot explain which conflicting signal drove each action

## Recommended Next Artifact
Retention experiment plan with segment-level hypotheses, owner, metric, and stop/go criteria.
