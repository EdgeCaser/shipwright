# Orchestrator Implementation Plan

**Date:** 2026-04-15  
**Purpose:** Translate the orchestrator decision spec into an implementable V1 plan for a user decision aid covering backend routing, UI behavior, provider availability handling, and telemetry.

**Scope note:** This plan covers Rigor Mode implementation only. For Fast Mode implementation, see `two-mode-spec-2026-04-15.md`.

## Summary

Shipwright's next reliability win should come from orchestration. The right V1 is a staged adjudication flow that:

- recommends the right mode for the scenario class
- asks before spending more tokens
- adapts to the providers the user actually has available
- escalates from single analysis to double panel to judge only when warranted
- stops forcing convergence when the result is still unresolved

## V1 Product Scope

V1 should support three top-level user-facing states:

1. provisional recommendation
2. more rigor recommended
3. not ready / gather more evidence

V1 should preserve substates as visible diagnostic metadata.

Important V1 substates:

- `single_run_acceptable`
- `panel_converged`
- `double_panel_recommended`
- `judge_recommended`
- `limited_provider_availability`
- `user_declined_escalation`
- `needs_more_evidence`
- `directionally_incoherent`

## System Components

### 1. Scenario Class Policy Layer

Required outputs:

- `scenario_class`
- `provisional`
- `single_judge_allowed`
- `cross_family_required`
- `default_mode`

V1 implementation note:

- governance should be the only clearly policy-backed class in V1
- non-governance config entries should carry `provisional: true`
- customer-evidence synthesis should either be collapsed into product strategy for V1 or gated by explicit routing criteria

### 2. Provider Availability Layer

Required outputs:

- `available_providers`
- `temporarily_unavailable_providers`
- `provider_count`
- `can_run_double_panel`
- `can_run_third_family_judge`

### 3. Confidence Normalization Layer

V1 mapping:

- `high` => above routing threshold
- `medium` => below routing threshold
- `low` => well below routing threshold

Required outputs:

- `normalized_confidence_band`
- `below_double_panel_threshold`

V1 implementation note:

- do not surface numeric percentages to users in V1

### 4. Routing Engine

Required outputs:

- `recommended_next_mode`
- `requires_user_confirmation`
- `recommended_provider_roles`
- `ux_state`
- `ux_substate`
- `explanation`
- `follow_up_artifact`
- `follow_up_action`

## Backend Routing Rules

### Rule 1: Initial Recommendation

- governance or publication-sensitive => recommend `double panel`
- otherwise => recommend `single analysis`

### Rule 2: Single Analysis Outcome

- if confidence is at or above threshold and no review flag is raised, set top-level state to `provisional`
- if confidence is below threshold, or `needs_human_review: true`, or uncertainty payload exists, set top-level state to `more_rigor_recommended`

If no second provider is available:

- set state to `not_ready`
- set substate to `limited_provider_availability`

If the user declines the double panel:

- preserve top-level state according to readiness
- set substate to `user_declined_escalation`

### Rule 3: Double Panel Outcome

- if both models converge on winner and neither raises material review concerns, set top-level state to `provisional` with substate `panel_converged`
- if the panel disagrees, set top-level state to `more_rigor_recommended` with substate `judge_recommended`

If no third provider is available:

- set top-level state to `not_ready`
- set substate to `limited_provider_availability`

### Rule 4: Judge Outcome

- if confidence is acceptable and no review flag is raised, set top-level state to `provisional`
- if confidence is low, or `needs_human_review: true`, or uncertainty payload indicates missing evidence, set top-level state to `not_ready`

If the judge lands in a third direction relative to the panel:

- set top-level state to `not_ready`
- set substate to `directionally_incoherent`

### Rule 5: Review Flag Priority

- `needs_human_review` outranks the winner label

## Recommended UI Behavior

### State 1: Provisional Recommendation

Substates should remain inspectable:

- `single_run_acceptable`
- `panel_converged`
- `user_declined_escalation`

### State 2: More Rigor Recommended

Substates should remain inspectable:

- `double_panel_recommended`
- `judge_recommended`
- `cross_family_required`

### State 3: Not Ready / Gather More Evidence

Show:

- decision is not ready
- specific unresolved reason
- disambiguation questions / needed evidence
- recommended next artifact
- recommended next action

Substates should remain inspectable:

- `needs_more_evidence`
- `limited_provider_availability`
- `directionally_incoherent`
- `user_declined_escalation`

## Data Model Changes

V1 should add or standardize these orchestration fields:

- `scenario_class`
- `provisional`
- `adjudication_mode`
- `recommended_next_mode`
- `requires_user_confirmation`
- `normalized_confidence_band`
- `below_double_panel_threshold`
- `provider_availability`
- `panel_agreement_status`
- `ux_state`
- `ux_substate`
- `follow_up_artifact`
- `follow_up_action`

## Telemetry Plan

Track:

- scenario class
- initial recommended mode
- user-accepted vs user-declined escalations
- top-level UX state
- UX substate
- provider availability at decision time
- single-analysis confidence band
- how often single runs trigger double-panel recommendations
- how often double panels converge
- how often double panels disagree
- how often judge results end in uncertainty-first routing

## Suggested Rollout Phases

### Phase 1: Policy Plumbing

Build:

- scenario class config
- provider availability config
- confidence-band normalization
- routing engine outputs

### Phase 2: UX Wiring

Build:

- the three main user-facing states with accessible substates
- confirmation prompts for extra spend
- uncertainty-first follow-up actions

### Phase 3: Telemetry And Tuning

Build:

- event logging
- threshold dashboards
- escalation funnel tracking

### Phase 4: Class Calibration Expansion

Build:

- small calibration programs for pricing, prioritization, and discovery-like scenarios

## Risks

### Risk 1: Too Much Friction

- keep the recommendation short
- explain the specific value of the next stage
- only require confirmation when extra spend is real

### Risk 2: False Precision Around The Threshold

- frame it as an internal routing threshold
- avoid numeric probability semantics in the UI

### Risk 3: Provider Availability Confusion

- distinguish plan limitation from temporary outage
- always show the best available fallback

### Risk 4: Overfitting To Governance

- keep non-governance defaults explicitly provisional
- use telemetry and calibration work to refine class rules

## Decision Frame

The best next build is a lightweight orchestration layer that makes Shipwright proactively recommend the right level of rigor, asks before spending more, and routes unresolved cases toward evidence rather than false certainty.
