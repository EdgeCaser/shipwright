# PRD: [Proposed Feature — Weak Evidence Context]

## Decision Frame

**What decision are we making?**
Whether to invest engineering and design resources in building a new feature given that current supporting evidence is weak, anecdotal, or absent.

**Who owns this decision?**
Product lead, with input from engineering and data.

**What is the default if we do nothing?**
The product continues without this feature. Users continue using existing workflows. No engineering investment is spent, and no opportunity cost is incurred.

**What would make this a clear YES?**
- Validated demand signal from ≥20 independent users in target segment describing the same unmet need unprompted
- Quantitative evidence (usage data, funnel analysis, or survey with n≥100) showing the gap this feature addresses correlates with churn or activation failure
- A successful prototype or concierge test demonstrating measurable behavior change

**What would make this a clear NO?**
- Evidence that the problem is already adequately solved by workarounds or existing features
- Discovery interviews revealing the stated need is aspirational rather than behavioral (people say they want it but don't act on the gap)
- Engineering cost exceeds 4 weeks and opportunity cost displaces higher-confidence roadmap items

**Current answer: NOT YET — evidence insufficient to commit.**

---

## Unknowns & Evidence Gaps

| # | Unknown | Why It Matters | Current Evidence | Confidence | What Would Resolve It |
|---|---------|---------------|-----------------|------------|----------------------|
| U1 | Is the problem real and recurring? | A feature solving a non-problem wastes capacity | No structured research; only 2-3 anecdotal mentions from internal stakeholders | Very Low | 10+ discovery interviews with target users; behavioral observation |
| U2 | How many users are affected? | Determines ROI ceiling | Unknown — no quantitative sizing | None | Funnel/cohort analysis on proxy behaviors; survey |
| U3 | What do users do today instead? | Existing workarounds may be sufficient | Not investigated | None | Journey mapping with 5+ users; support ticket analysis |
| U4 | Will users actually adopt the feature? | Build risk — feature may ship and go unused | No prototype or demand test conducted | None | Painted-door test, concierge MVP, or Wizard-of-Oz experiment |
| U5 | What is the engineering cost? | Determines feasibility and opportunity cost | No technical spike completed | None | Engineering spike (1-2 days) to estimate scope and dependencies |
| U6 | Does this conflict with existing product direction? | Could fragment the experience or create maintenance burden | Not assessed against current roadmap | Low | Roadmap alignment review with engineering and design leads |

**Evidence assessment: 0 of 6 unknowns resolved. No quantitative or validated qualitative evidence exists.**

### Critical meta-gap

The scenario itself provides no feature definition, target segment, traffic volume, or team capacity. This means every recommendation below — including research methods, timelines, and thresholds — is necessarily conditional. The unknowns table above is a *template for the first conversation*, not a validated research design. Any next-step plan must be scoped after the product lead fills in the basic parameters identified in Open Questions below.

---

## Pass/Fail Readiness

### Readiness Gate Checklist

| Gate | Status | Detail |
|------|--------|--------|
| Problem validated with users | ❌ FAIL | No discovery research conducted |
| Demand signal quantified | ❌ FAIL | No usage data, survey data, or support ticket analysis |
| Workaround/alternative analysis | ❌ FAIL | Not investigated |
| Prototype or demand test run | ❌ FAIL | No experiment conducted |
| Engineering feasibility scoped | ❌ FAIL | No spike completed |
| Roadmap fit confirmed | ❌ FAIL | Not reviewed against current commitments |

**Overall readiness: FAIL — 0/6 gates passed.**

This PRD cannot recommend proceeding to build. The feature idea may have merit, but committing resources before resolving the unknowns above would be speculative investment with no evidence-based rationale.

---

## Recommended Next Artifact

**Recommended artifact: Scoping Brief → then Discovery Research Plan (if warranted)**

Before any research plan can be designed, the following context must be established by the product lead:

| Parameter | Why it's needed | Impact on research design |
|-----------|----------------|---------------------------|
| Feature definition (what, specifically?) | Cannot scope research without knowing what to test | Determines interview protocol, prototype fidelity |
| Target segment | Determines who to recruit for interviews | A B2B enterprise feature needs 5 deep interviews; a consumer feature may need 100+ survey responses |
| Available traffic/user base | Determines whether quantitative methods (painted-door, A/B) are feasible | Low-traffic products cannot run statistical tests in 2 weeks |
| Team capacity and current sprint load | Determines realistic timeline | A team mid-sprint on a deadline may need 4 weeks, not 1-2 |
| Opportunity cost baseline | Determines kill threshold | The bar for proceeding is higher when displacing a validated initiative |

**Once scoping parameters are established**, a research plan should be tailored accordingly. Illustrative approaches by context:

- **If high-traffic consumer product with available analytics:** Start with funnel/cohort analysis (days, not weeks) to check for quantitative signal before any qualitative work.
- **If low-traffic or early-stage product:** Start with 5-10 discovery interviews since quantitative methods lack statistical power. Timeline depends on recruitment difficulty.
- **If engineering cost is likely small (<1 week):** A quick spike + painted-door test may be more efficient than a formal research sprint.
- **If the feature was raised by a single stakeholder with no user echo:** A 30-minute support ticket audit may be sufficient to kill or escalate before investing in interviews.

**Decision checkpoint structure remains firm:** After the cheapest viable evidence-gathering step, reconvene to decide whether to invest further or kill. This PRD should be revised with findings before any build commitment.

**Exit criteria for revisiting this PRD:**
- Scoping parameters above are filled in by product lead
- At least one evidence-gathering method appropriate to the context has been completed
- At least 2 of 6 readiness gates moved to PASS or have a concrete path to resolution
