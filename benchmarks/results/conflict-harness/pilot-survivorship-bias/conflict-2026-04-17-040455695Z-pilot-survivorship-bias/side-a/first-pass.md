# PRD: Onboarding Flow Expansion Decision

**Status:** Blocked — evidence insufficient for full rollout decision
**Decision Owner:** Product Leadership
**Prepared by:** Product
**Date:** 2026-04-17

---

## Decision Frame

The question is not whether to expand the new onboarding flow. The question is whether the 90-day pilot produced evidence sufficient to justify full expansion — and on what terms.

The pilot observed a 34% improvement in 30-day retention for pilot users vs. control. That result is materially significant if it holds for the general user population. It does not hold if the result is an artifact of who opted in, not what they experienced.

This PRD recommends against immediate full rollout. It recommends a focused 30–45 day evidence repair sprint before committing to expansion.

**What we are deciding:**
- Whether the 34% retention lift is attributable to the onboarding flow itself
- Whether the pilot population is representative of the full user base
- What rollout gate criteria must be met before expansion is defensible

**What we are not deciding:**
- Whether the onboarding flow has merit (it may)
- Whether to abandon the work (we should not)

---

## Unknowns & Evidence Gaps

### Gap 1: Opt-in Selection Confound (Critical)

The pilot cohort was self-selected: users who responded to an email invitation to try a new experience. Users who respond to such invitations are systematically different from the general population. They are more engaged, more motivated, or at minimum more curious — all traits correlated with retention independent of any product change.

No analysis was conducted to separate the retention effect of the onboarding flow from the retention effect of being the kind of user who opts into new experiences. Until this is decomposed, the 34% figure cannot be attributed to the product change.

**Risk:** Full rollout could produce materially lower retention lift — or none — because the general population does not share the motivational profile of the opt-in cohort.

### Gap 2: Pilot Drop-Off Not Reported (High)

The pilot reports 30-day retention for users who completed the onboarding flow. It does not report how many users who entered the pilot exited before completing onboarding, or at what stages.

If pilot participants abandoned the new flow at significant rates and were excluded from the retention analysis, the reported 34% lift is computed over a pre-filtered survivor group — users who already demonstrated commitment by completing a new, unfamiliar experience. This is a second layer of survivorship bias on top of the opt-in selection.

**Risk:** The full user population will include users who would not complete the new flow. Their outcomes are not represented in the pilot result.

### Gap 3: No Holdout of Engaged Non-Participants

The control group is described generically. It is not clear whether the control includes users who received the email but did not opt in. If those users are absent from the control, the comparison is between motivated opt-ins and the general baseline — not between two comparable groups exposed to different flows.

**Risk:** The control may not be a valid counterfactual for the pilot cohort.

### Gap 4: Mechanism Unidentified

We do not know which elements of the onboarding flow drove the lift. Without knowing the mechanism, we cannot predict whether it generalizes, whether it degrades over time, or whether it requires the motivational context of an opt-in to work.

---

## Pass/Fail Readiness

| Gate Criterion | Current Status | Required to Proceed |
|---|---|---|
| Retention lift attributable to flow, not opt-in signal | **Fail** — not analyzed | Required |
| Pilot drop-off rate reported and acceptable | **Fail** — not reported | Required |
| Control group is a valid counterfactual for cohort | **Unknown** — not specified | Required |
| Mechanism of lift identified | **Fail** — not analyzed | Strongly preferred |
| Sample size and statistical significance confirmed | **Unknown** — not stated | Required |

**Overall readiness: Not ready for full expansion.**

The pilot produced a promising signal. It did not produce a decision-ready evidence package. Expanding now treats a hypothesis as a finding.

---

## Recommended Next Artifact

**Artifact:** Evidence Repair Plan + Randomized Rollout Design

**Owner:** Product Analytics + Experimentation

**Timeline:** 30–45 days

**Scope:**

1. **Opt-in signal analysis:** Compare 30-day retention of email recipients who opted in vs. those who did not, using the existing control flow. This isolates the selection effect from the flow effect. If opted-in users on the old flow retain at rates similar to the pilot group, the lift is attributable to selection, not the product.

2. **Drop-off audit:** Pull funnel data from the pilot. Report entry count, step-by-step drop-off, and whether the 30-day retention denominator includes or excludes non-completers. Restate the retention lift on the full-entry denominator.

3. **Randomized expansion design:** If the evidence repair confirms a real flow effect, design a randomized rollout to a broader but still bounded segment (not self-selected), with pre-registered success criteria and a defined rollback threshold.

4. **Success criteria for full expansion:** Define minimum acceptable retention lift on the randomized cohort, accounting for the likely lower motivational baseline of non-opt-in users.

**The requesting team should not treat this as a delay. It is the difference between shipping a feature and shipping a claim we can defend.**
