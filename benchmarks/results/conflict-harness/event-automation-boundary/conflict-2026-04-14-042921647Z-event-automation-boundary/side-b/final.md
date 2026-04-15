# Phase 1 PRD: Event Automation Platform with Human-in-the-Loop Boundaries

## Decision Frame

**What decision does this PRD support?**
Whether to greenlight Phase 1 engineering for an event management automation platform that combines a WhatsApp-based assistant for external users, an internal operations console, and strict deterministic boundaries around where LLM inference is permitted versus where human approval is required.

**Who decides?** Product lead + engineering lead, with sign-off from legal/compliance on the pricing commitment approval workflow.

**What happens if we don't build this?**
Event coordinators continue managing bookings, pricing, and vendor logistics through fragmented tools (spreadsheets, email threads, ad-hoc WhatsApp groups). Pricing errors from manual processes persist. No audit trail for pricing commitments.

**Phase 1 scope boundary:** MVP covers single-venue event booking with WhatsApp inquiry handling, human-approved pricing, and an internal console for operations staff. Multi-venue, marketplace features, and payment processing are explicitly out of scope.

---

## Product Overview

### Problem Statement
Event management businesses handle high volumes of WhatsApp inquiries about availability, pricing, and logistics. Current workflows are manual, error-prone, and lack audit trails — particularly around pricing commitments that carry contractual weight.

### Target Users
1. **Event inquirers** (external): Prospective clients asking about venue availability, packages, and pricing via WhatsApp.
2. **Operations staff** (internal): Team members who approve pricing, confirm bookings, and manage event logistics through the internal console.

### Core Value Proposition
Automate the repeatable parts of event inquiry handling while enforcing human approval gates on any action that creates a financial or contractual commitment.

---

## System Architecture: LLM Boundary Policy

### Deterministic Boundary Principle
The platform enforces a strict separation between what the LLM may do autonomously and what requires human approval. This is not a soft guideline — it is enforced architecturally.

| Zone | What happens | LLM role | Human role |
|------|-------------|----------|------------|
| **Green (autonomous)** | Answer FAQs, parse inquiry intent, extract structured data (dates, headcount, preferences) | LLM processes and responds | Monitoring only |
| **Yellow (assist)** | Draft responses involving package details, suggest pricing tiers, compose follow-up messages | LLM drafts; human reviews before send | Approve/edit/reject draft |
| **Red (human-only)** | Commit to a price, confirm a booking, issue a contract or invoice, override availability | LLM may not act | Human executes directly |

### Enforcement Mechanism
- All outbound WhatsApp messages pass through a **message gateway** that classifies each message against the boundary policy before delivery.
- Messages containing pricing figures, booking confirmations, or contractual language are **held in a review queue** and cannot be sent without explicit staff approval in the internal console.
- Classification uses deterministic rules (regex + keyword matching on structured fields), NOT LLM self-classification. The LLM does not decide its own boundary.
- Boundary violations are logged and trigger alerts to the ops team.

---

## Feature Specifications

### F1: WhatsApp Assistant
- **Channel:** WhatsApp Business API integration.
- **Capabilities (Green zone):** Respond to availability queries, provide general info (hours, location, capacity), collect inquiry details into structured format, handle greetings and FAQ.
- **Capabilities (Yellow zone):** Draft personalized package recommendations with pricing ranges. These are queued for human review, not sent directly.
- **Constraints:** Assistant never confirms a price, never confirms a booking, never sends contractual language. If the user asks for a firm price, the assistant responds with: "Let me connect you with our events team who can confirm pricing for you."
- **Fallback:** Any query the LLM confidence score falls below threshold on is escalated to human handoff with full conversation context.

### F2: Internal Operations Console
- **Purpose:** Single pane of glass for operations staff to manage the inquiry pipeline.
- **Key views:**
  - **Review queue:** Messages awaiting approval (Yellow zone drafts, escalated conversations).
  - **Active inquiries:** Pipeline view of all open conversations with status.
  - **Booking calendar:** Availability grid with conflict detection.
  - **Audit log:** Every message sent, every approval decision, every boundary enforcement event.
- **Approval workflow:** Staff can approve, edit, or reject LLM-drafted messages. Approved messages are sent via the gateway. Rejections return to draft with staff notes.

### F3: Pricing Commitment Approval Gate
- **Trigger:** Any outbound message classified as containing a pricing commitment.
- **Flow:** Message held → notification to authorized approver → approver reviews in console → approve (with optional edit) or reject → message sent or returned to draft.
- **Authorization:** Only designated roles (e.g., Sales Manager, GM) can approve pricing commitments. Role-based access enforced in console.
- **SLA:** Target <15 min approval turnaround during business hours. Console shows aging indicators for pending approvals.
- **Audit:** Every pricing approval captures: approver identity, timestamp, original draft, any edits made, final sent version.

### F4: Conversation Context Persistence
- **Requirement:** Full conversation history maintained per inquiry, accessible to both the LLM (for context-aware responses) and operations staff (in console).
- **Retention:** 90 days active, then archived. Compliant with data protection requirements for the operating jurisdiction.

---

## Technical Constraints

1. **LLM calls are stateless per-turn:** Each LLM invocation receives the conversation history as context but does not maintain server-side state. This prevents drift and makes behavior reproducible.
2. **No LLM-in-the-loop for boundary classification:** The message gateway uses deterministic rules to classify messages. The LLM does not self-assess whether its output requires approval.
3. **Structured output extraction:** LLM responses are parsed into structured fields (proposed_price, booking_confirmed, contractual_language) using JSON schema validation before boundary classification.
4. **Rate limiting:** WhatsApp assistant limited to 1 response per user message to prevent runaway generation.
5. **Model versioning:** LLM model version pinned per deployment. Model upgrades require regression testing against the boundary policy test suite before rollout.

---

## Unknowns & Evidence Gaps

| ID | Unknown | Impact if wrong | Mitigation plan |
|----|---------|-----------------|----------------|
| U1 | WhatsApp Business API rate limits and template message approval timelines may constrain response latency | Users experience delays, undermining the automation value prop | Prototype API integration in week 1; measure actual latency under realistic load |
| U2 | **Acceptable false-negative rate for boundary classification is unknown.** We lack data on (a) the base rate of pricing-adjacent language in real inquiries, (b) the contractual exposure per missed detection, and (c) the statistical power needed from a test corpus to validate any chosen threshold. A regex/keyword approach will have some residual miss rate, but the right target depends on empirical risk quantification, not an a priori number. | False negatives create unauthorized commitments with contractual liability; an overly strict threshold creates excessive false positives that degrade staff efficiency and approval queue trust | **Three-step calibration:** (1) Collect and label 500+ real WhatsApp messages to establish base rates for pricing language and edge cases. (2) With legal/compliance, quantify the contractual exposure per unauthorized pricing commitment to determine acceptable residual risk. (3) Set the false-negative threshold as the rate at which expected annual exposure falls below an agreed dollar ceiling, and size the test corpus to achieve statistical significance at that threshold (power analysis, not arbitrary sample count). Run this calibration during shadow mode before committing to a launch gate number. |
| U3 | Staff adoption of the approval workflow — if turnaround exceeds 15 min consistently, users will abandon the WhatsApp channel | Automation investment wasted; user experience worse than status quo | Instrument approval latency from day 1; set up alerts at 10 min; design escalation path for unresponsive approvers |
| U4 | LLM response quality for event-specific domain — no evidence yet on how well general-purpose LLMs handle venue-specific package details without fine-tuning | Poor responses erode trust and increase escalation rate, overwhelming human staff | Pilot with 50 real inquiries in shadow mode (LLM drafts, humans respond independently) to measure alignment before going live |
| U5 | User expectations around WhatsApp interaction — unclear whether users expect instant pricing or accept a "let me check" handoff | Misaligned expectations may cause drop-off at the handoff point | Survey 30 recent inquirers on their expectation for pricing response time; A/B test handoff language |

---

## Pass/Fail Readiness

### Pass Criteria (all must be met for Phase 1 launch)
- [ ] Boundary classification false-negative threshold established through empirical calibration (base-rate analysis of labeled corpus + legal risk quantification), not an a priori number. The threshold must be agreed by product, engineering, and legal before being used as a launch gate.
- [ ] Test corpus sized via power analysis to validate the chosen threshold at ≥95% confidence. Classification rules must meet the threshold on this corpus.
- [ ] WhatsApp assistant correctly escalates to human handoff in 100% of Red zone scenarios in testing.
- [ ] Internal console approval workflow end-to-end functional: draft → review → approve/reject → send/hold.
- [ ] Median approval turnaround <15 minutes in a 1-week staff pilot.
- [ ] Audit log captures all required fields for every pricing approval.
- [ ] Shadow mode pilot with 50 real inquiries shows LLM draft alignment >70% with human responses (measured by ops staff blind review).

### Fail Criteria (any one blocks launch)
- [ ] Boundary classification false-negative rate exceeds the empirically calibrated threshold — unauthorized pricing commitments are an unacceptable risk.
- [ ] Calibration process reveals that deterministic rules cannot achieve an acceptable false-negative rate for the identified risk exposure, indicating a need for alternative control design (e.g., mandatory human review of all pricing-adjacent messages).
- [ ] LLM generates fabricated availability or package details in >10% of test cases.
- [ ] Staff approval turnaround consistently exceeds 30 minutes — defeats the purpose of automation.
- [ ] WhatsApp Business API integration cannot support required message volume within cost constraints.

---

## Recommended Next Artifact

**Technical Design Document** covering:
1. Message gateway architecture and boundary classification rule engine specification.
2. WhatsApp Business API integration design (webhook handling, template messages, session management).
3. Internal console data model and approval workflow state machine.
4. LLM prompt engineering guidelines and structured output schema.
5. Monitoring and alerting design for boundary violations and approval SLA breaches.
6. **Boundary classification calibration plan:** methodology for corpus collection, labeling protocol, risk quantification framework, power analysis for test corpus sizing, and threshold-setting decision process.

This should be produced before engineering begins, validated against the boundary classification test corpus, and reviewed by both engineering and legal/compliance.
