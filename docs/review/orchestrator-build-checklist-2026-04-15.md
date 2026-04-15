# Orchestrator Build Checklist

**Date:** 2026-04-15  
**Purpose:** Break the orchestrator implementation plan into concrete build tasks so Shipwright can move from policy to code.

## Summary

This checklist is the implementation bridge between the orchestration policy and actual product behavior. It is intentionally V1-scoped: build only what is needed to make Shipwright recommend the right level of rigor, ask before spending more, and route unresolved cases correctly.

## Phase 1: Policy Plumbing

### Scenario Class Policy

- Add a config source for scenario classes and defaults.
- Define V1 classes:
  - governance / board / restructuring
  - pricing / packaging
  - product strategy / prioritization
  - customer-evidence synthesis / discovery
  - publication-sensitive work
- For each class, encode:
  - `single_judge_allowed`
  - `cross_family_required`
  - `default_mode`
  - `winner_vs_uncertainty_priority`
- Add a manual override path for ambiguous tasks.

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
  - `high` -> `>= 80% equivalent`
  - `medium` -> `60-79% equivalent`
  - `low` -> `< 60% equivalent`
- Expose:
  - `normalized_confidence_band`
  - `below_double_panel_threshold`
- Keep this mapping in orchestration logic, not the core schema contract.

### Routing Engine

- Add an orchestrator routing module.
- Input:
  - scenario class
  - intended use, if available
  - provider availability
  - current adjudication stage
  - verdict confidence
  - `needs_human_review`
  - uncertainty payload presence
  - panel agreement status
- Output:
  - `recommended_next_mode`
  - `requires_user_confirmation`
  - `ux_state`
  - `recommended_provider_roles`
  - `explanation`
  - `follow_up_artifact`
  - `follow_up_action`

## Phase 2: UX Wiring

### Initial Recommendation State

- Show the recommended initial mode before the run when appropriate.
- Include:
  - why this mode is recommended
  - whether it is the fastest path or safer path
  - whether the class is cross-family required

### Post-Result States

- Implement these V1 states:
  - `provisional_recommendation`
  - `recommend_double_panel`
  - `panel_converged`
  - `escalate_to_judge`
  - `not_ready_gather_more_evidence`
  - `limited_provider_availability`

### Confirmation Prompts

- Add confirmation UX before:
  - running a second model
  - escalating to a judge
- Confirmation copy should say:
  - what will run
  - why Shipwright recommends it
  - what confidence or resolution gain it may provide
  - that it will incur more tokens / latency

### Uncertainty-First Output

- When `needs_human_review` is true or the final verdict is low confidence:
  - prioritize uncertainty drivers
  - surface recommended next artifact
  - surface recommended next action
  - demote the winner label to a lean or secondary detail

### Provider-Limited Output

- If a stronger path is recommended but not runnable:
  - explain the limitation
  - distinguish unavailable-by-plan from temporary outage
  - show the best available fallback

## Phase 3: Data And Persistence

### Orchestrator Metadata

- Decide where orchestration metadata lives:
  - alongside verdicts
  - in a run-level metadata object
  - in a UI/session state layer
- Add fields for:
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

### Panel Agreement Tracking

- Standardize how Shipwright records:
  - agreement on winner
  - disagreement on winner
  - materially divergent rationale
  - review-flag disagreement

## Phase 4: Telemetry

- Log:
  - scenario class
  - initial recommended mode
  - provider availability at decision time
  - user acceptance or decline of escalations
  - normalized confidence band
  - number of double-panel recommendations
  - number of converged panels
  - number of panel disagreements
  - number of judge escalations
  - number of unresolved final outcomes
- Add a basic reporting view or export for:
  - threshold tuning
  - escalation funnel analysis
  - class-level disagreement rates

## Phase 5: Calibration Follow-Ons

- After the UX is live, run targeted calibration on:
  - pricing / packaging
  - product strategy / prioritization
  - customer-evidence synthesis / discovery
- Measure:
  - single-run panel-trigger rate
  - double-panel convergence rate
  - judge-escalation rate
  - uncertainty-payload usefulness

## Suggested File / Subsystem Targets

These are placeholders and should be mapped to the actual code layout before implementation starts:

- orchestrator policy/config module
- provider capability / availability module
- verdict normalization helper
- run routing / controller logic
- result rendering / UX state mapper
- telemetry event emitter

## V1 Acceptance Criteria

- Governance defaults to a safer path than single analysis.
- A single analysis below threshold recommends a double panel.
- Double-panel disagreement recommends judge escalation.
- Extra panel stages never auto-run without confirmation.
- If only one or two providers are available, Shipwright degrades gracefully.
- Review-flagged or low-confidence final outcomes route to uncertainty-first follow-up.
- Telemetry is emitted for threshold and escalation analysis.

## Out Of Scope For V1

- hard statistical calibration of confidence percentages
- automatic provider switching without user awareness
- learned scenario classification
- fully automated multi-stage orchestration without confirmation
- polished domain-specific UX for every scenario class

## Decision Frame

The implementation goal is not a perfect orchestration system. It is a safe, legible V1 that makes Shipwright's rigor policy visible and actionable.

## Unknowns & Evidence Gaps

- which exact files and modules should own the routing logic
- whether orchestration metadata belongs in persisted run records or only in session/UI state
- how lightweight the first confirmation UX can be without becoming confusing

## Pass/Fail Readiness

Pass:

- enough policy work exists to start implementation immediately
- enough clarity exists to build V1 in phases without waiting for more governance analysis

Fail:

- not enough codebase mapping has been done yet to assign exact file ownership
- not enough evidence exists yet to make V1 thresholds permanent

## Recommended Next Artifact

Produce a short **Claude handoff note** summarizing:

- what we learned from governance and Phase 2
- why orchestration is the highest-leverage next move
- what V1 policy we now want to build
- where Claude should pressure-test the plan
