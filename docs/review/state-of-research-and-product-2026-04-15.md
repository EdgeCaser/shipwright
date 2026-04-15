# State of Research and Product

**Date:** 2026-04-15  
**Purpose:** Honest assessment of where the research is and what has been built, as a basis for deciding whether this is ready for public use.

---

## Research State

### What the conflict harness is

Shipwright's conflict harness pits two AI models against each other on the same question — each produces a structured argument, they critique each other, then a third model judges which argument was stronger. The purpose was to test whether multi-model adjudication could produce more reliable PM recommendations than single-model outputs.

### What we learned

**Finding 1: Judge family dominates outcome.**

The most durable finding across all phases of work is that picking the judge changes the answer more than anything else. GPT and Claude agreed on winner direction in only 2 of 6 governance scenarios when applied to the same frozen artifacts. The disagreements traced to opposite-sign scoring on the same rubric dimensions — not labeling artifacts or prompt differences. A single-judge output cannot be quoted as a reliable finding.

**Finding 2: The 6/6 governance side_b pattern was judge-shaped, not scenario-shaped.**

Early results showed GPT uniformly preferring Side B across all six governance scenarios, which looked like a substantive finding. Claude rejudge reversed 4 of 6. The pattern was driven by GPT's tendency to weight `decision_usefulness` as the decisive dimension while Claude defaults to `evidence_discipline` — different de facto standards applied to identical artifacts.

**Finding 3: Two scenarios showed cross-family durability — briefly.**

`bayer-breakup-not-now` and `openai-nonprofit-control` held the same direction across GPT and Claude rejudges. The governance status update elevated `openai-nonprofit-control` as the strongest candidate for a defensible public example. Gemini then reversed it. Fast Mode independently showed Claude's confidence on it is run-dependent (high in one run, medium in the next). `bayer-breakup-not-now` has been more stable: Claude returned high confidence in both Fast Mode runs, and the directional recommendation (delay the breakup) is consistent across both families.

**Finding 4: The uncertainty payload is more useful than the winner label on hard cases.**

Phase 2 added structured uncertainty output (`uncertainty_drivers`, `disambiguation_questions`, `needed_evidence`, `recommended_next_action`) triggered when a verdict is low-confidence or flagged for review. In practice, this is the most actionable output from the system on contested scenarios — it surfaces what's missing rather than forcing a winner. Fast Mode data confirmed this: the two `fast_uncertain` scenarios (prd-hidden-scope-creep, pricing-partial-data) produced sharper next-action guidance than a forced direction would have.

**Finding 5: GPT has a confidence floor in Fast Mode.**

GPT returned medium confidence on all four scenarios in both Fast Mode runs. It is not discriminating — it is hedging uniformly. This means GPT Fast Mode outputs are useful for direction and next-action text but not for ux_state routing decisions. The confidence signal from GPT in Fast Mode is not load-bearing.

**What remains uncertain**

- Whether `bayer-breakup-not-now` holds under Gemini (not yet run)
- Whether any non-governance scenario class has stable cross-family behavior (not calibrated)
- Whether the `fast_provisional` / `fast_uncertain` split is reliable enough for users to act on without a second agent confirming
- Whether GPT's confidence floor is a prompt artifact or a model-level calibration issue

---

## Product State

### What has been built

**Rigor Mode (conflict harness):**
- Full debate harness: first-pass → rebuttal → final → judge
- v2 verdict schema with `dimension_rationales`, `decisive_dimension`, `judge_confidence`, `needs_human_review`
- Phase 2 uncertainty payload (triggered when verdict is low-confidence or review-flagged)
- Frozen-artifact replay via `rejudge-conflict-run.mjs` — the core diagnostic capability
- Batch runner with multi-judge support
- Prompt hardening for Side A/B identity leaks

**Fast Mode:**
- Single-pass analysis: `run-fast-analysis.mjs`
- Lighter output schema: recommendation, confidence_band, summary, key_reasoning, uncertainty_payload
- Two UX states: `fast_provisional` / `fast_uncertain`
- Batch runner with multi-agent support and agreement analysis: `run-fast-batch.mjs`
- Windows path handling fixed and validated

**Orchestrator:**
- Pure routing logic module: `orchestrate.mjs`
- Scenario class config (governance policy-backed; all others provisional)
- Provider availability assessment
- Confidence normalization
- Full routing decision tree: pre_run → post_single → post_double → post_judge
- All edge cases handled: user_declined_escalation, directionally_incoherent, limited_provider_availability
- Tested against 8 representative state transitions

**Schemas:**
- `conflict-verdict.schema.json` — Rigor Mode verdict (v2)
- `fast-analysis.schema.json` — Fast Mode output

**Planning artifacts:**
- Two-mode spec (Fast vs Rigor as distinct execution paths)
- Orchestrator decision spec, implementation plan, build checklist
- Governance diagnostic memo
- v1-vs-v2 reconciliation memo

### What is not yet built

- **No standalone two-provider double-panel path.** The shipped executable path today is Fast Mode first, then the full three-provider harness when a third-family judge is available. With only two providers, Shipwright degrades to provisional or not-ready states instead of simulating a pseudo-judge.
- **No GUI mode-selection layer.** There is now a unified CLI entry point, but not yet a higher-level UI for non-terminal users.
- **No polished presentation layer beyond CLI output.** The terminal states are surfaced, but the experience is still command-line first.
- **No calibrated non-governance class policy.** Governance is policy-backed; other classes are still provisional.
- **Telemetry exists but is early.** It logs threshold and escalation events, but the data volume is still too small for tuning.

### V1 acceptance criteria — current status

| Criterion | Status |
|---|---|
| Governance defaults to a safer path than single analysis | Met in routing and entrypoint behavior |
| Single analysis below threshold recommends stronger adjudication | Met |
| Double-panel disagreement recommends judge escalation | Partially met in routing logic; no standalone two-provider panel execution path |
| Extra panel stages never auto-run without confirmation | Met in interactive mode; non-TTY now requires `--yes` |
| Graceful degradation for limited provider availability | Met |
| Review-flagged / low-confidence outcomes route to uncertainty-first | Met |
| Directionally incoherent outcomes route to not_ready | Met in routing logic |
| User-declined escalation preserved as visible substate | Met |
| Telemetry emitted for threshold and escalation analysis | Met |

**Summary:** Most core acceptance criteria are now met end-to-end in the CLI product. The main remaining gap is a cleaner two-provider story and more polish around presentation.

---

## Is This Ready for Public Use?

### What "public use" would mean

The most honest definition: a PM at another company runs this on a real decision, gets an output, and acts on it with some confidence that the system is doing what it claims.

### What would have to be true

**Minimum for Fast Mode to be publicly usable:**

1. A user can run it on a scenario they care about without knowing the internals
2. The output is honest about its own confidence limits
3. `fast_uncertain` results surface something more useful than "we don't know"
4. The system does not present fragile outputs as final answers

**On criteria 1:** Largely met for CLI users. There is now a unified entry point via `node scripts/shipwright.mjs --question ...`, and the system routes based on class and provider availability. It is still not a non-terminal UX.

**On criteria 2 and 3:** Largely met. The `fast_uncertain` outputs from this batch had sharp, specific next-action guidance. The uncertainty payload worked as designed on prd-hidden-scope-creep and pricing-partial-data. The system is not overclaiming.

**On criteria 4:** Partially met. `fast_provisional` results are presented as provisional. But there is a known failure mode: Claude's confidence on openai-nonprofit-control is run-dependent — it returned high in one run and medium in the next. A user who happens to get the high-confidence run has no way to know the result is fragile.

**Minimum for Rigor Mode to be publicly usable:**

1. A user understands what mode they're in and why
2. The staged escalation flow is visible and gated on confirmation
3. The output clearly distinguishes "panel converged" from "one judge said so"
4. Uncertainty-first output is the default when the result is unresolved

These are now partially met. The orchestration layer is surfaced in CLI output, escalation gates require confirmation, and terminal states are visible. The remaining limitation is that the full three-family harness requires three providers; with only two providers, Shipwright routes to provisional or not-ready outcomes instead of executing a fake judge path.

### The honest summary

**The research is solid enough to publish findings, with appropriate caveats.** The judge-family effect is well-documented. The uncertainty payload adds real value. The Fast Mode data from this session is promising. The finding that `bayer-breakup-not-now` is the most stable governance scenario is defensible.

**The product is close to public CLI use, but not polished consumer use.** The core logic, entrypoint, routing, confirmation gates, telemetry, and uncertainty payload are built and connected. The main remaining product risks are presentation polish and the fact that the strongest adjudication path currently requires three providers.

**The gap between "works" and "feels finished" is now presentation and calibration, not core execution.** A PM who is comfortable in a terminal can follow the flow today. A broader audience would still benefit from a thinner, friendlier presentation layer and more calibrated non-governance defaults.

---

## What Would Change This Assessment

The product becomes more broadly usable when:

1. The CLI output is polished into a thinner presentation layer for non-technical users
2. The two-provider path is clarified further, either by implementing a true standalone double-panel mode or by tightening the current messaging
3. Non-governance class defaults are calibrated enough to feel less provisional
4. The output format is friendlier than raw run directories and JSON files

That is now less about core wiring and more about product polish.
