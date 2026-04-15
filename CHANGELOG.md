# Changelog

## v2.2.0 - 2026-04-15

### Added

- **Session store**: `scripts/session-store.mjs` — persistent JSON sessions at `benchmarks/sessions/<session_id>/session.json`. Handles create, read, update (patch-merge with deep-merge for artifacts), event append, artifact linking, and session directory resolution.

- **Decision execution**: `scripts/decision-execution.mjs` — thin execution layer over the analysis CLIs. `executeFastAnalysisForSession` and `executeRigorModeForSession` accept a session and options, run the appropriate analysis, and return structured results with routing inputs.

- **Decision session controller**: `scripts/decision-session-controller.mjs` — full session state machine. Exposes `createDecisionSession`, `getDecisionSession`, `confirmNextStep`, `runFollowUpAction`, and `retrySessionStep`. Manages state transitions (`running → awaiting_user_action → completed / failed`), orchestrator routing via `applyFastResult`, rigor execution, and escalation gates.

- **Session presenter**: `scripts/session-presenter.mjs` — view model adapter for the session API. Builds structured presentation payloads with headline text, available actions, artifact references, and extracted uncertainty payload. `buildHeadline` maps all UX states to human-readable copy.

- **Decision session service**: `scripts/decision-session-service.mjs` — HTTP-style request/response adapter over the controller. Routes `POST /decision-sessions`, `GET /decision-sessions/:id`, `POST /decision-sessions/:id/next-step`, `POST /decision-sessions/:id/follow-up`, and `POST /decision-sessions/:id/retry`. Returns structured responses with `SESSION_SERVICE_ERROR_CODES`. Enables non-terminal product surfaces (web API, CLI daemon) without re-implementing session logic.

- **Follow-up action adapter**: `scripts/follow-up-actions.mjs` — three actions for `not_ready` sessions:
  - `gather_more_evidence` — builds a refined question from the uncertainty payload and re-runs Fast Mode analysis
  - `create_follow_up_brief` — writes a structured markdown brief from the uncertainty payload to `{sessionDir}/follow-up-brief.md`
  - `open_human_review` — returns a structured review request payload and flags the session with `human_review_requested: true`
  - `buildRefinedQuestion` is exported as a pure function for composability

- **Telemetry (session-centric)**: telemetry now tracks session-layer events separately from legacy CLI events: `session_started`, `fast_completed`, `escalation_offered`, `next_step_confirmed`, `next_step_declined`, `rigor_completed`, `session_completed`, `session_failed`, `session_presented`, `follow_up_action_executed`. Summary output leads with Session Funnel and includes follow-up action distribution.

- **Full test suite (session layer)**: 163 new tests across 5 files — `session-store.test.mjs` (20), `session-presenter.test.mjs` (22), `decision-session-service.test.mjs` (15), `decision-session-controller.test.mjs` (25), `follow-up-actions.test.mjs` (21), `telemetry.test.mjs` (17), plus prior test files.

### Fixed

- `retrySessionStep` in the controller now correctly resets a failed rigor session to `awaiting_user_action` before calling `confirmNextStep`, preventing a status mismatch error on retry.

---

## v2.1.0 - 2026-04-15

### Added

- **Decision analysis entry point**: `scripts/shipwright.mjs` — single command that takes a plain-text question, scenario class, and available providers, routes through Fast or Rigor Mode, and writes a terminal state with orchestration log. No scenario file required.

- **Fast Mode**: `scripts/run-fast-analysis.mjs` — single-pass structured analysis with recommendation, confidence band, and uncertainty payload. Two UX states: `fast_provisional` (high confidence, no review flag) and `fast_uncertain` (everything else). Wired to the orchestrator for post-run routing guidance.

- **Fast Mode batch runner**: `scripts/run-fast-batch.mjs` — runs multiple scenarios across multiple agents, produces a summary with per-run table, agent agreement analysis, and escalation candidates list.

- **Orchestrator**: `scripts/orchestrate.mjs` — pure routing logic module. Takes stage, confidence band, panel agreement, and provider availability; returns UX state, UX substate, recommended next mode, and follow-up action. Covers all stages (pre_run, post_single, post_double, post_judge) and edge cases (user_declined_escalation, directionally_incoherent, limited_provider_availability).

- **Orchestrated runner**: `scripts/run-orchestrated.mjs` — wires Fast Mode and Rigor Mode into a staged flow with confirmation gates. Writes `orchestration.json` per run with full routing log.

- **Telemetry**: `scripts/telemetry.mjs` — append-only JSONL event log at `benchmarks/telemetry/events.jsonl`. Emits `run_started`, `fast_completed`, `escalation_offered`, `escalation_accepted`, `escalation_declined`, `rigor_completed`, `run_completed`. CLI summary at `node scripts/telemetry.mjs` shows confidence distribution by class, escalation funnel, and terminal state breakdown. Fire-and-forget — never interrupts a run.

- **Fast Mode schema**: `schemas/fast-analysis.schema.json` — lighter schema for single-pass output. Required: recommendation, confidence_band, needs_human_review, summary, key_reasoning. Conditional: uncertainty_payload (required when confidence is not high or review is flagged).

- **Two-mode spec**: `docs/review/two-mode-spec-2026-04-15.md` — formal definition of Fast Mode and Rigor Mode as distinct execution paths with separate schemas, prompt contracts, and escalation behavior.

- **State of research doc**: `docs/review/state-of-research-and-product-2026-04-15.md` — honest assessment of research findings and product state as of this version.

### Scenario class policy (V1)

`governance` and `publication` require cross-family confirmation (double panel default). `pricing`, `product_strategy`, and `unclassified` start with single analysis; escalation requires user confirmation. Only governance policy is calibrated — all others are provisional.

### Research findings (calibration basis)

Judge family dominates outcome more than scenario framing. GPT defaults to `decision_usefulness`; Claude defaults to `evidence_discipline`. `bayer-breakup-not-now` is the most stable governance scenario across families. Single-judge outputs cannot be treated as reliable findings on contested governance questions.

---

## v2.0.0 - 2026-04-02

### Added
- **Benchmark harness**: 6 scored scenarios with fixture corpus, blind-review pipeline, and `docs/shipwright-v2-benchmark-scoring-spec.md`
- **Proof framework**: `docs/shipwright-v2-proof-method.md`, `docs/shipwright-v2-proof-runbook.md`, `docs/shipwright-v2-technical-spec.md`, `docs/shipwright-v2-strategy-brief.md`
- **Deterministic integration layer**: `scripts/classify-request.mjs`, `scripts/format-facts.mjs`, `scripts/pricing-diff.mjs` — structured fact extraction decoupled from LLM judgment
- **Source adapters**: PyPI and crates.io research adapters in `scripts/source-adapters.mjs`
- **Collector-layer research**: `scripts/collect-research.mjs` with cache, bounded escalation, and env loading
- **Artifact validation**: `scripts/validate-artifact.mjs` with JSON schemas for PRD, Strategy, and Challenge Report (`schemas/artifacts/`)
- **Red-team adversarial review**: `skills/technical/adversarial-review.md`, `evals/adversarial-review.md`, `examples/golden-outputs/adversarial-review.md`, recovery playbook for DEFEND/ESCALATE verdicts
- **Quality-check skill**: `skills/measurement/artifact-quality-audit.md` and `/quality-check` workflow command
- **Slack mention agent**: full TypeScript Socket Mode agent in `slack-agent/` — command allowlists, channel/user allowlists, thread listening with TTL, per-thread session continuity
- **CI/CD**: GitHub Actions workflows for validation (`validate.yml`) and Claude code review (`claude-code-review.yml`, `claude.yml`)
- **AI vs non-AI design guide**: `docs/ai-vs-non-ai-design-guide.md`
- **Blind-review utilities**: `scripts/compile-blind-review.mjs`, `scripts/prepare-blind-review.mjs`, `scripts/generate-proof-pack.mjs`
- **Request routing**: `scripts/route-request.mjs` with deterministic skill dispatch
- **Self-updating sync**: `scripts/sync.sh` for downstream installs
- **Full test suite**: 13 test files covering all scripts (classify, collect, compile, extract, format, pricing-diff, route, benchmarks, source adapters, validate)

### Changed
- All 42 skills updated with depth enforcement, evidence bar, Shipwright signature, and micro-examples
- Agent contracts hardened with explicit handoffs and operational failure remediation (`AGENTS.md`)
- Research flows enforce collector-first with bounded escalation (no unbounded WebSearch loops)
- `docs/composition-model.md` extended with deterministic helper primitives

## v1.2.0 - 2026-03-25

### Added
- **Output signature standard**: `docs/output-standard.md` defines required artifact sectioning and a mandatory `Decision Frame` block.
- **Deterministic recovery playbooks**: `docs/recovery-playbooks.md` maps failure triggers to exact remediation steps.
- **Binary quality gates**: `evals/pass-fail.md` introduces pass/fail enforcement before rubric scoring.
- **Raw AI comparison framing**: README now includes a direct "Why this beats raw AI" comparison table.

### Changed
- **Core skill enforcement**: PRD, Strategy, Design Review, and A/B Analysis skills now require the Shipwright signature structure.
- **Validation hardening**: `scripts/validate.sh` now checks:
  - pass/fail gate file exists
  - output/recovery docs exist
  - signature section presence in core skills
- **Evaluation flow**: `evals/README.md` now enforces pass/fail-first, scoring-second.
- **Composition model clarity**: `docs/composition-model.md` now defines explicit primitives:
  - `Workflow = graph(Skills)`
  - `Agent = constrained executor`
  - `Orchestrator = planner over graph`
- **Cross-tool guidance**: docs now include pass/fail gating and signature usage for standalone mode.

## v1.1.0 - 2026-03-25

### Added
- **Plugin support**: `.claude-plugin/` manifest for one-line marketplace install (`claude plugin marketplace add EdgeCaser/shipwright`)
- **2 new skills**: SWOT Analysis and Business Model Canvas (strategy category)
- **6 new workflows**: `/personas`, `/competitive`, `/metrics`, `/okrs`, `/retro`, `/narrative`
- **Cross-tool install guide**: setup instructions for Cursor, Codex CLI, Gemini CLI, OpenCode, and Kiro
- **MCP setup guide**: step-by-step instructions for connecting PM tools (Jira, Linear, Notion, Slack, Amplitude, etc.)
- **Workflows guide**: explains what workflows are, how to run them, and how to pick the right one
- **3 example CLAUDE.md files**: B2B SaaS (compliance), consumer app (fitness), API platform (payments)
- **Example MCP config**: `.mcp.json` template for team sharing
- **GitHub badges**: stars, forks, license
- **CONTRIBUTING.md**: guide for contributors
- **Issue templates**: "Suggest a skill" and "Bug report"

### Changed
- README rewritten for clarity and tone
- Removed em dashes throughout
- Skill count: 40 → 42
- Workflow count: 9 → 15
- Quick Start now includes plugin install option and cross-tool link
- Skills map updated with new routing entries

## v1.0.0 - 2026-03-24

### Added
- Initial release
- 40 PM skills across 10 categories: discovery, strategy, execution, GTM, measurement, customer intelligence, technical, planning, pricing, communication
- 6 specialized agents: orchestrator, discovery researcher, strategy planner, execution driver, customer intelligence, cross-functional liaison
- 9 chained workflows: `/start`, `/discover`, `/write-prd`, `/plan-launch`, `/sprint`, `/strategy`, `/pricing`, `/customer-review`, `/tech-handoff`
- Skills map with keyword routing for the orchestrator
- CLAUDE.md product context template
- MIT license
