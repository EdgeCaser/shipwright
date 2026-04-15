# PRD: [Proposed Feature] — Weak-Evidence Draft

## Decision Frame

**What decision does this PRD support?**
Whether to invest engineering and design resources in building [Proposed Feature], given that current supporting evidence is insufficient to justify full commitment.

**Decision type:** Go / No-Go / Investigate Further

**Current recommendation:** **Investigate Further** — the evidence base does not meet the threshold for a Go decision. This PRD exists to make that gap explicit and to define what evidence would change the recommendation.

**Stakeholders:** Product, Engineering, Design, Business/Revenue

**Irreversibility:** Medium — engineering investment is recoverable if scoped as a spike or experiment, but opportunity cost of a full build against weak signal is not.

---

## Context & Motivation

A new feature has been proposed based on preliminary signals. However, no concrete evidence artifacts (user research transcripts, quantitative usage data, support ticket analysis, competitive pressure documentation, or revenue impact models) have been provided or referenced.

**What we think we know:**
- There is an intuition or anecdotal signal that users want this capability.
- The feature is technically feasible within our current architecture.

**What we actually know:**
- No user research has been conducted or cited.
- No quantitative data supports the demand hypothesis.
- No competitive analysis has been provided.
- No revenue or retention model has been built.

---

## Unknowns & Evidence Gaps

| # | Unknown | Why It Matters | Evidence Needed | Effort to Close |
|---|---------|---------------|----------------|----------------|
| U1 | Is there real user demand? | Without demand signal, we risk building shelfware. | 5+ user interviews with target segment; or support ticket volume analysis showing >N requests/month. | 1-2 weeks |
| U2 | What is the expected impact on core metrics? | Cannot prioritize against backlog without projected ROI. | Sizing model: addressable users × expected adoption rate × value per activation. | 3-5 days |
| U3 | Are there competitive or market pressures? | Urgency depends on whether competitors have shipped or announced similar capabilities. | Competitive scan of top 5 competitors for this capability. | 2-3 days |
| U4 | What is the technical cost and risk? | Engineering capacity is finite; need cost estimate to weigh against uncertain benefit. | Engineering spike producing t-shirt size estimate and dependency map. | 3-5 days |
| U5 | Does this conflict with or cannibalize existing features? | Could degrade existing user experience or split usage patterns. | Internal feature interaction analysis. | 1-2 days |

**Evidence quality assessment:**
- Current evidence level: **Anecdotal / None** (Level 0 on a 0-4 scale)
- Required for Go decision: **Level 2 minimum** (Qualitative research + directional quantitative signal)

---

## Pass/Fail Readiness

**Readiness verdict: FAIL — Not ready for Go decision.**

| Criterion | Status | Notes |
|-----------|--------|-------|
| User demand validated | ❌ Fail | No research conducted |
| Impact sized | ❌ Fail | No model exists |
| Technical feasibility confirmed | ⚠️ Unknown | Assumed feasible, not validated |
| Competitive urgency assessed | ❌ Fail | No competitive scan |
| Stakeholder alignment | ⚠️ Partial | Proposal exists but lacks evidence backing |
| Risk/cannibalization reviewed | ❌ Fail | Not assessed |

**What would change this to PASS:**
1. Close U1 (user demand) with at least 5 interviews showing consistent pain point.
2. Close U2 (impact sizing) with a model showing the feature addresses ≥X% of target segment.
3. Close U4 (technical cost) with an engineering spike confirming feasibility and rough cost.

If any of these three return negative signals, recommend **Kill** rather than further investigation.

---

## Recommended Next Artifact

**Next step:** Discovery Sprint (1-2 weeks)

| Deliverable | Owner | Timeline |
|-------------|-------|----------|
| User interview findings (5+ interviews) | Product/Research | Week 1 |
| Competitive capability scan | Product | Week 1 |
| Impact sizing model | Product + Data | Week 1-2 |
| Engineering spike & cost estimate | Engineering | Week 2 |
| Evidence review & Go/No-Go decision | Product + Stakeholders | End of Week 2 |

**If evidence supports proceeding:** Produce a full PRD with solution design, success metrics, and launch plan.

**If evidence is mixed:** Produce a lightweight experiment design (fake door test, Wizard-of-Oz prototype, or concierge MVP) to gather stronger signal before committing.

**If evidence is negative:** Document findings and archive. Redirect capacity to higher-confidence initiatives.

---

*This PRD intentionally does not include solution design, technical specifications, or success metrics. Those artifacts are premature until the evidence gaps above are closed. Producing them now would create false precision around an unvalidated hypothesis.*
