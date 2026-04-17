# PRD: In-App Digest Notifications
**Status:** Pre-Discovery Draft  
**Author:** Product  
**Date:** 2026-04-17  
**Confidence:** Low — evidence base is thin; this document is a decision frame, not a build spec.

---

## Decision Frame

**Feature hypothesis:** Users who receive a weekly in-app digest summarizing their activity and recommended next actions will return to the product more frequently than users who receive no digest.

**Decision required:** Which path forward is warranted given the current evidence level — shelve the idea, run a lightweight triage (analytics pull or problem-framing exercise), or invest in a structured discovery sprint?

**Why this matters now:** The team has surfaced this idea twice in planning. Without a structured decision, it will keep resurfacing without resolution.

**What this document is NOT:** A build-ready spec. No scope, no timeline, no resource commitment should be inferred from this draft.

### Alternative Decision Paths

Before recommending a course of action, the following paths must be weighed:

| Path | Trigger condition | Cost |
|---|---|---|
| Shelve immediately | No stakeholder can articulate a specific user pain this solves | Lowest |
| Lightweight triage first | A pain statement exists but behavioral data hasn't been checked | 1–3 days, Analytics only |
| Full discovery sprint | Triage confirms behavioral gap; problem is plausibly real but solution is unvalidated | 1 sprint, Research + Design |
| Build spec now | Validated pain, prototype signal, segment identified | Engineering commitment |

**Current position:** No user pain statement has been documented, and no behavioral data has been examined. This places the feature at the "lightweight triage" threshold — not yet at "discovery sprint." The recommendation in this document is therefore conditional: run triage first; escalate to discovery only if triage surfaces a real gap.

---

## Unknowns & Evidence Gaps

The following unknowns must be resolved before a build decision can be made. No quantitative evidence currently exists to answer them.

| Unknown | Why it matters | How to answer it |
|---|---|---|
| Is there a documented user pain this digest would address? | Without a pain statement, discovery investment may be premature | Stakeholder interview or existing support ticket review |
| Do usage logs show a behavioral gap consistent with the hypothesis? | Confirms or falsifies whether the problem is real before research spend | Analytics pull (1–3 days) |
| Do users want a digest, or do they want the underlying problem solved differently? | Digests are one solution; the need may not exist or may be better served another way | 6–8 user interviews (only after triage) |
| What cadence matches actual usage patterns? | Wrong cadence = noise, not signal; users opt out | Usage log analysis |
| Will users act on digest content, or dismiss it? | Engagement without action is not retention | Click-through test on prototype |
| Which user segments, if any, would benefit most? | Broad build for low-demand segment is waste | Segmentation analysis against existing cohorts |
| Does an in-app digest compete with existing notification channels? | Channel conflict causes opt-out fatigue | Audit of current notification surface |

**Evidence base at time of writing:** No user research, no usage data analysis, no prior experiment results. The hypothesis rests on analogy to patterns observed in other products — not on evidence specific to this product or user base.

---

## Pass/Fail Readiness

This PRD does **not** pass build-readiness criteria. The following gates must be met before a build PRD is warranted:

| Gate | Status | Owner |
|---|---|---|
| At least one documented user pain point mapped to this feature | ❌ Not met | Research / Support review |
| Usage data confirms the behavioral gap the digest would address | ❌ Not met | Analytics |
| At least one prototype test with measurable engagement signal | ❌ Not met | Design |
| Segment identified with sufficient size to justify scope | ❌ Not met | Analytics |

**Recommendation:** Do not proceed to build spec. Do not yet commit to a full discovery sprint. Proceed to lightweight triage — a targeted analytics pull and stakeholder pain-statement check — to determine whether the problem is real enough to justify research investment.

---

## Recommended Next Artifact

**Artifact:** Triage Brief (lightweight, not a full Discovery Brief)  
**Owner:** Product + Analytics  
**Scope:** (1) Document any existing stakeholder or user pain statement for this problem. (2) Pull usage logs to check whether a behavioral gap consistent with the hypothesis exists. Time-box to 3 days.  
**Exit criteria:**
- If no pain statement surfaces and logs show no gap → shelve; no further artifact needed.
- If a gap is confirmed → escalate to a full Discovery Brief with user interviews and prototype test.

A full Discovery Brief and any subsequent build-ready PRD should be drafted only after triage produces positive findings.
