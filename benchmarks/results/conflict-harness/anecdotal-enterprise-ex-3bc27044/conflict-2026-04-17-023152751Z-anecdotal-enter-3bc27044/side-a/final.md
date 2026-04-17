# PRD: Platform Workflow Integration
**Status:** Evidence-Gated — Not Ready for Investment Authorization

---

## Decision Frame

**What is being decided:** Whether to commit 4 months of platform engineering to build a workflow integration based on enterprise customer demand.

**The ask:** Approve scoping, resourcing, and roadmap slot for a major platform integration.

**The business case as presented:** Two enterprise customers have explicitly requested this integration. These two customers together represent 18% of ARR. The PM position is that these requests signal a general enterprise need for this capability.

**Why this decision is premature:** The two requesting customers operate in the same niche vertical. A shared vertical origin means both requests may reflect vertical-specific workflow constraints rather than a general enterprise pattern. This does not disprove broader demand — it means broader demand is currently an unvalidated hypothesis. Approving 4 months of platform engineering on the strength of two co-vertical data points carries material extrapolation risk that warrants staged validation before full commitment. This PRD surfaces that risk explicitly rather than papering over it.

---

## Unknowns & Evidence Gaps

### Gap 1 — Vertical Specificity vs. General Enterprise Need
Both requesting customers share a niche vertical. There is no data establishing whether the workflow integration need exists outside that vertical. The core business case claim — that these two customers represent a general enterprise need — is a reasonable hypothesis given their ARR weight, but it is asserted rather than evidenced. Absence of cross-vertical confirmation does not disprove broader demand; it means confidence in generalizability is low enough to warrant validation before committing 4 months of engineering.

**What's missing:** A signal from at least one enterprise customer outside the requesting vertical, or a customer discovery survey across the broader enterprise segment.

### Gap 2 — No Broader Customer Survey
The case packet explicitly notes that no broader customer survey exists. Without one, there is no basis for estimating addressable demand, churn risk if the feature is not built, or competitive displacement probability.

**What's missing:** A structured discovery effort (survey, sales-assisted interviews, or support ticket analysis) covering the enterprise tier more broadly.

### Gap 3 — Demand Signal Quality
It is unknown whether the two customer requests represent:
- A hard blocker (they will churn without it)
- A strong preference (they would pay more or expand usage)
- A nice-to-have (they raised it but have workarounds)

The appropriate urgency and investment ceiling differ significantly across these scenarios.

**What's missing:** Qualification of each request by business impact to the customer and risk-to-retention if not delivered.

### Gap 4 — ARR Concentration Risk Framing
The 18% ARR figure is cited to establish importance, but it conflates ARR concentration risk (which argues for responsiveness) with demand generalizability (which the data does not yet support). Serving the two customers' actual need may or may not require the full platform integration as scoped.

**What's missing:** A lighter-weight path analysis — can the two customers be served without a 4-month platform build? If so, the full investment requires independent demand justification beyond these two accounts.

---

## Pass/Fail Readiness

| Readiness Criterion | Status | Notes |
|---|---|---|
| Structured business case | Partial | ARR stake is real; generalizability is unvalidated hypothesis |
| Evidence of broad demand | Fail | No survey; two co-vertical customers only |
| Demand signal quality | Fail | Request intent and retention risk not qualified |
| Lightweight alternative ruled out | Fail | Not evaluated |
| Vertical specificity addressed | Fail | Acknowledged in case context; not resolved |

**Overall readiness: NOT READY for investment authorization.**

This PRD should not be used to greenlight the 4-month engineering commitment. The two customers and their ARR weight justify taking the hypothesis seriously and funding discovery — not skipping discovery entirely.

---

## Recommended Next Artifact

**Artifact type:** Discovery Plan + Evidence Threshold Memo

**Recommended scope:**
1. Define the minimum evidence required to authorize investment (e.g., confirmed demand signal from N customers outside the requesting vertical, or retention risk qualification from the two existing requestors).
2. Commission a targeted customer discovery effort — 6–10 enterprise accounts outside the requesting vertical, run by sales or CS with structured interview guide.
3. Evaluate whether a scoped workaround or integration-lite can address the two requesting customers' needs in the near term while broader demand is assessed.
4. Return to investment decision with discovery results in hand.

**Decision gate:** If discovery confirms demand generalizability and qualifies the two existing requests as retention-risk signals, this PRD should be revised and resubmitted for authorization. If discovery finds vertical-constrained demand only, the investment case should be reframed as a vertical-specific initiative with a smaller scope and different prioritization calculus.
