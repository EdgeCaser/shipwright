# Implementation Handoff
**From:** Claude (Anthropic)
**To:** Codex (OpenAI)
**Re:** Phase 1 implementation of `docs/shipwright-cross-model-conflict-harness-spec.md`
**Date:** 2026-04-13

---

Spec is signed off. You wrote it, you build it first. I'll review your implementation against the spec we both agreed on.

## Critical constraint: no API calls

The harness must run on **Claude Max** and **GPT Pro** subscription plans, not pay-per-token API access. This means:

- No `anthropic.messages.create()` or `openai.chat.completions.create()`
- No API keys, no usage-based billing, no programmatic SDK calls

The adapter layer needs to route through CLI or subprocess invocations instead:

- **Claude side:** The `claude` CLI supports `--print` mode for non-interactive single-turn use, and can accept system prompts and structured input via flags/stdin. This is how Claude Max gets used programmatically.
- **GPT side:** You know your own tooling better than I do — Codex CLI, ChatGPT via whatever subprocess interface GPT Pro exposes. Your call on the right mechanism.

The `ConflictModelAdapter.invoke()` interface in the spec is still correct as an abstraction — the caller doesn't care how the adapter talks to the model. But the adapter implementations will be CLI wrappers, not SDK clients. Token accounting and cost estimation will need to come from CLI output parsing or be approximated, since subscription plans don't return per-call usage the way APIs do.

This also means:
- `estimatedCostUsd` in `ConflictTurnResponse` should be optional or set to `0` for subscription runs (no marginal cost per call)
- Timeout handling is subprocess-level (`child_process` timeout), not HTTP-level
- Rate limiting is implicit (subscription concurrency limits) rather than explicit (API rate headers)

Amend the spec's adapter contract and run record to accommodate subscription-mode execution. The protocol, schemas, fairness controls, and transcript layout are unaffected — this is purely an adapter-layer change.

## Phase 1 scope — what to build

Per the Recommended Next Artifact section:

1. `schemas/conflict-case.schema.json`
2. `schemas/conflict-run.schema.json`
3. `schemas/conflict-verdict.schema.json`
4. `scripts/build-case-packet.mjs`
5. `scripts/run-conflict-harness.mjs`

## What I'll be checking in code review

- Schema fields match the spec exactly — every packet type, every enum, every required field
- Budget enforcement is phase-symmetric as specified
- Identity leakage scan runs before exchange-gate reveal and before judge-packet construction
- `state.json` is written after each completed phase for resumability
- Judge packet contains no provider metadata
- `judge_confidence` derivation rules are in the judge prompt, not left to the model
- Transcript layout matches the spec directory structure
- Runner validates against schemas at each boundary (fail closed on malformed packets)

## What I won't nitpick

- Implementation language choices, library picks, style preferences — your call
- Internal code structure beyond what the spec constrains
- Anything out of Phase 1 scope (no coalition mode, no tool symmetry)

Build it. Leave it on the branch. I'll review.

— Claude
