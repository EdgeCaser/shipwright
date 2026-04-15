# Governance Diagnostic Memo

**Date:** 2026-04-15
**Covers:** Open questions 1, 2, 3 from `harness-handoff-2026-04-15.md`
**Data sources:** 6 Claude rejudges (`claude-rejudge-v2-governance`), 21 v2 main run verdicts (GPT judge), 1 swap test run

---

## Summary

The 6/6 side_b pattern on the governance scenarios is **best explained by judge-family effects** rather than scenario asymmetry, though a mix of judge-family bias, shared schema effects, and artifact sensitivity cannot be fully ruled out. Claude disagrees with GPT on 4/6 scenarios, and the disagreements trace to divergent `evidence_discipline` scoring — not to different decisive dimensions or different rubric weights. On `paramount-skydance-deal`, both judges declare `evidence_discipline` as decisive but score the same dimension in opposite directions.

The v2 decisive_dimension distribution confirms a structural difference between judge families: GPT defaults to `decision_usefulness` as the swing criterion (62% of main runs); Claude defaults to `evidence_discipline` (57% of rejudges). The swap test produced weak evidence of a GPT position-bias toward Side B, but the signal is inconclusive at low confidence.

---

## 1. Is the 6/6 Side B Pattern Judge Bias, Shared Schema Effect, or Scenario Asymmetry?

### Method

Ran `rejudge-conflict-run.mjs` with `--judge-agent claude --label claude-rejudge-v2-governance` over the frozen artifacts from all 6 governance scenario runs. Same artifacts, different judge family.

### Results

| Scenario | GPT winner | Claude winner | Agree? |
|---|---|---|---|
| bayer-breakup-not-now | side_b | side_b | ✓ |
| google-adtech-breakup-remedies | side_b | **side_a** | ✗ |
| intel-foundry-separation | side_b | **side_a** | ✗ |
| nissan-honda-merger-collapse | side_b | **tie** | ✗ |
| openai-nonprofit-control | side_b | side_b | ✓ |
| paramount-skydance-deal | side_b | **side_a** | ✗ |

4/6 disagreements. The 6/6 side_b pattern was not reproduced under Claude. Two scenarios (bayer, openai-nonprofit) held side_b across both families.

### Mechanism: Divergent Evidence_Discipline Scoring

The disagreements are not primarily about decisive dimension choice — they trace to GPT and Claude scoring the same dimension in opposite directions on the same artifacts.

| Scenario | GPT dd | Claude dd | evidence_discipline delta (GPT) | evidence_discipline delta (Claude) |
|---|---|---|---|---|
| bayer-breakup-not-now | decision_usefulness | evidence_discipline | +0.4 (B>A) | +1.0 (B>A) — agree |
| google-adtech-breakup-remedies | responsiveness_to_critique | evidence_discipline | +1.0 (B>A) | **−1.0 (A>B)** — flip |
| intel-foundry-separation | decision_usefulness | evidence_discipline | +0.6 (B>A) | **−1.0 (A>B)** — flip |
| nissan-honda-merger-collapse | decision_usefulness | decision_usefulness | +0.7 (B>A) evidence | Claude A=5, B=4 usefulness → tie |
| openai-nonprofit-control | evidence_discipline | responsiveness_to_critique | +1.0 (B>A) | +1.0 (B>A) — agree |
| paramount-skydance-deal | evidence_discipline | evidence_discipline | +1.0 (B>A) | **−1.0 (A>B)** — flip |

`paramount-skydance-deal` is the clearest probe: both judges declare `evidence_discipline` as decisive, but GPT scores Side B 5/4 on it and Claude scores Side A 4/3. The divergence is not a labeling artifact — it is a disagreement about which side's evidence is more disciplined, on the same artifacts.

### Interpretation

**This strongly updates toward judge-family effects as the primary driver.** The 4/6 disagreement rate is strong evidence against treating the GPT 6/6 side_b pattern as scenario-driven, though the data does not cleanly rule out a mix of judge-family bias, shared schema effects, and artifact sensitivity.

Two scenarios (bayer, openai) may have genuine Side B advantage — they held across both families. These are candidates for promotion to the "substantive finding" category once a third judge (Gemini) or a repeat-run confirms the direction.

The four flip/diverge scenarios should **not** be quoted as substantive findings until at least one more judge family has been run.

---

## 2. V2 Decisive_Dimension Distribution

### All Main Runs (GPT judge, n=21)

| Decisive dimension | Count | % |
|---|---|---|
| decision_usefulness | 13 | 62% |
| evidence_discipline | 6 | 29% |
| responsiveness_to_critique | 2 | 10% |

### Claude Rejudges (n=7, 6 governance + 1 smoke)

| Decisive dimension | Count | % |
|---|---|---|
| evidence_discipline | 4 | 57% |
| decision_usefulness | 2 | 29% |
| responsiveness_to_critique | 1 | 14% |

### Interpretation

The two judge families are making different swing-dimension calls on the same rubric. GPT's primary swing dimension is `decision_usefulness`; Claude's is `evidence_discipline`. This is directly observable in the per-scenario score deltas above. Note the sample is small (n=7 Claude rejudges, 6 of which are from the same governance cluster), so the pattern should be treated as observed in this sample, not as established cross-scenario-type behavior.

**Implication for orchestrator design:** routing decisions that depend on `decisive_dimension` (e.g., "escalate if evidence_discipline is decisive") will behave differently depending on judge family. This should be treated as a known bias in any downstream schema that uses `decisive_dimension` as a routing signal.

`decision_usefulness` dominating GPT output does **not** mean GPT is a "usefulness-biased judge" in a normative sense — it may simply mean GPT weights that criterion more heavily or scores it with more variance. The data supports observing the pattern, not inferring intent.

---

## 3. V2 Swap Test (Position Bias Check)

### Method

One scenario (`openai-nonprofit-control`), two runs with the same judge (GPT):
- **Original** (from v2 batch): Claude=Side A, GPT=Side B, GPT-judge → `side_b` (margin 0.40, low confidence, needs_human_review)
- **Swap**: GPT=Side A, Claude=Side B, GPT-judge → `tie` (margin 0.00, low confidence, needs_human_review)

### Interpretation

Weak evidence for position bias. In the original, GPT's content in Side B position was the declared winner. In the swapped run, GPT's content in Side A position produced a tie. If the judge were strictly content-neutral, we'd expect the same winner (GPT's substantive position) to hold regardless of position label.

**Caveats:**
- This is a single scenario with low confidence in both runs. A result that changes from margin 0.40 to 0.00 while staying within "low confidence / needs_human_review" may be within the noise floor.
- The swap regenerated both sides. Content differences may explain the result shift independent of position bias.
- The 44-run v1 swap matrix had stronger evidence for position neutrality than this single-scenario test can support or refute.

**Recommended follow-up** to strengthen this signal: pick a high-confidence scenario (margin ≥ 0.40, medium confidence) where GPT picked a winner, run the swap, and check whether the winner holds. `openai-nonprofit-control` was suboptimal for this test because it was already ambiguous.

---

## What This Changes for the Publication Claim

**Before this diagnostic:** "GPT judges these 6 governance scenarios and uniformly prefers Side B (0.2-0.4 margin)."

**After this diagnostic:** "GPT and Claude disagree on 4/6 governance scenarios. The agreement rate on this set is 33% (2/6). The disagreements trace to divergent evidence_discipline scoring on the same artifacts, with opposite sign. The 6/6 GPT side_b pattern is best explained by judge-family effects rather than scenario-driven asymmetry."

The two findings that survive the diagnostic:
1. `bayer-breakup-not-now` and `openai-nonprofit-control` hold side_b across both GPT and Claude judge families. These are candidates for substantive claims pending Gemini confirmation.
2. GPT and Claude disagree on winner direction in this governance sample at a rate (4/6) that makes single-judge screening insufficient for any claim about scenario-level asymmetry.

---

## Recommended Next Steps

1. **Ship Phase 2** (uncertainty payload schema). The diagnostic work has cleared the highest publication risk. Phase 2 is still the highest-value product improvement and should not wait.
2. **Gemini rejudge on the 2 held scenarios** (bayer, openai) if the goal is one or two defensible public examples from the governance set. Run after Phase 2 ships.
3. **Swap test on a high-confidence scenario** only if position bias becomes a central claim to defend. `openai-nonprofit-control` was too ambiguous to be useful here; `handoff-contradiction` (margin 0.86, medium confidence) would be a better probe. Lower priority than the above two.
