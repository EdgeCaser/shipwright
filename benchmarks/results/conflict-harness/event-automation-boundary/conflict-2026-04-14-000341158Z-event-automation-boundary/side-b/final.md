# Revised artifact

# Phase 1 PRD: Event Automation Platform

## Decision Frame

### Product Decision
Build Phase 1 of an event management automation platform that centralizes WhatsApp-based event intake, gives staff an internal operating console, and automates only low-risk coordination tasks. The platform must enforce mandatory human approval for pricing commitments and use LLMs only behind deterministic policy gates that own final routing, approval, and send/no-send decisions.

### Target Users
- Event coordinators who manage incoming client requests, event details, timelines, and follow-ups.
- Sales or account managers who approve commercial commitments.
- Operations managers who need visibility into event status, unresolved client needs, and handoffs.
- Clients or prospects who initiate planning and follow-up through WhatsApp.

### Phase 1 Goal
Reduce manual coordination load for inbound event planning while preventing the system from autonomously making commitments about price, availability, contract terms, service guarantees, refunds, cancellations, or client-facing policy positions.

### Non-Goals
- No autonomous negotiation.
- No autonomous discounting, final quote issuance, or price guarantee.
- No LLM-generated pricing logic.
- No fully automated contract execution.
- No replacement of the event coordinator for ambiguous or high-stakes client decisions.
- No generalized workflow builder in Phase 1.

### Core User Problems
- WhatsApp requests are fragmented, hard to triage, and easy to lose across staff inboxes.
- Event requirements are often gathered in unstructured messages and must be retyped into planning tools.
- Clients expect fast responses, but staff cannot safely automate answers involving pricing, availability, or contractual commitments.
- Managers need a console that separates routine automation from human-required decisions.

### Phase 1 Product Scope

#### 1. WhatsApp Assistant
The WhatsApp assistant supports inbound and outbound client messaging for event intake, status updates, and structured follow-up.

Phase 1 capabilities:
- Receive WhatsApp messages from clients and prospects.
- Create or update a conversation record linked to a contact and event request.
- Collect approved intake details such as event date, location, attendee count, event type, food and beverage needs, equipment needs, contact details, and urgency.
- Confirm receipt using approved non-commercial templates.
- Send human-approved follow-up messages from the console.
- Escalate messages that include price, discount, contract, refund, cancellation, guarantee, legal, safety, custom package, or availability commitment language.

The assistant must not:
- Commit to pricing, discounts, availability, refunds, substitutions, deadlines, or contract terms.
- Invent package details or policy interpretations.
- Continue a conversation when classification is unknown, confidence falls below the configured threshold, validation fails, or any restricted-topic signal is present.

#### 2. Internal Console
The internal console is the operational control surface for event staff.

Phase 1 capabilities:
- Inbox view of WhatsApp conversations with event-linked context.
- Event request profile with structured fields extracted from messages.
- Human review queue for pricing, policy, availability, and contract-related messages.
- Approval workflow for outbound pricing-related replies.
- Conversation timeline with source messages, extracted fields, assistant actions, human edits, approvals, and sent messages.
- Filters by event status, assigned owner, escalation reason, pending approval, and last client response.
- Manual override for classification, extracted fields, and routing.
- Audit log for all system and human actions.

#### 3. Human Approval for Pricing Commitments
Pricing commitment approval is mandatory in Phase 1.

A pricing commitment includes:
- Final quote or invoice amount.
- Discount, promotion, waiver, or concession.
- Statement that a price is guaranteed or locked.
- Custom package price.
- Payment schedule, deposit amount, cancellation fee, refund policy, or minimum spend.
- Any message that could reasonably be interpreted as a commercial commitment.

Required behavior:
- The system may draft a pricing response only as an internal draft.
- The system must label the draft as unapproved and unsent.
- A human with pricing approval permission must approve before the message can be sent.
- The final sent message must preserve approver identity, timestamp, original draft, edited final text, and source conversation context.
- If no approved price exists in the deterministic pricing system, the assistant must escalate instead of estimating.
- Pricing approval cannot be bypassed by editing a draft, choosing a template, using a manual send path, or invoking an assistant-generated rewrite.

#### 4. Deterministic LLM Boundary
LLMs may be used only for bounded assistive tasks where deterministic controls decide whether the output may be used.

Allowed LLM uses:
- Summarizing conversation history for internal staff.
- Extracting candidate event details into structured fields, subject to validation and source-message traceability.
- Drafting internal response suggestions that require human review when they touch restricted topics.
- Rewriting approved human-authored text for tone only after deterministic semantic-preservation checks and, where required, human approval.
- Classifying message intent as a candidate signal, not as the final authority for restricted workflows.

Forbidden LLM uses:
- Pricing calculation.
- Discount approval.
- Availability confirmation.
- Contract term generation.
- Refund, cancellation, or policy adjudication.
- Payment commitment.
- Autonomous escalation resolution.
- Any irreversible external action without deterministic checks.

Deterministic controls:
- A rules engine owns final routing, permission checks, escalation state, approval requirements, and send/no-send decisions.
- Pricing values come only from approved structured sources, not generated text.
- Restricted-topic detection uses deterministic rules plus model-assisted signals, but the deterministic policy gate performs the final state transition.
- Signal arbitration is deterministic: if any source flags a restricted topic, missing required data, low confidence, semantic drift, policy uncertainty, or unknown intent, the message is routed to human review.
- If deterministic rules classify a message as safe but the LLM classifier flags it as restricted, the policy gate escalates to human review and records the LLM signal as the escalation reason.
- If the LLM classifier classifies a message as safe but deterministic rules flag it as restricted, the policy gate escalates to human review and records the rule match as the escalation reason.
- If both layers classify a message as safe, the pre-send policy gate still validates the outbound text against restricted-topic, pricing-source, role, template, and approval rules before delivery.
- The LLM cannot overrule deterministic escalation, downgrade a restricted state, approve a send, or resolve a policy conflict.
- Any failed validation, low confidence, missing required field, restricted-topic match, or classifier/rule conflict defaults to human review.

Tone rewrite boundary:
- Tone rewrites are allowed only for already-approved human-authored text.
- The system must preserve protected facts exactly, including price, dates, venue, package names, capacity, deadlines, payment terms, cancellation terms, refund terms, and approval language.
- The rewrite service must return a structured diff against the approved source text.
- The policy gate blocks the rewrite if protected facts are added, removed, or changed; if restricted-topic terms appear without an existing approved source; if numeric values change; or if the rewrite introduces new commitments.
- If semantic preservation cannot be deterministically verified, the rewrite becomes an internal draft requiring human approval before send.

### Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---:|---|
| FR-1 | WhatsApp intake | P0 | System receives WhatsApp messages and creates or updates a conversation record. |
| FR-2 | Event profile creation | P0 | Staff can create an event request from a conversation and attach structured fields. |
| FR-3 | Candidate field extraction | P0 | System proposes extracted fields with source-message references and lets staff accept, edit, or reject them. |
| FR-4 | Restricted-topic escalation | P0 | Messages containing pricing, contract, refund, cancellation, guarantee, discount, or availability commitment terms are routed to human review. |
| FR-5 | Pricing approval workflow | P0 | No pricing commitment can be sent unless approved by an authorized user. |
| FR-6 | Pre-send policy gate | P0 | Every outbound assistant, template, rewrite, or draft-assisted message passes deterministic checks before sending. |
| FR-7 | Internal console inbox | P0 | Staff can view, assign, filter, and respond to conversations from one console. |
| FR-8 | Audit trail | P0 | System records message source, assistant action, human edits, approval events, signal arbitration results, and sent output. |
| FR-9 | Internal summaries | P1 | Staff can view an LLM-generated conversation summary marked as internal and non-authoritative. |
| FR-10 | Template responses | P1 | Staff can use approved templates for receipt confirmation, missing-info follow-up, and handoff messages. |
| FR-11 | Permission roles | P1 | Admins can distinguish general staff from pricing approvers. |
| FR-12 | Manual override | P1 | Staff can override classifications and extracted fields with an audit entry, except they cannot bypass pricing approval or policy-gate blocks. |
| FR-13 | Signal arbitration | P0 | Rule and LLM classifier outputs are converted into a deterministic policy-gate decision where any restricted or uncertain signal escalates to human review. |
| FR-14 | Tone rewrite validation | P0 | Tone rewrites must pass deterministic protected-fact and restricted-commitment checks or become human-review drafts. |

### Non-Functional Requirements

| Category | Requirement |
|---|---|
| Reliability | Restricted-topic gating must fail closed into human review. |
| Traceability | Every extracted field, classifier signal, policy-gate result, rewrite diff, and approval must link back to source messages or human editors. |
| Latency | Non-restricted acknowledgement messages should be generated and queued within an operationally acceptable response window. |
| Security | Console access requires authenticated users and role-based permissions. |
| Compliance | Client-facing messages must be stored with approval metadata where applicable. |
| Observability | System must track automation rate, escalation rate, approval latency, policy-gate blocks, classifier/rule conflicts, rewrite blocks, and manual override rate. |
| Maintainability | Prompt changes, rule changes, templates, pricing-source changes, and policy-gate versions must be versioned. |

### UX Requirements

- The console must visually distinguish client messages, assistant drafts, human-authored messages, tone rewrites, and approved sent messages.
- Pricing-related drafts must show a clear approval-required state before send controls are enabled.
- Extracted fields must show confidence, source text, and last editor.
- Staff must be able to see why a message was escalated, including whether escalation came from a deterministic rule, an LLM signal, a conflict, or a validation failure.
- The WhatsApp client experience must remain concise and must not expose internal model confidence, routing labels, or policy checks.

### Data Requirements

Phase 1 entities:
- Contact
- Conversation
- Message
- Event Request
- Extracted Field Candidate
- Event Profile Field
- Draft Reply
- Approval Request
- Approval Decision
- User
- Role / Permission
- Audit Event
- Policy Gate Result
- Classifier Signal
- Rule Match
- Rewrite Diff

Required audit fields:
- Actor type: client, assistant, staff user, system rule.
- Actor ID where applicable.
- Timestamp.
- Action type.
- Input reference.
- Output reference.
- Approval status where applicable.
- Rule match or classifier signal where applicable.
- Policy-gate result and reason.
- Rewrite diff and validation result where applicable.

### Success Metrics

| Metric | Phase 1 Target Direction |
|---|---|
| Intake completion rate | Increase the share of conversations with complete event profiles. |
| Staff time per inbound inquiry | Reduce manual retyping and triage effort. |
| Pricing policy violations | Zero known unauthorized pricing commitments sent by the assistant. |
| Approval latency | Reduce time from pricing question detection to human-approved response. |
| Escalation precision | Keep false escalations manageable while preserving fail-closed behavior. |
| Manual override rate | Monitor as a signal of extraction/classification quality. |
| Classifier/rule conflict rate | Monitor as a signal for policy-rule and prompt improvements. |
| Rewrite block rate | Monitor as a signal that tone rewriting may be changing meaning or touching restricted content. |

### Launch Criteria

- WhatsApp messages can be received, stored, and linked to event profiles.
- Staff can manage conversations in the console.
- Restricted-topic escalation is implemented and tested with adversarial examples.
- Pricing approval workflow blocks unauthorized sends across assistant, template, rewrite, and manual-send paths.
- Signal arbitration is implemented so any restricted, uncertain, or conflicting signal deterministically escalates to human review.
- Tone rewrites are blocked or sent to human review when semantic preservation cannot be deterministically verified.
- LLM outputs are marked as candidate/internal unless explicitly approved and policy-gated for outbound use.
- Audit logs are available for message actions, approvals, signal arbitration, rewrite validation, and policy-gate decisions.
- Admin can configure at least basic roles for general staff and pricing approvers.

## Unknowns & Evidence Gaps

- Exact event segments are unspecified: weddings, corporate events, conferences, private parties, or a mixed portfolio may have different intake fields and pricing risks.
- WhatsApp integration constraints are unspecified, including provider, template approval process, opt-in handling, and regional requirements.
- Pricing system of record is unspecified, including whether approved prices live in a spreadsheet, CRM, ERP, rate card, or custom database.
- Approval authority model is unspecified: single approver, manager hierarchy, thresholds, or multi-step review.
- No baseline metrics are provided for current inquiry volume, response time, conversion rate, staff workload, or pricing error rate.
- No legal/compliance policy source is provided for refunds, cancellations, deposits, privacy, and message retention.
- LLM provider, data retention posture, and deployment constraints are unspecified.
- The deterministic semantic-preservation method for tone rewrites must be specified in the technical design before launch.
- The restricted-topic taxonomy and exact rule set must be derived from approved business, legal, pricing, and operations policies before launch.

## Pass/Fail Readiness

### Pass Conditions
- The assistant cannot send pricing commitments without authorized human approval.
- The system fails closed to human review for restricted topics, unknown classifications, missing pricing source data, signal conflicts, semantic-preservation failures, or policy-gate failures.
- Staff can complete the core workflow from WhatsApp inquiry to structured event profile to approved response in the console.
- Audit logs are sufficient to reconstruct who approved what, when, from which source conversation, and through which signal arbitration and policy-gate path.
- LLM usage is limited to assistive, reversible, validated tasks and cannot overrule deterministic routing, approval, or send/no-send decisions.

### Fail Conditions
- Any LLM path can calculate, infer, approve, or send a price commitment without deterministic authorization and human approval.
- Pricing approval can be bypassed by editing a draft, using a template, applying a tone rewrite, or sending directly from the assistant path.
- The console does not expose escalation reasons, signal conflicts, rewrite validation failures, or approval status clearly enough for staff to operate safely.
- Extracted fields can overwrite structured event data without human confirmation or source traceability.
- Restricted-topic detection relies only on model confidence without deterministic rules and fail-closed behavior.
- Tone rewriting can alter protected facts or introduce new commitments without being blocked or sent to human review.

### Phase 1 Readiness Verdict
Proceed to technical specification after confirming the pricing source of record, approval authority model, WhatsApp integration provider, restricted-topic taxonomy, and deterministic rewrite-validation method. The product shape is viable for Phase 1 only if the deterministic policy gate is treated as a launch-blocking system boundary across all outbound paths, including assistant drafts, templates, manual edits, and tone rewrites.

## Recommended Next Artifact

Create an engineering-ready technical specification covering:
- WhatsApp integration architecture.
- Event and conversation data model.
- Approval workflow state machine.
- Deterministic policy-gate rules.
- Rule and LLM signal arbitration protocol.
- LLM prompt and output-validation contract.
- Tone rewrite protected-fact validation and diffing contract.
- Audit-log schema.
- Role-based permission model.
- Test plan for restricted-topic, pricing-commitment, signal-conflict, rewrite-drift, and approval-bypass attempts.
