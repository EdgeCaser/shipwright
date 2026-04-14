# Phase 1 PRD: Event Automation Platform

## Overview
Build a Phase 1 event management automation platform that combines a WhatsApp-based customer assistant, an internal operator console, and explicit human approval gates for any pricing commitment. The product must use LLMs only inside strict deterministic boundaries so that customer-facing commitments, workflow state changes, and operational actions remain auditable and controlled.

## Problem
Event teams lose time handling repetitive inbound requests, qualification, scheduling coordination, and quote preparation across fragmented channels. Pure automation is risky because pricing, package exceptions, and operational commitments can cause revenue leakage or fulfillment failures. The platform needs to automate low-risk conversation and data capture while keeping pricing and other sensitive commitments behind human approval.

## Goals
- Reduce manual effort for first-response, intake, and routine event inquiry handling.
- Give leads a fast WhatsApp-native experience.
- Route all pricing commitments through explicit human approval.
- Constrain LLM usage to bounded tasks with deterministic system enforcement.
- Provide operators with a console to review, approve, edit, and send customer-ready outputs.

## Non-Goals
- Fully autonomous quoting or contract generation.
- Direct payment collection.
- Multi-channel assistant support beyond WhatsApp in Phase 1.
- Dynamic pricing optimization.
- Automatic vendor booking or irreversible downstream actions.

## Users
- Prospect or customer: asks about event options over WhatsApp.
- Sales or event operator: reviews captured details, prepares quotes, approves commitments.
- Admin: configures catalog, pricing rules, approval policies, and templates.

## Core Jobs To Be Done
- Capture event requirements quickly from inbound chat.
- Determine whether the request is qualified enough for operator review.
- Draft structured summaries and recommended next steps for internal staff.
- Produce a quote draft without allowing the model to invent prices.
- Require human approval before any price or package commitment is sent.

## Phase 1 Scope
### 1. WhatsApp Assistant
The assistant handles inbound conversations, asks deterministic intake questions, collects structured event details, answers approved FAQ-style questions, and escalates when confidence is low or policy boundaries are reached.

### 2. Internal Console
The console shows conversation history, extracted event details, qualification status, quote draft state, approval queue, and operator actions. Operators can edit structured fields, approve or reject pricing, and send final messages.

### 3. Pricing Approval Gate
Any outbound message containing price, package, discount, availability commitment, or exception requires a human approval event before delivery.

### 4. Deterministic LLM Boundary Layer
LLM outputs are advisory only unless translated through rule-based validators, schema checks, permission gates, and explicit workflow transitions.

## User Experience
### WhatsApp Flow
1. Customer sends inquiry.
2. Assistant identifies intent using bounded classification.
3. Assistant asks required intake questions from a fixed playbook.
4. Assistant stores structured answers in the event record.
5. If the customer asks a supported FAQ, the assistant responds using approved knowledge snippets.
6. If the customer asks for pricing or a custom package, the assistant acknowledges request and sets expectation that a specialist will confirm.
7. System creates or updates operator task.
8. Operator reviews, edits if needed, approves quote or follow-up, and sends final response.

### Internal Console Flow
1. Operator opens queue of active inquiries.
2. Operator sees extracted fields: event date, location, headcount, event type, budget, requested services, special constraints.
3. System may present a draft quote assembled from deterministic catalog and pricing rules.
4. Operator can modify selections and request regenerated wording.
5. Before sending any price-bearing response, operator must click approve.
6. Audit log records approver, timestamp, payload, and version.

## Functional Requirements
### Conversation and Intake
- Support inbound and outbound WhatsApp messaging for one business number.
- Maintain customer thread history linked to a single event record.
- Use fixed required intake fields by event type.
- Allow partial intake and resume later.
- Flag missing critical fields before quote draft generation.

### Internal Console
- Queue view with statuses: new, intake-in-progress, awaiting-operator, quote-draft-ready, awaiting-approval, sent, closed.
- Event detail page with editable structured record.
- Timeline with customer messages, system actions, and approval events.
- Search and filter by date, status, event type, and owner.

### Pricing and Quote Drafting
- Prices must come only from deterministic catalog, rules engine, or manually entered operator values.
- LLM may help draft explanatory wording but cannot originate numeric prices, discounts, or availability commitments.
- Any change to a numeric price field invalidates previous approval.
- Quote drafts must show source for each price line item.

### Approval Controls
- Messages that include protected content categories require approval: pricing, discount, availability guarantee, package exception, contract-like promise.
- Approval must bind to exact message payload or approved structured quote version.
- Sending unapproved protected content must be blocked at API layer.

### Admin Configuration
- Manage intake playbooks.
- Manage approved FAQ knowledge snippets.
- Manage product catalog, pricing rules, approval policies, and protected content detection rules.

## LLM Boundary Design
### Allowed LLM Uses
- Intent classification into fixed label set.
- Entity extraction into strict schema.
- Summarization of conversation for operators.
- Drafting customer-friendly text from approved structured inputs.
- Low-risk FAQ response generation limited to approved source snippets.

### Disallowed LLM Uses
- Setting or modifying prices.
- Approving quotes.
- Making availability guarantees.
- Triggering irreversible external actions.
- Creating policy exceptions.

### Enforcement Mechanisms
- Schema validation on all extracted fields.
- Rule-based intent routing for protected asks.
- Template- or slot-based rendering for price-bearing messages.
- Content classifier for protected outbound content.
- Hard workflow gate requiring human approval token before send.
- Full audit log of prompts, outputs, approvals, and final messages.

## Data Model
Core entities:
- Contact
- Conversation Thread
- Event Record
- Quote Draft
- Approval Record
- Catalog Item
- Pricing Rule
- Operator Task
- Audit Event

## Success Metrics
- Median first-response time on WhatsApp.
- Percentage of inquiries with complete intake after first interaction.
- Operator handling time per qualified lead.
- Percentage of protected outbound messages sent only after approval.
- Quote revision rate after approval.
- Escalation rate due to boundary or confidence failure.

## Guardrails
- Zero unapproved price-bearing messages sent.
- Zero autonomous downstream bookings.
- All protected message sends have immutable approval records.
- All quote amounts trace back to catalog, pricing rules, or manual operator edits.

## Risks
- Protected content detection may under-block or over-block.
- Intake friction may reduce conversion if the assistant asks too many questions.
- Catalog and pricing-rule quality may limit usefulness of quote drafts.
- Operators may bypass workflow unless enforcement is implemented at send time, not only in UI.

## Launch Criteria for Phase 1
- WhatsApp assistant can complete structured intake for core event categories.
- Internal console supports queue management, record editing, and approval workflow.
- Protected outbound content cannot be sent without approval.
- Pricing lines are always deterministic and auditable.
- Audit trail is complete for conversation, quote, approval, and send events.

## Decision Frame
Ship Phase 1 as a constrained automation system, not an autonomous sales agent. Optimize for faster intake and operator leverage while preserving human control over pricing and commitments. The core product decision is that LLMs assist with language and structure, but authority stays in deterministic systems and human approvals.

## Unknowns & Evidence Gaps
- Which event categories should be supported first to maximize operator leverage.
- What threshold of intake completeness is sufficient before operator handoff.
- How often customers expect immediate pricing versus consultative follow-up.
- Which protected content patterns are hardest to detect reliably in outbound messages.
- How much operator editing is required after LLM-generated summaries and draft wording.

## Pass/Fail Readiness
Pass if the Phase 1 build enforces approval on all protected outbound content, keeps pricing deterministic, provides a usable operator console, and reduces manual intake effort without increasing commitment risk.

Fail if any customer-facing pricing can be sent without approval, if LLM output can directly change authoritative state, or if operators cannot trust the audit trail and quote provenance.

## Recommended Next Artifact
Technical spec for workflow state machine, approval-token enforcement, protected-content detection, deterministic pricing service, and WhatsApp-to-console event architecture.
