# Governance Status Update

**Date:** 2026-04-15  
**Purpose:** Consolidate the current governance-scenario conclusions after the Claude replay diagnostic, the swap test, the latest successful `openai-nonprofit-control` rerun, the Gemini rejudges on the fresh governance artifacts, and the Phase 2 uncertainty-payload implementation.

## Summary

The strongest current conclusion is now narrower still: the earlier 6/6 GPT `side_b` governance pattern should not be treated as a scenario-level finding, and the remaining governance cases that once looked potentially stable do not survive fresh Gemini scrutiny either. The available evidence is best explained by judge-family effects plus unresolved evidence gaps, not by a durable scenario-level `side_b` pattern.

The most important new data points are now the two Gemini rejudges on the fresh governance artifacts:

- `openai-nonprofit-control`: `tie`, `low` confidence, `needs_human_review: true`
- `bayer-breakup-not-now`: `side_a`, margin `0.3`, `medium` confidence, `needs_human_review: true`

Together they remove the last plausible interpretation that the governance subset contains an obvious robust `side_b` example. The clearer conclusion is that this scenario family is highly judge-shaped and often still evidence-seeking even when a judge provisionally selects a side.

Separately, the Phase 2 implementation is now validated in both live execution modes:

- a non-triggering live verdict, where the uncertainty payload was correctly omitted
- a triggering live rejudge verdict, where the full uncertainty payload was correctly emitted

## Evidence Base

This update reflects:

- The governance diagnostic memo: 6 Claude rejudges over the governance set, 21 v2 GPT main-run verdicts, and 1 swap test.
- The latest completed live run: `openai-nonprofit-control` run `conflict-2026-04-15-151006536Z-openai-nonprofit-control`.
- The Gemini rejudge on the fresh artifacts from `openai-nonprofit-control`.
- The Gemini rejudge on `bayer-breakup-not-now`.
- The Phase 2 schema/prompt implementation now on `main`.

### Prior governance diagnostic still holds

The earlier diagnostic remains the right baseline:

- GPT and Claude disagreed on 4/6 governance scenarios.
- The 6/6 GPT `side_b` pattern did not reproduce under Claude.
- The disagreement mechanism was not just winner-label churn; it traced to opposite-sign scoring on the same rubric dimensions, especially `evidence_discipline`.

That still rules out any simple publication claim that "the governance scenarios are just `side_b` cases."

### Additional Gemini follow-up: `bayer-breakup-not-now`

`bayer-breakup-not-now` had looked like the strongest remaining candidate after `openai-nonprofit-control` weakened under Gemini, because it still held `side_b` across GPT and Claude in the earlier governance diagnostic.

Gemini did not confirm that either. On `bayer-breakup-not-now`, Gemini returned:

- winner: `side_a`
- margin: `0.3`
- judge confidence: `medium`
- `needs_human_review`: `true`

This is important for two reasons:

- it removes the last serious candidate for a simple cross-family governance winner claim
- it shows that even where Gemini provisionally picks a side, it still flags unresolved evidence and requests more information rather than treating the case as cleanly settled

### New live rerun and Gemini rejudge: `openai-nonprofit-control`

The latest completed GPT-judge run produced:

- winner: `side_b`
- margin: `0.6`
- judge confidence: `medium`
- `needs_human_review`: `false`
- decisive dimension: `responsiveness_to_critique`

That mattered because the earlier governance screen had already shown `openai-nonprofit-control` as one of the two scenarios that held `side_b` across GPT and Claude. The new completed rerun added a third useful fact:

- the scenario again resolves to `side_b` under GPT
- on regenerated artifacts, not just frozen-artifact replay
- with stronger decisiveness than the earlier low-confidence result

But Gemini on those fresh artifacts produced:

- winner: `tie`
- margin: `0`
- judge confidence: `low`
- `needs_human_review`: `true`

That changes the interpretation materially. The earlier GPT rerun is still useful as stronger within-family support, but the Gemini result means `openai-nonprofit-control` did **not** survive fresh cross-family scrutiny. The right conclusion now is that the scenario remains unresolved and judge-shaped, even though Side B continues to look directionally stronger on some dimensions.

### Phase 2 smoke result

The harness now completes successfully with the Phase 2 codepath in place. In the GPT-judge live run, the uncertainty payload was correctly omitted because none of the trigger conditions held:

- not a `tie`
- not `low` confidence
- not `needs_human_review: true`

In the Gemini rejudge on the same fresh artifacts, the uncertainty payload was correctly emitted because all of the trigger conditions effectively fired:

- `winner: tie`
- `judge_confidence: low`
- `needs_human_review: true`

So the current validation result is:

- Phase 2 integration works in a live run
- non-triggering verdicts remain lean
- the triggering branch has now also been validated in practice

## Updated Conclusions

### 1. The broad governance-set claim is not supported

Do not treat the governance set as supporting a substantive "Side B is generally stronger on governance" claim. The 4/6 GPT-Claude disagreement rate already made that claim weak, and the two Gemini follow-ups now make it untenable.

### 2. `openai-nonprofit-control` is no longer the lead candidate for a robust governance finding

Before the Gemini rejudge, `openai-nonprofit-control` looked like the strongest governance candidate because:

- it held `side_b` across GPT and Claude in the replay diagnostic
- it now held `side_b` again in a fresh completed live rerun
- the latest GPT result was stronger than before: `0.6` margin, `medium` confidence, no review flag

That interpretation does not survive the Gemini rejudge. Gemini tied the same fresh artifacts at low confidence and explicitly requested more evidence. So the right reading now is:

- `openai-nonprofit-control` remains substantively interesting
- Side B may still be directionally stronger in some judge families
- but the scenario is **not** yet a robust cross-family example and should not be cited that way

### 3. `bayer-breakup-not-now` is also no longer a candidate robust governance example

`bayer-breakup-not-now` no longer deserves special treatment as the strongest remaining governance candidate. Gemini selected `side_a` at medium confidence while still flagging `needs_human_review: true`, which means:

- the earlier GPT/Claude agreement on `side_b` was not enough to establish stability
- the case remains useful as a disagreement/calibration example
- but it should not be cited as a robust scenario-level winner

At this point, the whole governance subset should be treated as unstable or judge-shaped until proven otherwise.

### 4. The "judge family dominates outcome" conclusion remains intact

The Gemini rejudges sharpen the broader project conclusion that judge family materially changes outcomes:

- some scenarios appear genuinely more stable than others
- but the set-level governance conclusion is still judge-shaped
- even the best-looking fresh rerun can collapse to tie under another family
- even the strongest remaining cross-family agreement candidate can flip sides under Gemini
- therefore the right publication posture is selective, not global

### 5. Phase 2 is shipped enough to move the project forward

The uncertainty-payload implementation is no longer just code-complete; it has now passed both:

- a real end-to-end non-triggering run on `main`
- a real triggered Gemini rejudge that emitted the full uncertainty payload

So the implementation can now be treated as live-validated.

## Recommended Next Moves

1. Stop looking for a governance scenario that can carry a simple robust-winner claim without further evidence work. The current data does not support that.
2. Treat `openai-nonprofit-control` as the clearest example of **useful disagreement plus actionable uncertainty payload**.
3. Treat `bayer-breakup-not-now` as confirming that even the best-looking remaining governance candidate is still judge-shaped.
4. Shift from trying to rescue a broad governance-set publication claim to documenting the narrower conclusion: governance scenarios in this batch frequently trigger persistent cross-family disagreement and require more evidence before resolution.
5. Use the Gemini uncertainty payloads as the first concrete examples of what the Phase 2 routing signal should look like in practice.

## Decision Frame

The project should now treat the governance work as having produced a **narrower but more defensible** conclusion: the six-scenario batch does not support a general `side_b` thesis, and none of the leading governance cases currently support a robust cross-family winner claim either. What this branch of work does support is the value of cross-family adjudication and the usefulness of the Phase 2 uncertainty payload when judges do not converge cleanly.

## Unknowns & Evidence Gaps

- We do not yet know whether additional Gemini or Claude reruns would keep `openai-nonprofit-control` in tie/low-confidence territory or eventually converge.
- We do not yet know whether `bayer-breakup-not-now` would stay `side_a` under additional Gemini reruns or collapse toward tie/low-confidence as well.
- We have now observed the Phase 2 uncertainty payload in a live triggered verdict, but only on one scenario.

## Pass/Fail Readiness

Pass:
- Enough evidence exists to stop treating the governance set as one broad finding.
- Enough evidence exists to treat `openai-nonprofit-control` as a strong example of unresolved, evidence-seeking adjudication rather than forced resolution.
- Enough evidence exists to treat `bayer-breakup-not-now` as another warning against simple winner claims in this scenario family.
- Enough implementation validation exists to proceed with Phase 2 as shipped on `main`.

Fail:
- It is still too early to publish a generalized governance-set claim.
- It is still too early to treat any governance scenario in this subset as a robust substantive example.

## Recommended Next Artifact

Produce a short **cross-family governance follow-up memo** with two sections:

- why the governance subset no longer supports a robust-winner publication claim
- what `openai-nonprofit-control` and `bayer-breakup-not-now` teach us about using the Phase 2 uncertainty payload and cross-family adjudication as routing signals rather than forcing a winner
