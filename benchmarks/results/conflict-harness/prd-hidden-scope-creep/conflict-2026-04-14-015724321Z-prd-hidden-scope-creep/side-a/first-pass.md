# PRD: Team Inbox Workflow Handoff Improvement

## Decision Frame

**Problem:** Team inbox handoff between agents is lossy — context drops, ownership is ambiguous during transitions, and customers experience repeated questions or stalled threads. This erodes CSAT and inflates handle time.

**Decision to make:** Should we invest in a structured handoff protocol within the team inbox, and if so, what is the minimum viable scope that demonstrably reduces handoff-related resolution failures?

**Scope boundary:** This PRD covers handoff *between human agents* within a shared team inbox. It does NOT cover:
- Bot-to-human escalation (separate system)
- Cross-team routing (requires org-level workflow changes)
- Inbox triage/assignment logic (upstream problem)
- SLA engine or priority scoring changes

**Stakeholders:** Support Operations (owner), Product Engineering (build), Support Agents (end users), CX Leadership (sponsor).

**Success criteria:** Reduce handoff-related re-contacts by 30% within 8 weeks of launch, measured by tickets where a customer repeats information after agent change.

## Context & Current State

### How handoffs work today
1. Agent A reassigns ticket to Agent B (or to queue) via dropdown.
2. No structured context transfer — Agent A may leave a free-text internal note, or may not.
3. Agent B opens ticket, reads full thread history to reconstruct context.
4. If Agent B misses context, customer is asked to repeat information.

### Observed failure modes
- **Silent reassign:** No internal note left. Agent B starts cold.
- **Partial note:** Agent A summarizes incompletely — key commitments or prior troubleshooting steps omitted.
- **Queue limbo:** Ticket reassigned to queue with no specific owner. Sits unactioned.
- **Ownership ambiguity:** During transition window, neither agent considers themselves responsible.

### Quantitative signals (assumed — require validation)
- Est. 15-25% of multi-touch tickets involve at least one handoff.
- Handoff tickets have ~40% longer resolution time (hypothesis, needs data pull).
- Internal NPS from agents cites "picking up someone else's mess" as top frustration.

## Proposed Solution

### Core mechanism: Structured Handoff Card
When an agent initiates reassignment, the system presents a required handoff card with:
1. **Summary** (free text, required, min 20 chars): What is the customer's issue?
2. **Status** (structured select): What stage is this at? (New / Investigating / Waiting on customer / Waiting on internal / Solution identified)
3. **Commitments made** (free text, optional but prompted): Anything promised to the customer?
4. **Next action** (free text, required): What should the next agent do first?

The handoff card is displayed prominently to Agent B upon ticket open — not buried in the note stream.

### Supporting changes
- **Ownership lock:** Ticket has exactly one owner at all times. Reassign is atomic — old owner released only when new owner is assigned.
- **Handoff indicator:** Visual badge on tickets that have been handed off, with count.
- **Handoff quality nudge:** If Agent B re-asks a question the customer already answered (detected via simple keyword overlap), surface a prompt: "The customer may have already provided this — check handoff card."

### What this is NOT
- Not an AI summarizer. The handoff card is human-authored. AI summarization is a future iteration but introduces trust/accuracy risks that would slow this initiative.
- Not a workflow engine. We are not changing routing rules, assignment logic, or SLA handling.
- Not a performance management tool. Handoff data is for operational improvement, not individual agent scoring.

## Unknowns & Evidence Gaps

| # | Unknown | Impact if wrong | How to resolve | Status |
|---|---------|-----------------|----------------|--------|
| U1 | Actual handoff frequency and resolution time delta | Scope may be too small to justify investment | Query ticket system for reassignment events + resolution times, segment by handoff count | **Not started** |
| U2 | Agent compliance with required fields | If agents game it ("asdf" in summary), value collapses | Prototype with 5-agent pilot, measure field quality after 2 weeks | **Not started** |
| U3 | Whether keyword-overlap nudge produces false positives at annoying rates | Agents ignore or disable nudge | Threshold tuning needed — run offline analysis on 500 historical handoff tickets | **Not started** |
| U4 | Whether handoff card display position is noticeable enough | Agent B still reads full thread, ignoring card | A/B test card placement (top-of-ticket vs. modal on open) during pilot | **Not started** |
| U5 | Ticket system API supports atomic reassignment with required fields | May require workaround or system upgrade | Engineering spike, 2 days | **Not started** |

## Pass/Fail Readiness

**Current readiness: NOT READY for build. Ready for validation sprint.**

| Gate | Status | Blocker? |
|------|--------|----------|
| Problem validated with data | NO — handoff frequency and impact are estimated, not measured | YES |
| Solution shaped with user input | NO — no agent interviews or prototype feedback yet | YES |
| Technical feasibility confirmed | NO — atomic reassignment API capability unknown | YES |
| Scope locked and bounded | PARTIAL — core scope is clear, but nudge feature may be cut depending on U3 | No |
| Success metric is measurable | YES — re-contact rate after handoff is queryable | No |
| Stakeholder alignment | PARTIAL — CX Leadership sponsor identified, Eng capacity not confirmed | Soft yes |

**Verdict:** Three hard blockers remain. Do not proceed to engineering build until U1, U2, and U5 are resolved. Recommend a 2-week validation sprint before committing to build.

## Recommended Next Artifact

**Validation Sprint Plan** containing:
1. **Data pull (U1):** Query ticket system for handoff frequency, resolution time segmentation, and re-contact rates. 3 days.
2. **Agent interviews (U2):** 5 structured interviews with high-volume agents on current handoff pain points and reaction to proposed handoff card. 3 days.
3. **Engineering spike (U5):** Confirm atomic reassignment feasibility and estimate build effort. 2 days.
4. **Decision checkpoint:** If U1 confirms >15% handoff rate AND >20% resolution time increase, proceed to build. Otherwise, reconsider prioritization.

Do not produce a technical spec or sprint plan until the validation sprint completes with passing results.
