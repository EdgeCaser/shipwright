# Revised artifact

## PRD: Team Inbox Workflow Handoff Improvement

## Overview
Improve handoffs in the team inbox so one teammate can transfer ownership of a conversation to another without losing context, creating duplicate work, or delaying response to the customer.

## Problem
Current handoffs are inconsistent and partially manual. When ownership changes, agents may rely on ad hoc notes, verbal updates, or ambiguous assignment changes. This creates hidden scope risk: requests for "better handoff" can expand into workflow redesign, analytics, SLA policy, and staffing features unless explicitly bounded.

## Goal
Enable reliable, fast, low-friction handoff of inbox conversations.

## Non-Goals
- Redesign the full inbox information architecture
- Build workforce management or staffing tools
- Add SLA policy engines
- Add customer-facing status notifications
- Build long-term performance analytics beyond MVP instrumentation
- Build routing automation or suggested assignee logic in MVP

## Users
- Primary: support agent or operations teammate handing off a conversation
- Secondary: receiving teammate who needs enough context to continue work immediately
- Tertiary: team lead monitoring whether handoffs are functioning reliably

## Jobs To Be Done
- When I cannot complete a conversation, I want to hand it off with clear context so the next teammate can act without re-reading everything.
- When I receive a handoff, I want to know why it was handed off, what has been done, and what I should do next.
- When I manage the team inbox, I want handoffs to be traceable enough to reduce dropped or duplicated work.

## User Stories
1. As a current owner, I can reassign a conversation to a teammate and include a structured handoff note.
2. As a receiving owner, I can see the handoff reason, summary, and next action in the conversation view.
3. As a current owner, I am prevented from completing a handoff without the minimum required context.
4. As a team lead, I can audit basic handoff events to investigate dropped conversations.

## Product Requirements
### Core Workflow
1. User selects `Handoff` from a conversation.
2. User chooses receiving teammate.
3. User enters required fields:
   - handoff reason
   - short summary of current state
   - explicit next step or requested action
4. System reassigns conversation and stores the handoff event in history.
5. Receiving teammate sees a clear handoff card at the top of the thread until acknowledged or updated.

### Functional Requirements
- The system must support handoff between individual teammates within the same inbox/team.
- The system must require structured handoff fields before reassignment completes.
- The system must record the sender, recipient, timestamp, and handoff content.
- The system must render the latest handoff context prominently in the conversation UI.
- The system must notify the receiving teammate in the existing internal notification pattern.
- The system must preserve prior handoff events in conversation history.
- The system must allow the recipient to acknowledge the handoff.

### Validation Rules
- Recipient is required.
- Reason is required.
- Summary is required and capped at a practical length.
- Next action is required.
- Handoff cannot target the current owner.

## UX Requirements
- Handoff should take less than 30 seconds for a trained user.
- Required fields should be visible in one modal or side panel.
- Receiving user should not need to search history to understand the handoff.
- Visual treatment should distinguish handoff context from general internal notes.

## Success Metrics And MVP Instrumentation
This PRD does not assume baseline values exist today. MVP includes only the minimum event instrumentation needed to establish a baseline during pilot and evaluate whether the workflow improves handoff quality.

### Required Events
- `handoff_initiated`
- `handoff_completed`
- `handoff_acknowledged`
- `post_handoff_first_action`
- `post_handoff_reassignment`
- `post_handoff_sender_recipient_clarification_note`

### Pilot Metrics
- Median time from `handoff_completed` to `post_handoff_first_action`
- Percentage of handoffs acknowledged within same business day
- Percentage of handed-off conversations reassigned again before next meaningful action
- Average count of sender-recipient clarification notes after handoff

### Measurement Plan
- Collect baseline for at least 2 weeks before broad rollout using current reassignment behavior where possible.
- Run MVP pilot on one inbox/team and compare pilot period against pre-pilot baseline on the same workflow.
- If baseline logging is impossible before build, release only to pilot cohort and treat first 2 weeks as instrumentation baseline period before judging outcome.
- Do not expand scope to dashboards or long-term reporting in MVP; a simple analyst query or internal report is sufficient.

### Launch Decision Threshold
- Pilot can advance only if instrumentation is live and the team agrees on baseline period and comparison method before rollout.
- If instrumentation is not available, launch is blocked because success and failure cannot be distinguished.

## MVP Scope
- Manual handoff between teammates
- Structured handoff form
- Stored handoff event in thread history
- Recipient notification
- Recipient acknowledgment
- Minimal event instrumentation required for pilot evaluation

## Post-MVP Candidates
- Suggested recipients
- Handoff templates by issue type
- Reporting dashboard for handoff quality trends
- Cross-team or cross-queue routing logic

## Risks
- Users may perceive required fields as extra friction and bypass quality with low-value text.
- Over-scoping into routing automation could delay the core workflow improvement.
- If handoff context is not surfaced clearly, the feature becomes a data-entry layer without operational benefit.
- If instrumentation is omitted, the team will not be able to evaluate whether the workflow actually improved handoffs.

## Dependencies
- Existing conversation assignment model
- Existing internal notification system
- Conversation history/event logging support
- Ability to emit or query basic workflow events for pilot measurement

## Launch Plan
- Instrument current and MVP handoff workflow
- Pilot with one team inbox
- Measure median time to next action, acknowledgment rate, repeat reassignment rate, and clarification-note rate
- Expand only after instrumentation is validated and pilot results show operational improvement without major workflow friction

## Decision Frame
Build a narrowly scoped MVP focused on structured person-to-person handoff inside the team inbox. Include only the minimum instrumentation required to measure pilot outcomes. Do not expand this PRD into routing automation, staffing logic, SLA management, dashboards, or broad analytics.

## Unknowns & Evidence Gaps
- Current baseline frequency and failure modes of handoffs are not provided.
- No evidence quantifies which context fields matter most to recipients.
- No user research confirms whether acknowledgment is essential for MVP.
- No technical constraints are provided for assignment, notifications, audit history, or event instrumentation.
- Target thresholds for acceptable improvement are not yet specified and should be set before pilot review.

## Pass/Fail Readiness
Pass if the team agrees the problem is specifically handoff quality within an existing inbox workflow, the MVP scope remains limited to structured reassignment with visible context, and minimum pilot instrumentation is included so outcomes can be measured against a defined baseline period. Fail if stakeholders expect this PRD to also solve queue routing, staffing allocation, SLA enforcement, dashboard reporting, or any launch without agreed measurement.

## Recommended Next Artifact
Technical spec for the handoff data model, event logging, UI entry point, validation rules, notification behavior, and pilot measurement queries.
