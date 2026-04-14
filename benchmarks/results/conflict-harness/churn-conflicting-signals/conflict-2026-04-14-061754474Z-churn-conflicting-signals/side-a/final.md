# Revised artifact

## Churn Reduction PRD: Conflicting Signals

## Overview
Reduce avoidable churn without breaking strategy targets by separating immediate evidence collection from intervention selection. Because the case packet provides no churn evidence, this PRD defines a decision process and provisional operating lanes rather than asserting a fixed retention program as already validated.

## Problem
Churn signals are conflicting. Some signals may indicate onboarding, support, pricing, or product issues, while strategy targets may require focus on a narrower segment, premium positioning, margin discipline, or long-term roadmap concentration. Acting on all churn signals risks strategy drift. Ignoring them risks preventable loss.

## Goal
Create a decisionable churn program that lowers preventable churn in strategically aligned accounts while preserving strategy targets.

## Non-Goals
- Retain every at-risk customer at any cost.
- Expand roadmap scope solely to satisfy non-target segments.
- Treat aggregate churn as sufficient evidence for intervention choice.
- Lock in a fixed intervention mix before segment and driver evidence exists.

## Users / Stakeholders
- Existing customers at risk of churn
- Customer Success
- Product
- Sales / Account Management
- Finance / Leadership

## Core Product Decision
The immediate product decision is not which churn fix to scale first. The immediate decision is to install an evidence-gated churn triage system that classifies churn by segment fit, driver type, confidence, and strategic compatibility before major retention investments are approved.

## Decision Principles
1. Prioritize churn reduction in strategically aligned segments first.
2. Separate evidence gathering from intervention scaling.
3. Ship only no-regret operational fixes before full driver validation.
4. Treat strategy-conflicting requests as inputs to document, not automatic roadmap commitments.
5. Require guardrails so retention gains do not come from discounting, custom work, or support-heavy exceptions.

## Proposed Approach
### 1. Evidence-Gated Churn Triage
Every churn signal is classified on four axes:
- Segment fit: target, adjacent, non-target
- Driver type: product gap, onboarding friction, support issue, pricing or packaging mismatch, competitive displacement, low realized value
- Evidence confidence: high, medium, low
- Strategic compatibility: aligned, neutral, conflicting

### 2. Provisional Intervention Lanes
These lanes are operating buckets, not yet evidence-ranked priorities:
- Lane A, no-regret fixes: onboarding clarity, activation friction, reliability, support handoff, renewal communication
- Lane B, target-segment product responses: reserved for repeated, high-confidence churn drivers in target segments
- Lane C, contained experiments: pricing, packaging, messaging, or save-play tests with explicit guardrails
- Lane D, deliberate non-action: documented cases where churn is driven by non-target demand or strategy-conflicting requests

### 3. Decision Rule For Moving From Evidence To Action
- High-confidence, target-segment, strategy-aligned drivers move to implementation.
- Low-confidence or mixed-signal drivers remain in instrumentation until validated.
- Strategy-conflicting drivers require explicit leadership review before any exception is approved.
- Aggregate churn changes alone cannot justify roadmap shifts without driver-level evidence.

### 4. Review Cadence
Establish a weekly churn review that outputs:
- top churn reasons by target segment
- current evidence confidence by driver
- interventions in flight
- strategy-conflict decisions made
- guardrail metric status
- unresolved evidence gaps

## Requirements
### Functional Requirements
- Capture churn reasons in a structured taxonomy at cancellation, downgrade, and renewal-risk stages.
- Require segment tagging on all churn records.
- Require confidence scoring for each asserted churn driver.
- Route each churn reason into an evidence status: validated, provisional, unverified.
- Log explicit rationale when the team chooses implementation, experiment, or non-action.
- Create an escalation path for high-value target accounts with repeated preventable churn patterns.

### Measurement Requirements
- Track gross logo churn and revenue churn by segment.
- Track preventable churn rate for target accounts.
- Track activation, time-to-value, support burden, discounting, and margin as guardrails.
- Track intervention-level outcomes, not just overall churn.
- Track the share of churn records with validated versus unverified driver attribution.

### Operational Requirements
- Customer-facing teams use a shared churn reason template.
- Product reviews target-segment retention issues by default.
- Leadership approves exceptions that trade off strategy for retention.
- Any request for product investment must cite segment distribution and driver-confidence data.

## Success Metrics
- Primary: reduction in preventable churn for target segments
- Secondary: improved activation and renewal health for target segments
- Decision-quality metric: increase in the share of churn decisions backed by validated driver evidence
- Guardrails: no material degradation in gross margin, roadmap focus, or support cost-to-serve

## Risks
- Misclassifying churn from non-target users as strategic demand
- Overfitting to anecdotal save conversations
- Treating provisional lanes as confirmed priorities
- Creating retention programs that hide rather than solve value gaps
- Failing to instrument causes tightly enough to learn from interventions

## Rollout
### Phase 1
Implement taxonomy, segmentation, confidence scoring, and review cadence.

### Phase 2
Ship no-regret fixes and run contained experiments only where evidence thresholds are met.

### Phase 3
Promote validated interventions into standard operating process.

## Decision Frame
Proceed with an evidence-gated, segmented churn-reduction program, not a blanket retention initiative and not a pre-committed four-lane solution. The decision is to install a triage and governance mechanism that allows no-regret action now, defers larger investments until driver evidence is stronger, and explicitly declines retention work that weakens strategy.

## Unknowns & Evidence Gaps
- No direct churn evidence pack is provided in the case packet.
- The size of churn by segment is unknown.
- The relative contribution of onboarding, product, pricing, support, and competitive drivers is unknown.
- The current strategy target is referenced but not specified in measurable terms.
- Baseline guardrail thresholds are not defined.
- No evidence establishes which intervention lane, if any, should be prioritized first.

## Pass/Fail Readiness
Pass if:
- churn reasons can be segmented and quantified
- target-segment preventable churn is measurable
- driver confidence can be scored from actual evidence
- interventions have named owners and guardrails
- explicit non-action decisions are documented for strategy-conflicting requests

Fail if:
- churn is tracked only in aggregate
- retention work is approved without segment fit or driver validation
- provisional intervention lanes are treated as evidence-backed priorities
- success can only be shown through discounting or exception handling
- the team cannot distinguish evidence-backed drivers from anecdotal noise

## Recommended Next Artifact
A churn-analysis brief that quantifies churn drivers by segment, confidence level, and strategic fit, followed by a prioritization artifact that ranks validated interventions rather than generic retention categories.
