# Session Implementation Slice Plan

**Date:** 2026-04-15  
**Purpose:** Map the session API/state model onto concrete implementation slices so Shipwright can move from CLI-centric execution to a non-terminal orchestrator product surface.

## Summary

The current codebase already contains most of the logic needed for a real product:

- routing policy
- Fast Mode execution
- Rigor Mode execution
- telemetry
- output schemas

What it does not have is the layer that makes those pieces usable without a terminal:

- persistent sessions
- app-facing actions
- controller logic
- presentation-ready state output

This plan breaks that gap into implementation slices that can be built incrementally.

## Slice 1: Session Store

### Goal

Create a persistent decision session record that survives across user actions.

### New module

- `scripts/session-store.mjs`

### Responsibilities

- create session records
- load session by id
- update session state
- append session events
- persist artifact references

### Suggested file-backed layout

- `benchmarks/results/sessions/<session-id>/session.json`
- `benchmarks/results/sessions/<session-id>/events.jsonl`

### Required functions

- `createSession(input)`
- `getSession(sessionId)`
- `updateSession(sessionId, patch)`
- `appendSessionEvent(sessionId, event)`
- `linkArtifact(sessionId, artifactType, artifactRef)`

### Inputs

- question
- scenario class
- provider availability
- initial orchestrator state

### Outputs

- persisted session object

### Notes

- start file-backed for V1
- keep the storage boundary thin so it can later move to SQLite or app-native storage

## Slice 2: Orchestrator Controller

### Goal

Provide one app-facing controller that owns session lifecycle and action routing.

### New module

- `scripts/decision-session-controller.mjs`

### Responsibilities

- start sessions
- run the initial execution step
- decide whether user confirmation is required
- process user actions
- transition top-level state and substate

### Required functions

- `startDecisionSession(input)`
- `getDecisionSession(sessionId)`
- `confirmNextStep(sessionId)`
- `declineNextStep(sessionId)`
- `retrySessionStep(sessionId)`
- `runFollowUpAction(sessionId, action)`

### Dependencies

- `session-store.mjs`
- `orchestrate.mjs`
- execution adapter layer
- `telemetry.mjs`

### Notes

- this becomes the non-terminal product boundary
- CLI wrappers should eventually call this module rather than duplicating flow logic

## Slice 3: Execution Adapters

### Goal

Wrap the existing runners in stable callable functions that the controller can invoke.

### New module

- `scripts/decision-execution.mjs`

### Responsibilities

- run Fast Mode from session input
- run Rigor Mode from session input
- normalize execution results into session-friendly objects

### Existing code to wrap

- [runFastAnalysis()](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/scripts/run-fast-analysis.mjs:69)
- [runConflictHarness()](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/scripts/run-conflict-harness.mjs:1)

### Required functions

- `executeFastAnalysisForSession(session)`
- `executeRigorAnalysisForSession(session)`

### Output shape

```json
{
  "stage": "post_single",
  "run_id": "fast-2026...",
  "artifact_refs": {
    "analysis_json": "...",
    "run_json": "..."
  },
  "routing_input": {
    "confidence_band": "medium",
    "needs_human_review": false,
    "uncertainty_payload_present": true
  }
}
```

### Notes

- keep shell/process details inside this layer
- the controller should never know about command templates or prompt files

## Slice 4: Session State Mapper

### Goal

Convert raw session + routing data into a product-facing state payload.

### New module

- `scripts/session-presenter.mjs`

### Responsibilities

- produce the app-facing view model
- map internal state/substate into product copy fields
- surface uncertainty payload as primary output for unresolved cases

### Required functions

- `presentSession(session)`
- `buildAvailableActions(session)`
- `buildHeadline(session)`

### Output shape

```json
{
  "session_id": "sess_123",
  "headline": "More rigor recommended",
  "state": "more_rigor_recommended",
  "substate": "cross_family_required",
  "current_recommendation": "Current lean favors delay.",
  "why_this_state": "Governance decisions are not single-judge safe.",
  "recommended_next_action": "Run Rigor Mode",
  "available_actions": [
    "confirm_next_step",
    "decline_next_step"
  ]
}
```

### Notes

- this is the API/UI contract
- raw schema fields and run directories should stay behind this layer

## Slice 5: Entry Point Refactor

### Goal

Turn the current CLI entrypoints into thin adapters over the controller.

### Existing files to refactor

- [shipwright.mjs](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/scripts/shipwright.mjs:1)
- [run-orchestrated.mjs](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/scripts/run-orchestrated.mjs:1)

### Responsibilities after refactor

- parse CLI args
- call controller methods
- print presented session output

### Notes

- keep CLI support
- remove business logic duplication from the entrypoints
- make CLI just one client of the controller

## Slice 6: App/Service Interface

### Goal

Expose the session/controller layer to a non-terminal product surface.

### Possible implementations

- local in-process API for app integration
- minimal HTTP API
- connector-facing function boundary

### Required operations

- create session
- fetch session
- confirm next step
- decline next step
- trigger follow-up action

### Notes

- do not design this around shell invocation
- design it around session ids and action verbs

## Slice 7: Telemetry Integration

### Goal

Move telemetry from script-centric events to session-centric product events.

### Existing file

- [telemetry.mjs](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/scripts/telemetry.mjs:1)

### Additions

- session-level lifecycle events
- action acceptance/decline events
- presentation-state events if helpful

### Suggested events

- `session_started`
- `session_presented`
- `next_step_confirmed`
- `next_step_declined`
- `session_failed`
- `session_completed`

### Notes

- execution events can remain
- session events should become the primary funnel for product analysis

## Slice 8: Follow-Up Action Adapter

### Goal

Handle unresolved-case actions without exposing terminal workflows.

### New module

- `scripts/follow-up-actions.mjs`

### Responsibilities

- map unresolved sessions to product actions
- launch or create follow-up artifacts
- normalize the result back into session state

### V1 scope

- can initially return recommended follow-up payloads rather than fully executing them

### Example actions

- `gather_more_evidence`
- `create_follow_up_brief`
- `open_human_review`

## Suggested Build Order

1. `session-store.mjs`
2. `decision-execution.mjs`
3. `decision-session-controller.mjs`
4. `session-presenter.mjs`
5. refactor `shipwright.mjs` and `run-orchestrated.mjs` to use controller
6. add non-terminal app/service interface
7. add follow-up action adapter
8. expand telemetry to session-first events

## Concrete Mapping From Current Files

### Keep as core logic

- [orchestrate.mjs](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/scripts/orchestrate.mjs:1)
- [run-fast-analysis.mjs](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/scripts/run-fast-analysis.mjs:1)
- [run-conflict-harness.mjs](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/scripts/run-conflict-harness.mjs:1)
- [telemetry.mjs](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/scripts/telemetry.mjs:1)

### Shrink into adapters

- [shipwright.mjs](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/scripts/shipwright.mjs:1)
- [run-orchestrated.mjs](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/scripts/run-orchestrated.mjs:1)

### New seams to add

- `session-store.mjs`
- `decision-execution.mjs`
- `decision-session-controller.mjs`
- `session-presenter.mjs`
- `follow-up-actions.mjs`

## V1 Acceptance Criteria

- a user question creates a persisted session
- the app can fetch current session state by id
- Fast Mode and Rigor Mode can be triggered through controller actions
- escalation can be accepted or declined without terminal interaction
- the presented session output includes state, substate, explanation, and available actions
- CLI entrypoints are thin wrappers over the same controller

## Risks

### Risk 1: Duplicated flow logic

Mitigation:

- move all state transitions into controller
- keep CLI and app as clients, not separate orchestrators

### Risk 2: Leaking script details into product API

Mitigation:

- expose session ids and action verbs only
- keep run directories and shell commands behind the execution adapter

### Risk 3: Overbuilding storage too early

Mitigation:

- start file-backed
- keep store API narrow

## Decision Frame

The correct next implementation move is not a new script. It is a session-centered orchestration layer that turns the current execution pieces into app-callable services and makes CLI just one client of that system.

## Unknowns & Evidence Gaps

- whether the first non-terminal surface will be app-native, HTTP, or another local interface
- whether follow-up actions should be real execution paths in V1 or only structured recommendations
- how much session history the first product surface actually needs to show

## Pass/Fail Readiness

Pass:

- the codebase already contains the core execution and routing pieces
- the missing work is clearly decomposable into implementation slices
- the session contract is now defined enough to start coding

Fail:

- none of the new session modules exist yet
- current entrypoints still own too much flow logic

## Recommended Next Artifact

Start implementation with **Slice 1: session-store.mjs** and **Slice 2: decision-execution.mjs**, because they create the seam that everything else depends on.
