# PRD: Team Inbox Workflow Handoff Improvement

## Decision Frame

**Problem statement:** Team inbox handoff workflows suffer from dropped conversations, unclear ownership transitions, and loss of context when work items move between team members. This leads to delayed customer responses, duplicated effort, and degraded service quality.

**Decision to be made:** Should we invest in a structured handoff protocol within the team inbox, and if so, what is the minimum viable scope that addresses the core ownership-transfer failure mode?

**Scope boundary:** This PRD covers handoff mechanics within a single team inbox. It explicitly excludes: cross-team routing, inbox triage/prioritization logic, SLA engine changes, customer-facing notification changes, and analytics/reporting dashboards. These are adjacent concerns that may appear coupled but are separable and should be evaluated independently.

**Stakeholders:**
- Support team leads (primary users of handoff)
- Individual support agents (participants in handoff)
- Engineering team (build cost)
- Product/design (UX integration)

**Success criteria:** Reduce handoff-related dropped conversations by 50% within 60 days of launch, measured by conversations that change assignee and subsequently breach SLA.

## Core Requirements

### P0 — Minimum viable handoff
1. **Explicit handoff action:** A discrete "hand off" action distinct from simple reassignment. Requires the handing-off agent to attach a context summary (free text, minimum 20 characters).
2. **Handoff acceptance:** Receiving agent must explicitly accept the handoff before ownership transfers. Until accepted, the original agent remains responsible.
3. **Handoff context card:** A persistent, visible card in the conversation thread showing: who handed off, when, why (the summary), and current acceptance status.

### P1 — Operational visibility
4. **Pending handoff queue:** A filtered view showing all handoffs awaiting acceptance, with age indicators.
5. **Handoff timeout:** Configurable timeout (default 30 minutes) after which unaccepted handoffs escalate to team lead.

### P2 — Out of scope for v1 (explicitly deferred)
6. Handoff templates or structured reason codes — deferred pending usage data from free-text summaries.
7. Automated handoff suggestions based on agent skill/availability — requires data foundation not yet in place.
8. Cross-team handoff — different ownership model, different approval chain.
9. Handoff analytics dashboard — build after we have handoff event data flowing.
10. Mobile-specific handoff UX — desktop-first, assess mobile usage post-launch.

## Unknowns & Evidence Gaps

| # | Unknown | Impact if wrong | How to close | Cost to close |
|---|---------|----------------|-------------|---------------|
| U1 | We assume handoff context summaries will be useful. Agents may write low-quality summaries that don't help the receiver. | Core value prop fails; feature becomes overhead without benefit. | Run 2-week pilot with 1 team, measure receiver-rated usefulness of summaries on 1-5 scale. Target: ≥3.5 average. | Low — instrument a prototype, survey receivers. |
| U2 | We assume the accept/reject ceremony won't slow down urgent handoffs. | Agents bypass the feature for urgent cases, creating two parallel workflows. | Include an "urgent" flag that auto-accepts but still requires context summary. Monitor bypass rate. | Low — design decision, no extra infrastructure. |
| U3 | We don't have baseline data on how many conversations are currently dropped during handoff. | Success metric (50% reduction) may be unmeasurable or already near zero. | Pull last 90 days of reassignment events, correlate with SLA breaches. If baseline < 5% of conversations, reconsider priority. | Medium — requires analytics query against production data. |
| U4 | We assume 30-minute timeout is reasonable. Could be too aggressive for async teams or too slow for real-time support. | Timeout too short: false escalations, alert fatigue. Too long: defeats purpose. | Make configurable per-team. Start with 30min default, review after 30 days. | Low — configuration, not architecture. |

## Pass/Fail Readiness

**Current readiness: CONDITIONAL PASS — proceed to design spike, not to full build.**

| Gate | Status | Rationale |
|------|--------|-----------|
| Problem validated | ⚠️ Partial | Anecdotal reports of dropped handoffs exist, but U3 (baseline data) is unresolved. Without baseline, we cannot confirm severity or measure success. |
| Scope contained | ✅ Pass | P0 is tight (3 features). P2 items are explicitly deferred with rationale. No hidden scope creep detected in current spec. |
| Technical feasibility | ✅ Pass | Handoff is an extension of existing assignment model. No new infrastructure required for P0. |
| Success measurable | ⚠️ Partial | Metric is defined but baseline is unknown (U3). |
| Stakeholder alignment | ⚠️ Partial | Support leads have requested this. Engineering sizing not yet done. |

**Conditions to clear before full build approval:**
1. Close U3 — establish baseline dropped-handoff rate. If < 2%, deprioritize.
2. Complete engineering sizing for P0 scope. If > 3 engineering-weeks, revisit scope.
3. Validate with 2+ support team leads that accept/reject ceremony (P0-2) won't be perceived as friction.

## Recommended Next Artifact

**Next artifact: Design spike document (1 week)**

Scope of the spike:
1. Close U3 by querying reassignment + SLA breach correlation data.
2. Produce low-fidelity wireframes for the handoff action, acceptance flow, and context card.
3. Desk-test the wireframes with 3 support agents to validate U1 and U2 assumptions.
4. Deliver engineering sizing estimate for P0.

If the spike confirms the problem severity and scope feasibility, the follow-on artifact is a **technical design document** for P0 implementation. If the spike reveals the baseline dropped-handoff rate is negligible, recommend **closing this initiative** and reallocating effort.
