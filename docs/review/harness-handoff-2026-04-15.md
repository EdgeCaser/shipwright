# Conflict Harness Handoff Memo

**Date:** 2026-04-15
**Author:** Claude (overnight + morning autonomous session)
**Audience:** Next agent or engineer picking up the cross-model conflict harness work

## TL;DR

The harness works. Results show stable bias patterns rather than pure noise. We now have a v2 baseline under the richer judge schema, a diagnosed-and-fixed Phase 1.5 freshness failure, a v1-vs-v2 reconciliation memo, and a prompt-hardening fix that eliminated one failure class. Two cheap diagnostics remain before the next batch of claims is publication-ready.

## Where things stand

### Branch state

- `main` is current (commit `9377771`).
- `main` contains the harness implementation, v2 benchmark results through 2026-04-15, and the v1-vs-v2 reconciliation memo.
- The research/result corpus on `codex/cross-model-debate-harness-spec` (PR #6) holds the full v1 artifact history. Do not re-merge it; extract by `git archive` when you need frozen inputs for replay diagnostics.

### Recent commits worth knowing

- `9377771` - prompt hardening for Side A/B self-reference + v2 batch results + reconciliation memo
- `d6e282c` - Phase 1.7 v2 re-baseline plan addition
- `ec1f802` - next-steps v2 plan and revision
- `cfee554` - harness implementation extracted to `main`
- `30ce4ee`, `c97de44`, `4758f46` - these are the three commits most likely responsible for the judge-behavior shift between v1 and v2; reference them in any memo that quotes v1 numbers

### Key files

- `docs/review/next-steps-pipeline-and-scenarios-v2.md` - the operating plan; read this first
- `docs/review/v1-vs-v2-reconciliation.md` - what flipped, what held, why
- `docs/review/codex-cross-model-comparison-2026-04-14.md` - v1 cross-family memo (**note: uses v1 schema verdicts - see reconciliation memo before quoting**)
- `docs/review/codex-decisive-label-alignment-audit.md` - Gemini selection-layer bias analysis
- `docs/review/codex-gemini-repeatability-study.md` - within-family variance data for Gemini
- `scripts/run-conflict-harness.mjs` - core harness; `buildFirstPassPrompt` was hardened on 2026-04-15
- `scripts/run-conflict-batch.mjs` - batch runner
- `scripts/rejudge-conflict-run.mjs` - frozen-artifact replay; note the `buildReplayJudgePrompt` addendum which can introduce prompt-skew if you are not careful

### Current schema baseline

v2 schema emits: `dimension_rationales`, `decisive_dimension`, `side_summaries`, `judge_confidence`, `needs_human_review`, plus the five-dimension rubric with tightened `weighted_total` validation. Any verdict missing these fields is from v1 and is not comparable.

## What we have learned

### 1. Results show stable bias patterns, not just noise

Evidence:
- Frozen-artifact replay on `handoff-contradiction` reproduced the GPT flip at a larger margin (0.2 -> 0.6). Same inputs, same direction.
- Family-level directional leans survived across runs: Claude -> side_b, v1-GPT -> side_a, Gemini -> ties.
- `needs_human_review` rate held at ~38% across v1 and v2 despite winner-label instability.
- The 44-run calibration matrix decomposed position bias and family affinity as separable, stable effects (see `scripts/run-conflict-batch.mjs` swap-test output history on the research branch).

The harness is doing more than producing one-off noisy outputs. The current evidence is consistent with stable judge- and schema-shaped bias patterns, though we should keep the claim at that level until the next replay and swap diagnostics land.

### 2. Judge family dominates outcome

Picking the judge changes the answer more than picking the prompt or the context. No judge is neutral. Do not describe any single judge as the default arbiter without caveating the bias profile.

### 3. Prompt/schema tightening is not cosmetic

The v1 -> v2 change (adding `dimension_rationales` and `decisive_dimension`, tightening `weighted_total`) flipped 7/13 GPT winners and collapsed 3 more to ties across the original scenarios. Richer rationale requirements appear to amplify whichever dimension carries the most salient defect on each scenario.

Implication: `schema_version` or `prompt_revision` should be stamped on every verdict going forward so future comparisons can filter by version.

### 4. The calibration layer is more stable than the selection layer

`needs_human_review` held its rate across v1 and v2. Three of five v1 review flags reappeared in v2. The "when am I uncertain" signal is the part of GPT's output to actually trust as an orchestrator input. The "which side wins" label is less stable.

### 5. Frozen-artifact replay is the core diagnostic capability

Without it, we could not have distinguished judge drift from generation variance in Phase 1.5. This is a product-shaped capability, not just test infrastructure. Preserve it.

### 6. Operational failure modes are real but fixable

Three failure classes observed in the v2 batches:
- **Judge JSON parse failures** - transient, recovered on retry (2/3 cases).
- **Side-output enum drift** - e.g., `conclusion_confidence` emitted outside the allowed `low/medium/high` set. Transient.
- **Identity-protocol violations** - Claude self-labeled "Side A" on `prd-hidden-scope-creep`. Reproducible, scenario/model-specific. Fixed on 2026-04-15 by banning the literal strings in the first-pass prompt. See `scripts/run-conflict-harness.mjs` `buildFirstPassPrompt` and the `unseen_opponent` repair message.

**Known missing capability:** no automatic repair pass on judge-output JSON parse failures. Gemini has it, GPT/Claude do not. Adding it would likely eliminate about 66% of observed failures.

## Open questions (ranked by cost/value)

### Highest priority - cheap, high signal

1. **Is the 6/6 side_b pattern on new governance scenarios judge bias, shared schema effect, or scenario asymmetry?**
   - Cost: 4 rejudge calls + 2 new runs (6 total, mostly replay)
   - Command:
     ```bash
     node scripts/rejudge-conflict-run.mjs \
       --run-dir "benchmarks/results/conflict-harness/<scenario>/<latest-run-id>" \
       --judge-agent claude \
       --label claude-rejudge-v2-governance \
       --format text
     ```
   - If Claude replay also goes side_b, that meaningfully strengthens the "scenario asymmetry or shared schema effect" hypothesis. If Claude replay goes side_a or tie, that meaningfully strengthens the "judge-family effect" hypothesis.
   - This will not fully disambiguate cause on its own, but it is still the single most valuable next diagnostic because it directly pressure-tests the strongest finding we would be tempted to cite publicly.

2. **v2 swap test on Side A vs Side B position bias.**
   - The 44-run swap matrix was v1-era. We do not know whether v2 preserves or changes position neutrality.
   - Pick one scenario, run with Claude as Side A / GPT as Side B, then run with GPT as Side A / Claude as Side B. Compare.
   - The harness has a `--swap` capability; check the existing scripts.

### Medium priority - answers specific sub-claims

3. **v2 decisive_dimension distribution.** Tally across all v2 verdicts. If evidence_discipline dominates, that is a structural bias of the richer schema. Data is already on disk under `rejudges/` and `judge/verdict.json` in each run dir.

4. **Within-family variance under v2.** Pick one scenario, run 5x with GPT judge. If all 5 agree, selection is stable. If 2+ disagree, we have a noise floor to quote in any publication claim.

### Lower priority - blocked or expensive

5. **Phase 2 uncertainty payload.** Ship `uncertainty_drivers`, `disambiguation_questions`, `needed_evidence`, `recommended_next_artifact`, `can_resolve_with_more_evidence`, `escalation_recommendation` when `tie` / low-confidence / `needs_human_review: true`. See `next-steps-pipeline-and-scenarios-v2.md` Phase 2. Requires schema edit, not just data collection.
   - Note: this is a deliberate sequencing change from the current v2 plan, which treats Phase 2 as the highest-value product improvement. My recommendation here is to defer it briefly only long enough to close the two cheapest publication-risk diagnostics first.

6. **Is Side A/B self-labeling PRD-type-general?** The prompt fix banned literal strings - if the reflex shows up on non-PRD scenarios under other models, a deeper prompt restructure may be needed. For now the fix holds on `prd-hidden-scope-creep`.

7. **Judge-output JSON repair pass.** Add a one-shot repair prompt on parse failure for GPT and Claude (Gemini already has one). Would materially reduce the error rate and make the harness actually hands-off.

## Recommended sequence for the next session

1. Run the Claude replay on the 6 governance scenarios (open question 1). Produces the most important missing data point for under an hour of compute.
2. Tally v2 decisive_dimension distribution (open question 3). Pure data, no new runs.
3. v2 swap test on one scenario (open question 2). Single-scenario is enough for a noise-level answer.
4. Write a short memo combining all three findings.
5. Then decide whether to return to the v2 plan's default priority order and ship Phase 2 immediately, or keep pushing diagnostics if publication claims are the near-term goal.

## Operational gotchas

- **Windows shell.** This repo runs on Windows with Git Bash. Use forward slashes, `/dev/null` not `NUL`, and quote paths with spaces.
- **Background task IDs change per session.** Do not reference old task IDs in new work.
- **`docs/outreach/` is gitignored.** Intentional. Leave it out of any commit-all style operations.
- **Benchmark result commits are large.** `9377771` was 868 files / 76k insertions. Precedent is to commit them - see prior `50ea61b`. But stage explicitly, not `git add -A`.
- **`benchmarks/results/conflict-harness/` on `main` contains only the new v2 results.** v1 frozen artifacts live on `codex/cross-model-debate-harness-spec` - extract via `git archive` for replay diagnostics.
- **Replay addendum changes the prompt.** `buildReplayJudgePrompt` in `scripts/rejudge-conflict-run.mjs` appends instructions the original run did not see. Replay is not a pure reproduction of the original judge call - it is "judge the same artifacts under the current schema." If you need an exact reproduction, you would need to checkout the old commit and run from there.
- **Tokens are not the constraint.** User has pro-plan equivalents on all three model providers via OAuth. Size experiments for information value, not cost.
- **`prd-hidden-scope-creep` is the known-fragile scenario.** Post-fix verification is clean, but it is the scenario most likely to break next if a prompt change regresses.

## What not to do

- Do not quote v1 verdicts in any public-facing artifact without pointing to the reconciliation memo.
- Do not treat "GPT leans side_a" as current behavior - that was a v1 artifact of the older prompt.
- Do not interpret the 6/6 side_b governance pattern as a substantive finding until Claude replay has run.
- Do not add features without a question you cannot answer with existing data.
- Do not rerun generation when replay over frozen artifacts answers the question. The whole point of replay is to isolate the judge.
