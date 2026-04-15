# Phase 1 PRD: Event Management Automation Platform

## Overview
Build a Phase 1 event management automation platform that combines a WhatsApp-based assistant for customer interactions, an internal operations console for staff, mandatory human approval for any pricing commitment, and strict deterministic boundaries around LLM usage. The goal is to reduce manual coordination load without allowing nondeterministic systems to make binding commercial decisions.

## Problem
Event operations teams lose time handling repetitive customer inquiries, collecting event requirements, coordinating follow-ups, and preparing quotes. Existing workflows are fragmented across chat, spreadsheets, and human handoffs. Full autonomy is not acceptable because pricing commitments, exception handling, and operational promises carry financial and reputational risk.

## Goal
Reduce time spent on intake, qualification, and draft proposal preparation while preserving human control over commitments and keeping all LLM behavior inside explicitly bounded, non-authoritative tasks.

## Non-Goals
- Fully autonomous quote issuance
- Autonomous vendor booking or payment execution
- Free-form LLM decisioning over pricing, policy, or contractual terms
- Replacing human operators for exception handling in Phase 1

## Target Users
- External event requesters communicating over WhatsApp
- Internal operations agents reviewing requests and approving next actions
- Sales or pricing managers approving binding commercial responses

## Phase 1 Scope
### In Scope
- WhatsApp assistant for intake, FAQ handling, status updates, and structured requirement gathering
- Internal console for queue management, conversation review, request editing, and approval workflows
- Quote draft generation from deterministic pricing rules plus operator-entered adjustments
- Human approval gate before any pricing commitment is sent externally
- Audit logs for all assistant outputs, approvals, edits, and outbound messages
- Deterministic workflow orchestration with explicit state transitions
- LLM usage only for bounded tasks such as summarization, extraction, and response drafting

### Out of Scope
- Dynamic pricing optimization by LLM
- Automatic negotiation with customers
- Automated contract generation and signature workflows
- Multi-channel support beyond WhatsApp in Phase 1

## Product Principles
1. No binding promise without human approval.
2. LLMs may assist with language and structure, not policy or pricing authority.
3. System-of-record state must be deterministic and inspectable.
4. Every outbound customer message must be attributable to a rule path, a human, or both.
5. Fallback to human operators must be available at any uncertain boundary.

## User Stories
1. As an event requester, I can message a WhatsApp assistant and provide my event details without filling a long form.
2. As an event requester, I can receive timely status updates and clarifying questions through WhatsApp.
3. As an operations agent, I can see all inbound requests in a console with structured extracted fields and conversation history.
4. As an operations agent, I can correct extracted details before they affect downstream workflows.
5. As a pricing approver, I can review a draft quote and explicitly approve or reject it before it is sent.
6. As a compliance-conscious operator, I can audit what the assistant suggested, what rules fired, and who approved the final response.

## Functional Requirements
### 1. WhatsApp Assistant
- Ingest inbound WhatsApp messages and attachments.
- Detect whether message intent is intake, FAQ, status check, reschedule request, or escalation request.
- Collect required event fields through guided conversation: date, location, event type, headcount, service needs, budget range if provided, and timing constraints.
- Send deterministic templated follow-ups when required fields are missing.
- Escalate to human when user requests pricing, asks an unsupported question, or intent confidence falls below threshold.

### 2. Internal Console
- Show request queue with statuses such as `new`, `awaiting_customer_info`, `ready_for_review`, `pricing_pending_approval`, `approved_for_send`, `sent`, and `escalated`.
- Display conversation transcript, extracted structured fields, rule outputs, and draft responses.
- Allow operators to edit extracted fields and draft responses before approval.
- Allow reassignment, notes, and escalation.

### 3. Pricing Approval Workflow
- Generate quote drafts from deterministic pricing rules and operator-selected options.
- Prevent any customer-visible pricing message from being sent until an authorized human approves.
- Record approver identity, timestamp, and approved payload.
- If pricing inputs change after approval, invalidate prior approval automatically.

### 4. Deterministic Workflow Engine
- Model the request lifecycle as explicit states and transitions.
- Require machine-checkable conditions for advancing between states.
- Log every transition with actor, trigger, and payload snapshot.
- Support retries and safe idempotent reprocessing for message delivery and extraction jobs.

### 5. Bounded LLM Layer
- Permit LLM use only in these tasks:
  - summarizing long customer threads for operators
  - extracting candidate structured fields from free text
  - drafting non-binding response language from approved facts
  - classifying low-risk intents with deterministic fallback
- Prohibit LLM use for these tasks:
  - final pricing computation
  - approval decisions
  - policy interpretation without hard-coded rules
  - direct autonomous commitments on availability, discounts, or terms
- Require deterministic validation of any LLM-produced structured output before persistence or downstream use.
- Require human review before any LLM-drafted pricing-related message is sent.

## System Behavior
### Happy Path
1. Customer initiates WhatsApp conversation.
2. Assistant gathers event details and stores extracted candidates.
3. Deterministic validators check completeness.
4. Internal console marks request `ready_for_review`.
5. Operator verifies details and triggers quote draft.
6. Rules engine computes draft pricing.
7. Authorized human approves pricing payload.
8. Assistant or operator sends approved response over WhatsApp.

### Exception Path
- If extraction confidence is low, request goes to human review.
- If customer asks for discounts or exceptions, request is escalated.
- If rules cannot price the request, system blocks auto-drafting and routes to manual handling.
- If outbound content differs from approved pricing payload, send is blocked.

## Data Model
Core entities:
- `LeadRequest`
- `Conversation`
- `Message`
- `ExtractedField`
- `QuoteDraft`
- `ApprovalRecord`
- `WorkflowTransition`
- `OperatorNote`

Key stored fields:
- customer contact and consent metadata
- event details and required-service attributes
- extraction confidence and validation results
- rule version used for quote generation
- approved pricing payload
- audit metadata for all user and system actions

## Permissions and Controls
- Only authorized approvers can approve pricing commitments.
- Operators can edit request details and draft messages but cannot bypass approval gates.
- Admins can manage pricing rules, role permissions, and audit access.
- All outbound pricing-related communication must reference an approved artifact.

## Success Metrics
- Reduction in median time from inbound request to draft-ready record
- Reduction in operator time spent on repetitive intake tasks
- Percentage of requests fully structured before human review
- Percentage of pricing messages sent with valid approval records
- Escalation rate due to unsupported or ambiguous assistant interactions
- Zero incidents of unapproved pricing commitments sent externally

## Risks
- Over-trust in extracted fields could create downstream pricing errors
- Ambiguous WhatsApp conversations may exceed bounded automation assumptions
- Operators may find approval steps burdensome unless console flow is efficient
- Poorly defined pricing rules will limit automation yield regardless of assistant quality

## Launch Criteria
- No path exists for unapproved pricing payloads to reach external users
- Audit trail is complete for all state changes and outbound communications
- Deterministic rule engine covers the initial event package set targeted for Phase 1
- Human fallback path is operational for all blocked or low-confidence cases
- LLM outputs are validated and bounded according to policy

## Decision Frame
Phase 1 should optimize for safe augmentation, not autonomy. The product decision is to automate intake, structuring, and draft preparation while keeping pricing commitments and exception handling under explicit human control. This creates immediate operational leverage without crossing the trust boundary where nondeterministic behavior could create commercial liability.

## Unknowns & Evidence Gaps
- Which event categories and package structures are stable enough for deterministic pricing in Phase 1
- Actual operator tolerance for approval-step friction
- Expected WhatsApp attachment volume and its effect on extraction reliability
- Baseline confidence thresholds needed before automatic progression to review-ready status
- Regulatory and consent requirements for WhatsApp communication retention in target markets

## Pass/Fail Readiness
Pass if the team can implement a deterministic workflow backbone, a narrow pricing rules engine, role-based approvals, and bounded LLM assist functions with auditability.
Fail if the intended value depends on autonomous pricing, free-form negotiation, or policy interpretation by the LLM, because that violates the core boundary conditions of this phase.

## Recommended Next Artifact
Technical specification for workflow states, approval enforcement points, pricing rule interfaces, audit schema, and LLM boundary enforcement controls.
