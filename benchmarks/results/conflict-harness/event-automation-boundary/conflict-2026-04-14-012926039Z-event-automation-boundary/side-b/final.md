# Revised artifact

## Phase 1 PRD: Event Management Automation Platform

### Overview
Build a Phase 1 event management automation platform that handles inbound event inquiries through a WhatsApp assistant and an internal console, while enforcing human approval for any pricing or commitment-bearing outbound message and keeping LLM usage inside strict deterministic boundaries.

### Problem
Event teams spend excessive time on repetitive intake, clarification, and coordination work. Full autonomy is unacceptable for pricing, availability, and policy commitments, but a purely manual workflow does not scale. Phase 1 must automate low-risk workflow steps while preserving operator control over commercially sensitive outcomes.

### Product Goal
Reduce manual handling time for inquiry intake and triage without allowing the system to autonomously make binding pricing, package, or policy commitments.

### Phase 1 Decision
Phase 1 is an operator-first workflow product, not an autonomous sales agent. Human approval remains mandatory for pricing and commitment-bearing content, but the approval boundary is viable only if Phase 1 is explicitly scoped to low-to-moderate approval volume, measured against queue and latency thresholds, and fails into additional staffing or narrower automation if those thresholds are exceeded.

### Non-Goals
- Fully autonomous quote generation or sending
- Automated contract negotiation
- Free-form LLM orchestration across business-critical actions
- Full ERP, invoicing, or payment workflows in Phase 1
- Multi-channel expansion beyond WhatsApp in Phase 1

### Users
- External requester: prospective customer using WhatsApp
- Internal operator: coordinator reviewing intake, drafts, and approvals
- Internal manager: supervisor monitoring queue health, SLA risk, and approval throughput

### Product Principles
- Deterministic before generative
- Human approval before commitment
- Fail closed on restricted actions
- Full traceability on externally visible actions
- Bounded LLM scope with validator enforcement
- Capacity-aware rollout, not assumption-driven rollout

### Scope
#### In Scope
- WhatsApp assistant for intake, FAQ-style collection, and safe acknowledgments
- Internal console for queue review, field correction, draft review, approval, and send
- Structured event inquiry record with progressive enrichment
- Mandatory approval workflow for pricing, discounts, package recommendations, availability commitments not system-verified, and policy exceptions
- Deterministic policy layer that decides allow, block, or escalate
- Audit logging of inbound messages, model outputs, edits, approvals, and sends
- Template library for common follow-up and safe holding responses
- Queue and approval latency instrumentation for operational viability

#### Out of Scope
- Payments
- Contract signature workflow
- Dynamic pricing optimization
- Automatic vendor booking
- Autonomous outbound sales follow-up

### User Flows
#### External WhatsApp Flow
1. Requester starts a conversation.
2. System uses deterministic routing first; LLM is permitted only for bounded extraction, summarization, or rewrite tasks.
3. Assistant collects event date, venue, headcount, event type, budget range, and service needs.
4. If the requester asks for price, package recommendation, discount, or non-verified availability, the assistant sends a safe holding response and routes to operator review.
5. Approved content is sent over WhatsApp.

#### Internal Console Flow
1. Operator reviews new and escalated conversations.
2. Console shows extracted fields, policy decision, confidence flags, and reason codes.
3. System proposes next actions and internal drafts.
4. Restricted drafts remain send-locked until explicit approval.
5. Operator can edit, approve, reject, or request more information.
6. All actions are logged with actor identity and timestamp.

### Functional Requirements
#### FR1. Conversation Intake
- The system must ingest inbound WhatsApp messages into a conversation record.
- The system must maintain a structured event inquiry object with required fields for customer, event date, event type, headcount, location, budget, and special requirements.
- The system must support partial records across multiple turns.

#### FR2. Deterministic Routing
- Each inbound turn must be classified into: collect_info, faq_answer, pricing_request, schedule_request, escalation_needed, or unsupported.
- Routing decisions must be reproducible from logged rules and inputs.
- Ambiguity, low-confidence extraction, or missing policy coverage must escalate to human review.

#### FR3. Bounded LLM Usage
- LLM usage is allowed only for:
  - structured extraction into a predefined schema
  - internal conversation summarization
  - rewriting operator-approved text for tone or brevity without factual change
- LLM usage is prohibited for:
  - deciding final prices or discounts
  - making binding promises on availability or policy exceptions
  - initiating restricted outbound content without approval
- All LLM outputs must pass deterministic validation before display or send eligibility.

#### FR4. Pricing and Commitment Approval Gate
- Any outbound message containing price, price range, package quote, discount, commitment language, or non-verified availability must require human approval.
- Detection must use deterministic rules and versioned pattern logic.
- Restricted content must be impossible to send without approval.
- Approval events must record approver identity, timestamp, message version, and final sent text.

#### FR5. Internal Console
- Operators must be able to review conversations, edit fields, inspect draft provenance, and approve or reject restricted messages.
- Managers must be able to review queue depth, approval throughput, and aging conversations.
- The console must show why a conversation was escalated, blocked, or restricted.

#### FR6. Auditability
- The system must log inbound content, extraction results, prompt/template identifiers, model outputs, validations, operator edits, approval actions, and outbound messages.
- Logs must support reconstruction of the full path to any sent message.

#### FR7. Safe Fallback Behavior
- If WhatsApp delivery fails, the message must remain failed and notify the operator.
- If LLM output fails validation, it must be discarded and replaced by deterministic fallback behavior.
- If policy services are unavailable, restricted sends must fail closed.

#### FR8. Operational Viability Controls
- The system must measure approval volume, median approval latency, P95 approval latency, queue depth, and percent of conversations escalated to human review.
- The system must support a safe holding reply for restricted requests when no operator is immediately available.
- Phase 1 rollout must start with a bounded operational envelope defined by staffing and forecast assumptions, and expand only after metrics remain within target thresholds.
- If approval demand persistently exceeds threshold, the response must be operational, not autonomous: narrow trigger rules, add staffing, or reduce in-scope traffic segments.

### Deterministic Boundary Specification
#### Allowed Automation Boundary
- Intake sequencing from a predefined state machine
- FAQ responses from approved templates
- Schema-bound extraction with validator checks
- Draft generation for internal review only
- Safe status acknowledgments with no commitment language

#### Restricted Boundary Requiring Human Approval
- Prices, ranges, discounts, package recommendations
- Availability commitments where supply is not system-verified
- Policy exceptions
- Contractual or legal statements outside approved templates

#### Hard Prohibited Boundary
- Autonomous quote send
- Autonomous negotiation
- Self-initiated outbound sales pursuit
- Unlogged model calls
- Use of model output when validation or policy checks fail

### Data Model
#### Core Objects
- Conversation
- Contact
- Event Inquiry
- Message
- Draft Response
- Approval Record
- Audit Event
- Policy Decision
- Queue Snapshot

#### Key Fields
- Event Inquiry: event_type, requested_date, headcount, venue, budget_range, services_needed, status
- Draft Response: draft_text, draft_type, contains_pricing_flag, validation_status, source_type
- Approval Record: approver_id, approved_version_id, approval_reason, approved_at
- Policy Decision: decision_type, triggered_rules, confidence, escalated_reason
- Queue Snapshot: queue_depth, oldest_age_minutes, approval_backlog_count, staffing_state

### Success Metrics
#### Primary
- Median time from first inquiry to operator-ready structured brief
- Percentage of inbound inquiries handled without manual data re-entry
- Percentage of restricted outbound messages sent with recorded approval

#### Guardrails
- Zero unapproved pricing or commitment-bearing messages sent
- Zero restricted sends when policy checks are unavailable
- P95 approval latency remains within the agreed operating threshold for pilot scope
- Approval backlog does not exceed the agreed queue threshold for pilot scope
- Extraction correction rate on required fields remains below pilot target after stabilization

### Launch Plan
#### Phase 1A
- Intake capture
- Internal console queue
- Manual send only
- Audit logging
- Baseline measurement of inquiry and approval demand

#### Phase 1B
- Bounded extraction and summarization
- Pricing and commitment approval gate
- Template-assisted draft generation
- Queue threshold alerting and SLA monitoring

### Risks and Mitigations
- Risk: Overly broad pricing detection creates operator overload.
  Mitigation: Start with conservative but versioned rule set, monitor false-positive rate, and tune patterns during pilot.
- Risk: Approval volume exceeds operator capacity and undermines time savings.
  Mitigation: Pilot with bounded traffic segments, enforce queue thresholds, and expand only after observed throughput meets target.
- Risk: Operators overtrust summaries or extracted fields.
  Mitigation: Show provenance, confidence, and original message context in review UI.

## Decision Frame
Proceed only with an operator-first Phase 1 that keeps pricing and commitment approval mandatory and treats operational viability as a launch condition, not an assumption. The core decision is to automate intake and drafting while explicitly accepting that commercial commitments stay human-controlled until measured queue, latency, and staffing data show the boundary is sustainable.

## Unknowns & Evidence Gaps
- Exact pilot approval latency target acceptable to operations
- Initial approval volume forecast by inquiry segment and time window
- Precision and recall thresholds for pricing and commitment detection
- Which FAQ categories are safe for deterministic auto-response in production
- WhatsApp compliance and template constraints in the target deployment context
- Staffing model required to hold queue and latency within pilot thresholds

## Pass/Fail Readiness
### Pass If
- Restricted content cannot be sent without approval in tested flows
- Audit logs reconstruct each outbound message end-to-end
- Operators can process a full inquiry from intake to approved reply in the console
- Deterministic fallback works when model output is invalid or unavailable
- Pilot queue depth and approval latency remain within agreed thresholds for the scoped traffic level

### Fail If
- Any path allows autonomous pricing or commitment-bearing messages
- Approval records are incomplete or bypassable
- Escalation reasons are opaque to operators
- Model features are required for core system safety
- Approval demand exceeds staffed capacity without a compensating scope reduction plan

## Recommended Next Artifact
Technical spec for the workflow engine, policy enforcement layer, approval-state machine, queue-threshold monitoring, and audit log schema, followed by a pilot operations plan that defines staffing assumptions, SLA targets, and rollout guardrails.
