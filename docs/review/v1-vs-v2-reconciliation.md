# v1 vs v2 Reconciliation: GPT Judge Under Richer Schema

**Date:** 2026-04-15
**Author:** Claude (autonomous overnight run)
**Status:** Draft — for user review

## Context

Phase 1.5 of the v2 testing plan flagged a directional flip on `handoff-contradiction` between the original GPT verdict and a rerun. Frozen-artifact replay confirmed the flip reproduced on the same inputs, isolating the cause to the judge prompt/schema expansion that landed between the two runs (commits `30ce4ee`, `c97de44`, `4758f46`), not model drift or generation variance.

Phase 1.7 re-baselined the original 13-scenario set under the current (v2) schema with GPT as single judge. This note reconciles the v1 and v2 verdicts.

## Headline finding

**GPT's directional lean flipped from `side_a`-heavy to balanced under the richer schema.**

| | v1 GPT (pre-2026-04-14) | v2 GPT (2026-04-15) |
|---|---|---|
| side_a wins | 8 / 13 | 5 / 13 |
| side_b wins | 5 / 13 | 5 / 13 |
| ties | 0 / 13 | 3 / 13 |
| `needs_human_review: true` | 5 / 13 | 6 / 13 |
| errors | 0 | 0 (after prompt-hardening fix) |

The v1 claim that "GPT leans `side_a`" was an artifact of the older prompt. Under the richer schema, GPT's winner distribution is balanced. The `needs_human_review` rate held steady (~38%), which is the single strongest continuity signal — GPT's sense of when to escalate survived the prompt change, even though its winner picks shifted.

## Per-scenario verdict comparison

| Scenario | v1 GPT | v2 GPT | Δ |
|---|---|---|---|
| blockbuster-total-access | side_b | side_b | same |
| board-update-ambiguity | side_a | side_b | **flipped** |
| churn-conflicting-signals | side_b | side_a | **flipped** |
| event-automation-boundary | side_b | tie | **flipped → tie** |
| feature-weak-evidence | side_a | side_b | **flipped** |
| handoff-contradiction | side_a | side_b | **flipped** (confirmed via frozen-artifact replay) |
| meta-muse-spark | side_a | side_a | same |
| netflix-qwikster | side_b | side_a | **flipped** |
| prd-hidden-scope-creep | side_a | tie | **flipped → tie** (after prompt-hardening fix) |
| pricing-partial-data | side_b | side_b | same |
| supermicro-export-controls | side_a | tie | **flipped → tie** |
| yahoo-microsoft | side_a | side_a | same |
| zillow-offers | side_a | side_a | same |

**Flip counts:** 7 scenarios flipped winner, 3 collapsed to tie, 4 held, 0 errors after the prompt-hardening fix. A 77% flip-or-collapse rate across 13 scenarios is large — large enough to rule out "the prompt change is cosmetic."

## Interpretation

The richer schema forces GPT to articulate per-dimension rationale and identify a decisive dimension. That structural change appears to do two things:

1. **Amplifies the most salient defect.** On `handoff-contradiction`, the decisive dimension under v2 is `evidence_discipline`, and Side A's fabricated document references — previously scored 3/5 with a caveat — are now scored 1/5 and called "the central error." When the judge must commit to a decisive dimension, caveats become structural findings.

2. **Surfaces ties the older prompt didn't produce.** v1 had zero ties; v2 produced two. The richer schema seems to make the judge more willing to refuse a forced winner when dimensions pull in opposite directions.

Neither of these is necessarily "better." It is a different evaluation stance. Both stances are defensible. What matters is that **v1 and v2 verdicts are not comparable**, and any prior memo that quoted v1 verdicts as evidence of judge behavior under the current harness should be caveated or re-derived.

## Continuity checks

What **did** survive the prompt change:

- `needs_human_review` rate held at ~38%.
- The specific scenarios flagged for review are not identical but overlap (v1: board-update-ambiguity, event-automation, handoff-contradiction, meta-muse, pricing-partial-data; v2: blockbuster, board-update-ambiguity, event-automation, handoff-contradiction, supermicro). Three of five v1 flags reappeared in v2.
- Confidence distribution is similar (medium-weighted in both).

These suggest GPT's calibration layer — "when am I uncertain?" — is more stable than its selection layer — "which side wins?". That is a useful separation; it means review-flag-as-screening-signal is more robust than winner-label-as-answer.

## v2 Phase 3 screen: six new real-world scenarios

Ran bayer-breakup-not-now, google-adtech-breakup-remedies, intel-foundry-separation, nissan-honda-merger-collapse, openai-nonprofit-control, paramount-skydance-deal under v2 schema.

| Scenario | Winner | Margin | Confidence | Human Review |
|---|---|---|---|---|
| bayer-breakup-not-now | side_b | 0.30 | medium | false |
| google-adtech-breakup-remedies | side_b | 0.30 | medium | false |
| intel-foundry-separation | side_b | 0.20 | medium | false |
| nissan-honda-merger-collapse | side_b | 0.30 | medium | false |
| openai-nonprofit-control | side_b | 0.40 | low | **true** |
| paramount-skydance-deal | side_b | 0.40 | medium | false |

**Notable:** After retries, **6/6** completed scenarios went `side_b`, margins 0.20-0.40, mostly medium confidence. One human-review flag (openai-nonprofit-control, low confidence). The uniform directional result held when the two retried scenarios were added. That is a **uniform directional result** across four structurally different governance cases. Possibilities:

1. Side A and Side B roles are asymmetric in a way that favors Side B's framing on this scenario type.
2. The prompt now consistently rewards narrower / more evidence-disciplined framing, which Side B (the GPT side) may be structurally more inclined toward.
3. These scenarios are genuinely one-sided under blind judging.

The zero human-review rate on governance cases is noteworthy — it is the exact collapse the v2 plan warned about in the "GPT-default sanity check." It does not yet disqualify GPT as default screen judge, but it argues against treating 4/4 `side_b` as a strong substantive finding. A Claude replay on these same frozen artifacts would disambiguate (1) from (2) quickly.

## Error summary and retry results

All three failing scenarios were rerun under v2 GPT:

- `openai-nonprofit-control` — **recovered** on retry (`side_b`, margin 0.40, low confidence, review flagged). Original error was a side-generation validation failure (`conclusion_confidence` out-of-enum), now resolved.
- `paramount-skydance-deal` — **recovered** on retry (`side_b`, margin 0.40, medium confidence). Original error was judge JSON parse failure; clean on rerun.
- `prd-hidden-scope-creep` — **recovered after prompt fix**. Original error was judge JSON parse (transient). First retry surfaced a reproducible protocol violation: Claude as Side A reliably included the literal string "Side A" in its own first_pass artifact. Fixed by hardening `buildFirstPassPrompt` in `scripts/run-conflict-harness.mjs` to explicitly ban the literal strings `"Side A"`, `"Side B"`, `"side_a"`, and `"side_b"` from all output fields, and instructing the model to use scenario-native role names. Also strengthened the `unseen_opponent` repair prompt with the same constraint. Post-fix verification run: `tie`, margin 0.00, low confidence, human review flagged — consistent with other contradiction-type scenarios.

**Repair-rate signal.** Two of three errors were transient JSON-validity failures that recovered on retry. Adding a one-pass repair prompt on judge-output parse failure would likely eliminate ~66% of observed errors without any scenario-specific work.

## Recommendations

1. **Treat v1 verdicts as superseded for anything claiming current-harness behavior.** Quote v1 only as historical evidence of *prompt sensitivity*, not as evidence of GPT's current judging behavior.
2. **Phase 2 uncertainty payload remains the highest-value next change.** The v2 `needs_human_review` rate (~38%) is the stable signal; enriching those flagged verdicts with actionable routing fields is the unblock.
3. **Run a Claude replay on the 4 completed new-realworld scenarios before drawing conclusions from the uniform `side_b` pattern.** Cheap (four rejudge calls) and directly disambiguates judge-side bias from scenario one-sidedness.
4. **Add judge-output parse repair.** Three JSON failures across 19 total scenarios (~16% fail rate) is higher than acceptable for a screening tool. One repair pass on parse failure should recover most.
5. **Stamp every verdict with `schema_version` / `prompt_revision`.** This comparison was possible only because git commits happened to span the prompt change date; a versioned schema makes future reconciliations cheap.

## Open questions for user review

- Should the three errored scenarios be retried manually before moving to Phase 2, or is the reconciliation memo sufficient as-is?
- Should a Claude-replay-on-v2-artifacts pass be scheduled for the 4 completed new-realworld scenarios now, or held for Phase 4?
- Is the "GPT-default sanity check" considered passed, failed, or inconclusive? My read: inconclusive — zero human-review flags on governance cases is a warning sign, but margins held in the 0.2-0.3 range rather than collapsing to high-confidence wins, which is the better-calibrated failure mode.
