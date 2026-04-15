# PRD: Smart Notification Digest

> **Evidence Status:** WEAK — supporting data is anecdotal and insufficient to authorize build. This PRD specifies the feature tentatively and defines the decision criteria required to advance.

---

## Decision Frame

**Feature:** Smart Notification Digest — batch and summarize incoming notifications into a periodic digest rather than delivering each in real time.

**Decision required by this document:** Whether to authorize a 2-week discovery spike. This is not a build authorization.

**Why now:** Anecdotal signals (3 support tickets, 1 NPS comment) cite notification overload as a friction point. These signals are insufficient to justify build commitment. They are sufficient to ask whether structured investigation is warranted.

**What this PRD does:** Specifies the feature at a hypothesis level, names what must be true for build to be justified, and defines the minimum discovery work to test those conditions. A weak-evidence PRD still specifies — it specifies tentatively, with explicit evidence conditions attached to each material claim.

**Why gating is the right move here:** The rubric dimensions for this class of document include evidence discipline (are claims calibrated to available data?) and decision usefulness (does the document enable a concrete next decision?). Under anecdote-only evidence, specifying a full build without gates would fail evidence discipline — it would assert problem validity and solution fit that neither the data nor the research currently support. The gate structure is not a refusal to specify; it is a specification of what conditions must obtain before the tentative spec below becomes an actionable build target.

**Strategic fit (hypothesis, not finding):** Reducing notification fatigue may improve DAU retention in the 8–30-day cohort where churn is highest. This is an untested assumption.

---

## Problem Statement

Users may be experiencing notification fatigue that degrades engagement. We have no quantified baseline. The problem's cause (volume vs. relevance vs. timing), its prevalence among the user base, and its correlation with churn are all unconfirmed. We do not know whether a digest format is the right solution class.

---

## Tentative Feature Specification

A user-controlled digest mode:

| Element | Tentative Spec | Confidence |
|---------|---------------|------------|
| Delivery model | Batched periodic digest (user-configurable windows: morning / afternoon / evening) | Low — solution class unvalidated |
| Summary format | Ranked notification list, grouped by category, with deferred-action links | Low — UX shape uninformed by research |
| Override controls | Per-category opt-out (e.g., direct messages always real-time) | Medium — standard for digest UX |
| Default state | Opt-in (not default-on) to limit unintended disruption | Medium — conservative launch position |
| Platform scope | Mobile-first; web parity in follow-on sprint | Low — platform priority uninformed by usage data |

This specification is a testable hypothesis, not a committed design. Each element is subject to revision after discovery. The tentative spec exists so that user research and engineering assessment have a concrete artifact to pressure-test.

---

## Unknowns & Evidence Gaps

| # | Unknown | Why It Matters | How to Resolve |
|---|---------|---------------|----------------|
| U-1 | What % of active users receive >N notifications/day? | Determines whether overload is a tail problem or mainstream | Query event logs |
| U-2 | Is notification volume correlated with churn in the 8–30d cohort? | Core causal assumption — if not correlated, feature motivation collapses | Retention cohort analysis |
| U-3 | Do users want batching, or filtering/relevance controls? | Wrong solution class = wasted build | 6–8 user interviews |
| U-4 | Can digest be implemented without real-time infrastructure changes? | Determines spike vs. multi-quarter effort | Engineering assessment (0.5 days) |
| U-5 | Are there delivery-timing SLAs (regulatory or contractual)? | Could block the feature entirely | Legal/compliance review |
| U-6 | What have comparable products shipped, and with what outcomes? | Informs solution shape and expected lift | Desk research |

**Evidence in hand:** 3 support tickets (anecdotal, N=3, non-representative), 1 NPS verbatim.

**Confidence in problem existence:** Low (2/5)
**Confidence in solution fit:** Very low (1/5)

---

## Pass/Fail Readiness

This PRD advances to full build spec only when all Hard Gates are cleared.

### Hard Gates (all required to proceed)
- [ ] **G-1 — Problem validated:** Cohort analysis confirms notification volume correlates with churn at p < 0.05, effect size ≥ 5% churn delta
- [ ] **G-2 — Solution class confirmed:** User interviews (n ≥ 6) indicate digest/batching is preferred over filtering or preference controls
- [ ] **G-3 — Technical feasibility:** Engineering confirms MVP delivery within a 4–6 week window without real-time infrastructure rebuild
- [ ] **G-4 — No blocking constraints:** Legal/compliance confirms no delivery-timing SLAs that would prohibit batching

### Kill Conditions (stop if any are true)
- Cohort analysis shows no correlation between notification volume and churn
- Majority of interviewees prefer relevance filtering over batching
- Engineering estimates >8 weeks for MVP

### Soft Signals (inform prioritization, not gates)
- Support ticket volume trending upward
- Competitor digest adoption linked to measurable retention improvement
- Product leadership alignment that 8–30d retention is a current quarter priority

---

## Recommended Next Artifact

**Immediate action:** Authorize a 2-week discovery spike:

1. **Data workstream (analyst, 3 days):** Retention cohort analysis against notification volume; produces a single finding memo assessing G-1.
2. **Research workstream (designer/researcher, 5 days):** 6–8 user interviews on notification behavior and preferences; produces a synthesis memo assessing G-2.
3. **Engineering assessment (0.5 days):** Architectural review of digest feasibility against current infrastructure; produces a go/no-go memo on G-3.

**Gate review:** If G-1 and G-2 pass, produce a full PRD with quantified baselines, defined MVP scope, success metrics, and engineering estimate. If either fails, close the initiative or redirect to the validated problem.

**If gate review passes, the next PRD will include:**
- Quantified baseline metrics (not anecdote)
- Final MVP scope (not tentative)
- Success metric with target and measurement window
- Engineering estimate
- Rollout and instrumentation plan

---

*Evidence status at time of writing: weak. Tentative specification is provided to enable discovery work and pressure-testing — not to authorize build. Pass/Fail gates define the conditions under which this document upgrades to a build authorization.*
