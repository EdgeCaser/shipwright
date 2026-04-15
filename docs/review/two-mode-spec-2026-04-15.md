# Two-Mode Spec: Fast Mode and Rigor Mode

**Date:** 2026-04-15  
**Purpose:** Define Fast Mode and Rigor Mode as distinct product modes with separate execution models, shared infrastructure, and a defined escalation path between them.

## Summary

Shipwright supports two adjudication modes with different execution models, different UX defaults, and different user targets.

- **Fast Mode:** single model, single structured analysis pass, winner-first output. No debate format. For users who need a direction quickly.
- **Rigor Mode:** full debate harness with staged panel escalation, uncertainty-first output when unresolved. For users who need to stress-test a decision.

Fast Mode does not use the debate harness. It is a distinct execution path. The debate format is Rigor Mode's mechanism.

---

## Mode Definitions

### Fast Mode

**User target:** a PM or decision-maker who needs a directional answer quickly and is willing to accept that the output is provisional.

**Execution model:**
- Single model, single structured analysis pass
- No Side A / Side B framing
- No rebuttal rounds
- No judge
- Returns: direction, confidence band, key reasoning, uncertainty payload if triggered

**UX default:** winner-first. Confidence band visible but secondary. Escalation to Rigor Mode available but not foregrounded.

**When to use:**
- exploratory or early-stage questions
- low-stakes directional calls
- time-constrained decisions where provisional is acceptable
- non-governance classes by default

**When not to use:**
- governance or board-level decisions
- publication-sensitive claims
- decisions where single-family output is explicitly unsafe

---

### Rigor Mode

**User target:** a PM or analyst who needs to stress-test a decision, surface cross-family disagreement, or produce a defensible claim.

**Execution model:**
- Full debate harness: two models, first-pass responses, rebuttals, final round, judge
- Staged panel escalation: single → double panel → third-model judge → uncertainty-first
- Structured verdict schema (v2): rubric scores, decisive dimension, dimension rationales, panel agreement, uncertainty payload

**UX default:** 3-state model (provisional / more_rigor_recommended / not_ready) with visible substates. Uncertainty payload as primary output when unresolved.

**When to use:**
- governance, board, or restructuring decisions
- publication-sensitive claims
- decisions where cross-family disagreement is itself a finding
- any case where a Fast Mode result surfaces high uncertainty or a review flag

**Full spec:** `orchestrator-decision-spec-2026-04-15.md`

---

## Mode Selection

Mode selection is the first product decision, before execution starts.

**At task start, Shipwright should present:**

- "Fast: get a direction quickly" — single model, provisional output
- "Rigor: stress-test this decision" — full debate panel, staged escalation

**Default by scenario class:**

| Class | Default mode |
|---|---|
| Governance / board / restructuring | Rigor |
| Publication-sensitive work | Rigor |
| Pricing / packaging | Fast (provisional class) |
| Product strategy / prioritization | Fast (provisional class) |
| Unclassified | Fast |

Users can override the default. The override should be explicit, not hidden.

---

## Shared Infrastructure

Both modes share:

- **Provider availability detection:** same layer, same outputs (`can_run_double_panel`, `can_run_third_family_judge`)
- **Confidence normalization:** same internal routing bands (`high` / `medium` / `low`), same internal routing threshold
- **Uncertainty payload schema:** both modes can emit uncertainty payload fields; Fast Mode surfaces them only when confidence is low or `needs_human_review` is true
- **`needs_human_review` flag:** outranks winner label in both modes

Both modes do not share:

- Execution prompt: Fast Mode uses `buildFastAnalysisPrompt`; Rigor Mode uses the existing harness prompts
- Output schema: Fast Mode uses a lighter schema (see below); Rigor Mode uses the full v2 verdict schema
- Routing engine: Fast Mode has a minimal routing layer; Rigor Mode uses the full orchestrator routing engine

---

## Fast Mode Output Schema

Fast Mode should emit a lighter schema than the full v2 verdict.

Required fields:

```
mode: "fast"
provider: string
direction: "side_a" | "side_b" | "tie" | "no_clear_direction"
confidence_band: "high" | "medium" | "low"
needs_human_review: boolean
summary: string
key_reasoning: string[]
```

Conditional fields (emitted only when `needs_human_review: true` or `confidence_band: low`):

```
uncertainty_payload:
  uncertainty_drivers: string[]
  disambiguation_questions: string[]
  needed_evidence: string[]
  recommended_next_action: string
```

Fast Mode should not emit rubric scores, decisive dimension, dimension rationales, or panel agreement fields. Those belong to Rigor Mode.

---

## Fast Mode Prompt

Fast Mode requires a new prompt: `buildFastAnalysisPrompt`.

This prompt should:

- present a single question or decision for analysis, not a two-sided debate
- ask for a structured direction, confidence assessment, and key reasoning
- request the uncertainty payload fields when confidence is below threshold or ambiguity is high
- not instruct the model to act as a debate participant or to evaluate opposing sides

The harness prompts (`buildFirstPassPrompt`, `buildRebuttalPrompt`, `buildFinalPassPrompt`) are Rigor Mode only.

---

## Fast Mode Routing

Fast Mode has a minimal routing layer, not the full orchestrator routing engine.

Rules:

1. Run the single analysis.
2. If `confidence_band` is `high` and `needs_human_review` is false, set state to `fast_provisional`.
3. If `confidence_band` is `medium` or `low`, or `needs_human_review` is true, set state to `fast_uncertain` and surface uncertainty payload.
4. In either state, offer escalation to Rigor Mode.

Fast Mode UX states:

- `fast_provisional`: direction is clear enough to act on provisionally
- `fast_uncertain`: direction is not clear; uncertainty payload is primary output; Rigor Mode escalation is recommended

Fast Mode does not use the 3-state model (`provisional` / `more_rigor_recommended` / `not_ready`). That model is Rigor Mode's UX layer.

---

## Escalation from Fast to Rigor

A user in Fast Mode can escalate to Rigor Mode on the same question.

**Escalation behavior:**

- The Fast Mode output is available as context but Rigor Mode regenerates from scratch using the harness
- Fast Mode output should not be fed directly into the harness as a first-pass artifact — it was produced by a different prompt and a different execution model
- Rigor Mode should start clean on the same underlying question

**When escalation should be offered:**

- Always available, but foregrounded only when `fast_uncertain` is the current state
- When `needs_human_review` is true, escalation copy should be stronger: "This result needs more scrutiny. Run with full rigor?"
- When `confidence_band` is `high` and no review flag, escalation copy should be quiet: "Want to stress-test this further?"

**What escalation does not mean:**

- It does not mean Fast Mode was wrong
- It does not mean the user wasted a run
- Framing should be: "You have a provisional direction. Rigor Mode will test whether it holds under cross-family scrutiny."

---

## Data Model

Both modes should stamp outputs with `mode: "fast"` or `mode: "rigor"` so future comparisons can filter correctly.

Fast Mode orchestration fields:

- `mode`
- `provider`
- `confidence_band`
- `needs_human_review`
- `ux_state` (`fast_provisional` | `fast_uncertain`)
- `follow_up_action` (when uncertain)

Rigor Mode orchestration fields: see `orchestrator-implementation-plan-2026-04-15.md`.

---

## Telemetry

Track separately by mode:

- mode selected (fast or rigor)
- default vs. user-override selection
- Fast Mode: confidence band distribution
- Fast Mode: rate of `fast_uncertain` outcomes
- Fast Mode: escalation-to-rigor rate
- Rigor Mode: existing telemetry plan unchanged

The escalation-to-rigor rate from Fast Mode is the most important early signal. If it is very high, Fast Mode is producing too much uncertainty to be useful as a standalone path. If it is very low, Fast Mode may be overconfident.

---

## V1 Acceptance Criteria

- Fast Mode runs a single analysis without the debate harness.
- Fast Mode returns a clean directional output when confidence is high.
- Fast Mode surfaces uncertainty payload as primary output when confidence is low or review is flagged.
- Fast Mode always offers escalation to Rigor Mode.
- Rigor Mode is unchanged from the existing orchestrator spec.
- Both modes stamp outputs with `mode` so runs are distinguishable in telemetry and stored results.
- Mode selection is explicit at task start, with a governance-aware default.

---

## Out of Scope for V1

- Two-position Fast Mode variant (presenting Side A vs Side B for single-model comparison without a full debate)
- Automatic mode switching based on verdict outcome without user confirmation
- Shared artifact reuse between Fast and Rigor runs on the same question
- Per-provider Fast Mode quality calibration

---

## Open Questions

- Should `buildFastAnalysisPrompt` ask the model to evaluate a single question, or can it optionally accept two positions for lightweight comparison?
- Should Fast Mode support multiple providers (run fast on GPT, then fast on Claude) as a lightweight double-check, or is that Rigor Mode's job?
- What is the right Fast Mode output format for the user — a structured card, a short paragraph, or something else?
