# Phase 1 PRD: Event Management Automation Platform

## Decision Frame

**Problem Statement:** Event management companies spend 60-70% of operator time on repetitive inquiry handling, quote generation, and scheduling coordination. Clients expect instant responses (especially via WhatsApp in key markets), but pricing commitments require human judgment due to variable venue costs, seasonal pricing, and negotiation dynamics.

**Decision to be made:** Should we build a Phase 1 platform consisting of (1) a WhatsApp-based client assistant, (2) an internal operator console, and (3) a human-in-the-loop approval system for pricing — with strict deterministic boundaries around where LLM inference is permitted?

**Scope boundary:** Phase 1 covers inquiry intake, information retrieval, quote draft generation, and approval workflow. Phase 1 does NOT cover payment processing, vendor management, post-event feedback, or multi-language support beyond English.

**Who decides:** Product lead with sign-off from engineering lead (for feasibility of deterministic boundaries) and compliance/legal (for WhatsApp Business API terms and data handling).

**Decision deadline:** Architecture decision by end of sprint 2; Phase 1 ship target 12 weeks from kickoff.

---

## Product Overview

### Core Components

#### 1. WhatsApp Client Assistant
- Handles inbound client inquiries via WhatsApp Business API
- Answers factual questions about venue availability, capacity, amenities, and standard packages using **deterministic lookup only** (no LLM generation for facts)
- LLM usage strictly limited to: natural language understanding of client intent, conversational response formatting, and summarizing client requirements into structured intake forms
- All pricing information surfaced to client is **read from approved price lists or human-approved quotes** — the LLM never generates, estimates, or implies pricing

#### 2. Internal Operator Console
- Web-based dashboard for event operators
- Displays incoming inquiries with AI-parsed structured summaries
- Quote builder with pre-configured pricing components (venue, catering, AV, staffing)
- Approval queue for pricing commitments before they reach the client
- Audit log of all client interactions and approval decisions

#### 3. Human-in-the-Loop Approval System
- **Hard gate:** No pricing commitment reaches the client without explicit human approval
- Operator receives draft quote with AI-suggested line items (based on client requirements and historical data)
- Operator can modify, approve, or reject
- Approved quotes are pushed to WhatsApp as deterministic templates (not LLM-generated text)
- Escalation path: complex or high-value inquiries auto-flag for senior operator review

### Deterministic Boundary Specification

| Function | LLM Permitted? | Boundary Rule |
|---|---|---|
| Intent classification from client message | Yes | Output is enum from fixed set; fallback to "unclassified" triggers human routing |
| Factual answers (capacity, address, hours) | No | Lookup from structured database only |
| Pricing display to client | No | Only human-approved values from quote system |
| Conversational response generation | Yes, constrained | Template-based with LLM fill for natural phrasing; all factual slots filled from DB |
| Client requirement summarization | Yes | Output is structured form; operator reviews before action |
| Quote line-item suggestion | Yes, internal only | Suggestions visible only to operator; never shown to client without approval |
| Scheduling/availability check | No | Deterministic calendar lookup |
| Escalation decision | No | Rule-based: threshold on deal size, client tier, or confidence score |

### Threat Model & Enforcement Rationale

The choice of API-layer isolation over alternatives (prompt-level constraints, policy-only controls, middleware filtering) is driven by the following threat model:

**Threat 1 — Direct LLM pricing generation:** The LLM fabricates or hallucinates a price in a client-facing response.
- **Why prompt-engineering is insufficient:** LLMs can ignore system prompts under adversarial or edge-case inputs. Prompt-level "never mention pricing" instructions have no enforcement guarantee.
- **API-layer mitigation:** The WhatsApp response service has no network path to invoke the LLM directly. It consumes only pre-rendered payloads from the deterministic renderer.

**Threat 2 — Indirect leakage via template slots:** The LLM fills a "natural phrasing" slot with content that implies or states a price (e.g., "your event would typically run around $5,000").
- **Mitigation:** Template slots are typed. Pricing-adjacent slots (cost, total, rate, discount) are not exposed to LLM fill — they accept only values from the approved quote record. A slot-type allowlist in the renderer rejects LLM output containing numeric-currency patterns (regex + structural validation) before assembly.
- **Residual risk acknowledged:** Semantic pricing implication without numeric values ("this is our most affordable option") is harder to catch. Phase 1 mitigation: post-render content filter scanning for pricing-suggestive language patterns, with flagged messages queued for human review rather than auto-sent.

**Threat 3 — Operator-mediated leakage:** An operator copies LLM-suggested internal pricing into a freeform message outside the quote workflow.
- **Mitigation:** The console does not offer a freeform message-to-client feature in Phase 1. All client communication routes through the template renderer. This is a UX constraint that doubles as a control.
- **Residual risk acknowledged:** Operators could use personal WhatsApp to message clients outside the system. This is an organizational policy issue, not a system control — flagged as out of scope but noted for operational playbook.

**Threat 4 — Retrieval contamination:** The LLM's context includes pricing data from retrieval (e.g., venue database records with rate fields), and this leaks into conversational output.
- **Mitigation:** The LLM service receives a filtered input payload. Pricing fields are stripped from context documents before they reach the LLM. The data access layer enforces column-level filtering: the LLM query interface exposes a view that excludes rate/cost columns.

**Alternative enforcement patterns considered:**

| Pattern | Why rejected for Phase 1 |
|---|---|
| Prompt-only constraints | No enforcement guarantee; fails under prompt injection or model drift |
| Middleware output filter only | Catches some leakage but relies on regex completeness; single point of failure |
| Full human review of every message | Defeats the latency and efficiency goals of automation |
| **Chosen: API-layer isolation + typed slots + post-render filter** | Defense in depth: architectural separation prevents most paths, typed slots block template-level leakage, post-render filter catches residual semantic leakage |

This is a defense-in-depth approach, not a claim that any single layer is sufficient. The TDD must validate that these layers compose correctly and that no code path bypasses all three.

**Enforcement mechanism:** The system architecture enforces these boundaries at the API layer. The WhatsApp response service has no direct access to the LLM — it receives only pre-approved response payloads. The LLM service runs in a sandboxed internal tier that outputs structured data consumed by deterministic rendering functions.

### User Stories (Phase 1)

1. **Client inquires about availability:** Client sends WhatsApp message → intent classified → availability checked via calendar DB → deterministic response sent (no approval needed for factual availability)
2. **Client requests a quote:** Client describes event needs → LLM extracts structured requirements → operator receives parsed intake + suggested line items → operator builds/approves quote → approved quote sent to client via template
3. **Client asks about pricing before quote:** Assistant responds with "I'll have our team put together a custom quote for you" (deterministic deflection) — never generates pricing language
4. **Operator reviews inquiry queue:** Operator logs into console → sees prioritized list of active inquiries with AI summaries → clicks into inquiry to see full conversation history and parsed requirements
5. **High-value inquiry escalation:** Deal size exceeds threshold → auto-flagged in console → senior operator notified → approval requires senior sign-off

### Technical Architecture (Phase 1)

- **WhatsApp integration:** WhatsApp Business API via official Cloud API
- **LLM service:** Isolated microservice; accepts structured input, returns structured output; no direct client-facing access
- **Response renderer:** Deterministic template engine that assembles client-facing messages from approved data + optional LLM-phrased connective text, with typed slot enforcement and post-render content filtering
- **Data store:** PostgreSQL for quotes, pricing, client records; calendar system for availability
- **Console frontend:** React-based SPA with real-time updates via WebSocket
- **Audit trail:** Append-only log of all LLM inputs/outputs, approval decisions, and client messages

### Success Metrics (Phase 1)

| Metric | Target | Measurement |
|---|---|---|
| Inquiry response time (first reply) | < 2 minutes for factual questions | Median, measured from message receipt to response send |
| Quote turnaround time | < 4 hours during business hours | From client request to approved quote delivery |
| Pricing accuracy | 100% match to approved quotes | Zero instances of unapproved pricing reaching client |
| Operator time per inquiry | 50% reduction vs. baseline | Time-motion comparison against current manual process |
| Client satisfaction (CSAT) | ≥ 4.2/5 | Post-interaction survey |
| LLM boundary violations | 0 | Automated audit of response payloads against boundary rules |

---

## Unknowns & Evidence Gaps

1. **Client behavior on WhatsApp:** We assume clients will engage with a WhatsApp assistant for event planning. No validated data on adoption rates or drop-off points for this specific vertical. **Evidence needed:** User research with 10-15 prospective clients; prototype conversation flow testing.

2. **Operator workflow fit:** The approval queue adds a step to the operator workflow. Risk that operators perceive it as overhead rather than assistance. **Evidence needed:** Ride-along sessions with 3-5 operators using current tools; task analysis of existing quote-building process.

3. **LLM intent classification accuracy:** Unknown error rate for intent classification on event-specific queries ("Can you do a half-day buyout?" vs. "What's the capacity for a seated dinner?"). **Evidence needed:** Labeled dataset of 500+ real client messages; precision/recall benchmarks before launch.

4. **WhatsApp Business API constraints:** Rate limits, template approval timelines, and media attachment limits may constrain the conversational experience. **Evidence needed:** API sandbox testing with realistic message volumes; template pre-approval timeline from Meta.

5. **Pricing component complexity:** Unknown how many venues/packages have non-standard pricing structures that resist componentization into the quote builder. **Evidence needed:** Audit of existing pricing sheets across top 10 venues.

6. **Latency budget:** End-to-end response time for LLM-involved flows (intent classification + summarization) may exceed the 2-minute target under load. **Evidence needed:** Load testing with simulated concurrent conversations.

7. **Boundary enforcement composability:** The three-layer defense (API isolation + typed slots + post-render filter) has not been validated as composing correctly. Specifically, edge cases where the LLM output is structurally valid but semantically pricing-suggestive need adversarial testing. **Evidence needed:** Red-team exercise against the template renderer with LLM outputs specifically crafted to imply pricing without numeric values; boundary verification test suite coverage report.

---

## Pass/Fail Readiness

### Pass Criteria (all must be met for Phase 1 launch)

- [ ] **Deterministic boundary enforcement verified:** Automated test suite confirms no code path allows LLM-generated pricing to reach a client without human approval, covering all four threat vectors in the threat model
- [ ] **WhatsApp Business API approved:** Meta has approved the business account and message templates required for Phase 1 flows
- [ ] **Intent classification meets threshold:** ≥ 90% precision on top-5 intent categories with graceful fallback (human routing) for unclassified messages
- [ ] **Operator console functional:** Quote builder, approval queue, and audit log operational with < 500ms page load
- [ ] **Audit trail complete:** Every client-facing message traceable to its data sources and approval chain
- [ ] **Data handling compliant:** Client conversation data storage and retention meets applicable privacy requirements (GDPR if serving EU clients)
- [ ] **Post-render filter validated:** Content filter catches ≥ 95% of pricing-suggestive language patterns in adversarial test set, with remaining 5% routed to human review

### Fail / No-Go Criteria (any one blocks launch)

- [ ] **Boundary breach in testing:** Any test scenario where unapproved pricing content reaches a client through any of the four identified threat vectors
- [ ] **WhatsApp API rejection:** Meta denies business verification or required templates
- [ ] **Operator rejection:** Majority of pilot operators (>50%) report the system increases their workload vs. baseline
- [ ] **Latency failure:** Median first-response time exceeds 5 minutes in load testing

---

## Recommended Next Artifact

**Next artifact:** Technical Design Document (TDD) for the LLM Boundary Enforcement Architecture

**Rationale:** The highest-risk element of this PRD is the deterministic boundary system. Before sprint planning, engineering needs to validate that the proposed defense-in-depth architecture (API isolation + typed template slots + post-render content filter) composes correctly and that each layer addresses its designated threat vectors. The TDD should specify:

1. API contracts between the LLM service, response renderer, and WhatsApp integration layer
2. Typed slot specification: which slots accept LLM output, which are DB-only, and the validation rules for each
3. Post-render content filter design: pattern library, false-positive handling, and human-review queue integration
4. The boundary verification test framework (how to prove no pricing leaks across all four threat vectors)
5. Monitoring and alerting for boundary violations in production
6. Fallback behavior when the LLM service is unavailable (graceful degradation to fully deterministic responses)

**Secondary artifact:** User Research Plan for the two critical evidence gaps (client WhatsApp adoption and operator workflow fit). This should run in parallel with the TDD to de-risk demand-side assumptions before significant engineering investment.
