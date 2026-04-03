# Parallel Variance Harness

This harness asks the same prompt to multiple concurrent Claude-compatible sessions and summarizes response drift.

Use it for:

- stability smoke tests
- prompt-hardening checks
- before/after comparisons when changing Shipwright instructions

Do not use it as a quality benchmark by itself. Low variance does not prove the answer is good, and high variance does not automatically mean the system is broken.

## What It Measures

`scripts/run-parallel-variance.mjs` reports:

- how many sessions succeeded or failed
- how many unique normalized responses were returned
- pairwise token-overlap similarity across successful runs
- word-count spread
- a heuristic variance verdict:
  - `stable`
  - `moderate_drift`
  - `high_drift`
  - `execution_error`

The harness is intentionally operational rather than semantic. It is designed to catch "these answers swung too far apart," not to prove deeper equivalence.

Token overlap is currently computed from lowercase ASCII word tokens only. That works well for English PM prose, but it underweights non-ASCII text, symbols, and code-heavy outputs. Treat the similarity score as a stability signal for natural-language artifacts, not as a general-purpose semantic metric.

## Prompt Sources

Provide exactly one of:

- `--prompt "..."` for a direct inline prompt
- `--prompt-file path/to/prompt.md`
- `--scenario <scenario-id>` to reuse a benchmark scenario prompt from `benchmarks/scenarios/`

Example scenario run:

```bash
node scripts/run-parallel-variance.mjs \
  --scenario event-automation-boundary \
  --command 'claude -p "$(cat {{prompt_file}})"' \
  --count 3 \
  --format json
```

## Command Contract

The harness does not hardcode Anthropic APIs or one specific Claude CLI.

Instead, it runs a shell command in parallel. Your command should:

- accept the prompt from `stdin`, or
- read the prompt from `{{prompt_file}}`
- print the model response to `stdout`
- exit non-zero on failure
- work correctly when run `--count` times concurrently, where `--count` must be at least `2`

Available command-template placeholders:

- `{{prompt_file}}`
- `{{session_id}}`
- `{{run_id}}`
- `{{scenario_id}}`

It also exposes these environment variables:

- `SHIPWRIGHT_PARALLEL_RUN_ID`
- `SHIPWRIGHT_PARALLEL_SESSION_ID`
- `SHIPWRIGHT_PARALLEL_TOTAL`
- `SHIPWRIGHT_PARALLEL_PROMPT_FILE`
- `SHIPWRIGHT_PARALLEL_SCENARIO_ID`

## Examples

Inline prompt:

```bash
node scripts/run-parallel-variance.mjs \
  --prompt "Write a PRD for a bounded Phase 1 event automation assistant." \
  --command 'claude -p "$(cat {{prompt_file}})"' \
  --count 3
```

Save a JSON report:

```bash
node scripts/run-parallel-variance.mjs \
  --prompt-file /tmp/prompt.md \
  --command 'claude -p "$(cat {{prompt_file}})"' \
  --count 4 \
  --format json \
  --out benchmarks/results/parallel-variance.json
```

Fail when drift is worse than `moderate_drift`:

```bash
node scripts/run-parallel-variance.mjs \
  --scenario prd-hidden-scope-creep \
  --command 'claude -p "$(cat {{prompt_file}})"' \
  --count 3 \
  --max-variance moderate_drift
```

## Interpretation

- `stable` means the outputs were effectively the same or very close.
- `moderate_drift` means some real wording or emphasis variation exists, but not an obvious judgment swing.
- `high_drift` means the responses diverged enough that the prompt or system should be inspected.
- `execution_error` means at least one session failed, so stability cannot be trusted.

As a rule of thumb, this harness is valuable when you care about response stability.
It is less valuable when you care about absolute decision quality, factual accuracy, or whether the recommendation is correct.
