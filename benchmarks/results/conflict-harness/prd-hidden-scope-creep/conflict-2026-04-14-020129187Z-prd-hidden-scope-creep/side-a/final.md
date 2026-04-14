# PRD: Team Inbox Workflow Handoff Improvement

## Decision Frame

**Problem statement:** When team inbox conversations require handoff between agents (shift changes, escalation, expertise routing), context is lost, customers repeat themselves, and resolution time inflates. This is a workflow efficiency problem, not a new product.

**Decision to be made:** Should we invest in a structured handoff mechanism for team inbox conversations, and if so, what is the minimum viable scope?

**Who decides:** Product lead (owns inbox roadmap) with engineering lead sign-off on feasibility.

**Decision deadline:** End of current planning cycle. Delaying means another quarter of measured handoff friction.

**Scope boundary (proposed, pending validation):** This PRD proposes limiting v1 to handoff between human agents within a single team inbox. The following items are proposed as out-of-scope, but each exclusion is an assumption that must be tested during evidence gathering:

| Proposed Exclusion | Rationale for Separating | How to Validate the Exclusion |
|---|---|---|
| Cross-team routing or escalation paths | Different workflow topology, different stakeholders, likely different technical surface | Agent interviews (below): ask whether most handoffs are intra-team or cross-team. If >30% are cross-team, this boundary is wrong and must be revisited. |
| AI-assisted response drafting | Independent value proposition; coupling it inflates build risk | Engineering spike: confirm summary capture can be built without LLM dependency. If manual summaries are impractical at volume, AI may be v1-essential, not v2. |
| Customer-facing handoff notifications | Adds customer-facing UX work and copy/localization scope | CSAT segmentation (below): if customers rank "not knowing a handoff happened" as a top pain point, notifications may need to be v1. |
| SLA/timer automation | Operations concern with its own policy decisions | Handoff frequency data: if unowned-conversation dwell time is the primary metric problem, timers may be inseparable from handoff state tracking. |
| Analytics dashboards | Instrument first, dashboard is a separate artifact | No validation needed — instrumentation before visualization is sequencing, not a separability assumption. |

**Why this table matters:** The original scope boundary was asserted based on reasonable product intuition, but without evidence from the prompt, platform context, or user research to confirm these items are truly separable. Each exclusion is now an explicit hypothesis with a falsification condition. The evidence-gathering phase (see Recommended Next Artifact) must test these boundaries, not just the core problem.

### Core Requirements (v1)

1. **Handoff summary capture:** When an agent initiates a handoff, they must provide or confirm a structured summary (customer intent, actions taken, open questions, recommended next step).
2. **Receiving agent context panel:** The receiving agent sees the handoff summary prominently, without needing to scroll through full conversation history.
3. **Handoff state tracking:** Conversations in handoff limbo are visibly flagged. No conversation should be in an unowned state for more than a configurable threshold.
4. **Handoff acceptance:** Receiving agent explicitly accepts the handoff, confirming they have context. Until accepted, the originating agent remains accountable.

### Success Criteria

| Metric | Baseline (measure first) | Target |
|---|---|---|
| Customer repeats-self rate during handoffs | TBD (instrument) | Reduce by 30% |
| Time from handoff initiation to acceptance | TBD (instrument) | < 2 minutes median |
| Agent-reported context sufficiency (survey) | TBD (baseline survey) | > 80% "sufficient" |

## Unknowns & Evidence Gaps

| Unknown | Impact if wrong | How to resolve | Status |
|---|---|---|---|
| How often do handoffs actually occur? | If rare, ROI is low. | Instrument current inbox: count handoff events over 2 weeks. | **NOT STARTED — blocks go/no-go** |
| What information do receiving agents actually need? | Building the wrong summary template wastes effort and gets ignored. | Interview 5-8 agents who regularly receive handoffs. Ask what they look for in history. | **NOT STARTED** |
| Do customers perceive handoffs as a pain point? | If customers don't care, urgency drops. | Pull CSAT scores segmented by handoff vs. no-handoff conversations. | **NOT STARTED** |
| Can we auto-generate summaries from conversation history? | Affects build complexity significantly. | Prototype with existing LLM tooling on 20 sample conversations. | **NOT STARTED — do NOT block v1 on this** |
| What systems of record need integration? | Underestimating integration work is the #1 schedule risk. | Engineering spike: map current inbox architecture, identify where handoff state lives. | **NOT STARTED** |
| Are the proposed scope exclusions actually separable? | If cross-team handoffs, customer notifications, or SLA timers are entangled with intra-team handoff, the v1 scope is wrong and will either ship incomplete or silently expand. | Agent interviews must include questions about handoff types (intra vs. cross-team), customer notification expectations, and whether SLA pressure drives handoff behavior. See Scope Boundary table above for per-exclusion falsification conditions. | **NOT STARTED — added per critique** |

**Critical note:** The unknowns now include scope boundary validation alongside problem validation. We cannot commit to the proposed scope without evidence any more than we can commit to building without evidence of the problem.

## Pass/Fail Readiness

**Readiness verdict: NOT READY TO BUILD**

| Criterion | Status | Rationale |
|---|---|---|
| Problem validated with data | ❌ Fail | No instrumentation exists for handoff frequency or impact. We are assuming the problem is significant based on anecdote. |
| User needs understood | ❌ Fail | No agent interviews conducted. Summary template design without input will miss. |
| Scope is bounded and agreed | ❌ Fail | Scope boundary is proposed but is itself an untested set of assumptions. Each exclusion has a falsification condition that must be checked during evidence gathering. Upgraded from Partial to Fail to reflect that unvalidated scope boundaries are not bounded scope. |
| Technical feasibility assessed | ❌ Fail | No architecture spike completed. Integration surface unknown. |
| Success metrics baselined | ❌ Fail | All baselines are TBD. Cannot measure improvement without pre-measurement. |

**What would change this to READY:**
1. Complete handoff frequency instrumentation (1-2 weeks of data)
2. Conduct agent interviews — must include scope-boundary validation questions (5-8 agents, 1 week)
3. Pull CSAT segmentation (1 query if data exists)
4. Engineering spike on integration surface (1 week)
5. Review scope exclusion falsification results and adjust boundary before committing

Estimated time to readiness: 2-3 weeks of evidence work.

## Recommended Next Artifact

**Next artifact: Evidence-gathering brief**

Before any design or technical spec, produce a 1-page evidence brief that:
1. Assigns owners to each unknown above — including the new scope-separability unknowns
2. Sets a timebox (2 weeks) for all evidence gathering
3. Defines the go/no-go gate: if handoff volume is below X per week, or agent interviews reveal the real friction is elsewhere, this PRD is shelved or redirected
4. Defines a scope-adjustment gate: if any exclusion's falsification condition is met (e.g., >30% cross-team handoffs), the scope boundary is revised before proceeding — not after design begins

**Do not proceed to:** technical spec, wireframes, or sprint planning until the evidence brief is complete and both the go/no-go gate and scope-adjustment gate are passed.

**Scope creep watchlist:** The following adjacent requests will likely surface during stakeholder review. Each requires its own decision frame, not absorption into this PRD — but note that evidence gathering may reveal some of these are not actually separable, in which case the scope must be revised rather than allowing silent absorption:
- "Can we add routing rules while we're in there?" → Separate PRD, unless agent interviews show routing IS the handoff problem.
- "What about AI summaries?" → v2 fast-follow if v1 manual summaries prove useful, unless volume makes manual summaries impractical.
- "We need a handoff dashboard." → Instrument first, dashboard is a separate artifact after data exists.
- "What about cross-team handoffs?" → Different workflow, different constraints, separate PRD — unless frequency data shows cross-team is the dominant handoff type.
