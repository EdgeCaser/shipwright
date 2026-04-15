# Phase 1 PRD: Event Management Automation Platform

## Decision Frame

**Problem statement:** Event management companies handle high volumes of repetitive coordination tasks (venue inquiries, vendor scheduling, guest communication, pricing quotes) that consume operator time but follow predictable patterns. However, pricing commitments and contractual decisions carry financial risk that demands human judgment.

**Decision to be made:** Should we build a Phase 1 platform combining a WhatsApp-based assistant for external communication, an internal operator console, and a human-approval workflow for pricing — with strict deterministic boundaries constraining where LLM inference is permitted?

**Stakeholders:** Event operators (primary users), end-clients (WhatsApp recipients), finance/pricing approvers, engineering team.

**Success criteria for Phase 1:**
- Reduce operator time on routine inquiries by ≥40%
- Zero pricing commitments issued without human approval
- WhatsApp response latency <60s for templated replies, <5min for LLM-assisted drafts requiring approval
- Operator adoption: ≥3 operators using console daily within 4 weeks of launch

**What this PRD is NOT deciding:** Phase 2 features (payment processing, multi-channel expansion beyond WhatsApp, autonomous pricing), vendor marketplace integrations, or white-label positioning.

---

## Product Architecture

### Component 1: WhatsApp Assistant

**Scope:** Receives inbound messages from clients via WhatsApp Business API. Handles three tiers of responses:

| Tier | Behavior | LLM Involvement | Approval Required |
|------|----------|-----------------|--------------------|
| T1 — Deterministic | FAQ, hours, location, standard package descriptions | None. Template lookup only. | No |
| T2 — LLM-Drafted | Custom inquiries, schedule coordination, follow-ups | LLM generates draft; operator reviews before send | Yes — operator review |
| T3 — Pricing/Commitment | Any message containing pricing, discounts, contractual terms | LLM generates draft; flagged for pricing-authority approval | Yes — pricing authority |

**Deterministic boundary rules:**
- Classification of inbound messages into T1/T2/T3 uses a rules-based classifier (keyword + regex), NOT an LLM. Misclassification defaults upward (T1→T2, T2→T3) when ambiguity is detected.
- **Classifier limitation (acknowledged):** The default-upward policy only activates when the rule set detects ambiguity. Novel phrasings, implied discounts, informal WhatsApp shorthand, or package tradeoffs may evade keyword/regex detection entirely and classify as T2 without triggering the ambiguity flag. This is the primary residual risk in the tier system and is addressed through multiple mitigations (see U1 in Unknowns below and classifier validation in Pass/Fail Readiness).
- T1 responses are selected from a curated template library. No generative text in T1.
- LLM is used ONLY for draft generation in T2/T3. Drafts are never sent automatically.
- All LLM prompts are logged with input/output pairs for audit.
- LLM model version is pinned per deployment. No auto-updates.
- **Secondary safety net:** The content filter on LLM output rejects any T2 draft containing currency symbols or numeric pricing patterns, forcing reclassification to T3. This catches cases where the classifier missed pricing intent but the client's language surfaces it in the generated response.

### Component 2: Internal Operator Console

**Scope:** Web-based dashboard for operators and pricing approvers.

**Core screens:**
1. **Inbox** — Queued messages requiring review, sorted by tier and urgency
2. **Conversation view** — Full WhatsApp thread with client, LLM draft highlighted, edit-before-send capability
3. **Approval queue** — T3 items requiring pricing-authority sign-off, with audit trail
4. **Template manager** — CRUD for T1 response templates
5. **Activity log** — All messages sent, who approved, LLM inputs/outputs

**Authorization model:**
- Operator role: can approve and send T1 and T2 messages
- Pricing Authority role: required for T3 approval. Cannot be bypassed.
- Admin role: template management, user management, system configuration

### Component 3: Human Approval Workflow

**Invariant:** No message containing a pricing commitment, discount, or contractual term is transmitted to a client without explicit approval from a user holding the Pricing Authority role.

**Implementation constraints:**
- Approval is a deliberate action (button click with confirmation), not a passive timeout
- No "auto-approve after N minutes" mechanism in Phase 1
- Approval records are immutable (append-only audit log)
- If no Pricing Authority is available, T3 messages queue indefinitely with escalating console alerts at 15min, 1hr, 4hr

### LLM Boundary Specification

**Where LLM is permitted:**
- Draft generation for T2 and T3 responses (human reviews before send)
- Suggested reply ranking (operator sees top-3 drafts, picks or edits one)

**Where LLM is explicitly prohibited:**
- Message tier classification (rules-based only)
- Sending any message to a client (human action required)
- Template selection for T1 (deterministic lookup)
- Access control decisions
- Pricing calculations (sourced from pricing table, not generated)

**Guardrails:**
- Output token limit: 500 tokens per draft
- Content filter: reject drafts containing currency symbols or numbers unless input was classified T3 (forces pricing review)
- Fallback: if LLM call fails or times out (>10s), queue message for fully manual response rather than retrying or degrading

---

## Unknowns & Evidence Gaps

| # | Unknown | Impact if Wrong | Mitigation Plan | Evidence Needed |
|---|---------|----------------|-----------------|----------------|
| U1 | Rules-based classifier accuracy for T1/T2/T3 separation — especially whether keyword/regex rules can capture the full range of pricing language including novel phrasings, implied discounts, and informal shorthand | Misclassification downward (T3→T2) could let pricing commitments bypass approval. This is the highest-severity unknown because the default-upward policy only fires on detected ambiguity, not on unrecognized pricing language. | Default-upward policy as first layer; T2 content filter as secondary catch; measure false-negative rate on T3 in pilot; weekly classifier rule updates during first 8 weeks based on missed patterns | Labeled dataset of 500+ real inbound messages with tier annotations; adversarial test set of 50+ edge-case pricing phrasings (implied discounts, package comparisons, informal language) |
| U2 | Operator willingness to review every T2 draft before sending | If review fatigue causes rubber-stamping, quality degrades and misclassified T3 messages may pass through operator review uncaught | Track edit rate and time-on-review; if edit rate <5% after 2 weeks, consider auto-send for high-confidence T2 in Phase 2 | Operator behavior data from first 4 weeks |
| U3 | WhatsApp Business API rate limits and template approval timelines | Could bottleneck response latency targets | Pre-register template library; monitor API quota usage | WhatsApp Business API documentation review + sandbox testing |
| U4 | Client expectations for response speed on pricing inquiries | If clients expect instant pricing, queuing T3 may cause drop-off | Set auto-reply acknowledgment ("We're preparing your custom quote") for T3 items | Client satisfaction survey after pilot |
| U5 | Volume of T3 vs T2 vs T1 messages in real traffic | Determines staffing needs for Pricing Authority coverage | Classify historical message logs before launch | Sample of 1000 historical WhatsApp messages |
| U6 | LLM draft quality for event-specific domain language | Poor drafts increase operator editing burden, negating time savings | Fine-tune system prompt with domain examples; measure operator edit distance | A/B test: LLM draft vs. no draft, measure time-to-send |

---

## Pass/Fail Readiness

### Pass Criteria (all must be met to ship Phase 1)

- [ ] **Safety invariant verified:** No code path exists where a T3 message reaches a client without Pricing Authority approval — verified by automated test suite AND manual audit
- [ ] **Classifier default-upward behavior confirmed:** Unit tests prove ambiguous inputs classify to higher tier, never lower
- [ ] **Classifier adversarial validation:** Adversarial test set of ≥50 edge-case pricing phrasings (implied discounts, informal language, package tradeoffs) achieves T3 recall ≥95%. Remaining gap acknowledged as residual risk mitigated by content filter and operator review.
- [ ] **LLM boundary enforcement:** LLM calls are isolated to draft generation module; no LLM dependency in classification, routing, or send paths — verified by architectural review and dependency analysis
- [ ] **Content filter functional:** T2 drafts containing currency symbols or pricing patterns are blocked and reclassified to T3 — verified by test suite
- [ ] **Audit log completeness:** Every sent message has a recorded approval chain (who classified, who reviewed, who approved, timestamp)
- [ ] **Operator console functional:** All 5 core screens operational with role-based access enforced
- [ ] **WhatsApp integration stable:** Successfully send/receive messages in sandbox environment with <5s API latency p95
- [ ] **Pilot dataset classified:** ≥500 historical messages labeled to validate classifier accuracy ≥90% with T3 recall ≥99%

### Fail Criteria (any one blocks ship)

- T3 recall below 99% on the labeled historical dataset
- Adversarial T3 recall below 95% on edge-case pricing phrasings (with documented plan to close gap via classifier rule iteration)
- Any pathway where LLM output is sent to client without human action
- Audit log gaps (messages sent without corresponding approval records)
- Pricing Authority bypass possible through UI or API
- Content filter bypass (T2 draft with pricing content sent without T3 reclassification)

---

## Phase 1 Scope Boundaries

**In scope:**
- Single WhatsApp Business number
- English language only
- Up to 10 concurrent operators
- One pricing table (no dynamic pricing engine)
- Cloud deployment (single region)

**Explicitly out of scope:**
- Multi-language support
- Payment processing or invoicing
- SMS, email, or other channels
- Autonomous sending (even for T1)
- Analytics dashboards beyond activity log
- Mobile app for operators (web only)

---

## Recommended Next Artifact

**Immediate next step:** Technical Design Document (TDD) covering:
1. WhatsApp Business API integration architecture and webhook design
2. Rules-based classifier specification (keyword lists, regex patterns, default-upward logic) — with explicit adversarial test methodology for pricing language coverage
3. LLM integration contract (prompt templates, model selection, isolation boundaries)
4. Content filter specification for T2 output screening (currency/pricing pattern detection)
5. Approval workflow state machine with edge cases (concurrent approvers, revocation, timeout escalation)
6. Audit log schema and retention policy

**Parallel workstream:** Message classification dataset — collect and label 500+ historical WhatsApp messages AND construct adversarial edge-case set of 50+ pricing phrasings to validate classifier design before engineering starts.

**Phase 1 timeline dependency:** WhatsApp Business API access approval (can take 2-4 weeks) should be initiated immediately as it is on the critical path.
