# PRD: [Proposed Feature] — Weak Evidence Assessment

## Decision Frame

**What decision does this PRD support?**
Whether to invest engineering and design resources in building [Proposed Feature] given the current state of supporting evidence.

**Decision type:** Go / No-Go / Investigate Further

**Current recommendation:** **Investigate Further** — the evidence base is insufficient to justify a build commitment. This PRD exists to make that insufficiency explicit and actionable, not to rationalize proceeding anyway.

**Stakes:** Medium. Proceeding without evidence risks wasted cycles and opportunity cost. Delaying to gather evidence risks competitive window (unquantified) and internal momentum loss.

**Who decides:** Product leadership, with input from engineering on feasibility cost and data/research on evidence-gathering timeline.

---

## Problem Statement

A feature has been proposed based on signals that do not yet meet the threshold for confident investment. The signals may include: anecdotal customer requests, intuition from domain experts, competitive feature parity impulses, or internal stakeholder enthusiasm. None of these individually or collectively constitute validated demand or validated feasibility.

**What we think the problem is:** Users may need [capability], based on [signal source].

**What we actually know:** Very little. The evidence inventory below is honest about this.

---

## Evidence Inventory

| # | Evidence Type | Source | Strength | Notes |
|---|---|---|---|---|
| 1 | No quantitative usage data | — | None | No proxy metrics, no instrumentation in adjacent features |
| 2 | No customer interview data | — | None | No structured discovery interviews conducted |
| 3 | No competitive analysis | — | None | Competitor feature existence ≠ competitor feature success |
| 4 | No market sizing | — | None | TAM/SAM/SOM for this capability not estimated |
| 5 | No prototype test results | — | None | No concept tests, no wizard-of-oz, no painted door |

**Evidence grade: F — No validated evidence exists.**

---

## Unknowns & Evidence Gaps

### Critical Unknowns (must resolve before Go decision)

1. **Demand validation:** Do users actually experience the problem this feature solves, or are we projecting? 
   - *Resolution method:* 8-12 structured discovery interviews with target segment, scored on problem frequency and severity
   - *Timeline:* 2-3 weeks
   - *Cost:* Low (researcher time only)

2. **Willingness to change behavior:** Even if the problem exists, will users adopt a new workflow to solve it?
   - *Resolution method:* Painted-door test or concept test with clickable prototype
   - *Timeline:* 2-4 weeks after demand validation
   - *Cost:* Low-medium (design + instrumentation)

3. **Feasibility envelope:** Can we build this within acceptable cost and timeline constraints?
   - *Resolution method:* Engineering spike (timeboxed to 3 days)
   - *Cost:* Medium (engineering time)

### Important Unknowns (should resolve before build commitment)

4. **Retention impact:** Will this feature improve retention, or is it a novelty that decays?
5. **Cannibalization risk:** Does this compete with or undermine existing features?
6. **Maintenance burden:** What is the ongoing cost of supporting this feature?

### Acknowledged Ignorance

7. We do not know what we do not know about the problem space. Discovery interviews may reveal the real problem is adjacent to what we assumed.

---

## Pass/Fail Readiness

### Readiness Criteria for Go Decision

| Criterion | Status | Required Evidence |
|---|---|---|
| Problem validated with ≥6 users | ❌ FAIL | Discovery interview transcripts with severity scores |
| ≥30% of interviewed users rank problem in top 3 | ❌ FAIL | Interview scoring matrix |
| Concept test shows ≥40% intent to use | ❌ FAIL | Painted door or prototype test results |
| Engineering spike confirms feasibility ≤ 6 weeks | ❌ FAIL | Spike report with architecture sketch |
| No blocking cannibalization risk identified | ❌ FAIL | Impact analysis on adjacent features |

**Overall readiness: NOT READY — 0 of 5 criteria met.**

This is not a failure of the feature idea. It is a failure of the evidence gathering process to have been initiated. The appropriate response is to start gathering evidence, not to either kill or approve the feature.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Building without evidence → wasted investment | High (if we skip validation) | High | Follow evidence-gathering plan below |
| Evidence gathering delays competitive window | Unknown | Unknown | Timebox discovery to 4 weeks max |
| Confirmation bias in interviews | Medium | Medium | Use structured interview protocol, external interviewer if possible |
| Sunk cost fallacy after spike | Medium | Medium | Pre-commit to kill criteria before starting spike |

---

## Recommended Next Artifact

**Do not proceed to design or engineering.**

The next artifact should be a **Discovery Research Plan** containing:

1. **Interview protocol** — structured questions targeting problem existence, frequency, severity, and current workarounds (not feature desirability)
2. **Participant recruitment criteria** — target segment definition with screening questions
3. **Painted-door test design** — instrumented fake entry point to measure organic interest
4. **Kill criteria** — explicit thresholds below which the feature is deprioritized (e.g., fewer than 3/10 interviewees report the problem unprompted)
5. **Timeline** — 4-week timebox for complete evidence package

**If evidence passes thresholds:** Return to this PRD, update evidence inventory, and re-evaluate Pass/Fail readiness.

**If evidence fails thresholds:** Archive this PRD with findings. The negative result is itself valuable — it prevents future re-litigation of the same idea without new evidence.

---

## Anti-Patterns This PRD Deliberately Avoids

- **Invented personas** — No fictional user stories masking absence of real data
- **Assumed metrics impact** — No projected lift numbers without baseline data
- **Competitive panic** — "Competitor X has it" is not evidence of demand
- **Solution-first framing** — The feature is described as a hypothesis, not a commitment
- **False precision** — No story points, no sprint allocations, no launch dates for an unvalidated concept
