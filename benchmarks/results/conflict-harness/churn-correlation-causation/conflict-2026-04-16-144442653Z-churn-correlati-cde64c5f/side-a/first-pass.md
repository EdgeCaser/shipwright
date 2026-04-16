# Churn Reduction Initiative: Collaboration Feature Activation
**PRD Status:** Draft — Pending Causal Validation Gate
**Owner:** Retention Product Team
**Last Updated:** 2026-04-16

---

## Decision Frame

**What decision does this PRD support?**
Whether to invest engineering and growth resources in a program to drive collaboration feature adoption among users who have been inactive on it for 30+ days, with the stated goal of reducing annual churn from ~22% toward the ~4% rate observed among active collaboration users.

**What this PRD does NOT authorize:**
Full-scale product build or A/B test of a churn-reduction intervention. This document defines the evidence required before a build decision is made.

**Hypothesis under evaluation:**
Activating collaboration feature use *causes* retention improvement. The current evidence supports only: collaboration feature use and retention are correlated.

**Decision stakes:**
- Opportunity: If causal, closing the 18-percentage-point churn gap on even 20% of the inactive-collaboration segment represents significant ARR retention.
- Risk: If non-causal (self-selection), the program will consume engineering capacity and growth budget without moving churn, while creating false confidence in a flawed retention lever.

**Decision type:** Go/No-Go on causal validation experiment. Not a build decision on the churn intervention itself.

---

## Background & Observed Signal

**Observed correlation:**
- Users active on the collaboration feature: 4% annual churn
- Users not active on the collaboration feature (30+ day inactivity): 22% annual churn
- Delta: 18 percentage points

**Why this is interesting:**
An 18pp churn gap is a large signal. Even a partial causal relationship would justify investment. The correlation warrants serious follow-up.

**Why this is not sufficient to build on:**
The self-selection alternative explanation has not been ruled out. Power users — those with higher job function dependency on the product, deeper workflow integration, or stronger organizational mandate — are likely to both (a) adopt collaboration features and (b) retain regardless of feature use. If this is true, driving collaboration adoption in lower-intent users will not reproduce the retention effect observed in self-selected adopters.

Building a retention program on an unvalidated causal claim risks:
1. Wasted engineering and growth spend
2. A false-negative signal (program "fails" because the lever is wrong, not because the approach is wrong)
3. Anchoring future roadmap decisions on a flawed causal model

---

## Unknowns & Evidence Gaps

### Critical Unknowns (block the build decision)

| ID | Unknown | Why It Matters | How to Resolve |
|----|---------|---------------|----------------|
| U1 | Does collaboration adoption *cause* retention, or do retained users self-select into collaboration? | Determines whether an activation program will move the churn metric | Randomized experiment: instrument-assisted activation nudge with holdout |
| U2 | What is the profile of 30-day-inactive collaboration users? Are they low-intent users or lapsed power users? | High-intent lapsed users (e.g., team changed, workflow disruption) may respond to reactivation; low-intent users may not retain even with activation | Behavioral segmentation analysis on inactive cohort |
| U3 | Is there a dose-response relationship? Does collaboration frequency correlate with churn reduction within the active cohort? | A dose-response pattern would strengthen (though not confirm) causal interpretation | Cohort analysis: churn rate by collaboration sessions per month |

### Important Unknowns (inform program design, do not block)

| ID | Unknown | Why It Matters |
|----|---------|---------------|
| U4 | Which collaboration actions correlate most strongly with retention? | Allows targeting the highest-signal behaviors in an activation program |
| U5 | What is the time-to-collaboration-activation for retained users? | Informs intervention timing and urgency window |
| U6 | Do team/account-level collaboration patterns predict individual churn? | May reveal that collaboration's value is network-dependent, not individual-behavior-dependent |

### Ruled Out (do not require investigation)
- Whether the correlation exists: confirmed at 4% vs. 22%, n sufficient for statistical reliability (assumed; should be verified by data team)
- Whether collaboration is generally a valued feature: qualitative evidence and NPS data (assumed available) can confirm directional value without resolving causation

---

## Pass/Fail Readiness

**This PRD is NOT ready to authorize a build.** The following gate criteria must be satisfied before proceeding to a churn-intervention PRD:

### Gate Criteria

| Gate | Criterion | Pass Condition | Status |
|------|-----------|---------------|--------|
| G1 | Causal evidence | A/B test or natural experiment establishes that collaboration activation *causes* measurable retention improvement in a target-representative population | Not started |
| G2 | Segment viability | Behavioral segmentation confirms that the 30-day-inactive cohort contains a reachable, retention-improvable sub-segment (i.e., not purely low-intent churn-destined users) | Not started |
| G3 | Effect size estimate | Validated causal effect is large enough to justify program ROI at realistic activation rates | Pending G1 |

### If gates pass:
Proceed to a churn-intervention PRD defining activation program mechanics, targeting logic, success metrics, and build scope.

### If G1 fails (no causal signal detected):
Re-evaluate the retention model. The collaboration correlation may reflect a confound. Redirect investigation to identify the actual causal lever (e.g., job-to-be-done completion rate, team size, integration depth).

### If G2 fails (inactive cohort is predominantly low-intent):
Narrow intervention scope to lapsed high-intent users only, or pivot to an onboarding-phase collaboration activation strategy where intent selection bias is weaker.

---

## Recommended Next Artifact

**Immediate next step: Causal Validation Experiment Brief**

Before this PRD progresses, the retention team should commission a lightweight experiment brief covering:

1. **Experiment design:** Randomized nudge to activate collaboration among 30-day-inactive users, with a clean holdout. Nudge should be low-cost (in-app prompt, email, or feature highlight — not a full product build) to isolate the activation effect.

2. **Primary metric:** 90-day retention rate, treatment vs. holdout

3. **Secondary metric:** Collaboration activation rate in treatment arm (confirms the nudge worked as an instrument)

4. **Minimum detectable effect:** Define the churn reduction that would justify full program investment; power the experiment accordingly

5. **Timeline:** Recommend a 60-90 day experiment window to allow meaningful churn signal to accumulate

**Parallel workstream:** While the experiment runs, complete U2 (inactive cohort segmentation) and U3 (dose-response analysis). These are non-blocking but will sharpen program design if G1 passes.

**If a pre-experiment build is demanded by stakeholders:**
This PRD recommends against it. If overruled, the team should at minimum instrument the intervention as an experiment with a holdout group so that causal evidence is generated during the rollout rather than deferred indefinitely.

---

## Appendix: Why the Self-Selection Explanation Cannot Be Dismissed

The self-selection hypothesis is not speculative — it is the default prior for any feature-retention correlation in a SaaS product. Users who adopt collaboration features are likely:
- In roles or teams with higher product dependency
- Part of organizations with stronger implementation and enablement
- Further along in their own onboarding and value realization
- Subject to network effects that make leaving more costly (teammates also use the product)

All of these factors independently predict retention. Without an experiment that forces collaboration exposure on users who would not have self-selected into it, the 18pp churn gap cannot be attributed to the feature.

This is not a reason to abandon the hypothesis — it is a reason to test it properly before building.
