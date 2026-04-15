# Revised artifact

# Phase 1 PRD: Event Automation Platform

## Product Summary
Build a Phase 1 event management automation platform that improves intake speed and operator consistency for inbound event inquiries. The product centers on a WhatsApp-facing assistant experience, an operator workspace for structured intake review, mandatory human approval for any pricing commitment, and deterministic controls that prevent LLM outputs from directly triggering customer-facing commitments or workflow mutations.

## Problem
Event teams lose time when inbound demand arrives in unstructured chat, staff manually restate requirements across tools, and pricing or exception handling depends on a small group of experienced operators. The system must reduce repetitive intake work without allowing autonomous commitments on price, package terms, holds, or policy exceptions.

## Goal
Reduce time-to-first-qualified-response and manual re-entry for routine inquiries while preserving explicit human control over pricing commitments and other policy-sensitive outbound communication.

## Non-Goals
- No autonomous price quotes sent to customers.
- No autonomous contract generation or signature workflow.
- No payment collection.
- No omnichannel support beyond WhatsApp in Phase 1.
- No fully agentic action execution outside approved deterministic workflows.

## Primary Users
- Event requester using WhatsApp.
- Internal operator reviewing intake, drafting responses, and escalating exceptions.
- Manager or approver reviewing pricing commitments.

## Jobs To Be Done
- As an event requester, I want to describe my event naturally over WhatsApp and get a fast, useful next step.
- As an operator, I want structured intake extracted from chat so I can review exceptions instead of retyping basics.
- As a manager, I want pricing commitments gated behind approval so margin and policy controls are preserved.

## Phase 1 Scope
### Required for Phase 1
- WhatsApp intake channel for inbound inquiries and outbound approved responses.
- Operator workflow that exposes conversation history, extracted intake fields, and draft responses for human review.
- Explicit approval control before any outbound message containing price, discount, minimum spend, package commitment, hold/reservation confirmation, or policy exception.
- Deterministic workflow enforcement and audit logging for all approval-required actions.
- LLM-assisted extraction, classification, summarization, and drafting only within validated schemas and draft states.

### Deferrable Within Phase 1 Implementation
- A fully separate managerial approval queue UI, if equivalent approval actions can be completed inside the operator workflow without weakening controls.
- Advanced analytics dashboards beyond guardrail reporting.
- Deep downstream integrations beyond read-only data needed for review.

### Out of Scope
- Dynamic pricing optimization.
- Auto-negotiation.
- Fully automated exception handling.
- Direct write access into downstream ERP/accounting systems.

## Core User Flow
1. Customer sends an inquiry in WhatsApp.
2. System captures the message and creates or links a lead/event thread.
3. Deterministic preprocessing runs.
4. LLM may extract structured fields, classify inquiry type, summarize context, and draft missing follow-up questions.
5. Workflow rules validate required fields and either send approved deterministic follow-up questions or route the thread for operator review.
6. Operator reviews the conversation, corrects extracted fields, and prepares a response.
7. If the response contains pricing or another approval-triggering commitment, the system blocks send until an authorized human explicitly approves it.
8. The approved outbound message is sent through WhatsApp with timestamped attribution and an audit log of draft, edits, approval, and final content.

## Functional Requirements
### WhatsApp Assistant
- Receive inbound messages and attach them to a customer/event thread.
- Answer a limited set of approved FAQs from curated knowledge.
- Ask deterministic follow-up questions when required fields are missing.
- Provide status updates based on workflow state.
- Escalate to human review when confidence, policy, or scope thresholds are exceeded.

### Operator Workflow
- Show inbox, conversation thread, extracted event details, workflow status, and approval state.
- Allow operators to correct extracted fields.
- Draft customer responses from templates or reviewed model suggestions.
- Surface approval-required content clearly before send.
- Record who approved, edited, rejected, or escalated each action.

### Approval Controls
- Any message containing price, package commitment, discount, minimum spend, hold/reservation confirmation, or policy exception requires human approval before send.
- Approval action must be explicit and attributable to a named internal user.
- Rejected drafts must return to editable state with reason capture.
- The approval control may be implemented as a queue or as an in-thread approval state, provided the gate is explicit, auditable, and role-restricted.

### Deterministic Boundary Layer
- All external actions must be triggered by deterministic business rules, not free-form model decisions.
- LLM outputs must be treated as suggestions, never executable instructions.
- Allowed LLM tasks: extraction, summarization, classification into fixed schema, draft copy generation, and confidence scoring.
- Disallowed LLM tasks: direct message sending, final pricing calculation, policy override, workflow state mutation without rule validation, and hidden tool invocation.

## LLM Boundary Specification
### Allowed Inputs
- Current conversation excerpt.
- Approved knowledge snippets.
- Fixed extraction schema.
- Fixed response template options.

### Allowed Outputs
- JSON extraction against predefined schema.
- Classification labels from enumerated values.
- Draft text in marked draft state.
- Confidence and missing-field signals.

### Enforcement Requirements
- Schema validation on every LLM output.
- Fallback to human review on invalid JSON, low confidence, or policy-triggering terms.
- Prompt/version logging for every model-assisted step.
- No model memory outside persisted application records.
- No hidden reasoning storage or display requirement.

## Pricing Commitment Policy
Pricing commitments include any numeric or package-specific offer that a reasonable customer could interpret as a quote, estimate, discount, minimum spend, or approval. In Phase 1:
- Pricing calculation must come from deterministic business logic or human entry.
- LLM may rewrite approved pricing into customer-friendly language only after the price is fixed.
- Outbound send remains blocked until human approval is completed.

## Data Model
Key entities:
- Lead
- Event Request
- Conversation Thread
- Message
- Extracted Intake Record
- Pricing Draft
- Approval Record
- Workflow State Change
- Audit Log Entry

## Success Metrics
- Median time to first qualified response.
- Percent of inquiries with structured intake completed without manual re-entry.
- Operator touches per qualified inquiry.
- Approval turnaround time for pricing-related messages.
- Escalation rate from automated path to human path.
- Zero unapproved pricing commitments sent.

## Guardrails
- Zero unapproved pricing commitments sent.
- Zero workflow actions executed directly from unvalidated LLM output.
- Full audit coverage for approval-required actions.

## Risks
- Over-broad pricing detection may slow operators.
- Under-broad pricing detection may create compliance and margin risk.
- Extraction quality may degrade on ambiguous or multilingual WhatsApp messages.
- Operators may resist the workflow if the structured review step adds latency without enough rework reduction.
- The team may over-build queueing or console complexity before validating adoption of structured intake.

## Dependencies
- WhatsApp integration.
- Authentication and role-based access for internal users.
- Deterministic workflow/rules service.
- Event/pricing source-of-truth inputs sufficient for human review.
- Logging and audit storage.

## Launch Readiness for Phase 1
Launch requires an end-to-end intake path from WhatsApp to reviewed outbound response, explicit approval gating for pricing and other policy-sensitive commitments, deterministic rule enforcement around all model usage, and auditable records for gated actions. A standalone approval queue is optional if the same control is enforced within the operator workflow.

## Decision Frame
Ship Phase 1 as bounded workflow automation, not as an autonomous booking agent. The product should prioritize validating that structured intake plus deterministic approval controls reduce operator rework and improve response speed, while preserving explicit human control over all pricing commitments and policy-sensitive outbound communication.

## Unknowns & Evidence Gaps
- Whether operators will adopt structured intake review quickly enough to justify a richer dedicated console.
- Exact pricing-rule complexity and whether deterministic calculators already exist.
- Required approval thresholds by role, region, or event type.
- Acceptable confidence threshold for auto-sending deterministic follow-up questions.
- Frequency of multilingual, ambiguous, or attachment-heavy inquiries.
- Whether approval should live in a separate queue or embedded directly in the operator workflow for Phase 1.

## Pass/Fail Readiness
Pass if Phase 1 demonstrably blocks all unapproved pricing sends, keeps LLM usage inside validated schemas and draft states, and shows that structured intake reduces manual operator re-entry on routine inquiries.

Fail if any model output can directly trigger customer-facing commitments, if auditability is incomplete, or if operators do not materially use the structured workflow because the implementation adds overhead without reducing work.

## Recommended Next Artifact
Technical spec for the deterministic orchestration layer, approval-state machine, pricing detection policy, and the smallest viable operator workflow needed to validate structured intake adoption.
