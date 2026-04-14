# Revised artifact

## Phase 1 PRD: Event Automation Platform

## Product Summary
Build a Phase 1 event management automation platform that supports customer coordination over WhatsApp, routes work through an internal operator console, requires explicit human approval before any pricing or commercial commitment is sent, and enforces strict deterministic boundaries around LLM usage.

## Problem
Event teams lose time managing repetitive inbound inquiries, clarifications, and quote preparation across messaging channels. Full manual handling is slow, but full autonomy is unacceptable because pricing, commitments, and exception handling carry financial and reputational risk.

## Goal
Reduce manual coordination effort and response time for inbound event workflows while preserving human control over pricing, commitments, and edge-case decisions.

## Non-Goals
- Fully autonomous quote issuance
- Autonomous contract negotiation
- Autonomous payment collection or refunds
- Open-ended LLM action execution against production systems
- Multi-channel expansion beyond WhatsApp in Phase 1

## Target Users
- Event requester communicating over WhatsApp
- Internal operations agent handling intake and follow-up
- Pricing approver or manager authorizing commercial commitments

## Phase 1 Product Decision
Phase 1 is an operator-assist system, not an autonomous event agent. The product must solve for faster intake, structured case handling, and safer drafting while keeping all authoritative commitments behind deterministic controls and human review.

## Scope
### In Scope
- WhatsApp assistant for inbound and outbound customer messaging
- Automatic creation of a structured internal case from WhatsApp conversations
- Internal console for case review, reply drafting, escalation, and approvals
- Deterministic workflow and policy layer governing state, permissions, and outbound sends
- LLM usage only for bounded tasks such as summarization, extraction into predefined schema, classification, and draft generation
- Explicit human approval for any pricing, discount, or other commercial commitment before send
- Audit trail for model suggestions, human edits, approvals, and outbound messages

### Out of Scope
- Auto-sending quotes or commercial commitments without approval
- Arbitrary tool use by the LLM
- Autonomous exception resolution for unsupported or ambiguous requests
- Detailed downstream system integrations beyond what is required for Phase 1 operator workflows

## Product Principles
1. Deterministic systems own authoritative state, policy enforcement, and external side effects.
2. LLM outputs are suggestions only unless validated by rules or accepted by a human.
3. Any message that could commit price, discount, scope, or commercial terms must require explicit human approval.
4. The product should prefer safe escalation over confident automation when ambiguity is present.
5. Phase 1 should specify the control boundary clearly and defer unvalidated implementation detail where operating evidence is missing.

## User Experience
### WhatsApp Assistant
- Acknowledge inbound messages quickly
- Collect or confirm missing required information using deterministic prompts
- Support draft replies for common non-commercial questions
- Hold any pricing or commercial response until approval is recorded

### Internal Console
- Show active cases and conversation history
- Present extracted case data and suggested next actions
- Let operators review, edit, escalate, and send replies
- Provide a clear approval step for pricing or commitment-bearing messages
- Expose an audit trail for customer-visible decisions

## Functional Requirements
### FR1: Intake and Case Structuring
- The system must create or update an internal case for each relevant WhatsApp conversation.
- The system must capture a predefined minimum schema for event intake, with missing required data triggering deterministic follow-up questions.
- LLM extraction may assist, but extracted values remain non-authoritative until validated or accepted.

### FR2: Deterministic Control Boundary
- Workflow status, permissions, policy checks, and outbound sending must be controlled by deterministic services.
- LLM outputs must not directly trigger authoritative state changes or external side effects.
- The system must fail closed when approval state, policy evaluation, or send eligibility is uncertain.

### FR3: Bounded LLM Usage
- Allowed LLM tasks in Phase 1 are limited to summarization, intent classification, schema-bound extraction, and draft response generation.
- The LLM must not set price, approve commitments, alter policy, or invoke arbitrary actions.
- All LLM outputs must be logged as suggestions with traceability to prompt and model version.

### FR4: Human Approval for Commercial Commitments
- Any outbound message containing pricing, discounts, package commitments, or other commercial terms must be blocked pending human approval.
- A human approver must be able to approve, reject, or edit the message before send.
- The system must block delivery if no valid approval record exists.

### FR5: Human Review and Escalation
- Operators must be able to review, edit, or override drafted responses.
- Low-confidence extraction, unsupported requests, and ambiguous commercial intent must escalate to human handling.
- Phase 1 may support operator-reviewed drafts for non-pricing responses, but should not require autonomous sending.

### FR6: Auditability
- The system must log inbound messages, extracted fields, draft outputs, approvals, edits, policy decisions, and outbound sends.
- Audit records must support reconstruction of who approved what and what content was ultimately sent.

## Core Workflows
### Workflow A: New Inquiry Intake
1. Customer sends a WhatsApp inquiry.
2. System acknowledges receipt.
3. System creates or updates a structured case.
4. Missing required fields trigger deterministic follow-up prompts.
5. Operator reviews the case when needed.

### Workflow B: Pricing Response
1. Operator or system prepares a draft pricing response.
2. Policy layer detects commercial content.
3. Message is blocked pending approval.
4. Human approver approves, rejects, or edits.
5. Deterministic send service delivers the approved message.

### Workflow C: Non-Commercial Follow-Up
1. Customer asks an operational question.
2. System classifies the request and prepares a draft response when appropriate.
3. Operator reviews and sends in Phase 1.

## Data and Workflow Guidance
Phase 1 requires a minimum structured schema, explicit approval records, and auditable workflow status, but it should not lock the team into an over-specified state machine, console layout, or canonical data model until operating evidence is collected. Implementation details such as exact statuses, field taxonomy, panel structure, and pricing-source integration should be finalized in the technical spec after discovery on volume, approval roles, and pricing operations.

## Success Metrics
### Primary
- Reduction in median operator handling time per qualified inquiry
- Faster time to first meaningful response
- Percentage of inbound conversations converted into structured internal cases without manual re-entry

### Guardrails
- Zero pricing or commercial commitments sent without recorded approval
- Zero unauthorized external actions triggered directly by LLM output
- Low rate of customer-visible factual corrections after send

## Risks
- Ambiguous pricing language may evade simple policy detection if rules are too narrow.
- Weak approval UX may push operators into off-platform workarounds.
- Over-specifying workflow and schema before observing traffic may create unnecessary rework.

## Decision Frame
Proceed with a Phase 1 operator-assist architecture where deterministic services own state, policy, approvals, and message sending, and where LLMs are limited to bounded suggestion tasks. Make the automation boundary the primary product decision now; defer detailed workflow-state, console-layout, and full data-model decisions until evidence on operating volume, approval structure, and pricing-source mechanics is available.

## Unknowns & Evidence Gaps
- Inquiry volume, peak load, and SLA expectations are not provided.
- Approval roles, separation-of-duties rules, and escalation ownership are undefined.
- The source of truth for pricing is unclear: manual entry, deterministic rules, or external system.
- WhatsApp compliance, templates, and attachment-processing constraints are unspecified.
- No observed traffic data exists yet to validate the right workflow granularity or case schema.

## Pass/Fail Readiness
Pass if stakeholders align that Phase 1 is an operator-assist product with hard approval gates and deterministic control over all external commitments. Fail if stakeholders expect autonomous quote issuance, unrestricted LLM actioning, or finalized internal workflow architecture before the missing operating evidence is gathered.

## Recommended Next Artifact
Technical spec focused on the control boundary: approval-policy contract, commercial-message detection rules, minimum intake schema, audit model, WhatsApp integration points, and the discovery plan needed to finalize workflow states, roles, and pricing-source integration.
