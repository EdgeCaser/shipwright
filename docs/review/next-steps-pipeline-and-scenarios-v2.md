# Next Steps: Pipeline and Scenario Testing (v2)

**Revised:** 2026-04-14
**Supersedes:** `next-steps-pipeline-and-scenarios.md`

Key changes from v1:

- Phase 5 (uncertainty payload) moved earlier so Phase 3's triple-panel runs populate the richer contract from day one
- Phase 3 escalation triggers sharpened to remove curation bias
- Added freshness/comparability check before Phase 2
- Added explicit failure fallback for Phase 1
- Added cost discipline on Phase 3
- Added sample-size note to the post-batch memo

## Current State

The conflict-harness implementation is now on `main`. That includes:

- `scripts/run-conflict-harness.mjs`
- `scripts/run-conflict-batch.mjs`
- `scripts/rejudge-conflict-run.mjs`
- `scripts/rejudge-conflict-batch.mjs`
- conflict run and verdict schemas
- orchestrator guidance for judge routing and escalation
- scenario taxonomy on the benchmark scenarios
- the new real-world scenarios

The large research/result corpus was intentionally not merged into `main`. Full replay artifacts and research history live on branch `codex/cross-model-debate-harness-spec` (PR `#6`).

## Testing Goals From Here

Three separable concerns:

1. Pipeline reliability
2. Judge behavior
3. New scenario quality

Keep them separate. Mixing them makes a bad result impossible to triage between broken harness, flaky judge, and weak scenario.

## Recommended Order

### Phase 1: Pipeline Smoke Test on `main`

Goal: confirm the merged implementation still runs end-to-end.

```bash
node scripts/run-conflict-batch.mjs \
  --scenario openai-nonprofit-control \
  --judge-agent gpt \
  --out benchmarks/results/conflict-harness/batch-summary-smoke-openai-gpt.md
```

Success criteria:

- run completes without manual intervention
- summary file is written
- run directory includes `case-packet.json`, `run.json`, side outputs, and judge outputs

If that passes, run one replay smoke test:

```bash
node scripts/rejudge-conflict-run.mjs \
  --run-dir "benchmarks/results/conflict-harness/openai-nonprofit-control/<run-id>" \
  --judge-agent claude \
  --label smoke-claude-rejudge \
  --format text
```

**Failure fallback.** If either smoke test fails on `main`, bisect between `05f01c0` (first harness commit) and HEAD on the merged branch. The most likely suspects in descending order: prompt contract changes, schema tightenings (especially `weighted_total` validation), and Windows shell resolution in the script wrappers. Do not proceed to Phase 2 until smoke is green — a broken harness will contaminate every downstream phase.

### Phase 1.5: Comparability / Freshness Check (new)

Before treating new real-world scenario results as apples-to-apples with the earlier 13-scenario set, spot-check that prompt/schema drift hasn't invalidated prior comparisons.

Pick one scenario from the existing set — recommend `handoff-contradiction` because it's been the most-studied case:

```bash
node scripts/run-conflict-batch.mjs \
  --scenario handoff-contradiction \
  --judge-agent gpt \
  --out benchmarks/results/conflict-harness/batch-summary-freshness-check.md
```

Success criteria:

- winner direction consistent with prior GPT runs on the same scenario
- `decisive_dimension` consistent or within the known repeatability range
- no schema validation errors that weren't present before

If results diverge materially from prior runs on the same scenario, pause and diagnose before running new scenarios — the divergence itself is a finding that needs explanation before new data is interpretable.

### Phase 2: Ship Uncertainty Payload (was Phase 5)

**Moved up.** This is the highest-value product improvement and every batch run without it produces verdicts that can't carry the orchestrator routing signal. Running Phase 3 on the old schema means triple-panel data becomes second-class the moment Phase 5 lands. Ship the schema change first.

When a judge returns:

- `tie`
- `low confidence`
- `needs_human_review: true`

the verdict should also populate:

- `uncertainty_drivers`
- `disambiguation_questions`
- `needed_evidence`
- `recommended_next_artifact`
- `recommended_next_action`
- `can_resolve_with_more_evidence`
- `escalation_recommendation`

Make these fields optional at first, required when the trigger conditions hold. After Phase 2 lands, re-run the Phase 1 smoke test against the new schema before proceeding to Phase 3.

### Phase 3: Complete the New Real-World Scenario Screen

We already tested:

- `openai-nonprofit-control`
- `nissan-honda-merger-collapse`
- `google-adtech-breakup-remedies`

Remaining three for default GPT screen:

- `paramount-skydance-deal`
- `bayer-breakup-not-now`
- `intel-foundry-separation`

```bash
node scripts/run-conflict-batch.mjs \
  --scenario paramount-skydance-deal \
  --scenario bayer-breakup-not-now \
  --scenario intel-foundry-separation \
  --judge-agent gpt \
  --out benchmarks/results/conflict-harness/batch-summary-new-real-world-screen-2.md
```

What to inspect:

- winner distribution
- `judge_confidence`
- `needs_human_review` rate — **sanity check: does GPT still flag review at a rate roughly comparable to the prior 13-scenario set? If GPT collapses to confident wins on these governance cases, the "GPT as default screen" recommendation needs revisiting.**
- disagreement rate
- whether the scenarios feel genuinely arguable rather than trivially one-sided

### Phase 4: Escalate to Triple Panel — by Signal, Not by Interestingness

After the screen, escalate on **objective signals only**, not "scenarios we want to cite publicly." Curating escalations toward interesting cases introduces sampling bias in anything that gets published.

Escalation triggers:

- `needs_human_review: true` on the screen
- `judge_confidence` low or medium on a high-stakes scenario
- any scenario where two independent single-judge screens (e.g., GPT then Claude replay) disagree on the winner

Explicitly do not escalate on:

- "this case would make a good demo"
- "this result surprised me"

Boring panel runs are the ones that validate the screen. Their null findings are data.

**Cost discipline.** Triple panel on 3 scenarios with repair-dependent Gemini isn't trivially cheap. Rough per-scenario budget: ~3 judge calls × richer-schema prompt + Gemini's 100% repair pass. Before committing to a 3-scenario panel, estimate the total token spend and confirm it fits the session's budget. If it doesn't, prioritize by escalation-trigger strength and accept running fewer panels now.

Recommended command template:

```bash
node scripts/run-conflict-batch.mjs \
  --scenario <screen-flagged-scenario-1> \
  --scenario <screen-flagged-scenario-2> \
  --scenario <screen-flagged-scenario-3> \
  --judge-agent claude \
  --judge-agent gpt \
  --judge-agent gemini \
  --out benchmarks/results/conflict-harness/batch-summary-new-real-world-panel-1.md
```

### Phase 5: Use Replay Instead of Full Reruns for Judge Comparison

**Rule:** never rerun both sides unless you're specifically testing generation variance. If the question is "what would another judge do on the same artifact?", use replay.

```bash
node scripts/rejudge-conflict-run.mjs \
  --run-dir "<completed-run-dir>" \
  --judge-agent gemini \
  --label gemini-rejudge \
  --format text
```

Use replay when testing:

- Claude vs GPT vs Gemini on the same artifact
- decisive-dimension stability
- repair dependence
- whether a tie stays a tie across judge families

## Testing Matrix

Operating rule:

- single judge for screening
- replay for judge comparison
- triple panel for ambiguity, disagreement, and benchmark-quality examples — **selected by signal, not curation**

### Default Screen

Use **GPT**, contingent on the Phase 3 sanity check.

Why:

- operationally simplest on `main`
- review-flag calibration highest of the three judges on the 13-scenario set (5/13 flagged)
- avoids treating Gemini's repair-heavy path as the default runtime gate

**Revisit if:** the new real-world governance scenarios cause GPT to collapse to confident wins with low review-flag rate. In that case, rotate the default to Claude for scenarios typed as `historical_strategy` or equivalent, and reserve GPT for contradiction/boundary PRDs.

### Contrast Pair

Use **Claude + GPT**.

Why:

- fastest useful disagreement signal
- lower cost than triple panel
- directly surfaces the opposite-lean bias documented in prior memos

### Full Panel

Use **Claude + GPT + Gemini**.

Why:

- best when disagreement itself is the point
- most useful for benchmark examples and methodology work
- accept the Gemini repair cost in exchange for three-family triangulation

## Suggested Near-Term Worklist

In order:

1. Phase 1 smoke test on `main` (single-scenario + single replay)
2. Phase 1.5 freshness check on `handoff-contradiction`
3. Phase 2 uncertainty payload schema change, re-run smoke
4. Phase 3 GPT screen on the remaining three real-world scenarios, with explicit GPT-default sanity check
5. Phase 4 triple-panel escalation based on screen signals only
6. Write the post-batch memo (see below)

## Suggested Memo After The Next Batch

Cover:

- which new scenarios produced real disagreement
- which were too easy or too shallow
- whether real-world governance/strategy cases produce more ties than synthetic PRD cases — **caveat: with 3 new scenarios added to the 13-scenario base, our per-category n is still too small to make a confident claim here. Flag the finding as directional and note that ~8-10 scenarios per scenario_type is the rough threshold for anything stronger.**
- whether Gemini still prefers ties on the most ambiguity-heavy cases
- whether the Phase 3 GPT-default sanity check held up
- which scenario should become the canonical demo of the triple-panel workflow

## Practical Recommendation

If we only do two things next:

1. Ship the uncertainty payload (Phase 2) so every subsequent verdict carries routing fields
2. Run the remaining three real-world scenarios through the GPT screen (Phase 3) with the default-sanity check

Everything else can wait. Those two steps maximize pipeline verification, scenario coverage, and the data quality of anything produced after this point.

## Open Questions for Future Work

Not blockers for the near-term worklist, but worth tracking:

- **Scenario-type-aware default judge routing.** If GPT is best for contradiction/boundary PRDs but Claude is better for historical-strategy cases, should the orchestrator route by `taxonomy.scenario_type` automatically? This is a one-line routing rule if the sanity check in Phase 3 confirms the asymmetry.
- **Repair-rate as a first-class metric.** Gemini's 100% repair rate should be tracked in every summary, not buried in per-run metadata. Propose adding `repair_rate` to batch summary output.
- **Minimum scenario n per taxonomy bucket.** Current data is thin in several buckets. A target of ~8-10 per bucket would make category-level claims defensible.
