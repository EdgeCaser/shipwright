# Phase 1 PRD: Event Management Automation Platform

## Overview
Build a Phase 1 event management automation platform that lets customers and operators coordinate event requests through a WhatsApp assistant and an internal console, while enforcing hard approval gates for any pricing commitment and keeping all LLM behavior inside deterministic, auditable boundaries.

## Problem
Event operations teams lose time handling repetitive inquiry intake, availability checks, follow-ups, and draft coordination across fragmented channels. Existing manual workflows are slow, inconsistent, and error-prone, but fully autonomous AI is unacceptable where it can create pricing, contractual, or operational risk.

## Goals
- Reduce manual effort for first-response intake, qualification, and workflow routing.
- Give customers a fast WhatsApp-based interface for common event coordination tasks.
- Let operators review, edit, approve, and complete workflows in an internal console.
- Prevent unapproved pricing commitments, discounts, or binding terms.
- Constrain LLM use to non-authoritative drafting, summarization, classification, and suggestion tasks with deterministic checks around all external actions.

## Non-Goals
- Fully autonomous booking or contract execution.
- Automatic price quotation without human approval.
- Free-form LLM control over system actions, payment actions, or vendor commitments.
- Multi-channel expansion beyond WhatsApp in Phase 1.
- Dynamic pricing optimization.

## Users
- Event requester: submits inquiries, answers intake questions, receives updates in WhatsApp.
- Event operations specialist: reviews inbound requests, edits drafts, approves pricing, sends final responses.
- Operations manager: monitors queue health, approval SLAs, audit logs, and exception volume.

## Jobs To Be Done
- As an event requester, I want to describe my event in WhatsApp and get a fast, clear next step.
- As an ops specialist, I want the system to collect structured details and prepare drafts so I can review faster.
- As an ops manager, I want pricing and outbound commitments to stay controlled and auditable.

## Product Scope
### Customer-facing WhatsApp assistant
- Receive inbound event inquiries.
- Ask deterministic follow-up questions from approved intake flows.
- Capture structured data: date, location, attendee count, event type, budget range, special requirements.
- Provide status updates and request missing information.
- Present only approved outbound messages.

### Internal console
- Queue of inbound conversations and event cases.
- Structured case view with customer details, transcript, extracted fields, status, and risk flags.
- Draft composer for outbound responses.
- Approval workflow for pricing commitments.
- Audit trail for all user actions, model suggestions, approvals, and outbound sends.

### Human approval boundary
- Any message containing price, discount, package commitment, availability guarantee, or custom commercial term requires explicit human approval before send.
- The system must block send attempts until an authorized human approves.
- Approved content is versioned and logged.

## Deterministic LLM Boundary
### Allowed LLM tasks
- Conversation summarization.
- Extraction into predefined schema fields.
- Intent classification into predefined labels.
- Draft response suggestions using approved templates and retrieved case context.
- Internal-only rewrite suggestions for operator efficiency.

### Prohibited LLM tasks
- Direct tool execution without deterministic policy checks.
- Final price generation as authoritative output.
- Sending outbound WhatsApp messages directly.
- Making commitments on availability, staffing, or contractual terms.
- Modifying approval rules, pricing rules, or policy text.

### Boundary architecture
- LLM outputs are always treated as suggestions, never executable truth.
- All state changes occur through deterministic services with typed inputs and validation.
- Approved response templates, pricing logic, and policy rules live outside the model.
- Safety and policy classifier checks run before send.
- High-risk content routes to human review by default.

## Functional Requirements
### Intake and case creation
- System shall create a case for every new WhatsApp inquiry.
- System shall run a deterministic intake flow based on event type and missing required fields.
- System shall store the full transcript and extracted structured fields.

### Draft generation
- System shall generate internal draft replies using approved templates plus case context.
- System shall label each draft with confidence, risk type, and whether approval is required.
- System shall let operators edit any draft before approval or send.

### Pricing control
- System shall allow price suggestions only as internal drafts.
- System shall require explicit approval from authorized staff before any customer-visible pricing commitment is sent.
- System shall log approver identity, timestamp, approved content version, and linked case.

### Console workflow
- Operators shall be able to view queues by status: new, awaiting customer info, awaiting operator review, awaiting pricing approval, ready to send, closed.
- Operators shall be able to escalate, reassign, comment internally, and resolve cases.
- Managers shall be able to see approval bottlenecks and exception rates.

### Audit and compliance
- System shall preserve an immutable event log of model suggestions, rule evaluations, approvals, edits, and outbound sends.
- System shall show why a message was blocked or routed for approval.
- System shall retain policy decisions for later review.

## User Experience Principles
- Customer experience should feel responsive, clear, and bounded rather than open-ended.
- Operator experience should optimize review speed, not hide system uncertainty.
- Risk state should be explicit at every step.

## Success Metrics
- Median first-response time reduced by 50% versus manual baseline.
- At least 70% of inbound cases reach structured completeness without manual first-touch.
- 100% of outbound pricing commitments have recorded human approval.
- Less than 2% of cases require rework due to extraction or routing error.
- Operator handling time per qualified case reduced by 30%.

## Risks
- Over-reliance on low-confidence extraction creates bad case data.
- Operators may treat drafts as authoritative if risk labels are weak.
- Approval queues may become a bottleneck if policy scope is too broad.
- WhatsApp UX may degrade if flows feel overly rigid.

## Launch Plan
- Phase 1A: intake, case creation, console queue, transcript storage, manual send.
- Phase 1B: LLM extraction and summary suggestions with audit logging.
- Phase 1C: draft generation plus enforced pricing approval workflow.
- Phase 1D: metrics dashboards and manager controls.

## Decision Frame
Ship Phase 1 with strict human-in-the-loop control over all commercial commitments and a narrow deterministic LLM boundary. Optimize for operational leverage and auditability, not autonomy. The core decision is to use LLMs only for assistive cognition and drafting while keeping system actions, pricing policy, and outbound authority in deterministic services plus human approval.

## Unknowns & Evidence Gaps
- Actual event-team baseline metrics for response time, handling time, and inquiry volume are not yet provided.
- Pricing approval policy granularity is unspecified: whether all quotes, only discounts, or all package mentions require approval.
- User-role model is incomplete: authorization levels and separation of duties need definition.
- No regulatory, retention, or regional messaging constraints were provided.
- Integration assumptions for CRM, calendar, inventory, or payment systems remain undefined.

## Pass/Fail Readiness
Pass if:
- deterministic approval gates are implemented for all customer-visible pricing content;
- LLM outputs are non-authoritative and cannot directly send messages or mutate policy;
- console supports review, edit, approval, and audit logging;
- WhatsApp intake captures required event fields through bounded flows.

Fail if:
- pricing can reach customers without explicit human approval;
- LLM output can trigger external actions directly;
- audit trail is incomplete for drafts, edits, and approvals;
- operators cannot understand why a case was blocked or escalated.

## Recommended Next Artifact
Technical spec for the approval-state machine, policy engine, message-risk classifier, and LLM guardrail architecture, followed by user stories for intake flow, approval workflow, and audit logging.
