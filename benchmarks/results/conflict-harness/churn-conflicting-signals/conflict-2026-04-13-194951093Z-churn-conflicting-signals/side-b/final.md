# Revised artifact

# Churn Reduction PRD: Conflicting Signals Against Strategy Targets

## Product Context

The team needs a churn reduction PRD for a situation where churn signals conflict with strategy targets. Because the case packet does not provide the churn dataset, the strategy target, segment definitions, or signal sources, this PRD does not assume that the current strategy-fit definition is correct. It treats the first product work as a diagnostic and decision system: define the segments, compare the conflicting signals across them, detect whether the strategy definition itself is part of the churn problem, and only then ship a narrow retention intervention. [ctx-1]

## Problem Statement

Churn is high enough to require action, but the team cannot yet tell whether the right response is to preserve the strategy, adjust execution against the strategy, or revisit the strategy target itself. Prioritizing aggregate churn could overfit to the loudest or largest churn pool. Prioritizing strategy-fit churn too early could create survivorship bias if the strategy target is undefined, misclassified, or excluding customers who materially affect revenue, product value, or network effects.

## Goals

- Establish a defensible segmentation model before choosing a retention intervention.
- Diagnose whether churn is caused by execution gaps, customer-fit errors, value-realization gaps, pricing or packaging mismatch, or the strategy target itself.
- Compare strategy-fit, strategy-adjacent, and non-fit churn using consistent metrics.
- Identify one narrow retention intervention only after the conflicting signal map is reviewed.
- Define evidence thresholds for preserving, adjusting, or challenging the current strategy target.

## Non-Goals

- Do not assume the current strategy-fit definition is correct.
- Do not optimize only aggregate churn without regard to revenue, fit, margin, or strategic value.
- Do not exclude non-fit or strategy-adjacent churn from diagnosis before checking whether those customers influence the target segment.
- Do not ship broad discounting, manual save plays, or bundled retention work without causal evidence.

## Target Segments For Diagnosis

- Provisional strategy-fit customers: customers believed to match the current strategy target, pending operational definition and validation.
- Strategy-adjacent customers: customers not clearly inside the target but potentially important because of revenue, usage depth, referrals, integrations, marketplace liquidity, collaboration patterns, or downstream influence on target customers.
- Non-fit customers: customers whose needs appear outside the current strategy, while still useful as evidence for onboarding, packaging, expectation, or product-quality issues.
- Unclassified customers: customers who cannot yet be assigned because the strategy target is too vague or data is incomplete.

## Churn Hypotheses

These are working hypotheses, not established findings:

1. The current strategy-fit definition may be under-specified, causing the team to misclassify churn risk.
2. Strategy-fit customers may be churning because activation does not lead quickly enough to the value promised by the strategy.
3. Strategy-adjacent or excluded customers may create revenue, usage, or network effects that support retention among target customers.
4. Aggregate churn may look alarming because a large non-fit cohort is leaving, even if the strategy target remains healthy.
5. Conflicting signals may come from mismatched metric definitions, such as logo churn versus revenue churn, usage decline versus cancellation, or stated cancellation reason versus observed adoption behavior.

## Product Requirements

### R1: Strategy Target Operationalization Gate

Before intervention selection, convert the strategy target into customer-level classification rules.

Acceptance criteria:
- Each account can be classified as provisional strategy-fit, strategy-adjacent, non-fit, or unclassified.
- Classification rules include the value metric used for strategy decisions, such as revenue, retained usage, expansion potential, margin, or ecosystem importance.
- The unclassified rate is visible and treated as a readiness risk.

### R2: Conflicting Signal Evidence Map

Create an evidence map for all major churn signals.

Acceptance criteria:
- Each signal includes source, metric definition, affected segment, sample size, time period, confidence level, and causal strength.
- Signals are marked as supporting preserve strategy, adjust execution, or revisit strategy.
- Non-fit and strategy-adjacent signals are reviewed for revenue, network-effect, referral, integration, or dependency impact before deprioritization.

### R3: Segmented Churn Dashboard

Build a retention view that compares churn across provisional strategy-fit, strategy-adjacent, non-fit, and unclassified customers.

Acceptance criteria:
- Dashboard distinguishes logo churn, revenue churn, downgrade, active usage decline, and renewal risk.
- Dashboard shows cohort size and confidence warnings where samples are small.
- Dashboard can show whether churn in excluded segments affects target-segment retention or value realization.

### R4: Churn Reason Taxonomy

Standardize churn reasons across cancellation flows, support tickets, CSM notes, interviews, and product analytics.

Acceptance criteria:
- Taxonomy separates product friction, missing capability, pricing or packaging mismatch, onboarding failure, low perceived value, support experience, competitor displacement, and customer no-longer-fit.
- Reasons are tagged by segment classification and lifecycle stage.
- Free-text evidence remains available for qualitative review.

### R5: Strategy Conflict Review Gate

Hold a decision review before selecting or scaling a retention intervention.

Acceptance criteria:
- Review compares three choices: preserve strategy and fix execution, adjust the segment or packaging definition, or reopen the strategy target.
- Review explicitly tests whether the strategy-fit definition is causing survivorship bias or excluding strategically material customers.
- Decision is recorded with owner, evidence reviewed, threshold met, and revisit trigger.

### R6: Narrow Retention Intervention

Ship one narrow intervention only after the review gate identifies a high-confidence churn driver.

Acceptance criteria:
- Intervention is tied to a specific segment, lifecycle stage, and causal hypothesis.
- Intervention has a leading indicator before renewal or cancellation.
- Intervention can be disabled or rolled back without affecting unrelated flows.

## Metrics

Primary decision metric:
- Confidence that the team can classify customers by strategic relevance and explain the conflicting churn signals by segment.

Primary outcome metric after intervention selection:
- Reduction in churn for the selected segment using the strategy's primary retention unit, such as revenue retention, account retention, or active retained usage.

Supporting metrics:
- Churn rate by provisional strategy-fit, strategy-adjacent, non-fit, and unclassified status.
- Revenue churn and usage decline by segment.
- Time to first meaningful value milestone.
- Churn reason distribution by segment and lifecycle stage.
- Share of churn coming from strategy-adjacent customers with material revenue, dependency, or network-effect value.

Guardrail metrics:
- No reduction in aggregate churn that comes mainly from retaining low-margin or strategically harmful customers.
- No ignored churn pool with material revenue, ecosystem, or target-segment dependency impact.
- No intervention that relies mainly on discounts, manual save work, or customer-specific exceptions.
- No strategy decision made while the unclassified customer share remains too high for reliable diagnosis.

## Rollout Plan

Phase 1: Operationalize the strategy target.
- Define segment classification rules.
- Identify unclassified customers and missing data.

Phase 2: Map conflicting signals.
- Build the evidence map and segmented dashboard.
- Compare aggregate, strategy-fit, strategy-adjacent, non-fit, and unclassified churn.

Phase 3: Run the strategy conflict review.
- Decide whether the evidence supports preserving strategy, adjusting execution, revising segment definitions, or reopening the strategy.

Phase 4: Ship one intervention.
- Select the highest-confidence churn driver and target one segment and lifecycle stage.
- Measure leading indicators before evaluating retention impact.

## Risks

- Segment rules may be invented to defend the existing strategy rather than to test it.
- Non-fit churn may hide dependency effects that later harm target customers.
- Cancellation reasons may be post-hoc explanations rather than causal drivers.
- Churn impact may take longer to measure than activation or usage indicators.
- Leadership may treat conflicting signals as proof of failure before evidence quality is sufficient.

## Decision Frame

Decision to make: Should the team prioritize strategy-fit churn immediately, or first validate the strategy-fit definition against the conflicting signals?

Recommended decision: First validate the strategy-fit definition and map the conflicting signals, then prioritize the first retention intervention based on the strongest segment-level causal evidence.

Rationale: The critique is correct that prioritizing strategy-fit customers before defining and testing strategy fit assumes the answer. In this scenario, the strategy target may itself be part of the churn problem. The product decision should therefore sequence diagnosis before intervention: operationalize the target, inspect adjacent and excluded segments for strategic value or dependency effects, then choose whether to preserve, adjust, or challenge the strategy.

## Unknowns & Evidence Gaps

- Actual churn rate, revenue churn, and cohort trends are not provided.
- The strategy target is unspecified.
- Customer segments, pricing tiers, value metric, and lifecycle stages are unspecified.
- The source, reliability, and causal strength of the conflicting signals are unknown.
- Network effects, referral effects, integration dependencies, and revenue concentration are unknown.
- Cancellation reasons, support-ticket analysis, product analytics, and customer interview evidence are not provided.
- The time horizon for acceptable churn improvement is not specified.

## Pass/Fail Readiness

Pass readiness if:
- The team can classify most customers into strategy-fit, strategy-adjacent, non-fit, or unclassified groups using explicit rules.
- Conflicting signals are mapped by source, segment, sample size, metric definition, and causal strength.
- Strategy-adjacent and non-fit churn have been checked for material revenue, usage, dependency, or network-effect impact.
- The team can name one high-confidence churn driver and explain why it is the right first intervention target.
- Leadership agrees on the threshold for preserving, adjusting, or reopening the strategy.

Fail readiness if:
- The team only has aggregate churn without segment-level evidence.
- The strategy target cannot be operationally classified at the customer level.
- The team assumes strategy-fit customers should be prioritized before testing whether the fit definition is valid.
- The proposed fix is a broad retention bundle without a causal hypothesis.
- Success is defined as lower churn regardless of customer fit, revenue quality, margin, dependency effects, or strategic value.

## Recommended Next Artifact

Create a Churn Evidence Map and Strategy-Fit Classification Spec. The evidence map should list each conflicting signal, source, segment, metric definition, sample size, causal strength, and strategy implication. The classification spec should define strategy-fit, strategy-adjacent, non-fit, and unclassified customers well enough to support the first intervention decision.
