# PRD: Team Inbox Workflow Handoff Improvement

## Decision Frame

**Problem statement:** Team inbox handoff workflows suffer from dropped context, unclear ownership transitions, and silent failures when conversations move between agents or shifts. This creates customer-facing delays and internal rework.

**Decision to be made:** Should we invest in a structured handoff protocol within the team inbox, and if so, what is the minimum viable scope that addresses the highest-friction failure modes?

**Stakeholders:** Support team leads, frontline agents, engineering (inbox platform team), customers (indirect).

**Scope boundary:** This PRD covers handoff between human agents within a single team inbox. It explicitly excludes: bot-to-human escalation flows, cross-team routing, SLA engine changes, and inbox UI redesign. These are adjacent concerns that may surface during implementation but must be treated as separate initiatives with their own decision frames.

**Success criteria:**
- Reduce handoff-related reopen rate by ≥30% within 8 weeks of launch.
- Achieve ≥80% agent adoption of structured handoff fields within 4 weeks.
- No increase in median first-response time as a side effect.

## Requirements

### Core (P0)
1. **Handoff context block:** When an agent hands off a conversation, they must complete a structured summary (what was tried, what remains, customer sentiment) that travels with the ticket. This is not optional free-text — it uses constrained fields.
2. **Ownership transfer protocol:** Explicit accept/decline mechanism. No conversation enters a new agent's queue without acknowledgment. Declined handoffs return to the originator with a reason code.
3. **Handoff audit trail:** Every ownership change is logged with timestamp, originator, recipient, and context block. Visible to team leads in reporting.

### Important (P1)
4. **Handoff SLA nudge:** If a handed-off conversation sits unaccepted for >15 minutes, escalate visibility to team lead dashboard. Configurable threshold.
5. **Bulk shift handoff:** End-of-shift agents can batch-transfer remaining open conversations with per-ticket context blocks pre-populated from conversation history (agent reviews and edits before sending).

### Out of scope (explicitly deferred)
- Auto-generated handoff summaries via AI. This is a natural extension but introduces accuracy risk and should be its own validated initiative.
- Customer-facing handoff notifications. Requires UX research on whether transparency helps or creates anxiety.
- Cross-inbox or cross-team handoff. Different ownership model, different stakeholders.
- Changes to assignment algorithm or load balancing.

## Unknowns & Evidence Gaps

| # | Unknown | Impact if wrong | Proposed resolution | Status |
|---|---------|----------------|---------------------|--------|
| U1 | What percentage of reopens are actually caused by handoff failures vs. other factors (e.g., incomplete resolution)? | We may be solving a smaller problem than assumed. Success criteria may be unachievable. | Pull reopen-reason codes from last 90 days; interview 5 agents on root causes. | **Not started** |
| U2 | Will agents actually fill in structured context blocks under time pressure? | Core mechanism fails if adoption is low. Becomes shelfware. | Prototype with 1 team for 2 weeks; measure completion rate and quality. | **Not started** |
| U3 | Does the accept/decline mechanism create queue bottlenecks during peak hours? | Could increase response times, violating success criteria. | Simulate with historical handoff volume data before building. | **Not started** |
| U4 | What is the current baseline handoff-related reopen rate? | Cannot measure success without baseline. | Instrument current inbox; 2-week measurement period. | **Not started** |

## Pass/Fail Readiness

**Verdict: NOT READY for engineering investment.**

**Reason:** All four unknowns (U1–U4) are unresolved. The most critical gap is U1 — we have not validated that handoff failures are the primary driver of the problem we're trying to solve. Investing in a structured handoff protocol without this evidence risks building an elaborate solution to a secondary cause.

**Gate conditions to proceed:**
1. U1 resolved: Confirm handoff-related reopens account for ≥40% of total reopens (otherwise reframe the problem).
2. U4 resolved: Baseline measurement established so success criteria are testable.
3. U2 de-risked: At minimum, a paper prototype or mockup validated with 3+ agents confirming the context block is completable in <60 seconds.

**Scope creep warning:** The prompt "workflow handoff improvement" is broad enough to absorb adjacent problems (routing, AI summarization, customer notification, cross-team flows). Each of these has been explicitly excluded above. If discovery on U1 reveals that the real problem is upstream (e.g., bad initial routing causes most reopens), this PRD should be shelved in favor of a routing-focused initiative — not expanded to include routing.

## Recommended Next Artifact

**Immediate next step:** Discovery brief focused on resolving U1 and U4. This is a 2-week instrumentation + interview sprint, not a design sprint.

**Artifact sequence if gates pass:**
1. Discovery brief (resolve U1, U4) → 2 weeks
2. Prototype spec for context block UX (resolve U2) → 1 week
3. Technical design doc for ownership transfer protocol → 1 week
4. Pilot plan with single team → define scope after discovery

**If gates fail:** Redirect investigation toward actual root cause of reopens. This PRD becomes reference material, not a backlog item.
