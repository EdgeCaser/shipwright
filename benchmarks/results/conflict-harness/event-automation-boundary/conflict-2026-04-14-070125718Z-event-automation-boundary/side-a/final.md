# Revised artifact

# Phase 1 PRD: Event Management Automation Platform

## Product Summary
Build a Phase 1 event operations platform that combines a WhatsApp-based customer assistant, an internal operator console, and deterministic workflow controls. The system accelerates lead intake, qualification, quote drafting, and coordination for event bookings while preserving a strict human approval boundary for any pricing commitment and limiting LLM usage to narrowly scoped, non-authoritative tasks.

## Problem
Event teams lose time handling repetitive inbound conversations, gathering incomplete requirements, manually drafting quotes, and coordinating follow-ups across channels. Existing workflows are slow, inconsistent, and difficult to audit. At the same time, fully autonomous AI handling is unacceptable where pricing, contractual commitments, and operational promises create business risk.

## Goal
Ship a Phase 1 workflow that:
- captures and structures inbound event requests over WhatsApp
- assists operators with draft summaries and response suggestions
- enforces human approval before any price or binding commitment is sent
- keeps all critical business logic deterministic and auditable
- measures whether the approval boundary is operationally sustainable at launch volumes

## Non-Goals
- fully autonomous booking without staff review
- automatic final pricing decisions by an LLM
- contract generation or signature workflow
- deep CRM/ERP integrations beyond basic export or webhook support
- proving in Phase 1 that every approval step improves throughput under all staffing conditions

## Users
- Event requester: prospect or customer using WhatsApp to inquire about an event
- Internal operator: staff member reviewing requests, editing details, approving responses, and managing quotes
- Manager/admin: configures pricing rules, approval policies, templates, and audit review

## Phase 1 Scope
### In Scope
- WhatsApp assistant for inbound and outbound conversation handling
- structured intake flow for event type, date, guest count, venue status, budget, and special requirements
- internal console showing conversation history, extracted fields, status, and draft actions
- deterministic quote calculator based on configurable pricing rules
- human approval gate before sending any pricing, discount, or availability commitment
- LLM-generated draft summaries and draft reply suggestions with explicit labels
- audit log for extraction, recommendation, approval, edit, and send events
- status model for lead triage through quote-ready handoff
- instrumentation for approval queue volume, approval latency, and quote turnaround impact

### Out of Scope
- payment collection
- vendor procurement automation
- autonomous negotiation
- final contract issuance
- dynamic ML-based price optimization

## Product Principles
- Deterministic where the business takes risk
- Human approval where the business makes commitments
- LLM assistance only where mistakes are recoverable and inspectable
- Every customer-visible commitment must be attributable to a human-approved action or deterministic rule
- Operators must be faster, not bypassed
- Any hard control that harms service levels must be measurable and revisited

## Key Requirements
### 1. WhatsApp Assistant
The system must receive inbound WhatsApp messages and maintain a threaded conversation per lead. It must guide users through a structured intake sequence while allowing free-text input.

Functional requirements:
- create or resume a lead record from an inbound conversation
- ask for missing required fields using deterministic prompt flows
- store raw messages and normalized extracted fields separately
- allow outbound follow-up messages from the console
- tag each outbound message as one of: template, operator-written, LLM-draft-approved, deterministic quote-approved

Acceptance criteria:
- a new inbound message creates a visible lead within 5 seconds
- missing required intake fields are surfaced in the console
- staff can send an approved reply without leaving the console

### 2. Internal Console
Operators need a single workspace to review conversations, see structured event data, and approve or edit outgoing actions.

Functional requirements:
- lead queue with statuses: New, In Qualification, Needs Human Review, Quote Ready, Quote Sent, Won, Lost
- lead detail page with conversation transcript, extracted event fields, suggested next action, and audit history
- editable structured fields with change history
- approval panel for quote and commitment review
- admin panel for pricing rules, templates, and approval settings
- approval queue dashboard with aging, backlog, and breach risk indicators

Acceptance criteria:
- operators can process a lead end-to-end from qualification to quote send in one interface
- every field edit records actor, timestamp, old value, and new value
- pricing approval state is visible before message send
- pending approvals older than configured SLA are visible to approvers

### 3. Deterministic Pricing Engine
All quote calculations and pricing commitments must be generated by rules code, never directly by an LLM.

Functional requirements:
- support configurable base packages, add-ons, surcharges, taxes/fees placeholders, and discount approval thresholds
- return line items plus total and assumptions
- reject quote generation when required inputs are missing
- expose rule version used for every quote draft

Acceptance criteria:
- same inputs always produce the same quote output
- quote output is reproducible from stored inputs and rule version
- any discount above configured threshold requires explicit approval by authorized role

### 4. Human Approval Boundary
Phase 1 will launch with a hard approval gate for any customer-visible price, discount, availability commitment, or exception. This is a deliberate risk-control decision for launch, not a claim that the boundary is already throughput-optimized.

Functional requirements:
- outbound messages containing pricing or commitment tokens are blocked unless linked to an approved record
- operators may edit system drafts before approval
- approved messages are frozen for send integrity; post-approval edits require re-approval
- role-based permissions determine who can approve standard vs exception cases
- system records queue entry time, approval completion time, and breached-SLA events for each gated message

Acceptance criteria:
- no price-bearing message can be sent without an approval event
- edited approved content triggers re-approval
- system logs who approved what content and when
- approval latency can be reported by queue, role, and hour of day

### 5. LLM Boundary Controls
LLM usage must be constrained to assistive functions with clear deterministic wrappers.

Allowed Phase 1 LLM tasks:
- draft structured summaries from conversation text
- suggest candidate field extractions for operator confirmation
- generate reply drafts from approved internal facts and templates
- classify inbound intent into a bounded taxonomy

Disallowed Phase 1 LLM tasks:
- final pricing calculation
- discount selection
- availability promises
- policy exception approval
- sending messages directly to customers without human or deterministic gate checks

Control requirements:
- every LLM output must be labeled as draft or suggestion
- prompts must use bounded schemas and structured outputs where possible
- downstream systems must treat LLM outputs as untrusted until validated
- fallback path must exist when LLM output is missing, invalid, or low confidence

Acceptance criteria:
- operators can complete core workflows if LLM services are degraded
- invalid LLM output never bypasses deterministic checks
- customer-visible commitments are sourced only from approved deterministic artifacts

## User Stories
- As an event requester, I want to ask about an event over WhatsApp so I can start planning quickly.
- As an operator, I want the system to summarize the conversation and flag missing details so I can work faster.
- As an operator, I want a draft quote prepared from rules so I can review instead of calculating manually.
- As a manager, I want pricing commitments gated by approval so margins and policy stay controlled.
- As an admin, I want a full audit trail so I can investigate errors and train the team.

## Core Workflow
1. Customer sends an inbound WhatsApp message.
2. System creates lead and begins deterministic intake flow.
3. LLM may suggest extracted fields and summary; operator reviews as needed.
4. Once required data is present, deterministic pricing engine produces quote draft.
5. Operator reviews quote and proposed response.
6. Authorized human approves any pricing or commitment.
7. System sends approved outbound WhatsApp message.
8. All actions are logged for audit and approval-latency analysis.

## Data Model
### Lead
- lead_id
- contact_id
- conversation_id
- status
- event_type
- event_date
- guest_count
- venue_status
- budget_range
- special_requirements
- source_channel
- owner

### Conversation Message
- message_id
- direction
- channel
- raw_text
- normalized_text
- timestamp
- sender_type
- approval_link_id nullable

### Quote Draft
- quote_id
- lead_id
- rule_version
- line_items
- subtotal
- discounts
- total
- assumptions
- approval_status
- approved_by nullable
- approved_at nullable

### Audit Event
- audit_id
- entity_type
- entity_id
- action_type
- actor_type
- actor_id
- before_state nullable
- after_state nullable
- timestamp

### Approval Event
- approval_id
- quote_id or message_id
- queue_entered_at
- approved_at nullable
- approver_role nullable
- sla_target_minutes
- sla_breached boolean

## Business Rules
- Required fields for quote generation: event type, date or date range, guest count, venue status, and package baseline inputs
- Any outbound content containing price, discount, minimum spend, availability assurance, or exception language must be approval-gated
- Free-text operator messages without commitments may be sent without pricing approval, subject to configured policy
- LLM-extracted fields remain provisional until accepted by operator or validated by deterministic parser
- Deterministic templates must be available for common no-LLM fallback paths

## Metrics
### Primary Phase 1 Success Metrics
- median time from inbound lead to quote-ready state
- median operator handling time per qualified lead
- percent of leads with complete structured intake before human intervention
- quote turnaround time
- approval compliance rate for price-bearing messages

### Boundary Validation Metrics
- median approval latency for price-bearing outbound messages
- p95 approval latency for price-bearing outbound messages
- percent of approval-gated messages meeting internal SLA target
- approval queue backlog by hour and role
- lead drop-off rate after quote-ready but before quote send

### Guardrail Metrics
- rate of outbound pricing messages sent without valid approval target; target is zero
- extraction correction rate by operators
- LLM fallback rate
- customer confusion or complaint rate tied to inconsistent responses
- quote revision rate after send

## Risks
- Over-trusting LLM suggestions may create hidden operational errors
- Approval flow friction may reduce speed if poorly designed
- Pricing rules may not cover enough edge cases at launch
- WhatsApp conversation ambiguity may lower extraction quality
- Staff may route around the system if the console is slower than existing tools
- A hard approval gate may create quote-send bottlenecks if staffing or SLA assumptions are wrong

## Dependencies
- WhatsApp messaging integration
- authentication and role-based access control
- pricing rules configuration service
- audit logging and storage
- LLM provider behind structured-output wrapper with monitoring

## Launch Plan
### Phase 1A
- inbound WhatsApp capture
- structured intake
- internal console basics
- deterministic pricing engine MVP
- approval-gated quote send
- approval latency instrumentation and reporting

### Phase 1B
- better reply drafting
- bounded intent classification
- admin pricing configuration improvements
- reporting on throughput and compliance
- review of approval-boundary performance against SLA and staffing assumptions

## Open Design Decisions
- what internal SLA target is acceptable for approval-gated quote sends
- whether availability statements are fully blocked or can be conditionally templated before manual confirmation
- which discount thresholds require manager versus operator approval
- whether operators can send non-price scheduling follow-ups without second review
- minimum viable rule complexity for launch pricing packages

## Decision Frame
Ship Phase 1 as an operator-assist system, not an autonomous agent. For launch, place LLMs strictly inside a suggestion layer while all pricing, approval, and customer commitment logic remains deterministic and auditable. Treat the hard approval boundary as an explicit Phase 1 risk-control choice that must be validated operationally through approval-latency, backlog, and quote-turnaround metrics rather than assumed to be throughput-neutral.

## Unknowns & Evidence Gaps
- exact pricing rule complexity and edge-case frequency are unknown
- current operator baseline metrics are not provided, so workflow-acceleration targets are provisional
- approval SLA tolerance by internal staff is unknown
- acceptable customer wait time for quote responses is not yet quantified
- staffing model for projected approval volume is not provided
- WhatsApp-specific user behavior patterns and drop-off rates are not yet validated
- no evidence is provided on integration constraints with existing systems of record

## Pass/Fail Readiness
Pass if stakeholders accept the hard approval gate as a launch control, commit to instrumenting and reviewing its operational impact, and can staff approvals well enough to meet an agreed internal quote-response SLA. Fail if stakeholders require proof today that the boundary improves throughput, cannot define or staff an approval SLA, or require autonomous pricing and commitment behavior in Phase 1.

## Recommended Next Artifact
Technical spec covering system boundaries, approval-state machine, deterministic pricing rule design, LLM schema contracts, audit model, failure-mode handling, and an approval-capacity model with SLA assumptions.
