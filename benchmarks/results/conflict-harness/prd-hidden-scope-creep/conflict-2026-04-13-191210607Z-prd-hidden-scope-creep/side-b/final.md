# PRD: Team Inbox Workflow Handoff Improvement

## Decision Frame

Build a narrow handoff workflow for a shared team inbox so one teammate can transfer ownership of an active inbox item to another teammate with clear context, explicit accountability, and visible history.

This PRD is intentionally limited to the handoff interaction itself. It does not introduce inbox redesign, routing automation, SLA tooling, customer analytics, AI summarization, cross-channel support, or a new reporting system. Any validation must use existing operational data if it already exists, or manual pilot review if it does not.

### Problem

When a teammate needs to transfer an inbox item, the receiving teammate may not know why the handoff happened, what has already been done, what is expected next, or whether they are now accountable. This creates avoidable rework, delayed responses, and ambiguous ownership.

### Target Users

- Primary: support, success, operations, or sales teammates working from a shared team inbox.
- Secondary: team leads who need basic visibility into unresolved handoffs without managing every conversation manually.

### Goals

- Make the current owner and intended next owner explicit during a handoff.
- Require concise handoff context: reason for handoff and recommended next step.
- Preserve a visible handoff history on the inbox item.
- Give the receiver an explicit accept or decline path.
- Prevent ownerless or silently transferred work.
- Reuse existing assignment, access, notification, and activity-history patterns wherever they already exist.

### Non-Goals

- No automatic triage, priority prediction, routing, or AI-generated summaries.
- No new SLA policy engine, escalation rules, or queue-management model.
- No full inbox information architecture redesign.
- No cross-channel handoff support beyond the existing team inbox surface.
- No new analytics dashboard or reporting infrastructure for v1.
- No permissions model overhaul unless the existing assignment permissions cannot support this flow.

## Product Requirements

### Core Flow

1. A current owner selects `Handoff` on an inbox item.
2. The current owner chooses a receiving teammate from eligible inbox members.
3. The current owner enters two required fields: `Reason for handoff` and `Recommended next step`.
4. The system records the handoff as pending and notifies the receiving teammate through the existing notification pattern, if one exists.
5. The receiving teammate can `Accept handoff` or `Decline and return` with a short reason.
6. Once accepted, ownership changes to the receiver and the handoff entry remains visible in the item history.
7. If declined, ownership stays with or returns to the prior owner, and the decline reason is added to the item history.

### Functional Requirements

- The handoff action must be available only when an inbox item has a current owner.
- The receiver picker must only include teammates who can access the inbox item under existing access rules.
- The handoff note must be required and must support concise plain text.
- Pending handoffs must show a clear state on the item: `Handoff pending to [teammate]`.
- Pending handoffs must not remove accountability from the current owner until the receiver accepts.
- Accepted handoffs must update owner, timestamp, sender, receiver, and note in item history.
- Declined handoffs must preserve the prior owner and record the receiver's decline reason.
- If the receiver loses access before accepting, the pending handoff must be canceled and the current owner must be notified if the existing notification pattern supports it.
- If the inbox item is closed before acceptance, the pending handoff must be canceled and recorded in item history.

### UX Requirements

- The handoff entry point should live near the existing ownership or assignment controls.
- The handoff modal or panel should be short: receiver, reason, recommended next step, submit.
- The pending state should be visible in the item header or ownership area, not buried only in activity history.
- The receiver's accept or decline action should be available from the inbox item and from the notification destination if applicable.
- Copy should use operational language: `Handoff`, `Accept handoff`, `Decline and return`.

### Validation Scope

Validation for v1 should not require new analytics infrastructure. The team should use whichever of the following is already available:

- Existing assignment or activity-history records to confirm whether handed-off items avoid ownerless states.
- Manual review of a small pilot set of handed-off items to check whether notes include enough next-step context.
- Qualitative feedback from pilot users about whether the receiver understood what to do next.
- Manual review of declined or canceled handoffs to identify obvious workflow breakage.

Do not commit v1 to numeric adoption, acceptance-rate, median-time, reassignment-attribution, or notification-dismissal targets unless the underlying instrumentation and baseline already exist.

### Launch Plan

- Ship first to one team inbox or internal pilot group.
- During the pilot, review handoff examples manually or with existing reporting only.
- Expand only if pilot review shows the workflow prevents ambiguous ownership without creating assignment churn.
- If the team cannot validate even basic handoff outcomes from existing history or manual review, create a separate measurement follow-up rather than expanding this PRD.

### Risks and Mitigations

- Risk: Users treat handoff as a way to abandon ownership. Mitigation: current owner remains accountable until acceptance.
- Risk: Handoff notes become low-quality. Mitigation: require explicit reason and next-step fields instead of a single empty comment box.
- Risk: The feature becomes a backdoor assignment redesign. Mitigation: reuse existing assignment and access rules; defer routing, queues, and SLA logic.
- Risk: Receivers miss pending handoffs. Mitigation: use existing notification patterns and visible pending state on the item.
- Risk: Validation expectations force analytics scope creep. Mitigation: keep v1 validation to existing records, manual review, and qualitative pilot feedback.

## Unknowns & Evidence Gaps

- No evidence packet was provided for current user behavior, baseline handoff failure rate, or target performance thresholds.
- Existing assignment, ownership, activity-history, and notification capabilities are unknown.
- Team permissions and inbox access rules are unknown.
- User tolerance for mandatory handoff notes has not been validated.
- It is unclear whether receivers need decline reasons to be required or optional.
- It is unclear whether mobile inbox workflows are in scope for the first release.
- It is unclear whether existing data can support any quantitative success metric without new analytics work.

## Pass/Fail Readiness

Pass if:

- Handoffs cannot leave an item ownerless.
- Every accepted, declined, or canceled handoff creates a visible item-history entry.
- Receivers have an explicit accept or decline action.
- The sender must provide a reason and recommended next step.
- The implementation reuses existing assignment, access, notification, and activity-history patterns where possible.
- Pilot review can determine, through existing records or manual review, whether the workflow is understandable and does not create obvious assignment churn.

Fail if:

- Ownership changes before the receiver accepts.
- The feature requires a broader routing, SLA, analytics, dashboard, or permissions rebuild to be useful.
- Pending handoffs are only visible through hidden activity history.
- Handoff notes are optional in the first release.
- The launch plan depends on numeric targets or analytics capabilities that do not already exist.

## Recommended Next Artifact

Create a focused workflow spec with a state diagram and acceptance criteria for four states: no handoff, pending handoff, accepted handoff, and declined or canceled handoff. Include only the owner control, handoff form, pending state, receiver accept or decline action, and item-history entry. Create a separate measurement plan only after confirming what instrumentation already exists.
