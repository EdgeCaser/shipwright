# Phase 1 PRD: Event Automation Platform

## Metadata
- Status: Draft for Phase 1 validation
- Product surface: WhatsApp assistant, internal operations console, deterministic workflow and approval engine
- Evidence basis: Case packet only; no customer interviews, usage data, pricing policy, or technical constraints were supplied [ctx-1]
- Primary decision: Build a constrained automation layer that accelerates event intake and coordination while keeping pricing commitments and other commercial obligations behind explicit human approval [ctx-1]

## 1. Problem And Objective
Event teams need faster intake, follow-up, and coordination across WhatsApp without allowing an LLM to make commitments the business cannot honor. Phase 1 should automate low-risk event-management work, centralize human review in an internal console, and create auditable deterministic boundaries around any action that affects pricing, availability, contract terms, refunds, or vendor/customer commitments.

Phase 1 objective: reduce manual triage and response latency for event requests while achieving zero unauthorized pricing commitments.

## 2. Target Users
| User | Job To Be Done | Phase 1 Need |
|---|---|---|
| Event requester | Start or update an event request through WhatsApp | Get fast, clear intake questions and status updates |
| Event operations agent | Manage inbound event requests and escalations | See structured context, suggested next steps, and approval queues |
| Pricing approver | Review commercial commitments before they reach customers | Approve, reject, or edit exact pricing language before send |
| Admin/operator | Configure policies and monitor risk | Maintain deterministic rules, templates, roles, and audit trails |

## 3. Goals And Success Metrics
| Goal | Metric | Baseline | Phase 1 Target |
|---|---|---|---|
| Faster intake | Median time from first WhatsApp message to structured event record | TBD | TBD after baseline; provisional target under 5 minutes |
| Safer automation | Unauthorized pricing commitments sent externally | 0 expected | 0 |
| Human-in-the-loop control | Percent of pricing commitment messages with recorded approver, preview, and timestamp | TBD | 100% |
| Operational leverage | Percent of non-pricing intake conversations resolved without manual retyping | TBD | TBD after pilot |
| Traceability | Percent of outbound commitment-bearing messages linked to policy decision and audit event | TBD | 100% |

Guardrails:
- No LLM output can directly write pricing, availability, contract, refund, or customer-commitment fields to a system of record.
- No outbound WhatsApp message containing price, discount, minimum spend, payment term, cancellation term, availability guarantee, or refund commitment can be sent without deterministic policy approval and, when required, human approval.
- If classification confidence, schema validation, or policy evaluation fails, the workflow escalates to the internal console.

## 4. Phase 1 Scope
### In Scope
- WhatsApp assistant for event intake, clarification questions, status updates, and handoff notices.
- Internal console with conversation timeline, extracted event details, task queue, approval queue, and outbound message preview.
- Deterministic workflow engine for state transitions such as new inquiry, missing details, ready for pricing review, approved, sent, escalated, closed.
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
- Latency: Non-pricing automated responses should be fast enough for conversational use; exact target TBD after channel and infrastructure decisions.
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
Recommendation: Build Phase 1 as a constrained event operations automation platform, not an autonomous event agent.

Decision: Proceed to prototype only if the team accepts that deterministic workflow, policy gates, and approval auditability are P0 scope rather than compliance polish.

Trade-off: This will reduce the amount of automation available in Phase 1, but it directly protects the business from unauthorized pricing and commercial commitments.

Confidence: Medium on product structure because the case packet clearly specifies WhatsApp assistant, internal console, human pricing approval, and deterministic LLM boundaries; low on metric targets and prioritization because no customer, operational, or technical evidence was supplied [ctx-1].

Owner: Product lead with engineering and operations sign-off.

Revisit trigger: Any request to let the LLM calculate, approve, or send pricing terms; any pilot incident involving an unauthorized commitment; or approval SLA materially worse than current manual handling.

## Unknowns & Evidence Gaps
- Current event intake volume, response-time baseline, and manual handling cost are unknown.
- Pricing policy, discount authority, package catalog, and approval roles are undefined.
- WhatsApp Business API constraints, consent requirements, and template approval requirements are not supplied.
- Customer tolerance for automated intake versus immediate human handoff is unvalidated.
- Required integrations with CRM, calendar, inventory, vendor, or payment systems are unknown.
- Data retention, privacy, and jurisdiction-specific compliance requirements are unknown.
- Phase 1 pilot segment and success thresholds require stakeholder confirmation.

## Pass/Fail Readiness
Readiness: FAIL for build approval; PASS for prototype scoping.

Rationale: The PRD has explicit scope boundaries, a deterministic LLM boundary model, and safety-critical acceptance criteria, but it lacks the evidence bar needed for a full build decision: no customer evidence, operational baselines, pricing policy inputs, or integration constraints were provided. The next step should validate the workflow and evidence gaps before committing full Phase 1 engineering capacity.

## Recommended Next Artifact
Recommended next artifact: Technical specification focused on the workflow state machine, policy gate, approval model, LLM adapter contract, audit schema, and WhatsApp integration boundaries. This should be paired with a short discovery plan for operations and pricing stakeholders to fill the missing baselines and approval-policy details.
