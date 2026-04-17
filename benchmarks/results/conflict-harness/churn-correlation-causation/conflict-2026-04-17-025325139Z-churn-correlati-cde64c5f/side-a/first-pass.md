# PRD: Churn Reduction Initiative — Collaboration Feature Adoption

**Status:** Pre-validation draft — not approved for resourcing  
**Decision type:** Build vs. learn gate  
**Owner:** Retention Product  

---

## Decision Frame

### What decision is this PRD asking for?

This document asks whether the team should invest engineering and design resources in an intervention targeting users who have not engaged with the collaboration feature in the past 30 days, with the stated goal of reducing annual churn.

### The opportunity as stated

Observed retention data shows a large gap between two user segments:

- **Collaboration-active users:** 4% annual churn
- **Collaboration-inactive users:** 22% annual churn

This 18-percentage-point gap is the sole quantitative basis for the initiative.

### Why this decision is not yet ready to be made

The gap is a **correlation, not a causal finding**. Before committing to a build, the team must distinguish between two fundamentally different worlds:

| World A — Collaboration drives retention | World B — Power users self-select |
|---|---|
| Getting inactive users to adopt collaboration reduces their churn | Collaboration-active users are power users who would have retained regardless |
| Intervention on inactive users will move the 22% number | Intervention changes feature usage stats but does not move churn |
| Investment is justified | Investment is waste |

Neither world has been ruled out. The current evidence is consistent with both.

### Scope

This PRD covers the **decision gate** only. It does not specify a feature build. It specifies what must be true before a build is justified, and recommends the cheapest next artifact that closes the causal gap.

---

## Unknowns & Evidence Gaps

### Gap 1 — Causation not established (Critical)

No experiment, quasi-experiment, or instrumental variable analysis has been run to isolate the effect of collaboration adoption on churn. The 18-point gap could be entirely explained by pre-existing differences between user types (engagement level, company size, use-case fit, seat count, role) that also predict collaboration usage.

**What would close it:** A randomized experiment or a well-constructed difference-in-differences analysis using a prior organic adoption event as a natural treatment.

### Gap 2 — Power-user confound not ruled out (Critical)

The most plausible alternative explanation — that collaboration-active users are already high-engagement users who would retain regardless — has not been tested. If true, driving low-engagement users into the collaboration feature will not replicate the retention outcome observed in high-engagement users.

**What would close it:** Segment the correlation by engagement quartile. If the churn gap persists within low-engagement users who happen to use collaboration vs. those who don't, the confound is weakened. If the gap disappears, the confound is likely load-bearing.

### Gap 3 — Intervention mechanism undefined (Significant)

Even if collaboration adoption does causally improve retention, the mechanism is unknown: Is it the collaboration activity itself? Network effects (more colleagues in the product)? Workflow lock-in? The mechanism determines which intervention is correct. A wrong mechanism produces feature adoption without the downstream retention effect.

### Gap 4 — Population transferability unknown (Moderate)

The correlation is observed in existing users. Users who have not adopted collaboration after 30 days may differ systematically from the general collaboration-inactive population (e.g., they may be later in a trial, lower fit). Extrapolating the population-level correlation to this specific intervention target adds additional uncertainty.

---

## Pass/Fail Readiness

### Readiness criteria — all must be met before build is approved

| # | Criterion | Status |
|---|---|---|
| R1 | Causal estimate available (experiment or credible quasi-experiment) | **Not met** |
| R2 | Power-user confound ruled out or quantified | **Not met** |
| R3 | Plausible intervention mechanism identified and tested at small scale | **Not met** |
| R4 | Target segment size and baseline churn rate confirmed | **Not confirmed** |

### Current readiness verdict: **FAIL**

This PRD does not pass the readiness gate. The evidence base supports further investigation, not a feature build. Proceeding to build now means accepting a high probability that engineering investment will not move the churn metric.

### What readiness does NOT require

This is not a request for perfect certainty. A credible causal estimate with acknowledged confidence intervals — combined with a ruled-out confound — is sufficient to proceed. The bar is "evidence that distinguishes the two worlds," not "proof."

---

## Recommended Next Artifact

### Option A — Recommended: Causal analysis memo (2–3 weeks, analyst resources only)

Before any product work, a data analyst should run the within-segment correlation check (Gap 2) and assess whether historical data supports a difference-in-differences design. This is the cheapest way to either kill the hypothesis or meaningfully strengthen it.

**Output:** A 1–2 page analysis memo with a clear verdict: confound plausible vs. confound weakened. If weakened, proceed to Option B.

### Option B — If confound is weakened: Lightweight experiment design (4–6 weeks)

Design a targeted experiment: randomly select collaboration-inactive users who meet the 30-day threshold and offer a structured onboarding nudge. Measure 90-day churn against holdout. This is the minimum-viable causal test.

**Output:** Experiment results memo → updated PRD with causal estimate → build decision.

### Option C — Do not pursue further

If the within-segment analysis (Option A) shows the gap disappears when controlling for engagement level, the hypothesis is likely explained by confounding. Recommend closing the initiative and redirecting retention investment to interventions with stronger causal foundations.

---

## Summary

The churn gap between collaboration-active and inactive users is real and large. It is not yet evidence that an intervention will work. The honest interpretation of the current data is: **we have identified a promising hypothesis, not a validated opportunity.** The next dollar should buy a causal test, not a feature build.
