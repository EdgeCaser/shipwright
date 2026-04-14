# PRD: [Proposed Feature — Weak Evidence Context]

## Decision Frame

**What decision does this PRD support?**
Whether to invest engineering and design resources in building this feature, given that current supporting evidence is thin.

**Decision type:** Go / No-Go / Investigate Further

**Current recommendation:** **Investigate Further** — the evidence base is insufficient to justify a build decision. This PRD exists to make that gap explicit and to define what evidence would change the recommendation.

**Stakeholders:** Product, Engineering, Design, Business/Revenue

**Time horizon:** The investigation phase should be time-boxed to 2-4 weeks. A go/no-go decision should follow immediately after.

### Problem Statement

We have identified a potential user need, but the supporting evidence is weak:

- No validated user research directly confirming the problem exists at meaningful scale
- No quantitative data on frequency, severity, or revenue impact
- No competitive evidence that this capability drives adoption or retention elsewhere
- The feature concept originates from internal intuition or a small number of anecdotal signals

This PRD is structured as an **evidence audit**, not a feature specification. Writing a full spec against weak evidence would create false confidence and waste downstream effort.

### What We Think We Know (Unvalidated Assumptions)

| Assumption | Source | Confidence | Validation Method |
|---|---|---|---|
| Users experience friction in [target workflow] | Internal team intuition | Low | User interviews (n≥8) |
| This friction causes measurable churn or reduced engagement | None | Very Low | Cohort analysis against proxy metrics |
| Users would adopt the proposed solution over workarounds | None | Very Low | Prototype test or painted-door experiment |
| The feature is technically feasible within current architecture | Preliminary eng assessment | Medium | Spike (time-boxed to 3 days) |

## Unknowns & Evidence Gaps

### Critical Unknowns (Must resolve before any build commitment)

1. **Problem existence at scale.** We have no quantitative signal that more than a handful of users experience this problem. Without this, any build is speculative.
   - *Required evidence:* User interviews (minimum 8 participants from target segment) OR support ticket analysis showing recurring pattern OR behavioral data showing drop-off at the relevant workflow step.
   - *Kill criterion:* If fewer than 3 of 8 interviewees independently surface this problem unprompted, the problem does not clear the bar.

2. **Willingness to adopt.** Even if the problem exists, users may have acceptable workarounds. A solution they will not switch to has zero value.
   - *Required evidence:* Concept test or painted-door experiment with measurable intent signal (click-through, sign-up, stated preference with commitment cost).
   - *Kill criterion:* Intent signal below 15% of exposed users.

3. **Revenue or retention linkage.** No evidence connects this problem to business outcomes.
   - *Required evidence:* Correlation analysis between users who exhibit the target friction behavior and churn/downgrade rates, OR competitive loss data citing this capability.
   - *Kill criterion:* No statistically significant difference in retention between affected and unaffected cohorts.

### Secondary Unknowns (Resolve during build if greenlit)

4. **Technical cost.** Preliminary estimate exists but no spike has been conducted.
5. **Interaction with existing features.** Unknown whether this creates conflicts or redundancy with current capabilities.
6. **Addressable segment size.** Unknown what percentage of the user base falls into the target segment.

### Evidence We Do NOT Have

- No survey data
- No A/B test results
- No competitive benchmarking
- No customer advisory board input
- No sales/CS escalation patterns
- No usage analytics on the target workflow

This is a comprehensive absence. The honest assessment is that this feature idea is currently at the **hypothesis stage**, not the specification stage.

## Pass/Fail Readiness

**Readiness verdict: FAIL — Not ready for build commitment.**

| Readiness Criterion | Status | Notes |
|---|---|---|
| Problem validated with users | ❌ Fail | No user research conducted |
| Quantitative sizing available | ❌ Fail | No data on affected user count or frequency |
| Business case articulated | ❌ Fail | No revenue/retention linkage established |
| Technical feasibility confirmed | ⚠️ Partial | Preliminary estimate only, no spike |
| Solution concept tested | ❌ Fail | No prototype or concept test |
| Stakeholder alignment on priority | ⚠️ Partial | Interest expressed but not against alternatives |

**What would change this to PASS:**
- Complete the three critical unknown investigations listed above
- At least 2 of 3 must clear their kill criteria
- Technical spike must confirm feasibility within acceptable cost envelope
- Re-present to stakeholders with evidence package for prioritization against alternatives

**Estimated cost of investigation phase:** 2-4 weeks, 1 researcher + 0.5 engineer (for spike), minimal design involvement.

**Estimated cost of premature build commitment:** 4-12 weeks of engineering, design, and QA resources applied to an unvalidated hypothesis — with high probability of building something users do not adopt.

## Recommended Next Artifact

**Do not proceed to a technical spec or design brief.**

The next artifact should be an **Evidence Collection Plan** containing:

1. **User interview script** — focused on the target workflow, structured to surface the problem unprompted (no leading questions)
2. **Analytics query spec** — defining the behavioral proxy metrics to pull from existing instrumentation
3. **Painted-door experiment design** — lightweight test to measure adoption intent without building the feature
4. **Kill criteria checklist** — the specific thresholds defined above, written as a decision contract before data collection begins (to prevent post-hoc rationalization)
5. **Timeline and owners** — who runs each investigation track, with a hard deadline for the evidence review meeting

After the evidence review, the appropriate next artifact is either:
- A **full PRD with specification** (if evidence clears the bar), or
- A **decision record** documenting why the feature was shelved (if evidence fails)

---

*This PRD is intentionally incomplete as a feature specification. That is the correct response to weak evidence. A detailed spec written against unvalidated assumptions creates the illusion of rigor while compounding the cost of being wrong.*
