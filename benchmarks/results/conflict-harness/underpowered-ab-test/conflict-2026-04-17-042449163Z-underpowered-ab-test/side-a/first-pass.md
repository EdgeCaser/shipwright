# PRD: Feature Full Rollout — Conditional on Risk Acknowledgment

## Decision Frame

The requesting team has completed a 2-week A/B test (1,200 users per variant) showing a 6% lift in the primary metric at p=0.08. The data science team has formally flagged the test as underpowered for the claimed effect size and recommended a minimum 6-week run to reach adequate power.

The PM is invoking a business urgency exception and proceeding to full rollout.

**This PRD documents that decision with full transparency about what the evidence does and does not support.** It is not a recommendation to proceed — it is a structured record of a conditional decision made under acknowledged uncertainty.

**Decision owner:** Product Manager  
**Escalation owner:** VP of Product (required sign-off given flagged evidence gap)  
**Decision type:** High-risk directional bet on underpowered signal  

---

## Unknowns & Evidence Gaps

### What the data supports
- A directional positive signal exists: the primary metric moved 6% in the expected direction.
- The observed effect was consistent across the 2-week window available.

### What the data does not support
- **Effect size reliability:** The data science team flagged the test as underpowered for the claimed effect size. At current sample size and run duration, the confidence interval around the 6% lift is wide enough that the true effect could be materially smaller — or noise.
- **Statistical significance:** p=0.08 does not meet the conventional threshold of p<0.05. One in thirteen runs like this would produce this result by chance even if there is no true effect.
- **Novelty and seasonality effects:** A 2-week window cannot rule out short-term novelty inflation or seasonal confounds that a 6-week run would have surfaced.
- **Segment stability:** No evidence is available that the lift is uniform across user segments. An underpowered aggregate test cannot detect heterogeneous effects.
- **Long-run retention impact:** 2 weeks is insufficient to observe whether the feature change alters downstream retention or engagement curves.

### Risk characterization
If the true effect is smaller than observed — or is noise — the requesting team will have shipped a permanent feature change to all users on a false signal. The cost of unwinding a full rollout is substantially higher than the cost of a 4-week additional test run.

---

## Pass/Fail Readiness

| Readiness Gate | Status | Notes |
|---|---|---|  
| Statistical significance (p<0.05) | **FAIL** | p=0.08; data science team flagged |
| Adequate test power (DS recommendation) | **FAIL** | Minimum 6-week run not completed |
| Segment-level analysis | **UNKNOWN** | Not documented in evidence |
| Novelty/seasonality controls | **UNKNOWN** | 2-week window insufficient |
| VP-level escalation and sign-off | **REQUIRED** | Business urgency exception invoked |
| Rollback plan documented | **REQUIRED** | Must be defined before launch |
| Monitoring thresholds set | **REQUIRED** | Early-warning instrumentation required |

**Minimum conditions for proceeding under the business urgency exception:**
1. VP of Product acknowledges the underpowered test in writing.
2. A rollback plan with defined trigger thresholds is documented and tested before launch.
3. A post-launch monitoring period of no less than 4 weeks is committed to, with explicit metric checkpoints.
4. If post-launch data contradicts the test signal, a rollback decision must be made within the monitoring window — not deferred.

---

## Recommended Next Artifact

**If the team proceeds to full rollout:** A Launch Risk Register and Rollback Runbook are the immediate required artifacts. These must be completed before any production traffic shift.

**If the team pauses to complete the test:** An extended A/B test plan targeting the data science team's recommended 6-week run and minimum sample size should be drafted. This is the lower-risk path.

**In either case:** A post-launch review PRD should be scheduled at the 4-week mark to assess whether observed production data confirms or contradicts the test signal, with a pre-committed decision rule for rollback.

---

## Dissenting Record

The data science team's recommendation — a minimum 6-week run — was not followed. This PRD documents that recommendation and the PM's decision to override it on business urgency grounds. This dissent is recorded here so that retrospective analysis of outcomes has a complete decision log.
