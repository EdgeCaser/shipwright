# PRD: Collaboration Feature Adoption — Churn Reduction Initiative

**Status:** Pre-Validation — Causal Evidence Required Before Broad Campaign Commitment
**Owner:** Product
**Last Updated:** 2026-04-17

---

## Decision Frame

**The question this PRD answers:** Should we invest in driving collaboration feature adoption as a mechanism to reduce annual churn, and if so, at what scale and under what conditions?

**Observed signal:** Users who actively use the collaboration feature churn at 4% annually. Users who do not use it churn at 22% annually. The gap is large and directionally compelling.

**What this signal does not tell us:** Whether collaboration feature usage *causes* lower churn, or whether low-churn users (power users, enterprise seats, high-investment accounts) self-select into collaboration regardless of any intervention. These two explanations predict identical observational data and cannot be distinguished without experimental evidence.

**Decision at stake:** Committing engineering and growth resources to a broad 30-day non-use targeting campaign before the causal question is resolved risks investing in a mechanism that produces no retention lift. However, withholding all funding is also an overreach — constrained pre-pilot investments in instrumentation, segmentation, and a low-risk pilot rollout can and should proceed. The line is between funding the pilot infrastructure and funding a broad retention campaign premised on causation we have not established.

**What this PRD recommends:** Do not launch a broad targeting campaign premised on the causal claim. Do fund the segmentation audit, instrumentation work, and pilot rollout needed to resolve the causal question.

---

## Unknowns & Evidence Gaps

| # | Unknown | Why It Matters | Resolution Path |
|---|---------|---------------|----------------|
| 1 | **Causation vs. self-selection** | If power users self-select into collaboration, no intervention will replicate the 4% churn rate in the non-user population | Randomized experiment: prompt a random subset of non-users at day 15 and measure 90-day churn vs. control |
| 2 | **Drivability of adoption** | Whether non-users can be meaningfully nudged into genuine collaboration use is unestablished | A/B test in-product prompts; measure feature activation rate and session depth, not just feature touch |
| 3 | **What "active use" means in the churn correlation** | If the correlation was computed on any feature touch, driven superficial usage may not replicate the retention effect | Audit the correlation dataset definition before designing experiment success criteria |
| 4 | **Segment composition of non-users** | Non-users may skew toward free-tier, low-seat, or trial accounts that churn for structural reasons unrelated to feature adoption | Segment the 22% churn cohort by plan tier, seat count, and tenure before targeting |
| 5 | **Direction of causality in time** | Does collaboration use precede churn reduction, or do retained users accumulate feature use over time? | Confirm temporal ordering in the dataset (feature use at day N predicts churn at day N+90, not reverse) |

**Evidence available:** One observational correlation (4% vs. 22% annual churn, collaboration users vs. non-users). No experiment. No segment breakdown. No temporal ordering confirmation. No definition of "active use" provided.

**Evidence not available:** Any causal evidence. Any data on whether non-users can be converted. Any evidence that driven adoption produces the same retention effect as self-selected adoption.

---

## Pass/Fail Readiness

This PRD is **not ready to authorize a broad targeting campaign**. It is ready to authorize constrained pre-pilot investments. The distinction matters:

**Authorized now (no causal evidence required):**
- Segmentation audit of the 22% non-user churn cohort by plan tier, seat count, and tenure
- Instrumentation to confirm temporal ordering (feature use at day N → churn outcome at day N+90)
- Audit of the correlation dataset definition (what counts as "active" collaboration use)
- Design and launch of a randomized pilot (e.g., 10% of eligible non-users prompted at day 15)

**Not authorized until pilot reads out:**
- Broad targeting campaign framed as a churn reduction mechanism
- Engineering investment in campaign infrastructure premised on the causal claim
- Retention commitments to stakeholders based on the 4% vs. 22% gap

**Gate 1 — Temporal ordering confirmed**
Confirm that collaboration feature use *precedes* churn reduction in the dataset. Closeable with existing data.

**Gate 2 — Segment audit complete**
Break the non-user churn cohort by plan tier and seat count. If churn is concentrated in structurally high-risk segments, feature adoption targeting will not address root cause.

**Gate 3 — Pilot experiment read**
The randomized pilot must produce a readable signal on both adoption rate and 90-day churn before full campaign investment is approved.

**Failure mode if Gates 1–3 are skipped for the broad campaign:** We ship a targeting campaign that drives superficial collaboration touches, reports adoption lift, and observes no churn reduction — because the retained users were always going to retain and the 22% cohort churns for reasons unrelated to collaboration.

---

## Recommended Next Artifact

**Artifact:** Experiment Brief — Collaboration Adoption Pilot

**Contents:**
- Hypothesis: Prompting non-users to attempt collaboration at day 15 will increase 90-day retention vs. unprompted control
- Treatment: In-product nudge with a concrete collaboration use case (e.g., shared workspace invite)
- Control: No nudge
- Primary metric: 90-day retention rate, treatment vs. control
- Secondary metric: Collaboration feature activation rate (defined as ≥1 collaborative session with ≥1 other user)
- Sample size and power: To be calculated based on baseline churn rate in target segment after segmentation audit
- Read date: 90 days post-launch
- Decision rule: If treatment retention is not meaningfully above control, do not proceed with broad campaign

**Why this, not a full targeting PRD:** We do not yet have the evidence to specify what intervention will work, for whom, or at what scale. The experiment brief paired with the segmentation audit is the correct next artifact. A full targeting PRD written now would be built on a causal assumption that may be invalidated by the pilot.

---

## Appendix: What Would Change This Recommendation

If the segment audit reveals that the 22% non-user cohort is concentrated in mid-market accounts with high collaboration surface area (multi-seat, active teams), the causal hypothesis becomes stronger and the experiment brief could be expedited. If temporal ordering is already confirmed in existing analytics, Gate 1 closes immediately. Neither condition has been verified as of this writing.
