# PRD: Team Inbox Workflow Handoff Improvement

## Decision Frame

**Problem statement:** Team inbox handoff between shifts/agents is lossy — conversations get dropped, context is repeated, and customers experience delays when ownership transfers. This PRD scopes an improvement to handoff mechanics within an existing team inbox product.

**Decision to be made:** Should we invest in a structured handoff mechanism (handoff summary + explicit ownership transfer), or is the current implicit reassignment sufficient?

**Scope boundary:** This PRD covers handoff between human agents within a single team inbox. It does NOT cover:
- Bot-to-human handoff (separate initiative)
- Cross-team routing or escalation paths
- Inbox triage or auto-assignment algorithms
- Customer-facing UI changes
- Reporting/analytics dashboards for handoff metrics

**Stakeholders:** Support Operations (owner), Engineering (builder), Product (sponsor), QA (validation)

**Success criteria:**
- Reduce median time-to-first-response after handoff by 30%
- Reduce customer repeat-context rate (measured via survey) by 25%
- Zero increase in average handle time per conversation

### Requirements

Requirements are split into two tiers. The **MVP tier (R1-R2)** is the committed scope if discovery succeeds. The **fast-follow tier (R3-R5)** is explicitly deferred — included here only to document adjacent work we chose NOT to bundle, preventing future scope creep disguised as "obvious additions."

**MVP Tier (committed scope post-discovery)**

| ID | Requirement | Rationale | Scope justification |
|----|------------|----------|--------------------|
| R1 | Structured handoff summary auto-generated from conversation history | Eliminates context loss at transfer — directly addresses the core problem | Core handoff mechanic |
| R2 | Explicit "transfer ownership" action with required reason field | Creates accountability and audit trail for each transfer | Core handoff mechanic |

**Fast-Follow Tier (explicitly deferred — not in MVP)**

| ID | Requirement | Rationale | Why deferred |
|----|------------|----------|-------------|
| R3 | SLA clock pauses during active handoff (max 5 min window) | Prevents false SLA breaches during legitimate transfers | Touches SLA/metrics infrastructure — separate concern from handoff UX |
| R4 | Receiving agent sees handoff summary pinned at top of conversation | Reduces time to re-orient | UX optimization; R1 delivers the summary, R4 optimizes placement |
| R5 | Handoff history visible in conversation sidebar | Supports retrospective analysis | Analytics-adjacent; value depends on handoff volume data (U4) |

## Unknowns & Evidence Gaps

| ID | Unknown | Impact if wrong | Proposed resolution | Status |
|----|---------|-----------------|--------------------|---------|
| U1 | We assume handoff is the primary driver of repeat-context, but it may be poor internal notes | High — wrong root cause means wrong solution | Analyze 200 conversations with repeat-context tags; check if handoff was involved | NOT STARTED |
| U2 | Auto-generated summaries may be inaccurate or too verbose, reducing trust | Medium — agents ignore summaries, no improvement | Prototype with 3 summary strategies; test with 10 agents over 1 week | NOT STARTED |
| U3 | SLA clock pause could be gamed to artificially improve SLA metrics | Medium — undermines reporting integrity | Cap pause at 5 min; flag conversations with >2 handoffs for review | DEFERRED WITH R3 |
| U4 | Volume of handoffs per day is assumed to be >15% of conversations but not validated | High — low volume means low ROI | Pull handoff frequency from assignment logs for last 90 days | NOT STARTED |
| U5 | We do not know if agents will use the structured transfer vs. informal Slack-based handoff | Medium — adoption failure | Interview 8 agents on current handoff workflow before build | NOT STARTED |

## Pass/Fail Readiness

**Overall assessment: NOT READY to build.**

| Gate | Status | Blocker? |
|------|--------|---------|
| Root cause validated (U1) | Not started | YES |
| Handoff volume validated (U4) | Not started | YES |
| Agent workflow understood (U5) | Not started | YES |
| Summary prototype tested (U2) | Not started | No — can run in parallel with build |
| Engineering feasibility confirmed | Not assessed | No — standard CRUD + LLM summarization |
| MVP scope locked to R1-R2 | Locked in this document | No |

**Blocking items before build commitment:**
1. Resolve U1 — confirm handoff is actually the root cause of repeat-context
2. Resolve U4 — confirm handoff volume justifies investment
3. Resolve U5 — confirm agents would actually use structured handoff

**Scope creep risks identified:**
- Pressure to add cross-team routing (out of scope — separate initiative)
- Pressure to bundle R3-R5 into MVP (explicitly deferred to fast-follow)
- Pressure to extend to bot-to-human handoff (explicitly excluded)
- Auto-assignment optimization is adjacent but distinct — do not bundle

## Recommended Next Artifact

**Next step: Discovery spike (1 week)**

Before committing engineering resources, resolve the three blocking unknowns:

1. **Conversation audit (U1):** Analyze 200 tagged repeat-context conversations to confirm handoff as root cause. Output: root cause distribution chart.
2. **Volume analysis (U4):** Pull assignment-change events from last 90 days. Output: handoff frequency by team, time of day, day of week.
3. **Agent interviews (U5):** 30-min interviews with 8 agents across 2 teams. Output: current handoff workflow map + pain points.

**If discovery confirms the problem:** Proceed to technical design doc scoped to R1-R2 only. R3-R5 enter backlog as separate, prioritized items.

**If discovery contradicts assumptions:** Pivot to whatever root cause the conversation audit reveals. This PRD should be shelved, not force-fitted.
