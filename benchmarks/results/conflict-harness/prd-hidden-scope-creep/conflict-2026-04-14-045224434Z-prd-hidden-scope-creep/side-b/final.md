# PRD: Team Inbox Workflow Handoff Improvement

## Decision Frame

**Problem statement:** Team inbox handoff between shifts, roles, or escalation tiers produces dropped conversations, duplicated effort, and delayed responses. Customers experience this as being "passed around" or having to repeat context.

**Decision to be made:** Should we invest in a structured handoff mechanism within the team inbox, and if so, what is the minimum scope that addresses the core failure modes?

**Who decides:** Product lead (owns team inbox), with sign-off from Engineering lead on feasibility and Support Operations lead on workflow fit.

**Decision deadline:** End of current planning cycle. If we miss this window, the next opportunity is Q3.

**Scope boundary:** This PRD covers handoff between agents within a single team inbox. It does NOT cover:
- Cross-team routing or re-assignment workflows
- Automated triage or AI-assisted classification
- SLA engine changes
- Customer-facing status notifications
- Analytics dashboards or reporting

These are adjacent concerns that may arise during implementation discussion. They are explicitly out of scope to prevent the handoff improvement from becoming a platform rewrite.

## Background & Evidence

**Observed failure modes (from support operations data):**
1. **Context loss on handoff:** Agent B picks up a conversation without knowing what Agent A already tried or promised. Result: repeated questions, contradictory answers.
2. **Ambiguous ownership:** Conversations sit in a "handed off" limbo where neither the originating nor receiving agent considers it theirs. Result: response time spikes.
3. **Silent handoffs:** Agent A leaves for the day, conversation returns to queue with no annotation. Result: next agent starts from scratch.

**What we do NOT yet know:** See Unknowns section below.

## Solution Alternatives Considered

The three failure modes above suggest several possible interventions at different scope levels. The question is which combination constitutes a defensible minimum:

| Alternative | Addresses context loss? | Addresses ownership ambiguity? | Addresses silent handoffs? | Scope/complexity |
|---|---|---|---|---|
| A. Optional handoff notes only | Partially — agents who opt in benefit, but voluntary adoption likely low | No | No — silent handoffs remain possible | Lowest |
| B. Queue-state ownership rules only (auto-assign on pickup) | No | Yes — eliminates limbo state | No — context still lost | Low |
| C. Accept/acknowledge mechanism only | No | Partially — signals receipt but not responsibility duration | No | Low |
| D. Required handoff note + explicit ownership transfer | Yes | Yes | Yes — handoff is a discrete event, cannot be silent | Medium |
| E. D + AI-generated summaries + analytics | Yes | Yes | Yes | High — adds ML dependency |

**Why Alternative D is proposed over narrower options:** Alternatives A–C each address only one or two of the three failure modes. Since the failure modes compound (a silent handoff with no context and no clear owner is worse than any single failure), a partial fix risks investment without measurable improvement. Alternative D is the narrowest scope that addresses all three simultaneously. Alternative E adds capabilities that are valuable but not necessary to close the core failure loops.

**This is a hypothesis, not a proven claim.** The manual pilot (see Recommended Next Artifact) is designed to test whether the bundled intervention is necessary or whether a narrower alternative (e.g., ownership rules alone) would capture most of the value. If the pilot reveals that ownership ambiguity is the dominant driver and context loss is secondary, the build scope should shrink to Alternative B.

## Proposed Solution (Minimum Viable — Subject to Pilot Validation)

### Core capability: Structured Handoff Note
When an agent hands off a conversation, the system requires a structured handoff note containing:
- **Summary:** What the customer needs (1-2 sentences)
- **Status:** What has been done so far
- **Next step:** What the receiving agent should do next
- **Commitments:** Any promises made to the customer (e.g., "told them we'd respond by EOD")

This note is visible to the receiving agent as a pinned annotation at the top of the conversation thread.

### Core capability: Explicit Ownership Transfer
- Handoff is a discrete action (not just re-assignment) that transfers ownership with an audit trail.
- Conversation cannot enter an unowned state. If the target agent does not accept within a configurable window, it returns to the team queue with the handoff note preserved.
- The originating agent remains on the hook until ownership is accepted.

### Core capability: Handoff Visibility
- Team lead view shows all in-flight handoffs with time-since-handoff.
- Conversations with pending handoffs are visually distinct in the queue.

## What This PRD Intentionally Excludes

The following features are reasonable extensions but represent scope creep risk. Each is flagged with the rationale for exclusion:

| Feature | Why excluded | When to revisit |
|---|---|---|
| Auto-generated handoff summaries (AI) | Adds ML dependency, training data requirement, accuracy risk | After v1 proves handoff notes are valuable |
| Cross-team handoff | Different routing logic, permission models | Separate PRD if intra-team handoff succeeds |
| Customer notification of handoff | Requires customer-facing copy decisions, notification channel work | Post-launch based on CSAT signal |
| Handoff analytics dashboard | Reporting is valuable but not blocking the core workflow fix | Fast-follow, can use raw data exports initially |
| SLA clock adjustments during handoff | Complex policy decision, varies by team | Requires ops stakeholder alignment |

## Unknowns & Evidence Gaps

1. **Handoff volume:** We do not have reliable data on how many conversations per day involve a handoff. Estimate: 15-30% of conversations based on anecdotal input from team leads. **Action needed:** Pull queue reassignment logs for last 90 days before committing to implementation timeline.

2. **Agent compliance:** Will agents fill out structured handoff notes, or will they treat them as friction and enter minimal/garbage data? **Action needed:** Run a 2-week manual pilot with paper-based handoff notes in one team to measure completion quality before building the feature.

3. **Acceptance window duration:** What is the right timeout before an unaccepted handoff returns to queue? Too short creates pressure; too long defeats the purpose. **Action needed:** Interview 5 team leads on shift-change patterns to inform the default.

4. **Receiving agent capacity:** Handoff assumes the target agent can take on more work. No capacity signal exists today. **Risk:** Handoffs pile up on already-overloaded agents. **Mitigation for v1:** Return-to-queue fallback. Capacity-aware routing is a future enhancement, not a v1 requirement.

5. **Impact magnitude:** We believe handoff failures cause ~20% of negative CSAT responses in multi-touch conversations. This is an estimate, not a measurement. **Action needed:** Tag a sample of 100 low-CSAT multi-touch conversations to validate.

6. **Relative failure-mode severity:** We do not know which of the three failure modes (context loss, ownership ambiguity, silent handoffs) drives the most customer pain. **Action needed:** The manual pilot should track which failure mode each handoff would have triggered without intervention, to determine whether the full bundle is necessary or a narrower scope suffices.

## Pass/Fail Readiness

**This PRD is NOT ready for engineering commitment.** It is ready for stakeholder alignment on scope.

| Readiness criterion | Status | Blocker? |
|---|---|---|
| Problem validated with data | Partial — anecdotal, not measured | Yes |
| Scope boundaries agreed by stakeholders | Draft — needs review | Yes |
| Solution validated with users | No — need pilot results | Yes |
| Technical feasibility assessed | Not started | Yes |
| Solution scope justified against alternatives | Draft — alternatives enumerated, pilot designed to validate | Yes |
| Success metrics defined | Draft (see below) | No |
| Edge cases enumerated | Partial | No |

**Draft success metrics (to be validated):**
- Primary: Reduce median time-to-first-response-after-handoff by 40%
- Secondary: Reduce repeat-context customer messages ("as I already explained...") by 25%
- Guardrail: Handoff note completion rate >80% (below this, the feature is adding friction without value)

**What must be true before this PRD advances:**
1. Handoff volume data confirms this is a >10% of conversations problem
2. Manual pilot shows agents will complete structured notes at >70% quality rate
3. Engineering confirms structured handoff can be built within the existing inbox architecture (no platform migration required)
4. Pilot data confirms all three failure modes contribute meaningfully — or scope is narrowed to match the dominant failure mode(s)

## Recommended Next Artifact

**Next artifact: Discovery spike (1 week)**

Before advancing to technical design, run a parallel discovery:
1. **Data pull:** Quantify handoff volume from reassignment logs (Engineering, 2 days)
2. **Manual pilot:** Paper handoff notes with one support team (Ops lead, 2 weeks). Pilot should track per-handoff: which failure mode(s) would have occurred without intervention, note completion quality, and receiving agent feedback on note usefulness.
3. **Tech feasibility check:** Can structured handoff be added to existing conversation model without schema migration? (Engineering, 2 days)

If all three return positive signals, advance to **Technical Design Document** scoped to the validated capabilities. If the pilot reveals one failure mode dominates, narrow the build to the corresponding alternative from the Solution Alternatives table. If the manual pilot shows <50% compliance, revisit whether the problem is better solved by workflow automation rather than agent-driven handoff notes.
