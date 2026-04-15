# Phase 1 PRD: Event Management Automation Platform

## Product Summary
Build a Phase 1 event management automation platform that lets customers and operators coordinate event inquiries through a WhatsApp assistant while keeping pricing commitments and other financially binding outputs behind explicit human approval. The system must use LLMs only in bounded, non-authoritative roles and keep all operationally binding actions deterministic, auditable, and reversible.

## Problem
Event teams lose time handling repetitive inbound coordination, collecting incomplete requirements, quoting too early, and copying context into internal tools. Pure automation is risky because pricing, package exceptions, and operational commitments can create financial and delivery exposure.

## Goal
Reduce manual intake and coordination workload without allowing the assistant to make unauthorized commitments.

## Non-Goals
- Fully autonomous quoting or contract generation
- Autonomous vendor booking or payment execution
- Open-ended LLM decision-making in workflow control
- Multi-channel support beyond WhatsApp in Phase 1

## Users
- Customer: submits event needs and receives updates via WhatsApp
- Operations agent: reviews requests, clarifies details, approves quotes, sends finalized responses
- Sales or pricing approver: approves or edits any pricing commitment
- Admin: manages templates, policy rules, audit access, and user permissions

## Phase 1 Scope
1. WhatsApp assistant for structured event intake, FAQ handling, and status updates
2. Internal console for case review, missing-info resolution, quote drafting, and approvals
3. Deterministic workflow engine for routing, state transitions, approvals, and outbound message generation
4. Human approval gate for any pricing, discount, package exception, or commitment with commercial impact
5. Full audit trail for assistant outputs, operator edits, approvals, and sent messages

## Core Product Principles
- LLMs may draft, summarize, classify, and extract; they may not decide binding outcomes.
- Every state transition that affects price or commitment must be rule-driven and logged.
- Customers should experience fast conversational handling, but all critical commitments must be explicitly reviewed by a human.
- Operators must be able to see exactly what the assistant proposed, what rules fired, and what was ultimately sent.

## User Stories
- As a customer, I want to describe my event in natural language over WhatsApp so I do not need to fill a long form.
- As an ops agent, I want the system to extract event details into structured fields so I can review complete requests quickly.
- As a pricing approver, I want all pricing-affecting messages held for approval so no unapproved quote is sent.
- As an admin, I want deterministic policy boundaries around LLM usage so the system is safe to operate.

## Functional Requirements
### 1. WhatsApp Assistant
- Accept inbound customer messages and maintain a case thread.
- Ask deterministic follow-up questions for required intake fields when information is missing.
- Use LLM support only for bounded tasks such as entity extraction, summarization, and suggested reply drafting.
- Respond automatically only for approved FAQ and status intents.
- Escalate to human review when confidence is low, required fields remain ambiguous, or the message touches pricing, exceptions, or custom terms.

### 2. Intake Data Model
Required Phase 1 fields:
- Event date
- Event type
- Headcount estimate
- Location
- Budget range if provided
- Service/package interest
- Special requirements
- Customer contact identity

The platform must store both raw conversation text and normalized structured fields.

### 3. Internal Console
- Show all active cases with status, SLA timer, and escalation reason.
- Display transcript, extracted fields, missing fields, assistant suggestions, and approval history.
- Allow operators to edit structured data and compose or approve outbound replies.
- Allow approvers to approve, reject, or modify quote drafts.
- Prevent send actions for restricted message classes unless required approval state is complete.

### 4. Pricing Commitment Boundary
The system must classify these as approval-required:
- Price quotes
- Discounts
- Package inclusions or exclusions that materially affect price
- Availability commitments tied to commercial acceptance
- Custom offers or exceptions

For these cases:
- The LLM may draft candidate language.
- The workflow engine must hold the draft in pending approval state.
- A human must explicitly approve before the message can be sent.
- The sent message must reference the approved version, not a regenerated version.

### 5. Deterministic Workflow Engine
Workflow state must be explicit and rule-based. Minimum states:
- New inquiry
- Awaiting customer info
- Ready for ops review
- Pending pricing approval
- Approved to send
- Sent to customer
- Closed

Transitions must be triggered by deterministic rules, human actions, or fixed system events, not by free-form LLM decisions.

### 6. LLM Boundary Controls
Allowed LLM uses:
- Extract structured fields from customer messages
- Summarize long threads for operator efficiency
- Classify likely intent into a fixed taxonomy
- Draft response options within templates

Disallowed LLM uses:
- Sending messages directly
- Changing workflow state without deterministic rule evaluation
- Approving pricing or commercial exceptions
- Generating net-new policy rules at runtime
- Making final eligibility or commitment decisions

### 7. Auditability
The system must log:
- Raw inbound and outbound messages
- Extracted structured fields and confidence
- Prompt/output artifacts for LLM-assisted steps
- Rule evaluations and triggered workflow transitions
- Human edits, approvals, rejections, and send actions
- Timestamped actor identity for each material action

## UX Requirements
- Customer experience must feel conversational and fast, with clear acknowledgement after each major step.
- Internal console must prioritize operator trust: visible boundary labels, approval status, and diff view between draft and approved send.
- Restricted drafts must be visually marked as not yet customer-visible.

## Acceptance Criteria
- A customer can start an inquiry over WhatsApp and complete required intake through guided conversation.
- The system stores extracted event fields and flags missing or ambiguous values.
- FAQ and status replies can be auto-sent only from approved deterministic response paths.
- Any pricing-related outbound draft is blocked from send until a human approver approves it.
- Operators can review full transcript, structured fields, and assistant-generated suggestions in one console.
- Every outbound pricing commitment is traceable to a named approver and immutable approved payload.
- No workflow state transition depends solely on unbounded model output.

## Success Metrics
- Intake completion rate for new inquiries
- Median time from first message to review-ready case
- Percentage of inbound threads auto-handled for safe FAQ/status intents
- Percentage of pricing drafts requiring revision before approval
- Zero unauthorized pricing commitments sent
- Operator time saved per inquiry versus baseline

## Risks
- Over-escalation may reduce automation value if boundary rules are too conservative.
- Under-classification of pricing-related language could create commitment risk.
- Poor extraction quality could increase operator cleanup burden.
- WhatsApp conversational constraints may limit complex data capture.

## Dependencies
- WhatsApp Business integration
- Authentication and role-based access for internal users
- Rules service for deterministic policy checks
- Template library for approved responses and quote formats
- Audit log storage with retention policy

## Rollout Recommendation
Phase 1 should launch with a narrow set of event types and standardized packages where pricing logic is easiest to govern. Expand autonomy only after approval leakage risk is empirically near zero.

## Decision Frame
Ship Phase 1 as a human-supervised automation layer, not an autonomous event agent. Optimize for faster intake, better operator context, and safe quote handling by keeping LLM usage bounded to extraction, summarization, classification, and drafting. Treat pricing and commercial commitments as hard approval boundaries enforced by deterministic workflow rules.

## Unknowns & Evidence Gaps
- Exact pricing-rule complexity by event type is not yet specified.
- Required turnaround SLAs for ops and approvers are not defined.
- Confidence thresholds for safe auto-response and safe extraction need calibration.
- The acceptable balance between automation rate and escalation rate is not yet quantified.
- No empirical baseline is provided for current inquiry volume, handle time, or quote error rate.

## Pass/Fail Readiness
Pass if:
- Stakeholders agree that no pricing commitment can bypass human approval.
- Allowed versus disallowed LLM actions are codified as enforceable system rules.
- Phase 1 scope is limited to deterministic workflows and narrow event/package coverage.
- Audit and approval traceability are treated as launch-blocking requirements.

Fail if:
- The team expects end-to-end autonomous quoting in Phase 1.
- Workflow state changes remain dependent on free-form model judgment.
- Approval and sent-message payloads are not immutable and attributable.
- The scope expands before deterministic boundary controls are proven.

## Recommended Next Artifact
Technical spec for workflow state machine, policy engine, approval service, audit schema, and LLM boundary enforcement controls.
