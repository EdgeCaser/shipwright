# PRD: Team Inbox Workflow Handoff Improvement

## Decision Frame

**Problem statement:** Team inbox handoff between agents is lossy—context drops, ownership is ambiguous during transitions, and customers experience repeated questions or stalled threads. This degrades CSAT and increases handle time.

**Decision to be made:** Should we invest in a structured handoff protocol within the team inbox, and if so, what is the minimum viable scope that reduces handoff-related re-contacts?

**Who decides:** Product lead (owns inbox roadmap) with sign-off from Support Operations.

**Decision deadline:** End of current planning cycle. Delay risks another quarter of compounding handoff debt.

**Scope boundaries:**
- **In scope:** Handoff metadata capture, ownership transfer protocol, handoff summary UI, basic routing rules for reassignment.
- **Out of scope:** Full AI auto-routing, workforce management integration, SLA engine changes, multi-channel unification (chat + email + phone merge). These are adjacent but independent initiatives.
- **Scope creep watch:** The phrase "workflow handoff improvement" invites broad interpretation. Queue prioritization, skill-based routing, workload balancing, and real-time presence are adjacent concerns that could drift into scope. This PRD excludes them as a defensive boundary, though no evidence currently suggests stakeholders are pushing for their inclusion.

**Primary risks (ranked):**
1. **Unvalidated problem sizing (U1):** We have not confirmed that handoff context loss is a significant driver of re-contacts. If it accounts for <20% of re-contacts, the success metric is unachievable regardless of execution.
2. **Platform feasibility (U4):** Atomic ownership transfer is a P0 requirement. If the platform cannot support it without major refactoring, the timeline and scope require renegotiation.
3. **Scope absorption:** A standing risk given the broad framing, but currently a defensive concern rather than an active threat.

**Success metric:** Reduce handoff-related re-contacts (customer replies within 2 hours of reassignment that repeat prior context) by 30% within 8 weeks of launch.

## Requirements

### P0 — Must ship
1. **Handoff summary block:** When an agent reassigns a conversation, they must populate a structured summary (issue category, current status, next action needed, customer sentiment tag). This block is visible to the receiving agent before they reply.
2. **Ownership transfer protocol:** Conversation ownership transfers atomically—no period where a conversation is unowned. The previous owner remains accountable until the new owner explicitly accepts.
3. **Handoff history trail:** Every handoff event is logged with timestamp, from-agent, to-agent, and summary content. Visible in the conversation timeline.

### P1 — Should ship
4. **Reassignment reason taxonomy:** Dropdown with 5-7 predefined reasons (shift end, escalation, skill mismatch, customer request, capacity). Enables reporting on handoff patterns.
5. **Receiving agent notification:** In-app alert with conversation preview and handoff summary when a conversation is assigned to you.

### P2 — Nice to have
6. **Handoff quality score:** Automated check that the summary block meets minimum completeness (all fields populated, next action is specific). Warns sender if summary is thin.

### Explicitly excluded
- AI-generated handoff summaries (future iteration; depends on this structured data existing first)
- Skill-based auto-routing (separate initiative, separate PRD)
- Queue rebalancing or workload algorithms
- Cross-channel handoff (e.g., email-to-chat transfer)

## Unknowns & Evidence Gaps

| # | Unknown | Impact if wrong | How to close | Status |
|---|---------|-----------------|-------------|--------|
| U1 | What % of re-contacts are actually caused by handoff context loss vs. other factors (slow response, policy confusion)? | If handoff is <20% of re-contacts, the 30% reduction target is unreachable with this scope alone. | Pull re-contact cohort from last 90 days, tag a sample of 200 for root cause. | **Not started — blocking for go/no-go** |
| U2 | Will agents actually fill in the summary block, or will they treat it as friction and leave it blank? | Empty summaries = no improvement. Feature becomes shelfware. | Prototype with 5 agents for 1 week. Measure completion rate and quality. | Not started |
| U3 | How long does a typical handoff summary take to write? | If >90 seconds, agent throughput drops and operations may push back. | Time the prototype cohort. | Not started |
| U4 | Does the current inbox platform support atomic ownership transfer, or is there a race condition window? | Engineering feasibility of P0-2. May require platform-level changes that blow up the timeline. | Engineering spike, 2 days. | **Not started — blocking for go/no-go** |

## Pass/Fail Readiness

**Current readiness: NOT READY TO BUILD.**

Blocking gaps:
- **U1 is unresolved.** Without root-cause data on re-contacts, we cannot confirm the problem is sized correctly. If handoff context loss accounts for <20% of re-contacts, this PRD's success metric is unachievable and scope should be revisited.
- **U4 is unresolved.** Atomic ownership transfer is a P0 requirement. If the platform doesn't support it without major refactoring, the timeline and scope need renegotiation.

Conditions to pass:
1. U1 analysis complete, confirming handoff context loss drives ≥30% of re-contacts.
2. U4 engineering spike complete, confirming atomic transfer is feasible within one sprint.
3. If either condition fails, return to Decision Frame for scope revision before proceeding.

## Recommended Next Artifact

**Next artifact: Evidence brief resolving U1 and U4.**

- U1: Re-contact root cause analysis (200-conversation sample, tagged by category). Output: percentage breakdown with confidence interval.
- U4: Engineering spike on ownership transfer atomicity. Output: feasibility memo with effort estimate.

Only after both are resolved should the team proceed to technical design. Skipping this step risks building a feature that addresses a symptom we haven't confirmed is the dominant cause.
