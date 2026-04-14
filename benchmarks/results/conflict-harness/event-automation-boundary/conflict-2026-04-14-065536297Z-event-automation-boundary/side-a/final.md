# Revised artifact

# Phase 1 PRD: Event Management Automation Platform

## Product Summary
Build a Phase 1 event management automation platform that lets customers interact through WhatsApp, routes operational work through an internal console, requires human approval before any pricing commitment is sent, and enforces deterministic boundaries around LLM usage. The Phase 1 goal is faster inquiry handling and cleaner operator workflows without allowing the model to make irreversible commercial or operational decisions.

## Problem
Event teams lose time handling repetitive inbound questions, collecting missing details, and coordinating follow-up across fragmented channels. Pure manual handling is slow and inconsistent. Fully autonomous AI is unacceptable because pricing commitments, policy interpretation, and vendor-sensitive decisions require review and auditability.

## Goals
- Reduce time to first useful response for inbound WhatsApp inquiries.
- Automate structured intake, FAQ handling, and draft generation for operators.
- Prevent unapproved pricing, discounts, or contractual commitments.
- Make every LLM-assisted action traceable, reviewable, and bounded.

## Non-Goals
- End-to-end autonomous booking.
- Automatic price quotation without human approval.
- Free-form agentic tool use in production.
- Multi-channel expansion beyond WhatsApp in Phase 1.

## Primary Users
- External customer: asks questions, shares event requirements, receives approved responses on WhatsApp.
- Internal operator: reviews conversations, approves pricing messages, edits drafts, and completes handoffs.
- Manager/admin: configures guardrails, templates, approval policies, and audit review.

## User Stories
- As a customer, I can message the business on WhatsApp and get immediate help for common questions.
- As a customer, I can provide event details in chat without filling a long form upfront.
- As an operator, I can see a structured summary of each inquiry and a draft response.
- As an operator, I must approve any pricing commitment before it is sent.
- As an admin, I can inspect what the LLM produced, what deterministic rules ran, what was flagged, and what was ultimately sent.

## Phase 1 Scope
### 1. WhatsApp Assistant
- Receive inbound customer messages.
- Answer approved FAQ-style questions from a controlled knowledge source.
- Collect required intake fields such as date, location, guest count, event type, and budget range.
- Detect when conversation needs operator review.
- Present price-related content only as a draft pending approval.

### 2. Internal Console
- Unified inbox of active conversations.
- Structured inquiry panel with extracted fields and confidence flags.
- Draft response composer showing source of content: template, operator text, or LLM draft.
- Approval workflow for any pricing or commitment-bearing message.
- Audit log for message history, approvals, edits, detector outcomes, and send actions.

### 3. Deterministic Workflow Layer
- Rules engine for routing, state transitions, validation, approvals, and outbound gating.
- Template system for approved response classes.
- Hard blocks on outbound messages containing pricing commitments unless approved.
- Deterministic extraction schema for key event fields, with validation and missing-field prompts.
- Fail-closed handling for ambiguous outbound messages.

### 4. LLM Usage Boundaries
Allowed uses:
- Classify intent into fixed categories.
- Extract structured fields into a predefined schema.
- Draft non-binding responses from approved context.
- Summarize conversation for internal operators.

Disallowed uses:
- Sending messages directly without policy checks.
- Choosing final price, discount, or contractual language.
- Calling arbitrary tools or external systems.
- Changing workflow state outside deterministic rules.

## Functional Requirements
### Messaging
- System must ingest and persist inbound WhatsApp messages in near real time.
- System must maintain conversation state per lead.
- System must support operator takeover and return to assisted mode.

### Intake
- System must capture required event fields in a canonical schema.
- System must mark fields as confirmed, inferred, or missing.
- System must ask deterministic follow-up questions for missing required fields.

### Pricing and Commitment Control
- System must evaluate every outbound draft with a deterministic commitment-risk gate before send.
- Commitment-risk gate must detect price, price range, discount, package inclusion, minimum spend, hold/booking language, and any language that could reasonably be interpreted as a commercial commitment.
- Any outbound draft flagged as commitment-bearing must be blocked pending authorized human approval.
- Any outbound draft with detector uncertainty, rule conflicts, or unsupported language patterns must default to manual review.
- Operators must be able to manually mark a message as commitment-bearing even if not auto-flagged.
- System must log detector result, rule basis, approver identity, timestamp, and final sent content.

### Detection Degradation Strategy
- Phase 1 must ship with fail-closed behavior for ambiguous outbound content: when the gate cannot confidently classify a message as safe, the message cannot auto-send.
- Pilot operations must include sampling review of a defined percentage of outbound messages classified as non-commitment to estimate false negatives.
- Managers must be able to tune rules and add phrases/patterns without code deployment.
- If pilot false-negative rate exceeds agreed threshold, auto-send of low-risk content must be disabled until remediated.

### Console
- Operators must be able to edit any draft before sending.
- Operators must be able to see the model draft alongside source snippets, detector outcome, and rule triggers.
- Managers must be able to review approval queues, audit logs, and detector override events.

### Safety and Auditability
- Every LLM output must be stored with prompt version, model identifier, timestamp, and downstream action taken.
- Deterministic policy checks must run before any customer-visible send.
- System must preserve an immutable audit trail for approvals, sends, detector classifications, and overrides.

## UX Principles
- Customer experience should feel responsive, simple, and conversational.
- Operator experience should prioritize fast review, low ambiguity, and clear risk signals.
- Risky or ambiguous actions should be explicit, interruptive, and review-first.

## System Workflow
1. Customer sends WhatsApp message.
2. Deterministic intake/routing layer classifies message type.
3. If eligible, LLM drafts extraction or response within allowed boundaries.
4. Deterministic checks validate schema, policy, and commitment-risk status.
5. If outbound content is clearly non-commitment and within approved response classes, it may be sent under pilot policy.
6. If pricing, commitment language, or ambiguity is detected, item enters manual review or approval queue.
7. Approved final response is sent and fully logged.

## Success Metrics
- Median time to first meaningful response.
- Percentage of inquiries with complete intake schema captured.
- Percentage of commitment-bearing messages sent only after approval.
- False-negative rate for commitment-risk gate from audited sample.
- False-positive rate for commitment-risk gate.
- Operator handling time per qualified inquiry.
- Escalation rate from assistant to operator.
- Audit completeness rate for customer-visible messages.

## Risks
- Over-trusting LLM extraction may create bad structured data.
- Commitment-risk detection may miss unsafe language if rules are underfit.
- Over-flagging may create operator fatigue and erase workflow benefit.
- Knowledge-base drift may degrade answer quality.

## Dependencies
- WhatsApp Business API or equivalent provider.
- Authenticated internal console.
- Policy/rules engine.
- Approved content and FAQ source.
- Role-based access control and audit storage.

## Launch Criteria
- Commitment-risk gate cannot be bypassed from UI or API.
- Approved FAQ responses are limited to reviewed content classes.
- Audit trail is complete for all test conversations.
- Detector supports explicit safe, flagged, and ambiguous outcomes, with ambiguous routed to manual review.
- Pilot acceptance thresholds are defined for false negatives and false positives before any scaled rollout.
- Sampling review process exists for messages not flagged by the detector.
- Operator workflows are usable in a controlled pilot.

## Decision Frame
Phase 1 should optimize for controlled operational leverage, not autonomy. The core decision is to use the LLM only for bounded interpretation and drafting while keeping workflow control, outbound enforcement, and approval state deterministic. The approval promise is only credible if the system treats commitment-risk detection as a first-class control with fail-closed behavior, explicit ambiguity handling, pilot measurement of miss rates, and a rollback path if detector performance is not good enough.

## Unknowns & Evidence Gaps
- Exact approval policy still needs a formal taxonomy: any numeric mention, indicative range, discount, package inclusion, or only formal quote language.
- No pilot data yet confirms acceptable false-positive and false-negative rates for the commitment-risk gate.
- The initial rule set for ambiguous commercial language is not yet defined.
- Required SLA for operator review during off-hours is undefined.
- Integration constraints and message template policies for the chosen WhatsApp provider are not yet documented.
- No benchmark yet defines acceptable extraction accuracy by event type.

## Pass/Fail Readiness
Pass if the team agrees that Phase 1 is an operator-assist product with strict human approval for commitment-bearing messages, deterministic outbound enforcement, narrow LLM scope, fail-closed handling for ambiguous cases, and explicit pilot validation of detector performance. Fail if stakeholders expect autonomous quoting, unconstrained model behavior, unsupported channel breadth, or a launch before commitment-risk detection thresholds and degradation rules are defined.

## Recommended Next Artifact
Technical spec covering conversation-state model, approval-state machine, commitment-risk taxonomy, detection and ambiguity rules, sampling plan for false-negative estimation, rollback criteria, LLM boundary architecture, audit-log schema, and WhatsApp integration sequence.
