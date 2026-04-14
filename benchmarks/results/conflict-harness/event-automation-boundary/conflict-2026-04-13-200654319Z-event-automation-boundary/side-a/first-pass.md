# Phase 1 PRD: Event Management Automation Platform

## Decision Frame

**Problem Statement:** Event management companies spend 60-70% of operator time on repetitive coordination tasks (venue availability checks, vendor follow-ups, client Q&A) that could be automated, but pricing commitments and contract terms require human judgment due to variable margins, relationship dynamics, and liability exposure.

**Decision to be made:** Should we build a Phase 1 platform consisting of (1) a WhatsApp-based client assistant, (2) an internal operator console, and (3) a human-approval workflow for pricing/commitment actions — with strict deterministic boundaries around where LLM inference is and is not permitted?

**Stakeholders:** Event operations managers (primary users), clients/customers (WhatsApp end-users), finance/pricing approvers, engineering team.

**Success criteria for Phase 1:**
- Reduce operator time-on-task for information queries by ≥40%
- Zero unauthorized pricing commitments (hard safety constraint)
- WhatsApp assistant handles ≥80% of FAQ-class queries without escalation
- Median approval-loop latency for pricing requests ≤15 minutes during business hours

**What this PRD is NOT:** This is not a full autonomous event planning system. Phase 1 deliberately constrains LLM usage to retrieval-augmented response generation for informational queries only. All actions with financial, contractual, or scheduling commitment implications require deterministic workflow with human approval.

---

## System Architecture & Boundary Design

### Component 1: WhatsApp Client Assistant

**Purpose:** Field inbound client queries (event details, logistics, FAQs) via WhatsApp Business API.

**LLM boundary (strict):**
- **PERMITTED:** Natural language understanding of client intent; generating responses from a curated knowledge base (event details, venue info, logistics FAQs); language translation; tone adjustment.
- **PROHIBITED:** Generating pricing quotes, confirming dates/availability, making any commitment on behalf of the business, inventing information not in the knowledge base.
- **Enforcement mechanism:** LLM outputs are post-processed through a deterministic classifier that flags any response containing price figures, confirmation language, or commitment verbs (e.g., "confirmed", "booked", "guaranteed"). Flagged responses are blocked and routed to human review before delivery.

**Escalation triggers (deterministic rules, not LLM-decided):**
- Client message contains pricing keywords or requests a quote
- Client requests a date hold or booking confirmation
- Intent classifier confidence score < 0.7
- Client explicitly requests human agent
- Conversation exceeds 5 turns without resolution

### Component 2: Internal Operator Console

**Purpose:** Single-pane view for operators to manage client conversations, approve/reject escalated actions, and monitor system health.

**Core features (Phase 1):**
- Unified inbox: all WhatsApp conversations with status (auto-handled, pending-escalation, awaiting-approval)
- Approval queue: pricing requests and commitment actions requiring human sign-off, with full conversation context
- Response override: operators can edit any auto-generated response before it sends (optional review mode)
- Audit log: immutable record of every auto-sent response, every escalation, every approval/rejection with timestamps and operator ID
- Dashboard: queue depth, response times, escalation rate, approval latency

**No LLM in the console:** The console is entirely deterministic. Search, filtering, and routing use conventional logic. Suggested responses shown to operators may be LLM-generated but are clearly labeled as drafts requiring explicit send action.

### Component 3: Human Approval Workflow

**Purpose:** Ensure no pricing commitment or contractual action executes without authenticated human approval.

**Workflow:**
1. Trigger: escalation rule fires (deterministic, see above)
2. Notification: operator receives console alert + optional push notification
3. Context: full conversation history, client profile, relevant pricing data presented
4. Action: operator approves (with optional edits), rejects (with reason), or escalates to manager
5. Delivery: approved response sent to client via WhatsApp with audit trail
6. SLA: if no action within 15 minutes, auto-reminder; if no action within 30 minutes, escalate to manager

**Pricing guardrails:**
- All pricing responses must reference an approved rate card (maintained in console)
- Deviations from rate card require manager-level approval
- Rate card updates are versioned and auditable

---

## LLM Determinism Boundaries — Summary Table

| Action | LLM Permitted? | Boundary Type | Enforcement |
|---|---|---|---|
| Understand client intent | Yes | Input processing | Classifier with confidence threshold |
| Generate FAQ response from knowledge base | Yes | Output generation | Post-processing filter blocks commitments |
| Translate/adjust tone | Yes | Output processing | Same post-processing filter |
| Generate pricing quote | **No** | Hard block | Deterministic keyword + intent classifier |
| Confirm booking/date | **No** | Hard block | Commitment-verb filter |
| Route escalation | **No** | Deterministic only | Rule-based routing engine |
| Console search/filter | **No** | Deterministic only | Conventional DB queries |
| Draft suggested response for operator | Yes (labeled) | Operator-gated | Requires explicit human send action |

---

## Unknowns & Evidence Gaps

1. **Client adoption of WhatsApp channel (HIGH uncertainty):** We assume clients will prefer WhatsApp over email/phone for queries. No survey data exists. *Mitigation: instrument channel preference in Phase 1; run parallel channels for first 60 days.*

2. **Escalation rate calibration (MEDIUM uncertainty):** The 0.7 confidence threshold and keyword lists are initial estimates. Too aggressive = excessive escalations defeating automation value; too permissive = risk of inappropriate auto-responses. *Mitigation: start conservative (high escalation rate acceptable in Phase 1); tune based on 30-day operator feedback.*

3. **Approval latency under load (MEDIUM uncertainty):** 15-minute SLA assumes adequate operator staffing. Unknown whether current team can sustain this during peak event seasons. *Mitigation: measure queue depth vs. staffing in Phase 1; model capacity needs before Phase 2.*

4. **Knowledge base completeness (MEDIUM uncertainty):** LLM response quality depends entirely on curated KB. Unknown what percentage of real client queries fall outside current documentation. *Mitigation: log all queries; tag "KB miss" events; weekly KB expansion reviews.*

5. **Post-processing filter reliability (HIGH importance):** The commitment-language filter is a critical safety boundary. False negatives (missed commitment language) create liability. *Mitigation: adversarial testing pre-launch with 500+ synthetic queries; ongoing monitoring with weekly false-negative audits.*

6. **WhatsApp Business API rate limits and costs (LOW uncertainty but must confirm):** Pricing model and message limits need validation against expected volume. *Mitigation: confirm with Meta/WhatsApp partner before development starts.*

---

## Pass/Fail Readiness

### Pass criteria (all must be met for Phase 1 launch):
- [ ] Post-processing commitment filter achieves <0.1% false-negative rate on adversarial test suite (≥500 queries)
- [ ] Zero pricing commitments possible without human approval in end-to-end testing
- [ ] Audit log captures 100% of system actions with no gaps
- [ ] WhatsApp assistant correctly handles ≥80% of FAQ queries from test corpus
- [ ] Approval workflow completes end-to-end (trigger → notify → approve → deliver) in under 2 minutes in testing
- [ ] Operator console renders conversation context accurately with no data loss
- [ ] Rate card enforcement prevents any below-card pricing without manager escalation

### Fail criteria (any one blocks launch):
- [ ] Any pathway exists for LLM-generated pricing to reach client without human approval
- [ ] Audit log has gaps or can be tampered with
- [ ] Escalation rules can be bypassed by prompt manipulation
- [ ] System sends responses when confidence is below threshold without escalation

### Current readiness: NOT READY (pre-development)

Key blockers before development:
1. WhatsApp Business API partner selection and cost confirmation
2. Initial knowledge base curation (minimum viable FAQ corpus)
3. Adversarial test suite development for commitment filter
4. Operator staffing model for approval SLA

---

## Recommended Next Artifact

**Next artifact: Technical Design Document (TDD)** covering:
1. WhatsApp Business API integration architecture (webhook handling, message queue, session management)
2. LLM service design: model selection, prompt engineering, knowledge base indexing (RAG pipeline)
3. Post-processing filter specification: commitment-language detection rules, confidence thresholds, adversarial test framework
4. Approval workflow state machine: states, transitions, timeout handling, notification channels
5. Console frontend architecture: real-time updates, audit log schema, dashboard metrics pipeline
6. Security model: authentication, authorization (operator vs. manager roles), data encryption at rest and in transit
7. Deployment and monitoring: uptime requirements, alerting on filter failures, LLM latency budgets

**Secondary artifact: Adversarial Test Suite** — a corpus of ≥500 synthetic client messages designed to probe commitment-filter boundaries, including edge cases like indirect pricing language, multilingual commitment phrases, and social-engineering-style prompts attempting to extract commitments.

**Timeline estimate deferred** — depends on TDD scope and team capacity assessment.
