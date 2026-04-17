# State of Shipwright: Capabilities, Reliability, and the Usability Gap

**Date:** 2026-04-17  
**Author:** Session synthesis  
**Purpose:** Comprehensive current-state assessment for anyone picking up this project

---

## What Shipwright Is

Shipwright is a cross-model conflict harness. Given a strategic scenario — a PRD decision, a corporate restructuring, an M&A choice, a product tradeoff — it runs two AI models against each other in a structured debate:

1. **First pass:** Each model produces an independent artifact recommending a position
2. **Rebuttal:** Each model attacks the other's visible claims
3. **Final:** Each model revises its artifact in response to critique
4. **Judgment:** A third model scores both final artifacts on a rubric and declares a winner

The output is not just a winner label. It is a scored comparison across five rubric dimensions (claim quality, evidence discipline, responsiveness to critique, internal consistency, decision usefulness), a grounding audit for fabricated citations, and — when the verdict is uncertain — a full uncertainty payload naming the evidentiary gaps that would resolve the question.

The intended use case: a PM or strategist who has two competing positions on a hard question can run those positions through the harness to get a structured, scored, multi-model assessment of which position holds up better under adversarial scrutiny.

---

## Current Capabilities

### What works

**End-to-end runs are clean.** The harness runs 32 scenarios without errors under schema v2.2. All phases execute, all outputs are validated, all runs are persisted with full artifacts and metadata.

**Schema versioning.** Every run is stamped with `harness_schema_version: 2.2`. Cross-run comparisons are trustworthy within the same schema version. The corpus can grow without losing interpretability.

**Fabricated citation detection.** Models were inventing `ctx-N` citations that didn't exist in the case packet. This is now caught at run time via an EVIDENCE CONSTRAINT in every first-pass and final prompt, a grounding audit in the judge prompt, and a phantom citation check post-parse. Zero fabricated citations detected in the last 40+ runs.

**Phase 2 uncertainty payload.** When a verdict is uncertain — low confidence, tie, or `needs_human_review: true` — the harness requires a full uncertainty payload: what is uncertain and why, what questions would resolve it, what evidence is needed, what the next artifact should be, and whether to escalate. This payload is first-class output, often more decision-useful than the winner label itself.

**Cross-family confirmation policy.** A single judge family's review flag routes to a second judge family, not to a human. `HUMAN_REVIEW_REQUIRED` requires `review_flag_family_count >= 2`. This is wired into the orchestrator. A single family's opinion is never sufficient for human escalation.

**Positional lean warning.** The batch runner emits a warning to stderr whenever a judge's provider family matches Side A's provider family. The warning names the affected judges and recommends a cross-check. This fires by default on every standard run.

**Repair loops.** When models return malformed output, the harness has repair paths for: JSON parse errors, missing required fields, empty claims arrays, missing Phase 2 uncertainty fields, identity leaks, and unseen opponent references. The repair mechanism targets the specific failure rather than requesting a full rewrite.

**Judge-family dimension breakdown.** Batch summaries now include a "Decisive Dimension by Judge Family" table, segmenting `decision_usefulness`, `evidence_discipline`, etc. by provider. Family-level scoring differences are visible at a glance.

**36-scenario corpus.** The corpus spans PM scenarios (PRD decisions, prioritization, roadmap conflicts), analytical scenarios (evidence synthesis, causal inference, metric definition), and real-world case studies (M&A, corporate restructuring, regulatory decisions). All 32 pre-existing scenarios have been rebaselined under v2.2.

---

## What We Know About Judge Behavior

### Both families are positionally biased

The most important empirical finding from operating the harness:

**Claude-as-judge calls side_a (its own artifact) ~100% of the time.** Confirmed by a swap test: Claude called side_a in both the original run (Claude in Side A) and the swapped run (GPT in Side A). Six of six Claude-judged runs produced side_a wins.

**GPT-as-judge calls side_b (its own artifact) at roughly 3x the rate it calls side_a.** In 27 completed rebaseline runs, GPT called side_b in 14 cases, side_a in 5, and tie in 8. This is a symmetric bias to Claude's, pointing in the opposite direction.

The standard run configuration — Claude as Side A, GPT as Side B, both as judges — means both judges are biased toward different sides. Cross-family agreement does not cancel the bias; it means both judges happened to point at the same side despite their respective leans.

### What this means for reading verdicts

The trust hierarchy, from most to least reliable:

1. **A judge going against its own lean** (Claude calling side_b, or GPT calling side_a) — the judge is overriding its positional bias to call the other side better. High signal.
2. **Cross-family agreement where at least one judge is going against its lean** — genuine quality signal.
3. **Cross-family disagreement with both families favoring their own artifact** — the "null" case. Both are expressing their lean. Tells you nothing about quality.
4. **Single-family verdict where the judge favors its own artifact** — positional lean. Low signal without a swap test.

The 5 scenarios in the rebaseline where GPT called side_a (overriding its lean) are the most trustworthy verdicts in the corpus: `board-update-ambiguity`, `launch-date-stakeholder-conflict`, `netflix-qwikster`, `pilot-survivorship-bias`, `pricing-partial-data`.

### The decisive dimension tells you more than the winner

Both families resolve on `decision_usefulness` as the decisive dimension in the majority of verdicts (Claude ~80%, GPT ~60%). When they disagree on the winner, it is almost always because Claude rewarded operational specificity (concrete pass/fail gates, named owners, quantified thresholds, executable next steps) while GPT rewarded analytical rigor or calibration discipline (staying within the evidence, acknowledging uncertainty, not overreaching).

**Implication for scenario design:** Scenarios where the correct answer is methodologically conservative — "stop, gather evidence, then decide" — will systematically produce Claude verdicts that reward the more aggressive recommendation. GPT is the more appropriate judge for those scenarios. This is documented in `docs/review/scenario-design-notes-2026-04-16.md`.

---

## The Corpus: What We Have

### Distribution (32 scenarios, GPT-judged, v2.2)

| Outcome | Count | % |
|---|---|---|
| side_b wins | 14 | 52% |
| tie | 8 | 30% |
| side_a wins | 5 | 18% |

The side_b dominance reflects GPT's positional lean. The tie rate (30%) is high relative to prior expectations — GPT appears to genuinely deadlock on scenarios where both artifacts converge on the same substantive recommendation and the verdict turns on execution quality.

### Real-world scenarios

Three real-world M&A / restructuring scenarios were run with cross-family panels (both GPT and Claude as judges):

- **Bayer breakup:** Cross-family agreement, side_a (Claude). Both families found the same decisive dimension (decision usefulness). Thin margins on both sides — same-conclusion scenario.
- **Intel foundry separation:** Cross-family agreement, side_a (Claude). Stronger signal, especially from Claude.
- **Paramount/Skydance:** **Cross-family divergence.** GPT called side_b (0.20 margin), Claude called side_a (0.40 margin). Both flagged for review. Routes to `HUMAN_REVIEW_REQUIRED`. The load-bearing factual question (go-shop outcome) is absent from the case packet — both judges named it independently. This is the harness working correctly.

---

## Known Failure Modes (All Fixed)

| Failure | Root cause | Fix |
|---|---|---|
| Fabricated ctx-N citations | Models inventing evidence references | EVIDENCE CONSTRAINT in prompts + phantom citation check |
| Phase 2 fields missing after repair | Generic repair instruction not breaking through | Targeted mandatory Phase 2 section in repair prompt when those fields are the errors |
| `partially_adopted` disposition rejected | Not in enum | Added to all 4 disposition enum occurrences in schema |
| Empty claims array | Conservative artifacts didn't extract claims | Empty claims check in artifact turn loop + repair prompt explaining conservative claim extraction |
| `side_id` restriction too broad | Prompt said "don't write side_a anywhere" — broke JSON structure | Scoped restriction to `artifact_markdown` only |
| `needs_human_review` not repairable | Missing from REPAIRABLE_VERDICT_PATHS | Added |
| Empty Phase 2 fields failing `minItems: 1` | Untriggered payload fields validated as required | `stripUnusedPhase2Fields()` removes empty fields pre-validation when payload not triggered |
| `grounding_flags` rejected by run schema | Not in `judge.verdict` inline block | Added to that block |

---

## The Usability Gap

### Who can use it today

The harness is reliable for a **technically sophisticated practitioner** who:
- Understands the positional lean and reads verdicts accordingly
- Knows to look at the decisive dimension, not just the winner
- Reads the uncertainty payload as the primary output when it's present
- Uses GPT-only for scenarios where restraint is the correct answer
- Runs swap tests on any Claude-solo verdict

For this user, the system is trustworthy and produces real signal.

### Who cannot use it today

A **less experienced user** who:
- Runs the default command and reads the winner label
- Treats a high-confidence Claude verdict as ground truth
- Doesn't know what "positional lean" means or why it matters
- Doesn't notice the stderr warning about judge family matching Side A

For this user, the default output is actively misleading. A high-confidence Claude verdict with margin 0.80 reads as "this is clearly the better artifact." The correct reading is "Claude strongly preferred the more operationally specific artifact, which is likely its own, because it's always in Side A."

### Why this gap is hard to close

The gap is not a bug — it is a consequence of the system's design:

1. **The harness is a research tool pretending to be a product.** It produces the right outputs but surfaces them in formats (JSON, markdown batch summaries, stderr logs) designed for developers, not practitioners.

2. **The trust model is non-obvious.** "Judge your judges" is not a natural framing for someone who just wants an answer. Explaining that both judges are biased and the clean signal is in the exceptions requires the user to hold a mental model of the system while interpreting its outputs.

3. **The right output changes based on the scenario class.** For conservative-answer scenarios, GPT is the right judge. For same-conclusion scenarios, the uncertainty payload matters more than the winner. For governance scenarios, cross-family confirmation is required. None of this is communicated to the user by the CLI output.

4. **The warning is passive.** The positional lean warning goes to stderr. A user piping output to a file, or a user who doesn't know what stderr is, will never see it.

### What would close the gap

**Short-term (output layer, no architectural change):**
- Surface the lean warning inside the batch summary markdown, not just stderr — make it impossible to miss
- Add a "verdict trust level" field to each result: `high` (cross-family, at least one against-lean), `medium` (cross-family agreement, leans aligned), `low` (single-family, favoring own artifact), `unknown` (swap not run)
- Include a one-sentence plain-English interpretation of each verdict in the batch summary: "GPT-as-judge overrode its own positional lean to call Claude's artifact the winner. This is a high-trust verdict."

**Medium-term (routing and interpretation layer):**
- Auto-run the swap test on any Claude-judged verdict where the winner is side_a — remove the need for user discipline
- Annotate the decisive dimension with a plain-English explanation: "Claude resolved this on decision usefulness — it preferred the artifact with concrete next steps and named owners over the one with stronger analytical rigor. If your scenario rewards caution, weight this verdict less."
- Add scenario-class tagging and use it to select the right judge automatically (conservative-answer scenarios → GPT-only by default)

**Long-term (interface layer):**
- Replace the batch summary markdown with a structured verdict card UI that surfaces trust level, decisive dimension, uncertainty payload, and routing recommendation in a format a PM can read without understanding the internals
- Build a scenario intake flow that asks the user what kind of question they're trying to answer and configures the run accordingly — judge selection, swap test requirement, and output interpretation all derived from the scenario type

---

## Summary Assessment

| Dimension | Status |
|---|---|
| Correctness (runs produce valid, schema-compliant output) | ✅ Solid |
| Reliability (errors caught, repaired, or surfaced cleanly) | ✅ Solid |
| Interpretability (outputs can be correctly read) | ⚠️ Requires expertise |
| Usability (a non-expert can get correct signal) | ❌ Not yet |
| Trust model transparency (biases are visible) | ⚠️ Visible in docs and warnings, not in output |
| Corpus coverage | ✅ 36 scenarios, all v2.2 |

The harness is trustworthy. It is not yet usable. The path from here to usable runs through the output layer — surfacing trust level, decisive dimension interpretation, and routing recommendations in a format that can't be misread — rather than through additional reliability or corpus work.
