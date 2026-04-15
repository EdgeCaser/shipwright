# PRD: Team Inbox Workflow Handoff Improvement

## Decision Frame

**Problem Statement:** Team inbox workflows suffer from dropped handoffs — conversations reassigned between agents lose context, stall, or require customers to repeat information. This degrades resolution time, customer satisfaction, and agent morale.

**Decision to be made:** Should we invest in a structured handoff protocol within the team inbox, and if so, what is the minimum viable scope that reduces handoff failures without requiring a platform migration?

**Scope boundary:** This PRD covers handoff mechanics *within* a single team inbox product. It explicitly excludes:
- Cross-product integrations (e.g., inbox-to-CRM handoff)
- AI auto-routing or triage automation
- SLA engine changes
- Agent performance scoring tied to handoffs

These are adjacent opportunities but represent scope creep risk. Each requires its own decision frame.

**Who decides:** Product lead + Engineering lead for the Inbox squad. Customer Support Ops is a key stakeholder but not a decider.

**Decision timeline:** Go/no-go by end of sprint planning for Q3 (target: 2 weeks from PRD approval).

## Context & Evidence

**What we need to establish (not yet validated):**
1. What percentage of multi-touch tickets involve reassignment, and what is the resolution time delta vs. single-owner tickets? *Illustrative hypothesis: if reassignment rates are in the 15–20% range and resolution time increases >2x, the business case is strong. These figures must be pulled from the internal analytics dashboard and confirmed before this PRD advances.* *(Status: measurement required — no verified baseline exists in this document.)*
2. Agent sentiment on handoff friction — qualitative signal suggests "picking up someone else's conversation with no context" is a top frustration, but this needs a structured survey with sufficient sample size to be cited as evidence. *(Status: anecdotal — formal survey needed.)*
3. Current handoff mechanism is a free-text "internal note" field — no structured context transfer, no required fields, no visibility into whether the receiving agent read the note. *(Status: observable product fact, verifiable by inspection.)*

**What we believe but haven't validated:**
- Structured handoff fields (status summary, next action, customer sentiment) will reduce re-ask rates. *(Assumption — needs A/B validation.)*
- Agents will fill in structured fields if they're fast (<15 seconds added per handoff). *(Assumption — needs prototype testing.)*
- Receiving agents will read and use structured context. *(Assumption — needs observation study.)*

## Proposed Solution (Minimum Viable)

**Handoff Card:** When an agent reassigns a conversation, a structured card is required with:
- **Summary** (free text, 280 char max): What happened so far
- **Next Action** (dropdown): Awaiting customer reply / Needs internal escalation / Ready to resolve / Other
- **Customer Sentiment** (select): Positive / Neutral / Frustrated / Escalation risk
- **Attachments/Links** (optional): Relevant prior messages auto-linked

**Receiving Agent View:** The handoff card appears pinned at the top of the conversation when a new agent opens a reassigned ticket. Dismissal requires a single click ("Got it"), which logs read-receipt.

**Metrics:**
- Primary: Reduction in median resolution time for reassigned tickets (baseline to be established during validation sprint; target: meaningful reduction, threshold TBD after baselining)
- Secondary: Agent-reported context sufficiency (post-handoff micro-survey, target: >70% "sufficient")
- Guardrail: Handoff card completion time must stay <20 seconds median (if exceeded, simplify fields)

## Unknowns & Evidence Gaps

| Unknown | Impact if wrong | Mitigation |
|---|---|---|
| Reassignment rate and resolution time impact not yet baselined | Cannot size the opportunity or set meaningful targets | Pull trailing 90-day data from analytics dashboard as first action in validation sprint. Kill threshold: if reassignment <5% of tickets, problem may not warrant dedicated investment. |
| Agents won't fill in structured fields consistently | Feature becomes noise; no improvement | Prototype with 5 agents for 1 week before full rollout. Measure completion rate. Kill threshold: <60% completion. |
| Structured fields don't capture what receiving agents actually need | Cards get ignored like current notes | Run 10 contextual inquiry sessions with receiving agents to validate field set before build. |
| Handoff volume is driven by routing problems, not context problems | We treat a symptom, not the cause | Analyze reassignment reasons in parallel. If >50% are mis-routes, pivot to routing improvement first. |
| Scope pressure to add AI summarization, auto-routing, SLA integration | Timeline and complexity explode | Explicit scope fence in this PRD. Revisit adjacent features only after v1 metrics are in. |

## Pass/Fail Readiness

**This PRD is NOT ready for engineering commitment.** It is ready for the following next steps:

- **PASS criteria met:**
  - [x] Problem is articulated with a testable hypothesis
  - [x] Scope is explicitly bounded with named exclusions
  - [x] Solution hypothesis is testable
  - [x] Success metric framework defined with kill thresholds
  - [x] Key assumptions are named

- **FAIL criteria — gaps that block commitment:**
  - [ ] Baseline metrics (reassignment rate, resolution time delta) not yet pulled and verified
  - [ ] No prototype validation of agent willingness to use structured fields
  - [ ] No contextual inquiry with receiving agents to validate field design
  - [ ] Reassignment root-cause analysis not yet complete (routing vs. context)
  - [ ] No technical feasibility sign-off from engineering on handoff card implementation

**Verdict: Conditional pass.** Proceed to validation sprint, not to build sprint.

## Recommended Next Artifact

**Validation Plan (1-week sprint):**
1. Baseline measurement: Pull trailing 90-day reassignment data from analytics dashboard. Establish actual reassignment rate and resolution time multiplier. (Owner: PM + Data, Day 1)
2. Contextual inquiry: 10 sessions with agents who frequently receive handoffs. Validate proposed field set. (Owner: PM, Days 1-3)
3. Paper prototype: Mock handoff card in Figma, run 5 agents through task completion test. Measure time-to-complete and perceived usefulness. (Owner: Design, Days 2-4)
4. Reassignment root-cause analysis: Tag 100 recent reassigned tickets by reason (mis-route vs. shift change vs. skill gap vs. escalation). (Owner: Support Ops, Days 1-5)
5. Technical spike: Engineering estimates for handoff card within current inbox architecture. Flag blockers. (Owner: Eng lead, Days 1-5)
6. Go/no-go review: End of week. If baseline confirms meaningful problem size, prototype completion >60%, field set validated, and no blocking technical debt — proceed to build PRD with engineering spec. If reassignment root cause is >50% mis-routes — pivot to routing PRD instead.

**After validation, the next artifact is:** Engineering Spec (if go) or Pivot PRD for routing improvement (if no-go on handoff hypothesis).
