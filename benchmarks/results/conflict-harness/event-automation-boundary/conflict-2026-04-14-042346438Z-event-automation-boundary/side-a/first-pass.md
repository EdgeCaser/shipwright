# Phase 1 PRD: Event Automation Platform

## Product Summary
Build a Phase 1 event management automation platform that lets event organizers and venue operators manage inquiries and booking workflows through a WhatsApp assistant and an internal operations console. The product must automate routine intake, qualification, availability checks, draft responses, and task routing while preserving hard human approval for any pricing commitment and enforcing deterministic boundaries around all LLM usage.

## Problem
Event teams lose speed and consistency because inbound demand arrives through chat, staff manually restate requirements across tools, and pricing or exception handling depends on a small number of experienced operators. Full autonomy is not acceptable in Phase 1 because pricing commitments, policy exceptions, and operational edge cases create financial and reputational risk.

## Goal
Reduce time-to-first-qualified-response and operator workload on repetitive intake tasks without allowing the system to autonomously commit price, policy exceptions, or final contractual terms.

## Non-Goals
- No autonomous price quotes sent to customers.
- No autonomous contract generation or signature workflow.
- No payment collection.
- No omnichannel support beyond WhatsApp in Phase 1.
- No fully agentic action execution outside explicitly approved deterministic workflows.

## Primary Users
- Event requester using WhatsApp.
- Internal operator reviewing requests, pricing, and next actions.
- Manager approving pricing commitments and monitoring queue health.

## Jobs To Be Done
- As an event requester, I want to describe my event naturally over WhatsApp and get a fast, useful next step.
- As an operator, I want structured intake extracted from chat so I can review exceptions instead of retyping basics.
- As a manager, I want pricing commitments gated behind approval so margin and policy controls are preserved.

## Phase 1 Scope
### In Scope
- WhatsApp assistant for intake, FAQs, status updates, and follow-up questions.
- Internal console for conversation review, structured intake fields, approval queue, and audit trail.
- Deterministic workflow engine for routing, validation, status transitions, and outbound message templates.
- LLM-assisted extraction and drafting only within bounded, reviewable steps.
- Human approval step before any outbound message containing price, discount, package commitment, or exception approval.

### Out of Scope
- Dynamic pricing optimization.
- Auto-negotiation.
- Fully automated exception handling.
- Direct integration with downstream ERP/accounting unless needed for read-only reference.

## Core User Flow
1. Customer sends an inquiry in WhatsApp.
2. System captures message, creates or links a lead, and runs deterministic preprocessing.
3. LLM may extract structured fields from the message and propose missing follow-up questions.
4. Workflow engine validates required fields and either sends approved deterministic questions or routes to an operator.
5. Operator views the conversation and structured summary in the internal console.
6. If pricing is needed, system may prepare a draft recommendation, but cannot send it.
7. Human approver reviews, edits if needed, and explicitly approves outbound pricing commitment.
8. Approved message is sent through WhatsApp with a full audit log of draft, approver, timestamp, and final content.

## Functional Requirements
### WhatsApp Assistant
- Receive inbound user messages and attach them to a customer/event thread.
- Answer a limited set of approved FAQs from curated knowledge.
- Ask deterministic follow-up questions when required fields are missing.
- Provide status updates based on workflow state.
- Escalate to human when confidence, policy, or scope thresholds are exceeded.

### Internal Console
- Show inbox, conversation thread, extracted event details, workflow status, and approval state.
- Allow operators to correct extracted fields.
- Surface pricing draft requests in a dedicated approval queue.
- Record who approved, edited, rejected, or escalated each action.
- Show warning banners when content includes pricing, discounts, or exception language.

### Approval Controls
- Any message containing price, package commitment, discount, minimum spend, hold/reservation confirmation, or policy exception requires human approval before send.
- Approval action must be explicit and attributable to a named internal user.
- Rejected drafts must return to editable state with reason capture.

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
- No hidden chain-of-thought storage or display requirement.

## Pricing Commitment Policy
Pricing commitments include any numeric or package-specific offer that a reasonable customer could interpret as a quote, estimate, discount, or approval. In Phase 1:
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
- Percent of pricing-related outbound messages approved before send.
- Operator touches per qualified inquiry.
- Escalation rate from automated path to human path.
- Approval turnaround time.

## Guardrails
- Zero unapproved pricing commitments sent.
- Zero workflow actions executed directly from unvalidated LLM output.
- Full audit coverage for approval-required actions.

## Risks
- Over-broad pricing detection may slow operators.
- Under-broad pricing detection may create compliance and margin risk.
- Extraction quality may degrade on ambiguous or multilingual WhatsApp messages.
- Operators may bypass console if workflow latency is too high.

## Dependencies
- WhatsApp integration.
- Authentication and role-based access for internal console.
- Deterministic workflow/rules service.
- Event/pricing source-of-truth inputs sufficient for human review.
- Logging and audit storage.

## Launch Readiness for Phase 1
Launch requires the WhatsApp intake path, internal console, approval queue, pricing send gate, audit log, and deterministic rule enforcement to be operational. Nice-to-have analytics can lag if guardrails are already measurable.

## Decision Frame
Ship Phase 1 only as a bounded automation product, not as an autonomous agent. The product should optimize intake speed and operator efficiency while preserving explicit human control over all pricing commitments and any policy-sensitive outbound communication. The core decision is to accept partial automation in exchange for lower operational and legal risk.

## Unknowns & Evidence Gaps
- Exact pricing-rule complexity and whether deterministic calculators already exist.
- Required approval thresholds by role, region, or event type.
- Acceptable confidence threshold for auto-asking follow-up questions.
- Frequency of multilingual, ambiguous, or attachment-heavy inquiries.
- Existing system integrations needed for availability and package data.

## Pass/Fail Readiness
Pass if Phase 1 demonstrably blocks all unapproved pricing sends, keeps LLM usage inside validated schemas and draft states, and improves intake handling speed for routine inquiries.

Fail if any model output can directly trigger customer-facing commitments, if auditability is incomplete, or if operators must manually reconstruct most event details despite the automation layer.

## Recommended Next Artifact
Technical spec for the deterministic orchestration layer, approval-state machine, pricing detection policy, and LLM boundary enforcement contract.
