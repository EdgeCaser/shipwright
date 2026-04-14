# Phase 1 PRD: Event Management Automation Platform

## Decision Frame

### Problem Statement
Event management companies spend 60-80% of operator time on repetitive coordination tasks — venue availability checks, vendor follow-ups, client Q&A, and pricing lookups — that could be automated. However, pricing commitments, contract terms, and financial approvals carry material business risk that cannot be delegated to probabilistic systems.

### Decision Being Made
Should we build a Phase 1 event automation platform that uses an LLM-powered WhatsApp assistant for client-facing interactions and an internal console for operator workflow, with strict deterministic boundaries that require human approval for any pricing or financial commitment?

### Stakeholders
- **Event operators** (primary users): Need faster response times and reduced manual coordination burden
- **Clients** (end users via WhatsApp): Expect instant, accurate responses about availability, logistics, and pricing
- **Business owners**: Need confidence that no unauthorized pricing commitments are made
- **Finance/Legal**: Require audit trail for all commitments with financial implications

### Success Criteria for Phase 1
1. Reduce operator response time to client inquiries by ≥50%
2. Zero unauthorized pricing commitments (hard constraint, not a target)
3. ≥80% of routine inquiries (availability, logistics FAQ, timeline) handled without operator intervention
4. Full audit trail for every interaction that touches pricing or commitments

---

## Product Architecture

### Component 1: WhatsApp Assistant (Client-Facing)

**What it does:**
- Receives inbound client messages via WhatsApp Business API
- Answers routine questions: venue availability, event timelines, logistics FAQ, vendor catalogs
- Collects structured intake information for new event requests
- Escalates pricing/commitment questions to human operators with full context summary

**LLM Boundary Rules — Proposed Design (Requires Validation):**

The following boundary architecture is a design hypothesis, not a proven solution. The validation sprint must empirically test whether these mechanisms achieve acceptable precision and recall in real event-planning conversations before any build commitment.

| Category | LLM Allowed? | Boundary Enforcement |
|----------|-------------|---------------------|
| Availability lookup | Yes — reads from calendar DB | Deterministic: queries structured database, LLM formats response only |
| Logistics FAQ | Yes — retrieves from approved answer bank | Deterministic: retrieval from curated content, LLM selects and formats |
| Pricing quote | **No** — escalates to human | Hard gate: any message classified as pricing-related routes to operator queue |
| Contract terms | **No** — escalates to human | Hard gate: keyword + intent classifier with allowlist-only pass-through |
| New event intake | Yes — structured form collection | Deterministic: LLM extracts fields into validated schema, operator reviews before confirmation |
| Vendor recommendations | Yes — from approved vendor list only | Deterministic: LLM selects from pre-approved catalog, no external suggestions |

**Classification Architecture — Design Hypothesis:**
- Two-layer classification: keyword allowlist (fast path) + intent classifier (catch-all)
- Default-deny: if classification confidence falls below a threshold (initial candidate: 0.95), route to human. **Note:** The 0.95 threshold is an initial design parameter, not an empirically validated value. The validation sprint must test multiple thresholds against labeled data to find the optimal precision/recall trade-off — the production threshold should be set based on the ROC curve where pricing-class recall meets the ≥99% target.
- Pricing-adjacent terms trigger escalation regardless of confidence (e.g., "cost", "price", "budget", "discount", "deal", "rate", "fee", "charge", "payment", "invoice")
- All LLM outputs pass through a deterministic output validator before delivery

**Known Limitations of This Approach:**
- **Implicit pricing references:** Clients may discuss pricing without using obvious keywords (e.g., "Is that the best you can do?", "What if we cut the guest list in half?", "Can you work with our budget?"). Keyword allowlists alone will miss these. The intent classifier layer must catch them, but its effectiveness on implicit/paraphrased pricing language is unproven.
- **Context-dependent commitments:** A message like "That works for us" could be a casual acknowledgment or a binding acceptance depending on conversation context. Single-message classification may be insufficient; conversation-level state tracking may be required.
- **Multilingual and code-switching:** Phase 1 scopes to English only, but real WhatsApp conversations in event planning frequently include code-switching. The validation sprint should document the prevalence of non-English pricing discussions in the partner company's data.
- **Output validator coverage:** Regex and keyword scanners catch explicit pricing language but may miss semantically equivalent phrasings ("we'll take care of the difference", "consider it included"). Adversarial testing during validation must specifically target these oblique commitment patterns.

These limitations mean the safety architecture is a layered defense with known gaps. The design principle is that any single layer may fail, but the combination of keyword gate + intent classifier + output validator + human escalation on uncertainty should reduce risk to an acceptable level. **This claim requires empirical validation before it can be treated as a design commitment.**

### Component 2: Internal Console (Operator-Facing)

**What it does:**
- Dashboard showing all active client conversations with escalation status
- Approval queue for pricing commitments, contract terms, and new event confirmations
- One-click approve/reject/modify for escalated items
- Operator can inject responses directly into WhatsApp thread
- Event pipeline view: intake → pricing → confirmed → in-progress → completed

**Key Workflows:**
1. **Pricing Approval Flow:** Client asks about pricing → WhatsApp assistant escalates with context → Operator sees request in queue with suggested response (from price book) → Operator approves, modifies, or rejects → Approved response sent to client with audit log entry
2. **Event Intake Flow:** Assistant collects requirements → Structured data appears in console → Operator reviews and assigns → Confirmation sent only after operator approval
3. **Escalation Flow:** Any unclassifiable or low-confidence message → Operator notification → Manual response with optional template assistance

### Component 3: Human-in-the-Loop Approval System

**Design Principles:**
- **Fail-safe, not fail-open:** System halts and escalates on uncertainty; never guesses on financial matters
- **Approval is atomic:** Each pricing commitment requires its own approval; no batch-approve for financial items
- **Audit-complete:** Every approval records: who approved, what was approved, timestamp, original client request, and any modifications
- **Time-bounded escalation:** If no operator responds within configurable SLA (default: 15 minutes during business hours), client receives acknowledgment message with ETA, not an automated answer

**Approval Categories:**

| Action | Approval Required | Approver |
|--------|------------------|----------|
| Send availability info | No | Automated |
| Send logistics FAQ | No | Automated |
| Send pricing quote | **Yes** | Event operator |
| Confirm event booking | **Yes** | Event operator + manager (if >threshold) |
| Offer discount/special terms | **Yes** | Manager only |
| Modify existing commitment | **Yes** | Original approver + manager |

---

## Technical Boundaries: LLM vs. Deterministic

### Where LLM is Used (and Constrained)
1. **Natural language understanding:** Parsing client messages into structured intents — constrained by confidence thresholds and default-deny routing
2. **Response generation:** Formatting approved content into natural conversational responses — constrained by template validation and output filtering
3. **Context summarization:** Summarizing conversation history for operator handoff — internal use only, never client-facing without review
4. **Intake extraction:** Pulling structured fields (date, guest count, venue preferences) from free-text — validated against schema before storage

### Where LLM is NOT Used (Deterministic Only)
1. **Price calculation:** Looked up from price book database; arithmetic done deterministically
2. **Availability checking:** Direct calendar/inventory database query
3. **Commitment language:** All commitment-bearing messages use approved templates with variable substitution, not LLM generation
4. **Escalation routing:** Rule-based classifier with keyword allowlists; LLM confidence is a secondary signal, not the decision-maker
5. **Approval workflow:** State machine with explicit transitions; no LLM involvement in approval logic

### Output Validation Layer
Every LLM-generated client-facing message passes through:
1. **Pricing term scanner:** Regex + keyword scan for any price, currency, discount, or commitment language
2. **Commitment language detector:** Scans for binding phrases ("we will", "guaranteed", "confirmed", "agreed")
3. **Approved content validator:** Checks factual claims against source database
4. If any validator flags content → message blocked, routed to operator queue

**Validator gap acknowledgment:** This layer catches explicit pricing and commitment language but has known blind spots on paraphrased, implicit, or context-dependent commitments (see Known Limitations above). The validation sprint adversarial testing must quantify this gap and determine whether additional mitigation (e.g., conversation-state tracking, secondary LLM-based review with separate approval) is required.

---

## Phase 1 Scope

### In Scope
- WhatsApp Business API integration (single business number)
- LLM-powered conversational assistant with deterministic boundaries
- Internal web console for operators (3-5 concurrent users)
- Human approval workflow for pricing and commitments
- Audit logging for all interactions and approvals
- Price book and FAQ content management
- Basic analytics: response times, escalation rates, approval turnaround

### Out of Scope (Phase 2+)
- Multi-channel support (email, web chat, SMS)
- Automated vendor coordination and procurement
- Client self-service portal
- Payment processing integration
- Multi-language support beyond English
- AI-suggested pricing (even as operator recommendations)
- Integration with external CRM/ERP systems

---

## Unknowns & Evidence Gaps

| Unknown | Impact | Mitigation | Priority |
|---------|--------|------------|----------|
| What percentage of client inquiries are pricing-related vs. routine? | Determines automation ROI — if 80% are pricing, the assistant handles only 20% autonomously | Instrument a 2-week sample of actual WhatsApp conversations from partner event company | **P0 — blocks scope confidence** |
| How accurate is intent classification for pricing-adjacent queries in event domain? | False negatives (missed pricing questions answered by LLM) create financial risk; false positives (over-escalation) create operator fatigue | Build classifier prototype, test against labeled dataset of 500+ real messages, measure precision/recall with emphasis on recall for pricing class | **P0 — blocks safety confidence** |
| Can the output validation layer catch implicit, paraphrased, and context-dependent pricing commitments? | Determines whether the layered safety architecture has acceptable residual risk or requires additional mitigation layers | Adversarial testing during validation sprint: construct 100+ oblique/implicit pricing scenarios and measure validator detection rate. If <95% detection, evaluate conversation-state tracking or secondary review mechanisms | **P0 — blocks safety architecture confidence** |
| What is the right confidence threshold for default-deny routing? | Too low: financial risk from missed escalations. Too high: operator fatigue from over-escalation, defeating automation ROI | Test multiple thresholds (0.85, 0.90, 0.95, 0.99) against labeled data during validation sprint. Select threshold from ROC curve where pricing recall ≥99% | **P0 — blocks classifier design** |
| What is the acceptable operator response SLA for escalated pricing questions? | Determines whether the human-in-the-loop model is viable during off-hours or high-volume periods | Interview 5+ event operators on current response patterns and client expectations | **P1 — affects UX design** |
| WhatsApp Business API rate limits and template approval timelines | May constrain response patterns or require pre-approved template library | Review Meta documentation and test with sandbox environment; identify template approval lead times | **P1 — affects timeline** |
| Client willingness to interact with automated assistant for event planning | Event planning is high-touch and relationship-driven; clients may resist automation | Survey or interview 10+ event clients on communication preferences | **P1 — affects adoption** |
| Volume of edge-case queries that don't fit clean classification | Determines operator workload from "unclassifiable" escalations | Only measurable after prototype deployment; plan for 30% unclassifiable rate initially | **P2 — monitor post-launch** |

---

## Pass/Fail Readiness

### Pass Criteria (all must be true to proceed to build)
- [ ] **Safety validation:** Intent classifier achieves ≥99% recall on pricing-related queries in test dataset (i.e., misses fewer than 1 in 100 pricing questions)
- [ ] **Output validator coverage:** Deterministic output validators catch ≥95% of implicit/paraphrased pricing and commitment language in adversarial test set, with documented mitigation plan for remaining gaps
- [ ] **Threshold calibration:** Confidence routing threshold empirically selected from ROC analysis, with documented trade-off between false-negative risk and operator escalation load
- [ ] **ROI validation:** ≥40% of sampled real inquiries are automatable without pricing/commitment involvement
- [ ] **Technical feasibility:** WhatsApp Business API sandbox demonstrates reliable message delivery and template approval within acceptable timelines
- [ ] **Operator buy-in:** ≥3 event operators validate that the approval workflow matches their actual decision-making process
- [ ] **Output safety:** Output validation layer catches 100% of synthetically injected pricing/commitment language in adversarial testing

### Fail Criteria (any one blocks proceeding)
- [ ] Intent classifier recall on pricing queries < 95% after tuning (unacceptable financial risk)
- [ ] Output validator misses >10% of implicit pricing/commitment language in adversarial testing and no viable supplementary mechanism identified
- [ ] < 25% of real inquiries are automatable (insufficient ROI to justify platform)
- [ ] Operators reject approval workflow as adding friction without value
- [ ] WhatsApp API limitations prevent conversational flow (e.g., mandatory 24-hour response windows break multi-day event planning conversations)

### Current Readiness Assessment
**Status: NOT READY — validation required**

No empirical evidence exists for the core assumptions. The classifier accuracy, inquiry distribution, output validator coverage on implicit language, optimal routing threshold, and operator workflow fit are all hypothesized. Phase 1 build should not begin until P0 unknowns are resolved.

---

## Recommended Next Artifact

**Artifact: Validation Sprint Plan (1-2 weeks)**

Before proceeding to technical specification or build, execute a focused validation sprint:

1. **Data collection (Week 1):** Partner with one event management company to access 2 weeks of WhatsApp conversation history. Classify messages into: routine (automatable), pricing-related (requires human), and ambiguous. This resolves the inquiry distribution unknown.

2. **Classifier prototype and threshold calibration (Week 1-2):** Build and test the two-layer intent classifier (keyword allowlist + ML classifier) against the labeled dataset. Test at multiple confidence thresholds. Measure recall specifically for pricing-class messages at each threshold. Target: find threshold where pricing recall ≥99% and document the corresponding false-positive (over-escalation) rate.

3. **Output validator adversarial testing (Week 2):** Construct 100+ test cases of implicit, paraphrased, and context-dependent pricing/commitment language drawn from real conversation patterns. Measure validator detection rate. If coverage <95%, prototype supplementary mechanisms (conversation-state tracking, secondary LLM review gate).

4. **Operator workflow validation (Week 2):** Paper prototype the approval queue with 3+ operators. Walk through 10 real escalation scenarios. Validate that the approve/modify/reject flow matches their mental model.

5. **WhatsApp API spike (Week 1):** Set up sandbox, test message flows, identify template constraints and rate limits.

**Gate decision after validation sprint:** If pass criteria met → proceed to Technical Specification. If any fail criteria triggered → pivot scope or kill project.

The next artifact after validation is a **Technical Specification** covering: system architecture, API contracts, database schema, LLM prompt design with guardrails, deployment topology, and monitoring/alerting for boundary violations.
