# Governance Status Update

**Date:** 2026-04-15  
**Purpose:** Consolidate the current governance-scenario conclusions after the Claude replay diagnostic, the swap test, the latest successful `openai-nonprofit-control` rerun, and the Phase 2 uncertainty-payload implementation.

## Summary

The strongest current conclusion is unchanged in direction but stronger in wording support: the earlier 6/6 GPT `side_b` governance pattern should not be treated as a scenario-level finding. The available evidence is now best explained by a mix led by judge-family effects, with some scenario-specific robustness on a smaller subset of cases.

The most important new data point is a successful live rerun of `openai-nonprofit-control` under the Phase 2 codepath. GPT again selected `side_b`, but this time at **margin 0.6, medium confidence, and no human-review flag**. That materially strengthens the case that `openai-nonprofit-control` is one of the few governance scenarios that may be robustly `side_b` across families and across reruns, not just an artifact of the earlier low-confidence screen.

Separately, the Phase 2 implementation is now validated in live harness execution. The run completed end to end under the updated schema. The new uncertainty payload did not appear in this particular verdict because the trigger conditions did not fire, which is the correct behavior.

## Evidence Base

This update reflects:

- The governance diagnostic memo: 6 Claude rejudges over the governance set, 21 v2 GPT main-run verdicts, and 1 swap test.
- The latest completed live run: `openai-nonprofit-control` run `conflict-2026-04-15-151006536Z-openai-nonprofit-control`.
- The Phase 2 schema/prompt implementation now on `main`.

### Prior governance diagnostic still holds

The earlier diagnostic remains the right baseline:

- GPT and Claude disagreed on 4/6 governance scenarios.
- The 6/6 GPT `side_b` pattern did not reproduce under Claude.
- The disagreement mechanism was not just winner-label churn; it traced to opposite-sign scoring on the same rubric dimensions, especially `evidence_discipline`.

That still rules out any simple publication claim that "the governance scenarios are just `side_b` cases."

### New live rerun: `openai-nonprofit-control`

The latest completed run produced:

- winner: `side_b`
- margin: `0.6`
- judge confidence: `medium`
- `needs_human_review`: `false`
- decisive dimension: `responsiveness_to_critique`

This matters because the earlier governance screen had already shown `openai-nonprofit-control` as one of the two scenarios that held `side_b` across GPT and Claude. The new completed rerun adds a third useful fact:

- the scenario again resolves to `side_b` under GPT
- on regenerated artifacts, not just frozen-artifact replay
- with stronger decisiveness than the earlier low-confidence result

That does **not** prove the scenario is universally `side_b`, but it does move `openai-nonprofit-control` out of the "possibly fragile agreement" bucket and into the stronger "candidate robust finding" bucket.

### Phase 2 smoke result

The harness now completes successfully with the Phase 2 codepath in place. In this run, the uncertainty payload was correctly omitted because none of the trigger conditions held:

- not a `tie`
- not `low` confidence
- not `needs_human_review: true`

So the current validation result is:

- Phase 2 integration works in a live run
- non-triggering verdicts remain lean
- the triggering branch still needs a live low-confidence or review-flagged case to confirm the payload is emitted in practice

## Updated Conclusions

### 1. The broad governance-set claim is still weak

Do not treat the governance set as supporting a substantive "Side B is generally stronger on governance" claim. The 4/6 GPT-Claude disagreement rate still dominates the interpretation of the six-scenario batch.

### 2. `openai-nonprofit-control` is now the strongest governance scenario in the set

Among the governance cases, `openai-nonprofit-control` now has the best claim to robustness:

- it held `side_b` across GPT and Claude in the replay diagnostic
- it now held `side_b` again in a fresh completed live rerun
- the latest GPT result was stronger than before: `0.6` margin, `medium` confidence, no review flag

That does not make it publication-ready on its own, but it is now the clearest candidate for a cross-family substantive example.

### 3. `bayer-breakup-not-now` remains the other serious candidate, but with less new support

`bayer-breakup-not-now` still held `side_b` across GPT and Claude in the earlier governance diagnostic, but it has not yet received the same additional successful rerun support that `openai-nonprofit-control` now has. So the ranking is:

1. `openai-nonprofit-control`
2. `bayer-breakup-not-now`
3. all other governance scenarios remain unstable or judge-shaped

### 4. The "judge family dominates outcome" conclusion remains intact

The new `openai-nonprofit-control` rerun does not weaken the broader project conclusion that judge family materially changes outcomes. It sharpens it:

- some scenarios appear genuinely more stable than others
- but the set-level governance conclusion is still judge-shaped
- therefore the right publication posture is selective, not global

### 5. Phase 2 is shipped enough to move the project forward

The uncertainty-payload implementation is no longer just code-complete; it has passed a real end-to-end run on `main`. The only missing validation is a live uncertain verdict that actually exercises the payload fields.

## Recommended Next Moves

1. Run **Gemini rejudge on `openai-nonprofit-control` first**. This is now the single highest-value calibration step if the goal is one defensible governance example.
2. Run **Gemini rejudge on `bayer-breakup-not-now` second**. That will tell us whether there are one or two governance scenarios with genuine cross-family durability.
3. Find one intentionally uncertain scenario to validate the **Phase 2 triggering branch** in a live run. The goal is not another governance claim; it is confirming the new payload appears under `tie`, low-confidence, or review-triggered conditions.
4. Do not expand the governance publication claim beyond the stable subset until Gemini data is in.

## Decision Frame

The project should now treat the governance work as having produced a **narrower but stronger** conclusion: the six-scenario batch does not support a general `side_b` thesis, but `openai-nonprofit-control` in particular is emerging as a potentially robust cross-family `side_b` case.

## Unknowns & Evidence Gaps

- Gemini has not yet been run on the two held governance scenarios.
- We still do not know whether `openai-nonprofit-control` remains stable under additional GPT reruns or under Gemini.
- The Phase 2 uncertainty payload has not yet been observed in a live triggered verdict.

## Pass/Fail Readiness

Pass:
- Enough evidence exists to stop treating the governance set as one broad finding.
- Enough evidence exists to prioritize `openai-nonprofit-control` as the lead candidate for a robust governance example.
- Enough implementation validation exists to proceed with Phase 2 as shipped on `main`.

Fail:
- It is still too early to publish a generalized governance-set claim.
- It is still too early to treat the new Phase 2 payload as fully validated until a triggered live verdict emits it.

## Recommended Next Artifact

Produce a short **cross-family governance shortlist memo** after Gemini rejudges on `openai-nonprofit-control` and `bayer-breakup-not-now`, with one section on substantive robustness and one section on remaining calibration limits.
