# PRD: Predictive Task Suggestions

## Decision Frame

**Feature:** Predictive Task Suggestions — the system proactively surfaces recommended next tasks to users based on their recent activity patterns.

**Decision to be made:** Should we invest a full engineering squad (2 engineers, 1 designer, 1 PM) for one quarter to build and ship predictive task suggestions?

**Stakes:** Medium. This is a net-new feature with no existing user commitment. If we build it and it fails, we lose one squad-quarter of capacity. If we skip it and competitors ship it, we lose differentiation in a feature area that is becoming table-stakes in adjacent products.

**Decision deadline:** End of Q3 2026 planning cycle (2026-06-15).

**Who decides:** VP Product, with input from Engineering Lead and Data Science.

**Status: NOT READY for build decision.** The evidence base is insufficient to justify full investment. This PRD exists to frame what we would need to learn before greenlighting.

---

## Problem Statement

Users in our task management platform report spending time figuring out "what to work on next." We hypothesize that surfacing intelligent suggestions could reduce task-switching friction and increase daily active engagement.

**Current evidence supporting the problem:**

| Signal | Source | Strength | Notes |
|--------|--------|----------|-------|
| "I waste time deciding what's next" | 3 support tickets (Q1 2026) | Very Weak | Self-selected complainers, no volume significance |
| Competitor X shipped similar feature | Public changelog | Weak | No data on their adoption or retention impact |
| 12% of sessions show >60s idle on dashboard | Internal analytics | Moderate | Correlation only — idle time may indicate reading, thinking, or AFK |
| PM intuition from user interviews | Anecdotal, 2 interviews | Very Weak | Small sample, leading questions not ruled out |

**Honest assessment:** We have a plausible hypothesis but no validated problem. The strongest signal (idle time) has multiple competing explanations. The qualitative signals are too sparse to distinguish real demand from noise.

---

## Proposed Solution (Conditional)

*This section describes what we would build IF the evidence gaps below are closed.*

An ML-driven suggestion engine that analyzes user task history, priority labels, due dates, and recent completion patterns to surface a ranked list of 3 recommended next tasks. Displayed as a dismissible card on the dashboard.

**Key assumptions requiring validation:**

1. Users actually want guidance on task selection (not just faster access to their own mental model)
2. Our activity data is rich enough to produce non-obvious, useful suggestions
3. Bad suggestions won't erode trust in the platform
4. The feature is discoverable and doesn't clutter the dashboard for users who don't want it

---

## Unknowns & Evidence Gaps

| Gap ID | Unknown | Why It Matters | Proposed Learning Method | Effort | Blocking? |
|--------|---------|---------------|------------------------|--------|----------|
| G-1 | Is "what to work on next" a real pain point at scale? | Without validated demand, we're building on speculation | Survey of 200+ active users with unbiased framing | 2 weeks | Yes — must pass before any build |
| G-2 | What does dashboard idle time actually represent? | Our strongest quantitative signal may be meaningless | Session replay analysis of 50 idle sessions | 1 week | Yes — if idle ≠ indecision, the metric foundation collapses |
| G-3 | Can we generate non-trivial suggestions from existing data? | If suggestions are just "your highest priority task," users won't value it | Data science spike: prototype model on anonymized data, measure suggestion novelty | 2 weeks | Yes — no point building UI for obvious outputs |
| G-4 | Do users trust algorithmic task prioritization? | Trust failure means negative feature — worse than not shipping | Concept test with mockups, 10-15 user interviews | 2 weeks | Partially — can run in parallel with G-1 |
| G-5 | What is the competitive response timeline? | Urgency calibration — if competitors are 6+ months out, we have time to learn properly | Competitive intelligence review | 1 week | No — informs pacing, not go/no-go |

---

## Pass/Fail Readiness

### Current Readiness: FAIL

**Readiness criteria and status:**

| Criterion | Threshold | Current Status | Verdict |
|-----------|-----------|---------------|--------|
| Validated user demand | >30% of surveyed users rank task selection as top-3 friction point | No survey conducted | ❌ FAIL |
| Idle time = indecision | >50% of sampled idle sessions show indecision behavior | No session review conducted | ❌ FAIL |
| Model feasibility | Prototype produces >40% non-obvious suggestions | No prototype exists | ❌ FAIL |
| User trust signal | <20% of concept test participants express distrust | No concept test conducted | ❌ FAIL |
| Business case | Projected impact on activation or retention exceeds squad-quarter cost | Cannot project without demand validation | ❌ FAIL |

**What would change this to PASS:**
All five criteria above must reach their thresholds. Failure on any blocking gap (G-1 through G-3) should kill the initiative or force a fundamental pivot.

**Kill conditions:**
- Survey shows <15% of users identify task selection as meaningful friction → kill
- Session replays show <25% of idle time correlates with indecision → kill
- Prototype suggestions are >60% obvious (just sorted by priority/due date) → kill or pivot to simpler "smart sort" feature

---

## Recommended Next Artifact

**Do not proceed to Technical Spec or Design Spec.**

The next artifact should be a **Discovery Research Plan** covering gaps G-1 through G-4, structured as:

1. **User survey (G-1):** 200+ respondents, unbiased task friction questions, 2-week turnaround
2. **Session replay analysis (G-2):** 50 idle sessions coded by a researcher, 1-week turnaround
3. **Data science spike (G-3):** Prototype suggestion model, novelty scoring, 2-week turnaround
4. **Concept test (G-4):** 10-15 moderated sessions with mockups, 2-week turnaround

G-1 and G-2 should run first (weeks 1-2). If both pass, G-3 and G-4 run in parallel (weeks 3-4). Total discovery timeline: 4 weeks.

**Decision gate:** Reconvene with evidence after discovery sprint. If all pass → proceed to Technical Spec. If any blocking gap fails → kill or pivot.

---

## Appendix: Evidence Provenance

All evidence cited in this PRD is catalogued in the table under Problem Statement. No external research, benchmarks, or customer data beyond what is listed was available at time of drafting. This PRD is intentionally conservative because the evidence does not support confidence.
