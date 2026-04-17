# Churn Reduction PRD: Navigating Conflicting Signals

## Decision Frame

**Problem statement:** Churn rate is elevated, but the signals driving it point in contradictory directions relative to current strategy targets. Specifically, behavioral data, exit survey responses, and retention cohort trends do not converge on a single root cause — and at least one proposed intervention trades off against a stated strategic priority.

**Decision being made:** Whether to (a) pursue a targeted intervention aligned with the dominant behavioral signal, accepting the strategy-target tension explicitly; (b) delay intervention pending signal reconciliation; or (c) decompose the churn population and pursue parallel tracks for distinct sub-segments.

**Stakeholders:** Product, Customer Success, Finance (retention economics), Strategy (owns the conflicting target).

**Scope boundary:** This PRD covers the diagnosis and intervention-readiness decision only. Roadmap commitments and resource allocation are out of scope until the evidence gaps below are resolved.

---

## Unknowns & Evidence Gaps

The following gaps prevent a high-confidence intervention decision today:

1. **Signal attribution is unresolved.** Behavioral signals (in-product usage drop-offs) and self-reported signals (exit surveys) point to different root causes. Without a structured reconciliation — e.g., whether exit-survey respondents are the same cohort showing behavioral decline — the dominant cause is uncertain.

2. **Churn population is likely heterogeneous.** Treating churn as a single population may be masking two or more distinct segments with different causes and different intervention leverage. Segmentation by contract tier, use-case type, or onboarding cohort has not been completed.

3. **Strategy-target conflict is unquantified.** The degree to which the leading intervention trades off against strategy targets is described qualitatively. Without a numeric estimate of the tradeoff magnitude, it is impossible to determine whether the conflict is material or acceptable.

4. **Counterfactual baseline is absent.** There is no established baseline for what churn rate would be under no intervention, making it impossible to size the intervention's expected impact relative to the cost of the strategy-target tension.

5. **Leading vs. lagging indicators are conflated.** It is unclear which signals are predictive (allowing early intervention) versus retrospective (describing already-lost accounts). Intervention design depends critically on this distinction.

---

## Pass/Fail Readiness

**Readiness verdict: NOT READY to commit to a churn intervention roadmap item.**

| Criterion | Status | Blocker? |
|---|---|---|
| Root cause converged across signal types | Not met | Yes |
| Churn population segmented | Not met | Yes |
| Strategy-target tradeoff quantified | Not met | Yes |
| Counterfactual baseline established | Not met | Conditional |
| Leading indicators identified | Not met | Conditional |

**What "pass" looks like:** Signal reconciliation produces a primary cause with at least one corroborating signal type. Churn population is split into addressable segments. The strategy-target tradeoff is expressed numerically and reviewed by Strategy stakeholder. At that point, a scoped intervention PRD can be written for the highest-leverage segment.

**What would justify accelerating past gaps:** If churn velocity is accelerating and the cost of a 4–6 week diagnostic delay exceeds the cost of a wrong-direction intervention, a time-boxed hypothesis-driven experiment on the dominant signal is acceptable — but must be scoped as a learning sprint, not a roadmap commitment.

---

## Recommended Next Artifact

**Artifact:** Signal Reconciliation Brief

**Owner:** Product Analytics + Customer Success

**Deliverable contents:**
- Cross-tabulation of behavioral signal cohort against exit-survey respondent cohort
- Churn segmentation cut by at least two dimensions (e.g., tier × use-case)
- Point estimate with range for the strategy-target tradeoff magnitude
- Identification of at least one leading indicator for each major segment

**Timeline trigger:** This PRD is blocked on that brief. No intervention scoping work should begin until the brief is reviewed and a dominant-cause hypothesis is endorsed by Product and Strategy jointly.

**Escalation condition:** If the signal reconciliation brief itself cannot be produced within two sprint cycles due to data access or instrumentation gaps, escalate to fund a dedicated instrumentation workstream — churn decisions made on unreconciled signals carry compounding risk.

