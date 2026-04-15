# PRD: Team Inbox Workflow Handoff Improvement

## Decision Frame

**Problem statement:** Team inbox handoff between shifts, roles, or escalation tiers loses context, duplicates effort, and drops conversations. Customers experience repeated asks for information they already provided, and agents waste time reconstructing ticket history.

**Decision to be made:** Should we invest in a structured handoff mechanism within the team inbox, and if so, what is the minimum viable scope that reduces handoff-related resolution time without requiring a full workflow engine rebuild?

**Stakeholders:**
- **Support operations lead** — owns inbox SLAs and staffing
- **Front-line agents** — daily users who perform and receive handoffs
- **Engineering** — builds and maintains the inbox platform
- **Customers** — experience the downstream quality of handoffs

**Scope boundary:** This PRD covers handoff between agents within a single team inbox. It explicitly excludes: cross-team routing, automated triage/classification, SLA policy engine changes, and customer-facing UI changes. These adjacent concerns are noted as future work, not commitments.

**Success criteria:**
- Reduce average handoff re-ask rate (customer asked to repeat information) by ≥30% within 8 weeks of launch
- Reduce median time-to-resolution for handed-off tickets by ≥15%
- Agent satisfaction with handoff process improves from current baseline (to be measured pre-launch)

## Core Proposal

### Handoff Summary Card
When an agent initiates a handoff, the system generates a structured summary card attached to the conversation, containing:
1. **Context snapshot** — auto-extracted: customer name, account tier, conversation duration, prior agents involved
2. **Agent notes** — free-text field for the handing-off agent to describe current state, what was tried, and what remains
3. **Suggested next action** — optional structured field (dropdown: "awaiting customer reply", "needs escalation", "pending internal action", "ready to resolve")
4. **Linked artifacts** — references to any attachments, internal tickets, or knowledge base articles already surfaced

### Handoff Queue View
A dedicated queue view showing only conversations handed off to the current agent or role, sorted by urgency, with the summary card visible inline without opening the full thread.

### Handoff Acceptance Flow
Receiving agent must explicitly accept or reassign, preventing conversations from sitting in limbo. Acceptance timestamps feed SLA tracking.

## Unknowns & Evidence Gaps

| # | Unknown | Impact if wrong | Mitigation |
|---|---------|----------------|------------|
| U1 | We assume agents will fill in the notes field consistently. If adoption is low, summary cards add UI clutter without value. | Core value prop fails | Measure fill rate in pilot; consider making notes required for handoff completion |
| U2 | Auto-extracted context accuracy depends on conversation parsing quality. No current data on extraction error rate. | Bad summaries erode trust faster than no summaries | Run extraction against 200 historical conversations before build; set accuracy threshold at 90% |
| U3 | We lack baseline metrics on current handoff frequency, re-ask rate, and resolution time delta for handed-off vs. non-handed-off tickets. | Cannot measure success criteria; cannot confirm handoff is the right intervention target | Instrument current system and collect 4 weeks of baseline data before launch |
| U4 | Agent workflow varies by team — some use tags, some use internal comments, some use external tools. Handoff card may not fit all patterns. | Adoption resistance in teams with established workarounds | Interview 3+ teams during design phase; allow card to coexist with existing patterns rather than replace them |
| U5 | Scope pressure risk: the handoff queue view is adjacent to full inbox redesign. Engineering estimates may inflate if queue view scope isn't tightly constrained. | Timeline slips from 6 weeks to 12+ | Define queue view as a filtered view of existing inbox, not a new page. Explicit architectural constraint. |
| U6 | We have not established that handoff friction is the dominant driver of resolution time and re-asks relative to competing explanations (routing quality, staffing gaps, knowledge base coverage, prioritization logic). | We may optimize a secondary contributor while the primary cause goes unaddressed | Design spike must include comparative analysis: handoff-attributed delays vs. other root causes from the same ticket sample |

## Pass/Fail Readiness

**Current readiness: CONDITIONAL PASS — proceed to design phase with gates.**

| Gate | Status | Required for proceed |
|------|--------|---------------------|
| Baseline metrics instrumented | NOT STARTED | Must complete before development begins |
| Handoff-vs-alternatives root cause validation | NOT STARTED | Baseline data must confirm handoff friction is a top-3 contributor to resolution time and re-ask rate before committing build resources |
| Context extraction accuracy validated on historical data | NOT STARTED | Must achieve ≥90% accuracy on 200-conversation sample |
| Agent interview findings (≥3 teams) | NOT STARTED | Must confirm handoff card concept addresses real friction, not assumed friction |
| Engineering estimate for constrained queue view (filtered view, not new page) | NOT STARTED | Must confirm ≤6 engineer-weeks for full scope |
| Scope lock signed off by eng lead and product | NOT STARTED | Explicit exclusion list acknowledged to prevent creep |

**Pass condition:** All six gates green before development sprint begins.
**Fail condition:** If context extraction accuracy <80%, agent interviews reveal handoff is not a top-3 pain point, or baseline data shows handoff-attributed delays are a minor fraction of total resolution time, kill the initiative and redirect effort to the higher-leverage root cause.

## Recommended Next Artifact

**Next artifact: Design Spike (1 week)**

Scope of the spike:
1. Instrument baseline handoff metrics in production
2. Analyze root cause distribution across handed-off tickets: quantify what fraction of resolution time and re-asks are attributable to handoff context loss vs. routing, staffing, knowledge gaps, or other factors
3. Run context extraction accuracy test on 200 historical conversations
4. Conduct 3 agent team interviews focused on handoff friction
5. Produce low-fidelity wireframe of summary card and queue view for agent feedback
6. Return with findings to validate or kill the initiative before committing engineering resources

The spike output feeds a go/no-go decision. If the root cause analysis shows handoff friction is not a top-3 contributor, the initiative should be killed regardless of extraction accuracy or agent enthusiasm. If go, the next artifact after the spike is a Technical Design Doc scoped to the summary card, acceptance flow, and filtered queue view — with the explicit exclusion list carried forward as architectural constraints.
