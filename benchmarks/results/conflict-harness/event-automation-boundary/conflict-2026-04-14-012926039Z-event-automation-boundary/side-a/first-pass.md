# Phase 1 PRD: Event Management Automation Platform

## Decision Frame

**Problem statement:** Event management companies spend 60-70% of operator time on repetitive coordination tasks — venue availability checks, vendor follow-ups, client Q&A, and quote generation — that could be partially automated. However, pricing commitments and contract terms carry financial and legal risk that demands human judgment.

**Decision to be made:** Should we build a Phase 1 platform consisting of (1) a WhatsApp-based client assistant, (2) an internal operator console, and (3) a human-in-the-loop approval system with strict deterministic boundaries around LLM usage?

**Stakeholders:** Event operations managers (primary users), clients (WhatsApp end-users), finance/legal (approval chain), engineering (build feasibility).

**Success criteria for Phase 1:**
- Reduce operator time on routine inquiries by ≥40%
- Zero unauthorized pricing commitments (hard constraint)
- Client response time under 2 minutes for FAQ-class queries
- Operator adoption rate ≥80% within pilot cohort

**Scope boundaries:**
- **In scope:** WhatsApp assistant for inbound client queries, internal console for operator oversight, human approval workflow for pricing/commitments, deterministic guardrails on LLM outputs
- **Out of scope:** Payment processing, contract signing, multi-language support, outbound marketing automation, CRM integration beyond read-only

---

## Product Architecture

### Component 1: WhatsApp Assistant

**What it does:** Handles inbound client messages via WhatsApp Business API. Answers routine questions (venue availability, package descriptions, event timelines) using retrieval from a structured knowledge base. Escalates anything involving pricing, commitments, or ambiguous intent to a human operator.

**LLM boundary rules (deterministic enforcement):**

| Category | LLM Role | Guardrail |
|---|---|---|
| FAQ responses (venue info, hours, capacity) | Generate natural-language response from retrieved facts | Output must cite source record ID; if no matching record, escalate — never hallucinate |
| Pricing inquiries | Classify intent only | LLM NEVER generates a price. System retrieves price from catalog; if custom, routes to human |
| Commitment language ("we can do X", "confirmed", "guaranteed") | Blocked | Regex + classifier gate rejects any output containing commitment patterns before delivery |
| Ambiguous or out-of-scope | Classify as escalation | Auto-routes to operator console with conversation context |

**Output validation pipeline (deterministic, not probabilistic):**
1. LLM generates candidate response
2. Deterministic classifier checks for pricing tokens, commitment language, or low-confidence retrieval
3. If any flag triggers → response blocked, escalated to operator
4. If clean → response delivered with "Automated reply" footer
5. All responses logged with retrieval source, LLM input/output, and gate decisions

### Component 2: Internal Operator Console

**What it does:** Web dashboard where operators see all active conversations, escalations queue, and approval requests. Operators can:
- View full conversation history with LLM decision annotations
- Approve, edit, or reject draft responses flagged for review
- Override automation and take manual control of any conversation
- See real-time metrics: response times, escalation rates, automation coverage

**Key design principles:**
- Operator can always see what the LLM decided and why (transparency)
- One-click takeover of any conversation (control)
- Escalation queue sorted by urgency with SLA timers (prioritization)

### Component 3: Human Approval Workflow

**What it does:** Enforces mandatory human approval for any interaction that could create a financial or contractual obligation.

**Approval triggers (deterministic rules, not LLM judgment):**
- Any message containing a price or quote
- Any message with commitment/confirmation language
- Any custom package request outside standard catalog
- Any discount or negotiation
- Client explicitly requests to speak to a human

**Workflow:**
1. System drafts response (or flags that no automated response is appropriate)
2. Routes to assigned operator or next-available in queue
3. Operator approves as-is, edits, or writes custom response
4. Approved response sent to client with operator attribution
5. SLA: approval requests must be acted on within 15 minutes during business hours

---

## Unknowns & Evidence Gaps

| Unknown | Impact if wrong | How to resolve | Priority |
|---|---|---|---|
| Client willingness to interact with WhatsApp bot vs. expecting human | If clients reject bot, adoption fails | Pre-launch survey of 20+ existing clients; A/B test with/without "automated" disclosure | P0 — resolve before build |
| Accuracy of commitment-language detection | False negatives = unauthorized commitments; false positives = excessive escalation | Build test suite of 500+ real client messages, measure precision/recall of gate classifier | P0 — resolve during build |
| Operator workflow fit | Console may not match actual operator workflow, leading to workarounds | Shadow 3-5 operators for 2 days each, map current workflow before finalizing console design | P1 — resolve before console UX freeze |
| WhatsApp Business API rate limits and template approval timelines | May constrain response speed or message format | Engage WhatsApp partner for sandbox access, test throughput with simulated load | P1 — resolve during build |
| Volume of edge cases that bypass FAQ retrieval | If >30% of queries are edge cases, automation value drops significantly | Analyze 1,000 historical client messages for classifiability | P0 — resolve before build |
| LLM cost at scale | Per-message LLM cost may erode ROI at high volume | Model cost projection using historical message volumes and candidate model pricing | P1 — resolve during build |

---

## Pass/Fail Readiness

### Pass criteria (all must be met for Phase 1 launch):
- [ ] Zero commitment messages sent without human approval in 2-week pre-launch test
- [ ] Commitment-language classifier achieves ≥99% recall on test suite (prefer false positives over false negatives)
- [ ] FAQ retrieval covers ≥70% of historical client queries with correct answers
- [ ] Operator console tested with ≥3 operators, task completion rate ≥90%
- [ ] WhatsApp message delivery latency <5 seconds for automated responses
- [ ] Full audit trail: every message traceable to retrieval source + gate decision + approval status

### Fail criteria (any one blocks launch):
- [ ] Any path exists where LLM output reaches client without passing through deterministic validation gates
- [ ] Commitment classifier recall below 95% on adversarial test set
- [ ] Operators report console adds time vs. current workflow (net negative)
- [ ] Client survey shows >40% discomfort with WhatsApp bot interaction

### Current readiness assessment: NOT READY
- Evidence gaps on client willingness and query classifiability are unresolved
- No commitment classifier exists yet to test
- Operator workflow mapping not started

---

## Recommended Next Artifact

**Immediate next steps (ordered):**

1. **Client message analysis** — Classify 1,000 historical messages into FAQ/pricing/commitment/edge-case buckets. This determines whether automation coverage is viable. If <50% are automatable, revisit scope.

2. **Client willingness survey** — Survey 20+ existing clients on WhatsApp bot interaction comfort. If rejection rate >40%, pivot to operator-assist model (LLM drafts, human always sends).

3. **Commitment classifier prototype** — Build and test the deterministic gate using regex + lightweight classifier on the classified message corpus. Target ≥99% recall before proceeding.

4. **Operator workflow shadowing** — Map current operator workflow to validate console design assumptions.

**Next artifact:** Technical Design Document specifying the validation pipeline architecture, LLM integration boundaries, WhatsApp API integration, and console data model — to be produced after evidence gaps 1-3 are resolved.

**Phase 2 candidates (explicitly deferred):**
- Outbound follow-up automation
- Multi-language support
- CRM write-back integration
- Payment and contract workflow
- Analytics and reporting dashboard
