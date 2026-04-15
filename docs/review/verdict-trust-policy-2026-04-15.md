# Verdict Trust Policy

**Date:** 2026-04-15  
**Purpose:** Define when Shipwright can rely on a single-judge verdict, when it should escalate to cross-family adjudication, and when it should route toward evidence collection instead of forcing a winner.

## Summary

Shipwright should not currently optimize for a single "best judge." The evidence so far does not support that framing. What the data does support is a trust policy:

- some verdicts are safe enough to use directly
- some verdicts are only safe with cross-family confirmation
- some verdicts should not be operationalized as winner claims at all and should instead trigger evidence-seeking or artifact-generation workflows

The immediate product goal is therefore not "pick the right judge." It is "use the right routing rule for the kind of uncertainty we have."

## Policy

### 1. Single-judge verdicts are advisory by default

Until a scenario class is explicitly calibrated, a single-judge verdict should be treated as:

- a provisional directional signal
- not a robust claim about substantive correctness
- not sufficient on its own for publication-grade comparative conclusions

This is especially important for governance, board, restructuring, and other high-stakes strategy scenarios where the recent runs showed large judge-family sensitivity.

### 2. Single-judge use is acceptable only under constrained conditions

Shipwright may treat a single-judge verdict as operationally usable when all of the following hold:

- `judge_confidence` is `medium` or `high`
- `needs_human_review` is `false`
- the scenario class is not on the "cross-family required" list
- the verdict does not rely on a known unstable claim type from prior diagnostics

Even here, the verdict should still be framed as "best current adjudication," not "ground truth."

### 3. Cross-family adjudication is required for high-stakes or unstable scenario classes

Cross-family adjudication should be the default for:

- governance / board / control / restructuring scenarios
- scenarios intended for publication claims
- scenarios where prior runs showed large family disagreement
- scenarios where side labels or provider-family affinity may plausibly distort outcomes

In these cases, the product should assume that one judge family is not enough.

### 4. `needs_human_review` is a routing signal, not just a warning label

When `needs_human_review: true`, Shipwright should not treat the winner as the main output.

Instead, the orchestrator should prefer:

- uncertainty payload
- missing-evidence plan
- recommended next artifact
- escalation or evidence-gathering action

This means the user-facing question becomes:

- "What should we do next to resolve this?"

not:

- "Which side won?"

### 5. Low confidence should block forceful winner use

When `judge_confidence` is `low`, Shipwright should not use the verdict as a strong recommendation unless there is external confirmation from:

- another judge family
- a human review workflow
- new evidence that directly resolves the identified uncertainty

Low confidence is not merely weaker confidence. In the current system, it is often the best available signal that the winner label is not reliable enough to carry the decision alone.

### 6. The uncertainty payload is first-class output

The Phase 2 uncertainty payload should now be treated as part of the core product contract.

If triggered, its fields should guide routing more than the nominal winner:

- `uncertainty_drivers`
- `disambiguation_questions`
- `needed_evidence`
- `recommended_next_artifact`
- `recommended_next_action`
- `can_resolve_with_more_evidence`
- `escalation_recommendation`

For some scenario classes, especially governance, this payload is likely to be more decision-useful than the winner itself.

## Scenario-Class Routing Rules

### Governance / Board / Restructuring

Default policy:

- do not trust a single-judge winner as a substantive claim
- require cross-family adjudication for any publishable conclusion
- if any judge returns `low` confidence or `needs_human_review: true`, route to evidence-gathering or governance-design follow-up rather than forcing convergence

Current evidence:

- GPT/Claude disagreement was already high
- Gemini removed the remaining plausible robust-winner examples
- this class should now be considered "cross-family required"

### Pricing / Packaging / Product Strategy

Default policy:

- single-judge use may be acceptable if confidence is `medium` or `high` and review is not flagged
- still calibrate with spot-check cross-family runs before trusting the class broadly

Current evidence:

- not yet sufficiently calibrated
- should be treated as "single judge allowed only provisionally"

### Evidence-Synthesis / Customer / Discovery

Default policy:

- prefer uncertainty-aware routing when the question depends on missing evidence or ambiguous synthesis
- use the uncertainty payload to ask for more data or a narrower synthesis artifact

Current evidence:

- not yet sufficiently calibrated
- likely to benefit from explicit "what evidence is missing?" routing even when a judge chooses a side

## Operational Rules For The Orchestrator

When a verdict comes back, apply this order:

1. Check `needs_human_review`.
2. Check `judge_confidence`.
3. If uncertainty payload exists, treat it as primary routing context.
4. Only then decide how much weight to give the winner label.

This is the recommended action hierarchy:

1. `needs_human_review: true`
Route to:
- evidence gathering
- follow-up artifact creation
- cross-family adjudication
- human review, depending on `escalation_recommendation`

2. `judge_confidence: low`
Route to:
- cross-family adjudication
- evidence collection
- narrow follow-up artifact

3. medium/high confidence with no review flag
Route to:
- provisional recommendation
- optional cross-family spot-check if scenario class is not yet calibrated

## What We Know Now

The current evidence supports these working truths:

- we do not know which single judge is best in general
- we do know that some scenario classes are unsafe for single-judge reliance
- governance is one of those classes
- the uncertainty payload is now validated in live use and should be used as product output, not merely schema decoration

## What We Still Need

To make Shipwright reliably usable, the next empirical step is not more winner-chasing on governance. It is a small calibration matrix by scenario type.

Recommended matrix:

- governance / board / restructuring
- pricing / packaging
- prioritization / roadmap
- customer-evidence synthesis

For each class, measure:

- cross-family agreement rate
- review-flag rate
- low-confidence rate
- how often uncertainty payloads converge on the same missing evidence

That is the dataset needed to decide when a single judge is enough.

## Decision Frame

Shipwright should move from "judge selection" to "verdict trust policy." The system is closer to knowing when not to trust a single judge than to knowing which judge to trust globally, and that is enough to make the next product move.

## Unknowns & Evidence Gaps

- which scenario classes are actually stable enough for single-judge use
- whether any judge family is reliably superior inside a narrow scenario class
- whether uncertainty payloads converge more reliably than winner labels across judge families

## Pass/Fail Readiness

Pass:
- enough evidence exists to define single-judge unsafe conditions now
- enough evidence exists to require cross-family adjudication for governance
- enough evidence exists to elevate uncertainty routing to a first-class product behavior

Fail:
- not enough evidence exists to name a globally trusted default judge
- not enough evidence exists to assume the same trust policy applies equally across all scenario classes

## Recommended Next Artifact

Produce a short **scenario calibration matrix memo** with one page per scenario class, summarizing:

- single-judge safe / unsafe status
- escalation triggers
- recommended adjudication mode
- whether the uncertainty payload or the winner label should dominate routing
