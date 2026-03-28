# Shipwright

[![GitHub stars](https://img.shields.io/github/stars/EdgeCaser/shipwright)](https://github.com/EdgeCaser/shipwright/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/EdgeCaser/shipwright)](https://github.com/EdgeCaser/shipwright/network/members)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Write PRDs, run discovery cycles, plan launches, and facilitate strategy sessions — from your terminal.**

Shipwright gives PMs a real operating system for product work: framework-backed skills, orchestrated workflows, and quality gates that produce artifacts teams can execute.

Under the hood, Shipwright includes 43 skills, 6 specialist agents, and 15 chained workflows. The counts matter less than the contract: evidence-first outputs, explicit decisions, pass/fail gating, and deterministic recovery.

The skills are plain markdown files, so they're compatible with any AI coding tool that reads skill files (Cursor, Codex, Gemini CLI, and others). Agents, commands, and the orchestrator are Claude Code-specific.

## Why this beats raw AI

Shipwright is not "better prompting." It is a quality system around prompting.

| Dimension | Raw AI prompting | Shipwright |
|---|---|---|
| **Consistency** | Format shifts each run | Stable output signature via [output standard](docs/output-standard.md) |
| **Decision quality** | Often descriptive, not decisive | Required `Decision Frame` with recommendation + trade-off + owner/date |
| **Evidence discipline** | Easy to mix assumptions and facts | Sourced claims + explicit unknowns |
| **Readiness gating** | "Looks good" is subjective | Binary [pass/fail gates](evals/pass-fail.md) before scoring |
| **Recovery path** | Ad hoc rewrites | Deterministic [recovery playbooks](docs/recovery-playbooks.md) |
| **Handoff quality** | Varies by prompt quality | Repeatable workflows with role constraints and checks |

## Start Here: 3 Paths

Most PM work falls into one of three patterns. If you're unsure where to begin, pick the path that matches this week's job.

### Path 1: New Feature
```
/discover  →  /write-prd  →  /tech-handoff
```
Start with customer evidence, convert it into a structured PRD, then generate the engineering handoff package. **You end with:** discovery report, Working Backwards PRD, tech spec, design review, epics, and stories. **Typical effort:** a few focused sessions.

### Path 2: Quarterly Planning
```
/customer-review  →  /strategy  →  /okrs
```
Synthesize customer signals, set strategic bets and boundaries, then draft and audit OKRs against those bets. **You end with:** customer intelligence report, strategy doc with kill criteria, and audited OKRs. **Typical effort:** a few focused sessions.

### Path 3: Launch
```
/strategy  →  /plan-launch  →  /sprint
```
Lock positioning, build the GTM launch plan, then turn it into execution-ready sprint scope. **You end with:** strategy doc, GTM launch plan, and sprint plan with stories. **Typical effort:** a few focused sessions.

Each path chains 3 workflows; run them in separate sessions or back-to-back. For full path details, see the [workflows guide](docs/using-workflows.md#the-3-most-common-paths).

## Quick Start

### 1) Install

**Option A: Plugin install (recommended)**
```bash
claude plugin marketplace add EdgeCaser/shipwright
claude plugin install shipwright@shipwright
```

**Option B: Script install (recommended for manual)**
```bash
git clone https://github.com/EdgeCaser/shipwright.git
bash shipwright/scripts/sync.sh --install your-project/
```

This copies all skills, agents, commands, docs, and evals into `your-project/.claude/`, and drops a `shipwright-sync.sh` script you can re-run later to pull updates.

**Option C: Manual install**
```bash
git clone https://github.com/EdgeCaser/shipwright.git
cp -r shipwright/skills/ your-project/.claude/skills/
cp -r shipwright/agents/ your-project/.claude/agents/
cp -r shipwright/commands/ your-project/.claude/commands/
```

Using a different tool? See the [cross-tool install guide](docs/installing-in-other-tools.md).

### 2) Add product context and go

```bash
cp shipwright/examples/CLAUDE.md.example your-project/CLAUDE.md
# Fill in your product name, personas, metrics, and priorities — even rough answers help
```

Then open Claude Code in your project and run:

```text
/start I'm a PM at [company] working on [brief context]
```

That's it. The orchestrator reads your CLAUDE.md, picks up your context, and routes you to the right workflow. If you skip the CLAUDE.md, Shipwright still works — but outputs will be generic instead of tailored to your product.

You can also run workflows directly:

```text
/discover   /write-prd   /plan-launch   /strategy   /sprint   /okrs
```

For the full workflow list and behavior, see [using workflows](docs/using-workflows.md).

## Standalone Mode (Any Tool)

You can use any skill directly without workflows, agents, or orchestrator:

```text
Read skills/execution/prd-development/SKILL.md and write a PRD for [feature].
```

Use standalone mode for one framework and one question. Move up to workflows when you need repeatable, multi-step output quality.

## Proof and Quality Gates

Want proof before adoption? Start here:

- [Golden outputs](examples/golden-outputs/) for side-by-side baseline vs Shipwright comparisons
- [Pass/fail gates](evals/pass-fail.md) for binary readiness checks
- [Eval rubrics](evals/) for scored quality dimensions
- [Failure modes](docs/failure-modes.md) and [recovery playbooks](docs/recovery-playbooks.md) for deterministic fixes

### Shipwright Output Signature (Compact Example)

```markdown
## Decision Frame
- Recommendation: Ship onboarding checklist v1 to all self-serve accounts this quarter.
- Trade-off: Slower velocity on template gallery improvements for 2 sprints.
- Decision owner/date: PM Lead (2026-03-25)

## Unknowns and Evidence Gaps
- Unknown: Activation impact for enterprise admins with SSO.
- Evidence needed: Segment-level activation baseline + 2-week pilot telemetry.

## Pass/Fail Readiness
- PASS: Problem framing tied to evidence and owner/date assigned.
- FAIL if: recommendation has no owner/date, or unknowns are listed without a plan to resolve.
```

## Keeping Your Install Up to Date

If you installed with `scripts/sync.sh --install`, your project has a `shipwright-sync.sh` script. After pulling new changes in the Shipwright repo, run it from your project directory:

```bash
bash shipwright-sync.sh          # interactive — shows what changed, asks before updating
bash shipwright-sync.sh --yes    # auto-update everything without prompting
```

The sync script compares every file against the Shipwright source and reports what's changed, what's new, and what's been removed. You can update all at once or file-by-file with diffs.

## Slack Agent

Shipwright includes an optional local Slack integration in [slack-agent/](slack-agent/README.md). It lets you `@mention` a bot in Slack, route the message into Claude Code running on your machine, and post the reply back into the same thread.

Current behavior:

- runs locally through Slack Socket Mode, so no public webhook is required
- keeps Claude session continuity per Slack thread
- supports strict commands like `question:` and `status:`
- supports thread-scoped listening mode with `listen on` / `listen off`
- uses the project directory you configure via `PROJECT_CWD`

Important warning:

- this Slack agent is for personal use only
- it is not intended to be a shared Claude gateway for teammates
- it should be limited to allowlisted users and channels
- `READ_ONLY_MODE=true` is the recommended default

If you want a team-facing Slack product, use a proper API-backed architecture instead of routing requests through a local authenticated Claude Code session.

Setup, configuration, safety guidance, and supported commands are documented in [slack-agent/README.md](slack-agent/README.md).

## Deep Reference Docs

- [Workflows guide](docs/using-workflows.md): all commands, orchestration model, common paths
- [Output standard](docs/output-standard.md): required sections, signature rules, decision framing
- [Composition model](docs/composition-model.md): how skills, workflows, and agents compose
- [Cross-tool install](docs/installing-in-other-tools.md): Cursor, Codex, Gemini CLI, others
- [Tool connections](docs/connecting-your-tools.md): MCP setup and integration patterns
- [Skills catalog](skills/) and [Agents](agents/): source of truth for all components

## Contributing

PRs are welcome. Before opening one, run:

```bash
./scripts/validate.sh
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for skill/workflow/rubric requirements and submission checklist.

## Acknowledgments

Built on ideas from PM practitioners and the AI coding agent community:

- [Pawel Huryn's PM Skills Marketplace](https://github.com/phuryn/pm-skills)
- [Dean Peters' Product-Manager-Skills](https://github.com/deanpeters/Product-Manager-Skills)
- [Sachin Rekhi's Claude Code for PMs](https://www.sachinrekhi.com/p/claude-code-for-product-managers)
- [prodmgmt.world](https://www.prodmgmt.world/claude-code)
- [ccforpms.com](https://ccforpms.com/)
- [VoltAgent's awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)

## License

MIT
