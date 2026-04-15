# Next Steps: Pipeline and Scenario Testing

## Current State

The conflict-harness implementation is now on `main`.

That includes:

- `scripts/run-conflict-harness.mjs`
- `scripts/run-conflict-batch.mjs`
- `scripts/rejudge-conflict-run.mjs`
- `scripts/rejudge-conflict-batch.mjs`
- conflict run and verdict schemas
- orchestrator guidance for judge routing and escalation
- scenario taxonomy on the benchmark scenarios
- the new real-world scenarios

The large research/result corpus was intentionally not merged into `main`.

If someone wants to inspect the full replay artifacts and research history, use:

- branch `codex/cross-model-debate-harness-spec`
- GitHub PR `#6`

## Testing Goals From Here

There are three different things to test, and they should stay separate:

1. Pipeline reliability
2. Judge behavior
3. New scenario quality

If we mix them together, it becomes hard to tell whether a bad result came from:

- a broken harness
- a flaky judge
- or a weak scenario

## Recommended Order

### Phase 1: Pipeline Smoke Test on `main`

Goal: confirm the merged implementation still runs end-to-end on `main`.

Run one simple single-judge batch:

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

Goal of the replay smoke test:

- confirm the frozen-artifact rejudge path is healthy on `main`

### Phase 2: Complete the New Real-World Scenario Screen

We already tested the most interesting three:

- `openai-nonprofit-control`
- `nissan-honda-merger-collapse`
- `google-adtech-breakup-remedies`

The remaining three should now get the default screening pass:

- `paramount-skydance-deal`
- `bayer-breakup-not-now`
- `intel-foundry-separation`

Recommended command:

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
- `needs_human_review`
- disagreement rate
- whether the scenarios feel genuinely arguable rather than trivially one-sided

### Phase 3: Escalate the Best New Cases to Triple Panel

After the screen, escalate only the most interesting cases.

Good escalation triggers:

- `needs_human_review: true`
- medium or low confidence on a high-stakes scenario
- cases where the recommendation feels brittle or counterintuitive
- scenarios we may want to cite publicly as examples

Recommended first triple-panel set:

- `openai-nonprofit-control`
- `google-adtech-breakup-remedies`
- whichever of `paramount-skydance-deal`, `bayer-breakup-not-now`, or `intel-foundry-separation` produces the most ambiguous screen result

Recommended command:

```bash
node scripts/run-conflict-batch.mjs \
  --scenario openai-nonprofit-control \
  --scenario google-adtech-breakup-remedies \
  --scenario paramount-skydance-deal \
  --judge-agent claude \
  --judge-agent gpt \
  --judge-agent gemini \
  --out benchmarks/results/conflict-harness/batch-summary-new-real-world-panel-1.md
```

If one of those looks too obvious after the screen, replace it with the more interesting remaining scenario.

### Phase 4: Use Replay Instead of Full Reruns for Judge Comparison

If the question is:

- "what would another judge do on the same artifact?"

then do not rerun both sides. Use replay.

Use:

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

### Phase 5: Add the Missing Uncertainty Payload

This is the highest-value product improvement that is still not wired into the live schema.

When a judge returns:

- `tie`
- `low confidence`
- `needs_human_review: true`

the verdict should also say:

- what evidence is missing
- what questions would resolve uncertainty
- what next artifact is recommended
- whether the system should gather more evidence before escalating to a human

Suggested fields:

- `uncertainty_drivers`
- `disambiguation_questions`
- `needed_evidence`
- `recommended_next_artifact`
- `recommended_next_action`
- `can_resolve_with_more_evidence`
- `escalation_recommendation`

This should be implemented before treating ties as fully actionable orchestrator signals.

## Recommended Testing Matrix

Use this operating rule:

- single judge for screening
- replay for judge comparison
- triple panel for ambiguity, disagreement, and benchmark-quality examples

### Default Screen

Use `GPT`.

Why:

- operationally simplest on `main`
- good enough for first-pass screening
- avoids treating Gemini's repair-heavy path as the default runtime gate

### Contrast Pair

Use `Claude + GPT`.

Why:

- fastest useful disagreement signal
- lower cost than triple panel

### Full Panel

Use `Claude + GPT + Gemini`.

Why:

- best when disagreement itself is the point
- most useful for benchmark examples and methodology work

## Suggested Near-Term Worklist

In order:

1. Run the single-scenario smoke test on `main`
2. Run the remaining three new real-world scenarios through GPT screen
3. Pick the most interesting of those three for triple-panel escalation
4. Write one short memo comparing all six recent real-world scenarios
5. Add the uncertainty payload to the live verdict contract

## Suggested Memo After The Next Batch

Once the next scenario wave is complete, write a short note covering:

- which new scenarios produced real disagreement
- which ones were too easy or too shallow
- whether real-world governance/strategy cases produce more ties than synthetic PRD cases
- whether Gemini still prefers ties on the most ambiguity-heavy cases
- which scenario should become the new canonical demo of the triple-panel workflow

## Practical Recommendation

If we only do one thing next, do this:

1. run the remaining three real-world scenarios through the GPT screen
2. escalate the most interesting one to triple panel

That gives us the fastest combination of:

- pipeline verification on `main`
- more scenario coverage
- better signal about whether the new scenario set is worth expanding
