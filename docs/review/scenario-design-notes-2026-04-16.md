# Scenario Design Notes: Claude Decision_Usefulness Lean

**Date:** 2026-04-16  
**Informed by:** `claude-judge-lean-findings-2026-04-16.md`

---

## The Lean

Claude-as-judge weights `decision_usefulness` as the decisive dimension in ~80% of verdicts. It consistently resolves tradeoffs between operational specificity and analytical rigor in favor of whichever artifact is more immediately executable: concrete pass/fail gates, named owners, quantified thresholds, actionable next steps.

This is a coherent judgment framework — not an error. But it has a predictable implication for scenario design.

---

## Scenarios Where This Lean Is Load-Bearing

Claude's lean matters most when **the correct answer is methodologically conservative** — i.e., when the right recommendation is:

- "Stop and gather more evidence before deciding"
- "The right answer requires more analysis; here is a structured program to get there"
- "Pause the launch / delay the separation / do not act until X is resolved"

In these scenarios, a well-designed Side B artifact might correctly recommend restraint, flag uncertainty, and propose a rigorous evidence-gathering phase. Claude will score this lower on `decision_usefulness` because it is less immediately executable than an artifact that names owners, sets deadlines, and produces a five-gate validation program.

The result: **Claude will systematically favor the more aggressive recommendation when the more conservative one is correct.** The margin it assigns may be large, but the direction may be wrong.

---

## Design-Time Flags

When writing or reviewing a scenario, flag it for this risk if any of the following apply:

1. **The scenario has a "right answer" of restraint.** If a reviewer with full context would recommend slowing down, gathering evidence, or not acting — the scenario is in the risk zone.

2. **The case packet contains known evidence gaps.** If the packet deliberately withholds data that would be required for a confident recommendation, Side A artifacts that paper over the gap with operational specificity will be rewarded by Claude.

3. **The scenario involves a close call between two coherent strategies.** When both sides are substantively sound, Claude breaks ties on actionability. If actionability is not the right tiebreaker for the scenario, add a note.

4. **The scenario is intended to test calibration or uncertainty handling.** Scenarios designed to reward "I don't know yet, here's how to find out" will not be scored fairly by Claude alone.

---

## Mitigations

**At design time:**
- Add a note to the scenario file: `"conservative_answer_risk": true` (or equivalent flag in the JSON)
- In the scenario's expected outcome or rubric notes, explicitly name which dimension should dominate — if it's `evidence_discipline` rather than `decision_usefulness`, say so

**At run time:**
- Use GPT as primary judge for scenarios with this flag — GPT is the more conservative screen and is less likely to systematically penalize the restraint recommendation
- Do not use Claude as sole judge for these scenarios
- If Claude does judge, apply the swap test and check whether the conservative artifact still loses when placed in Side A

**At interpretation time:**
- When reviewing a Claude verdict where the winner is clearly more operationally specific and the loser is more analytically cautious, apply extra scrutiny before accepting the winner as correct
- Check the `decisive_dimension` field — if `decision_usefulness` is decisive and the scenario has a conservative-answer risk flag, treat the verdict as provisional

---

## Examples From the Corpus

**`metric-definition-disagreement`:** GPT called a near-tie (0.02 margin, low confidence). Claude called side_a at 0.70. The scenario has a legitimate conservative reading: Side B was "more disciplined and better calibrated about uncertainty." Claude discounted the calibration advantage entirely in favor of Side A's decision-ready metric selection memo.

**`adjacent-market-proxy`:** GPT called a tie. Claude called side_a at 1.00 margin, high confidence. GPT's rationale: "Side B is stronger analytically because it preserves the legitimate bounded-prior value of enterprise data." Claude treated the operational specificity of Side A as decisive.

**`pilot-survivorship-bias`:** GPT called a near-tie (0.05 margin). Claude called side_a at 0.24 margin, high confidence. GPT: "effectively a dead heat." The conservative side here was slightly stronger on claim precision; Claude resolved in favor of actionability.
