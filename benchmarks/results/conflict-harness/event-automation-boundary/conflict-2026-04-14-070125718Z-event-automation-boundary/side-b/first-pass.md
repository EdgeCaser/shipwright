# Phase 1 PRD: Event Management Automation Platform

## Decision Frame

### Problem Statement
Event management companies operate in a high-touch, high-variance environment where coordinators juggle vendor communications, client requests, pricing negotiations, and logistics across dozens of concurrent events. The communication burden — particularly via WhatsApp, which dominates client-vendor interaction in most markets — creates bottlenecks that limit throughput per coordinator.

### Decision to Be Made
Should we build a Phase 1 event automation platform that introduces a WhatsApp-based AI assistant for structured interactions, an internal operations console, and a human-approval gate for all pricing and financial commitments?

### Strategic Context
- **Target user:** Event coordinators at mid-size agencies (10-50 events/month)
- **Core bet:** Automating structured communications (availability checks, logistics confirmations, FAQ responses) frees coordinator capacity without introducing pricing or commitment risk
- **Phase 1 boundary:** LLM usage is restricted to narrow, deterministic tasks with explicit fallback to human handoff; no autonomous pricing, no autonomous commitment-making

### Success Criteria for Phase 1
| Metric | Target | Measurement |
|--------|--------|-------------|
| Coordinator messages handled without manual intervention | ≥40% of inbound WhatsApp volume | Message classification logs |
| Time-to-first-response for client inquiries | <2 minutes (from >15 min baseline) | WhatsApp API timestamps |
| Pricing commitment errors | Zero autonomous pricing decisions | Approval gate audit log |
| Coordinator adoption | ≥80% of team using console daily by week 4 | Login/session analytics |

---

## Product Scope

### Component 1: WhatsApp Assistant

**What it does:**
- Receives inbound messages from clients and vendors via WhatsApp Business API
- Classifies intent into a fixed taxonomy: availability inquiry, logistics question, pricing request, general FAQ, escalation
- Responds autonomously ONLY for deterministic categories (FAQ, availability status from database, logistics confirmations already approved)
- Routes all pricing inquiries, novel requests, and ambiguous messages to human coordinator via internal console

**LLM Boundary Rules:**
1. **Deterministic responses only:** LLM generates natural-language wrappers around structured data (e.g., "Venue X is available on March 15" from a database lookup). The LLM never generates facts, prices, or commitments from its own knowledge.
2. **Template-bounded generation:** All LLM outputs are constrained to approved response templates with variable slots filled from verified data sources.
3. **Classification confidence threshold:** Messages with intent classification confidence <0.85 are routed to human review. No silent failures.
4. **No memory across conversations:** Each message thread is stateless from the LLM's perspective. Context is maintained in structured session state, not in LLM context windows.
5. **Audit trail:** Every LLM invocation is logged with input, output, template used, confidence score, and data sources referenced.

### Component 2: Internal Operations Console

**What it does:**
- Dashboard showing all active conversations, flagged items requiring approval, and event status
- Approval queue for pricing commitments, custom requests, and escalated messages
- Override capability: coordinators can edit any AI-drafted response before it sends
- Conversation history with full audit trail of AI vs. human actions

**Key Design Decisions:**
- Approval queue uses a pull model (coordinators claim items) not push (auto-assigned) — avoids notification fatigue in Phase 1
- SLA timers on queued items: visual escalation at 5 min, manager alert at 15 min
- Console is web-based, mobile-responsive — coordinators are rarely at desks

### Component 3: Human Approval Gate

**What it does:**
- ALL messages containing pricing, discounts, contractual terms, or financial commitments require explicit human approval before sending
- Gate is implemented as a hard system constraint, not a prompt instruction — the WhatsApp send API is blocked for flagged categories without approval token
- Approval is binary (approve/reject/edit) with mandatory edit capability
- Batch approval supported for routine confirmations (e.g., standard package pricing from approved rate card)

**Classification of Gated vs. Ungated Actions:**

| Action | Gate Required | Rationale |
|--------|--------------|----------|
| Confirm venue availability | No | Database lookup, no commitment |
| Share standard FAQ answer | No | Pre-approved content |
| Quote a price | **Yes** | Financial commitment |
| Offer a discount | **Yes** | Margin impact |
| Confirm a booking | **Yes** | Contractual commitment |
| Suggest alternative dates | No | Informational, no commitment |
| Respond to complaint | **Yes** | Reputational risk |

---

## Architecture Constraints

### LLM Usage Boundaries (Non-Negotiable)
1. **No autonomous decision-making:** LLM is a text transformation layer, not a decision-maker. All decisions come from deterministic logic, database lookups, or human approval.
2. **No training on customer data:** Customer conversations are not used to fine-tune models. LLM operates via API with no data retention.
3. **Provider-agnostic integration:** LLM accessed via abstraction layer supporting provider swap without application changes.
4. **Fallback to static responses:** If LLM service is unavailable, system falls back to template responses without natural-language wrapping. Degraded but functional.
5. **Rate limiting:** Maximum LLM calls per conversation capped at 10. Beyond that, mandatory human handoff.

### Data & Privacy
- WhatsApp Business API compliance required (Meta-approved BSP)
- Customer PII stored in encrypted database, never passed to LLM beyond current message context
- GDPR/local privacy law compliance for data retention and deletion
- All conversation logs retained for 12 months for audit, then anonymized

### Integration Points
- WhatsApp Business API (via approved BSP)
- Existing venue/vendor database (read-only in Phase 1)
- Calendar/scheduling system (read-only in Phase 1)
- Payment system: NOT integrated in Phase 1 (all payment actions remain fully manual)

---

## Unknowns & Evidence Gaps

| Unknown | Impact | How We'd Resolve | Priority |
|---------|--------|-------------------|----------|
| What % of inbound messages are actually automatable with deterministic responses? | Determines ROI of Phase 1 — if <20%, value proposition is weak | Classify 500 historical WhatsApp messages against proposed taxonomy | **P0 — must resolve before build** |
| Will coordinators trust AI-drafted responses enough to approve without re-reading every word? | If they re-read everything, time savings collapse | Prototype approval flow with 5 coordinators, measure edit rate and time-per-approval | P0 |
| What is acceptable response latency for WhatsApp users in this domain? | Shapes architecture decisions around sync vs. async LLM calls | Survey 20 clients on response time expectations | P1 |
| How does WhatsApp Business API handle rate limits under concurrent event load? | Could throttle responses during peak periods | Load test with BSP sandbox at 10x expected volume | P1 |
| Do coordinators need mobile-native app or is mobile web sufficient? | Build cost difference is significant | Observe 3 coordinators' device usage patterns for 1 week | P2 |
| What is the false positive rate of the pricing-detection classifier? | High false positives = approval queue overload = coordinator fatigue | Benchmark classifier against labeled message dataset before launch | P0 |

---

## Pass/Fail Readiness

### Pass Criteria (All Must Be True for Phase 1 Launch)
- [ ] Message classification accuracy ≥90% on test set of 500+ labeled messages
- [ ] Pricing detection recall ≥99% (miss rate <1% — false negatives are unacceptable for financial commitments)
- [ ] Human approval gate is a hard system constraint, verified by security review (not bypassable via prompt manipulation or API call)
- [ ] End-to-end response latency <5 seconds for ungated responses
- [ ] Approval queue latency <30 seconds (time from flag to coordinator visibility)
- [ ] WhatsApp Business API compliance certification obtained
- [ ] Data privacy review completed and documented
- [ ] Fallback mode (LLM unavailable) tested and functional
- [ ] Coordinator training completed with ≥80% proficiency on approval workflow

### Fail Criteria (Any One Triggers Phase 1 Reassessment)
- Pricing detection recall <95% in testing
- Coordinator edit rate >60% on AI-drafted responses (indicates poor response quality)
- Message classification feasibility study shows <25% of messages are automatable
- WhatsApp Business API costs exceed $0.15/conversation (margin constraint)
- Security review identifies bypass path for approval gate

---

## Risks & Mitigations

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| LLM generates plausible but incorrect information in response | High | Medium | Template-bounded generation + audit logging + deterministic data sourcing |
| Coordinator approval fatigue leads to rubber-stamping | High | High | Batch approval for routine items, SLA alerts, weekly audit of approved vs. edited |
| WhatsApp API policy changes restrict bot usage | High | Low | Maintain fallback SMS channel, abstract messaging layer |
| Client negative reaction to "talking to a bot" | Medium | Medium | No bot disclosure unless asked; responses styled to match coordinator tone; instant human escalation path |
| Scope creep into autonomous pricing | High | Medium | Hard system gate (not prompt-level); approval bypass requires code deployment, not configuration change |

---

## Recommended Next Artifact

**Immediate next step:** Message Classification Feasibility Study

Before committing to build, resolve the P0 unknown: classify 500 historical WhatsApp messages against the proposed intent taxonomy. This study will produce:
1. Distribution of message types (% automatable vs. requiring human judgment)
2. Baseline difficulty assessment for intent classification
3. Sample set for pricing-detection classifier benchmarking
4. Go/no-go recommendation for Phase 1 build

**If feasibility study passes:** Technical Design Document covering WhatsApp API integration architecture, LLM abstraction layer, approval gate implementation, and console wireframes.

**If feasibility study fails:** Pivot assessment — either narrow scope to specific message types with higher automation rate, or reframe as coordinator-assist tool (draft suggestions only, no autonomous sending).

---

## Out of Scope for Phase 1
- Payment processing or invoicing
- Multi-language support (English only in Phase 1)
- Vendor-facing automation (client-facing only)
- Event planning recommendations or suggestions
- Integration with social media channels beyond WhatsApp
- Autonomous booking confirmation (always requires human approval)
- Analytics dashboard beyond basic operational metrics
