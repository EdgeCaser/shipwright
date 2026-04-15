# Claude Orchestrator Handoff

**Date:** 2026-04-15  
**Purpose:** Summarize what changed in the conflict-harness work, why the focus has shifted to orchestration, and where Claude's feedback would be most valuable before implementation starts.

## What We Did

Over the last leg of work, we completed four meaningful steps:

1. Implemented Phase 2 uncertainty payload support in the conflict harness.
2. Live-validated both branches of that behavior:
   - a non-triggering path on a successful GPT run
   - a triggering path on Gemini rejudges that emitted the full uncertainty payload
3. Re-ran the strongest governance candidates across model families.
4. Converted the resulting lessons into a set of product-policy memos.

## What We Learned

The biggest conclusion is not "which judge is best."

It is:

- a single judge is not globally trustworthy
- governance is explicitly single-judge unsafe
- cross-family disagreement is itself a real finding
- the uncertainty payload is often more decision-useful than the winner label on hard cases

More specifically:

- `openai-nonprofit-control` did not hold up as a robust winner once Gemini rejudged the fresh artifacts
- `bayer-breakup-not-now` also did not hold up as a robust governance winner
- the governance subset no longer supports a robust-winner publication claim
- the strongest product asset from this work is now the uncertainty-routing behavior, not a judge-family thesis

## Why The Focus Shifted

At this point, more abstract judge-comparison work looks lower leverage than productizing what we already know.

The main current failure mode is not "the models provide no signal." It is "Shipwright can present fragile outputs too much like final answers."

That means the highest-value next move is to improve UX and orchestration so the product:

- recommends the right level of rigor
- asks before spending more tokens
- degrades gracefully when only one or two providers are available
- treats unresolved results as evidence-routing problems rather than forced winner selection

## Current V1 Direction

We drafted an orchestration policy with this staged behavior:

1. Start with a recommended initial mode based on scenario class.
2. If a single analysis comes back below the confidence threshold, recommend a double panel.
3. If the double panel disagrees, recommend escalating to a third-model judge.
4. If the final outcome is still low-confidence or review-flagged, stop chasing a winner and route to uncertainty-first follow-up.

Additional V1 constraints:

- ask for confirmation before any extra token-spending stage
- do not assume users have access to GPT, Claude, and Gemini
- degrade gracefully for one-provider and two-provider setups

## Artifacts Now In Place

The current planning stack is:

- [verdict-trust-policy-2026-04-15.md](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/docs/review/verdict-trust-policy-2026-04-15.md:1)
- [scenario-calibration-matrix-2026-04-15.md](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/docs/review/scenario-calibration-matrix-2026-04-15.md:1)
- [uncertainty-routing-examples-2026-04-15.md](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/docs/review/uncertainty-routing-examples-2026-04-15.md:1)
- [orchestrator-decision-spec-2026-04-15.md](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/docs/review/orchestrator-decision-spec-2026-04-15.md:1)
- [orchestrator-implementation-plan-2026-04-15.md](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/docs/review/orchestrator-implementation-plan-2026-04-15.md:1)
- [orchestrator-build-checklist-2026-04-15.md](/C:/Users/ianfe/OneDrive/Documents/GitHub/shipwright/docs/review/orchestrator-build-checklist-2026-04-15.md:1)

## Where Your Input Would Help Most

Three things feel especially worth pressure-testing:

1. Is the staged `single -> double -> judge -> uncertainty-first` flow the right V1 product shape, or is there a simpler / safer variant?
2. Is the temporary 80% threshold a reasonable operational trigger for recommending a double panel, given that current confidence labels are not yet statistically calibrated?
3. Are we correctly prioritizing orchestration UX over additional judge-analysis work at this moment, or is there one more empirical step that would materially change the product policy before implementation?

## The Question

Does this orchestration-first direction look right to you?

In particular, I would value your take on:

- where the policy is too complicated for V1
- where it is still too optimistic
- whether the provider-availability handling and confirmation gating feel like the right product defaults
- what the most important missing edge case is before implementation starts

## Decision Frame

We are leaning toward building the orchestration layer now because it seems like the highest-leverage reliability improvement available from current evidence.

## Unknowns & Evidence Gaps

- whether the 80% threshold should really be global in V1
- whether double-panel disagreement should ever resolve without a judge in two-provider environments
- whether some non-governance classes deserve a different default path from day one

## Pass/Fail Readiness

Pass:

- enough evidence exists to justify orchestration-first UX work now
- enough evidence exists to mark governance as cross-family required
- enough evidence exists to treat uncertainty-first routing as core product behavior

Fail:

- not enough evidence exists to treat the threshold or all class policies as finalized
- not enough implementation detail has been pressure-tested yet by another reviewer

## Recommended Next Artifact

Claude feedback on the orchestration policy and implementation plan, especially any simplifications, hidden risks, or missing edge cases before coding starts.
