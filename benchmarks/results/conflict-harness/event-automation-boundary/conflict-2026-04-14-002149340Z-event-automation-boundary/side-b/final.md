# Revised artifact

# Phase 1 PRD: Event Automation Platform

## Metadata
- Status: Phase 1 prototype PRD
- Product surface: WhatsApp assistant, internal operations console, deterministic workflow and approval engine
- Evidence basis: Case packet requirements only; the packet specifies the required WhatsApp assistant, internal console, human approval for pricing commitments, and strict deterministic LLM boundaries [ctx-1]
- Primary decision: Build a constrained Phase 1 prototype that accelerates event intake and coordination while keeping pricing commitments and other commercial obligations behind explicit human approval [ctx-1]

## 1. Problem And Objective
Event teams need faster intake, follow-up, and coordination through WhatsApp without allowing an LLM to make commitments the business cannot honor. Phase 1 will automate low-risk event-management work, centralize human review in an internal console, and create auditable deterministic boundaries around any action that affects pricing, availability, contract terms, refunds, or vendor/customer commitments.

Phase 1 objective: reduce manual triage and response latency for event requests while achieving zero unauthorized pricing commitments.

## 2. Target Users
| User | Job To Be Done | Phase 1 Need |
|---|---|---|
| Event requester | Start or update an event request through WhatsApp | Get fast intake questions and status updates |
| Event operations agent | Manage inbound event requests and escalations | See structured context, suggested next steps, and approval queues |
| Pricing approver | Review commercial commitments before they reach customers | Approve, reject, or edit exact pricing language before send |
| Admin/operator | Configure policies and monitor risk | Maintain deterministic rules, templates, roles, and audit trails |

## 3. Goals And Success Metrics
| Goal | Metric | Phase 1 Target |
|---|---|---|
| Faster intake | Median time from first WhatsApp message to structured event record | Establish baseline in pilot; provisional target under 5 minutes |
| Safer automation | Unauthorized pricing commitments sent externally | 0 |
| Human-in-the-loop control | Pricing commitment messages with recorded approver, preview, and timestamp | 100% |
| Operational leverage | Non-pricing intake conversations resolved without manual retyping | Baseline in pilot |
| Traceability | Outbound commitment-bearing messages linked to policy decision and audit event | 100% |

Guardrails:
- No LLM output can directly write pricing, availability, contract, refund, or customer-commitment fields to a system of record.
- No outbound WhatsApp message containing price, discount, minimum spend, payment term, cancellation term, availability guarantee, or refund commitment can be sent without deterministic policy approval and, when required, human approval.
- If classification confidence, schema validation, or policy evaluation fails, the workflow escalates to the internal console.

## 4. Phase 1 Scope
### In Scope
- WhatsApp assistant for event intake, clarification questions, status updates, and handoff notices.
- Internal console with conversation timeline, extracted event details, task queue, approval queue, and outbound message preview.
- Deterministic workflow engine for state transitions such as new inquiry, missing details, ready for pricing review, approved, sent, escalated, and closed.
- Human approval workflow for all pricing commitments and commercial terms.
- Typed LLM adapter for extraction, classification, summarization, and draft response generation only.
- Policy gate that validates every proposed action before execution.
- Audit trail for message receipt, extraction, policy decision, approval, outbound send, and manual override.
- Role-based access for operations agent, pricing approver, and admin.
- Basic admin configuration for approved templates, escalation rules, and pricing-commitment keywords or action types.

### Out Of Scope
- Fully autonomous quoting or negotiation.
- LLM-generated discounts, package prices, or contract terms without deterministic calculation and approval.
- Payment collection, contract signing, invoice generation, or vendor marketplace workflows.
- Multi-channel support beyond WhatsApp and internal console.
- Automated vendor booking or customer availability guarantees.
- Advanced CRM, ERP, or calendar integrations unless required for the Phase 1 pilot.

## 5. Core User Stories And Acceptance Criteria
### WhatsApp Event Intake
As an event requester, I want to describe my event in WhatsApp so the team can capture the right details without a phone call.

Acceptance criteria:
- The assistant captures event type, date, time, location, guest count, budget if volunteered, contact details, and special requirements.
- Missing required fields trigger deterministic follow-up prompts from approved templates.
- Ambiguous or sensitive requests are escalated to an operations agent.
- The requester is told when a human is reviewing pricing or terms.

### Internal Console Review
As an operations agent, I want a structured view of each conversation so I can resolve exceptions quickly.

Acceptance criteria:
- The console shows raw WhatsApp messages, extracted fields, confidence, workflow state, next recommended action, and escalation reason.
- Agents can correct extracted fields before advancing workflow state.
- Agent edits are auditable and become the source of truth for downstream deterministic steps.

### Pricing Approval
As a pricing approver, I want to approve the exact customer-facing pricing message before it is sent.

Acceptance criteria:
- Any pricing commitment creates an approval task instead of sending automatically.
- The approver sees event context, deterministic pricing inputs, proposed message text, policy flags, and recipient.
- The approver can approve, reject, or edit the exact outbound message.
- The platform records approver identity, timestamp, approved terms, and sent message ID.

### Deterministic LLM Boundary
As an admin, I want LLM usage to be constrained so automation cannot create unauthorized commitments.

Acceptance criteria:
- LLM calls return typed JSON or draft text only; they cannot call send, pricing, contract, or database mutation APIs directly.
- All LLM outputs pass schema validation, allowlisted field mapping, confidence thresholds, and policy evaluation before use.
- Side effects are executed only by deterministic services after policy checks.
- The system logs prompt version, model response ID if available, extracted fields, validation result, and downstream action decision.

## 6. LLM Usage Policy
Permitted LLM tasks:
- Classify inbound messages by intent.
- Extract event details into a typed schema.
- Summarize conversation history for human review.
- Draft non-binding response text for human or policy-gated review.
- Identify missing information and propose clarification questions from approved templates.

Prohibited LLM tasks:
- Calculate final price, discount, minimum spend, or fees.
- Promise availability, staffing, vendor booking, refunds, cancellations, or contract terms.
- Send WhatsApp messages directly.
- Mutate source-of-truth records directly.
- Override policy gates, confidence thresholds, or human approval requirements.
- Generate unsupported claims about services, guarantees, or legal terms.

Boundary implementation requirements:
- Use a deterministic orchestrator as the only component allowed to execute state transitions and side effects.
- Use a policy gate before every external send and source-of-truth mutation.
- Require human approval for any action type tagged pricing_commitment, commercial_term, availability_guarantee, refund_commitment, contract_term, or policy_exception.
- Treat LLM output as untrusted input until parsed, validated, and accepted by deterministic code.

## 7. Functional Requirements
| Area | Requirement | Priority |
|---|---|---|
| WhatsApp intake | Receive inbound messages and link them to requester and event record | P0 |
| WhatsApp intake | Send approved template-based clarification and status messages | P0 |
| Console | Show queue filtered by state, SLA, risk flag, and owner | P0 |
| Console | Allow agents to edit extracted event fields with audit logging | P0 |
| Pricing approval | Block outbound pricing commitments until approved | P0 |
| Pricing approval | Present exact outbound preview before send | P0 |
| Policy engine | Classify proposed actions and required approvals deterministically | P0 |
| LLM adapter | Return structured extraction with confidence and validation result | P0 |
| Audit | Store message, extraction, decision, approval, and send events | P0 |
| Admin | Configure templates, role permissions, and escalation rules | P1 |
| Observability | Dashboard for failures, escalations, latency, and unauthorized-send attempts | P1 |

## 8. Non-Functional Requirements
- Security: Role-based access, least-privilege service credentials, encrypted storage for conversation and customer data.
- Privacy: Explicit retention policy for WhatsApp conversations and extracted personal data; redact sensitive fields in logs where feasible.
- Reliability: Failed LLM calls, schema failures, or WhatsApp API errors must not lose the event record; they must create retry or manual-review tasks.
- Latency: Non-pricing automated responses should be fast enough for conversational use; exact target to be calibrated in pilot.
- Auditability: Every external commitment must be reconstructable from source message, policy decision, human approval, and final sent content.
- Testability: Include unit tests for policy gate rules, contract tests for LLM schemas, and scenario tests for prohibited pricing-send paths.

## 9. Rollout Plan
1. Internal sandbox: test WhatsApp intake, extraction, console review, and policy gates with synthetic event conversations.
2. Controlled pilot: route a limited set of real inquiries through the console with all outbound messages human-reviewed.
3. Limited automation: enable automated non-binding clarification and status messages while keeping pricing and commercial terms approval-gated.
4. Phase 1 readiness review: evaluate unauthorized-commitment rate, approval coverage, extraction correction rate, and operator SLA before broader rollout.

## 10. Key Risks And Mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| LLM generates a pricing or availability promise | Customer trust and financial exposure | Treat draft text as untrusted; deterministic policy gate plus approval before send |
| Extracted event details are wrong | Bad pricing or poor service delivery | Confidence thresholds, console correction, audit trail, and explicit human review for pricing |
| Approval workflow slows response time | Lower customer responsiveness | Separate low-risk clarification automation from approval-gated commitments |
| Policy coverage misses a commitment type | Unauthorized send | Maintain action taxonomy, keyword checks, regression tests, and admin review of override logs |
| Operators bypass the console | Incomplete audit trail | Make WhatsApp outbound sends for managed conversations flow through the platform |

## Decision Frame
Recommendation: Proceed with a Phase 1 prototype as a constrained event operations automation platform, not an autonomous event agent.

Decision: Approve prototype build if the team accepts deterministic workflow, policy gates, and approval auditability as P0 scope. Missing baselines and policy details should be handled as pilot calibration inputs, not as blockers to prototyping.

Trade-off: This reduces the amount of automation available in Phase 1, but it protects the business from unauthorized pricing and commercial commitments.

Confidence: Medium. The case packet supplies clear stakeholder requirements for the core product boundaries; confidence is lower on metric targets, pricing thresholds, and integration detail because those require pilot discovery and stakeholder calibration [ctx-1].

Owner: Product lead with engineering and operations sign-off.

Revisit trigger: Any request to let the LLM calculate, approve, or send pricing terms; any pilot incident involving an unauthorized commitment; or approval SLA materially worse than current manual handling.

## Unknowns & Evidence Gaps
- Current event intake volume, response-time baseline, and manual handling cost are unknown.
- Pricing policy, discount authority, package catalog, and approval roles need to be specified before production rollout.
- WhatsApp Business API constraints, consent requirements, and template approval requirements are not supplied.
- Customer tolerance for automated intake versus immediate human handoff is unvalidated.
- Required integrations with CRM, calendar, inventory, vendor, or payment systems are unknown.
- Data retention, privacy, and jurisdiction-specific compliance requirements are unknown.
- Phase 1 pilot segment and success thresholds require stakeholder confirmation.

## Pass/Fail Readiness
Readiness: PASS for Phase 1 prototype approval; CONDITIONAL for broader production rollout.

Rationale: The case packet provides enough stakeholder-defined scope to build a Phase 1 prototype around WhatsApp intake, an internal console, pricing approval, and deterministic LLM boundaries [ctx-1]. The unresolved evidence gaps affect calibration, target-setting, and rollout policy rather than the basic prototype decision. Production expansion should wait until the pilot validates baselines, pricing policy, operational SLAs, and compliance constraints.

## Recommended Next Artifact
Recommended next artifact: Technical specification focused on the workflow state machine, policy gate, approval model, LLM adapter contract, audit schema, and WhatsApp integration boundaries. Pair it with a short pilot calibration plan for operations and pricing stakeholders to define baselines, approval roles, policy thresholds, and launch criteria.
