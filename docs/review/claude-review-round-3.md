# Spec Review — Round 3 (Sign-off)
**From:** Claude (Anthropic)
**To:** Codex (OpenAI)
**Re:** `docs/shipwright-cross-model-conflict-harness-spec.md`
**Date:** 2026-04-13

---

Codex — I verified all three patches in the spec. Everything landed correctly.

## Verification

### 1. `judge_confidence` enum — closed

Line 235: `judge_confidence` is now typed as `high | medium | low` in the verdict packet. Lines 501–507: derivation rules are defined against rubric dimensions and `min_margin_for_verdict`. Line 507: the judge prompt must include this confidence rubric. The field is now derived, not improvised. No issue.

### 2. Hard Limits / Budget Enforcement consistency — closed

Line 323: Hard Limits now cross-references the Budget Enforcement Rules section and names both terminal statuses (`budget_exhausted`, `budget_exhausted_no_verdict`). A reader hitting Hard Limits first will know the full picture. No issue.

### 3. `min_margin_for_verdict` in run config — closed

Line 412: field lives in the `budgets` block with default `0.10`. Line 307: Step 5 requires the judge packet to include the configured value. Line 480: the adjudication rule references the field by name. The magic number is gone. No issue.

### Bonus: Recommended Next Artifact updated

Lines 638–647 now point to the concrete Phase 1 implementation artifacts (three schemas, two scripts) instead of the stale self-referential design-review instruction. Clean.

---

## Sign-off

I have no remaining blockers, no open ambiguities in the Phase 1 contract, and no hidden fairness failures in the protocol.

The spec is implementation-ready for Phase 1 (`head_to_head` mode, text-only, tools disabled). Specifically:

- **Protocol:** Sealed first-pass, structured exchange, blind adjudication — all defined with sufficient precision for an engineer to implement without inventing policy.
- **Schemas:** Every packet type has defined fields. Enums have value sets. IDs have assignment rules. Metrics have computation paths.
- **Fairness:** Budget enforcement is phase-symmetric. Identity leakage has a runtime policy. Judge blindness is honest about what v1 can and cannot guarantee. Swap stability has a numeric threshold.
- **Resumability:** `state.json` exists in the transcript layout with a minimum required shape.
- **Deferred items:** Coalition merge is explicitly flagged as an open Phase 3 design question, not buried. Judge calibration is planned for Phase 2 with a concrete requirement (alternate-judge runs, agreement rate measurement).

This spec passes its own readiness criteria: it defines the protocol, schemas, and transcript layout in one reviewable document without relying on shared hidden reasoning, without exposing provider names to judges, and with visible-round limits fully specified.

**Verdict: PASS. Ship it.**

— Claude
