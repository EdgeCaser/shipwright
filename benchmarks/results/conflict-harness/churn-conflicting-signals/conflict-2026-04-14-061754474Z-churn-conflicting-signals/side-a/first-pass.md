# Churn Reduction PRD: Conflicting Signals

## Overview
Reduce avoidable churn without breaking strategy targets by separating retention actions into: 1) immediate no-regret fixes for clearly preventable churn, 2) instrumented tests for ambiguous drivers, and 3) explicit guardrails that prevent the team from improving retention through off-strategy concessions.

## Problem
Churn signals are conflicting. Some data suggests near-term retention issues tied to onboarding, support friction, or missing capabilities, while strategy targets may prioritize a narrower segment, premium positioning, margin discipline, or focus on long-term product direction. Acting on every churn signal risks diluting strategy. Ignoring them risks avoidable revenue loss.

## Goal
Create a decisionable churn program that reduces preventable churn in target accounts while protecting strategic focus.

## Non-Goals
- Retain every at-risk customer at any cost.
- Expand roadmap scope solely to satisfy non-target segments.
- Use one aggregate churn number as the only success metric.

## Users / Stakeholders
- Existing customers at risk of churn
- Customer Success
- Product
- Sales / Account Management
- Finance / Leadership

## Key Insight
Conflicting signals should not be resolved by averaging them together. They should be triaged by segment, cause confidence, strategic fit, and reversibility of the intervention.

## Decision Principles
1. Prioritize churn reduction in strategically aligned customer segments first.
2. Ship no-regret fixes immediately when evidence suggests operational friction rather than strategic mismatch.
3. Treat feature requests from misfit segments as evidence, not automatic roadmap inputs.
4. Require guardrails so retention gains do not come from discounting, custom work, or support-heavy exceptions that violate strategy targets.

## Proposed Approach
### 1. Churn Triage Framework
Every churn signal is classified on four axes:
- Segment fit: target, adjacent, non-target
- Driver type: product gap, onboarding friction, support issue, pricing/packaging mismatch, competitive displacement, low realized value
- Evidence confidence: high, medium, low
- Strategic compatibility: aligned, neutral, conflicting

### 2. Intervention Lanes
- Lane A, No-regret fixes: onboarding, activation, reliability, support handoff, renewal clarity
- Lane B, Target-segment product bets: only for repeated, high-confidence churn drivers in target segments
- Lane C, Contained experiments: pricing, packaging, messaging, or save-play tests with explicit guardrails
- Lane D, deliberate non-action: churn causes from non-target segments or strategy-conflicting asks are documented and not prioritized

### 3. Retention Review Cadence
Establish a weekly churn review that outputs:
- top churn reasons by target segment
- interventions in flight
- guardrail metric status
- unresolved evidence gaps

## Requirements
### Functional Requirements
- Capture churn reasons in a structured taxonomy at cancellation, downgrade, and renewal-risk stages.
- Require segment tagging on all churn records.
- Route each churn reason into one of the four intervention lanes.
- Create an escalation path for high-value target accounts with repeated preventable churn patterns.
- Log explicit rationale when the team chooses non-action due to strategy conflict.

### Measurement Requirements
- Track gross logo churn and revenue churn by segment.
- Track preventable churn rate for target accounts.
- Track activation, time-to-value, support burden, discounting, and margin as guardrails.
- Track intervention-level outcomes, not just overall churn.

### Operational Requirements
- Customer-facing teams use a shared churn reason template.
- Product reviews only target-segment retention issues by default.
- Leadership approves exceptions that trade off strategy for retention.

## Success Metrics
- Primary: reduction in preventable churn for target segments
- Secondary: improved activation and renewal health for target segments
- Guardrails: no material degradation in gross margin, roadmap focus, or support cost-to-serve

## Risks
- Misclassifying churn from non-target users as strategic demand
- Overfitting to anecdotal save conversations
- Creating retention programs that hide rather than solve value gaps
- Failing to instrument causes tightly enough to learn from interventions

## Rollout
### Phase 1
Implement taxonomy, segmentation, and review cadence.

### Phase 2
Ship no-regret fixes and contained experiments.

### Phase 3
Promote winning interventions into standard operating process.

## Decision Frame
Proceed with a segmented churn-reduction program, not a blanket retention initiative. The decision is to reduce preventable churn where it reinforces strategy, while explicitly declining retention work that depends on serving non-target demand or weakening strategic positioning.

## Unknowns & Evidence Gaps
- No direct churn evidence pack is provided in the case packet.
- The size of churn by segment is unknown.
- The relative contribution of onboarding, product, pricing, and support drivers is unknown.
- The current strategy target is referenced but not specified in measurable terms.
- Baseline guardrail thresholds are not defined.

## Pass/Fail Readiness
Pass if:
- churn reasons can be segmented and quantified
- target-segment preventable churn is measurable
- interventions have named owners and guardrails
- explicit non-action decisions are documented for strategy-conflicting requests

Fail if:
- churn is tracked only in aggregate
- retention work is approved without segment fit
- success can only be shown through discounting or exception handling
- the team cannot distinguish evidence-backed drivers from anecdotal noise

## Recommended Next Artifact
A churn-analysis brief that quantifies churn drivers by segment, confidence level, and strategic fit, followed by a prioritization artifact for intervention sequencing.
