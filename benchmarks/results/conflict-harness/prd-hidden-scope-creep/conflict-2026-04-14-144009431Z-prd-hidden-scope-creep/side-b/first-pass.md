# PRD: Team Inbox Workflow Handoff Improvement

## Decision Frame

**Problem statement:** Team inbox handoff between agents (human or automated) suffers from context loss, duplicate work, and ambiguous ownership transitions. When a conversation moves from one handler to another, the receiving party lacks sufficient context to continue without re-asking the customer or reading the full thread, increasing resolution time and degrading customer experience.

**Decision to be made:** Should we invest in a structured handoff protocol for team inboxes that preserves context, assigns explicit ownership, and enforces handoff completeness before transfer?

**Scope boundary:** This PRD covers the handoff mechanism only — not routing/assignment logic, not inbox UI redesign, not SLA engine changes. Adjacent systems are explicitly out of scope:
- Auto-routing and triage rules (separate initiative)
- Customer-facing status notifications (dependency, not owned here)
- Reporting/analytics dashboards (downstream consumer, not gated)

**Who decides:** Product lead for Support Tools, with sign-off from Engineering lead and CS Operations.

**Decision timeline:** Go/no-go by end of sprint planning for Q3. Implementation target: 6-week build if approved.

## Core Requirements

### Handoff Context Packet
When an agent initiates a handoff, the system generates a structured context packet containing:
- Summary of issue (auto-generated from thread, editable by agent)
- Actions already taken (linked to system events where possible)
- Customer sentiment signal (derived from tone/keywords)
- Recommended next step (free text from handing-off agent)
- Attachments and linked tickets

### Ownership Transfer Protocol
- Handoff is a two-phase commit: initiator proposes, receiver accepts
- No conversation enters unowned state; current owner persists until acceptance
- Timeout escalation: if receiver doesn't accept within configurable window (default 15 min), escalates to team lead
- Audit trail: every ownership transition logged with timestamp, parties, and context packet snapshot

### Handoff Completeness Gate
- System enforces minimum fields before allowing handoff initiation (summary + next step required)
- Optional: team-configurable required fields per queue
- Incomplete handoffs blocked at UI level with clear guidance on what's missing

### Receiving Agent Experience
- Dedicated handoff intake view showing context packet prominently
- One-click accept with option to request clarification (bounces back to sender with specific question)
- Thread history available but context packet is the primary onboarding surface

## Unknowns & Evidence Gaps

| Unknown | Impact if wrong | How to resolve | Status |
|---|---|---|---|
| What percentage of handoffs currently lose context? | If low (<10%), ROI case weakens significantly | Instrument current handoff events and sample 200 conversations for context completeness | **Not started** |
| Will agents actually fill in context packets or treat them as friction? | Core mechanism fails if adoption is low | Prototype with 2 teams for 2 weeks, measure completion rates and qualitative feedback | **Not started** |
| Can auto-summary quality meet the bar for usefulness? | If auto-summaries are poor, manual burden increases and agents skip them | Benchmark auto-summary against human summaries on 50 real threads | **Not started** |
| Does two-phase commit handoff create bottlenecks in high-volume queues? | Could increase queue times and worsen SLAs | Model queue dynamics with current handoff volume data; run simulation | **Not started** |
| How do customers perceive re-asking vs. slightly-wrong context? | Determines whether imperfect context is better or worse than asking again | Survey or interview 20 customers who experienced handoffs | **Not started** |

## Pass/Fail Readiness

**Current readiness: NOT READY for build commitment.**

Blocking gaps:
1. **No baseline measurement.** We do not have data on current handoff failure rates, context loss frequency, or impact on resolution time. Without this, we cannot size the opportunity or set success metrics.
2. **Adoption risk untested.** The core mechanism depends on agents filling in structured data during handoff. Zero evidence this will happen at acceptable rates.
3. **Auto-summary feasibility unknown.** If auto-generated summaries don't meet quality bar, the feature's value proposition shifts from "effortless context" to "more forms to fill out."

What would make this ready:
- Complete the baseline measurement (2 weeks)
- Run a paper prototype or wizard-of-oz test with 2 teams (2 weeks, can overlap)
- Benchmark auto-summary quality (1 week)
- Revisit this PRD with data to update the decision frame

## Recommended Next Artifact

**Next artifact: Discovery Brief**

Before this PRD can support a build decision, we need a structured discovery sprint covering:
1. Quantitative baseline: instrument and measure current handoff context loss rates
2. Agent workflow observation: shadow 5-10 agents during handoffs to understand current workarounds
3. Auto-summary feasibility spike: engineering spike to benchmark LLM-generated summaries against human ones on real threads
4. Prototype test plan: design a 2-week pilot protocol for testing the handoff context packet with volunteer teams

The discovery brief should return to this PRD with updated evidence, at which point the Pass/Fail assessment can be revisited for build commitment.
