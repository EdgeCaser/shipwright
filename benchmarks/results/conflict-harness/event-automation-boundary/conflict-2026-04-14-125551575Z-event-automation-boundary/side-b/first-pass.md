# Phase 1 PRD: Event Automation Platform

## Product Summary
Build a Phase 1 event management automation platform that lets customers and operators coordinate over WhatsApp, routes work through an internal console, requires explicit human approval before any pricing commitment is sent, and constrains LLM usage to non-authoritative drafting and classification tasks behind deterministic policy gates.

## Problem
Event operators lose time handling repetitive inbound requests, clarifications, scheduling updates, and quote preparation across fragmented channels. Existing workflows are slow because the team must manually triage every message, assemble context, and draft responses. Full autonomy is unacceptable because pricing, commitments, and operational exceptions carry financial and reputational risk.

## Goal
Reduce manual coordination time for inbound event workflows while preserving operator control over commitments, pricing, and exception handling.

## Non-Goals
- Fully autonomous quote issuance
- Autonomous contract negotiation
- Autonomous payment collection or refunds
- Open-ended LLM action execution against production systems
- Multi-channel support beyond WhatsApp in Phase 1

## Target Users
- Event requester communicating over WhatsApp
- Internal operations agent managing requests and approvals
- Manager or pricing approver responsible for quote commitments

## Jobs To Be Done
- As an event requester, I want fast answers and clear next steps over WhatsApp.
- As an ops agent, I want inbound requests converted into structured cases with suggested replies and draft pricing.
- As a pricing approver, I want to review and explicitly approve any monetary commitment before it is sent.

## Phase 1 Scope
### In Scope
- WhatsApp assistant for inbound and outbound customer messaging
- Conversation-to-case creation with structured fields
- Internal console for case review, state changes, reply drafting, and approvals
- Deterministic workflow engine for routing, gating, and audit logging
- LLM usage limited to bounded tasks such as summarization, extraction, intent classification, and response drafting
- Human approval checkpoint for all pricing commitments before external send
- Full audit trail of model outputs, approvals, edits, and outbound messages

### Out of Scope
- Auto-sending final quotes without approval
- Contract drafting beyond template fill assistance
- Voice calls
- Deep CRM or ERP bidirectional sync unless needed for core case context

## Product Principles
1. Deterministic systems own state, policy, and side effects.
2. LLMs may suggest, summarize, classify, or draft, but may not commit money, policy, or workflow transitions without explicit rules.
3. Every external commitment must be attributable to a human or a deterministic rule approved in advance.
4. Operators must be able to inspect, edit, override, and recover from automation at every critical step.

## User Experience
### WhatsApp Assistant
- Accept inbound messages, attachments, and follow-up questions
- Acknowledge receipt immediately
- Ask deterministic follow-up questions when required fields are missing
- Present drafted responses when safe and approved by policy
- Hold pricing-related messages in pending approval state until approved

### Internal Console
- Queue of active event cases with SLA and status
- Case detail view with conversation history, extracted fields, event timeline, pricing draft, and recommended next action
- Approval panel for pricing commitments with diff between draft and approved outbound message
- Audit panel showing source data, model-produced fields, confidence flags, and send history

## Functional Requirements
### FR1: Case Creation and Intake
- System must create or update an event case from each WhatsApp conversation.
- System must extract deterministic core fields when available: event date, headcount, venue/location, budget signal, event type, requester identity.
- Missing required fields must trigger deterministic follow-up prompts.

### FR2: Workflow State Machine
- Each case must move through explicit states such as `new`, `awaiting_info`, `in_review`, `pricing_pending_approval`, `ready_to_send`, `sent`, `closed`.
- State transitions must be owned by deterministic rules or explicit human action.
- LLM output must not directly mutate authoritative state without validation and rule checks.

### FR3: LLM Boundary Controls
- LLM may be used only for bounded tasks:
  - message summarization
  - intent classification
  - field extraction into predefined schema
  - draft reply generation from approved templates and case context
- LLM must not:
  - set or approve price
  - send outbound commitments directly
  - change workflow policy
  - invoke arbitrary tools
- All LLM outputs must be stored as non-authoritative suggestions until accepted or validated.

### FR4: Pricing Approval Gate
- Any outbound message containing pricing, discounting, or commercial commitment must enter `pricing_pending_approval`.
- A human approver must explicitly approve, reject, or edit before send.
- System must block send if no valid approval record exists.
- Approved message content must be frozen for audit before delivery.

### FR5: Reply Drafting and Send Controls
- System may generate a draft reply for operator review.
- Safe non-pricing operational replies may be auto-prepared but should remain reviewable in Phase 1.
- Outbound send must occur only via deterministic send service with policy checks.

### FR6: Auditability
- System must log inbound content, extracted fields, model version, prompt template version, suggested outputs, approvals, edits, state transitions, and outbound messages.
- Audit log must support incident review for any customer-visible commitment.

### FR7: Exception Handling
- Low-confidence extraction, policy conflicts, unsupported requests, and attachment parsing failures must route to human review.
- System must surface reason codes for escalation.

## Core Workflows
### Workflow A: New Lead Intake
1. Customer sends inquiry on WhatsApp.
2. System acknowledges receipt.
3. Deterministic parser and bounded LLM extraction populate case draft.
4. Missing required fields trigger follow-up questions.
5. Case enters internal console for ops review.

### Workflow B: Quote Preparation
1. Ops agent reviews structured case.
2. System proposes pricing draft or pricing inputs from deterministic rules/calculator.
3. Draft outbound pricing message is generated.
4. Case enters approval queue.
5. Human approver approves or edits.
6. Deterministic send service delivers approved message to WhatsApp.

### Workflow C: Non-Pricing Follow-Up
1. Customer asks operational question.
2. System classifies request.
3. Draft reply is generated from approved knowledge/template sources.
4. Operator reviews and sends in Phase 1.

## Data Model
### Core Entities
- `Conversation`
- `Message`
- `EventCase`
- `Customer`
- `PricingDraft`
- `ApprovalRecord`
- `AuditEvent`

### Required Fields for EventCase
- case_id
- customer_id
- event_date
- event_type
- headcount_estimate
- location
- status
- pricing_commitment_flag
- approval_status

## Success Metrics
### Primary
- Reduction in median operator handling time per qualified event case
- Percentage of inbound cases converted into structured cases without manual re-entry
- Time from inbound inquiry to first meaningful response

### Guardrails
- Zero pricing commitments sent without approval
- Zero unauthorized workflow transitions caused by LLM output
- Low rate of customer-visible factual corrections after send

## Operational Requirements
- Approval actions must be role-based and authenticated.
- System must fail closed on approval and sending controls.
- Console must expose manual override for all blocked cases.
- Templates and policy rules must be versioned.

## Risks
- Over-reliance on extraction quality could create hidden data errors.
- Operators may bypass console discipline if approval UX is slow.
- Pricing language may be ambiguous; policy classifier must bias toward requiring approval.

## Launch Plan
### Phase 1 Release Criteria
- End-to-end WhatsApp intake to console flow works for core inquiry path
- Approval gate is enforced for all pricing commitments
- Audit log is queryable for each outbound commitment
- Bounded LLM tasks are isolated behind deterministic service interfaces

## Decision Frame
Proceed with a hybrid architecture where deterministic workflow services own case state, policy, approvals, and message sending, while LLMs are restricted to schema-bound extraction and draft generation. The key Phase 1 decision is to optimize for operator leverage, not autonomy: faster triage and drafting with strict human control over money and commitments.

## Unknowns & Evidence Gaps
- Exact approval roles and separation-of-duties requirements are not specified.
- Pricing logic source is undefined: manual entry, rules engine, or external system.
- No evidence is provided on inquiry volumes, SLA targets, or attachment complexity.
- WhatsApp template/compliance constraints are not detailed.
- Confidence thresholds and escalation policies need calibration from real traffic.

## Pass/Fail Readiness
Pass if the team agrees that Phase 1 is an operator-assist product with hard approval gates, not an autonomous sales agent, and if deterministic ownership of state and side effects is accepted as a non-negotiable boundary. Fail if stakeholders expect automatic quote commitment, unrestricted LLM actioning, or ambiguous ownership of approval policy.

## Recommended Next Artifact
Technical spec covering: workflow state machine, approval-policy engine, LLM boundary contract, audit schema, WhatsApp integration design, and pricing message detection rules.
