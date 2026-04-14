# Revised artifact

# Churn Reduction PRD: Strategy Target First, Retention Second

## Summary

This PRD defines a churn reduction initiative for a case where churn signals conflict with strategy targets and the case packet provides no customer, cohort, revenue, behavioral, or strategy-definition evidence. The prior version assumed the team could segment customers into strategy-fit and non-strategy-fit groups. That assumption was too strong because the strategy target itself is not defined in the packet.

The revised product decision is to treat strategy-fit classification as the first product requirement, not as a precondition already available. The team should not ship a retention intervention until the strategy target has been operationalized into observable criteria or, if the strategy target is itself contested, until leadership selects a provisional decision rule for interpreting churn.

## Problem

The business wants to reduce churn, but churn signals conflict with strategy targets. A broad churn reduction push could improve aggregate retention while retaining customers the product should no longer optimize for. Conversely, dismissing churn as strategically acceptable without a defined target segment could hide preventable churn among valuable customers.

The immediate problem is therefore not simply: reduce churn. It is: define how the strategy target should be recognized in customer data, determine whether churn is concentrated inside or outside that target, and only then choose a retention intervention.

## Goals

1. Convert the strategy target into a usable classification rule for churn analysis.
2. Identify where churn is harmful, tolerable, or unresolved under that rule.
3. If strategy-fit classification remains contested, expose the decision tradeoff rather than masking it with segmentation language.
4. Ship one narrow retention experiment only after the target segment and preventable churn pattern are sufficiently defined.
5. Preserve conflicting evidence so future churn decisions can be revisited without relitigating the same assumptions.

## Non-Goals

1. This PRD does not commit to reducing aggregate churn across all customers.
2. This PRD does not assume a strategy-fit segment can be classified before the strategy target is operationalized.
3. This PRD does not treat cancellation reasons as reliable without behavioral, cohort, or qualitative validation.
4. This PRD does not recommend discounts, save offers, or sales-led rescue motions as default interventions.
5. This PRD does not change company strategy; it requires the strategy to be made specific enough for churn decisions.

## Target Users and Segments

Primary segment: to be defined after strategy target operationalization. This segment must be described with observable attributes such as use case, company size, plan, workflow, lifecycle stage, revenue profile, activation behavior, or acquisition source.

Secondary segment: recently activated customers whose early friction blocks reaching core product value, but only if they meet the provisional strategy-fit rule.

Deprioritized segment: customers whose churn is driven by needs outside the operationalized strategy target, unsupported workflows, or cost-to-serve patterns that would pull the roadmap away from the intended direction.

Contested segment: customers whose fit cannot be classified under current strategy language. These customers should not be automatically included in retention experiments; they should be used to clarify the strategic decision.

## Requirements

### R0: Strategy Target Operationalization

Before retention work begins, define a provisional strategy-fit rule that can be applied to churn data.

Acceptance criteria:

- Leadership, product, GTM, and analytics agree on a written strategy-fit definition or explicitly record that the definition remains contested.
- The definition includes observable inclusion criteria and exclusion criteria.
- The definition states which customer attributes are required, which are proxies, and which are insufficient on their own.
- If no single definition can be agreed, the team creates two or three candidate definitions and compares churn under each before selecting an intervention.
- No retention experiment launches until this rule or fallback decision path is documented.

### R1: Churn Segmentation Model

Create a churn segmentation view only after R0 is complete or after candidate target definitions have been documented.

Minimum segmentation dimensions:

- Strategy-fit classification or candidate classification
- Confidence level for the classification
- Plan or revenue tier
- Lifecycle stage
- Activation status
- Core feature usage
- Acquisition source
- Cancellation reason, if available
- Support burden or account health signal, if available

Acceptance criteria:

- Churn reporting separates confirmed target-fit, confirmed non-target, and contested-fit customers.
- Churn reporting distinguishes logo churn from revenue churn where data allows.
- The team can identify the top churn patterns for confirmed target-fit customers, or state that target-fit classification remains too weak for intervention selection.

### R2: Conflicting Signal Review

Create a structured review comparing quantitative churn patterns, qualitative signals, and the operationalized strategy target.

Acceptance criteria:

- Each major churn driver is tagged as validated, contradicted, insufficiently evidenced, or strategy-definition-dependent.
- Any proposed intervention names the segment it serves and explains why retaining that segment supports the strategy.
- The team explicitly records where churn may be strategically acceptable.
- If the same churn pattern looks good under one strategy definition and bad under another, the decision is escalated as a strategy clarification issue rather than treated as a product experiment candidate.

### R3: Target-Fit Retention Experiment

Ship one narrow intervention only for the highest-confidence preventable churn pattern among confirmed or provisionally approved target-fit customers.

Potential intervention types:

- Activation guidance for customers who fail to reach first value
- Lifecycle messaging for users who stall before a key habit forms
- Product affordance changes for recurring friction in a strategic workflow
- Admin or billing clarity if churn is caused by avoidable confusion

Acceptance criteria:

- The intervention is scoped to the segment it is designed for.
- The intervention has a primary metric, guardrail metric, and stop condition.
- The experiment does not rely only on aggregate churn as the success metric.
- The experiment is blocked if the proposed retained segment is still classified as contested-fit and no leadership decision rule exists.

### R4: Churn Learning Log

Maintain a decision log for churn findings, target-fit assumptions, and interventions.

Acceptance criteria:

- Each entry records the signal, affected segment, strategy-fit definition used, hypothesis, evidence strength, decision, and result.
- Contradictory evidence is preserved rather than overwritten.
- Future roadmap proposals can cite the log when requesting larger retention investments.

## Metrics

Primary metric after R0: preventable churn rate among confirmed or provisionally approved strategy-fit customers in the selected target segment.

Pre-intervention readiness metrics:

- Percentage of churned customers classifiable under the strategy-fit rule
- Share of churn classified as confirmed target-fit, confirmed non-target, and contested-fit
- Revenue churn by classification group
- Evidence strength for the top churn hypotheses

Supporting metrics:

- Activation completion rate
- Time to first value
- Repeat use of the core strategic workflow
- Revenue retention for target-fit customers
- Cancellation intent or downgrade intent in the targeted cohort

Guardrail metrics:

- Retention of non-strategic customers increasing faster than target-fit retention
- Support load per retained customer
- Gross margin or service cost degradation
- Increase in roadmap requests from excluded use cases
- Decline in conversion or expansion among strategic target customers
- Increase in the contested-fit share after intervention launch

## Launch Plan

Phase 0: Operationalize the strategy target or document that it is contested.

Phase 1: Instrument and classify churn using the agreed or candidate strategy-fit definitions.

Phase 2: Review conflicting signals with product, analytics, customer success, sales, and strategy stakeholders.

Phase 3: Select one target-fit churn pattern only if preventability, strategic relevance, and measurement quality are sufficient.

Phase 4: Launch a narrow experiment and monitor primary plus guardrail metrics.

Phase 5: Decide whether to scale, revise, stop, or redirect based on evidence quality and strategic alignment.

## Decision Frame

Decision to make: should the team invest in a churn reduction intervention now, and if so, which churn should it reduce?

Recommended decision: do not proceed directly to a retention experiment. First run a strategy-target operationalization step, then proceed to a bounded churn diagnostic and experiment only if the target segment can be classified with enough confidence.

Rationale: the case packet states that churn signals conflict with strategy targets but does not define the strategy target or provide underlying evidence. A segmentation-first PRD is only valid if the segmentation axis exists. In this revised PRD, the first decision is to define that axis or escalate the ambiguity. This reduces the risk of using structured churn analysis to hide an unresolved strategy decision.

Decision rule:

- Proceed to a retention experiment only if the team can classify the affected customers as confirmed or provisionally approved strategy-fit, the churn appears preventable through product or lifecycle changes, and the expected retention gain does not create material support, margin, or roadmap drag.
- Pause intervention selection if the strategy target cannot be translated into observable criteria.
- Escalate to a strategy decision if candidate definitions produce materially different churn conclusions.
- Do not ship if the churn is mostly from non-target customers, unsupported workflows, price-value mismatch outside the strategic segment, or evidence too weak to isolate a causal problem.

## Unknowns & Evidence Gaps

- No churn rate, revenue churn, cohort trend, or baseline is provided.
- No description of the conflicting signals is provided.
- No strategy target definition is provided.
- No operational criteria for strategy fit are provided.
- No segmentation by customer fit, lifecycle stage, plan, acquisition channel, or behavior is provided.
- No cancellation, win/loss, support, usage, or customer interview evidence is provided.
- No current retention interventions or historical experiment results are provided.
- No cost-to-serve or support-load data is provided.

These gaps mean the PRD should be treated as a strategy-target clarification plus churn discovery plan, not as evidence that a specific churn driver has already been validated.

## Pass/Fail Readiness

Pass readiness:

- The strategy target has been translated into observable inclusion and exclusion criteria.
- Churn can be segmented by confirmed target-fit, confirmed non-target, and contested-fit customers.
- A specific preventable churn pattern is identified among confirmed or provisionally approved target-fit customers.
- There is enough behavioral or qualitative evidence to form a testable hypothesis.
- The intervention has a measurable primary outcome and clear guardrails.
- Stakeholders agree that retaining the selected segment supports the strategy.

Fail readiness:

- The only available metric is aggregate churn.
- The strategy target cannot be operationalized into customer-level criteria.
- The main churn source is customers outside the strategy target.
- The proposed intervention would retain customers by expanding into non-strategic use cases.
- The evidence is based only on anecdotal cancellation reasons.
- There is no way to measure whether the intervention improves target-fit retention.
- Candidate strategy definitions produce conflicting churn conclusions and no leadership decision rule exists.

## Recommended Next Artifact

Create a Strategy-Fit Churn Evidence Brief before final implementation. It should include the proposed strategy-fit definition, candidate fallback definitions if alignment is missing, cohort tables, target-fit and contested-fit segmentation, cancellation and support themes, activation and usage analysis, revenue impact, and a ranked list of preventable churn hypotheses. After that, produce an experiment plan for the top target-fit churn hypothesis only if the strategy-fit classification is decision-ready.
