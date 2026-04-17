# PRD: In-App Digest Notifications
**Status:** Pre-Discovery Draft  
**Author:** Product  
**Date:** 2026-04-17  
**Confidence:** Low — evidence base is thin; this document is a decision frame, not a build spec.

---

## Decision Frame

**Feature hypothesis:** Users who receive a weekly in-app digest summarizing their activity and recommended next actions will return to the product more frequently than users who receive no digest.

**Decision required:** Should we invest in a discovery sprint (user interviews + prototype test) to validate this hypothesis before committing engineering resources to a full build?

**Why this matters now:** The team has surfaced this idea twice in planning. Without a structured decision, it will keep resurfacing without resolution.

**What this document is NOT:** A build-ready spec. No scope, no timeline, no resource commitment should be inferred from this draft.

---

## Unknowns & Evidence Gaps

The following unknowns must be resolved before a build decision can be made. No quantitative evidence currently exists to answer them.

| Unknown | Why it matters | How to answer it |
|---|---|---|
| Do users want a digest, or do they want the underlying problem solved differently? | Digests are one solution; the need may not exist or may be better served another way | 6–8 user interviews |
| What cadence (daily, weekly, monthly) matches actual usage patterns? | Wrong cadence = noise, not signal; users opt out | Usage log analysis |
| Will users act on digest content, or dismiss it? | Engagement without action is not retention | Click-through test on prototype |
| Which user segments, if any, would benefit most? | Broad build for low-demand segment is waste | Segmentation analysis against existing cohorts |
| Does an in-app digest compete with or duplicate existing notification channels? | Channel conflict causes opt-out fatigue | Audit of current notification surface |

**Evidence base at time of writing:** No user research, no usage data analysis, no prior experiment results. The hypothesis rests on analogy to patterns observed in other products — not on evidence specific to this product or user base.

---

## Pass/Fail Readiness

This PRD does **not** pass build-readiness criteria. The following gates must be met before a build PRD is warranted:

| Gate | Status | Owner |
|---|---|---|
| At least one validated user pain point mapped to this feature | ❌ Not met | Research |
| Usage data confirms the behavioral gap the digest would address | ❌ Not met | Analytics |
| At least one prototype test with measurable engagement signal | ❌ Not met | Design |
| Segment identified with sufficient size to justify scope | ❌ Not met | Analytics |

**Recommendation:** Do not proceed to build spec. Proceed to discovery.

---

## Recommended Next Artifact

**Artifact:** Discovery Brief  
**Owner:** Product + Research  
**Scope:** Define 3 research questions, recruit 6–8 users from target cohort, run interviews + low-fidelity prototype test within one sprint.  
**Exit criteria for Discovery Brief:** At least 2 of the 4 build-readiness gates above are met, OR the hypothesis is falsified and the feature is shelved.  

This PRD should be revisited only after the Discovery Brief produces findings. If findings are positive, a build-ready PRD with defined scope, acceptance criteria, and success metrics can be drafted at that time.
