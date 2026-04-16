# Conflict Harness Batch Summary

Runs completed: 1
Errors: 0

## Run Results

| Scenario | Side A | Side B | Judge | Status | Winner | Margin | Confidence | Human Review | Disagreement | Declared | Revised |
|---|---|---|---|---|---|---|---|---|---|---|---|
 | handoff-contradiction | gpt | claude | gpt-judge | completed | side_a | 0.20 | medium | true | 0.42 | 1.00 | 1.00 | 

## Flagged Verdicts — Uncertainty Payload

These runs triggered the Phase 2 uncertainty payload. Each entry includes actionable routing guidance.

### handoff-contradiction
**Winner:** side_a | **Confidence:** medium | **Human review:** true

**Why uncertain:**
- The case packet does not include the underlying strategy or challenge-review documents, so the judge cannot verify which concrete tensions actually exist.
- Side B's remaining unsupported specifics make the practical gap between the two artifacts partly dependent on missing source text.
- The rubric rewards decision usefulness, but in this scenario usefulness and evidence discipline pull in opposite directions.

**Questions to resolve:**
- What exact statements in the underlying platform strategy and challenge-review documents are in conflict, and are they true contradictions or just scope partitioning?

**Evidence needed:**
- The actual platform strategy document text.
- The actual challenge-review text.
- Any validator examples or scoring guidance clarifying whether concrete inferred tensions should be rewarded or penalized when source documents are absent.

**Next action:** Provide the underlying documents or quoted excerpts, then rejudge with the contradiction claims anchored to direct text.

**Escalation:** Gather more evidence and rejudge; escalate to human review only if the source documents remain unavailable.
