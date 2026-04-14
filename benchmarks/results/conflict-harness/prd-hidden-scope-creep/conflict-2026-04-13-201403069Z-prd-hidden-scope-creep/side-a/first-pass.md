# PRD: Team Inbox Workflow Handoff Improvement

## Decision Frame

**Problem statement:** Team inbox handoff workflows suffer from dropped conversations, unclear ownership transitions, and loss of context when work passes between agents or shifts. This leads to repeated customer contacts, slower resolution times, and agent frustration.

**Decision to be made:** Should we invest in a structured handoff protocol within the team inbox, and if so, what is the minimum viable scope that addresses the core ownership-gap problem without expanding into adjacent workflow areas?

**Scope boundary:** This PRD covers *handoff mechanics* only — the moment one agent transfers ownership of a conversation to another agent or queue. It explicitly excludes:
- Routing/assignment logic (how conversations arrive initially)
- SLA engine or escalation policy changes
- Customer-facing UI changes
- Analytics/reporting dashboards
- AI-assisted response drafting
- Queue prioritization algorithms

**Why this scope matters:** Handoff improvements are frequently used as a vehicle for broader workflow redesign. Each excluded item above is a real need, but bundling them creates a project that takes 3-4x longer, ships nothing for months, and optimizes for comprehensiveness over impact. This PRD intentionally draws a hard line.

**Target users:** Support agents performing or receiving handoffs within shared team inboxes.

**Success criteria:**
- Reduce "orphaned" conversations (no owner for >30 min during business hours) by 60%
- Reduce repeat customer contacts caused by lost handoff context by 40%
- Agent-reported handoff friction score improves from current baseline (to be measured)

## Core Requirements

### R1: Explicit Handoff Action
Agents must perform a deliberate handoff action (not just unassign). The handoff action requires:
- Selecting a target (specific agent or queue)
- Adding a handoff note (mandatory, minimum 20 characters)
- Confirming the transfer

**Rationale:** Today, conversations are "handed off" by unassigning — which is indistinguishable from abandonment. An explicit action creates accountability.

### R2: Handoff Context Bundle
When a handoff occurs, the receiving agent sees a structured context card:
- Summary of customer issue (agent-written at handoff)
- Actions already taken (auto-extracted from conversation timeline)
- Reason for handoff (selected from taxonomy: shift end, expertise needed, escalation, workload)
- Link to full conversation history

**Rationale:** Context loss is the #1 driver of repeat contacts post-handoff.

### R3: Ownership Continuity Guarantee
The system enforces that a conversation always has exactly one owner during business hours:
- Handoff is atomic: old owner releases only when new owner accepts or auto-accept window (5 min) expires
- If auto-accept expires, conversation returns to original owner with alert
- After-hours: conversations enter a "pending handoff" queue visible to next shift

**Rationale:** The current gap — where a conversation has zero owners — is the root cause of orphaned conversations.

### R4: Handoff Audit Trail
All handoffs are logged with: timestamp, from-agent, to-agent/queue, handoff note, acceptance timestamp. This trail is visible to team leads but not customers.

**Rationale:** Without observability, handoff quality cannot be measured or improved.

## Unknowns & Evidence Gaps

| # | Unknown | Impact if wrong | How to close | Status |
|---|---------|-----------------|-------------|--------|
| U1 | Actual orphaned conversation rate — we assume it's high but have no baseline metric | Success criteria may be miscalibrated; we can't measure improvement | Instrument current system to count ownership gaps >30 min over 2-week period | **Not started** |
| U2 | Whether mandatory handoff notes create meaningful friction that slows agents | Could reduce throughput and create resentment; agents may write garbage notes | Run 1-week pilot with 2 teams, measure handle time delta and note quality | **Not started** |
| U3 | Whether the 5-minute auto-accept window is the right duration | Too short = rejected handoffs pile up; too long = delayed responses | Analyze current response-to-assignment time distribution to pick p75 | **Not started** |
| U4 | Whether agents will game the system by handing off difficult conversations | Could shift the problem rather than solve it; creates team friction | Monitor handoff-reason taxonomy usage during pilot; interview agents | **Not started** |
| U5 | Integration constraints with existing inbox platform (API limits, webhook latency) | Could force architectural compromises that weaken the ownership guarantee | Engineering spike: 3 days to validate atomic handoff is feasible in current stack | **Not started** |

## Pass/Fail Readiness

**Current readiness: NOT READY to build.**

Blocking gaps:
1. **No baseline data (U1):** We cannot set meaningful success criteria or measure impact without knowing current orphaned conversation rates. This is a 2-week instrumentation effort.
2. **Feasibility unvalidated (U5):** The atomic ownership guarantee (R3) is the core value proposition. If the platform can't support it, the design changes fundamentally. This requires a 3-day engineering spike.
3. **Agent friction unknown (U2):** Mandatory handoff notes could backfire. A 1-week pilot with opt-in teams would derisk this before full build.

Non-blocking but important:
- U3 (auto-accept window) can be tuned post-launch with a config value
- U4 (gaming) is a monitoring concern, not a build-blocker

**Gate to proceed:** Close U1, U2, and U5 before committing engineering resources to full build. Estimated: 3 weeks of discovery work.

## Recommended Next Artifact

**Immediate next step:** Discovery brief covering U1, U2, and U5 in parallel:
1. **Instrumentation plan** for orphaned conversation baseline (U1) — owner: engineering
2. **Pilot design** for mandatory handoff notes with 2 volunteer teams (U2) — owner: product + support ops
3. **Engineering spike scope** for atomic handoff feasibility (U5) — owner: engineering

After discovery completes, the next artifact is a **revised PRD** with validated success criteria and confirmed technical approach, followed by a **technical design doc** for the handoff system.

**What this PRD intentionally defers:** Any expansion into routing, SLA, analytics, or AI-assist. If discovery reveals that handoff improvement alone doesn't move the needle, the correct response is to reconsider the problem framing — not to silently expand scope.
