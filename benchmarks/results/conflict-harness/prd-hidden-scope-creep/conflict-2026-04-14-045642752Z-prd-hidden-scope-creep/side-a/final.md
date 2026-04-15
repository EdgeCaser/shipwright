# Revised artifact

## PRD: Team Inbox Workflow Handoff Improvement

## Summary
Improve how one agent hands off a conversation in the team inbox to another agent so ownership is clear, context is preserved, and the next agent can act without re-triage. This PRD is intentionally scoped to workflow handoff only and excludes broader inbox redesign, routing automation, SLA policy changes, or analytics overhauls.

## Problem
Team inbox conversations often need to move from one owner to another because of shift changes, functional specialization, or escalation. Current handoffs can be incomplete or ambiguous, causing duplicate review, delayed responses, and dropped context.

## Goal
Reduce friction in conversation handoff inside the existing team inbox.

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
1. As an agent, I can hand off a conversation to another teammate with a handoff summary.
2. As an agent, I can indicate why the conversation is being handed off.
3. As the receiving agent, I can see the previous owner, handoff time, and handoff summary in the conversation view.
4. As the receiving agent, I can acknowledge the handoff by taking ownership if acknowledgment is retained after validation.
5. As a lead, I can distinguish handoff events from ordinary reassignments in the audit trail.

## Requirements
### Functional Requirements
1. Add a dedicated handoff action within the existing assignment workflow.
2. Require selection of a target owner.
3. Require a handoff summary when the dedicated handoff action is used.
4. Persist handoff metadata on the conversation record.
5. Display the latest handoff summary prominently to the receiving owner.
6. Record a timestamped handoff event in conversation history.
7. Preserve normal reassignment for cases that are not workflow handoffs.

### Validation-Gated Product Decisions
1. The v1 form should test whether structured prompts outperform a single freeform handoff note on completeness and speed.
2. Candidate prompts to test are: reason, current status, next action, and risk or blocker.
3. The controlled reason list should remain provisional until user validation confirms that it improves consistency without adding material friction.
4. Receiving-owner acknowledgment should remain provisional until the team confirms it improves accountability more than it slows work.

### Non-Functional Requirements
1. Handoff action must fit inside the current inbox UI with minimal retraining.
2. Added steps should not materially slow simple transfers.
3. Audit data must be exportable through existing internal data pathways if those already exist.

## UX Notes
- Use the existing assignment surface rather than a separate workflow.
- Start with the lightest viable handoff form.
- If structured prompts are used, keep them concise and limited to fields validated as useful.
- Show the handoff card near the top of the conversation for the new owner until first action or acknowledgment if acknowledgment is retained.

## Success Metrics
### Primary
- Reduction in median time from reassignment to first meaningful action by new owner
- Reduction in conversations with multiple internal clarification messages after handoff

### Guardrails
- No material increase in total reassignment time for simple cases
- No rise in abandoned conversations after transfer
- No significant increase in agent-reported friction for ordinary transfers

## Rollout
1. Validate current handoff behavior and baseline failure modes with frontline users.
2. Prototype the lightest viable handoff form and test freeform versus lightly structured variants.
3. Pilot with one team inbox.
4. Expand to additional teams only if completeness improves and guardrails hold.

## Risks
- Mandatory fields may create agent friction if overdesigned.
- Teams may misuse handoff for ordinary reassignment if distinction is unclear.
- Without explicit scope control, this work can expand into routing, reporting, or staffing tools.
- Locking field requirements too early could harden the wrong workflow.

## Decision Frame
Approve a v1 focused only on structured workflow handoff inside the existing team inbox. The core decision is whether reducing ambiguity at transfer is valuable enough to justify a lightweight required workflow. This PRD recommends yes, but limits the committed requirement to a required handoff summary plus auditability and visibility. Specific field structure beyond that is a validation-gated design decision, not yet a fixed requirement.

## Unknowns & Evidence Gaps
- No baseline data is provided on current handoff failure rate, latency, or conversation drops.
- No user research is provided on which handoff fields are truly necessary.
- It is unknown whether acknowledgment should be mandatory or passive.
- It is unknown whether team-level queues, not named individuals, are part of the real workflow.
- It is unvalidated whether a controlled reason list improves consistency more than it adds friction.

## Pass/Fail Readiness
Pass with revision. The problem and v1 scope are clear enough to align design and engineering, but implementation should not lock the detailed handoff form yet. The team should confirm baseline metrics, validate the minimum useful handoff fields with frontline users, and resolve whether queue handoff and acknowledgment are in scope before build commitment.

## Recommended Next Artifact
User research and lightweight technical spec covering current-state workflow, candidate handoff form variants, event model, UI states, and instrumentation plan.
