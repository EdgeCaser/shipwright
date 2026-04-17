# Phase 1 PRD: Event Management Automation Platform

## Product Summary
Build a Phase 1 event management automation platform with four explicit pillars: a WhatsApp assistant for external communication, an internal console for operators, mandatory human approval before any pricing commitment is sent, and strict deterministic boundaries around where LLMs may be used.

## Problem Statement
Event operations require fast response handling, consistent information capture, and controlled outbound communication. The platform must improve responsiveness without allowing a model to make or send pricing commitments autonomously. The system therefore needs a clear boundary between assistive drafting and deterministic execution.

## Goals
- Enable inbound and outbound event-related communication through WhatsApp.
- Give internal operators a console to review conversations, approve actions, and manage work.
- Enforce human approval before any pricing commitment is communicated.
- Constrain LLM usage to bounded assistive tasks with deterministic guardrails.

## Non-Goals
- Fully autonomous quoting or negotiation.
- Unreviewed outbound pricing messages.
- Open-ended model control over business logic, approvals, or final system actions.
- Broad workflow coverage beyond Phase 1 event intake, pricing review, and operator handoff.

## Users
- Prospective or active event customers communicating via WhatsApp.
- Internal operators reviewing requests and managing responses.
- Approvers responsible for validating pricing commitments before they are sent.

## Scope
### In Scope
- WhatsApp-based assistant experience for customer-facing interaction.
- Internal console for conversation review and action management.
- Human approval checkpoint for pricing commitments.
- Deterministic workflow boundaries around LLM use.

### Out of Scope
- Autonomous pricing authorization.
- Autonomous exception handling without operator review.
- Unbounded model-driven workflow orchestration.

## Functional Requirements
### 1. WhatsApp Assistant
- The system must receive inbound WhatsApp messages and associate them with an event inquiry thread.
- The assistant may help collect structured intake details from the customer.
- The assistant may generate draft responses for operator review where allowed.
- The assistant must not send a pricing commitment without required approval.

### 2. Internal Console
- Operators must be able to view conversation threads and inquiry status.
- Operators must be able to review customer-provided event details.
- Operators must be able to review, edit, approve, or reject draft responses.
- Operators must be able to route inquiries into a pricing approval step when a price or quote is involved.

### 3. Pricing Approval Boundary
- Any message containing a pricing commitment must require explicit human approval before delivery.
- The system must separate draft generation from approval and sending.
- The system must record approval state before a pricing message is released.

### 4. Deterministic LLM Boundary
- LLM usage must be limited to narrowly scoped assistive functions such as summarization, extraction, or draft generation.
- All workflow transitions, approval rules, and send/no-send decisions must be deterministic system logic.
- The model must not directly trigger external side effects.
- The system must preserve a clear audit trail of human decisions and system actions.

## User Flows
### Flow A: Inquiry Intake
1. A customer sends a WhatsApp message.
2. The system opens or updates an inquiry thread.
3. The assistant collects or structures event details.
4. The internal team reviews the thread in the console.

### Flow B: Pricing Response
1. An inquiry requires a pricing response.
2. A draft pricing message is prepared.
3. A human reviewer approves, edits, or rejects the message.
4. Only approved pricing content is sent to the customer.

### Flow C: Non-Pricing Response
1. An inquiry requires a standard informational reply.
2. A draft may be generated within the allowed boundary.
3. The operator sends or edits the response according to configured workflow.

## System Guardrails
- Pricing commitments require human approval before send.
- Model output is advisory and cannot override system rules.
- Deterministic logic controls state changes and external actions.
- Console users remain accountable for approval decisions.

## Success Criteria
- Customer conversations can be handled through WhatsApp.
- Internal operators can manage inquiries through a console.
- No pricing commitment is sent without human approval.
- LLM behavior remains bounded to deterministic, reviewable assistive tasks.

## Risks
- Ambiguity over what qualifies as a pricing commitment.
- Workflow friction if approval steps are too slow or unclear.
- Boundary leakage if draft generation and action execution are not cleanly separated.
- Operator confusion if console states are not explicit.

## Decision Frame
Phase 1 should prioritize controlled operational utility over autonomy. The product should launch with a strict approval-first architecture in which customer communication is supported through WhatsApp, internal staff work from a dedicated console, pricing commitments always require human signoff, and model usage is confined to bounded assistive tasks rather than business-rule execution.

## Unknowns & Evidence Gaps
- What exact message classes count as pricing commitments and therefore require approval?
- Which non-pricing message categories, if any, may be safely sent with lighter review?
- What minimum event fields are required for a usable intake flow?
- What operator roles and permissions are needed inside the console?
- What audit detail is required for approvals, edits, and outbound message history?

## Pass/Fail Readiness
### Pass
- The team agrees on a precise approval boundary for pricing-related messages.
- Deterministic workflow ownership is defined for send/no-send decisions.
- The console supports review, approval state, and message history.
- The assistant is limited to bounded drafting or structuring behaviors.

### Fail
- Pricing approval remains ambiguous.
- The model is allowed to trigger external actions directly.
- Console workflows do not clearly separate draft, review, approval, and send states.
- Deterministic and model-driven responsibilities are not explicitly partitioned.

## Recommended Next Artifact
A workflow and policy spec that defines: message classes, approval states, deterministic decision rules, allowed model tasks, prohibited model actions, operator roles, and the exact lifecycle from inbound WhatsApp message to approved outbound response.
