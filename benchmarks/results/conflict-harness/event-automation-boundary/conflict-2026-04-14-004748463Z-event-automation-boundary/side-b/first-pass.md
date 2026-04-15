# Phase 1 PRD: Event Automation Platform

## Summary
Phase 1 will deliver an event management automation platform that lets customers interact through a WhatsApp assistant while internal operators manage event intake, quotes, approvals, and customer follow-up through a console. The product will use LLMs only for bounded language tasks such as intent classification, draft generation, and customer-friendly phrasing. Pricing commitments, vendor commitments, contract terms, refunds, and schedule guarantees must remain deterministic and require human approval before being sent externally.

## Problem
Event teams spend significant manual time collecting requirements, answering repetitive customer questions, preparing quotes, and coordinating internal approvals. A WhatsApp assistant can reduce intake and follow-up friction, but the business risk is high if an LLM independently promises prices, discounts, availability, or operational commitments. Phase 1 must therefore automate low-risk workflow steps while preserving deterministic controls for commercial and operational commitments.

## Target Users
- Event customers who prefer WhatsApp for intake, clarification, and status updates.
- Internal event coordinators who triage requests, edit proposals, and approve customer-facing commitments.
- Managers who approve pricing exceptions, discounts, and policy-sensitive commitments.

## Goals
- Capture structured event intake from WhatsApp conversations.
- Reduce manual coordinator effort for common Q&A, intake completion, and draft responses.
- Provide an internal console for reviewing conversations, structured event data, quote drafts, approval status, and audit history.
- Enforce human approval before sending any pricing commitment or operational guarantee.
- Keep LLM usage deterministic at system boundaries through schemas, policy gates, audit logs, and allowlisted actions.

## Non-Goals
- Fully autonomous event booking.
- Autonomous price negotiation or discount approval.
- Autonomous vendor contracting, venue reservation, refund approval, or legal term generation.
- Multi-channel support beyond WhatsApp in Phase 1.
- A general-purpose agent that can call arbitrary tools or mutate business records without explicit workflow gates.

## Scope
Phase 1 includes WhatsApp intake, internal console workflows, quote draft preparation, approval routing, and controlled outbound messaging. The platform should support a narrow set of event request types agreed before build, such as corporate dinners, private parties, and small conferences, if those event types share the same data model and approval policy.

## Core User Stories
1. As a customer, I can message the WhatsApp assistant to describe my event and answer follow-up questions.
2. As a customer, I can receive non-binding status updates and clarification questions through WhatsApp.
3. As a coordinator, I can see each conversation, extracted event requirements, missing fields, risk flags, and draft replies in an internal console.
4. As a coordinator, I can edit and approve a quote or customer reply before it is sent.
5. As a manager, I can approve or reject pricing commitments, discounts, or exceptions before the customer sees them.
6. As an operator, I can see an audit trail showing who approved a message, what data was used, and whether an LLM contributed draft text or classification.

## Functional Requirements
| Area | Requirement | Phase 1 Acceptance Criteria |
|---|---|---|
| WhatsApp intake | Support inbound and outbound WhatsApp messages for event intake | Customer messages create or update a conversation record and are visible in the console |
| Structured extraction | Extract event date, location, attendee count, event type, budget range, catering needs, and special constraints | Extracted fields are marked as machine-suggested until confirmed or edited by an internal user |
| Clarifying questions | Ask follow-up questions for missing required fields | Assistant can ask allowlisted intake questions without human approval when no pricing or commitment language is included |
| Internal console | Provide queue, conversation detail, structured event record, draft reply, approval state, and audit log | Coordinator can review, edit, approve, and send replies from one workflow |
| Quote drafting | Generate internal quote drafts from deterministic pricing inputs and policy rules | Drafts are never sent externally without human approval |
| Pricing approval | Require manager approval for final price, discount, minimum spend, refund, or exception language | System blocks outbound commitment messages until approval is recorded |
| Deterministic boundary | Separate LLM outputs from authoritative business decisions | LLM outputs cannot directly write approved price, confirmed availability, final contract terms, or booking status |
| Auditability | Record inputs, generated drafts, policy checks, approver, timestamp, and sent message | Each externally sent commitment has a traceable approval record |
| Fallback | Escalate uncertain or policy-sensitive conversations to humans | Low-confidence intent, complaint, legal language, safety issue, or pricing negotiation routes to console review |

## LLM Boundary Policy
LLMs may be used for:
- Intent classification into an allowlisted taxonomy.
- Extracting candidate event fields into a schema.
- Drafting internal-only response suggestions.
- Rewriting approved factual content into a friendlier tone, provided the underlying facts are locked.
- Summarizing conversation history for internal users.

LLMs must not be used to autonomously:
- Commit to a price, discount, refund, date, venue, vendor, capacity, service level, or contract term.
- Change authoritative records such as approved quote, booking status, invoice amount, cancellation status, or payment status.
- Call arbitrary external tools.
- Invent policy, availability, or pricing inputs not present in deterministic systems.
- Send customer-facing pricing or commitment language without workflow approval.

Boundary enforcement requirements:
- All LLM outputs must be treated as untrusted suggestions.
- All structured outputs must validate against strict schemas and allowed enum values.
- Any field affecting price, availability, legal terms, or customer commitment must require deterministic source data plus human approval.
- Outbound messages must pass a policy classifier or rules engine that detects commitment language and blocks unapproved sends.
- The system must preserve an audit trail for every generated draft and approved outbound message.

## Internal Console Requirements
The console must include:
- Conversation inbox with status filters: new, needs info, needs quote, pending approval, approved, sent, escalated.
- Conversation transcript with WhatsApp message history.
- Extracted event profile with confidence indicators and edit controls.
- Draft response panel with source labels: human-authored, LLM-drafted, template-generated, or system-generated.
- Quote panel showing deterministic pricing inputs and approval state.
- Approval controls with required reason for approval, rejection, or override.
- Audit log with timestamps, actor, action, changed fields, and sent message content.

## Deterministic Pricing and Approval Workflow
1. Customer provides event details through WhatsApp.
2. System extracts candidate fields and identifies missing required inputs.
3. Coordinator confirms or edits event fields.
4. Pricing service or pricing table calculates candidate quote using deterministic rules.
5. LLM may draft an internal explanation of the quote but may not alter the numbers.
6. Coordinator reviews the quote and message.
7. Manager approval is required if the message contains price, discount, exception, refund, or binding availability language.
8. Approved message is sent through WhatsApp.
9. Audit log records quote version, approver, approval timestamp, and outbound text.

## Data Model: Phase 1 Entities
| Entity | Key Fields |
|---|---|
| Customer | name, phone number, consent status, conversation IDs |
| Event Request | event type, date, time, location, attendee count, budget range, requirements, status |
| Conversation | WhatsApp thread ID, messages, assigned coordinator, current workflow state |
| Extracted Field | field name, suggested value, confidence, source message, confirmed value, confirmer |
| Quote Draft | pricing inputs, deterministic price output, discount flag, exception flag, status |
| Approval | approver, approval type, decision, reason, timestamp, linked outbound message |
| Audit Event | actor, action, before value, after value, timestamp, source |

## Metrics
- Intake completion rate.
- Median time from first WhatsApp message to complete event profile.
- Coordinator minutes per qualified event request.
- Percentage of outbound commitment messages with approval record.
- Number of blocked unapproved commitment attempts.
- LLM extraction correction rate by field.
- Escalation rate for low-confidence or policy-sensitive conversations.
- Customer response time for clarification loops.

## Risks and Mitigations
| Risk | Mitigation |
|---|---|
| LLM sends or implies unauthorized price | Approval gate and outbound commitment blocker before WhatsApp send |
| LLM fabricates availability or policy | Only deterministic systems can source availability and policy-sensitive values |
| Operators over-trust generated drafts | Label generated content and require explicit approval for commitments |
| Poor extraction quality creates bad quotes | Human confirmation of pricing-relevant fields before quote generation |
| Audit gaps weaken accountability | Immutable audit log for generated drafts, edits, approvals, and sent messages |
| Scope creep toward autonomous agent behavior | Allowlisted workflows and tool permissions only |

## Launch Criteria
- WhatsApp integration supports end-to-end intake and approved outbound messages.
- Console supports review, edit, approval, send, and audit workflows.
- Pricing commitments cannot be sent without approval in test cases.
- LLM outputs validate against schemas and cannot directly mutate authoritative pricing or booking fields.
- At least one deterministic pricing path is implemented for the selected Phase 1 event type set.
- Audit trail is available for every approved outbound commitment.
- Escalation rules trigger for low-confidence extraction, negotiation, complaints, and policy-sensitive content.

## Decision Frame
The core Phase 1 decision is whether to automate the event intake and draft-response workflow while explicitly excluding autonomous commercial commitment. The recommended decision is to proceed with a constrained Phase 1 because the platform can deliver operational leverage without accepting the highest-risk failure mode: an LLM making binding pricing or availability promises. The key product boundary is that WhatsApp may feel conversational to the customer, but the system of record, pricing, approval, and outbound commitment gates remain deterministic and human-controlled.

## Unknowns & Evidence Gaps
- The packet does not provide target event segments, volume, coordinator workload, or current conversion baseline.
- Pricing complexity is unknown; Phase 1 should start only with event categories that can be priced through deterministic rules or reviewed quote templates.
- WhatsApp compliance, consent, and message template requirements need legal and implementation review.
- Approval roles and thresholds are unspecified; the team must define which commitments require coordinator approval versus manager approval.
- Existing systems for CRM, inventory, venue availability, payments, and contracts are unknown.
- No customer research evidence is provided showing WhatsApp as the preferred channel, so Phase 1 should validate channel fit during pilot.

## Pass/Fail Readiness
Pass if Phase 1 demonstrates that customers can complete event intake through WhatsApp, coordinators can process requests faster in the console, and every pricing or commitment-bearing outbound message has deterministic source data plus recorded human approval. Fail if the system cannot reliably distinguish low-risk intake from commitment language, if pricing-relevant fields bypass human confirmation, or if operators need to leave the console for core review and approval tasks.

## Recommended Next Artifact
Create a technical specification focused on the LLM boundary architecture, approval-state machine, outbound message policy gate, deterministic pricing interface, audit log schema, and WhatsApp integration flow. That technical spec should include sequence diagrams for intake, quote approval, blocked send, and escalation paths.
