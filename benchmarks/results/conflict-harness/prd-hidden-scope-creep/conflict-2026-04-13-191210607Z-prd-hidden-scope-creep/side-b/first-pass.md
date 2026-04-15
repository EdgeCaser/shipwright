# PRD: Team Inbox Workflow Handoff Improvement

## Decision Frame

Build a narrow handoff workflow for a shared team inbox so one teammate can transfer ownership of an active conversation to another teammate with enough context, accountability, and visibility to prevent dropped work.

This PRD deliberately does not introduce broader inbox redesign, routing automation, SLA tooling, customer analytics, AI summarization, or multi-channel support. The intended improvement is a lightweight, auditable handoff inside the existing team inbox workflow.

### Problem

When a teammate needs to transfer an inbox item, the receiving teammate may not know why the handoff happened, what has already been done, what is expected next, or whether they are now accountable. This creates avoidable rework, delayed responses, and ambiguous ownership.

### Target Users

- Primary: support, success, operations, or sales teammates working from a shared team inbox.
- Secondary: team leads who need to spot unresolved or unclear handoffs without managing every conversation manually.

### Goals

- Make the current owner and next owner explicit during a handoff.
- Require a short handoff note that captures the reason and expected next action.
- Preserve a visible handoff history on the inbox item.
- Give receivers a clear accept or reassign path so ownership is not silently assumed.
- Keep the workflow small enough to ship without changing assignment, notification, or routing systems beyond what is required for handoff state.

### Non-Goals

- No automatic triage, priority prediction, or AI-generated summaries.
- No new SLA policy engine or escalation rules.
- No full inbox information architecture redesign.
- No cross-channel handoff support beyond the existing team inbox surface.
- No manager analytics dashboard beyond basic event visibility needed to validate adoption.
- No permissions model overhaul unless the existing assignment permissions cannot support this flow.

## Product Requirements

### Core Flow

1. A current owner selects `Handoff` on an inbox item.
2. The current owner chooses a receiving teammate from eligible inbox members.
3. The current owner enters a required handoff note with two fields: `Reason for handoff` and `Recommended next step`.
4. The system records the handoff as pending and notifies the receiving teammate through the existing notification pattern.
5. The receiving teammate can `Accept handoff` or `Decline and return` with a short reason.
6. Once accepted, ownership changes to the receiver and the handoff event remains visible in the item history.
7. If declined, ownership returns to the prior owner and the decline reason is added to the item history.

### Functional Requirements

- The handoff action must be available only when an inbox item has a current owner.
- The receiver picker must only include teammates who can access the inbox item under existing access rules.
- The handoff note must be required and must support concise plain text.
- Pending handoffs must show a clear state on the item: `Handoff pending to [teammate]`.
- Pending handoffs must not remove accountability from the current owner until the receiver accepts.
- Accepted handoffs must update owner, timestamp, sender, receiver, and note in item history.
- Declined handoffs must preserve the prior owner and record the receiver's decline reason.
- If the receiver loses access before accepting, the pending handoff must be canceled and the current owner must be notified.
- If the inbox item is closed before acceptance, the pending handoff must be canceled and recorded.

### UX Requirements

- The handoff entry point should live near the existing ownership or assignment controls.
- The handoff modal or panel should be short: receiver, reason, recommended next step, submit.
- The pending state should be visible in the item header or ownership area, not buried only in activity history.
- The receiver's accept or decline action should be available from the inbox item and from the notification destination if applicable.
- Copy should use operational language: `Handoff`, `Accept handoff`, `Decline and return`.

### Data and Events

Track the minimum events needed for product validation:

- `handoff_started`
- `handoff_accepted`
- `handoff_declined`
- `handoff_canceled`
- `handoff_note_missing_validation_error`

Each event should include item ID, inbox ID, sender ID, receiver ID where applicable, timestamp, and terminal state. Do not log handoff note body in analytics unless existing privacy policy already permits equivalent message content logging.

### Success Metrics

- At least 60% of handoffs are accepted without a follow-up reassignment within 24 hours.
- Median time from handoff creation to acceptance is under 4 business hours.
- Fewer reopened or reassigned items attributed to unclear ownership after launch, measured against the existing baseline if available.
- Qualitative feedback from pilot users indicates that the handoff note provides enough context for the next action.

### Guardrail Metrics

- No material increase in average item resolution time for handed-off items after normalizing for item complexity.
- No increase in items with no owner or ambiguous pending owner state.
- No unexpected spike in notification dismissals or duplicate assignment changes.

### Launch Plan

- Ship first to one team inbox or internal pilot group.
- Run the pilot for two weeks or until at least 50 handoff attempts, whichever comes later.
- Review accepted, declined, canceled, and reassigned handoff patterns before expanding.
- Expand only if the workflow reduces ambiguity without introducing assignment churn.

### Risks and Mitigations

- Risk: Users treat handoff as a way to abandon ownership. Mitigation: current owner remains accountable until acceptance.
- Risk: Handoff notes become low-quality. Mitigation: require explicit reason and next-step fields instead of a single empty comment box.
- Risk: The feature becomes a backdoor assignment redesign. Mitigation: reuse existing assignment and access rules; defer routing, queues, and SLA logic.
- Risk: Receivers miss pending handoffs. Mitigation: use existing notification patterns and visible pending state on the item.

## Unknowns & Evidence Gaps

- Current baseline for dropped or unclear handoffs is not provided.
- Existing assignment, ownership, and notification capabilities are unknown.
- Team permissions and inbox access rules are unknown.
- User tolerance for mandatory handoff notes has not been validated.
- It is unclear whether receivers need decline reasons to be required or optional.
- It is unclear whether mobile inbox workflows are in scope for the first release.

## Pass/Fail Readiness

Pass if:

- Handoffs cannot leave an item ownerless.
- Every accepted or declined handoff creates an auditable history entry.
- Receivers have an explicit accept or decline action.
- The sender must provide a reason and recommended next step.
- The implementation reuses existing assignment, access, and notification patterns where possible.
- Pilot data shows handoffs are accepted and acted on without creating reassignment churn.

Fail if:

- Ownership changes before the receiver accepts.
- The feature requires a broader routing, SLA, analytics, or permissions rebuild to be useful.
- Pending handoffs are only visible through hidden activity history.
- Handoff notes are optional in the first release.
- The team cannot measure whether handoffs were accepted, declined, canceled, or later reassigned.

## Recommended Next Artifact

Create a focused workflow spec with state diagram and acceptance criteria for four states: no handoff, pending handoff, accepted handoff, and declined or canceled handoff. Include wireframes only for the owner control, handoff form, pending state, and receiver accept or decline action.
