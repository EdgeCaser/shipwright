# Real-World Readiness Update

**Date:** 2026-04-15
**Question:** Is Shipwright now usable on real-world problems with meaningful confidence?

## Bottom line

**Yes, but as a decision aid rather than an automatic decider.**

The system is now credible for real-world use when the goal is:
- structured analysis
- explicit uncertainty surfacing
- cross-model pressure-testing
- better handoff and decision hygiene than raw prompting

It is **not yet trustworthy enough** to treat a single harness winner as a stable truth for governance-grade or otherwise high-stakes calls without inspection or cross-checking.

## What improved materially

### 1. The reliability floor is much better

The most important harness reliability gap from the handoff is now closed:
- GPT/Claude judge-output repair works in the harness path, not just replay
- cross-platform CI now runs on Linux, macOS, and Windows
- a real Windows CI failure was found and fixed
- future generated output paths are shorter, which reduces Windows + OneDrive friction

These are not cosmetic improvements. They move Shipwright from "interesting but brittle" to "usable with operational discipline."

### 2. The uncertainty story is more honest

The Phase 2 uncertainty payload is now part of the practical workflow, not just a schema idea. The system is better at saying:
- this is unresolved
- this needs more evidence
- this should escalate to human review

That matters because a reliable "not yet" is often more valuable than a false clean answer.

### 3. The cross-family calibration story is stronger

Phase 4 Gemini tiebreaks resolved one contested governance scenario and left two genuinely unresolved. That is useful evidence that the system is not merely manufacturing certainty from one judge family's preferences.

## What the new diagnostics showed

### 1. Fresh v2 swap test still shows winner instability

We ran a fresh GPT-judged swap test on `handoff-contradiction`, using a stronger scenario than the earlier low-confidence probe.

Results:
- baseline (`Claude = Side A`, `GPT = Side B`): `side_b`, margin `0.60`, `medium`, no human review
- swapped (`GPT = Side A`, `Claude = Side B`): `side_a`, margin `0.20`, `medium`, `needs_human_review: true`

Artifacts:
- `benchmarks/results/conflict-harness/batch-summary-swap-handoff-gpt-base-2026-04-15.md`
- `benchmarks/results/conflict-harness/batch-summary-swap-handoff-gpt-swapped-2026-04-15.md`

Interpretation:
- this is stronger evidence of position sensitivity than the earlier `openai-nonprofit-control` swap probe
- the result did not merely weaken; it **flipped**
- the system therefore still fails the strongest version of the "single winner is stable under side reversal" test

### 2. The current decisive-dimension distribution is still skewed

Across current v2 run verdicts on disk (`n = 25`):
- `decision_usefulness`: `15` (`60%`)
- `evidence_discipline`: `8` (`32%`)
- `responsiveness_to_critique`: `2` (`8%`)

Interpretation:
- `decision_usefulness` is still the dominant swing dimension
- this does not automatically mean the judgments are wrong
- it does mean the richer schema still appears to privilege one style of winner selection more than an even spread would

## Important bug discovered during this check

The swapped rerun surfaced a real validation bug:
- low-confidence / human-review verdicts can include valid Phase 2 uncertainty fields
- the harness already writes those fields into `run.results`
- but `schemas/conflict-run.schema.json` did not allow them in the `results` block

This is now fixed.

Files changed:
- `schemas/conflict-run.schema.json`
- `tests/run-conflict-harness.test.mjs`

Regression added:
- `runConflictHarness persists Phase 2 uncertainty fields in run results when judge flags human review`

Verification:
- `node --test tests/run-conflict-harness.test.mjs` -> `7/7` passing

## Practical recommendation

Use Shipwright now for real-world work when you want:
- a strong structured first pass
- honest uncertainty
- adversarial comparison
- decision-quality support

Do **not** use it as if:
- one harness winner is final
- position effects are ruled out
- current decisive-dimension bias is fully understood or neutralized

## Final judgment

**Usable now:** yes  
**Stable enough to trust one winner blindly:** no  
**Good enough to help a serious human think better today:** yes

The system has crossed the line into practical utility. It has **not** crossed the line into publication-grade or board-grade single-run authority.
