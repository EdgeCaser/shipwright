# PRD: Team Inbox Workflow Handoff Improvement

## Summary
Improve team inbox handoffs so conversations move between owners without dropped context, duplicate work, or unclear accountability.

## Problem
Teams using a shared inbox lose time and quality when a conversation needs to move from one owner to another. Current handoffs are inconsistent, rely on manual notes, and make it hard to know who owns the next action.

## Goal
Create a handoff workflow that preserves context, assigns a clear next owner, and makes handoff state visible to the team.

## Non-Goals
- Full redesign of the inbox information architecture
- New SLA engine or workforce management system
- Cross-channel routing logic beyond inbox handoff events
- AI drafting, classification, or auto-resolution features

## Users
- Support agents handing off customer conversations
- Specialists receiving escalated or transferred conversations
- Team leads monitoring ownership and resolution flow

## User Stories
- As an agent, I want to hand off a conversation with required context so the next owner can act without re-reading the full thread.
- As a receiving teammate, I want to see why the handoff happened and what action is expected.
- As a lead, I want to see handoff status and ownership so I can catch stuck conversations.

## Requirements
### Functional Requirements
1. A user can initiate a handoff from a conversation.
2. The handoff flow requires a destination owner or team.
3. The handoff flow requires a structured reason and optional note.
4. The receiving owner sees the handoff reason, note, and prior owner.
5. Ownership updates to the receiving owner or queue at completion of handoff.
6. The conversation shows a visible handoff event in the activity history.
7. Conversations in handoff show a distinct status so the team can identify pending transitions.
8. The sender and receiver receive notifications for created and completed handoffs.
9. Team leads can filter or view conversations by handoff status.

### Guardrails Against Scope Creep
1. V1 supports only manual handoff initiated by a human user.
2. V1 supports one active handoff per conversation.
3. V1 does not include approval chains, workload balancing, or skills-based routing.
4. V1 does not add analytics beyond basic event logging needed for validation.

## UX Principles
- Handoff must take less than one minute for a trained user.
- Required context should be minimal but sufficient.
- Ownership state must be obvious in list and thread views.
- Receiving users should not need to search for why the handoff occurred.

## Success Metrics
- Reduce conversations reopened internally due to incomplete handoff context.
- Reduce median time from handoff initiation to first response by receiving owner.
- Increase percentage of handed off conversations with clear next owner.
- Decrease duplicate replies on handed off conversations.

## Risks
- Too many required fields may slow agents down.
- Ambiguous ownership states may create double-handling.
- Expanding scope into routing, permissions, or analytics could delay delivery.

## Dependencies
- Existing conversation ownership model
- Notification infrastructure
- Activity/event logging in conversation history

## Rollout
- Internal pilot with one team inbox
- Review handoff completion and stuck-state rates
- Expand to more inboxes after validation

## Decision Frame
Ship a narrow V1 handoff workflow focused on explicit ownership transfer and context capture. The decision is useful only if the team holds scope at manual handoff, visible state, and basic notifications; routing, approvals, and advanced analytics should be deferred.

## Unknowns & Evidence Gaps
- Which handoff reasons are common enough to merit structured presets
- Whether ownership should change immediately or only after acceptance
- What list-view state best prevents duplicate handling
- Baseline current failure rate for dropped or unclear handoffs

## Pass/Fail Readiness
Pass if V1 is limited to manual handoff, required context, visible status, and ownership clarity, with measurable validation in pilot. Fail if the project absorbs adjacent asks like routing logic, approvals, workload balancing, or broad reporting before core handoff reliability is proven.

## Recommended Next Artifact
Technical spec defining state transitions, notification triggers, permissions, and event schema for conversation handoff.
