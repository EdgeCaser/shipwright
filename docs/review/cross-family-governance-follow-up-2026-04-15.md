# Cross-Family Governance Follow-Up

**Date:** 2026-04-15  
**Purpose:** Summarize what the governance subset now supports after GPT, Claude, and Gemini comparisons, and clarify how the Phase 2 uncertainty payload should be used when judges do not converge.

## Summary

The governance subset no longer supports a robust-winner publication claim. What it supports instead is a stronger methodological conclusion: governance scenarios in this batch are highly sensitive to judge family, and some of the most useful outputs are now the uncertainty payloads that explain why a clean winner should not yet be forced.

This is a meaningful result, not a failed one. The project set out to measure conflict resolution quality under blinded judging. On the governance subset, the most decision-useful finding is that cross-family adjudication surfaces unresolved evidence needs and governance-design ambiguities that a single-judge winner label would hide.

## 1. Why The Governance Subset No Longer Supports A Robust-Winner Claim

### The original pattern did not survive cross-family pressure

The initial GPT screen suggested a strong directional pattern: six governance scenarios all resolving to `side_b`. That pattern now does not hold up under broader scrutiny.

What the follow-up work established:

- Claude disagreed with GPT on 4/6 governance scenarios.
- `openai-nonprofit-control`, which initially looked like the strongest remaining candidate, tied under Gemini on the fresh artifacts at low confidence with `needs_human_review: true`.
- `bayer-breakup-not-now`, which then became the strongest remaining candidate, flipped to `side_a` under Gemini while still flagging `needs_human_review: true`.

That sequence matters. It means the governance subset is not just noisy in the abstract; it is specifically vulnerable to judge-family differences in how evidence quality, decision usefulness, and critique responsiveness are weighted.

### Cross-family disagreement is itself the finding

At this point, the best-supported project-level statement is not:

> "Governance scenarios favor Side B."

It is:

> "Governance scenarios in this batch do not support a stable single-judge winner claim; they frequently remain judge-shaped and evidence-sensitive even after critique and revision."

That is a narrower claim, but it is better supported and more valuable for downstream use. It means the harness is not merely producing random variance. It is exposing a real limit on what can be responsibly concluded from one judge family on this scenario type.

### Scenario-specific takeaways

`openai-nonprofit-control`

- GPT live rerun: `side_b`, margin `0.6`, `medium` confidence, no review flag
- Claude replay on earlier artifacts: `side_b`
- Gemini rejudge on the fresh artifacts: `tie`, `low` confidence, `needs_human_review: true`

Interpretation:
- Side B may still be directionally attractive to some judge families.
- But the case is not robust enough to publish as a substantive winner claim.
- Its main value is now as an example of useful disagreement plus actionable uncertainty.

`bayer-breakup-not-now`

- Earlier GPT/Claude evidence suggested it might be the cleanest surviving governance case.
- Gemini rejudge returned `side_a`, margin `0.3`, `medium` confidence, `needs_human_review: true`.

Interpretation:
- This scenario also fails as a robust winner claim.
- The flip matters more than the nominal winner because it removes the last plausible "stable governance example" in the subset.

### Publication implication

The governance subset should not currently be used to support:

- a generalized `side_b` governance thesis
- a claim that one side is substantively better across the governance family
- a claim that any one governance scenario in this subset is robustly settled across judge families

The strongest publishable conclusion from this subset is methodological:

- single-judge governance conclusions are unsafe here
- cross-family adjudication changes outcomes materially
- uncertainty routing is not an implementation detail; it is part of the product

## 2. What The Governance Subset Teaches Us About Routing Signals

### The Phase 2 uncertainty payload is now justified by real behavior

Phase 2 was designed around a simple product intuition: when the harness is uncertain, the useful output is not just "tie" or "review needed," but a structured explanation of what would resolve the uncertainty.

The governance subset now shows that this was the right product move.

We have now seen both validation modes in practice:

- a non-triggering verdict, where the payload was correctly omitted
- a triggered Gemini verdict, where the payload was correctly emitted with concrete next-step guidance

That means the uncertainty payload is no longer hypothetical schema work. It is part of the harness's observed behavior on live runs.

### `openai-nonprofit-control` is the clearest routing example

The Gemini verdict on `openai-nonprofit-control` is especially useful because it did not just refuse to converge. It specified why:

- investor and partner acceptance of the revised governance structure remains unresolved
- the operational details of the proposed governance redesign are not concrete enough
- the enforceability of the nonprofit control layer is still uncertain

It also specified what to do next:

- define reserved powers and delegation rules
- gather partner and investor evidence
- produce a governance operating model / redesign artifact

That is exactly the type of output the orchestrator should be able to use. Instead of forcing a winner, it can route toward:

- more evidence collection
- a governance-design memo
- a legal / financing follow-up

### `bayer-breakup-not-now` reinforces the same lesson

The Gemini verdict on `bayer-breakup-not-now` did choose a side, but still flagged `needs_human_review: true` and asked for more evidence on the conditions under which targeted portfolio moves would become necessary.

That is important because it shows the uncertainty payload is not only for ties. It is also useful when:

- a side provisionally wins
- but the recommendation still has unresolved trigger conditions
- and the board would be poorly served by treating the winner label as sufficient

In other words, the payload is not merely a fallback. It is a way of converting partial adjudication into operational next steps.

### Product implication

The routing signal should not be thought of as:

- `winner` first, everything else second

For this class of scenarios, the better hierarchy is:

1. `needs_human_review`
2. `judge_confidence`
3. uncertainty payload contents
4. winner label

That does not mean the winner is useless. It means that when governance cases remain evidence-sensitive, the payload often carries more decision value than the winner itself.

## Decision Frame

The governance subset should now be treated as evidence that the harness needs cross-family adjudication and structured uncertainty routing on governance-style scenarios. It should not be treated as evidence that one side reliably wins those scenarios.

## Unknowns & Evidence Gaps

- We still do not know whether additional reruns would cause some governance scenarios to converge more cleanly across families.
- We do not yet know whether the governance subset is unusually judge-shaped relative to other high-stakes scenario families, or whether this is a broader pattern.
- We have only a small number of triggered uncertainty-payload examples so far.

## Pass/Fail Readiness

Pass:
- Enough evidence exists to stop trying to publish a robust-winner governance claim from this subset.
- Enough evidence exists to justify cross-family adjudication as a core calibration tool.
- Enough evidence exists to treat the Phase 2 uncertainty payload as productively live.

Fail:
- It is still too early to collapse the governance subset into a clean substantive conclusion.
- It is still too early to assume the same routing pattern will hold across all scenario families without additional testing.

## Recommended Next Artifact

Produce a short **uncertainty-routing examples memo** that extracts 2-3 concrete verdict payloads and shows how an orchestrator should act on them, with `openai-nonprofit-control` as the lead example.
