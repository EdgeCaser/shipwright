# Phase 1 PRD: Event Management Automation Platform

## Product Summary
Build a Phase 1 event management platform that lets customers interact through a WhatsApp assistant while operations staff manage requests in an internal console. The system may use LLMs only inside tightly bounded, non-authoritative tasks. Any pricing commitment, vendor commitment, policy exception, or irreversible customer-facing action must remain deterministic and require explicit human approval where specified.

## Problem
Event teams lose time handling repetitive inbound questions, qualification, scheduling coordination, quote drafting, and status follow-up across chat channels. Existing workflows are fragmented across messaging apps, spreadsheets, and human coordinators, which creates slow response times and inconsistent pricing discipline. A useful Phase 1 solution must improve throughput without allowing model behavior to create financial, legal, or operational risk.

## Goals
- Reduce coordinator time spent on repetitive customer messaging and request intake.
- Provide fast WhatsApp-based customer interaction for inquiry capture, status updates, and guided data collection.
- Centralize requests, conversations, quote drafts, and approvals in an internal console.
- Enforce deterministic controls around prices, approvals, state transitions, and outbound commitments.
- Create a clear human-in-the-loop boundary that is auditable and operationally practical.

## Non-Goals
- Fully autonomous event booking.
- Automatic final pricing commitments without human approval.
- Autonomous vendor contracting or payment execution.
- Open-ended agent behavior with tool access beyond approved workflows.
- Multi-channel support beyond WhatsApp in Phase 1.

## Primary Users
- Customer: Inquires about event services, provides requirements, reviews quote, asks status questions.
- Event coordinator: Reviews captured requirements, prepares pricing, approves or rejects outbound commitments, manages exceptions.
- Operations manager: Monitors queue health, audit logs, approval latency, and policy compliance.

## Phase 1 Scope
### In Scope
- WhatsApp assistant for inbound inquiry handling.
- Deterministic intake flow for event type, date, location, guest count, budget range, and service needs.
- Internal console for conversation review, request triage, quote drafting, and approval actions.
- Quote recommendation workspace that may use an LLM for summarization or draft formatting, but not for final price authority.
- Approval gate before any pricing commitment is sent to the customer.
- Deterministic outbound templates for approved quotes, status updates, and follow-ups.
- Full audit trail of AI suggestions, human edits, approvals, and sent messages.

### Out of Scope
- Dynamic optimization of pricing via model-generated reasoning.
- Automatic negotiation with customers.
- Direct integration with supplier booking systems unless they remain read-only.
- Voice calls or multilingual expansion unless explicitly templated.

## User Stories
- As a customer, I can start a WhatsApp conversation and provide event details without downloading a new app.
- As a customer, I can receive clear status updates on whether my quote is pending review, approved, or needs more information.
- As a coordinator, I can review structured intake data and the original chat transcript in one place.
- As a coordinator, I can generate a quote draft and know that no price is sent until I approve it.
- As an operations manager, I can verify which messages were AI-assisted, which were deterministic templates, and who approved each commitment.

## Functional Requirements
### 1. WhatsApp Assistant
- The assistant must authenticate and manage customer conversations through the approved WhatsApp business integration.
- The assistant must use deterministic flows for required intake fields.
- The assistant may use an LLM only to classify free-text messages into bounded categories, summarize conversation context, or suggest internal draft replies.
- If user intent is ambiguous, high risk, or outside supported flows, the conversation must be routed to human review.
- The assistant must never present estimated pricing as committed pricing unless an approved quote record exists.

### 2. Internal Console
- Display customer profile, event details, conversation transcript, workflow state, and pending actions.
- Allow coordinators to edit structured event data and create quote drafts.
- Show model-produced summaries and suggested drafts as non-authoritative assistance.
- Require explicit user action to approve or reject pricing commitments.
- Provide role-based permissions for agent, approver, and manager roles.

### 3. Pricing and Approval Workflow
- Quote generation inputs must come from deterministic pricing rules, configurable rate cards, and approved manual adjustments.
- Any outbound message containing price, discount, package commitment, or booking hold must require human approval before send.
- Approved quotes must be versioned with approver identity, timestamp, and diff from prior versions.
- If pricing data is incomplete or stale, the system must block send and flag the record.

### 4. LLM Boundary Controls
- LLM use is permitted only in these tasks:
- Conversation summarization.
- Intent classification into a fixed schema.
- Extraction suggestions for non-critical structured fields subject to human review or confidence thresholds.
- Internal draft message suggestions.
- LLM output must never directly trigger state changes, send external messages, commit pricing, or execute integrations.
- All external sends and workflow mutations must pass through deterministic policy checks.
- Prompt and response logging must be retained for audit where policy permits.

### 5. Auditability and Compliance
- Record every inbound message, model invocation, suggestion shown to staff, approval action, and outbound message.
- Mark each outbound message with provenance: template-only, human-authored, or AI-assisted plus human-approved.
- Maintain immutable approval logs for pricing commitments.

## Workflow
1. Customer starts WhatsApp conversation.
2. Assistant collects intake data using deterministic prompts.
3. If free text arrives, system may classify or summarize within bounded schema.
4. Request enters internal console as Draft Intake or Needs Review.
5. Coordinator reviews data and creates quote draft from deterministic pricing tools.
6. Coordinator or approver approves quote.
7. System sends approved outbound quote using deterministic template populated from approved record.
8. Follow-up and status messages continue through WhatsApp with escalation when unsupported cases appear.

## Safety and Failure Handling
- If the LLM fails, the intake flow must fall back to deterministic prompts or human review.
- If classification confidence is below threshold, do not auto-apply extracted values.
- If customer asks for exceptions, custom discounts, or legal/payment commitments, route to human.
- If approval service is unavailable, block pricing sends.
- If policy checks fail, log the failure and require manual intervention.

## Success Metrics
- Median first response time to new inquiry.
- Percentage of inquiries with complete intake before human touch.
- Coordinator handling time per qualified inquiry.
- Quote approval turnaround time.
- Percentage of outbound pricing messages sent with valid approval record.
- Escalation rate from assistant to human.
- Policy violation count, target zero for unauthorized pricing commitments.

## Launch Criteria
- Deterministic pricing engine and approval gates are enforced in staging and production.
- Audit logs are complete for model calls, approvals, and sends.
- Unsupported intents reliably route to human review.
- No path exists where LLM output can directly send a pricing commitment.
- Internal users can manage requests end-to-end for defined event categories.

## Risks
- Over-reliance on model extraction could create subtle data quality errors.
- Approval steps could slow response times if console workflows are poorly designed.
- WhatsApp conversation patterns may be more unstructured than initial flows assume.
- Staff may treat AI suggestions as authoritative unless provenance is explicit.

## Dependencies
- WhatsApp business API integration.
- Deterministic pricing rules engine or rate-card service.
- Authentication and role-based access control for internal users.
- Logging and audit storage.
- Template management for outbound customer communications.

## Decision Frame
The Phase 1 product should optimize for controlled operational leverage, not autonomy. The core decision is to allow LLMs only in assistive, non-authoritative tasks while reserving pricing, commitments, and workflow mutations for deterministic systems plus explicit human approval. This makes the product slower than a fully autonomous agent vision, but materially safer and more deployable for a revenue-impacting workflow.

## Unknowns & Evidence Gaps
- Which event categories have sufficiently standardized pricing to support deterministic quote drafting in Phase 1.
- How often customers ask questions that fall outside a bounded WhatsApp flow.
- What approval latency is acceptable before the human gate erodes user experience.
- Whether coordinators need single or dual approval for discounts above a threshold.
- Whether compliance or retention requirements limit prompt/response logging detail.

## Pass/Fail Readiness
Pass if the system demonstrably prevents unauthorized pricing commitments, produces auditable approval records, supports a complete intake-to-quote workflow for a narrow initial event segment, and keeps human review load operationally manageable. Fail if the LLM can bypass policy controls, if approvals are not reliably enforced, or if escalation volume is so high that the assistant adds little operational leverage.

## Recommended Next Artifact
Produce a workflow and controls spec covering: state machine, approval checkpoints, pricing policy rules, LLM allowed-actions matrix, escalation triggers, and audit-log schema. That artifact should precede detailed engineering breakdown because the main product risk is control-boundary design, not interface breadth.
