# Phase 1 PRD: Event Automation Platform

## Decision Frame

### Product decision
Build a Phase 1 event management automation platform that uses a WhatsApp assistant for requester and attendee interaction, an internal operations console for staff workflow, and deterministic system boundaries that prevent the LLM from making pricing commitments, policy exceptions, payments, or irreversible operational changes without human approval.

### Target users
- Event requesters: people coordinating venues, catering, invitations, schedules, or event logistics through WhatsApp.
- Internal operators: event operations staff who review requests, approve pricing, resolve exceptions, and manage fulfillment status.
- Managers or approvers: authorized staff who approve price commitments, discount exceptions, refunds, and scope changes.

### Phase 1 goal
Reduce manual intake and coordination work while preserving human accountability for commercial commitments and high-risk decisions.

### In scope
- WhatsApp assistant for event intake, clarification questions, status updates, and handoff notifications.
- Internal console for event request review, task status, quote draft review, approval workflow, conversation history, and audit log.
- Deterministic orchestration layer that owns workflow state, eligibility rules, approval requirements, pricing-rule execution, and external system calls.
- LLM usage limited to natural-language understanding, summarization, draft generation, message tone adaptation, and classification into predefined enums.
- Human approval required before any pricing commitment, discount, refund, venue deposit instruction, cancellation penalty, contract term, or bespoke commercial promise is sent to a customer.
- Audit logging for LLM inputs, generated drafts, human approvals, final outbound messages, and rule-engine outputs.

### Out of scope for Phase 1
- Fully autonomous quote commitment.
- Fully autonomous negotiation.
- Contract execution or legally binding e-signature flows.
- Payment collection and refund processing.
- Vendor marketplace procurement.
- Multi-channel support beyond WhatsApp and the internal console.
- Custom event design generation beyond operational draft assistance.

### Core user stories
- As an event requester, I want to describe my event in WhatsApp so I do not need to fill out a long form before getting help.
- As an event requester, I want timely clarification questions so the organizer can understand date, location, headcount, budget, dietary needs, equipment, and schedule constraints.
- As an internal operator, I want a structured event brief generated from the WhatsApp conversation so I can review requirements quickly.
- As an internal operator, I want the system to flag missing information and policy-sensitive requests so I know what to resolve before a quote is prepared.
- As an approver, I want pricing drafts and commercial exceptions routed to me before the customer sees them so commitments remain controlled.
- As an internal operator, I want a full audit trail of assistant suggestions, human decisions, and customer-facing messages so disputes can be investigated.

### Functional requirements

#### WhatsApp assistant
- Accept inbound customer messages through WhatsApp.
- Identify whether the message is a new event request, follow-up, clarification answer, status request, cancellation request, complaint, or unsupported request.
- Ask deterministic intake questions when required fields are missing: event date, location, attendee count, event type, budget range, service needs, contact identity, and deadline.
- Generate draft customer replies using approved templates and conversation context.
- Send only messages that pass policy checks and approval requirements.
- Escalate to human review when the request includes pricing, discounts, refunds, penalties, contract terms, legal threats, safety concerns, VIP handling, or ambiguous intent.

#### Internal console
- Display all open event requests with status, owner, next action, risk flags, and SLA timer.
- Show structured event brief extracted from conversation history.
- Show missing fields and recommended next question.
- Show draft quote components produced by deterministic pricing rules, if configured.
- Require explicit human approval before any customer-facing price, discount, refund, or binding commitment is sent.
- Let an operator edit outbound drafts before sending.
- Record approval actor, timestamp, approved text, underlying rule output, and final sent message.
- Provide search and filters by event date, requester, status, operator, and approval state.

#### Deterministic workflow and LLM boundaries
- Workflow state must be owned by application code, not by the LLM.
- Pricing calculations must be performed by deterministic pricing services or rule tables, not by the LLM.
- The LLM may draft a customer-facing explanation of an approved price but may not invent, alter, or commit to the price.
- The LLM may classify requests only into predefined categories, with confidence thresholds and fallback to human review.
- The LLM may summarize conversation history, but the console must retain source messages for verification.
- Any action with external side effects must be represented as a typed command produced by application logic and validated before execution.
- The assistant must refuse or escalate when user intent falls outside known workflow states or required confidence thresholds.

### Phase 1 workflow
1. Customer messages the WhatsApp assistant.
2. System creates or retrieves event request record.
3. LLM classifies intent into predefined workflow categories.
4. Deterministic orchestrator checks current state and missing fields.
5. Assistant asks the next approved intake question or routes to human review.
6. Once required intake data is complete, the console generates an internal event brief.
7. Pricing service or operator drafts quote components.
8. Any price, discount, refund, penalty, or commitment is routed to a human approver.
9. Approved response is sent through WhatsApp.
10. System logs classification, summary, draft, approval, and sent message.

### Non-functional requirements
- Reliability: WhatsApp message ingestion and outbound sending should be idempotent to avoid duplicate customer messages.
- Auditability: every automated draft, approval decision, and final outbound message must be traceable.
- Latency: assistant replies for low-risk intake questions should be fast enough to feel conversational; human approval flows may follow operator SLA.
- Security: role-based access control for console users and approvers.
- Privacy: redact or restrict sensitive customer data according to internal data policies.
- Observability: track message failures, classification confidence, escalation rate, approval turnaround time, and sent-message error rate.

### Success metrics
- Intake completion rate for WhatsApp-originated event requests.
- Reduction in operator time spent converting raw conversation into structured event brief.
- Percentage of pricing or commitment messages with recorded approval before send.
- Escalation precision for risky commercial or policy-sensitive requests.
- Customer response time for low-risk intake steps.
- Zero known incidents where the assistant sends an unapproved pricing commitment.

### Guardrail metrics
- Unapproved commercial commitment incidents.
- Incorrect price communicated to customer.
- Duplicate outbound WhatsApp messages.
- Unsupported request handled without escalation.
- Operator override rate on LLM-generated drafts.
- Customer complaint rate about confusing or incorrect assistant responses.

### Launch criteria
- All pricing commitments require approval in test and production paths.
- LLM cannot directly call pricing, payment, contract, cancellation, or outbound-send APIs without deterministic validation.
- Internal console shows source conversation and generated summary side by side.
- Approval audit log is complete for every customer-facing price or commercial exception.
- Manual fallback path exists for every workflow state.
- Pilot operators have completed scenario testing for normal intake, missing data, discount request, cancellation request, angry customer, and ambiguous pricing question.

## Unknowns & Evidence Gaps

- Pricing model details are unspecified: fixed packages, custom quotes, tiered fees, vendor pass-through, discount limits, and tax/service-charge handling need definition before pricing automation can be fully specified.
- The operating model is unspecified: number of operators, approval hierarchy, SLA expectations, and escalation coverage hours need confirmation.
- WhatsApp compliance requirements need review, including template message rules, opt-in, and regional messaging constraints.
- Event domain scope is undefined: corporate events, weddings, private parties, venue bookings, catering-only, or mixed service models may require different intake fields and risk rules.
- Data retention, privacy, and access-control requirements need confirmation with legal/security stakeholders.
- Source systems are unknown: calendar, CRM, inventory, venue availability, vendor management, billing, and contract systems may change integration sequencing.
- No user research, operational baseline, or volume data was provided, so success metrics are framed as product metrics rather than committed targets.

## Pass/Fail Readiness

### Pass if
- Phase 1 can launch with the LLM limited to drafting, summarization, classification, and extraction into typed fields.
- Deterministic services own state transitions, pricing calculations, approval gates, and side-effect execution.
- Human approval is enforced before any customer-facing pricing commitment, discount, refund, penalty, contract term, or bespoke promise.
- Operators can inspect source messages before accepting generated summaries or drafts.
- Audit logs can reconstruct who approved what, when, based on which inputs, and what was ultimately sent.

### Fail if
- The LLM can independently commit prices, discounts, refunds, penalties, or contract terms.
- Pricing values are generated by free-form model output instead of deterministic pricing logic or human entry.
- Outbound WhatsApp sends can bypass policy checks and approval gates.
- The console does not expose enough context for humans to verify generated summaries and drafts.
- Exceptions rely on prompt instructions alone rather than application-level controls.

## Recommended Next Artifact

Create a technical specification for the Phase 1 workflow boundary, including state machine, typed tool/command schema, approval-gate matrix, pricing-rule interface, audit-log schema, RBAC model, and test scenarios for unsafe LLM behavior.
