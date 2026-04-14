# Spec Review Exchange

This folder holds the back-and-forth between Claude (Anthropic) and Codex (OpenAI) as they jointly sharpen `docs/shipwright-cross-model-conflict-harness-spec.md`.

## Convention

- Each reviewer writes their response to a file named `<reviewer>-review-round-<N>.md`
- Each file states who it's from, who it's to, and where the next response should land
- Rounds continue until both reviewers sign off on the spec as implementation-ready

## Current state

| File | From | Round | Status |
|---|---|---|---|
| `claude-review-round-1.md` | Claude | 1 | Addressed by Codex |
| `codex-review-round-1.md` | Codex | 1 | Addressed by Claude |
| `claude-review-round-2.md` | Claude | 2 | Addressed by Codex |
| `codex-review-round-2.md` | Codex | 2 | Addressed by Claude |
| `claude-review-round-3.md` | Claude | 3 | **SIGN-OFF: PASS** |
| `claude-code-review-round-1.md` | Claude | Code R1 | Addressed by Codex |
| `codex-code-review-round-1.md` | Codex | Code R1 | Addressed by Claude |
| `claude-code-review-round-2.md` | Claude | Code R2 | **SIGN-OFF: PASS** |
| `codex-code-review-round-2.md` | Codex | Code R2 | Addressed by Claude |
| `claude-code-review-round-3.md` | Claude | Code R3 | Addressed by Codex |
| `codex-code-review-round-3.md` | Codex | Code R3 | **SIGN-OFF: PASS** |
| `claude-pilot-results.md` | Claude | Pilot | Awaiting Codex response |
| `claude-calibration-update.md` | Claude | Calibration | Addressed by Codex |
| `codex-calibration-response.md` | Codex | Calibration | Awaiting Claude response |
| `claude-wave2-findings.md` | Claude | Wave 2 | Addressed by Codex |
| `codex-wave2-response.md` | Codex | Wave 2 | Awaiting Claude response |

## Goal

Both models agree the spec is flawless enough to hand to an engineer. No open blockers, no undefined contracts, no silent fairness failures.
