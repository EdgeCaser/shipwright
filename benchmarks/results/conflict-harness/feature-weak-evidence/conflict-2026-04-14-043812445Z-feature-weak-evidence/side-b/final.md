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

The thresholds below are **provisional defaults that must be calibrated** before the evidence-gathering phase begins. They are not validated benchmarks — they are starting positions for the decision-makers to negotiate based on the specific business context, risk appetite, and investment size of this feature. The team must explicitly ratify or adjust each threshold during the Discovery Research Plan kickoff, grounding them in the organization's own historical conversion rates, prior feature launch data, or stated strategic constraints. Without that calibration step, these numbers are placeholders, not gates.

| Criterion | Status | Required Evidence | Threshold Rationale |
|---|---|---|---|
| Problem validated with target users | ❌ FAIL | Discovery interview transcripts with severity scores | *Threshold TBD:* Team must set minimum sample size based on target segment population and decision confidence level needed. Starting suggestion: ≥6 users, but adjust based on segment accessibility and variance in early interviews. |
| Sufficient users rank problem as high-severity | ❌ FAIL | Interview scoring matrix | *Threshold TBD:* Percentage cutoff should reflect the organization's historical bar for problem-severity signals. If no prior benchmark exists, the first 3-4 interviews should inform whether 30%, 50%, or another cut is appropriate. |
| Concept test shows meaningful intent to use | ❌ FAIL | Painted door or prototype test results | *Threshold TBD:* Intent-to-use cutoff must be benchmarked against the organization's baseline conversion rates for similar features. Industry-generic numbers (e.g., 40%) are unreliable without local calibration. |
| Engineering spike confirms feasibility within budget | ❌ FAIL | Spike report with architecture sketch | *Threshold TBD:* Maximum acceptable build duration depends on team capacity and competing priorities — set during sprint planning, not in the PRD. |
| No blocking cannibalization risk identified | ❌ FAIL | Impact analysis on adjacent features | Binary gate: any identified cannibalization requires explicit mitigation plan before proceeding. |

**Overall readiness: NOT READY — 0 of 5 criteria met.**

This is not a failure of the feature idea. It is a failure of the evidence-gathering process to have been initiated. The appropriate response is to start gathering evidence, not to either kill or approve the feature.

**Critical process note:** The first deliverable of the Discovery Research Plan must be a **threshold-setting workshop** where product leadership, research, and engineering agree on specific, justified cutoffs for each gate. These cutoffs should be documented with their rationale (e.g., "30% severity threshold based on Feature X launch where 28% severity correlated with low adoption") before data collection begins, to prevent post-hoc rationalization.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Building without evidence → wasted investment | High (if we skip validation) | High | Follow evidence-gathering plan below |
| Evidence gathering delays competitive window | Unknown | Unknown | Timebox discovery to 4 weeks max |
| Confirmation bias in interviews | Medium | Medium | Use structured interview protocol, external interviewer if possible |
| Sunk cost fallacy after spike | Medium | Medium | Pre-commit to kill criteria before starting spike |
| False rigor from unjustified thresholds | Medium | Medium | Threshold-setting workshop required before data collection; rationale documented per gate |

---

## Recommended Next Artifact

**Do not proceed to design or engineering.**

The next artifact should be a **Discovery Research Plan** containing:

1. **Threshold-setting workshop agenda** — structured session where decision-makers calibrate Pass/Fail gate cutoffs using organizational baselines, prior feature data, or explicit risk-appetite statements. Output: ratified thresholds with documented justification for each.
2. **Interview protocol** — structured questions targeting problem existence, frequency, severity, and current workarounds (not feature desirability)
3. **Participant recruitment criteria** — target segment definition with screening questions
4. **Painted-door test design** — instrumented fake entry point to measure organic interest
5. **Kill criteria** — explicit thresholds (calibrated in step 1) below which the feature is deprioritized
6. **Timeline** — 4-week timebox for complete evidence package, including threshold calibration in week 1

**If evidence passes calibrated thresholds:** Return to this PRD, update evidence inventory, and re-evaluate Pass/Fail readiness.

**If evidence fails thresholds:** Archive this PRD with findings. The negative result is itself valuable — it prevents future re-litigation of the same idea without new evidence.

---

## Anti-Patterns This PRD Deliberately Avoids

- **Invented personas** — No fictional user stories masking absence of real data
- **Assumed metrics impact** — No projected lift numbers without baseline data
- **Competitive panic** — "Competitor X has it" is not evidence of demand
- **Solution-first framing** — The feature is described as a hypothesis, not a commitment
- **False precision** — No story points, no sprint allocations, no launch dates for an unvalidated concept
- **False rigor** — Readiness gate thresholds are flagged as provisional and require calibration against organizational data before use as decision criteria
