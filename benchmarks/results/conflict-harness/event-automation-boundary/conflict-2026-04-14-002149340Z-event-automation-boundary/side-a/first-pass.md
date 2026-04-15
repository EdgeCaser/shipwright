# Phase 1 PRD: Event Management Automation Platform

## Decision Frame

**Problem statement:** Event management companies spend 60-80% of operator time on repetitive coordination tasks (venue availability queries, vendor follow-ups, client pricing discussions) that could be partially automated. However, pricing commitments and contract terms carry financial and legal risk that cannot be delegated to non-deterministic systems.

**Decision to be made:** Should we build a Phase 1 platform combining a WhatsApp-based client assistant, an internal operations console, and strict human-in-the-loop gates for all pricing and commitment actions?

**Scope boundary:** Phase 1 covers inquiry handling, availability lookup, and quote preparation workflows only. It does NOT cover payment processing, contract execution, post-event operations, or multi-tenant white-labeling.

**Key stakeholders:** Event operations managers (primary users), clients (WhatsApp end-users), finance/legal (approval authority for pricing), engineering (build team).

---

## Product Overview

### WhatsApp Assistant (Client-Facing)

**Purpose:** Handle inbound client inquiries, collect event requirements, and surface availability — without making any pricing or commitment statements.

**Deterministic boundary rules:**
- The LLM is used ONLY for natural language understanding (intent classification, entity extraction) and response generation from approved templates.
- The LLM NEVER generates pricing figures, discount offers, or availability confirmations autonomously.
- All LLM outputs pass through a deterministic output filter that blocks any message containing currency symbols, percentage discounts, or commitment language ("confirmed", "reserved", "guaranteed") unless the message originates from an operator-approved template.
- Fallback: Any message the filter cannot classify with >95% confidence routes to a human operator queue.

**Conversation flows (Phase 1):**
1. **Inquiry intake:** Collect event type, date range, estimated headcount, location preference, budget range.
2. **Availability check:** Query internal calendar database (deterministic), return available slots.
3. **Quote request:** Compile requirements into structured brief, push to internal console for operator pricing.
4. **Status check:** Client asks about pending quotes — system returns status from database, no LLM inference needed.

### Internal Operations Console

**Purpose:** Operator dashboard for managing inquiries, preparing quotes, and approving all client-facing pricing.

**Core features (Phase 1):**
- **Inquiry queue:** All WhatsApp conversations requiring human action, sorted by priority (date proximity, estimated deal size).
- **Quote builder:** Operator selects venue/vendor/service line items from catalog, system calculates total. No LLM involvement in price calculation.
- **Approval workflow:** Two-step approval for quotes above configurable threshold (default: $5,000). Operator prepares → Manager approves → System sends via WhatsApp.
- **Conversation monitor:** Real-time view of all active WhatsApp threads with ability to intervene, override, or take over from the assistant.
- **Audit log:** Every message sent to a client, every price quoted, every approval decision — immutable, timestamped, attributed to a human approver.

### LLM Usage Boundaries (Architecture Decision Record)

| Layer | LLM Role | Deterministic Gate |
|---|---|---|
| Intent classification | Classify inbound message intent | Confidence threshold ≥0.95; below routes to human |
| Entity extraction | Extract dates, headcount, preferences | Extracted values displayed to operator for confirmation before use |
| Response generation | Draft natural-language replies from templates | Output filter scans for prohibited patterns; blocked messages queue for human review |
| Price calculation | **PROHIBITED** | All pricing from catalog database + operator input only |
| Commitment language | **PROHIBITED** | Output filter hard-blocks commitment vocabulary |
| Contract/legal text | **PROHIBITED** | Out of Phase 1 scope entirely |

**Failure mode design:**
- LLM service unavailable → System sends canned "We've received your message, a team member will respond shortly" and routes to human queue.
- Output filter flags message → Message held, operator notified, must manually approve or rewrite.
- Ambiguous intent → Route to human with LLM's best-guess annotation for operator context.

---

## Unknowns & Evidence Gaps

| ID | Unknown | Impact | Mitigation |
|---|---|---|---|
| U1 | Client adoption rate for WhatsApp business interactions in target market | High — determines channel viability | Pre-launch survey of 50 existing clients; track opt-in rate in first 30 days |
| U2 | False positive rate of output filter blocking legitimate operator-approved messages | Medium — too aggressive = operator fatigue | Tune filter on 500+ historical message corpus before launch; track block rate weekly |
| U3 | Operator time savings vs. current workflow | High — core value proposition | Baseline current task times; measure post-launch with same operators |
| U4 | LLM intent classification accuracy on domain-specific event management language | Medium — affects routing quality | Fine-tune or prompt-engineer on labeled dataset of 1,000+ real inquiries |
| U5 | Legal/compliance requirements for automated messaging in target jurisdictions | High — could block launch | Legal review of WhatsApp Business API ToS + local consumer protection laws before build |
| U6 | Whether two-step approval flow adds unacceptable latency to quote turnaround | Medium — could reduce client satisfaction | Measure current quote turnaround baseline; set SLA target (e.g., <2 hours during business hours) |

---

## Pass/Fail Readiness

### Pass criteria (all must be met for Phase 1 launch):
- [ ] **Zero autonomous pricing:** No path exists in code where an LLM output directly sets or communicates a price to a client without human approval. Verified by security audit.
- [ ] **Output filter coverage:** Filter catches 100% of prohibited patterns in test corpus of 1,000 adversarial messages.
- [ ] **Fallback reliability:** When LLM service is down, 100% of inbound messages receive canned response within 5 seconds and route to human queue.
- [ ] **Audit completeness:** Every client-facing message traceable to either an approved template or a named human operator in audit log.
- [ ] **Operator adoption:** ≥3 operators complete training and process ≥10 real inquiries each in supervised pilot.
- [ ] **Legal sign-off:** Written approval from legal on WhatsApp messaging compliance for target market.

### Fail criteria (any triggers stop/pivot):
- [ ] Output filter bypass discovered in adversarial testing → halt launch, redesign filter architecture.
- [ ] LLM intent classification accuracy <80% on real messages after tuning → revert to rule-based routing for Phase 1.
- [ ] Client opt-in rate <20% in pilot → re-evaluate channel choice before scaling.
- [ ] Operator quote turnaround exceeds current baseline → approval workflow needs redesign.

---

## Recommended Next Artifact

**Technical Design Document** covering:
1. WhatsApp Business API integration architecture (webhook handling, session management, message queuing).
2. Output filter specification — exact prohibited pattern list, regex/rule engine vs. classifier approach, update mechanism.
3. LLM integration contract — model selection criteria, prompt templates, confidence scoring methodology, latency budget.
4. Internal console wireframes and API contracts.
5. Audit log schema and retention policy.

**Followed by:** Pilot plan defining target client cohort (10-20 clients), success metrics, 4-week timeline, and rollback triggers.
