# Phase 1 PRD: Event Management Automation Platform

## Decision Frame

**Problem statement:** Event management companies spend 60-70% of operator time on repetitive coordination tasks — venue availability checks, vendor follow-ups, client Q&A, and quote generation — that could be partially automated. However, pricing commitments and contract terms carry financial and legal risk that demands human judgment.

**Decision to be made:** Should we build a Phase 1 platform consisting of (1) a WhatsApp-based client assistant, (2) an internal operator console, and (3) a human-in-the-loop approval system with strict boundaries around LLM usage?

**Stakeholders:** Event operations managers (primary users), clients (WhatsApp end-users), finance/legal (approval chain), engineering (build feasibility).

**Success criteria for Phase 1:**
- Reduce operator time on routine inquiries by ≥40%
- Zero unauthorized pricing commitments (hard constraint)
- Client response time under 2 minutes for FAQ-class queries
- Operator adoption rate ≥80% within pilot cohort

**Scope boundaries:**
- **In scope:** WhatsApp assistant for inbound client queries, internal console for operator oversight, human approval workflow for pricing/commitments, validation guardrails on LLM outputs
- **Out of scope:** Payment processing, contract signing, multi-language support, outbound marketing automation, CRM integration beyond read-only

---

## Product Architecture

### Component 1: WhatsApp Assistant

**What it does:** Handles inbound client messages via WhatsApp Business API. Answers routine questions (venue availability, package descriptions, event timelines) using retrieval from a structured knowledge base. Escalates anything involving pricing, commitments, or ambiguous intent to a human operator.

**LLM boundary rules:**

| Category | LLM Role | Guardrail | Guardrail Type |
|---|---|---|---|
| FAQ responses (venue info, hours, capacity) | Generate natural-language response from retrieved facts | Output must cite source record ID; if no matching record, escalate — never hallucinate | Deterministic (record lookup) |
| Pricing inquiries | Classify intent only | LLM NEVER generates a price. System retrieves price from catalog; if custom, routes to human | Deterministic (catalog lookup) + statistical (intent classifier) |
| Commitment language ("we can do X", "confirmed", "guaranteed") | Blocked | Regex pattern gate rejects output containing commitment patterns before delivery | Deterministic (regex layer); statistical (classifier layer — see validation pipeline below) |
| Ambiguous or out-of-scope | Classify as escalation | Auto-routes to operator console with conversation context | Statistical (confidence threshold) |

**Output validation pipeline:**

The pipeline combines deterministic and statistical components. The critical safety property is that statistical components are configured to fail-safe (escalate to human when uncertain), not fail-open.

1. LLM generates candidate response
2. **Layer 1 — Deterministic gates (regex):** Pattern-match for pricing tokens, commitment phrases, and known escalation triggers. These are fully deterministic and auditable.
3. **Layer 2 — Statistical classifier:** A trained classifier scores the candidate for commitment/pricing intent that may evade regex patterns (e.g., indirect commitment language, paraphrases). This layer is **not deterministic** — it operates on a confidence threshold that must be empirically tuned.
4. **Layer 3 — Retrieval confidence check:** If the FAQ response was generated from low-similarity retrieval (below a tuned threshold), escalate. Also statistical.
5. If **any** layer flags → response blocked, escalated to operator
6. If all layers pass → response delivered with "Automated reply" footer
7. All responses logged with retrieval source, LLM input/output, layer-by-layer gate decisions, and confidence scores

**Critical caveat:** The ≥99% recall target for commitment-language detection is a design requirement, not a validated capability. Whether the combined regex + classifier pipeline can achieve this recall on real event-management conversations — including adversarial phrasings, indirect commitments, and code-switched messages — is an unresolved P0 evidence gap (see Unknowns table). The pipeline architecture assumes this is achievable but does not yet prove it. If testing reveals recall below 95%, the fallback is to route all non-FAQ messages through human approval (operator-assist model), trading automation coverage for safety.

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
| **Achievable recall of commitment-language detection on real data** | **If regex + classifier cannot reach ≥95% recall on real event-management messages (including indirect phrasing, code-switching, adversarial inputs), the core safety mechanism is insufficient and the platform must fall back to operator-assist mode** | **Build annotated test corpus of 500+ real client messages including edge cases; test regex layer alone, then classifier, then combined; measure precision/recall at multiple thresholds; define explicit threshold policy and document false-negative failure modes** | **P0 — resolve during build, gate launch on results** |
| Operator workflow fit | Console may not match actual operator workflow, leading to workarounds | Shadow 3-5 operators for 2 days each, map current workflow before finalizing console design | P1 — resolve before console UX freeze |
| WhatsApp Business API rate limits and template approval timelines | May constrain response speed or message format | Engage WhatsApp partner for sandbox access, test throughput with simulated load | P1 — resolve during build |
| Volume of edge cases that bypass FAQ retrieval | If >30% of queries are edge cases, automation value drops significantly | Analyze 1,000 historical client messages for classifiability | P0 — resolve before build |
| LLM cost at scale | Per-message LLM cost may erode ROI at high volume | Model cost projection using historical message volumes and candidate model pricing | P1 — resolve during build |
| **Boundary between deterministic and statistical pipeline components** | **If stakeholders assume "deterministic pipeline" means zero probabilistic failure modes, they may underestimate residual risk from the classifier and retrieval-confidence layers** | **Document each pipeline layer's type (deterministic vs. statistical), failure mode, and threshold policy in the Technical Design Document; ensure approval stakeholders understand residual risk** | **P1 — resolve during technical design** |

---

## Pass/Fail Readiness

### Pass criteria (all must be met for Phase 1 launch):
- [ ] Zero commitment messages sent without human approval in 2-week pre-launch test
- [ ] Commitment-language detection achieves ≥99% recall on annotated test corpus (≥95% on adversarial/edge-case subset) — measured as combined recall across regex + classifier layers, with explicit threshold policy documented
- [ ] FAQ retrieval covers ≥70% of historical client queries with correct answers
- [ ] Operator console tested with ≥3 operators, task completion rate ≥90%
- [ ] WhatsApp message delivery latency <5 seconds for automated responses
- [ ] Full audit trail: every message traceable to retrieval source + per-layer gate decision + confidence scores + approval status
- [ ] Pipeline layer documentation: each validation layer classified as deterministic or statistical, with stated failure modes and threshold rationale

### Fail criteria (any one blocks launch):
- [ ] Any path exists where LLM output reaches client without passing through all validation layers
- [ ] Commitment detection recall below 95% on adversarial test set (hard floor — even with fallback to operator-assist)
- [ ] Operators report console adds time vs. current workflow (net negative)
- [ ] Client survey shows >40% discomfort with WhatsApp bot interaction
- [ ] No documented threshold policy for statistical pipeline layers

### Current readiness assessment: NOT READY
- Evidence gaps on client willingness and query classifiability are unresolved
- No commitment classifier exists yet to test; ≥99% recall target is a design aspiration, not a validated capability
- Operator workflow mapping not started
- Pipeline layer types (deterministic vs. statistical) now specified in architecture but require threshold policy documentation in technical design

---

## Recommended Next Artifact

**Immediate next steps (ordered):**

1. **Client message analysis** — Classify 1,000 historical messages into FAQ/pricing/commitment/edge-case buckets. This determines whether automation coverage is viable. If <50% are automatable, revisit scope.

2. **Client willingness survey** — Survey 20+ existing clients on WhatsApp bot interaction comfort. If rejection rate >40%, pivot to operator-assist model (LLM drafts, human always sends).

3. **Commitment classifier prototype and threshold policy** — Build regex layer first (measure standalone recall), then add classifier layer. Test combined pipeline on annotated corpus including adversarial examples. Document threshold policy: what confidence score triggers escalation, what false-positive rate is acceptable, and what the fallback is if recall targets are not met.

4. **Operator workflow shadowing** — Map current operator workflow to validate console design assumptions.

**Next artifact:** Technical Design Document specifying the validation pipeline architecture (with explicit deterministic/statistical layer classification and threshold policies), LLM integration boundaries, WhatsApp API integration, and console data model — to be produced after evidence gaps 1-3 are resolved.

**Phase 2 candidates (explicitly deferred):**
- Outbound follow-up automation
- Multi-language support
- CRM write-back integration
- Payment and contract workflow
- Analytics and reporting dashboard
