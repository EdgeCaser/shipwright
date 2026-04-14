# Phase 1 PRD: Event Management Automation Platform

## Decision Frame

**Problem Statement:** Event management companies spend 60-70% of operator time on repetitive coordination tasks (venue availability checks, vendor follow-ups, client Q&A) that could be automated, but pricing commitments and contract terms require human judgment due to variable margins, relationship pricing, and legal liability.

**Decision to be made:** Should we build a Phase 1 platform consisting of (1) a WhatsApp-based client assistant, (2) an internal operator console, and (3) a human-in-the-loop approval system with strict deterministic boundaries around LLM usage?

**Stakeholders:** Event operations managers, sales/pricing leads, clients communicating via WhatsApp, engineering team.

**Success criteria for Phase 1:**
- Reduce operator time on routine inquiries by ≥40%
- Zero unauthorized pricing commitments (human approval rate = 100% for financial obligations)
- Client response time under 2 minutes for automatable queries
- Operator adoption ≥80% within 30 days of launch

**What this PRD does NOT cover:** Multi-channel expansion (email, SMS), payment processing, full contract generation, or autonomous pricing.

---

## Product Overview

### System Architecture: Three Components

#### 1. WhatsApp Client Assistant
- **Scope:** Handles inbound client messages via WhatsApp Business API
- **LLM boundary (deterministic):** The LLM may ONLY perform:
  - Intent classification (map message → one of N predefined intents)
  - Entity extraction (dates, guest counts, venue names)
  - Response generation from approved templates with extracted slot fills
- **LLM boundary (prohibited):** The LLM may NEVER:
  - Generate, confirm, or imply pricing, discounts, or financial terms
  - Commit to availability, dates, or resource allocation
  - Modify contract language or terms
  - Respond to queries outside the defined intent taxonomy without escalation
- **Escalation trigger:** Any message classified as pricing-adjacent, contractual, or low-confidence (below 0.85 intent threshold) routes to human operator via the internal console
- **Defense-in-depth safeguard (fail-closed):** The pricing boundary is enforced through multiple independent layers, no single one of which is considered sufficient alone:
  1. **Intent classifier gate:** Messages classified as pricing-adjacent never enter the auto-response path
  2. **Deterministic post-processor:** Rule-based pattern matching scans all LLM outputs for currency symbols, percentage signs, commitment language ("confirmed", "guaranteed", "locked in"), and package-inclusion language — blocks any response containing these before delivery
  3. **Template constraint:** Auto-responses are restricted to approved templates with slot fills; freeform generation is prohibited, limiting the surface area for implied commitments
  4. **Fail-closed default:** If any layer is uncertain or encounters an unrecognized pattern, the message escalates to a human operator rather than being delivered
- **Known limitation:** Pattern matching alone does not cover implied pricing (e.g., "that's included"), paraphrases, multilingual messages, or availability statements that create financial obligation without explicit price terms. This is why the multi-layer approach and fail-closed default are essential. Discovery must include a bypass analysis (see U7) to validate coverage before launch.

#### 2. Internal Operator Console
- **Purpose:** Single pane for operators to manage escalations, approve/reject LLM-drafted responses, and monitor automation performance
- **Features:**
  - Escalation queue with priority ranking (pricing > availability > general)
  - Side-by-side view: client message + LLM-suggested response + edit capability
  - One-click approve/reject/edit workflow for escalated messages
  - Audit log of all automated and human-approved responses
  - Real-time dashboard: automation rate, escalation rate, response times
- **Access control:** Role-based — operators can approve general queries, pricing leads approve financial commitments, managers have full access

#### 3. Human Approval System for Pricing Commitments
- **Trigger:** Any interaction involving pricing, discounts, package customization, or financial terms
- **Workflow:**
  1. LLM drafts response with pricing data pulled from deterministic pricing database (not generated)
  2. Draft flagged and routed to pricing-authorized operator
  3. Operator reviews, modifies if needed, approves
  4. Only approved response sent to client
  5. All approvals logged with operator ID, timestamp, original draft, and final sent version
- **SLA:** Pricing approvals must be completed within 15 minutes during business hours
- **Failsafe:** If no approval within SLA, client receives acknowledgment message ("We're preparing your custom quote — you'll hear back within [X]") rather than silence

### LLM Boundary Specification

| Layer | Deterministic | LLM-Assisted | Human Required |
|-------|--------------|---------------|----------------|
| Intent classification | Fallback rules for top-5 intents | Primary classifier | Ambiguous/novel intents |
| Entity extraction | Regex for dates, numbers | NER for complex entities | Validation of extracted entities |
| Response generation | Template selection + slot filling | Natural language polish within template | Pricing, commitments, exceptions |
| Pricing lookup | Database query only | Never | Approval of quoted price |
| Availability check | Calendar API query | Never | Confirmation of holds/bookings |
| Escalation routing | Rule-based priority | Suggested priority | Override capability |

**Monitoring:** All LLM calls logged with input, output, latency, confidence score, and whether post-processor modified/blocked the output. Weekly review of blocked outputs to tune intent taxonomy and templates.

---

## Unknowns & Evidence Gaps

| ID | Unknown | Impact | Mitigation | Status |
|----|---------|--------|------------|--------|
| U1 | Client WhatsApp message volume and intent distribution — we lack baseline data on what clients actually ask | High — determines automation coverage and ROI | Run 2-week message audit on existing WhatsApp threads to build intent taxonomy | **Not started** |
| U2 | Operator willingness to trust and use the console vs. continuing manual WhatsApp replies | High — adoption failure kills the product | Conduct 5 operator interviews on current pain points and workflow preferences | **Not started** |
| U3 | LLM intent classification accuracy on domain-specific event management language | Medium — low accuracy increases escalation rate, reducing value | Build 200-message labeled test set from historical conversations, benchmark classifier | **Not started** |
| U4 | Pricing approval SLA feasibility — can pricing leads respond within 15 minutes consistently? | Medium — SLA misses degrade client experience | Analyze current pricing response times from existing workflow | **Not started** |
| U5 | WhatsApp Business API rate limits and template approval timelines | Low-Medium — may constrain response speed and template variety | Review Meta documentation and request sandbox access | **Not started** |
| U6 | Client sentiment toward automated responses vs. human touch in event planning | Medium — events are high-emotion purchases, automation may feel impersonal | Include sentiment question in client survey or A/B test human vs. assisted responses | **Not started** |
| U7 | Post-processor bypass rate — can implied pricing, multilingual messages, paraphrases, or availability-as-commitment language evade the pattern-matching layer? | High — a porous filter undermines the core safety boundary | Build adversarial test set (≥50 examples including implied pricing, multilingual, edge cases); measure bypass rate against full defense-in-depth stack; require <1% bypass rate before launch | **Not started** |

---

## Pass/Fail Readiness

**Verdict: NOT READY to build. Ready to validate.**

Phase 1 has a sound architecture, but seven critical unknowns remain unvalidated. Building now risks:

1. **Building the wrong intent taxonomy** (U1) — without message audit data, we'd guess at what to automate
2. **Building for operators who won't adopt** (U2) — console design without operator input risks shelf-ware
3. **Overestimating automation rate** (U3) — if classifier accuracy is below 80%, escalation volume makes the system a net burden
4. **Deploying a porous safety boundary** (U7) — without adversarial testing of the full defense-in-depth stack, the pricing commitment safeguard is an assertion, not a validated control

**Pass conditions to proceed to build:**
- [ ] U1 resolved: Intent taxonomy built from ≥500 real messages, covering ≥80% of volume
- [ ] U2 resolved: ≥4/5 operators confirm they would use the console workflow in interviews
- [ ] U3 resolved: Classifier achieves ≥85% accuracy on labeled test set
- [ ] U4 resolved: Current pricing response time data shows 15-min SLA is feasible or SLA is adjusted
- [ ] U7 resolved: Adversarial test set demonstrates <1% bypass rate across full defense-in-depth stack, or explicit fail-closed policy verified to catch residual bypasses

---

## Recommended Next Artifact

**Next artifact: Discovery Brief** containing:
1. **Message audit results** — intent taxonomy with frequency distribution from 2-week WhatsApp history analysis
2. **Operator interview synthesis** — pain points, workflow preferences, adoption signals/blockers
3. **Classifier benchmark** — accuracy metrics on labeled test set with error analysis
4. **Pricing response time baseline** — current-state data to validate or adjust SLA
5. **Pricing boundary bypass analysis** — adversarial test results against the defense-in-depth stack, with bypass rate and failure mode catalog

**Timeline:** 2-3 weeks for discovery sprint

**After discovery, if pass conditions met:** Proceed to Technical Design Document specifying WhatsApp Business API integration, LLM service architecture with defense-in-depth post-processor, console UI wireframes, and approval workflow state machine.

**If pass conditions not met:** Revisit scope — consider starting with internal-only console (no WhatsApp automation) as a lower-risk Phase 0.
