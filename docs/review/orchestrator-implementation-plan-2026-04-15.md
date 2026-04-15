# Orchestrator Implementation Plan

**Date:** 2026-04-15  
**Purpose:** Translate the orchestrator decision spec into an implementable V1 plan covering backend routing, UI behavior, provider availability handling, and telemetry.

## Summary

Shipwright's next reliability win should come from orchestration, not deeper judge research alone. The right V1 is a staged adjudication flow that:

- recommends the right mode for the scenario class
- asks before spending more tokens
- adapts to the providers the user actually has available
- escalates from single analysis to double panel to judge only when warranted
- stops forcing convergence when the result is still unresolved

This plan assumes the policy defined in [orchestrator-decision-spec-2026-04-15.md](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/docs/review/orchestrator-decision-spec-2026-04-15.md:1).

## V1 Product Scope

V1 should support five user-facing states:

1. provisional recommendation
2. recommend double panel
3. panel converged
4. escalate to judge
5. not ready / gather more evidence

V1 should also support four orchestration capabilities:

1. scenario-class-based initial mode recommendation
2. recommend-then-confirm escalation between stages
3. provider-availability-aware fallback behavior
4. uncertainty-first routing when the final result is unresolved

V1 does not need:

- fully calibrated numeric confidence
- automatic model ranking by scenario class
- auto-running multi-stage panels without user confirmation
- a polished long-term UI taxonomy for every edge case

## System Components

### 1. Scenario Class Policy Layer

Responsibility:

- map a task into a scenario class
- attach class defaults and restrictions

V1 classes:

- governance / board / restructuring
- pricing / packaging
- product strategy / prioritization
- customer-evidence synthesis / discovery
- publication-sensitive work

Required outputs:

- `scenario_class`
- `single_judge_allowed`
- `cross_family_required`
- `default_mode`
- `winner_vs_uncertainty_priority`

V1 implementation note:

- start with explicit heuristics / config, not learned classification
- allow manual override for ambiguous tasks

### 2. Provider Availability Layer

Responsibility:

- determine what providers are usable for this user and this session

Required outputs:

- `available_providers`
- `temporarily_unavailable_providers`
- `provider_count`
- `can_run_double_panel`
- `can_run_third_family_judge`

V1 implementation note:

- support both static account configuration and runtime health checks
- distinguish "not configured" from "temporarily unavailable"

### 3. Confidence Normalization Layer

Responsibility:

- convert model-native confidence outputs into routing bands

V1 mapping:

- `high` => `>= 80% equivalent`
- `medium` => `60-79% equivalent`
- `low` => `< 60% equivalent`

Required outputs:

- `normalized_confidence_band`
- `below_double_panel_threshold`

V1 implementation note:

- do not claim this is statistical calibration
- use it only for orchestration policy

### 4. Routing Engine

Responsibility:

- decide what Shipwright should recommend next

Required inputs:

- scenario class policy
- provider availability
- current stage
- confidence band
- `needs_human_review`
- uncertainty payload presence
- panel agreement / disagreement

Required outputs:

- `recommended_next_mode`
- `requires_user_confirmation`
- `recommended_provider_roles`
- `ux_state`
- `explanation`
- `follow_up_artifact`
- `follow_up_action`

### 5. Result Presentation Layer

Responsibility:

- show the user the right message and action for the current state

Required outputs:

- headline state
- current lean or winner when appropriate
- why the current result is or is not ready
- whether more spend is recommended
- one clear next action

## Backend Routing Rules

### Rule 1: Initial Recommendation

If the task is:

- governance or publication-sensitive => recommend `double panel`
- otherwise => recommend `single analysis`

Then filter the recommendation through provider availability:

- if only one provider is available, degrade to `single analysis` with stronger caveat
- if two providers are available, allow `double panel`
- if three providers are available, allow full escalation path

### Rule 2: Single Analysis Outcome

After a single analysis:

- if confidence is at or above threshold and no review flag is raised, set state to `provisional recommendation`
- if confidence is below threshold, or `needs_human_review: true`, or uncertainty payload exists, set state to `recommend double panel`

If no second provider is available:

- set state to `not ready / limited provider availability`
- explain that cross-family confirmation is recommended but unavailable

### Rule 3: Double Panel Outcome

After a double panel:

- if both models converge on winner and neither raises material review concerns, set state to `panel converged`
- if the panel disagrees, set state to `escalate to judge`

If no third provider is available:

- set state to `not ready / unresolved disagreement`
- route to evidence gathering or human review rather than pretending the tie is resolved

### Rule 4: Judge Outcome

After a judge verdict:

- if confidence is acceptable and no review flag is raised, set state to `adjudicated recommendation`
- if confidence is low, or `needs_human_review: true`, or uncertainty payload indicates missing evidence, set state to `not ready / gather more evidence`

### Rule 5: Review Flag Priority

At every stage:

- `needs_human_review` outranks the winner label

Meaning:

- a winner may still be shown as a lean
- but the UX state must be non-ready if review is flagged

## Recommended UI Behavior

### State 1: Provisional Recommendation

Show:

- recommendation or winner
- confidence band
- brief caveat that this is the best current adjudication

Action:

- proceed
- optionally run a panel for more rigor

### State 2: Recommend Double Panel

Show:

- current lean
- reason this should not stand alone
- expected value of a second model
- explicit cost / token warning

Action:

- `Run double panel`
- confirmation required

### State 3: Panel Converged

Show:

- converged recommendation
- note that two model families aligned
- whether further adjudication is optional or required by class

Action:

- proceed
- optionally escalate if user wants publication-grade rigor

### State 4: Escalate To Judge

Show:

- disagreement summary
- why a judge is appropriate
- explicit cost / token warning

Action:

- `Run judge`
- confirmation required

### State 5: Not Ready / Gather More Evidence

Show:

- decision is not ready
- uncertainty drivers
- recommended next artifact
- recommended next action

Action:

- `Create follow-up artifact`
- `Gather more evidence`
- `Open for human review`

### State 6: Limited Provider Availability

Show:

- the stronger path Shipwright would normally recommend
- why it cannot run with the current provider set
- the best available fallback

Action:

- continue with provisional result
- retry later
- switch providers if available outside the current session

## Confirmation Design

V1 rule:

- every stage beyond the current completed run requires explicit user confirmation

That includes:

- adding a second model
- escalating from double panel to judge

Confirmation copy should answer:

- what will run
- why Shipwright recommends it
- what extra confidence or conflict resolution it may provide
- what additional cost / time it may incur

## Provider Availability Handling

### Case 1: One Provider

Behavior:

- allow single analysis only
- never present cross-family escalation as if it were runnable now
- use stronger caveats on unstable classes

Special rule:

- governance and publication-sensitive work should be marked provisional by policy

### Case 2: Two Providers

Behavior:

- allow single analysis and double panel
- if double panel disagrees, present unresolved disagreement when no third judge is available

Special rule:

- do not silently reuse one of the two panel families as a pseudo-judge

### Case 3: Three Providers

Behavior:

- allow the full staged path
- prefer third-family judging when possible

### Case 4: Temporary Outage

Behavior:

- distinguish outage from missing entitlement
- offer retry-later messaging when the recommended provider is temporarily down

## Data Model Changes

V1 should add or standardize these orchestration fields:

- `scenario_class`
- `adjudication_mode`
- `recommended_next_mode`
- `requires_user_confirmation`
- `normalized_confidence_band`
- `below_double_panel_threshold`
- `provider_availability`
- `panel_agreement_status`
- `ux_state`
- `follow_up_artifact`
- `follow_up_action`

These can live in orchestrator metadata rather than the core verdict schema if that keeps the boundary cleaner.

## Telemetry Plan

Shipwright should log enough to learn whether the orchestration policy is helping.

Track:

- scenario class
- initial recommended mode
- user-accepted vs user-declined escalations
- provider availability at decision time
- single-analysis confidence band
- how often single runs trigger double-panel recommendations
- how often double panels converge
- how often double panels disagree
- how often judge results end in uncertainty-first routing
- how often users act on provisional recommendations
- how often users request more rigor even when not prompted

Key questions this telemetry should answer:

- Is the 80% threshold too high or too low?
- Which classes most often escalate?
- Where do users find the extra panel worth the cost?
- Does uncertainty-first routing reduce bad downstream decisions or just increase friction?

## Suggested Rollout Phases

### Phase 1: Policy Plumbing

Build:

- scenario class config
- provider availability config
- confidence-band normalization
- routing engine outputs

Goal:

- the backend can produce the correct recommendation and state

### Phase 2: UX Wiring

Build:

- the five main user-facing states
- confirmation prompts for extra spend
- uncertainty-first follow-up actions

Goal:

- the product stops over-presenting fragile outputs as final answers

### Phase 3: Telemetry And Tuning

Build:

- event logging
- threshold dashboards
- escalation funnel tracking

Goal:

- tune the threshold and class rules based on actual use

### Phase 4: Class Calibration Expansion

Build:

- small calibration programs for pricing, prioritization, and discovery

Goal:

- upgrade some classes from provisional policy to stronger evidence-backed policy

## Engineering Order Of Operations

Recommended build order:

1. scenario class config
2. provider availability detection/config
3. confidence band mapping
4. routing engine
5. recommendation / confirmation UI
6. telemetry

This order minimizes rework because it gets the policy boundary right before polishing the UI.

## Risks

### Risk 1: Too Much Friction

If Shipwright recommends more rigor too often, users may ignore it.

Mitigation:

- keep the recommendation short
- explain the specific value of the next stage
- only require confirmation when extra spend is real

### Risk 2: False Precision Around 80%

Users may read the threshold as scientific calibration.

Mitigation:

- frame it as an internal reliability threshold
- avoid overclaiming probability semantics in the UI

### Risk 3: Provider Availability Confusion

Users may not understand why the recommended path is unavailable.

Mitigation:

- distinguish plan limitation from temporary outage
- always show the best available fallback

### Risk 4: Overfitting To Governance

The current policy is grounded most strongly in governance findings.

Mitigation:

- keep non-governance defaults explicitly provisional
- use telemetry and calibration work to refine class rules

## Decision Frame

The best next build is a lightweight orchestration layer that makes Shipwright proactively recommend the right level of rigor, asks before spending more, and routes unresolved cases toward evidence rather than false certainty.

## Unknowns & Evidence Gaps

- whether the five-state UX is enough, or whether provider-limited unresolved states need a distinct treatment
- whether users prefer a simple "run more rigor?" prompt or a more detailed explanation
- whether some classes will justify skipping the double panel and going straight to judge in practice

## Pass/Fail Readiness

Pass:

- enough evidence exists to implement V1 orchestration policy now
- enough evidence exists to justify confirmation-gated escalation
- enough evidence exists to support provider-aware degradation behavior

Fail:

- not enough evidence exists to lock confidence thresholds permanently
- not enough evidence exists to finalize non-governance class policies without further calibration

## Recommended Next Artifact

Produce a short **orchestrator build checklist** with concrete tasks by file or subsystem so the implementation can begin immediately.
