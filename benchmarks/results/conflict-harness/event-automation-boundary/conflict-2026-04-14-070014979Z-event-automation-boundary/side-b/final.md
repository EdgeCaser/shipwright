# Revised artifact

# Phase 1 PRD: Event Management Automation Platform

## Overview
Build a Phase 1 event management automation platform that lets prospects and customers interact through a WhatsApp assistant, routes sensitive decisions through an operator workspace, requires human approval before any pricing commitment is sent, and enforces deterministic boundaries around all LLM usage.

## Problem
Event teams lose time handling repetitive inbound requests, collecting incomplete event details, answering common questions, and coordinating quotes. Pure automation is unsafe because pricing commitments, policy-sensitive answers, and ambiguous operational decisions can create financial and reputational risk.

## Goal
Reduce time-to-response and manual coordination load for inbound event inquiries while preserving strict control over commitments, pricing, and operational correctness.

## Non-Goals
- Fully autonomous quote generation and sending without human approval
- Autonomous contract negotiation
- Autonomous exception handling for novel operational scenarios
- Free-form LLM tool use against production systems
- Requiring a fully bespoke operations console before workflow fit is validated

## Users
- External requester: asks questions, shares event details, requests pricing through WhatsApp
- Internal operator: reviews conversations, completes missing details, approves or edits pricing responses, escalates exceptions
- Admin/manager: configures policies, templates, approval rules, and audit access

## Phase 1 Scope
### In scope
- WhatsApp assistant for structured intake and FAQ-style responses
- Operator workspace for conversation review and case management
- Draft quote or pricing recommendation generation for internal review only
- Human approval step before any pricing commitment is sent externally
- Deterministic workflow engine governing states, transitions, and allowed actions
- Audit logging for all user-visible responses, approvals, and overrides

### Out of scope
- Payment collection
- Contract signature workflows
- Multi-channel support beyond WhatsApp
- Dynamic optimization of margins without fixed business rules
- Advanced operator tooling not required to validate the core loop

## Product Principles
1. No external pricing commitment without explicit human approval.
2. LLMs may assist with language and summarization, but may not decide workflow state changes directly.
3. Every externally visible action must be attributable, reviewable, and reproducible.
4. Deterministic systems own policy, pricing rules, and action execution.
5. Phase 1 operator tooling should be the lightest mechanism that still enforces approvals, auditability, and queue visibility.

## Core User Stories
1. As an event requester, I want to message a WhatsApp assistant in natural language so I can quickly start an inquiry.
2. As an event requester, I want the assistant to ask for missing required details so my request can be processed.
3. As an operator, I want a workspace that shows conversation history, extracted fields, status, and next actions so I can manage requests efficiently.
4. As an operator, I want to review and approve any pricing message before it is sent so I control commitments.
5. As a manager, I want deterministic guardrails and audit logs so the system remains compliant and debuggable.

## Functional Requirements
### 1. WhatsApp Assistant
- Receive inbound messages and create or update an inquiry record.
- Use a controlled prompt to classify intent into allowed categories such as `new_inquiry`, `provide_details`, `pricing_request`, `faq`, `handoff_request`.
- Extract required structured fields when present: event date, city/venue, attendee count, event type, budget range, requested services, contact identity.
- Ask follow-up questions from deterministic templates when required fields are missing.
- Answer approved FAQ content from a curated knowledge base.
- Route unsupported or ambiguous requests to human review.

### 2. Operator Workspace
- Present an active inquiry queue with status and approval state.
- Display raw messages, extracted structured data, model outputs, and rule evaluation results.
- Allow operators to edit fields, request clarification, approve or reject pricing drafts, and escalate.
- Support implementation as either a lightweight approval surface integrated with existing tools or a dedicated console, provided the same controls are enforced.
- Defer richer features such as SLA timers, advanced change analytics, and deep escalation tooling unless required by pilot operations.

### 3. Pricing Commitment Workflow
- System may produce a draft price or range only from deterministic pricing logic plus approved business rules.
- If an LLM is used, it may format a draft explanation but may not compute final pricing authority.
- Any message containing price, range, discount, package commitment, or custom commercial term enters `awaiting_human_approval`.
- Only an authorized human can approve and release the outbound message.
- Approved messages are immutably logged with approver identity and timestamp.

### 4. Deterministic Orchestration Layer
- Workflow states include `new`, `collecting_details`, `ready_for_review`, `awaiting_human_approval`, `approved_to_send`, `sent`, `needs_followup`, `closed`.
- State transitions are governed by explicit rules, not model discretion.
- LLM outputs must be parsed into a strict schema; invalid outputs fail closed and route to review.
- Tool access is allowlisted per state and action.

### 5. Audit and Controls
- Log every inbound message, outbound draft, outbound sent message, field edit, state transition, approval, rejection, and override.
- Retain model prompt/version, structured output, and validation result for debugging.
- Provide admin-visible policy versioning for pricing rules, templates, and FAQ sources.

## LLM Boundary Specification
### Allowed LLM uses
- Intent classification into predefined enums
- Structured field extraction into predefined schema
- Conversation summarization for internal operators
- Draft wording for non-binding replies
- FAQ answer drafting from approved source content

### Disallowed LLM uses
- Executing state transitions without deterministic validation
- Setting or approving prices
- Sending outbound messages directly to users
- Calling arbitrary tools or modifying policy/configuration
- Inventing answers outside approved knowledge or policy scope

### Failure handling
- If schema validation fails, confidence is low, or policy detects sensitive content, route to human review.
- If retrieval or policy context is unavailable, respond with a safe fallback and request human follow-up.

## UX Flows
### Flow A: New inquiry
1. User sends WhatsApp message.
2. System classifies intent and extracts known fields.
3. Deterministic logic checks required fields.
4. Assistant asks templated follow-up questions or routes to operator if ambiguous.

### Flow B: Pricing request
1. User asks for pricing.
2. System checks completeness of required data.
3. Deterministic pricing engine generates draft estimate or marks insufficient data.
4. Operator reviews, edits if needed, and approves through the operator workspace.
5. Approved response is sent through WhatsApp.

### Flow C: FAQ
1. User asks a standard question.
2. System retrieves approved answer content.
3. LLM may format the response within bounded template rules.
4. If answer is outside approved scope, route to operator.

## Data Model
### Core entities
- Inquiry
- Contact
- ConversationMessage
- ExtractedFieldSet
- PricingDraft
- ApprovalDecision
- PolicyVersion
- AuditEvent

## Success Metrics
### Primary
- Median first-response time for inbound inquiries
- Percentage of inquiries with complete structured intake after first interaction
- Operator handling time per inquiry

### Guardrails
- Zero outbound pricing commitments sent without human approval
- Percentage of conversations routed to human review due to guardrail triggers
- Hallucination or policy-violation rate in sampled conversations
- Approval turnaround time

## Risks
- Over-reliance on LLM extraction causing missing or wrong fields
- Operators bypassing workflow if the workspace is slow or cumbersome
- FAQ coverage gaps causing unnecessary escalations
- Pricing rules being incomplete for edge-case events
- Overbuilding bespoke internal tooling before operator workflow requirements are validated

## Rollout Plan
### Phase 1 launch criteria
- WhatsApp intake works for a narrow event category and geography
- Pricing logic supports a limited package catalog or pricing framework
- Approval workflow is enforced end-to-end
- Audit logs are queryable for every message and approval event
- The chosen operator workspace, whether lightweight or bespoke, supports review, approval, and traceability reliably enough for pilot volume

## Decision Frame
Proceed with a constrained Phase 1 centered on WhatsApp intake, FAQ handling, deterministic pricing draft generation, and mandatory human approval for all pricing commitments. Treat the operator workspace as a required capability but not a predetermined full console build; Phase 1 should use the lightest implementation that still enforces approvals, auditability, and queue management.

## Unknowns & Evidence Gaps
- Which event categories should be included in Phase 1 to keep pricing rules tractable
- Required SLA for operator approvals to maintain a good WhatsApp experience
- Whether operators can reliably manage pilot volume in a lightweight workspace or need a dedicated console earlier
- Acceptable confidence thresholds for extraction before human review is required
- Whether customers need price ranges, exact quotes, or callback scheduling as the default commercial response

## Pass/Fail Readiness
### Pass if
- No pricing message can be sent without human approval
- Deterministic state machine controls all workflow transitions
- LLM outputs are schema-validated and fail closed
- Operators can review, edit, approve, and audit all sensitive outbound messages in the chosen workspace
- Phase 1 avoids bespoke internal-tool scope beyond what the pilot requires

### Fail if
- Any path allows model-driven price commitment or unsupervised send
- Policy and pricing rules are not versioned and auditable
- Ambiguous requests are answered without a bounded fallback or review path
- The operator workflow depends on tooling that cannot provide approval traceability and queue control

## Recommended Next Artifact
Technical specification covering state machine design, schema contracts for LLM outputs, pricing-rule service boundaries, approval permissions, audit-log model, and a decision memo comparing lightweight operator-workspace options versus a dedicated console for pilot launch.
