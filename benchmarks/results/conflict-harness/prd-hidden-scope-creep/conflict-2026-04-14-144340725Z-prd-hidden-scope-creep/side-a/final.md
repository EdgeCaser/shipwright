# Revised artifact

## PRD: Team Inbox Workflow Handoff Improvement

## Summary
Improve handoffs inside the team inbox so work can move from one owner to another without losing context, dropping SLAs, or creating duplicate effort.

## Problem
Teams using a shared inbox need to transfer conversations across shifts, functions, or escalation levels. Current handoffs are often implicit, inconsistently documented, and hard to track. This creates three failures: the next owner lacks context, customers wait while ownership is unclear, and managers cannot distinguish real backlog from stalled handoffs.

## Goal
Enable explicit, trackable handoffs for inbox conversations with enough structure to preserve context and enough guardrails to prevent hidden workflow expansion.

## Success Metrics
- Reduce conversations reopened due to missing handoff context.
- Reduce median time between handoff initiation and first response by new owner.
- Reduce conversations with ambiguous ownership after handoff.
- Measure completion rate for the v1 handoff note template and use it to decide whether stricter required fields are warranted.

## Non-Goals
- No full workflow builder.
- No cross-system ticket orchestration.
- No staffing, routing, or workforce-management redesign.
- No AI summarization requirement in v1.
- No changes to customer-facing message delivery semantics.

## Users
- Primary: support agents handing off conversations.
- Secondary: receiving agents or teams.
- Secondary: team leads monitoring queue health and SLA risk.

## User Stories
- As a sending agent, I want to hand off a conversation with clear transfer context so I can end my shift without losing continuity.
- As a receiving agent, I want to see why the handoff happened, what was already done, and what I should do next.
- As a team lead, I want to identify pending handoffs that are at risk of stalling so I can intervene before SLAs are missed.

## Requirements
### Functional Requirements
1. A user can initiate a handoff from a conversation.
2. A handoff requires a destination owner or team.
3. A handoff requires a handoff note, with a v1 template that prompts for reason, current status, and next recommended action.
4. The conversation remains assigned to the current owner until the handoff is accepted or auto-completed by configured policy.
5. The receiving owner sees a distinct pending handoff state and the provided context.
6. The system records handoff timestamps: initiated, accepted, completed, or declined.
7. Ownership state is always explicit: current owner, pending recipient, and final owner after completion.
8. A declined handoff must capture a reason and return the conversation to a defined owner state.
9. Managers can view a list of pending handoffs and sort or filter by age.
10. Conversation history must show handoff events in the activity log.

### UX Requirements
- Initiating a handoff should take under 30 seconds for a trained user.
- The handoff note template should be visible in one compact form.
- Pending handoff status should be obvious in inbox list and conversation detail.
- Acceptance and decline actions should be available from the receiving workflow.

### Reporting Requirements
- Track handoff volume, acceptance rate, time to acceptance, decline rate, and handoff age.
- Support filtering by team, inbox, and handoff reason when available.
- Defer any hard-coded overdue classification until the team validates a threshold or policy.

## Scope Boundaries
This PRD covers explicit handoff creation, acceptance/decline, status visibility, and basic reporting. It does not cover generalized task management, multi-step approvals, skill-based routing engines, or external system sync. Any request that introduces configurable workflow branching, custom states beyond handoff lifecycle, or dependency management is out of scope for v1.

## Assumptions
- The inbox already supports conversation ownership.
- Teams have a concept of assignable users or groups.
- Activity logs and SLA measurements already exist or can be extended.

## Risks
- Teams may use handoffs as a substitute for broader queue-routing needs.
- Even a light handoff note may create friction if the template is too heavy.
- Ambiguity between assignment and handoff may confuse users if labels are unclear.
- Teams may ask for overdue alerts before there is evidence for a universal threshold.

## Rollout Recommendation
Ship to one internal-support or pilot team first. Use the pilot to validate whether the v1 note template captures enough context and whether a shared overdue threshold is needed or team-specific.

## Decision Frame
Build a narrow v1 focused on explicit conversation handoff lifecycle, lightweight context capture, and manager visibility into pending handoff age. Do not treat specific context fields or overdue thresholds as settled truths before pilot evidence exists. The decision is useful if it helps the team choose a small, testable release over a generalized operations redesign.

## Unknowns & Evidence Gaps
- Current baseline rate of failed or delayed handoffs is not provided.
- The proposed v1 note template fields (reason, current status, next recommended action) are hypotheses to test, not yet evidence-backed mandatory schema.
- No confirmation on whether acceptance should be mandatory for all teams or policy-driven.
- No validated threshold yet for what counts as an overdue handoff; v1 should expose age, not a universal overdue rule.

## Pass/Fail Readiness
Pass if the team agrees on the narrow v1 scope, ownership state model, lightweight handoff note approach, and pilot metrics. Pass only if stakeholders accept that field strictness and overdue thresholds will be validated during the pilot rather than hard-coded upfront. Fail if stakeholders require workflow automation, external routing, configurable approvals, or a universal overdue rule before launch, because that would indicate hidden scope creep or premature specification.

## Recommended Next Artifact
Pilot experiment brief and technical spec covering conversation ownership state transitions, handoff event schema, handoff note template instrumentation, and evaluation criteria for field strictness and overdue-threshold policy.
