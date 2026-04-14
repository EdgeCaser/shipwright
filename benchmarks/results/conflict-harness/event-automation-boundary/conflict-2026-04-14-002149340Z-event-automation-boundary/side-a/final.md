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
- All LLM outputs pass through a layered output gate (see Output Gate Architecture below) before reaching clients.
- Fallback: Any message the gate cannot classify with >95% confidence routes to a human operator queue.

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
| Response generation | Draft natural-language replies from approved template set | Output gate (layered — see below); blocked messages queue for human review |
| Price calculation | **PROHIBITED** | All pricing from catalog database + operator input only |
| Commitment language | **PROHIBITED** | Output gate hard-blocks; allowlist-only architecture prevents bypass |
| Contract/legal text | **PROHIBITED** | Out of Phase 1 scope entirely |

### Output Gate Architecture

The output gate uses a **default-deny, allowlist-based** design rather than relying solely on a blocklist of prohibited patterns.

**Layer 1 — Structural allowlist:** Every client-facing message must instantiate a registered response template. The LLM may fill variable slots (dates, venue names, headcount) but cannot introduce free-text outside the template skeleton. Messages that do not match a known template are rejected.

**Layer 2 — Pattern blocklist (defense-in-depth):** Even within approved templates, a regex + keyword scanner blocks messages containing:
- Currency symbols, numeric price patterns, and written-out price expressions (e.g., "five hundred dollars", "2K per head").
- Commitment vocabulary including synonyms and softer variants ("confirmed", "reserved", "guaranteed", "locked in", "penciled in", "held for you", "set aside").
- Discount/offer language ("special rate", "we can do", "I'll give you").

**Layer 3 — Semantic classifier (post-launch hardening):** A lightweight classifier trained on labeled examples of pricing/commitment language, including indirect and paraphrased expressions. This layer is NOT a launch gate but is scheduled for deployment within 30 days of launch to catch evasion patterns that regex cannot.

**Template governance:** New templates require engineering review and QA sign-off. Operators cannot create or modify templates directly — this prevents the approved-template path from becoming a bypass vector.

**Monitoring commitment:** Filter block rate, false positive rate, and a weekly random sample of 50 passed messages are reviewed by an operator to detect drift. Any novel evasion pattern discovered feeds back into Layers 2 and 3.

**Failure mode design:**
- LLM service unavailable → System sends canned "We've received your message, a team member will respond shortly" and routes to human queue.
- Output gate flags message → Message held, operator notified, must manually approve or rewrite.
- Ambiguous intent → Route to human with LLM's best-guess annotation for operator context.

---

## Unknowns & Evidence Gaps

| ID | Unknown | Impact | Mitigation |
|---|---|---|---|
| U1 | Client adoption rate for WhatsApp business interactions in target market | High — determines channel viability | Pre-launch survey of 50 existing clients; track opt-in rate in first 30 days |
| U2 | False positive rate of output gate blocking legitimate operator-approved messages | Medium — too aggressive = operator fatigue | Tune on 500+ historical message corpus before launch; track block rate weekly; review 50 passed messages/week for false negatives |
| U3 | Operator time savings vs. current workflow | High — core value proposition | Baseline current task times; measure post-launch with same operators |
| U4 | LLM intent classification accuracy on domain-specific event management language | Medium — affects routing quality | Fine-tune or prompt-engineer on labeled dataset of 1,000+ real inquiries |
| U5 | Legal/compliance requirements for automated messaging in target jurisdictions | High — could block launch | Legal review of WhatsApp Business API ToS + local consumer protection laws before build |
| U6 | Whether two-step approval flow adds unacceptable latency to quote turnaround | Medium — could reduce client satisfaction | Measure current quote turnaround baseline; set SLA target (e.g., <2 hours during business hours) |
| U7 | Coverage gap between regex blocklist and real-world pricing/commitment language | Medium — indirect or novel phrasing may evade pattern matching | Layer 3 semantic classifier scheduled for 30-day post-launch deployment; weekly human review of passed messages to detect evasion patterns pre-classifier |

---

## Pass/Fail Readiness

### Pass criteria (all must be met for Phase 1 launch):
- [ ] **Zero autonomous pricing:** No path exists in code where an LLM output directly sets or communicates a price to a client without human approval. Verified by security audit of all message-send code paths.
- [ ] **Allowlist-only messaging:** Every client-facing message traces to a registered response template. Free-text generation by the LLM cannot reach clients.
- [ ] **Blocklist baseline:** Layer 2 pattern blocklist catches ≥95% of prohibited patterns in a curated adversarial corpus of ≥1,000 messages including indirect pricing expressions and synonym variants. (Note: 100% static coverage is not achievable; residual risk is mitigated by Layer 1 allowlist and post-launch Layer 3 classifier.)
- [ ] **Fallback reliability:** When LLM service is down, 100% of inbound messages receive canned response within 5 seconds and route to human queue.
- [ ] **Audit completeness:** Every client-facing message traceable to either an approved template or a named human operator in audit log.
- [ ] **Operator adoption:** ≥3 operators complete training and process ≥10 real inquiries each in supervised pilot.
- [ ] **Legal sign-off:** Written approval from legal on WhatsApp messaging compliance for target market.
- [ ] **Template governance process:** Documented review and QA sign-off procedure for new/modified response templates.

### Fail criteria (any triggers stop/pivot):
- [ ] Allowlist bypass discovered — any code path allows LLM free-text to reach a client → halt launch, close the path.
- [ ] LLM intent classification accuracy <80% on real messages after tuning → revert to rule-based routing for Phase 1.
- [ ] Client opt-in rate <20% in pilot → re-evaluate channel choice before scaling.
- [ ] Operator quote turnaround exceeds current baseline → approval workflow needs redesign.

---

## Recommended Next Artifact

**Technical Design Document** covering:
1. WhatsApp Business API integration architecture (webhook handling, session management, message queuing).
2. Output gate specification — Layer 1 template allowlist schema, Layer 2 prohibited pattern inventory (including indirect/synonym coverage), Layer 3 classifier training plan and deployment timeline.
3. Template governance process — creation, review, QA, and deployment lifecycle.
4. LLM integration contract — model selection criteria, prompt templates, confidence scoring methodology, latency budget.
5. Internal console wireframes and API contracts.
6. Audit log schema and retention policy.

**Followed by:** Pilot plan defining target client cohort (10-20 clients), success metrics, 4-week timeline, and rollback triggers.
