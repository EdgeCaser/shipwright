# Claude Judge Lean: Systematic Side A / Actionability Bias

**Date:** 2026-04-16  
**Source:** Claude replay on 5 GPT-flagged `needs_human_review` scenarios  
**Question:** Why does Claude clear every GPT review flag, and what does that tell us about judge-family divergence?

---

## Bottom Line

Claude-as-judge has two measurable systematic leans relative to GPT-as-judge:

1. **Side A lean.** Claude called `side_a` on all 5 scenarios, including 3 where GPT called a tie and 2 where GPT called `side_a` at minimal margin with a review flag.

2. **Actionability lean.** The mechanism is not random. Claude's decisive dimension was `decision_usefulness` in 4 of 5 verdicts. It consistently broke GPT ties in favor of whichever artifact was more operationally specific — concrete pass/fail gates, named owners, quantified thresholds, immediately executable next steps — over artifacts that were more analytically rigorous or better calibrated about uncertainty.

Neither lean is a bias in the pejorative sense. Claude is applying a coherent judgment framework. The problem is that this framework differs from GPT's in a systematic, predictable way that matters for how verdicts should be read.

---

## Full Comparison Table

| Scenario | GPT winner | GPT margin | GPT confidence | GPT review | Claude winner | Claude margin | Claude confidence | Claude review | Claude decisive dim |
|---|---|---|---|---|---|---|---|---|---|
| adjacent-market-proxy | tie | 0.00 | low | yes | side_a | 1.00 | high | no | decision_usefulness |
| ai-moderation-human-review | side_a | 0.20 | medium | yes | side_a | 0.80 | high | no | responsiveness_to_critique |
| metric-definition-disagreement | tie | 0.02 | low | yes | side_a | 0.70 | medium | no | decision_usefulness |
| pilot-survivorship-bias | tie | 0.05 | low | yes | side_a | 0.24 | high | no | decision_usefulness |
| underpowered-ab-test | side_a | 0.10 | medium | yes | side_a | 0.70 | high | no | decision_usefulness |

Summary:
- Claude called `side_a` 5/5 (100%)
- Claude cleared the review flag 5/5 (100%)
- Claude confidence: 4 high, 1 medium (vs GPT: 0 high, 2 medium, 3 low)
- Claude decisive dimension: `decision_usefulness` 4/5, `responsiveness_to_critique` 1/5

---

## The Mechanism

GPT's rationales for its three ties reveal the tradeoff it was weighing:

- **`adjacent-market-proxy`:** "Side A is stronger as an operating document... Side B is stronger analytically because it preserves the legitimate bounded-prior value of enterprise data."
- **`metric-definition-disagreement`:** "Side A produced the more decision-ready artifact... but it also overreached more. Side B was more disciplined and better calibrated about uncertainty."
- **`pilot-survivorship-bias`:** "Effectively a dead heat. Side A was slightly stronger on evidence discipline... Side B was slightly stronger on [claim precision]."

In each case GPT was weighing **operational specificity** (Side A's strength) against **analytical rigor / calibration discipline** (Side B's strength) and calling it even.

Claude resolved the same tradeoffs decisively in favor of operational specificity. Its rationales reveal a consistent priority: pass/fail tables with owners, quantified thresholds, executable next steps, and concrete deadlines outweigh analytical nuance and calibration precision when the final artifact is meant to support a decision.

This is not arbitrary. Claude is applying the rubric's `decision_usefulness` dimension at a higher weight than GPT does — not by miscounting, but by treating "a team can act on this today without further interpretation" as the dominant criterion.

---

## What This Does and Does Not Mean

**Does mean:**

- Claude-judged verdicts will systematically favor operationally specific artifacts over analytically rigorous ones when those qualities trade off.
- Claude's `needs_human_review` threshold is substantially higher than GPT's. A single Claude high-confidence verdict should not be read as "this is unambiguously correct" — it may mean "Claude found a clear winner on actionability grounds."
- The `HUMAN_REVIEW_REQUIRED` routing path (cross-family confirmed) is the right call. A GPT review flag alone was not sufficient — Claude cleared all five at high or medium confidence. The cross-family confirmation policy landed correctly.
- Scenarios where the "correct" answer is analytically sound but less operationally specific (e.g., the right call is "stop and gather more evidence" rather than "here is a five-gate validation program") may systematically produce Claude side_a wins that are less reliable than the margin suggests.

**Does not mean:**

- Claude is wrong. In these 5 cases, the Claude rationales are well-reasoned and the side_a artifacts are genuinely more actionable. Actionability is a legitimate criterion.
- GPT is right. GPT's ties may reflect over-weighting of analytical balance at the expense of decision utility.
- Either judge is miscalibrated in an objectively measurable sense. Both frameworks are coherent. The divergence is about which rubric dimension carries most weight when dimensions conflict.
- Side B is weaker across the corpus. The lean is specific to scenarios where analytical rigor and operational specificity trade off. On scenarios with a straightforwardly stronger side, the families likely converge.

---

## Decisive Dimension Distribution: Claude vs Corpus

| Dimension | Claude (5 replays) | Corpus prior (25 GPT runs) | Taxonomy screen (17 GPT runs) |
|---|---|---|---|
| `decision_usefulness` | 80% | 60% | 59% |
| `evidence_discipline` | 0% | 32% | 35% |
| `responsiveness_to_critique` | 20% | 8% | 6% |

Claude's `decision_usefulness` rate (80%) is substantially higher than GPT's (~60%). This is directional evidence that the lean is real and measurable, not noise from a 5-scenario sample.

---

## Implications for Harness Operation

**Scenario design.** Scenarios where the "correct" answer requires accepting more uncertainty in exchange for methodological soundness (e.g., "the right call is a longer evidence-gathering phase, not a launch program") may systematically produce less reliable Claude verdicts. Flag these at design time.

**Judge selection.** For scenarios where the primary risk is analytical overreach or premature certainty, GPT may be the more conservative screen. For scenarios where decision paralysis is the primary risk, Claude may be more useful.

**Review flag policy.** The cross-family confirmation threshold (count ≥ 2) is now wired into the orchestrator. These 5 scenarios confirm it was the right call. None of these warranted human escalation on one judge's opinion.

**Reading margins.** A Claude margin ≥ 0.7 should be read as "Claude found this clearly more actionable" — not necessarily "this is the objectively stronger artifact." Reviewers should check whether the winning artifact's advantage is operational specificity or analytical quality before treating the margin as definitive.

**Side A position.** ~~Cannot be determined without a swap test.~~ **Resolved — see swap test results below.**

---

## Swap Test Results (2026-04-16)

Scenario: `metric-definition-disagreement`. Swapped sides: GPT as Side A, Claude as Side B. Claude as judge.

| Run | Side A | Side B | Claude verdict | Margin | Confidence | Review |
|---|---|---|---|---|---|---|
| Original replay | Claude | GPT | side_a (Claude) | 0.70 | medium | no |
| Swap | GPT | Claude | side_a (GPT) | 0.20 | medium | yes |

**Conclusion: the lean is positional.** Claude-as-judge called side_a in both runs regardless of which provider occupied the slot. 6/6 side_a wins across all Claude-judged runs in this dataset.

The margin collapse (0.70 → 0.20) and the review flag appearing in the swap provide a secondary signal: Claude's artifacts score higher in absolute terms, and Claude-as-judge is less confident when GPT holds the Side A position. But the positional effect dominates — GPT still won when placed in the Side A slot.

**Operational implication:** Claude-as-judge results cannot be trusted as a standalone verdict in any harness run where position hasn't been controlled. Claude replays on frozen artifacts (where Side A = Claude by default) will systematically favor the Claude artifact regardless of quality. Any Claude replay in this project's default setup has a ~100% prior toward side_a.

**Required mitigation:** Claude should not be used as a sole judge without a paired swap. Claude verdicts are most useful as a second opinion within a cross-family panel — not as a screen or standalone adjudicator.

---

## Recommended Next Steps

1. ~~Swap test on `metric-definition-disagreement`.~~ **Done — positional lean confirmed.**

2. **Add `judge_family` to decisive dimension tracking.** The corpus-level decisive dimension distribution is currently aggregated across all judge families. Separating by family would let us track this lean quantitatively as the corpus grows.

3. **Note in scenario design guidelines.** When designing scenarios where the correct answer is methodologically conservative (suspend judgment, gather evidence), flag that Claude may systematically downgrade the conservative side on `decision_usefulness`.

4. **Update harness operating guidance.** Add explicit note that Claude-judged runs require a paired swap or cross-family panel to be trustworthy. Single-family Claude verdicts should be flagged in batch summaries.
