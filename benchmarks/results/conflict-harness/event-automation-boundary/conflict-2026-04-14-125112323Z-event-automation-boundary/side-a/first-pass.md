# Phase 1 PRD: Event Management Automation Platform

## Decision Frame

### Problem Statement
Event management companies currently rely on manual coordination for client inquiries, venue/vendor matching, pricing negotiations, and booking confirmations. This creates bottlenecks at scale, inconsistent response times (especially off-hours), and pricing errors from ad-hoc quoting. The opportunity is to automate the high-volume, low-judgment portions of the workflow while preserving human control over financial commitments and edge cases.

### What This PRD Decides
- **In scope (Phase 1):** WhatsApp-based client assistant for intake and FAQ; internal operator console for queue management and approvals; deterministic automation for structured tasks (availability lookup, template responses, scheduling); human-in-the-loop gate for all pricing and commitment actions.
- **Out of scope (Phase 1):** Payment processing, multi-channel expansion (email/SMS/web chat), vendor-side automation, analytics dashboards, CRM integrations beyond basic contact sync.
- **Key constraint:** LLM usage is bounded to non-deterministic tasks (natural language understanding, intent classification, response drafting) and NEVER used for pricing calculation, contract generation, or commitment confirmation. All financial outputs are computed by deterministic rule engines.

### Success Criteria (Phase 1)
| Metric | Target | Measurement |
|--------|--------|-------------|
| Median first-response time (WhatsApp) | < 2 minutes | Measured from client message to first substantive reply |
| Human approval queue latency | < 15 minutes during business hours | Time from auto-generated proposal to operator action |
| Pricing accuracy | 100% match to rate card | Zero LLM-generated prices reach client |
| Client satisfaction (post-event) | ≥ 4.2/5 | Survey within 48h of event completion |
| Operator adoption | ≥ 80% of bookings flow through console | Console usage vs. side-channel bookings |

---

## System Architecture & Boundaries

### Component Overview

**1. WhatsApp Assistant (Client-Facing)**
- Built on WhatsApp Business API (official, not grey-route)
- LLM handles: intent classification (inquiry type, date extraction, guest count parsing), conversational flow management, FAQ responses from approved knowledge base
- LLM does NOT handle: price quotes, availability confirmation, booking confirmation, contract terms
- All LLM-drafted client-facing messages pass through a template validation layer before send. Messages containing monetary values, dates-as-commitments, or contractual language are flagged and routed to human queue.

**2. Internal Operator Console (Staff-Facing)**
- Web application (responsive, not mobile-native for Phase 1)
- Displays: inbound inquiry queue, auto-classified intent + extracted parameters, suggested responses (LLM-drafted, human-editable), pricing proposals (deterministic engine output), approval/reject controls
- Operator actions: approve/edit/reject pricing proposals, override LLM classifications, escalate to manager, send final confirmations
- Audit log: every operator action timestamped with before/after state

**3. Deterministic Pricing Engine**
- Rule-based system consuming: venue rate cards, seasonal multipliers, package configurations, discount tiers (volume, loyalty, corporate)
- Inputs: structured parameters extracted by LLM (event type, date, guest count, venue preference) validated against enum/range constraints before engine accepts them
- Outputs: priced proposal with line-item breakdown, rendered into human-reviewable format
- Zero LLM involvement in calculation. LLM may draft explanatory text around the numbers, but the numbers themselves are engine-output only.

**4. Human-in-the-Loop Gates**

| Action | Gate Type | Fallback if No Response |
|--------|-----------|------------------------|
| Price quote to client | Explicit operator approval | Escalate after 15 min; notify manager after 30 min |
| Booking confirmation | Explicit operator approval | Never auto-confirm |
| Custom/off-menu requests | Manual handling | Route to senior operator |
| Discount beyond standard tiers | Manager approval | Hold with client notification of delay |
| Cancellation/refund | Explicit operator approval | Hold and escalate |

### LLM Boundary Specification

**Permitted LLM Operations (non-deterministic, assistive):**
- Parse unstructured client messages into structured intent + parameters
- Generate conversational responses from approved FAQ corpus
- Draft follow-up questions when required parameters are missing
- Summarize conversation history for operator handoff
- Classify urgency/sentiment for queue prioritization

**Prohibited LLM Operations (deterministic or commitment-bearing):**
- Calculate or suggest prices
- Confirm availability (must query availability database directly)
- Make or imply booking commitments
- Generate contract or terms language
- Approve discounts or exceptions
- Send messages to clients without template validation pass

**Enforcement Mechanism:**
- Output filter layer between LLM and message dispatch scans for: currency symbols/patterns, commitment language ("confirmed", "booked", "guaranteed"), date-as-promise patterns
- Any match triggers: block send → route to operator queue → log violation
- LLM prompt engineering uses system instructions prohibiting financial outputs, but enforcement is architectural (filter layer), not prompt-reliant

---

## Unknowns & Evidence Gaps

| Unknown | Impact | How to Resolve | Priority |
|---------|--------|----------------|----------|
| Client willingness to interact via WhatsApp bot vs. human | High — adoption risk if clients perceive bot as downgrade | Pre-launch survey of top 50 clients + A/B test with opt-in group during pilot | P0 — resolve before scaling beyond pilot |
| LLM intent classification accuracy on domain-specific event jargon | Medium — misclassification routes to wrong queue, adds latency | Benchmark on 500 historical inquiry transcripts; target ≥ 90% top-1 accuracy | P0 — required for Phase 1 launch |
| Operator console adoption resistance | Medium — if operators bypass console, data flywheel breaks | Ride-along sessions with 3-5 operators during pilot; iterate on UX before mandating | P1 — pilot phase |
| WhatsApp Business API rate limits and template approval timelines | Medium — could constrain response speed | Engage Meta Business Partner for pre-approval of 20 core templates | P1 — begin immediately, long lead time |
| Volume profile: inquiry distribution by hour/day | Low-Medium — affects staffing model for approval queue | Analyze 6 months of historical inquiry logs | P2 — informational |
| Regulatory requirements for automated client communication in target markets | High — potential blocker | Legal review of consumer protection and data privacy requirements per market | P0 — must clear before pilot |

---

## Pass/Fail Readiness

### Phase 1 Launch Readiness Checklist

**PASS criteria (all must be met):**
- [ ] WhatsApp Business API approved and operational in primary market
- [ ] LLM intent classification ≥ 90% accuracy on test corpus
- [ ] Output filter layer blocks 100% of prohibited content patterns in adversarial test suite (≥ 200 test cases including prompt injection attempts)
- [ ] Deterministic pricing engine produces correct output for 100% of rate card scenarios
- [ ] Human approval gate functions correctly: no commitment message reaches client without operator action
- [ ] Operator console supports core workflow: view queue → review proposal → approve/edit/reject → send
- [ ] Audit log captures all operator actions and all LLM-to-client message flows
- [ ] Legal review complete for automated communication in launch market
- [ ] Pilot cohort of ≥ 10 real clients onboarded and consenting

**FAIL criteria (any one blocks launch):**
- [ ] Any pricing or commitment message reaches client without human approval in testing
- [ ] LLM intent accuracy < 85% on test corpus (below 85% = unacceptable misrouting rate)
- [ ] Output filter bypass discovered in adversarial testing and not mitigated
- [ ] WhatsApp Business API approval not obtained
- [ ] Legal blockers unresolved

### Current Assessment
**Status: NOT READY** — This is a greenfield PRD. No components are built. Readiness assessment is prospective.

**Highest-risk items:**
1. Output filter robustness against adversarial/unexpected LLM outputs (architectural, must be proven)
2. Client acceptance of bot-mediated interaction (market, must be validated)
3. WhatsApp template approval timeline (external dependency, long lead time)

---

## Recommended Next Artifact

**Immediate next step:** Technical Design Document (TDD) covering:
1. WhatsApp Business API integration architecture (webhook handling, session management, template registry)
2. LLM service design (model selection, prompt management, output filter specification with test harness)
3. Deterministic pricing engine schema and rule format
4. Operator console wireframes and API contract
5. Audit logging schema and retention policy

**Parallel workstream:** Client Research Sprint
- Survey top 50 clients on WhatsApp bot receptivity
- Collect 500 historical inquiry transcripts for LLM benchmark corpus
- Map current operator workflow for console design input

**Phase 1 timeline estimate:** 10-12 weeks from TDD approval to pilot launch (contingent on WhatsApp API approval, which should begin immediately as it is on the critical path).

---

## Appendix: Deterministic vs. Non-Deterministic Task Boundary

| Task | Classification | Rationale |
|------|---------------|----------|
| Parse "I need a venue for 200 people on March 15" → {guest_count: 200, date: 2027-03-15} | Non-deterministic (LLM) | Natural language understanding with ambiguity |
| Look up venue availability for date + capacity | Deterministic (DB query) | Exact match against inventory |
| Calculate price for Venue X + Package B + 200 guests | Deterministic (rule engine) | Rate card arithmetic, no judgment |
| Draft "Here are 3 venues that fit your needs" message | Non-deterministic (LLM) | Conversational fluency, but numbers injected from engine |
| Confirm booking | Human gate | Financial commitment |
| Handle "Can you do something special for my CEO's birthday?" | Human escalation | Off-menu, requires judgment |
