# Churn Reduction PRD: Conflicting Signals Governance

## Summary

This PRD defines a churn reduction program for situations where customer behavior signals conflict with the company strategy target. The product should not optimize directly for the loudest churn signal until the conflict is classified, instrumented, and tied to an explicit retention bet.

The recommended product direction is to launch a decision-gated retention intervention system: diagnose churn by segment, separate strategic churn from harmful churn, and ship only interventions that improve retention in target segments without deepening reliance on de-prioritized segments.

## Problem

The team has churn signals that point in different directions from strategy targets. Some churn may be strategically acceptable if it comes from customers outside the desired ICP, low-margin segments, or cohorts the company no longer intends to serve. Other churn may be urgent if it appears in strategic accounts, expansion-ready customers, or users whose retention is central to the current strategy.

Without an explicit decision framework, the team risks one of two failures: reducing aggregate churn by over-serving non-strategic customers, or staying aligned to strategy while ignoring real retention damage in the target market.

## Goals

1. Reduce harmful churn in strategic customer segments.
2. Avoid spending roadmap capacity on churn that is acceptable under the current strategy.
3. Create a repeatable churn triage process for conflicting signals.
4. Improve confidence in retention decisions through cohort-level evidence.

## Non-Goals

1. This PRD does not attempt to reduce all churn equally.
2. This PRD does not redefine company strategy or ICP.
3. This PRD does not commit to a broad retention feature bundle before diagnosis.
4. This PRD does not treat anecdotal feedback as sufficient evidence for roadmap reprioritization.

## Users and Segments

Primary segment: strategic ICP customers whose retention directly supports the current strategy target.

Secondary segment: near-ICP customers with evidence of high future strategic value.

Excluded segment: non-ICP customers whose churn is expected or acceptable under the strategy target unless their behavior exposes a platform defect affecting ICP customers.

## Requirements

1. Segment churn reporting by ICP fit, plan, tenure, activation status, usage intensity, account value, and stated churn reason.
2. Classify churn into at least four buckets: strategic-risk churn, acceptable churn, ambiguous churn, and instrumentation gap.
3. Create an account/user-level churn risk view for strategic segments that combines behavioral signals and qualitative reasons.
4. Launch retention interventions only for strategic-risk churn or ambiguous churn with high potential downside.
5. Add an explicit guardrail so aggregate churn improvement is not counted as success if target-segment churn does not improve.
6. Require every retention experiment to state which strategy target it supports and which segment it intentionally does not optimize for.

## Proposed Solution

Build a churn triage and intervention workflow with three layers.

Layer 1: Diagnosis
- Create a churn dashboard split by strategic fit and customer value.
- Tag churn reasons into normalized categories.
- Compare churned users with retained users in the same target segment.
- Identify whether the strongest churn signal comes from target ICP, adjacent customers, or non-strategic customers.

Layer 2: Decision Gate
- If churn is concentrated in strategic ICP customers, prioritize retention fixes.
- If churn is concentrated in non-ICP customers, do not prioritize retention fixes unless the root cause also affects ICP retention.
- If signals conflict or attribution is weak, run a short discovery and instrumentation sprint before shipping product changes.

Layer 3: Intervention
- For strategic-risk churn, ship focused fixes tied to the diagnosed root cause.
- For ambiguous churn, run a small experiment with clear stop conditions.
- For acceptable churn, document the rationale and monitor for spillover into target segments.

## Success Metrics

Primary metric: reduction in churn rate for strategic ICP customers.

Secondary metrics:
- improvement in retained activation among target cohorts;
- reduction in preventable churn reasons within target cohorts;
- increased save rate for at-risk strategic accounts;
- improved retention experiment decision confidence.

Guardrail metrics:
- no increase in churn among high-value strategic accounts;
- no roadmap capacity shift toward excluded segments without explicit approval;
- no improvement claim based only on aggregate churn when target-segment churn is flat or worse.

## Decision Frame

The decision is not whether to reduce churn in general. The decision is which churn the company should pay to reduce.

Recommend proceeding with a gated churn reduction PRD only if the team agrees to treat strategy-fit segmentation as the primary lens. Aggregate churn should be a diagnostic input, not the success metric. The program should prioritize churn reduction when the evidence shows harm to the target segment, and it should explicitly tolerate churn that comes from customers outside the strategy target.

Decision rule:
- Ship intervention if churn affects strategic ICP customers and the root cause is actionable.
- Investigate before shipping if evidence conflicts or attribution is weak.
- Deprioritize if churn is concentrated outside the target strategy and has no credible spillover risk.

## Unknowns & Evidence Gaps

No case evidence was provided for the specific churn signals, strategy target, customer segments, churn rates, or qualitative churn reasons. The artifact therefore uses a decision structure rather than asserting a specific root cause.

Key gaps:
- Which signal conflicts with which strategy target?
- What is the current strategy target or ICP definition?
- Is churn concentrated in strategic, adjacent, or non-strategic segments?
- Are churn reasons self-reported, inferred from behavior, or based on sales/customer success notes?
- What is the baseline churn rate by segment and cohort?
- Are there activation, onboarding, pricing, support, product quality, or value-realization differences between churned and retained target customers?
- What level of churn reduction is needed for the strategy target to remain viable?

## Pass/Fail Readiness

Pass readiness criteria:
- ICP and strategic segment definitions are explicit.
- Churn is segmented by strategic fit, value, cohort, and reason.
- The team can identify at least one actionable churn driver in a strategic segment.
- The success metric is target-segment churn, not only aggregate churn.
- The planned intervention has a measurable hypothesis and guardrail.

Fail or hold criteria:
- The only evidence is aggregate churn.
- Churn improvements would primarily come from non-strategic customers.
- The team cannot distinguish acceptable churn from harmful churn.
- The proposed work conflicts with the current strategy target without executive approval.
- The measurement plan cannot detect whether ICP retention improved.

## Recommended Next Artifact

Create a churn evidence brief before implementation. It should include cohort churn tables, segment definitions, churn reason taxonomy, target-vs-non-target comparison, and a recommendation on whether to ship, investigate, or deprioritize each churn driver.

After that, create a one-page retention experiment spec for the highest-confidence strategic-risk churn driver.
