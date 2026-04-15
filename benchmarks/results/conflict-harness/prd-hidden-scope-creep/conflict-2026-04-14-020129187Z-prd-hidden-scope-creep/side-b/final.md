# Revised artifact

# PRD: Team Inbox Workflow Handoff Improvement

## Summary
Improve team inbox handoffs by adding a constrained handoff package: explicit recipient selection, a short structured context block, visible ownership transfer, and basic follow-up for unacknowledged transfers. This PRD is intentionally framed as a scoped reliability intervention, not a general workflow automation initiative.

## Problem
Conversations are handed from one teammate to another without a consistent transfer package. The immediate failure modes are:
- the receiver does not know why the item moved
- the sender believes ownership moved when the receiver has not actually picked it up
- the team cannot distinguish a completed transfer from a dropped conversation

The hidden-scope-creep risk is that a handoff problem can easily expand into routing, workload balancing, reporting, permissions redesign, or a broader case-management rebuild.

## Decision To Make
Decide whether to ship a narrowly bounded v1 that improves human-to-human handoff reliability inside the existing inbox model, or pause this work until the team is ready to fund a broader workflow program.

This PRD recommends the bounded v1 only if stakeholders accept that the goal is transfer reliability, not end-to-end workflow automation.

## Product Goal
Reduce dropped or ambiguous inbox handoffs by making transfer intent, minimum context, and pickup state explicit.

## Users
- Primary: sender handing a conversation to another teammate
- Primary: receiver taking over the conversation
- Secondary: team lead monitoring dropped ownership

## Success Criteria
A v1 is successful if it improves transfer clarity without requiring a broader routing or reporting program.

## Non-Goals
- automatic routing or skill-based assignment
- workload balancing
- queue prioritization logic
- analytics dashboards beyond minimal instrumentation
- permissions or role redesign
- cross-channel case management
- AI-generated summaries

## Scope Principle
Because there is no baseline evidence in the packet proving which intervention level is optimal, scope is set by decision usefulness and implementation containment, not by a claim of proven minimal sufficiency. The boundary for v1 is therefore:
- include only capabilities required to complete, observe, and recover a single human-to-human handoff
- exclude capabilities whose primary value appears only when generalized across many handoffs, queues, or teams

## Functional Requirements
### In Scope for v1
1. A user can initiate a handoff from an existing inbox conversation.
2. Completing a handoff requires only these fields:
   - recipient
   - handoff reason
   - brief current-state summary
   - next recommended action
3. Completing a handoff changes visible assignee to the recipient.
4. The thread records a timestamped handoff event.
5. The recipient receives a notification containing the handoff summary.
6. The system records whether the recipient has viewed or acknowledged the handoff.
7. If no pickup signal occurs within a defined window, the system sends a simple reminder.

### Explicitly Out of Scope for v1
1. Multi-step acceptance workflows.
2. Configurable escalation trees.
3. Taxonomy management for handoff reasons beyond a small fixed list or free text.
4. Dashboarding beyond event capture needed to measure adoption and pickup latency.
5. Any rules engine that changes routing behavior based on handoff metadata.

## UX Requirements
- A typical sender should complete the handoff in under 30 seconds.
- The flow must appear inline within current inbox behavior.
- The receiver must see the handoff summary before re-reading the full thread.

## Data Requirements
Store only the fields needed for the v1 transfer loop:
- sender
- recipient
- handoff timestamp
- reason
- summary
- next action
- pickup status
- pickup timestamp if present

## Metrics
Instrument only the minimum metrics needed to evaluate the decision:
- handoff completion rate
- median time from handoff to receiver pickup
- percentage of handoffs with no pickup within the reminder window
- percentage of conversations reassigned again within 24 hours

## Risks
- Required fields may add enough friction that users bypass the handoff flow.
- Even a minimal pickup state can be misread as the start of a broader workflow engine.
- Reminder behavior can create ownership ambiguity if teams expect escalation rather than a simple nudge.

## Dependencies
- existing inbox assignment model
- existing thread event history or audit capability
- existing notification mechanism
- basic event instrumentation

## Release Criteria
- sender can complete a structured handoff in production
- receiver can see the handoff summary and pickup state
- reminder triggers for unpicked-up handoffs
- minimum success metrics are captured

## Decision Frame
Choose the bounded v1 only if the team agrees the immediate product decision is about transfer reliability inside the current inbox, not about broader workflow modernization. The rationale for this boundary is not that it is fully evidence-proven; it is that this is the smallest coherent slice that closes three concrete gaps: transfer intent, visible ownership change, and pickup detection. If stakeholders need routing logic, richer escalations, or management analytics to justify the project, this PRD should be rejected and replaced with a broader workflow strategy artifact.

## Unknowns & Evidence Gaps
- No baseline data is provided for current handoff failure rate, time-to-pickup, or reassignment churn.
- No user evidence is provided on acceptable sender friction for required fields.
- No evidence is provided on whether "viewed" is sufficient as a pickup signal or whether explicit acknowledgement is necessary.
- No evidence is provided on the appropriate reminder window.
- No evidence is provided on whether team leads need more than reminder visibility for v1.

## Pass/Fail Readiness
Pass if:
- stakeholders explicitly accept the bounded scope principle
- the team can implement pickup detection and a simple reminder without introducing configurable workflow infrastructure
- the team agrees success will be judged by handoff reliability metrics, not by routing or analytics outcomes

Fail if:
- stakeholders expect configurable escalation paths, routing decisions, or dashboarding in the same phase
- the existing inbox architecture cannot support pickup detection without broader system redesign
- the team cannot align on whether reminder-only recovery is acceptable for v1

## Recommended Next Artifact
Technical spec defining the handoff event schema, pickup signal definition, reminder trigger, and the exact boundary conditions that keep v1 from turning into a workflow engine.
