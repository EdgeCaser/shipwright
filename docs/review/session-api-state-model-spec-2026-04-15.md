# Session API + State Model Spec

**Date:** 2026-04-15  
**Purpose:** Define the minimal session object, user actions, execution callbacks, and UI state contract needed to turn Shipwright's current CLI-based decision analysis flow into a non-terminal product surface.

## Summary

Shipwright is no longer blocked on core reasoning logic. It is blocked on product integration.

The missing layer is a persistent session model that:

- accepts a user question
- runs the correct analysis path behind the scenes
- remembers where the user is in the flow
- exposes recommended next actions
- lets the product continue or stop without asking the user to run terminal commands

This spec defines that layer.

## Design Goal

The orchestrator should be the product surface.

The user should not need to know:

- which script exists
- which mode is being called under the hood
- how to re-run with another provider
- how to interpret raw run directories or schema fields

The session model should absorb all of that and expose:

- current state
- why Shipwright is in that state
- what Shipwright recommends next
- what happens if the user accepts or declines

## Architecture Boundary

This spec sits above:

- [orchestrate.mjs](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/scripts/orchestrate.mjs:1) for routing policy
- [run-fast-analysis.mjs](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/scripts/run-fast-analysis.mjs:1) for Fast Mode execution
- [run-conflict-harness.mjs](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/scripts/run-conflict-harness.mjs:1) for Rigor Mode execution
- [run-orchestrated.mjs](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/scripts/run-orchestrated.mjs:1) as the current CLI flow to be decomposed into service calls

The session layer should become the app-facing contract.

## Session Object

### Required fields

```json
{
  "session_id": "sess_2026_04_15_001",
  "created_at": "2026-04-15T20:00:00.000Z",
  "updated_at": "2026-04-15T20:03:00.000Z",
  "question": "Should we restructure the board now or wait for Q4 results?",
  "scenario_id": "should-we-restructure-the-board-now-or-wait-for-q4-results",
  "scenario_class": "governance",
  "scenario_class_provisional": false,
  "provider_availability": {
    "available_providers": ["claude", "gpt", "gemini"],
    "temporarily_unavailable_providers": [],
    "provider_count": 3,
    "can_run_double_panel": true,
    "can_run_third_family_judge": true
  },
  "stage": "post_single",
  "ux_state": "more_rigor_recommended",
  "ux_substate": "cross_family_required",
  "recommended_next_mode": "double_panel",
  "requires_user_confirmation": true,
  "recommended_provider_roles": {
    "analyst": "claude",
    "second_opinion": "gpt"
  },
  "explanation": "Governance is not single-judge safe...",
  "follow_up_artifact": null,
  "follow_up_action": "Run Rigor Mode",
  "status": "awaiting_user_action"
}
```

### Execution references

Each session should optionally track linked execution records:

```json
{
  "fast_run_id": "fast-2026-04-15...",
  "rigor_run_id": "conflict-2026-04-15...",
  "fast_run_path": "benchmarks/results/fast-analysis/...",
  "rigor_run_path": "benchmarks/results/orchestrated/..."
}
```

### Artifact references

The session should expose the current best artifacts without requiring the client to parse run directories:

```json
{
  "artifacts": {
    "analysis_json": "path-or-object",
    "verdict_json": "path-or-object",
    "uncertainty_payload": {
      "uncertainty_drivers": [],
      "disambiguation_questions": [],
      "needed_evidence": [],
      "recommended_next_action": ""
    }
  }
}
```

### Event log

Each session should record state transitions and user actions:

```json
{
  "events": [
    {
      "type": "session_started",
      "timestamp": "2026-04-15T20:00:00.000Z"
    },
    {
      "type": "fast_completed",
      "timestamp": "2026-04-15T20:01:00.000Z",
      "confidence_band": "medium"
    },
    {
      "type": "escalation_offered",
      "timestamp": "2026-04-15T20:01:05.000Z",
      "recommended_next_mode": "double_panel"
    }
  ]
}
```

## Session Status Values

Keep the lifecycle simple:

- `running`
- `awaiting_user_action`
- `completed`
- `failed`

Interpretation:

- `running`: Shipwright is currently executing Fast or Rigor Mode
- `awaiting_user_action`: Shipwright has a recommendation and is waiting for user confirmation or decline
- `completed`: Shipwright reached a terminal recommendation state with no immediate action required
- `failed`: execution failed and the session needs retry or recovery

## User Actions

The session layer should expose actions, not scripts.

### 1. `start_session`

Purpose:

- create a new session from a plain-language question
- classify the scenario
- assess providers
- run the initial execution step

Input:

```json
{
  "question": "Should we restructure the board now or wait for Q4 results?",
  "scenario_class": "governance",
  "available_providers": ["claude", "gpt", "gemini"],
  "auto_confirm": false
}
```

Output:

- full session object

### 2. `confirm_next_step`

Purpose:

- accept Shipwright's recommendation to spend more tokens / run more rigor

Valid when:

- `requires_user_confirmation` is `true`
- `status` is `awaiting_user_action`

Effect:

- executes the recommended next mode
- updates session state
- appends a session event

### 3. `decline_next_step`

Purpose:

- reject the recommended escalation

Valid when:

- `requires_user_confirmation` is `true`
- `status` is `awaiting_user_action`

Effect:

- preserves the current result
- sets `ux_substate` to `user_declined_escalation`
- updates `status` to `completed`

### 4. `retry_session_step`

Purpose:

- retry a failed or temporarily unavailable step

Valid when:

- `status` is `failed`
- or provider availability changed

### 5. `run_follow_up_action`

Purpose:

- execute a next-step artifact or evidence workflow when the session is `not_ready`

Examples:

- `gather_more_evidence`
- `create_follow_up_brief`
- `open_human_review`

V1 note:

- this can initially return a recommended action instead of actually executing it

## API Shape

Whether this becomes HTTP, local app IPC, or internal service methods, the contract should look like this:

### `POST /decision-sessions`

Starts a session.

Request:

```json
{
  "question": "Should we raise prices by 15% in Q3?",
  "scenario_class": "pricing",
  "available_providers": ["claude"],
  "auto_confirm": false
}
```

Response:

- session object

### `GET /decision-sessions/:id`

Returns:

- full session object

### `POST /decision-sessions/:id/confirm`

Effect:

- runs the recommended next step

### `POST /decision-sessions/:id/decline`

Effect:

- records user-declined escalation
- returns updated session

### `POST /decision-sessions/:id/retry`

Effect:

- retries failed or blocked step

### `POST /decision-sessions/:id/follow-up`

Request:

```json
{
  "action": "gather_more_evidence"
}
```

Effect:

- creates or triggers the next artifact/workflow

## Execution Callbacks

The session layer should call execution functions, not shell commands.

### Required callbacks

- `executeFastAnalysis(session)`
- `executeRigorAnalysis(session)`
- `computeRouting(session, stage_result)`
- `persistSession(session)`
- `emitTelemetry(event, session)`

### Suggested execution flow

1. `start_session`
2. create transient scenario object from question
3. call `executeFastAnalysis`
4. call `computeRouting(stage='post_single')`
5. persist session
6. if confirmation required, return `awaiting_user_action`
7. if user confirms, call `executeRigorAnalysis`
8. call `computeRouting(stage='post_judge')`
9. persist terminal session

## UI State Contract

The UI should not render raw routing internals first. It should render a simple product contract.

### Top-level UI fields

- `headline`
- `state`
- `substate`
- `current_recommendation`
- `why_this_state`
- `recommended_next_action`
- `available_actions`

### Example: provisional

```json
{
  "headline": "Current best recommendation",
  "state": "provisional",
  "substate": "single_run_acceptable",
  "current_recommendation": "Delay the breakup and set measurable stabilization gates.",
  "why_this_state": "Single analysis returned high confidence with no review flags.",
  "recommended_next_action": "Proceed, or run more rigor for extra confidence.",
  "available_actions": ["continue", "run_more_rigor"]
}
```

### Example: more rigor recommended

```json
{
  "headline": "More rigor recommended",
  "state": "more_rigor_recommended",
  "substate": "cross_family_required",
  "current_recommendation": "Current lean favors delay.",
  "why_this_state": "Governance decisions are not single-judge safe.",
  "recommended_next_action": "Run Rigor Mode.",
  "available_actions": ["confirm_next_step", "decline_next_step"]
}
```

### Example: not ready

```json
{
  "headline": "Decision not ready",
  "state": "not_ready",
  "substate": "needs_more_evidence",
  "current_recommendation": "Do not force a winner yet.",
  "why_this_state": "The adjudication remained uncertain after escalation.",
  "recommended_next_action": "Gather the evidence listed below.",
  "available_actions": ["run_follow_up_action", "open_human_review"]
}
```

## State Transition Rules

### `start_session`

- creates session
- runs Fast Mode
- lands in:
  - `provisional`
  - `more_rigor_recommended`
  - or `not_ready`

### `confirm_next_step`

- only valid from `awaiting_user_action`
- runs the recommended next stage
- may land in:
  - `provisional`
  - `not_ready`
  - or `failed`

### `decline_next_step`

- only valid from `awaiting_user_action`
- lands in:
  - `completed`
  - with `ux_substate = user_declined_escalation`

### `run_follow_up_action`

- valid from `not_ready`
- creates an artifact or follow-up path
- may keep session open or create a linked child artifact

## Persistence Strategy

V1 can start with file-backed session persistence.

Suggested layout:

- `benchmarks/results/sessions/<session-id>/session.json`
- `benchmarks/results/sessions/<session-id>/events.jsonl`
- links to `stage-1-fast/` and `stage-2-rigor/`

This is enough for:

- app retrieval
- retry behavior
- stateful UI
- debugging

Later, this can move to SQLite or app-native storage.

## Telemetry Integration

The session layer should be the main telemetry source.

Log:

- session started
- fast completed
- escalation offered
- escalation accepted
- escalation declined
- rigor completed
- session completed
- session failed

This keeps telemetry attached to user-visible product behavior rather than just raw script execution.

## Error Model

The API should distinguish:

- `provider_unavailable`
- `execution_failed`
- `invalid_action`
- `session_not_found`
- `confirmation_required`

Example:

If the user tries to confirm a session that is already completed:

```json
{
  "error": "invalid_action",
  "message": "Session is not awaiting confirmation."
}
```

## V1 Non-Goals

- full GUI design
- automatic background escalation without confirmation
- calibrated confidence probabilities
- fully automated evidence-gathering workflows

## Decision Frame

The non-terminal product version of Shipwright should be built around a persistent decision session model. The current scripts can remain as adapters, but the product surface should talk to sessions, actions, and states instead of shell commands.

## Unknowns & Evidence Gaps

- whether file-backed sessions are enough for the first product surface
- whether follow-up artifact generation should be synchronous or queued
- whether scenario classification should be explicit input or inferred at session start

## Pass/Fail Readiness

Pass:

- enough execution logic already exists to sit behind a session layer
- enough routing logic exists to expose a stable product state contract
- enough product policy exists to define user actions cleanly

Fail:

- there is no session persistence layer yet
- there is no app-facing action API yet
- current execution is still centered on CLI entrypoints

## Recommended Next Artifact

Produce an **implementation slice plan** that maps this session model onto concrete files/modules:

- session store
- orchestrator controller
- execution adapters
- UI/presentation adapter
