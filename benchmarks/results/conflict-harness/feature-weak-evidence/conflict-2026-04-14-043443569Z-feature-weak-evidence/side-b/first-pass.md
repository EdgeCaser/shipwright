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

**Recommended artifact: Discovery Research Plan**

Before this PRD can advance, the following lightweight research sprint should be executed (estimated: 1-2 weeks):

1. **Discovery interviews** (5-10 target users): Semi-structured interviews focused on the problem space, not the proposed solution. Goal: validate whether the problem is real, recurring, and painful enough to change behavior.
2. **Support/feedback audit**: Search support tickets, NPS comments, and feedback channels for organic mentions of the problem. Quantify frequency.
3. **Workaround mapping**: Document what users do today in the absence of this feature. If workarounds are adequate, the feature is low-priority.
4. **Painted-door test** (if interviews are promising): Add a non-functional entry point to the feature in-product and measure click-through rate over 2 weeks to gauge latent demand.
5. **Engineering spike** (1-2 days): If demand signal is confirmed, scope the build to inform cost/benefit analysis.

**Decision checkpoint:** After steps 1-3, reconvene to decide whether to proceed to steps 4-5 or kill the initiative. This PRD should be revised with findings before any build commitment.

**Exit criteria for revisiting this PRD:**
- ≥5 discovery interviews completed and synthesized
- Quantitative demand signal (support tickets, survey, or painted-door results) available
- At least 3 of 6 readiness gates moved to PASS
