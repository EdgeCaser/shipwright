# Phase 1 PRD: Event Management Automation Platform

## Decision Frame

**Problem:** Event management companies spend 60-80% of operator time on repetitive inquiry handling, quote generation, and follow-up — tasks that are largely deterministic but currently require human attention. Meanwhile, pricing commitments made without proper approval create financial risk.

**Decision to be made:** Should we build a Phase 1 platform consisting of (1) a WhatsApp-based client assistant, (2) an internal operator console, and (3) a human-approval gate for pricing, with strict deterministic boundaries around where LLM inference is permitted?

**Stakeholders:** Event operations managers, sales/pricing approvers, clients interacting via WhatsApp, engineering team.

**Scope boundary:** Phase 1 covers inbound inquiry handling, deterministic quote assembly, and human-approved pricing only. It does NOT cover payment processing, vendor coordination, or post-event workflows.

---

## Product Overview

### Core Components

#### 1. WhatsApp Client Assistant
- **Function:** Handles inbound client inquiries via WhatsApp Business API.
- **Deterministic operations (no LLM):**
  - Date/venue availability lookups against a structured calendar database.
  - Package catalog retrieval (fixed menu of offerings with prices).
  - Status updates on confirmed bookings (read from database).
  - FAQ responses from a curated, versioned response bank.
- **LLM-permitted operations (bounded):**
  - Natural language understanding of client intent (classification only — output is an enum, not freeform).
  - Summarization of client requirements into a structured intake form.
  - Conversational tone adjustment on pre-approved response templates (template is deterministic; phrasing layer is LLM).
- **LLM-prohibited operations:**
  - Generating or confirming any pricing figure.
  - Making availability commitments not backed by real-time DB state.
  - Offering discounts, custom terms, or contractual language.
  - Responding to complaints or escalations (routed to human immediately).

#### 2. Internal Operator Console
- **Function:** Web-based dashboard for operations staff to manage inquiries, approve quotes, and monitor assistant performance.
- **Key features:**
  - Inquiry queue with client conversation history and structured intake summary.
  - Quote builder: deterministic price calculator using approved rate cards, package rules, and seasonal multipliers.
  - Approval workflow: quotes above threshold or with custom elements require manager sign-off before release.
  - Override log: every human edit to an assistant-generated response is logged with timestamp, operator ID, and reason.
  - Assistant performance dashboard: response accuracy, escalation rate, client satisfaction proxies.

#### 3. Human Approval Gate for Pricing
- **Rule:** No pricing information is ever sent to a client without explicit human approval.
- **Implementation:**
  - Assistant assembles a draft quote from deterministic rules (rate card × quantity × date multiplier).
  - Draft is surfaced in the console with full calculation breakdown.
  - Approver reviews, may adjust, then releases to client.
  - Time SLA: quotes should be approved within 30 minutes during business hours.
  - Escalation: if no approval within SLA, the system nudges the approver and notifies a backup.

### Deterministic Boundary Specification

| Layer | LLM Allowed? | Constraint |
|-------|-------------|------------|
| Intent classification | Yes | Output must map to a fixed enum of intents. Confidence threshold ≥ 0.85 or escalate to human. |
| Intake summarization | Yes | Output fills a structured JSON form. No freeform client-facing text generated. |
| Response phrasing | Yes | Only applied to pre-approved templates. Template ID logged. No net-new content generation. |
| Price calculation | No | Deterministic formula only. Inputs: rate card, quantity, date, package. |
| Availability check | No | Direct database query. No inference. |
| Discount/terms | No | Human-only. System prevents assistant from accessing discount rules. |
| Complaint handling | No | Immediate routing to human queue. |
| Contract language | No | Out of scope for Phase 1. |

### Data Architecture (Phase 1)
- **Rate card database:** Versioned, admin-editable. Changes require audit trail.
- **Conversation store:** All WhatsApp messages stored with metadata (timestamps, intent classifications, LLM confidence scores).
- **Approval log:** Immutable append-only log of all pricing approvals with approver ID, original draft, final sent version, and any modifications.
- **LLM call log:** Every LLM invocation logged with input, output, model version, latency, and confidence score. Enables audit and drift detection.

---

## Unknowns & Evidence Gaps

1. **Client adoption rate for WhatsApp channel:** We assume clients prefer WhatsApp over email/phone for event inquiries, but have no usage data. **Evidence needed:** Survey of 20+ existing clients on channel preference, or A/B test with WhatsApp option added to current intake flow.

2. **Intent classification accuracy at launch:** The fixed-enum approach constrains LLM output, but we don't know the miss rate on real client messages. **Evidence needed:** Label 500+ historical client inquiries, run classification benchmarks, measure accuracy and escalation rate.

3. **Approval SLA feasibility:** 30-minute quote approval assumes approvers are available and the console is staffed. **Evidence needed:** Audit current quote turnaround times; interview ops managers on staffing patterns.

4. **WhatsApp Business API rate limits and costs:** Pricing model for WhatsApp Business API messages at expected volume is unvalidated. **Evidence needed:** Volume projection from current inquiry rates; cost modeling against Meta's published rate card.

5. **LLM response phrasing quality:** Applying LLM to rephrase templates may produce inconsistent tone or hallucinated additions. **Evidence needed:** Red-team testing with adversarial inputs; A/B comparison of template-only vs. LLM-phrased responses.

6. **Regulatory requirements for automated client communication:** Jurisdiction-specific rules on bot disclosure, data retention, and consent for automated messaging via WhatsApp. **Evidence needed:** Legal review for target launch markets.

---

## Pass/Fail Readiness

| Criterion | Status | Rationale |
|-----------|--------|-----------|
| Problem validated with target users | **FAIL** | No direct user research conducted. Assumed from domain knowledge. |
| Technical feasibility confirmed | **CONDITIONAL PASS** | WhatsApp Business API is mature; deterministic pricing logic is straightforward. LLM boundary enforcement needs prototype validation. |
| Pricing approval workflow defined | **PASS** | Clear gate: no price leaves system without human approval. Escalation path defined. |
| Deterministic boundaries specified | **PASS** | Explicit table of what LLM can/cannot do. Logging and confidence thresholds defined. |
| Data architecture for audit trail | **PASS** | Immutable approval log, LLM call log, conversation store specified. |
| Regulatory review complete | **FAIL** | No legal review conducted for automated WhatsApp communication. |
| Cost model validated | **FAIL** | WhatsApp API costs and LLM inference costs not modeled against expected volume. |

**Overall readiness: NOT READY for build.** Three FAIL criteria must be addressed before committing engineering resources. The conditional pass on technical feasibility requires a 2-week spike to validate LLM boundary enforcement in practice.

---

## Recommended Next Artifact

1. **User Research Brief** — Design and execute a 20-client survey on channel preferences and current pain points in event inquiry handling. This addresses the largest evidence gap (client adoption) and validates the core problem.

2. **Technical Spike: LLM Boundary Enforcement** — Build a minimal prototype that demonstrates: (a) intent classification with confidence-gated escalation, (b) template-only response phrasing with logging, (c) hard blocks on pricing/discount generation. Deliver a test report with accuracy metrics and failure modes.

3. **Cost Model** — Project WhatsApp API and LLM inference costs at 3 volume tiers (100, 500, 2000 inquiries/month). Include approval workflow staffing costs.

4. **Legal Review Request** — Submit regulatory review request for automated WhatsApp communication in target launch markets.

These four artifacts can be pursued in parallel. The PRD should not advance to engineering specification until all four are complete and the Pass/Fail criteria are re-evaluated.
