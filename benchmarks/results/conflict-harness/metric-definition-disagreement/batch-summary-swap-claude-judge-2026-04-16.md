# Conflict Harness Batch Summary

Harness schema version: 2.2
Runs completed: 1
Errors: 0

## Run Results

| Scenario | Side A | Side B | Judge | Status | Winner | Margin | Confidence | Human Review | Disagreement | Declared | Revised |
|---|---|---|---|---|---|---|---|---|---|---|---|
 | metric-definition-disagreement | gpt | claude | claude-judge | completed | side_a | 0.20 | medium | true | 0.17 | 1.00 | 1.00 | 

## Flagged Verdicts — Uncertainty Payload

These runs triggered the Phase 2 uncertainty payload. Each entry includes actionable routing guidance.

### metric-definition-disagreement
**Winner:** side_a | **Confidence:** medium | **Human review:** true

**Why uncertain:**
- The margin of 0.2 is above the 0.1 minimum threshold but not commanding — a reviewer weighting decision usefulness most heavily could reasonably prefer Side B.
- Side B's two-path framework is analytically richer; the evidence discipline penalty is the sole decisive factor and a reviewer who discounts the 'likely' hedges could close the gap.

**Questions to resolve:**
- Should speculative-but-hedged ('likely') characterizations that lack case packet support be penalized equivalently to unhedged unverifiable claims, or at a reduced rate?

**Evidence needed:**
- The actual three active-user definitions (finance, product, growth) would allow evaluation of whether Side B's speculative characterizations were directionally correct, which would affect the evidence discipline scoring.

**Next action:** Proceed with Side A's recommended metric selection memo; the verdict is sufficient to act on without further rejudging.

**Escalation:** No escalation required. Verdict confidence is medium with margin above threshold. Human review is optional but warranted if the decision owner weights decision usefulness over evidence discipline.
