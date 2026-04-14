# PRD: Team Inbox Workflow Handoff Improvement

## Summary
Improve how one agent hands off a conversation in the team inbox to another agent so ownership is clear, context is preserved, and the next agent can act without re-triage. This PRD is intentionally scoped to workflow handoff only and excludes broader inbox redesign, routing automation, SLA policy changes, or analytics overhauls.

## Problem
Team inbox conversations often need to move from one owner to another because of shift changes, functional specialization, or escalation. Current handoffs can be incomplete or ambiguous, causing duplicate review, delayed responses, and dropped context.

## Goal
Reduce friction in conversation handoff inside the existing team inbox workflow.

## Non-Goals
- Rebuilding inbox information architecture
- Automatic skill-based routing
- Workforce management or staffing optimization
- Cross-channel unification changes
- Full reporting suite redesign

## Users
- Primary: support or operations agents handing off conversations
- Secondary: receiving agents who must resume work quickly
- Tertiary: team leads monitoring workflow reliability

## Jobs To Be Done
- As a current owner, I want to hand off a conversation with enough structure that the next owner knows what happened, what remains, and what to do next.
- As a receiving owner, I want to see why the conversation was handed off and what action is expected so I can proceed without rereading the full thread.
- As a team lead, I want handoffs to be auditable so I can spot breakdowns in ownership and latency.

## User Stories
1. As an agent, I can assign a conversation to another teammate with a required handoff note.
2. As an agent, I can specify a handoff reason from a short controlled list plus optional free text.
3. As the receiving agent, I can see the previous owner, handoff time, reason, and note in the conversation view.
4. As the receiving agent, I can acknowledge the handoff by taking ownership.
5. As a lead, I can distinguish handoff events from ordinary reassignments in the audit trail.

## Requirements
### Functional Requirements
1. Add a dedicated handoff action within the existing assignment workflow.
2. Require selection of a target owner.
3. Require a structured handoff note with at least: current status, next action, and risk/blocker if present.
4. Require selection of a handoff reason: shift end, specialization needed, escalation, or other.
5. Persist handoff metadata on the conversation record.
6. Display the latest handoff summary prominently to the receiving owner.
7. Record a timestamped handoff event in conversation history.
8. Allow the receiving owner to claim or accept ownership.
9. Preserve normal reassignment for cases that are not workflow handoffs.

### Non-Functional Requirements
1. Handoff action must fit inside the current inbox UI with minimal retraining.
2. Added steps should not materially slow simple transfers.
3. Audit data must be exportable through existing internal data pathways if those already exist.

## UX Notes
- Use the existing assignment surface rather than a separate workflow.
- Present a concise structured form, not a long freeform template.
- Show the handoff card near the top of the conversation for the new owner until first action or acknowledgment.

## Success Metrics
### Primary
- Reduction in median time from reassignment to first meaningful action by new owner
- Reduction in conversations with multiple internal clarification messages after handoff

### Guardrails
- No material increase in total reassignment time for simple cases
- No rise in abandoned conversations after transfer

## Rollout
1. Internal pilot with one team inbox
2. Review handoff completion quality and operational friction
3. Expand to additional teams if guardrails hold

## Risks
- Mandatory fields may create agent friction if overdesigned.
- Teams may misuse handoff for ordinary reassignment if distinction is unclear.
- Without explicit scope control, this work can expand into routing, reporting, or staffing tools.

## Decision Frame
Approve a v1 focused only on structured person-to-person handoff inside the existing team inbox. The core decision is whether reducing ambiguity at transfer is valuable enough to justify a lightweight required workflow. This PRD recommends yes, with scope constrained to metadata capture, visibility, acknowledgment, and auditability.

## Unknowns & Evidence Gaps
- No baseline data is provided on current handoff failure rate, latency, or conversation drops.
- No user research is provided on which handoff fields are truly necessary.
- It is unknown whether acknowledgment should be mandatory or passive.
- It is unknown whether team-level queues, not named individuals, are part of the real workflow.

## Pass/Fail Readiness
Pass with revision. The problem and v1 scope are clear enough to align design and engineering, but implementation should not start until the team confirms baseline metrics, validates the handoff form fields with frontline users, and resolves whether queue handoff is in scope.

## Recommended Next Artifact
Technical spec for handoff event model, UI states, audit trail behavior, and metrics instrumentation plan.
