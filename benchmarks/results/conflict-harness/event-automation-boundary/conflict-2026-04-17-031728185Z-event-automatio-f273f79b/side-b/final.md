# Revised artifact

## Phase 1 PRD: Event Management Automation Platform

## Product Summary
Build a Phase 1 event management automation platform with four core elements: a WhatsApp assistant for external communication, an internal console for operators, a human approval step before any outbound message classified as a pricing commitment is sent, and deterministic boundaries around where LLMs may be used.

## Problem Statement
Event operations need faster response handling and cleaner information capture without allowing model-driven autonomy over commercial commitments or external actions. Phase 1 therefore needs a controlled workflow in which LLMs can assist with bounded drafting or structuring tasks, while deterministic system logic and human review govern approval-sensitive outcomes.

## Goals
- Enable inbound and outbound event-related communication through WhatsApp.
- Give internal operators a console to review conversations, manage work, and control outbound responses.
- Require human approval before any outbound message designated by policy as a pricing commitment is sent.
- Keep workflow transitions, approvals, and send decisions under deterministic system control.

## Non-Goals
- Fully autonomous quoting or negotiation.
- Unreviewed outbound pricing commitments.
- Model-controlled approvals, business rules, or direct external side effects.
- Broad end-to-end automation beyond Phase 1 intake, response drafting support, pricing review, and operator handoff.

## Users
- Event customers communicating through WhatsApp.
- Internal operators managing inquiries and responses.
- Human approvers responsible for reviewing pricing-related outbound messages.

## Scope
### In Scope
- WhatsApp assistant for customer-facing interaction.
- Internal console for review and action management.
- Approval workflow for outbound pricing-related messages once message classes are defined.
- Deterministic boundaries around LLM use.

### Out of Scope
- Autonomous pricing authorization.
- Autonomous exception handling without operator review.
- Unbounded model-driven workflow orchestration.

## Functional Requirements
### 1. WhatsApp Assistant
- The system must receive inbound WhatsApp messages and associate them with an inquiry thread.
- The assistant may help collect and structure event details.
- The assistant may generate draft responses within allowed boundaries.
- The assistant must not independently send outbound messages that require approval.

### 2. Internal Console
- Operators must be able to view conversation threads and inquiry state.
- Operators must be able to review structured event details.
- Operators must be able to review, edit, approve, or reject draft responses.
- Operators must be able to route messages into an approval step when they fall into a policy-defined approval class.

### 3. Approval Boundary
- Any outbound message classified by policy as a pricing commitment must require explicit human approval before delivery.
- Draft generation, approval, and sending must remain separate states.
- The system must record approval state before releasing an approval-gated message.
- Final implementation depends on a policy definition of which message classes count as pricing commitments.

### 4. Deterministic LLM Boundary
- LLM usage must be limited to bounded assistive functions such as summarization, extraction, and draft generation.
- Workflow transitions, approval rules, classification enforcement, and send/no-send decisions must be deterministic system logic.
- The model must not directly trigger external side effects.
- The system must preserve an audit trail of human decisions and system actions.

## User Flows
### Flow A: Inquiry Intake
1. A customer sends a WhatsApp message.
2. The system opens or updates an inquiry thread.
3. The assistant collects or structures event details.
4. The internal team reviews the thread in the console.

### Flow B: Approval-Gated Pricing Response
1. An inquiry requires a response that falls into the policy-defined pricing-commitment class.
2. A draft message is prepared.
3. A human reviewer approves, edits, or rejects the message.
4. Only approved content is sent to the customer.

### Flow C: Non-Pricing Response
1. An inquiry requires a standard informational reply.
2. A draft may be generated within the allowed boundary.
3. The operator sends or edits the response according to configured workflow.

## System Guardrails
- Approval-gated outbound messages cannot be sent without human signoff.
- Model output is advisory and cannot override deterministic rules.
- Deterministic logic controls state changes and external actions.
- Human operators remain accountable for approval decisions.

## Success Criteria
- Customer conversations can be handled through WhatsApp.
- Internal operators can manage inquiries through a console.
- Approval-gated outbound messages are not sent without human approval.
- LLM behavior remains bounded to reviewable assistive tasks.

## Risks
- The approval boundary cannot be implemented cleanly until pricing-commitment message classes are defined.
- Workflow friction may increase if approval states are unclear.
- Boundary leakage may occur if drafting and execution are not cleanly separated.
- Operator confusion may result if console states are ambiguous.

## Decision Frame
Phase 1 should prioritize controlled operational utility over autonomy. The product should launch with a deterministic approval-first architecture in which WhatsApp supports customer communication, the internal console manages review and action states, and LLMs remain limited to bounded assistive tasks. The pricing-approval boundary is a required product rule, but it is not implementation-ready until the team defines which outbound message classes qualify as pricing commitments.

## Unknowns & Evidence Gaps
- What exact outbound message classes count as pricing commitments?
- Which non-pricing message categories may move through lighter review?
- What minimum event fields are required for a usable intake flow?
- What operator roles and permissions are required in the console?
- What audit detail is required for approvals, edits, and outbound message history?

## Pass/Fail Readiness
### Pass
- The team defines a precise approval policy for pricing-related message classes.
- Deterministic ownership is defined for classification enforcement and send/no-send decisions.
- The console supports distinct draft, review, approval, and send states.
- The assistant remains limited to bounded drafting and structuring tasks.

### Fail
- Pricing-commitment classification remains undefined.
- The model is allowed to trigger external actions directly.
- Console workflows do not clearly separate draft, review, approval, and send states.
- Deterministic and model-driven responsibilities are not explicitly partitioned.

## Recommended Next Artifact
A workflow and policy spec defining message classes, the pricing-commitment definition, approval states, deterministic decision rules, allowed model tasks, prohibited model actions, operator roles, and the lifecycle from inbound WhatsApp message to outbound response.
