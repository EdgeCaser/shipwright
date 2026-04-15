# PRD: Team Inbox Workflow Handoff Improvement

## Decision Frame

**Problem statement:** Team inbox handoff between agents (human or automated) suffers from context loss, ownership ambiguity, and dropped threads. When a conversation moves from one handler to another, the receiving party lacks sufficient context to continue without re-asking the customer or spending significant time reading history.

**Decision to be made:** Should we invest in a structured handoff protocol within the team inbox, and if so, what is the minimum viable scope that reduces handoff friction without over-engineering the workflow?

**Stakeholders:**
- Support team leads (primary users of handoff)
- Individual support agents (give and receive handoffs)
- Customers (experience the quality delta)
- Engineering (build cost and maintenance)
- Product (prioritization against competing roadmap items)

**Scope boundary:** This PRD covers the handoff mechanism only — not routing/assignment logic, not SLA enforcement, not queue management. Those are adjacent concerns that must be addressed separately.

**What this PRD is NOT:**
- A redesign of the inbox UI
- An auto-routing or AI triage system
- A workforce management or scheduling tool
- A customer-facing status page

## Context & Evidence

**Observed problems (qualitative, not yet validated at scale):**
1. Agents report spending ~3-5 minutes per handoff reading thread history before responding (self-reported, N=12 interviews — not statistically rigorous)
2. Customers frequently receive "Can you explain your issue again?" after a handoff, driving repeat contacts
3. No structured field exists for handoff context — agents use ad-hoc internal notes or nothing
4. Ownership after handoff is ambiguous: original agent and new agent both see the thread, neither has clear accountability

**Evidence gaps (critical):**
- No quantitative measurement of handoff frequency, duration, or failure rate exists today
- Customer satisfaction delta between handoff vs. single-agent resolution is assumed negative but unmeasured
- We do not know what percentage of threads involve handoffs at all

## Proposed Solution (Minimum Scope)

**Core mechanism: Structured Handoff Card**

When an agent initiates a handoff, the system requires a handoff card containing:
- **Summary:** 1-2 sentence plain-language summary of the issue and current state
- **Action needed:** What the next agent should do (not just "please handle")
- **Customer sentiment:** Quick tag (frustrated / neutral / positive)
- **Blockers:** Any known blockers or pending items

**Ownership transfer:**
- Handoff explicitly transfers ownership — the original agent is removed from the active owner list
- A single owner is enforced at all times (no co-ownership ambiguity)
- Audit trail records who handed off to whom and when

**What is explicitly excluded from v1:**
- AI-generated summaries (future iteration, requires separate evaluation)
- Handoff rejection/negotiation flow (receiving agent cannot decline in v1)
- Cross-team handoffs (v1 is intra-team only)
- SLA clock adjustment on handoff
- Bulk/batch handoff tooling

## Unknowns & Evidence Gaps

| Unknown | Impact if wrong | How to close | Status |
|---|---|---|---|
| Actual handoff frequency | Entire investment thesis collapses if handoffs are rare and low-severity | Instrument current inbox to count ownership changes over 30 days | **Not started — blocking** |
| Handoff severity and revenue impact | Low-frequency handoffs could still justify investment if they correlate with high-value accounts, escalations, or churn events — frequency alone is not a sufficient gate | Cross-reference handoff threads with account tier, ticket escalation status, and churn signals during instrumentation window | Not started |
| Agent compliance with structured fields | Handoff cards become empty boilerplate if agents skip them | Prototype with 1 team for 2 weeks, measure fill rate and quality | Not started |
| Customer impact of handoffs | If customers don't notice handoffs, ROI is lower than assumed | Compare CSAT for handoff vs. non-handoff threads (requires handoff instrumentation first) | Blocked by row 1 |
| Whether "action needed" field actually reduces re-reading time | Core value prop depends on this | Time-on-task measurement in prototype | Not started |
| Cross-team handoff prevalence | If most handoffs are cross-team, intra-team-only v1 misses the primary pain | Include cross-team flag in instrumentation | Not started |

**Honest assessment:** We are proposing a solution before validating the problem's magnitude. The first investment should be instrumentation, not feature development.

## Pass/Fail Readiness

**Readiness verdict: NOT READY for engineering investment.**

| Criterion | Status | Notes |
|---|---|---|
| Problem validated quantitatively | ❌ Fail | No data on handoff frequency, severity, or cost |
| Solution scoped to validated problem | ❌ Fail | Scope based on qualitative interviews only |
| Success metrics defined | ⚠️ Partial | We know what to measure but have no baseline |
| Stakeholder alignment | ⚠️ Partial | Support leads enthusiastic; eng capacity not confirmed |
| Technical feasibility assessed | ❌ Fail | No eng spike or technical design review completed |
| Edge cases enumerated | ⚠️ Partial | Known: concurrent handoffs, offline agents, thread merges — not yet resolved |

**What must be true before this PRD is actionable:**
1. Handoff frequency and severity data collected (minimum 30-day window)
2. Confirmed that handoffs represent a material problem via composite assessment: frequency ≥10% of threads, OR measurably worse CSAT, OR disproportionate concentration in high-value accounts or churn-correlated threads
3. Engineering spike confirms handoff card can integrate with current inbox architecture
4. At least one team lead commits to a 2-week prototype participation

## Success Metrics (contingent on passing readiness gates)

- **Primary:** Reduce median time-to-first-response after handoff by ≥30%
- **Secondary:** Eliminate "please re-explain" messages post-handoff (target: <5% of handoff threads)
- **Guardrail:** Handoff card completion time must not exceed 60 seconds (or agents will skip it)
- **Guardrail:** No increase in total handle time per thread

## Recommended Next Artifact

**Immediate next step:** Instrumentation spec for handoff measurement — frequency, severity, and impact.

This is NOT a technical design doc for the handoff card feature. The next artifact should specify:
1. What constitutes a "handoff" in current system logs (ownership change event definition)
2. What data to collect: frequency, time-of-day, team, thread age at handoff, post-handoff resolution time, account tier, escalation status, and revenue attribution where available
3. Dashboard for stakeholder review after 30-day collection window
4. Go/no-go criteria — a composite gate, not a single-metric threshold: the decision to proceed requires evidence that handoffs are both frequent enough and painful enough to justify the build. Specifically, the team should evaluate a weighted composite of (a) handoff volume as percentage of total threads, (b) CSAT differential between handoff and non-handoff threads, and (c) concentration of handoffs in high-value or churn-risk accounts. No single metric is sufficient — a low-frequency problem concentrated in top-tier accounts may merit investment, while a high-frequency problem with negligible customer impact may not.

Only after the instrumentation data confirms the problem's materiality should the team proceed to a technical design for the handoff card mechanism.

## Risks & Assumptions

| Assumption | Risk if wrong |
|---|---|
| Agents will fill out handoff cards honestly | Cards become noise; feature is abandoned |
| The problem is context loss, not routing | We build context tools when the real issue is assignment logic |
| Intra-team handoffs are the primary pain | V1 ships but misses the cross-team cases that matter most |
| Structured fields beat free-text notes | We add friction without improving quality |
