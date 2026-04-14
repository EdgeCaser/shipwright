# PRD: Team Inbox Workflow Handoff Improvement

## Decision Frame

**Problem statement:** Team inbox handoff between agents (human or automated) suffers from context loss, duplicate work, and ambiguous ownership transitions. When a conversation moves from one handler to another, the receiving party lacks sufficient context to continue without re-asking the customer or reading the full thread, increasing resolution time and degrading customer experience.

**Decision to be made:** Should we invest in a structured handoff protocol for team inboxes that preserves context, assigns explicit ownership, and enforces handoff completeness before transfer?

**Scope boundary — what this PRD owns:**
- The handoff context packet (structured data generated at transfer time)
- The two-phase ownership transfer protocol (propose/accept)
- The completeness gate (minimum required fields before handoff initiation)

**Scope boundary — what this PRD does NOT own but depends on:**

| Dependency | What we need from it | Status | Risk if unavailable |
|---|---|---|---|
| Inbox UI team | Surface for handoff intake view; changes to existing agent workspace | Unknown — requires alignment | High: without UI integration, context packet has no display surface |
| Routing/escalation system | Timeout escalation path when receiver doesn't accept | Exists today for SLA escalation; needs extension | Medium: fallback is manual escalation, degraded but functional |
| ML/data platform | Auto-generated summaries and sentiment signals | No current capability assessed | High: if unavailable, handoff packet is fully manual, increasing agent friction |
| Queue administration | Per-queue configuration of required handoff fields | Requires admin tooling that may not exist | Low: can ship with global defaults, per-queue config is enhancement |

This dependency table replaces the prior flat "out of scope" list, which obscured real coupling between this initiative and adjacent systems.

**Who decides:** Product lead for Support Tools, with sign-off from Engineering lead and CS Operations.

**Decision timeline:** Go/no-go by end of sprint planning for Q3. Implementation target: 6-week build if approved, contingent on dependency alignment.

## Core Requirements

### Tier 1 — Handoff Context Packet (core, no external dependencies)
When an agent initiates a handoff, the system generates a structured context packet containing:
- Summary of issue (manual entry by agent; auto-generated summary is a Tier 2 enhancement)
- Actions already taken (linked to system events where possible)
- Recommended next step (free text from handing-off agent)
- Attachments and linked tickets

### Tier 2 — Enhancements requiring cross-team dependencies
- **Auto-generated summary:** Depends on ML/data platform. If unavailable, Tier 1 manual summary is the fallback. Must be benchmarked before commitment (see Unknowns).
- **Customer sentiment signal:** Depends on ML/data platform. Nice-to-have, not load-bearing for core handoff value.
- **Per-queue configurable required fields:** Depends on queue administration tooling. Ship with global defaults first.

### Ownership Transfer Protocol
- Handoff is a two-phase commit: initiator proposes, receiver accepts
- No conversation enters unowned state; current owner persists until acceptance
- Timeout behavior: if receiver doesn't accept within configurable window (default 15 min), system alerts team lead via existing notification channel. Full escalation-engine integration is a dependency (see table above), not owned here.
- Audit trail: every ownership transition logged with timestamp, parties, and context packet snapshot

### Handoff Completeness Gate
- System enforces minimum fields before allowing handoff initiation (summary + next step required)
- Blocked at API level (not UI-only) with structured error responses indicating missing fields

### Receiving Agent Experience
- Context packet is the primary onboarding surface, displayed inline in the existing conversation view (minimal UI change) rather than requiring a dedicated new view
- One-click accept with option to request clarification (bounces back to sender with specific question)
- Thread history remains available as secondary context

## Unknowns & Evidence Gaps

| Unknown | Impact if wrong | How to resolve | Status |
|---|---|---|---|
| What percentage of handoffs currently lose context? | If low (<10%), ROI case weakens significantly | Instrument current handoff events and sample 200 conversations for context completeness | **Not started** |
| Will agents actually fill in context packets or treat them as friction? | Core mechanism fails if adoption is low | Prototype with 2 teams for 2 weeks, measure completion rates and qualitative feedback | **Not started** |
| Can auto-summary quality meet the bar for usefulness? | If auto-summaries are poor, Tier 2 enhancement is not viable and manual burden stays | Benchmark auto-summary against human summaries on 50 real threads | **Not started** |
| Does two-phase commit handoff create bottlenecks in high-volume queues? | Could increase queue times and worsen SLAs | Model queue dynamics with current handoff volume data; run simulation | **Not started** |
| How do customers perceive re-asking vs. slightly-wrong context? | Determines whether imperfect context is better or worse than asking again | Survey or interview 20 customers who experienced handoffs | **Not started** |
| Are cross-team dependencies (UI, ML, queue admin) available within the Q3 window? | If not, scope must shrink to Tier 1 only, reducing value proposition | Dependency alignment meetings with each team; confirm capacity | **Not started** |

## Pass/Fail Readiness

**Current readiness: NOT READY for build commitment.**

Blocking gaps:
1. **No baseline measurement.** We do not have data on current handoff failure rates, context loss frequency, or impact on resolution time. Without this, we cannot size the opportunity or set success metrics.
2. **Adoption risk untested.** The core mechanism depends on agents filling in structured data during handoff. Zero evidence this will happen at acceptable rates.
3. **Auto-summary feasibility unknown.** If auto-generated summaries don't meet quality bar, Tier 2 enhancements are not viable and the feature delivers less value.
4. **Dependency alignment not confirmed.** The requirements have real coupling to UI, ML/data platform, and queue admin systems. Without confirmed capacity from those teams, the 6-week build estimate is unreliable and scope may need to contract to Tier 1.

What would make this ready:
- Complete the baseline measurement (2 weeks)
- Run a paper prototype or wizard-of-oz test with 2 teams (2 weeks, can overlap)
- Benchmark auto-summary quality (1 week)
- Hold dependency alignment meetings with UI, ML, and queue admin teams (1 week)
- Revisit this PRD with data to update the decision frame and confirm achievable scope tier

## Recommended Next Artifact

**Next artifact: Discovery Brief**

Before this PRD can support a build decision, we need a structured discovery sprint covering:
1. Quantitative baseline: instrument and measure current handoff context loss rates
2. Agent workflow observation: shadow 5-10 agents during handoffs to understand current workarounds
3. Auto-summary feasibility spike: engineering spike to benchmark LLM-generated summaries against human ones on real threads
4. Dependency mapping: confirm capacity and timeline alignment with UI, ML/data platform, and queue admin teams to determine whether Tier 1 only or Tier 1+2 is feasible for Q3
5. Prototype test plan: design a 2-week pilot protocol for testing the handoff context packet with volunteer teams

The discovery brief should return to this PRD with updated evidence, at which point the Pass/Fail assessment can be revisited for build commitment.
