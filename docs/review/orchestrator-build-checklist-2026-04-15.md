# Orchestrator Build Checklist

**Date:** 2026-04-15  
**Purpose:** Break the orchestrator implementation plan into concrete build tasks so Shipwright can move from policy to code.

**Scope note:** This checklist covers Rigor Mode build tasks only. Fast Mode build tasks are defined in `two-mode-spec-2026-04-15.md`.

## Summary

This checklist is the implementation bridge between the orchestration policy and actual product behavior. It is intentionally V1-scoped: build only what is needed to make Shipwright recommend the right level of rigor, ask before spending more, and route unresolved cases correctly.

The implementation target is a user decision aid, not just a verdict classifier.

## Phase 1: Policy Plumbing

### Scenario Class Policy

- Add a config source for scenario classes and defaults.
- Define V1 classes:
  - governance / board / restructuring
  - non-governance provisional classes
  - publication-sensitive work
- For each class, encode:
  - `provisional`
  - `single_judge_allowed`
  - `cross_family_required`
  - `default_mode`
- Add a manual override path for ambiguous tasks.
- Ensure governance is the only policy-backed class in V1.
- Mark non-governance entries `provisional: true`.
- Either collapse customer-evidence synthesis into product strategy for V1 or add explicit routing criteria before shipping.

### Provider Availability

- Add a provider-availability config or detection layer.
- Represent:
  - configured providers
  - temporarily unavailable providers
  - available provider count
- Distinguish:
  - not configured
  - configured but unhealthy
  - configured and healthy
- Expose helper booleans:
  - `can_run_double_panel`
  - `can_run_third_family_judge`

### Confidence Normalization

- Add a normalization helper for verdict confidence.
- Map V1 bands:
  - `high` -> above routing threshold
  - `medium` -> below routing threshold
  - `low` -> well below routing threshold
- Expose:
  - `normalized_confidence_band`
  - `below_double_panel_threshold`
- Keep this mapping in orchestration logic, not the core schema contract.
- Do not expose numeric percentages to users in V1.

### Routing Engine

- Add an orchestrator routing module.
- Output:
  - `recommended_next_mode`
  - `requires_user_confirmation`
  - `ux_state`
  - `ux_substate`
  - `recommended_provider_roles`
  - `explanation`
  - `follow_up_artifact`
  - `follow_up_action`

## Phase 2: UX Wiring

### Post-Result States

- Implement these V1 top-level states:
  - `provisional`
  - `more_rigor_recommended`
  - `not_ready`
- Preserve these V1 substates as visible diagnostic metadata:
  - `single_run_acceptable`
  - `panel_converged`
  - `double_panel_recommended`
  - `judge_recommended`
  - `limited_provider_availability`
  - `user_declined_escalation`
  - `needs_more_evidence`
  - `directionally_incoherent`

### Confirmation Prompts

- Add confirmation UX before:
  - running a second model
  - escalating to a judge

### Uncertainty-First Output

- When `needs_human_review` is true or the final verdict is low confidence:
  - prioritize uncertainty drivers
  - prioritize disambiguation questions
  - prioritize needed evidence
  - surface recommended next artifact
  - surface recommended next action
  - demote the winner label to a lean or secondary detail

### Provider-Limited Output

- If a stronger path is recommended but not runnable:
  - explain the limitation
  - distinguish unavailable-by-plan from temporary outage
  - show the best available fallback
- If two providers disagree and no judge is available:
  - explain why this is unresolved
  - explain why more paneling is not currently possible
  - route to evidence gathering or human review
- If the user declines escalation:
  - preserve the stronger recommendation visibly
  - keep the current result marked with `user_declined_escalation`

## Phase 3: Data And Persistence

### Orchestrator Metadata

- Add fields for:
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

### Panel Agreement Tracking

- Standardize how Shipwright records:
  - agreement on winner
  - disagreement on winner
  - materially divergent rationale
  - review-flag disagreement
  - directional incoherence between panel and judge

## Phase 4: Telemetry

- Log:
  - scenario class
  - initial recommended mode
  - provider availability at decision time
  - user acceptance or decline of escalations
  - normalized confidence band
  - top-level state
  - substate
  - number of double-panel recommendations
  - number of converged panels
  - number of panel disagreements
  - number of judge escalations
  - number of unresolved final outcomes

## Phase 5: Calibration Follow-Ons

- After the UX is live, run targeted calibration on:
  - pricing / packaging
  - product strategy / prioritization
  - discovery-like scenarios only after routing criteria are explicit

## V1 Acceptance Criteria

- Governance defaults to a safer path than single analysis.
- A single analysis below threshold recommends a double panel.
- Double-panel disagreement recommends judge escalation.
- Extra panel stages never auto-run without confirmation.
- If only one or two providers are available, Shipwright degrades gracefully.
- Review-flagged or low-confidence final outcomes route to uncertainty-first follow-up.
- Directionally incoherent final outcomes route to `not_ready`.
- User-declined escalation remains visible in the resulting state.
- Telemetry is emitted for threshold and escalation analysis.

## Decision Frame

The implementation goal is not a perfect orchestration system. It is a safe, legible V1 that makes Shipwright's rigor policy visible and actionable.
