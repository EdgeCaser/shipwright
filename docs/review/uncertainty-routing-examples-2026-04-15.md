# Uncertainty Routing Examples

**Date:** 2026-04-15  
**Purpose:** Show how Shipwright should route different verdict shapes in practice, using the current harness behavior as product examples rather than treating uncertainty as an abstract schema feature.

## Summary

The recent harness work shows that Shipwright needs a routing layer, not just a winner label. The most useful distinction is no longer "which side won?" but:

- is this verdict operationally safe to use directly?
- does this verdict require cross-family confirmation?
- does this verdict mostly tell us what evidence or artifact is missing?

This memo gives three concrete routing examples:

1. a clean non-triggering verdict
2. a tie / low-confidence governance verdict
3. a medium-confidence verdict that still flags `needs_human_review: true`

## Routing Rule

Use this decision order:

1. Check `needs_human_review`
2. Check `judge_confidence`
3. If uncertainty payload exists, treat it as primary routing context
4. Only then decide how much weight to give the winner label

## Example 1: Clean Non-Triggering Verdict

### Shape

- `winner`: present
- `judge_confidence`: `medium` or `high`
- `needs_human_review`: `false`
- no uncertainty payload

### Current live example

`openai-nonprofit-control` GPT live rerun on fresh artifacts:

- winner: `side_b`
- margin: `0.6`
- confidence: `medium`
- `needs_human_review`: `false`

### What this verdict means

This is the cleanest kind of output the harness currently produces. It is still not "ground truth," but it is good enough to act as a provisional recommendation inside a scenario class that is not already marked single-judge unsafe.

In governance, this verdict was still not enough on its own, because the class itself is cross-family required. But structurally, this is the verdict shape that would be safest for direct operational use in a lower-risk class like pricing or prioritization.

### How Shipwright should route it

If the scenario class is not marked cross-family required:

- present the winner as the leading recommendation
- include a short caveat that this is the current best adjudication, not a calibrated ground truth
- proceed to the next product action without requiring more evidence by default

If the scenario class is marked cross-family required:

- do not stop at this verdict
- use it as input to the next adjudication step
- request a second judge family before treating it as externally meaningful

### Orchestrator behavior

Recommended output pattern:

- "Current best adjudication favors X."
- "Confidence is medium/high and no review flag was raised."
- "Proceed directly" only if the scenario class permits single-judge use

## Example 2: Tie / Low-Confidence Governance Verdict

### Shape

- `winner`: `tie`
- `judge_confidence`: `low`
- `needs_human_review`: `true`
- uncertainty payload fully populated

### Current live example

Gemini rejudge on fresh `openai-nonprofit-control` artifacts:

- winner: `tie`
- margin: `0`
- confidence: `low`
- `needs_human_review`: `true`
- uncertainty payload emitted

### What this verdict means

This is the clearest example of the harness doing the right thing by refusing to force convergence.

The useful output here is not the tie itself. The useful output is:

- what is unresolved
- what evidence would resolve it
- what artifact should exist next
- whether the issue is resolvable with more evidence

In this case, the payload pointed to unresolved investor and partner acceptance, governance-design specificity, and enforceability. That is much more actionable than "tie" by itself.

### How Shipwright should route it

Do **not** ask "which side should we trust anyway?"

Instead:

- treat the winner label as secondary
- surface the uncertainty drivers first
- route to the recommended next artifact
- open an evidence-gathering or follow-up analysis workflow

### Orchestrator behavior

Recommended output pattern:

- "The system is not ready to choose a winner."
- "The main blockers are A, B, and C."
- "The next artifact should be X."
- "The next action is gather more evidence on Y."

### Product lesson

This is where the uncertainty payload is clearly more useful than the winner label.

## Example 3: Medium-Confidence Verdict With `needs_human_review: true`

### Shape

- `winner`: present
- `judge_confidence`: `medium`
- `needs_human_review`: `true`
- uncertainty payload populated

### Current live example

Gemini rejudge on `bayer-breakup-not-now`:

- winner: `side_a`
- margin: `0.3`
- confidence: `medium`
- `needs_human_review`: `true`
- uncertainty payload emitted

### What this verdict means

This is the easy case to misuse.

A system that overweights the winner label would say:

- "Side A won, proceed."

But the more correct reading is:

- "Side A currently leads, but the judge still believes important trigger conditions and decision thresholds are unresolved."

This is not a contradiction. It means the judge sees a directional recommendation but not a sufficiently complete decision package.

### How Shipwright should route it

Do not route this the same way as a clean medium-confidence verdict.

Instead:

- present the leading side as provisional
- keep the review flag prominent
- treat the uncertainty payload as required follow-up, not optional context

### Orchestrator behavior

Recommended output pattern:

- "Current lean favors X."
- "However, the recommendation is not ready for direct use because the judge flagged unresolved conditions."
- "Before acting, answer these questions / produce this follow-up artifact."

### Product lesson

This case shows why `needs_human_review` should outrank the winner label. The label gives direction; the review flag determines readiness.

## Practical Routing Table

| Verdict shape | Primary interpretation | Winner weight | Recommended action |
|---|---|---|---|
| medium/high confidence, no review flag, no uncertainty payload | provisionally usable adjudication | medium/high | use directly if class allows |
| tie + low confidence + review flag | unresolved, evidence-seeking state | low | gather evidence / create follow-up artifact |
| winner + medium confidence + review flag | provisional directional lean, not decision-ready | medium but constrained | follow uncertainty payload before acting |

## Product Implications

These examples imply a product stance:

- the winner label is not the product by itself
- uncertainty routing is not a fallback edge case
- review flags and payloads are often the most valuable output on hard scenario classes

This also suggests a UI / orchestration hierarchy:

1. show whether the verdict is safe to act on
2. if unsafe, show why
3. show what artifact or evidence is needed next
4. only then show the winner / margin details

## Decision Frame

Shipwright should route based on verdict readiness, not winner labels alone. The current harness evidence is already rich enough to implement that behavior now.

## Unknowns & Evidence Gaps

- We still need more non-governance examples to know whether the same routing hierarchy should apply across every scenario class.
- We have only a small set of live triggered uncertainty payloads so far.
- We do not yet know whether users will find the uncertainty payload clearer when presented as raw fields or as a more narrative follow-up recommendation.

## Pass/Fail Readiness

Pass:

- enough evidence exists to define three concrete routing modes now
- enough evidence exists to prioritize readiness over winner labels in unstable classes
- enough evidence exists to treat uncertainty payloads as live product outputs

Fail:

- not enough evidence exists to say these are the only routing modes Shipwright will ever need
- not enough evidence exists to finalize class-specific UI or orchestration behavior without further testing

## Recommended Next Artifact

Produce a short **orchestrator decision spec** that maps verdict fields to concrete product actions, UI states, and follow-up artifact generation.
