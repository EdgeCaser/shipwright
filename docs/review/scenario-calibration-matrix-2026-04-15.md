# Scenario Calibration Matrix

**Date:** 2026-04-15  
**Purpose:** Translate the current verdict trust policy into a concrete scenario-class operating matrix for Shipwright.

## Summary

Shipwright is now at the point where scenario-class routing matters more than global judge ranking. The right question is no longer "Which judge should we trust?" but:

- which scenario classes are safe for provisional single-judge use
- which classes require cross-family adjudication
- which classes should route toward evidence collection or artifact refinement instead of forcing a winner

This memo captures the current working calibration status by scenario class, based on available benchmark behavior and the recent governance diagnostics.

## Matrix

| Scenario Class | Current Calibration Status | Single Judge Safe? | Cross-Family Required? | Winner vs. Uncertainty Priority | Recommended Default Mode |
|---|---|---|---|---|---|
| Governance / Board / Restructuring | Calibrated enough to mark as unstable | No | Yes | Uncertainty first | Cross-family adjudication + uncertainty routing |
| Pricing / Packaging | Not yet calibrated | Provisionally | No, but spot-check required | Winner first if medium/high confidence, else uncertainty | Single judge + periodic cross-family calibration |
| Product Strategy / Prioritization | Not yet calibrated | Provisionally | No, but spot-check required | Winner first if confidence holds, else uncertainty | Single judge + spot-check |
| Customer-Evidence Synthesis / Discovery | Not yet calibrated | Provisionally low trust | Often useful | Uncertainty often more valuable | Single judge + uncertainty routing |
| Publication-Claim Scenarios (any class) | Not yet calibrated for safe publication use | No | Yes | Uncertainty and agreement first | Cross-family adjudication |

## 1. Governance / Board / Restructuring

### Status

This is the only class with enough direct evidence to support a hard policy decision today.

### What we observed

- GPT and Claude disagreed heavily across the governance subset.
- The initial 6/6 GPT `side_b` pattern did not survive cross-family pressure.
- `openai-nonprofit-control` did not survive fresh Gemini scrutiny.
- `bayer-breakup-not-now` did not survive fresh Gemini scrutiny either.
- Gemini uncertainty payloads on governance cases were highly decision-useful and often more informative than the nominal winner.

### Calibration decision

Governance is now **explicitly single-judge unsafe**.

### Operating rule

For governance / board / restructuring:

- do not operationalize a single-judge winner as a substantive conclusion
- require cross-family adjudication for any publishable or externally cited claim
- treat `needs_human_review`, low confidence, and the uncertainty payload as the primary product output

### Recommended default mode

`cross-family adjudication + uncertainty routing`

## 2. Pricing / Packaging

### Status

Not enough direct calibration evidence yet.

### Working hypothesis

Pricing decisions may be more amenable to provisional single-judge use than governance, because they are often narrower, more metric-linked, and less entangled with symbolic legitimacy questions. But we do not yet have enough evidence to treat them as safely stable.

### Calibration decision

Pricing is **provisionally single-judge usable**, but not yet trusted as a fully calibrated class.

### Operating rule

For pricing / packaging:

- accept a single-judge verdict only when confidence is `medium` or `high` and review is not flagged
- run periodic cross-family spot-checks before trusting the class more broadly
- if uncertainty payload triggers, route to more evidence or a narrower pricing artifact rather than forcing a winner

### Recommended default mode

`single judge + periodic cross-family calibration`

## 3. Product Strategy / Prioritization

### Status

Not enough direct calibration evidence yet.

### Working hypothesis

This class is probably somewhere between governance and pricing:

- narrower than governance
- but still judgment-heavy and vulnerable to stylistic preference, decision-usefulness weighting, and different interpretations of critique quality

### Calibration decision

Product strategy / prioritization is **provisionally single-judge usable with caution**.

### Operating rule

For product strategy / prioritization:

- allow single-judge routing when confidence is not low and review is not flagged
- use cross-family spot-checks on representative scenarios before promoting the class to broader trust
- if the verdict is low confidence, treat that as a signal that the recommendation likely needs scope-narrowing or more evidence

### Recommended default mode

`single judge + spot-check`

## 4. Customer-Evidence Synthesis / Discovery

### Status

Not enough direct calibration evidence yet.

### Working hypothesis

This class may be especially suited to uncertainty-aware routing because the real product value is often:

- what evidence is missing
- what customer question remains unresolved
- what next synthesis artifact should exist

rather than a hard side winner.

### Calibration decision

Customer-evidence synthesis / discovery is **provisionally low-trust for winner-first use**.

### Operating rule

For discovery / synthesis:

- allow single-judge use only as a provisional directional signal
- prefer uncertainty payloads, missing-evidence questions, and narrowing moves
- treat review flags and low confidence as expected product behavior rather than failure

### Recommended default mode

`single judge + uncertainty routing`

## 5. Publication-Claim Scenarios

### Status

This is not a scenario class by content, but by usage context. It deserves its own rule because publication changes the trust threshold.

### Calibration decision

Anything intended to support an external comparative claim is **single-judge unsafe by definition** until explicitly calibrated.

### Operating rule

For publication claims:

- require cross-family adjudication
- prefer agreement rate and uncertainty analysis over isolated winner counts
- do not cite scenario-level winners from an unstable class as substantive findings

### Recommended default mode

`cross-family adjudication`

## Escalation Triggers

These triggers should be applied across classes unless a stricter class-specific rule overrides them:

- `needs_human_review: true`
- `judge_confidence: low`
- scenario class marked cross-family required
- intended publication or public-facing comparative claim
- known prior instability in that scenario family

If any of these fire, the default should move away from simple winner consumption.

## Suggested Calibration Work

To move this matrix from working policy to stronger evidence-backed policy, Shipwright should next run a small calibration program by class:

### Governance / Board / Restructuring

Goal:

- confirm that the current "single-judge unsafe" status is durable
- measure whether uncertainty payloads converge more reliably than winner labels

### Pricing / Packaging

Goal:

- determine whether single-judge verdicts are stable enough to be operationally useful
- measure how often cross-family spot-checks actually change the recommendation

### Product Strategy / Prioritization

Goal:

- determine how often different judge families disagree on decision-usefulness-heavy recommendations
- test whether winner labels or uncertainty payloads are more stable

### Customer-Evidence Synthesis / Discovery

Goal:

- determine whether uncertainty payloads consistently identify the same missing evidence across families
- test whether this class should default to evidence-routing over winner selection

## Decision Frame

Shipwright should treat scenario calibration as the next reliability layer above the verdict trust policy. The current evidence is enough to classify governance as cross-family required and to treat the other classes as provisional rather than trusted.

## Unknowns & Evidence Gaps

- whether pricing is truly more stable than governance, or just untested
- whether product-strategy scenarios are closer to pricing or governance in judge sensitivity
- whether uncertainty payloads converge more reliably than winner labels across non-governance classes

## Pass/Fail Readiness

Pass:

- enough evidence exists to move from global judge ranking toward class-based routing
- enough evidence exists to mark governance as explicitly single-judge unsafe
- enough evidence exists to define provisional operating modes for other classes

Fail:

- not enough evidence exists to treat the matrix as finalized
- not enough evidence exists to promote any untested class from provisional to trusted

## Recommended Next Artifact

Produce a short **uncertainty-routing examples memo** that shows, side by side, how the orchestrator should react to:

- a clean non-triggering verdict
- a tie / low-confidence governance verdict
- a medium-confidence verdict that still flags `needs_human_review: true`
