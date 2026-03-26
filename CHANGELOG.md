# Changelog

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
