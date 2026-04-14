# PRD: [Proposed Feature] — Draft Under Weak Evidence

## Decision Frame

**What decision does this PRD support?**
Whether to invest engineering and design resources into building [Proposed Feature], given that current supporting evidence is insufficient to justify full commitment.

**Decision type:** Go / No-Go / Investigate Further

**Current recommendation:** **Investigate Further** — the evidence base is too thin to support a Go decision. This PRD exists to make that gap explicit and define what evidence would change the recommendation.

**Stakes:** Medium. Building without validation risks wasted cycles; delaying risks missing a real opportunity if the signal is genuine. The asymmetric cost favors a structured investigation over premature commitment.

**Who decides:** Product lead, with engineering and design input on feasibility and cost.

## Problem Statement

A feature opportunity has been identified, but the supporting evidence does not meet the threshold for confident investment. Specifically:

- **No direct user research** has been conducted to validate the problem exists at meaningful scale.
- **No quantitative signal** (usage data, support tickets, churn correlation) has been presented to size the opportunity.
- **Anecdotal evidence only** — the feature idea may originate from a single customer request, internal intuition, or competitive observation without confirming demand in our user base.

This PRD intentionally does not pretend the evidence is stronger than it is. Its purpose is to frame the decision honestly and define the path to a defensible Go/No-Go.

## Unknowns & Evidence Gaps

| # | Unknown | Why It Matters | What Would Resolve It | Effort to Resolve |
|---|---------|---------------|----------------------|-------------------|
| 1 | **Is this a real problem for our users?** | Without problem validation, we may build something nobody needs. | 8-10 user interviews targeting the hypothesized pain point, with a screener confirming they experience the scenario. | 1-2 weeks |
| 2 | **How many users are affected?** | A real problem for 12 users is different from one affecting 12,000. | Query existing analytics for proxy signals (e.g., drop-off rates at the hypothesized friction point, support ticket volume in adjacent categories). | 2-3 days |
| 3 | **What do users do today instead?** | Workarounds reveal true severity. If users have acceptable alternatives, urgency drops. | Observation/interview questions about current workflow. | Included in #1 |
| 4 | **What is the competitive landscape?** | If competitors offer this and users cite it in churn interviews, the signal strengthens. If no competitor offers it, it may indicate weak demand rather than opportunity. | Competitive audit of 3-5 direct competitors. | 2-3 days |
| 5 | **What is the engineering cost?** | A cheap experiment has different decision calculus than a quarter-long build. | Engineering spike / t-shirt sizing. | 2-3 days |
| 6 | **Does this align with current strategic priorities?** | Even a validated feature can be wrong-time. | Review against current OKRs and roadmap commitments. | 1 day |

**Evidence quality assessment:**
- Current evidence level: **Anecdotal / Hypothesis only**
- Required evidence level for Go decision: **Validated problem + sized opportunity + feasibility confirmed**
- Gap severity: **Large** — multiple critical unknowns remain open simultaneously

## Pass/Fail Readiness

**Readiness verdict: FAIL — Not ready for build commitment.**

Criteria assessment:

| Criterion | Status | Notes |
|-----------|--------|-------|
| Problem validated with target users | ❌ Fail | No user research conducted |
| Opportunity sized with data | ❌ Fail | No quantitative signal available |
| Solution direction validated | ❌ Fail | Cannot validate solution before validating problem |
| Engineering feasibility assessed | ❌ Fail | No spike or estimate performed |
| Strategic alignment confirmed | ⚠️ Unknown | Not yet reviewed against current priorities |
| Stakeholder alignment | ⚠️ Unknown | Decision-makers have not reviewed evidence gaps |

**What would change this to PASS:**
1. User interviews confirm the problem exists and causes meaningful friction (resolves unknowns #1, #3)
2. Quantitative data shows the affected population is large enough to justify investment (resolves unknown #2)
3. Engineering spike confirms feasibility within acceptable cost bounds (resolves unknown #5)
4. Strategic review confirms alignment with current priorities (resolves unknown #6)

All four conditions must be met. Partial evidence (e.g., confirmed problem but tiny audience) should route to a different decision, not a forced Go.

## Recommended Next Artifact

**Next artifact:** **Discovery Research Plan**

Before this PRD can be promoted to build-ready, the following investigation sequence is recommended:

1. **Week 1:** Quantitative signal scan (analytics query + support ticket review) — cheapest evidence, may kill the idea early and save interview effort.
2. **Week 1-2:** If quantitative signal is non-trivial, conduct 8-10 user interviews with screened participants who experience the hypothesized scenario.
3. **Week 2:** Competitive audit (parallel with interviews).
4. **Week 3:** If problem is validated, run engineering spike for feasibility and cost.
5. **Week 3:** Synthesize findings into an updated PRD with evidence attached, re-evaluate Pass/Fail.

**Decision gate:** At the end of Week 3, reconvene with the decision-maker. Possible outcomes:
- **Go:** Evidence supports the feature. Proceed to detailed PRD with requirements, success metrics, and launch plan.
- **No-Go:** Evidence disconfirms the hypothesis. Document learnings and archive.
- **Pivot:** Evidence reveals a related but different opportunity. Reframe and repeat lightweight validation.

**Cost of this investigation:** ~3 weeks of part-time PM effort, ~3 days of engineering effort for the spike. This is a small fraction of the cost of building the wrong thing.

---

*This PRD was drafted under conditions of weak evidence. It is intentionally structured to expose gaps rather than paper over them. A PRD that asserts confidence without evidence is more dangerous than one that admits uncertainty.*
