# PRD: Feature Full-Rollout Decision
**Feature:** [Feature Name]
**Author:** PM (with DS advisory)
**Status:** DECISION REQUIRED — NOT APPROVED FOR SHIP
**Date:** 2026-04-16

---

## Decision Frame

**What is being decided:** Whether to expand the feature to 100% of users based on a 2-week A/B test (1,200 users/variant) that showed a 6% lift on the primary metric at p=0.08.

**The PM's stated rationale:** Direction is clear; business timeline cannot accommodate a full recommended run.

**What the evidence actually supports:** The observed lift is directionally positive but statistically inconclusive. A p-value of 0.08 means there is roughly a 1-in-12 chance this result arose by chance alone — above the conventional 0.05 threshold and well above thresholds warranted when a full rollout carries meaningful reversion cost. The data science team has explicitly flagged the test as underpowered for the claimed 6% effect size, meaning the study lacked the statistical power to reliably detect an effect of that magnitude. Underpowered tests are systematically biased toward overestimating true effect sizes (the "winner's curse"); the real lift, if it exists, is likely smaller than 6%.

**Business constraint acknowledged:** Speed pressure is real and legitimate. This PRD does not dismiss the constraint — it structures the decision so that urgency is weighed against concrete, quantified risk, not assumed away.

**Decision options on the table:**

| Option | Speed | Risk | Reversibility |
|---|---|---|---|
| Full rollout now | Immediate | High — ~8% false positive rate; winner's curse inflates expected lift | Low if feature has downstream dependencies |
| Staged rollout (10–20%) with kill switch | Fast (days) | Medium — limits blast radius, but does NOT accelerate statistical resolution | High |
| Extend test to 6-week recommended run | Slow (4 more weeks) | Low | N/A — no ship yet |
| Ship with pre-committed rollback trigger | Fast | Medium — requires defined rollback metric and threshold | High if trigger is honored |

**Recommended decision path:** Staged rollout (10–20%) with a pre-committed, operationally enforced rollback trigger — **with the explicit caveat that staged rollout limits blast radius and preserves reversibility, but does not resolve the underlying statistical uncertainty faster than extending the test would.** The staged approach is a risk-management posture, not an evidence-generation substitute. Full rollout is not recommended until the rollback trigger has been defined, agreed upon, and wired into monitoring.

**What staged rollout does and does not do:**
- ✓ Reduces the fraction of users exposed to a potentially mismeasured feature
- ✓ Preserves the ability to roll back quickly if degradation is observed
- ✓ Can be implemented within days, satisfying the business urgency constraint
- ✗ Does not generate the additional sample size needed to confirm the 6% lift
- ✗ Does not resolve novelty-effect ambiguity — the observation window problem persists
- ✗ Does not eliminate risk if the feature has systemwide or downstream effects that manifest at any exposure level

**If the feature has systemwide or downstream effects:** A staged rollout may not reduce risk meaningfully. This must be assessed by engineering before proceeding. If the feature touches shared infrastructure, session state, or cross-user interactions, the staged approach may need to be replaced with the full 6-week test extension.

---

## Unknowns & Evidence Gaps

**ctx-1 — Statistical power deficit confirmed by DS team**
The test ran 2 weeks with 1,200 users/variant. DS recommends a minimum 6-week run. At current sample size and run duration, the test is underpowered to detect the claimed 6% effect at standard power (0.80). The probability of a Type II error (missing a real effect) is elevated, but more critically here, the underpowered design means the observed 6% is an upward-biased estimate of the true effect size.

**ctx-2 — Novelty effect not ruled out**
A 2-week window is insufficient to separate genuine behavioral change from novelty engagement. Primary metric lift may decay after initial exposure. No longitudinal cohort data is available.

**ctx-3 — Segment heterogeneity unknown**
The test result is an aggregate. No subgroup analysis has been surfaced. If the lift is concentrated in one segment (e.g., power users, mobile-only), a full rollout may dilute or invert the effect for other cohorts.

**ctx-4 — Downstream and secondary metric impact unquantified**
No data on secondary metrics (e.g., support tickets, churn signal, latency impact) has been presented. A 6% lift on the primary metric at the cost of degradation on a secondary metric may be a net-negative outcome.

**ctx-5 — Rollback cost and mechanism undefined**
If the feature underperforms post-rollout, there is no documented rollback plan, triggering threshold, or responsible owner. This gap transforms a probabilistic risk into an operational certainty of delayed response.

**ctx-6 — Business cost of waiting is asserted, not quantified**
The PM states the business cannot wait. The cost of a 4-week extension has not been modeled (lost revenue, competitive risk, opportunity cost). Without this, the urgency argument cannot be evaluated against the statistical risk argument on equal footing.

**ctx-7 — Staged rollout feasibility not confirmed**
It is unknown whether the monitoring and rollback machinery required for a staged rollout can be implemented within the business timeline, and whether the feature architecture supports partial exposure without systemwide effects. These must be confirmed before the staged path is adopted.

---

## Pass/Fail Readiness

This section defines the minimum conditions required before full rollout proceeds. These are not aspirational — they are gates. If any gate is unmet, full rollout does not proceed.

**Gate 1 — Rollback trigger defined and operational**
☐ Primary metric rollback threshold agreed upon in writing by PM and DS
☐ Monitoring alert wired to threshold
☐ Rollback owner named and on-call
**Status: FAIL — not yet defined**

**Gate 2 — Secondary metric baseline captured**
☐ Support, churn, and latency baselines logged for test variants
☐ No statistically significant degradation on secondary metrics
**Status: FAIL — data not surfaced**

**Gate 3 — Segment analysis completed**
☐ Subgroup breakdown by at least platform, tenure cohort, and usage tier reviewed
☐ No inversion of effect in a material segment (>15% of user base)
**Status: FAIL — not completed**

**Gate 4 — Staged rollout feasibility confirmed**
☐ Engineering confirms feature supports partial exposure without systemwide effects
☐ Monitoring and rollback machinery implementable within business timeline
☐ Initial exposure percentage agreed (recommend 10–20%)
☐ Observation window defined before next rollout increment
☐ Increments and owners documented
**Status: FAIL — feasibility not assessed**

**Gate 5 — Business cost of delay quantified**
☐ Revenue or competitive impact of 4-week delay estimated by finance or strategy
☐ Comparison to cost of rollback or mismeasured lift completed
**Status: FAIL — asserted only**

**Readiness verdict: 0/5 gates passed. Full rollout is not ready to proceed.**

---

## Recommended Next Artifact

**Artifact:** Staged Rollout Feasibility Assessment + Monitoring Runbook
**Owner:** PM (plan), DS (trigger thresholds), Eng (feasibility + monitoring wiring)
**Due:** Within 3 business days

**Contents required:**
1. Engineering feasibility confirmation: does the feature support partial exposure without systemwide or downstream effects?
2. Monitoring and rollback machinery: can it be implemented within the business timeline?
3. Rollout percentage and increment schedule (if feasibility confirmed)
4. Primary metric rollback threshold (numeric, agreed between PM and DS)
5. Secondary metric watch list with alert thresholds
6. Rollback owner and escalation path
7. Segment analysis summary from DS team
8. Business cost of delay estimate (even a rough order of magnitude)

**Why feasibility comes first:** The staged rollout recommendation is a risk-management posture that depends on two preconditions the current evidence does not confirm: (a) the feature can be safely partially exposed, and (b) the required monitoring infrastructure can be built in time. If either precondition fails, the decision reverts to a binary choice between full rollout now (high risk) and test extension (low risk, high delay).

**If the business genuinely cannot wait even for the staged plan:** Document that decision explicitly, name the executive sponsor accepting the statistical and operational risk, and proceed — but do so with eyes open, not by reclassifying insufficient evidence as sufficient.
