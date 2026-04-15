# Revised artifact

# PRD: Team Inbox Workflow Handoff Improvement

## Summary
Improve team inbox handoffs so conversations move between owners without dropped context, duplicate work, or unclear accountability.

## Problem
Teams using a shared inbox lose time and quality when a conversation needs to move from one owner to another. Current handoffs are inconsistent, rely on manual notes, and make it hard to know who owns the next action.

## Product Decision
Ship a narrow V1 that standardizes handoff initiation, required context capture, and visible handoff state. Treat final ownership-transfer behavior as a design decision to validate before implementation rather than assuming immediate reassignment.

## Goal
Create a handoff workflow that makes a pending transfer explicit, preserves minimum required context, and allows the team to identify conversations needing pickup or acceptance.

## Non-Goals
- Full redesign of inbox information architecture
- New SLA engine or workforce management system
- Cross-channel routing logic beyond inbox handoff events
- AI drafting, classification, or auto-resolution features
- Approval chains, workload balancing, or skills-based routing in V1
- Advanced reporting beyond validation logging

## Users
- Support agents handing off customer conversations
- Specialists receiving escalated or transferred conversations
- Team leads monitoring ownership and stuck work

## User Stories
- As an agent, I want to initiate a handoff with required context so the next person knows what to do.
- As a receiving teammate, I want to see why a conversation was handed off and what action is expected.
- As a lead, I want to identify conversations that are waiting on pickup, acceptance, or follow-up.

## Requirements
### Functional Requirements
1. A user can initiate a handoff from a conversation.
2. The handoff flow requires a destination owner or team.
3. The handoff flow requires a structured reason and optional note.
4. The conversation shows a visible handoff event in the activity history.
5. Conversations with an active handoff show a distinct handoff state in thread and list views.
6. The receiving user or team can view the handoff reason, note, and prior owner.
7. The system records handoff lifecycle events needed to compare pickup time, stuck rate, and duplicate handling before and after launch.
8. Sender and receiver notifications are supported only for the chosen handoff-state model validated in design.
9. Team leads can filter or view conversations by handoff state.

### Validation-Gated Design Decisions
1. Decide whether ownership changes at handoff creation, at recipient acceptance, or at first recipient reply.
2. Decide whether recipient acceptance is required in V1 or whether visibility plus pickup is sufficient.
3. Decide the smallest required set of structured handoff reasons based on current workflow patterns.
4. Confirm whether notifications materially reduce missed handoffs versus relying on visible state alone.

### Guardrails Against Scope Creep
1. V1 supports only manual handoff initiated by a human user.
2. V1 supports one active handoff per conversation.
3. V1 does not include approval chains, workload balancing, or skills-based routing.
4. V1 does not include advanced analytics, except baseline and post-launch event logging needed to validate the workflow.
5. V1 does not expand into queue redesign or broader permissions changes unless discovery proves they are blockers to core handoff reliability.

## UX Principles
- Handoff creation must take less than one minute for a trained user.
- Required context should be minimal but sufficient.
- Pending handoff state must be obvious in list and thread views.
- Receiving users should not need to search for why the handoff occurred.
- The UI must distinguish clearly between current owner, requested recipient, and pending state.

## Success Metrics
- Establish baseline rate of dropped, delayed, or internally reopened handoffs before launch.
- Reduce median time from handoff initiation to recipient pickup.
- Reduce duplicate internal handling on handed-off conversations.
- Increase percentage of handed-off conversations with a clearly observable next step.

## Risks
- Too many required fields may slow agents down.
- An unclear state model may create double-handling.
- If notifications are added without validating the state model, they may amplify confusion instead of reducing it.
- Expanding scope into routing, permissions, or reporting could delay delivery before the core workflow is proven.

## Dependencies
- Existing conversation ownership model
- Notification infrastructure, if retained after validation
- Activity/event logging in conversation history
- Access to current operational data or qualitative workflow review to establish baseline failures

## Rollout
- Run a short discovery pass on current handoff failure modes before locking state transitions.
- Pilot with one inbox after choosing a handoff-state model.
- Measure pickup time, stuck-state rate, and duplicate handling against baseline.
- Expand only if pilot shows clearer accountability without adjacent workflow expansion.

## Decision Frame
Approve a narrow V1 centered on standardized handoff creation, minimum context capture, and visible pending-state tracking. Do not lock immediate ownership transfer or notification behavior as settled requirements until the team validates how current handoffs fail and which state model best prevents duplicate or dropped work.

## Unknowns & Evidence Gaps
- No baseline evidence yet quantifies how often handoffs fail due to missing context, unclear ownership, or missed awareness.
- It is unresolved whether ownership should change immediately, on acceptance, or on first reply.
- It is unresolved whether notifications are necessary for V1 or whether visible state is sufficient.
- Common handoff reasons have not yet been validated from observed workflow data.

## Pass/Fail Readiness
Pass if the team treats ownership semantics, acceptance behavior, and notification behavior as validation-gated decisions while keeping V1 limited to manual handoff, required context, and visible state. Fail if the PRD prematurely commits to unresolved mechanics or absorbs adjacent asks like routing logic, approvals, workload balancing, or broad reporting before core handoff reliability is proven.

## Recommended Next Artifact
Discovery-backed technical spec covering handoff state transitions, ownership semantics options, notification trigger decision, event schema, and pilot instrumentation plan.
