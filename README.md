# Shipwright

[![GitHub stars](https://img.shields.io/github/stars/EdgeCaser/shipwright)](https://github.com/EdgeCaser/shipwright/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/EdgeCaser/shipwright)](https://github.com/EdgeCaser/shipwright/network/members)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Write PRDs, run discovery cycles, plan launches, and facilitate strategy sessions — from your terminal.**

Shipwright gives PMs a real operating system for product work: framework-backed skills, orchestrated workflows, quality gates that produce artifacts teams can execute, and a single-model decision analysis system for high-stakes questions.

Under the hood, Shipwright includes 46 skills, 7 agents (6 specialists plus the orchestrator), 17 chained workflows, 3 Claude helper commands, and a decision analysis system with Fast Mode analysis. The counts matter less than the contract: evidence-first outputs, explicit decisions, pass/fail gating, deterministic recovery, and adversarial review for high-stakes artifacts.

The skills are plain markdown files, so they're compatible with any AI coding tool that reads skill files (Cursor, Codex, Gemini CLI, and others). Agents, commands, and the Claude Code helper commands (`/shipwright`, `/start`, and `/shipwright-help`) are Claude Code-specific. This repo also includes a Codex-native bridge via [AGENTS.md](AGENTS.md) so plain-language prompts in Codex can still route through Shipwright's bounded research and framework selection.

## Why this beats raw AI

Shipwright is not "better prompting." It is a quality system around prompting.

| Dimension | Raw AI prompting | Shipwright |
|---|---|---|
| **Consistency** | Format shifts each run | Stable output signature via [output standard](docs/output-standard.md) |
| **Decision quality** | Often descriptive, not decisive | Required `Decision Frame` with recommendation + trade-off + owner/date |
| **Evidence discipline** | Easy to mix assumptions and facts | Sourced claims + explicit unknowns |
| **Readiness gating** | "Looks good" is subjective | Binary [pass/fail gates](evals/pass-fail.md) before scoring |
| **Adversarial pressure** | Critique depends on the same prompt that produced the work | Optional `/challenge` workflow and red-team review for pressure-testing finished artifacts |
| **Recovery path** | Ad hoc rewrites | Deterministic [recovery playbooks](docs/recovery-playbooks.md) |
| **Handoff quality** | Varies by prompt quality | Repeatable workflows with role constraints and checks ([prompting guide](docs/prompting.md)) |

## Demo

A PM wrote a PRD recommending enterprise expansion as the top priority. Before sending it to engineering, they ran `/challenge` to pressure-test it.

**Input:**
```text
/challenge Review this PRD at Standard depth before I send it to the eng lead.
```

**What the red-team agent found:**

| Claim Challenged | Attack Vector | Severity | Why This Is Vulnerable | What Would Resolve It |
|---|---|---|---|---|
| "Enterprise is our highest-growth segment" | Evidence Integrity | Moderate | Cited market report covers the category, not this product. No enterprise-specific pipeline or win-rate data. | Cite enterprise pipeline metrics or downgrade to hypothesis. |
| "Minimal incremental engineering cost" | Structural Honesty | Critical | SSO, audit logging, and SLA requirements are listed in the appendix but not reflected in the cost estimate or timeline. | Reconcile appendix requirements with the effort estimate or scope them out explicitly. |
| "Self-serve onboarding will scale to enterprise" | Decision Courage | Moderate | The PRD hedges with "may require some customization" but doesn't commit to whether enterprise onboarding is self-serve or high-touch. | Make the call: self-serve with guardrails, or dedicated onboarding. State the trade-off. |

**Verdict: DEFEND.** The enterprise thesis may still be right, but the cost estimate contradicts the appendix and the growth claim lacks product-specific evidence. The PM should route findings back before treating the PRD as settled.

The PM sent findings back to the producing agent, which revised the cost section and downgraded the growth claim to a hypothesis. A second `/challenge` pass returned `CLEAR`.

---

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
mkdir -p your-project/.claude/scripts/
cp -r shipwright/scripts/ your-project/.claude/scripts/
```

Using a different tool? See the [cross-tool install guide](docs/installing-in-other-tools.md).

If you are running directly from this repo in Codex, you do not need slash commands. The project-level [AGENTS.md](AGENTS.md) tells Codex to treat plain-language PM prompts as Shipwright work and to use the local research collector before broad interactive browsing when it is available.

## Decision Analysis

For high-stakes decisions — governance, board-level, restructuring, pricing — Shipwright includes a decision analysis system that runs a structured Fast Mode analysis and returns a recommendation, confidence band, and uncertainty payload.

**Fast Mode** runs a single structured analysis pass. It takes roughly 1-2 minutes.

You declare the scenario class; the system applies the corresponding routing policy. Governance and publication-class questions are flagged when confidence is insufficient, returning an explicit uncertainty payload and recommended next actions rather than a false-confident answer.

### Usage

```bash
# Fast pass on a pricing question
node scripts/shipwright.mjs \
  --question "Should we raise prices by 15% in Q3 given softening retention?" \
  --class pricing \
  --provider claude

# Governance question
node scripts/shipwright.mjs \
  --question "Should we restructure the board now or wait for Q4 results?" \
  --class governance \
  --provider claude

# Preview routing plan without running
node scripts/shipwright.mjs \
  --question "Is this feature worth building?" \
  --dry-run
```

### Scenario classes

| Class | Default path | Cross-family required |
|---|---|---|
| `governance` | fast pass, escalation flagged on low confidence | yes |
| `publication` | fast pass, escalation flagged on low confidence | yes |
| `pricing` | single analysis | no |
| `product_strategy` | single analysis | no |
| `unclassified` | single analysis | no |

### Providers

Pass `--provider` once per available model family: `claude`, `gpt`, `gemini`. With one provider, analysis is single-pass and marked provisional. With two or more, Shipwright can give a Fast Mode result with honest escalation guidance when confidence is insufficient.

### Output

Each run writes to `benchmarks/results/orchestrated/<scenario>/<run-id>/`:
- `orchestration.json` — routing decisions and terminal state for every stage
- `stage-1-fast/` — Fast Mode analysis with recommendation, confidence, and uncertainty payload

### Session API

The decision analysis system exposes a session-based API for building product surfaces that aren't tied to a single terminal run. Sessions persist to `benchmarks/sessions/` and track the full state machine: `running → awaiting_user_action → completed / failed`.

```javascript
import { handleDecisionSessionRequest } from './scripts/decision-session-service.mjs';

// Create a session
const { body } = await handleDecisionSessionRequest({
  method: 'POST', path: '/decision-sessions',
  body: { question: '...', scenario_class: 'governance', providers: ['claude', 'gpt', 'gemini'] }
}, options);

// Confirm next step (e.g. gather more evidence, create follow-up brief)
await handleDecisionSessionRequest({
  method: 'POST', path: `/decision-sessions/${body.session_id}/next-step`,
  body: { confirm: true }
}, options);
```

Follow-up actions for `not_ready` sessions: `gather_more_evidence` (re-runs Fast Mode with a refined question), `create_follow_up_brief` (writes a markdown brief for human review), `open_human_review` (flags the session and returns a review request payload).

### Telemetry

Run `node scripts/telemetry.mjs` to see a summary of confidence distributions, escalation funnel, and terminal states across all runs. The log lives at `benchmarks/telemetry/events.jsonl`.

If you're working from a OneDrive-synced repo on Windows, you can move generated outputs to a short local root after a run:

```bash
node scripts/archive-generated-outputs.mjs --dry-run
node scripts/archive-generated-outputs.mjs --target-root C:\shipwright-artifacts
```

That preserves the `benchmarks/results/` and `benchmarks/telemetry/` layout under the shorter root, which helps avoid OneDrive path-length sync failures on deep benchmark trees.

### 2) Add product context and go

```bash
cp shipwright/examples/CLAUDE.md.example your-project/CLAUDE.md
# Fill in your product name, personas, metrics, and priorities — even rough answers help
```

Then open Claude Code in your project and run:

```text
/shipwright I'm a PM at [company] working on [brief context]
```

That's it. The orchestrator reads your CLAUDE.md, picks up your context, and routes you to the right workflow. `/shipwright` is the branded Claude Code entrypoint; `/start` still works as a backwards-compatible alias. If you skip the CLAUDE.md, Shipwright still works — but outputs will be generic instead of tailored to your product.

If you want a quick menu of common paths and direct commands inside Claude Code, run:

```text
/shipwright-help
```

You can also run workflows directly:

```text
/discover   /write-prd   /plan-launch   /strategy   /sprint   /okrs   /challenge   /status   /quality-check
```

For the full workflow list and behavior, see [using workflows](docs/using-workflows.md).

### Keep Sessions Fast

When you already know the job to be done, run the workflow directly instead of routing through `/shipwright` (or `/start`). For example, use `/competitive` for competitive analysis or `/pricing` for pricing work.

When a task needs fresh public research, keep the first pass narrow:

- do market sizing first, then positioning
- do competitive landscape first, then battlecards
- ask for findings inline before asking for a polished memo or saved file

This keeps web-heavy work bounded and reduces timeout risk on broad requests.

If you installed Shipwright into the project with `scripts/sync.sh` or a manual copy, you can also opt into the optional Shipwright output style:

```text
/output-style shipwright
```

That style keeps Claude in a more decision-oriented PM voice for product work. Switch back to the default output style when you want normal coding behavior.

If you want to reduce search latency further without changing the conversational UX, Shipwright also includes `scripts/collect-research.mjs`, which can build a compact evidence pack from programmatic web search before the model synthesizes it. The helper now escalates automatically from a small first pass to broader subqueries, caches fresh evidence packs under `.shipwright/cache/research/v1/` for 24 hours by default, and only asks the model to browse interactively for the remaining gaps. It also emits a `facts.json` sidecar with deterministic pricing, review, product, date, and package-registry facts, including adapter-backed metadata from npm, PyPI, and crates.io when available. If no Brave or Tavily key is configured, it still degrades gracefully by writing a `needs-interactive-followup` pack instead of failing hard, and those no-provider fallback packs are not cached. To clear the local cache manually, run `node scripts/collect-research.mjs --clear-cache`.

## Standalone Mode (Any Tool)

You can use any skill directly without workflows, agents, or orchestrator:

```text
Read skills/execution/prd-development/SKILL.md and write a PRD for [feature].
```

Use standalone mode for one framework and one question. Move up to workflows when you need repeatable, multi-step output quality.

## Proof and Quality Gates

Want proof before adoption? Start here:

- [Case studies](case-studies/) for real-world proof points from production use
- [Golden outputs](examples/golden-outputs/) for side-by-side baseline vs Shipwright comparisons
- [Pass/fail gates](evals/pass-fail.md) for binary readiness checks
- [Eval rubrics](evals/) for scored quality dimensions
- [Adversarial review rubric](evals/adversarial-review.md) for calibrating Challenge Reports
- [Failure modes](docs/failure-modes.md) and [recovery playbooks](docs/recovery-playbooks.md) for deterministic fixes

### What the output signature looks like in practice

Every Shipwright artifact closes with the same three blocks. Here's a real example from a competitive brief:

```markdown
## Decision Frame
Recommendation: Lead the first discovery call with revenue cycle friction (documentation
accuracy, prior auth denial rate) before surfacing automation capabilities. Do not open with
technology.
Trade-off: A slower first meeting vs. a pitch that lands before the client has confirmed the pain.
Confidence: High — revenue impact is quantifiable from published industry benchmarks, and
competitor capability gap is sourced from press releases and analyst reports.
Decision owner/date: PM (2026-03-15). Revisit after first discovery call.

## Unknowns and Evidence Gaps
- EHR platform(s) in use — determines integration path
- Payer mix breakdown — affects whether the documented revenue gap is material at this client's scale
- Whether any value-based contracts are already in place — changes the urgency framing

## Pass/Fail Readiness
PASS — competitive claims are sourced, revenue impact is quantified, discovery entry points are
ranked by evidence quality, and unknowns are listed with resolution path (first call).
FAIL condition: if competitive capability claims are taken from positioning pages only with no
outcome data, or if revenue impact has no source.
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
- [Prompting guide](docs/prompting.md): what makes a strong prompt, and what makes a strong Shipwright prompt
- [Output standard](docs/output-standard.md): required sections, signature rules, decision framing
- [Composition model](docs/composition-model.md): how skills, workflows, and agents compose
- [AI vs non-AI guide](docs/ai-vs-non-ai-design-guide.md): what to automate deterministically, what to keep agentic, and where to invest next
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
