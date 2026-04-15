# PRD: Smart Notification Digest

> **Evidence Status:** WEAK — this PRD is written under low-confidence conditions. Sections are structured to surface gaps, not paper over them.

---

## Decision Frame

**Feature:** Smart Notification Digest — batch and summarize incoming notifications into a periodic digest rather than delivering each in real time.

**Decision required:** Approve a discovery spike (2-week, 1 engineer + 1 designer) to validate core assumptions before committing to build.

**Why this is on the table now:** Anecdotal signals from 3 support tickets and 1 NPS comment cite "notification overload" as a friction point. No structured data collection has occurred. This is not sufficient to spec a full feature — it is sufficient to ask whether the feature is worth investigating.

**What this PRD is NOT:** A build authorization. This document exists to expose what we do not know and propose the minimum work needed to find out.

**Strategic fit (asserted, not proven):** Reducing notification fatigue could improve DAU retention in the 8–30 day cohort where churn is highest. This is a hypothesis, not a finding.

---

## Problem Statement

Users may be experiencing notification fatigue that degrades engagement. We have no quantified baseline. We do not know whether the problem is notification volume, notification relevance, notification timing, or some combination. We do not know whether a digest format is the right solution class or whether suppression, relevance filtering, or preference controls would be higher-leverage.

---

## Proposed Feature (Sketch-Level)

A user-controlled digest mode that:
- Batches notifications into configurable windows (e.g., morning / afternoon / evening)
- Surfaces a ranked summary rather than individual alerts
- Allows per-category opt-out from digest (e.g., direct messages always real-time)

This sketch exists to give the discovery spike a concrete hypothesis to test against — not to pre-commit the implementation shape.

---

## Unknowns & Evidence Gaps

| # | Unknown | Why It Matters | How to Resolve |
|---|---------|---------------|----------------|
| U-1 | What % of active users receive >N notifications/day? | Determines whether "overload" is a tail problem or mainstream | Query event logs |
| U-2 | Is notification volume correlated with churn in the 8–30d cohort? | Core causal assumption — if not correlated, feature motivation collapses | Retention cohort analysis |
| U-3 | Do users want batching, or do they want filtering/relevance? | Wrong solution class = wasted build | 6–8 user interviews |
| U-4 | What is the notification delivery architecture? Can digest be implemented without real-time infrastructure changes? | Determines spike vs. quarter-length effort | Engineering spike (0.5 days) |
| U-5 | Are there regulatory or contractual SLAs on notification delivery timing? | Could block the feature entirely | Legal/compliance check |
| U-6 | What do comparable products do, and what outcomes have they reported? | Informs solution shape and expected lift | Desk research |

**Evidence currently in hand:** 3 support tickets (anecdotal, N=3, non-representative), 1 NPS verbatim (single data point). No quantitative data. No user research. No competitive benchmarks.

**Confidence in problem existence:** Low (2/5)
**Confidence in proposed solution fit:** Very low (1/5)

---

## Pass/Fail Readiness

This PRD is **NOT ready to advance to build** until the following criteria are met:

### Hard Gates (all required)
- [ ] **G-1 — Problem validated:** Cohort analysis confirms notification volume correlates with churn at statistically meaningful level (p < 0.05, effect size ≥ 5% churn delta)
- [ ] **G-2 — Solution class confirmed:** User interviews (n ≥ 6) indicate digest/batching is preferred over filtering or preference controls as the primary intervention
- [ ] **G-3 — Technical feasibility:** Engineering confirms digest can be delivered without real-time infrastructure rebuild (i.e., within a 4–6 week build window)
- [ ] **G-4 — No blocking constraints:** Legal/compliance confirms no delivery-timing SLAs that would prohibit batching

### Soft Signals (inform prioritization, not gates)
- Support ticket volume trending upward (currently flat/unknown)
- Competitor digest adoption linked to measurable retention improvement
- Product leadership alignment that retention in 8–30d cohort is a current quarter priority

### Kill Conditions (stop if any are true)
- Cohort analysis shows no correlation between notification volume and churn
- Majority of interviewees prefer relevance filtering over batching
- Engineering estimates >8 weeks for MVP implementation

---

## Recommended Next Artifact

**Immediate:** Commission a 2-week discovery spike with two parallel workstreams:

1. **Data workstream (analyst, 3 days):** Run retention cohort analysis against notification volume; produce a single finding memo against G-1.
2. **Research workstream (designer/researcher, 5 days):** Conduct 6–8 user interviews focused on notification behavior and preferences; produce a synthesis memo against G-2.

**Gate review:** Reconvene after spike. If G-1 and G-2 both pass, produce a full PRD with quantified success metrics, defined MVP scope, and build estimate. If either fails, close this initiative or redirect to validated problem.

**Artifact produced at gate review (if passing):** Full PRD with:
- Quantified baseline metrics
- Defined MVP scope
- Success metrics with targets
- Engineering estimate
- Rollout plan

---

## What Good Looks Like (for gate review PRD)

- Problem statement backed by cohort data, not anecdote
- Solution shape backed by research, not assumption
- Success metric is a leading indicator measurable within 4 weeks of launch
- Scope is the smallest thing that tests the core hypothesis

---

*This PRD was written under weak-evidence conditions. Its primary purpose is to name what we don't know and define the minimum work to find out — not to justify a build decision.*
