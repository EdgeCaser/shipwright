# Revised artifact

# Phase 1 PRD: Event Automation Platform

## Decision Frame

### Product decision
Build a Phase 1 event management automation platform that uses a WhatsApp assistant for requester and attendee interaction, an internal operations console for staff workflow, and application-level controls that prevent the LLM from making pricing commitments, policy exceptions, payments, or irreversible operational changes without human approval.

### Target users
- Event requesters: people coordinating venues, catering, invitations, schedules, or event logistics through WhatsApp.
- Internal operators: event operations staff who review requests, approve pricing, resolve exceptions, and manage fulfillment status.
- Managers or approvers: authorized staff who approve price commitments, discount exceptions, refunds, cancellation penalties, and scope changes.

### Phase 1 goal
Reduce manual intake and coordination work while preserving human accountability for commercial commitments and high-risk decisions.

### In scope
- WhatsApp assistant for event intake, clarification questions, status updates, and handoff notifications.
- Internal console for event request review, task status, quote draft review, approval workflow, conversation history, and audit log.
- Deterministic orchestration layer that owns workflow state, eligibility rules, approval requirements, pricing-rule execution, and all external side effects.
- LLM usage limited to natural-language understanding, summarization, draft generation, tone adaptation, and classification or extraction into predefined schemas.
- Enforcement architecture that keeps the LLM isolated from external APIs and requires all model outputs to be parsed, validated, and accepted by application code before affecting state or customer communication.
- Human approval required before any pricing commitment, discount, refund, venue deposit instruction, cancellation penalty, contract term, or bespoke commercial promise is sent to a customer.
- Audit logging for LLM inputs, generated drafts, validation results, human approvals, final outbound messages, and rule-engine outputs.

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
- As an internal operator, I want a full audit trail of assistant suggestions, human decisions, validation results, and customer-facing messages so disputes can be investigated.

### Enforcement architecture
Phase 1 must implement the LLM boundary as a system design requirement, not as prompt guidance alone.

The system must contain these components:
- WhatsApp channel adapter: receives and sends WhatsApp messages, but only through commands signed or authorized by the deterministic orchestrator.
- Deterministic orchestrator: owns event records, state transitions, required-field logic, approval gates, command creation, command validation, and side-effect execution.
- LLM worker: receives scoped conversation context and returns structured proposals only. It must not hold credentials for WhatsApp, pricing, payment, contract, CRM, calendar, or vendor APIs.
- Pricing service or pricing rules module: calculates price components using configured deterministic rules, versioned rate tables, or human-entered values. The LLM must not calculate or invent prices.
- Approval service: records required approvals, approver identity, approval timestamp, approved text, pricing-rule version, and final sent message.
- Audit log: stores source messages, model input references, model output, parser and validator outcome, state transition, command envelope, approval event, and external send result.

### LLM boundary requirements
- The LLM worker may return only one of the approved structured output types: `IntentClassification`, `FieldExtraction`, `EventBriefDraft`, `CustomerReplyDraft`, `RiskFlagSuggestion`, or `SummaryDraft`.
- The LLM worker must not return executable commands. Application code must convert accepted structured proposals into typed commands only after validation.
- The LLM worker must have no direct network route, credentials, SDK client, tool binding, or service account that can call WhatsApp send, pricing, payment, contract, cancellation, CRM update, or approval APIs.
- All model outputs must pass schema validation, enum validation, confidence threshold checks where applicable, and workflow-state compatibility checks before the orchestrator may use them.
- Any model output that fails validation, references a price not produced by the pricing service, attempts to make a commitment, or falls outside the current state must be rejected and routed to human review.
- Prompt instructions may describe the boundary, but enforcement must come from service permissions, command validation, state-machine checks, and approval gates.

### Typed command model
Only the deterministic orchestrator may create executable command envelopes. Phase 1 command envelopes must include `command_type`, `event_request_id`, `actor_type`, `source_reference`, `payload`, `requires_approval`, `approval_id`, `policy_checks`, `idempotency_key`, and `created_at`.

Allowed Phase 1 command types:
- `CreateEventRequest`
- `UpdateEventField`
- `CreateOperatorTask`
- `RequestHumanApproval`
- `SaveInternalSummary`
- `SendApprovedWhatsAppMessage`
- `MarkUnsupportedForHumanReview`

Commands with customer-facing commercial content must have `requires_approval: true` and a valid `approval_id` before execution. The WhatsApp channel adapter must reject outbound sends unless the command type is `SendApprovedWhatsAppMessage` and the approval and policy checks are valid.

Disallowed Phase 1 command behavior:
- A model-originated command directly sends a WhatsApp message.
- A model-originated value becomes a price, discount, refund, penalty, deposit instruction, or contract term.
- Any service accepts free-form model text as authorization for a commercial commitment.
- Any customer-facing commercial message is sent without a stored approval record.

### Functional requirements

#### WhatsApp assistant
- Accept inbound customer messages through WhatsApp.
- Identify whether the message is a new event request, follow-up, clarification answer, status request, cancellation request, complaint, or unsupported request using predefined categories.
- Ask deterministic intake questions when required fields are missing: event date, location, attendee count, event type, budget range, service needs, contact identity, and deadline.
- Generate draft customer replies using approved templates and conversation context.
- Send only messages that pass schema validation, policy checks, workflow-state checks, and approval requirements.
- Escalate to human review when the request includes pricing, discounts, refunds, penalties, contract terms, legal threats, safety concerns, VIP handling, ambiguous intent, or low-confidence classification.

#### Internal console
- Display all open event requests with status, owner, next action, risk flags, and SLA timer.
- Show structured event brief extracted from conversation history.
- Show source messages next to generated summaries and extracted fields.
- Show missing fields and recommended next question.
- Show draft quote components produced by deterministic pricing rules or explicitly entered by an authorized operator.
- Require explicit human approval before any customer-facing price, discount, refund, penalty, contract term, or binding commitment is sent.
- Let an operator edit outbound drafts before sending.
- Record approval actor, timestamp, approved text, underlying rule output, rule version, policy-check result, and final sent message.
- Provide search and filters by event date, requester, status, operator, and approval state.

#### Deterministic workflow and LLM boundaries
- Workflow state must be owned by application code through a finite state machine, not by the LLM.
- Pricing calculations must be performed by deterministic pricing services, versioned rule tables, or human entry by authorized users, not by the LLM.
- The LLM may draft a customer-facing explanation of an approved price but may not invent, alter, or commit to the price.
- The LLM may classify requests only into predefined categories, with confidence thresholds and fallback to human review.
- The LLM may summarize conversation history, but the console must retain source messages for verification.
- Any action with external side effects must be represented as a typed command created by application logic and validated before execution.
- The assistant must refuse or escalate when user intent falls outside known workflow states or required confidence thresholds.

### Phase 1 workflow
1. Customer messages the WhatsApp assistant.
2. WhatsApp channel adapter stores inbound message and passes it to the deterministic orchestrator.
3. Orchestrator creates or retrieves the event request record and determines the current workflow state.
4. Orchestrator sends scoped context to the LLM worker for classification, extraction, summary, or draft generation.
5. LLM worker returns a structured proposal, not an executable command.
6. Orchestrator validates schema, enums, confidence, current-state compatibility, and policy flags.
7. If intake data is missing and the response is low-risk, orchestrator creates a send command for the next approved intake question.
8. If pricing, discounts, refunds, penalties, contract terms, ambiguous intent, or policy-sensitive content is detected, orchestrator creates a human-review task.
9. Pricing service or authorized operator creates quote components.
10. Any price, discount, refund, penalty, or commitment is routed to a human approver.
11. Approval service records approver, approved text, price source, rule version, and approval timestamp.
12. Orchestrator creates `SendApprovedWhatsAppMessage` only after policy checks and approval checks pass.
13. WhatsApp channel adapter sends the approved message using the command idempotency key.
14. Audit log records source message, model proposal, validation result, command, approval, and send result.

### Non-functional requirements
- Reliability: WhatsApp message ingestion and outbound sending should be idempotent to avoid duplicate customer messages.
- Auditability: every automated draft, validation decision, approval decision, and final outbound message must be traceable.
- Latency: assistant replies for low-risk intake questions should be fast enough to feel conversational; human approval flows may follow operator SLA.
- Security: role-based access control for console users and approvers; service credentials must be limited to the components that need them.
- Privacy: redact or restrict sensitive customer data according to internal data policies before sending scoped context to the LLM worker where feasible.
- Observability: track message failures, classification confidence, validation failures, rejected model outputs, escalation rate, approval turnaround time, and sent-message error rate.

### Success metrics
- Intake completion rate for WhatsApp-originated event requests.
- Reduction in operator time spent converting raw conversation into structured event brief.
- Percentage of pricing or commitment messages with recorded approval before send.
- Escalation precision for risky commercial or policy-sensitive requests.
- Customer response time for low-risk intake steps.
- Zero known incidents where the assistant sends an unapproved pricing commitment.
- Zero successful outbound sends from any path other than `SendApprovedWhatsAppMessage` with valid approval when commercial content is present.

### Guardrail metrics
- Unapproved commercial commitment incidents.
- Incorrect price communicated to customer.
- Duplicate outbound WhatsApp messages.
- Unsupported request handled without escalation.
- Operator override rate on LLM-generated drafts.
- Rejected model-output rate by validation category.
- Customer complaint rate about confusing or incorrect assistant responses.

### Launch criteria
- All pricing commitments require approval in test and production paths.
- LLM worker has no credentials or direct API path to WhatsApp send, pricing, payment, contract, cancellation, CRM update, or approval APIs.
- All LLM outputs are parsed into approved schemas and rejected when schema, enum, confidence, state, or policy checks fail.
- The WhatsApp adapter rejects outbound commercial messages without an approved orchestrator command and valid approval record.
- Internal console shows source conversation and generated summary side by side.
- Approval audit log is complete for every customer-facing price or commercial exception.
- Manual fallback path exists for every workflow state.
- Pilot operators have completed scenario testing for normal intake, missing data, discount request, cancellation request, angry customer, ambiguous pricing question, malformed model output, attempted model-generated price, and attempted send without approval.

## Unknowns & Evidence Gaps

- Pricing model details are unspecified: fixed packages, custom quotes, tiered fees, vendor pass-through, discount limits, and tax/service-charge handling need definition before pricing automation can be fully specified.
- The operating model is unspecified: number of operators, approval hierarchy, SLA expectations, and escalation coverage hours need confirmation.
- WhatsApp compliance requirements need review, including template message rules, opt-in, and regional messaging constraints.
- Event domain scope is undefined: corporate events, weddings, private parties, venue bookings, catering-only, or mixed service models may require different intake fields and risk rules.
- Data retention, privacy, and access-control requirements need confirmation with legal/security stakeholders.
- Source systems are unknown: calendar, CRM, inventory, venue availability, vendor management, billing, and contract systems may change integration sequencing.
- The exact deployment model for isolating the LLM worker still needs technical design: separate service, restricted service account, egress policy, API gateway policy, or equivalent controls.
- No user research, operational baseline, or volume data was provided, so success metrics are framed as product metrics rather than committed targets.

## Pass/Fail Readiness

### Pass if
- Phase 1 can launch with the LLM limited to drafting, summarization, classification, and extraction into typed fields.
- Deterministic services own state transitions, pricing calculations, approval gates, command creation, command validation, and side-effect execution.
- The LLM worker has no credentials, direct API access, or tool binding that can execute WhatsApp sends, pricing changes, payments, contracts, cancellations, or CRM updates.
- Model outputs are rejected unless they match approved schemas and pass enum, confidence, policy, and current-state validation.
- Human approval is enforced before any customer-facing pricing commitment, discount, refund, penalty, contract term, or bespoke promise.
- Operators can inspect source messages before accepting generated summaries or drafts.
- Audit logs can reconstruct who approved what, when, based on which inputs, which validator outcomes occurred, and what was ultimately sent.

### Fail if
- The LLM can independently commit prices, discounts, refunds, penalties, or contract terms.
- Pricing values are generated by free-form model output instead of deterministic pricing logic or authorized human entry.
- Outbound WhatsApp sends can bypass policy checks, command validation, and approval gates.
- The LLM worker has credentials or direct API access to side-effecting systems.
- The console does not expose enough context for humans to verify generated summaries and drafts.
- Exceptions rely on prompt instructions alone rather than application-level controls.

## Recommended Next Artifact

Create a technical specification for the Phase 1 workflow boundary, including the state machine, service-permission model, typed command schema, model-output schemas, validation and rejection rules, approval-gate matrix, pricing-rule interface, audit-log schema, RBAC model, and test scenarios for unsafe LLM behavior.
