# Phase 1 PRD: Event Management Automation Platform

## Decision Frame

**Problem Statement:** Event management companies spend 60-70% of operator time on repetitive coordination tasks — venue availability checks, vendor follow-ups, client Q&A, and quote assembly — that could be automated. However, pricing commitments and contract terms carry financial and legal risk that demands human judgment.

**Decision to be made:** Should we build a Phase 1 platform consisting of (1) a WhatsApp-based client assistant, (2) an internal operator console, and (3) a human-in-the-loop approval gate for all pricing and commitment actions?

**Stakeholders:** Event operations managers, sales/pricing leads, end clients (via WhatsApp), engineering team.

**Phase 1 Scope Boundary:** This PRD covers only the first deployable slice — WhatsApp inquiry handling, internal console for operator workflow, and the approval gate. Phase 2 (vendor coordination, calendar optimization, payment integration) is explicitly out of scope.

### Strategic Context

The platform sits at the intersection of conversational AI and operational workflow. The core architectural bet is that LLM capabilities can handle natural-language client interactions while strict deterministic boundaries prevent the system from making financial commitments autonomously.

---

## Product Requirements

### 1. WhatsApp Client Assistant

**Purpose:** Handle inbound client inquiries, provide event information, collect requirements, and route pricing requests to human operators.

**Functional Requirements:**
- Accept inbound WhatsApp messages via Business API integration
- Parse client intent: event type, date, guest count, venue preferences, budget range
- Respond to factual queries (venue capacity, available dates, included services) from a deterministic knowledge base — NOT from LLM generation
- Collect structured intake forms through guided conversation flow
- Escalate to human operator when: (a) client asks for a price quote, (b) client requests contract terms, (c) client expresses dissatisfaction, (d) conversation exceeds 3 unresolved turns

**LLM Boundary Rules (WhatsApp):**
| Capability | LLM-Allowed | Deterministic-Only | Human-Required |
|---|---|---|---|
| Natural language understanding of client messages | ✅ | | |
| Rephrasing knowledge-base answers in conversational tone | ✅ | | |
| Retrieving venue/service facts | | ✅ | |
| Generating any price, discount, or cost figure | | | ✅ |
| Confirming booking dates or reservations | | | ✅ |
| Suggesting add-on services from approved catalog | | ✅ | |
| Handling complaints or refund requests | | | ✅ |

**Non-functional Requirements:**
- Response latency: < 5 seconds for knowledge-base queries, < 2 minutes for LLM-augmented responses
- Availability: 99.5% uptime during business hours (8am-10pm local)
- All conversations logged with full audit trail
- PII handling compliant with local data protection regulations

### 2. Internal Operator Console

**Purpose:** Provide operators with a unified dashboard to manage escalations, approve pricing, monitor automated conversations, and override assistant behavior.

**Functional Requirements:**
- Real-time feed of all active WhatsApp conversations with status indicators (automated / awaiting-approval / human-active)
- Approval queue: pending pricing quotes, booking confirmations, and contract terms requiring human sign-off
- One-click approve/reject/modify workflow for pricing proposals
- Conversation takeover: operator can seamlessly enter any WhatsApp thread, with the assistant stepping back and providing context summary
- Event pipeline view: intake → quoted → confirmed → delivered
- Configurable escalation rules (editable by ops managers, not requiring engineering changes)

**Non-functional Requirements:**
- Web-based (responsive, works on tablet for on-site use)
- Role-based access: operator, pricing-lead, admin
- Audit log for all approval/rejection actions with timestamps and operator ID

### 3. Human-in-the-Loop Approval Gate

**Purpose:** Ensure no pricing commitment, contractual term, or financial obligation is communicated to a client without explicit human approval.

**Architecture:**
- The approval gate is a **synchronous checkpoint** — the WhatsApp assistant cannot proceed past it. It does not suggest prices "pending approval." It tells the client: "Let me get that pricing detail for you — our team will follow up shortly."
- Approval requests are pushed to the console with: client context summary, requested services, suggested price range (from deterministic pricing engine, not LLM), and operator notes
- SLA target: 15-minute response time during business hours for approval queue items
- Timeout behavior: if no approval within 30 minutes, auto-notify client that a team member will reach out, and escalate internally

**What the gate blocks:**
1. Any message containing a dollar/currency amount directed to a client
2. Any date commitment for an event booking
3. Any contractual language (cancellation terms, liability clauses)
4. Any discount or promotional offer

**What the gate does NOT block:**
1. Factual information from the knowledge base
2. General service descriptions
3. Intake form collection
4. FAQ responses

### 4. Deterministic Boundary Enforcement

**Principle:** LLMs are used for language understanding and generation fluency. They are never the source of truth for facts, prices, or commitments.

**Implementation approach:**
- All factual responses are template-based with variable substitution from a structured database
- LLM is used only to: (a) classify intent from client messages, (b) select the appropriate template, (c) make the template response conversational in tone
- Output filtering layer scans all LLM-generated text before sending. Regex + rules engine blocks any message containing: currency symbols/amounts, date commitments in booking context, words like "confirmed," "guaranteed," "reserved," "locked in" when in commitment context
- Fallback: if the output filter flags a message, it is routed to the approval queue instead of sent

---

## Unknowns & Evidence Gaps

| ID | Unknown | Impact if Wrong | Mitigation |
|---|---|---|---|
| U-1 | Client adoption rate of WhatsApp channel vs. traditional email/phone | If low adoption, ROI of automation is minimal | Run 4-week pilot with 2-3 existing clients, measure channel preference and satisfaction |
| U-2 | Whether 15-minute approval SLA is achievable with current staffing | Slow approvals negate the speed benefit of automation | Instrument approval queue latency from day 1; staff 2 operators during pilot |
| U-3 | LLM output filter false-positive rate | High false-positive rate floods approval queue, defeating automation purpose | Benchmark filter against 500 synthetic conversations before launch; tune threshold |
| U-4 | WhatsApp Business API rate limits and cost at scale | May hit throughput ceiling or cost blowout with high-volume events | Model projected message volume against API tier pricing; start with mid-tier |
| U-5 | Whether deterministic template responses feel sufficiently natural | Robotic responses may drive clients to call instead | A/B test pure-template vs. LLM-polished-template with 50 conversations each |
| U-6 | Regulatory requirements for AI disclosure in client-facing chat | Some jurisdictions may require explicit bot disclosure | Legal review before pilot launch; build disclosure message toggle |

---

## Pass/Fail Readiness

### Phase 1 Launch Criteria (all must pass):

| # | Criterion | Measurement | Pass Threshold |
|---|---|---|---|
| P-1 | No pricing commitment sent without human approval | Audit log review of 100% of pricing-related messages | Zero unapproved pricing messages |
| P-2 | Output filter catches all commitment language | Red-team test with 200 adversarial prompts attempting to extract prices | ≥ 99.5% catch rate |
| P-3 | WhatsApp response latency for automated replies | p95 latency measurement over pilot period | < 5 seconds |
| P-4 | Approval queue SLA met | Median time-to-approval during business hours | < 15 minutes |
| P-5 | Client satisfaction with WhatsApp channel | Post-interaction survey (NPS or CSAT) | NPS ≥ 30 or CSAT ≥ 4.0/5.0 |
| P-6 | Zero hallucinated facts in client-facing messages | Manual review of 200 randomly sampled conversations | Zero instances of fabricated venue details, services, or policies |
| P-7 | Operator console usable without training | New operator completes 5 approval workflows unassisted | Task completion rate ≥ 90% |

### Fail conditions that block Phase 2:
- Any instance of autonomous pricing communication to a client
- LLM output filter bypass rate > 0.5%
- Client complaint rate about incorrect information > 2%

---

## Recommended Next Artifact

**Next artifact:** Technical Architecture Document (TAD)

**Rationale:** The most critical risk in this system is the deterministic boundary enforcement — ensuring the output filter and approval gate are architecturally sound, not just policy-level. The TAD should detail:

1. **Message pipeline architecture:** How client messages flow through intent classification → response generation → output filtering → approval gate → delivery, with failure modes at each stage
2. **Output filter specification:** Exact regex patterns, rules engine logic, and the escalation pathway when filters trigger
3. **WhatsApp Business API integration pattern:** Webhook handling, session management, media support, and rate limit handling
4. **Data model:** Conversation state, approval records, event pipeline stages, audit log schema
5. **LLM integration contract:** Which model, what prompts, what temperature settings, what token limits — frozen for Phase 1 (no dynamic prompt engineering)

**After TAD:** Wireframes for the operator console, then a 4-week pilot plan with success metrics tied to the Pass/Fail criteria above.
