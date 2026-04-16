# Real-World Scenarios: GPT Screen + Claude Cross-Check

**Date:** 2026-04-16  
**Scenarios:** `paramount-skydance-deal`, `bayer-breakup-not-now`, `intel-foundry-separation`  
**Harness schema version:** 2.2  
**Setup:** Claude as Side A, GPT as Side B; GPT judged first, Claude as cross-check

---

## Summary Table

| Scenario | GPT winner | GPT margin | GPT review | Claude winner | Claude margin | Claude review | Agreement |
|---|---|---|---|---|---|---|---|
| bayer-breakup-not-now | side_a | 0.30 | yes | side_a | 0.20 | no | ✓ |
| intel-foundry-separation | side_a | 0.40 | yes | side_a | 0.60 | no | ✓ |
| paramount-skydance-deal | **side_b** | 0.20 | yes | **side_a** | 0.40 | yes | ✗ |

Decisive dimension across all 6 verdicts: `decision_usefulness` (6/6).

---

## Bayer Breakup: Cross-Family Agreement, Thin Margin

**Verdict:** side_a wins (Claude artifact). GPT 0.30 / Claude 0.20.

Both judges agree on direction. The thin margins reflect the scenario structure: both sides reached the same substantive recommendation (fix first, delay separation), so the verdict turns entirely on execution quality — clarity of readiness criteria, operational specificity, and how thoroughly each side absorbed critique.

**GPT rationale:** Side A provided clearer readiness criteria and a more operational decision frame. Side B was stronger on evidence discipline (stayed tightly in the packet) but remained too high-level for an actual board decision.

**Claude rationale:** Consistent with GPT. Decision usefulness was decisive; Side A's Pass/Fail structure with explicit conditions for revisiting separation outweighed Side B's tighter evidentiary discipline.

**Notable:** GPT flagged Side A for one unsupported quantitative threshold ("2025 EBITDA at or above 2023 baseline") and still awarded it the win on decision usefulness grounds — consistent with the documented Claude actionability lean, but appearing here in GPT's verdict too on same-conclusion scenarios.

**Routing:** No escalation. Both families agree, medium confidence on both sides. Accept side_a verdict.

---

## Intel Foundry Separation: Cross-Family Agreement, Stronger Signal

**Verdict:** side_a wins (Claude artifact). GPT 0.40 / Claude 0.60.

Clearest agreement in the batch. GPT was more tentative (flagged for review, noted missing financing evidence), Claude was more decisive (no review flag). The directional gap is consistent with the documented Claude confidence lean.

**GPT rationale:** Side A's winning advantage was decision usefulness — Pass/Fail table with explicit per-criterion assessments and a concrete next artifact. Several unsupported process thresholds weaken confidence in the full margin, and the record is thin on outside-capital feasibility and integration tradeoff analysis.

**Claude rationale:** Side A wins on four of five rubric dimensions. Decisive advantage is decision usefulness: clear recommendation (proceed with separation), explicit Pass/Fail table, concrete next artifact (capital structure term sheet). The margin is real, not positional — both judges found the same dominant dimension.

**Routing:** No escalation. Cross-family agreement. Accept side_a verdict; the GPT review flag reflects genuine evidence gaps in the case packet (financing feasibility, customer/government stakeholder stance), not harness uncertainty.

---

## Paramount/Skydance: Genuine Cross-Family Divergence

**Verdict:** DIVERGED. GPT → side_b (0.20, medium, review). Claude → side_a (0.40, medium, review).

Both judges flagged for review. `review_flag_family_count = 2` → routes to `HUMAN_REVIEW_REQUIRED`.

**GPT rationale:** Side B wins because its memo is the most calibrated and decision-useful reading of the packet. The 45-day go-shop and unresolved fairness concerns support using that window as a final disciplined market test rather than treating the Skydance deal as effectively final. Side B's governance argument — that the board shouldn't commit while a live alternative process is underway — is the more responsible recommendation given what the packet establishes.

**Claude rationale:** Side A wins on claim quality and responsiveness to critique. The asymmetry argument (Paramount's deteriorating financial position limits the value of waiting) is analytically sharper. The critique integration resharpened the recommendation rather than just narrowing it.

**What both agree on:** The case packet has a critical hole — the go-shop outcome is unknown. Neither judge can confirm whether any binding superior proposal was submitted. This is the load-bearing factual question for the strategic recommendation.

**What they disagree on:** Whether financial urgency (Side A) or process integrity (Side B) is the dominant criterion when the go-shop outcome is unobservable. GPT weighted the unresolved process question more heavily; Claude weighted the financial deterioration argument more heavily.

**This is a quality divergence, not a positional artifact.** GPT called side_b despite Side B being the GPT artifact — the self-serving interpretation is therefore reversed from the default. GPT's rationale is coherent and does not appear motivated by position.

**Routing:** `HUMAN_REVIEW_REQUIRED`. The divergence is substantive, both judges acknowledged the same evidentiary gap, and the strategic question (accept vs. continue market test) cannot be resolved without the go-shop outcome.

---

## Decisive Dimension Distribution

All 6 verdicts across both judge families resolved on `decision_usefulness`. This is consistent with:
- The documented Claude actionability lean (80% in prior 5-scenario replay)
- GPT's own ~60% `decision_usefulness` rate in the broader corpus

On these real-world M&A / strategic scenarios, operational specificity dominates because the scenarios are explicitly board-level decision memos. Both judges converge on the same decisive criterion even when they diverge on the winner.

---

## Corpus Implications

1. **Same-conclusion scenarios** (Bayer, Intel, and several prior runs) consistently produce thin margins and review flags even when both families agree. This is a feature, not a bug — the uncertainty payload is correctly identifying that the verdict turns on calibration rather than strategic substance.

2. **Paramount is the first genuine cross-family divergence in the real-world batch.** It should be treated as a calibration reference for how the harness surfaces substantive disagreement vs. close calls.

3. **No fabricated citations detected** in any of the 6 new verdicts (grounding flags present but all trace to legitimate evidentiary gaps, not phantom ctx-N references). The EVIDENCE CONSTRAINT fix is holding.

4. **Harness schema v2.2 is clean** — all 6 runs stamped correctly, no validation errors.
