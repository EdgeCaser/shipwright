# Phase 1 PRD: Event Management Automation Platform

## Overview
Build a Phase 1 event management automation platform that lets operators manage inbound event requests through a WhatsApp assistant and an internal console, while enforcing human approval for any pricing commitment and keeping all LLM behavior inside strict deterministic boundaries.

## Problem
Event teams lose time on repetitive intake, qualification, and coordination work, but fully autonomous assistants create unacceptable risk around pricing, commitments, and inconsistent behavior. The platform needs to automate low-risk workflow steps while preserving operator control over commercially sensitive outcomes.

## Goal
Reduce manual handling time for early-stage event inquiries without allowing the system to autonomously make binding pricing or policy commitments.

## Non-Goals
- Fully autonomous quote generation and sending
- Automated contract negotiation
- Free-form LLM orchestration across business-critical actions
- Full back-office ERP or invoicing integration in Phase 1

## Users
- External requester: prospective customer interacting over WhatsApp
- Internal operator: event coordinator reviewing requests and approving actions
- Internal manager: supervisor reviewing queue health, approvals, and audit history

## Jobs To Be Done
- Capture event inquiry details in a familiar channel
- Keep requesters engaged with fast responses and structured follow-up
- Route incomplete or ambiguous inquiries into an operator workflow
- Prevent any unapproved pricing commitment from leaving the system
- Give internal teams a complete audit trail of what was suggested, approved, edited, and sent

## Product Principles
- Deterministic before generative
- Human approval before commitment
- Full traceability on every externally visible action
- Narrow LLM scope with explicit guardrails
- Safe degradation to human handling when confidence or policy checks fail

## Phase 1 Scope
### In Scope
- WhatsApp assistant for intake, FAQ-style collection, and status acknowledgments
- Internal console for request review, message drafting, approval, and send actions
- Structured event intake record with required fields
- Human approval workflow for any message containing pricing, discounts, package recommendations, or commercial commitments
- Deterministic policy layer that decides whether LLM output may be used, blocked, or escalated
- Audit log of inbound messages, model suggestions, operator edits, approvals, and outbound sends
- Configurable templates for common replies and follow-up questions

### Out of Scope
- Payments
- Contract signature workflow
- Multi-channel support beyond WhatsApp
- Dynamic optimization models for pricing
- Automatic vendor booking

## User Experience
### External WhatsApp Flow
1. Requester starts a conversation.
2. System identifies intent using deterministic classification first; LLM may assist only for bounded extraction or rewrite tasks.
3. Assistant asks structured follow-up questions for date, venue, attendee count, event type, budget range, and required services.
4. If requester asks for price or package recommendation, the assistant responds with a safe holding message and routes to internal review.
5. Once an operator approves a prepared response, the approved message is sent over WhatsApp.

### Internal Console Flow
1. Operator sees a queue of new and escalated conversations.
2. Console displays extracted fields, confidence flags, and policy status.
3. System proposes next actions and draft replies.
4. If draft includes pricing-related content, send is disabled until explicit approval.
5. Operator can edit, approve, reject, or request more info.
6. All actions are logged with timestamps and actor identity.

## Functional Requirements
### FR1. Conversation Intake
- The system must ingest inbound WhatsApp messages and attach them to a customer conversation record.
- The system must maintain a structured event inquiry object with fields for customer name, event date, event type, headcount, location, budget, and special requirements.
- The system must support partial records and progressively enrich them over multiple turns.

### FR2. Deterministic Workflow Router
- The system must classify each inbound turn into one of: collect_info, faq_answer, pricing_request, schedule_request, escalation_needed, or unsupported.
- Routing decisions must be reproducible from logged inputs and rules.
- If rules detect ambiguity, missing policy coverage, or low-confidence extraction, the conversation must be escalated.

### FR3. Bounded LLM Usage
- LLM usage is allowed only for these tasks:
  - Extract structured fields from unstructured messages into a predefined schema
  - Rewrite operator-approved content for tone or brevity without changing factual meaning
  - Summarize conversation context for internal operators
- LLM usage is not allowed to:
  - Decide final prices
  - Select discounts
  - make binding promises on availability, pricing, or policy exceptions
  - trigger outbound pricing messages without approval
- All LLM outputs must pass deterministic validation before display or send eligibility.

### FR4. Pricing Approval Gate
- Any outbound message containing price, price range, package quote, discount, or commitment language must require human approval.
- The system must detect pricing-related content using deterministic rules over message metadata and content patterns.
- Unapproved pricing messages must not be sent through any channel.
- The approval event must record approver identity, timestamp, message version, and final sent text.

### FR5. Internal Console
- Operators must be able to review conversations, edit extracted fields, view draft responses, and approve or reject messages.
- Managers must be able to review approval history and queue status.
- The console must show why a conversation was escalated or blocked.

### FR6. Auditability
- The system must log inbound content, extraction results, model prompts/templates identifiers, model outputs, validations, operator edits, approval actions, and outbound messages.
- Logs must support post-hoc review of how a final response was produced.

### FR7. Safe Fallback Behavior
- If WhatsApp delivery fails, the system must keep the message in a failed state and notify the operator.
- If LLM output fails validation, the system must discard it and present deterministic fallback behavior.
- If policy services are unavailable, send actions for restricted content must fail closed.

## Deterministic Boundary Specification
### Allowed Automation Boundary
- Intake question sequencing from predefined state machine
- FAQ responses from approved template library
- Extraction into fixed schemas with validator checks
- Draft generation for internal review only
- Status acknowledgments that contain no commitment language

### Restricted Boundary Requiring Human Approval
- Prices, ranges, discounts, package recommendations
- Availability commitments where supply is not system-verified
- Policy exceptions
- Contractual or legal statements beyond approved templates

### Hard Prohibited Boundary
- Self-initiated outbound sales pursuit
- Autonomous quote send
- Autonomous negotiation
- Unlogged model calls
- Use of model output when schema validation or policy checks fail

## Data Model
### Core Objects
- Conversation
- Contact
- Event Inquiry
- Message
- Draft Response
- Approval Record
- Audit Event
- Policy Decision

### Key Fields
- Event Inquiry: event_type, requested_date, headcount, venue, budget_range, services_needed, status
- Draft Response: draft_text, draft_type, contains_pricing_flag, validation_status, source_type
- Approval Record: approver_id, approved_version_id, approval_reason, approved_at
- Policy Decision: decision_type, triggered_rules, confidence, escalated_reason

## Success Metrics
### Primary
- Median time from first inquiry to operator-ready structured brief
- Percentage of inbound inquiries handled without manual data re-entry
- Percentage of pricing messages sent with recorded approval

### Guardrails
- Zero unapproved pricing commitments sent
- Zero outbound messages sent when policy check is unavailable for restricted content
- Less than 5% operator-reported extraction correction rate on required fields after stabilization target is defined

## Operational Requirements
- Every outbound message must be attributable to either a template or an approved final draft.
- Every policy-blocked action must show a machine-readable reason code.
- System behavior for restricted actions must fail closed, not fail open.

## Risks
- Overly broad pricing detection may create unnecessary operator load.
- Narrow extraction schemas may frustrate operators on atypical events.
- Operators may overtrust model-generated summaries if provenance is unclear.

## Launch Plan
### Phase 1A
- Intake capture
- Internal console queue
- Manual send only
- Audit logging

### Phase 1B
- Bounded extraction and summarization
- Pricing approval gate
- Template-assisted draft generation

## Decision Frame
Ship Phase 1 as an operator-first automation layer, not an autonomous sales agent. The product should optimize intake speed and operational clarity while explicitly preserving human control over any commercial commitment. The key decision is to treat LLMs as bounded assistive components inside deterministic workflow gates rather than as decision-makers.

## Unknowns & Evidence Gaps
- Exact approval latency target acceptable to operations
- Precision and recall thresholds required for pricing-content detection
- Which FAQ categories are safe for fully deterministic auto-response in production
- WhatsApp template and compliance constraints for the target deployment context
- Volume assumptions needed to size queue-management and staffing impact

## Pass/Fail Readiness
### Pass If
- Restricted content cannot be sent without approval in tested flows
- Audit logs reconstruct each outbound message path end-to-end
- Operators can process a full inquiry from intake to approved reply in the console
- Deterministic fallback works when model output is invalid or unavailable

### Fail If
- Any path allows autonomous pricing commitment
- Approval records are incomplete or bypassable
- Escalation reasons are opaque to operators
- Model features are required for core system safety

## Recommended Next Artifact
Technical spec for the workflow engine, policy enforcement layer, approval-state machine, and audit log schema, followed by a user-story set for operator console and WhatsApp intake flows.
