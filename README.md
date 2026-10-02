# Shipwright

[![GitHub stars](https://img.shields.io/github/stars/EdgeCaser/shipwright)](https://github.com/EdgeCaser/shipwright/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/EdgeCaser/shipwright)](https://github.com/EdgeCaser/shipwright/network/members)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Write PRDs, run discovery cycles, plan launches, and facilitate strategy sessions, from your terminal.**

Shipwright gives PMs a real operating system for product work: framework-backed skills, orchestrated workflows, quality gates that produce artifacts teams can execute, and a single-model decision analysis system for high-stakes questions.

Under the hood, Shipwright includes 46 skills, 7 agents (6 specialists plus the orchestrator), 17 chained workflows, 3 Claude helper commands, and a decision analysis system with Fast Mode analysis. The counts matter less than the contract: evidence-first outputs, explicit decisions, pass/fail gating, deterministic recovery, and adversarial review for high-stakes artifacts.

The skills are plain markdown files, so they're compatible with any AI coding tool that reads skill files (Cursor, Codex, Gemini CLI, and others). Agents, commands, and the Claude Code helper commands (`/shipwright`, `/start`, and `/shipwright-help`) are Claude Code-specific. This repo also includes a Codex-native bridge via [AGENTS.md](AGENTS.md) so plain-language prompts in Codex can still route through Shipwright's bounded research and framework selection.

## What Shipwright adds

Shipwright adds explicit evidence, output and handoff contracts. The fixture tests check those contracts; they do not establish that Shipwright outperforms another prompting approach.

| Dimension | Raw AI prompting | Shipwright |
|---|---|---|
| **Consistency** | Format shifts each run | Stable output signature via [output standard](docs/output-standard.md) |
| **Decision quality** | Often descriptive, not decisive | Required `Decision Frame` with recommendation + trade-off + owner/date |
| **Evidence discipline** | Easy to mix assumptions and facts | Sourced claims + explicit unknowns |
| **Readiness gating** | "Looks good" is subjective | Binary [pass/fail gates](evals/pass-fail.md) before scoring |
| **Adversarial pressure** | Critique depends on the same prompt that produced the work | Optional `/challenge` workflow and red-team review for pressure-testing finished artifacts |
| **Recovery path** | Ad hoc rewrites | Deterministic [recovery playbooks](docs/recovery-playbooks.md) |
| **Handoff quality** | Varies by prompt quality | Repeatable workflows with role constraints and checks ([prompting guide](docs/prompting.md)) |

## Illustrative example

The following is a synthetic example, not a recorded customer result.

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

**Verdict: ESCALATE.** The enterprise thesis may still be right, but the cost estimate contradicts the appendix and the growth claim lacks product-specific evidence. The PM should route findings back before treating the PRD as settled.

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

### Install as a plugin

In Claude Code:

```text
/plugin marketplace add EdgeCaser/shipwright
/plugin install shipwright@shipwright
```

In Codex:

```bash
codex plugin marketplace add EdgeCaser/shipwright
codex plugin add shipwright@shipwright
```

Both install the built bundle in `plugins/shipwright`. Restart the host, then start with `/shipwright:shipwright` in Claude Code, or ask Codex a PM question.

### Install into a project

Requires Node.js 22 or newer. From a source checkout:

```bash
node scripts/install.mjs /path/to/your-project
node scripts/install.mjs /path/to/your-project --apply
```

The first command previews changes. The second installs the complete bundle into `.claude/` and `.codex/`. Existing root instructions, unrelated files and locally modified installed files are preserved. A conflict stops the installation before any file changes; `.shipwright-ignore` supports explicit exclusions. Repeat these commands after updating the source checkout.

To remove an installation, run the same installer with `--uninstall`. It previews by default and removes with `--apply`:

```bash
node scripts/install.mjs /path/to/your-project --uninstall
node scripts/install.mjs /path/to/your-project --uninstall --apply
```

Uninstall deletes only files listed in `.shipwright-install.json` whose content still matches what was installed. Edited files are kept and reported. It removes the managed block from `AGENTS.md` and `CLAUDE.md` and leaves the rest of those files as it was, deleting one only if the installer created it and nothing else is in it. Directories the installer created are removed if empty. The install record is removed last. Records from older installs do not list created directories or block details, so uninstall removes empty parent directories of the files it removed and may leave a blank line where the block was.

In Claude Code, start with `/shipwright` in a project copy. Plugin commands use `/shipwright:shipwright`. In Codex, invoke `shipwright-concierge` or ask a PM question; the skill routes to the relevant framework. Restart or reload the host after installing so it discovers the new skills. No source-repo working directory is required.

### Build a directory-submission bundle

```bash
node scripts/validate-repository.mjs
node --test --test-concurrency=1 --test-reporter=spec --test-reporter=tap --test-reporter-destination=stdout --test-reporter-destination=test-results.tap tests/*.test.mjs
node scripts/build-plugin.mjs dist/shipwright
```

The TAP file records every test that started, so an unexplained suite abort can be traced.

The output directory must be new. The marketplace installs the committed copy in `plugins/shipwright`; after changing anything packaged, delete that folder and run `node scripts/build-plugin.mjs plugins/shipwright`. A test fails while the committed copy is stale. Submit the contents of the generated bundle: it contains flat skill directories, Claude and Codex manifests, and their local dependencies. Source skills remain grouped by category for maintenance. The bundle excludes local credentials, run outputs and internal review material.

See [installation details](docs/installing-in-other-tools.md) and the [live release checks](docs/shipwright-v2-proof-runbook.md). Building and validating the bundle does not submit it to either directory.

## Decision Analysis

For high-stakes decisions, governance, board-level, restructuring, pricing, Shipwright includes a decision analysis system that runs a structured Fast Mode analysis and returns a recommendation, confidence band, and uncertainty payload.

**Fast Mode** runs a single structured analysis pass. Duration depends on the selected provider. In an existing Claude/Codex session, the skills perform this inline; the optional CLI below is for source-checkout integrations.

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

| Class | Behavior |
|---|---|
| `governance`, `publication` | Fast pass followed by an optional opposing-position stress test in chat; not independently verified consensus |
| `pricing`, `product_strategy`, `unclassified` | Fast directional analysis with uncertainty and review needs stated |

### Providers and output

The optional CLI accepts `claude`, `gpt` and `gemini` provider labels. Listing multiple installed providers does not add a second automated model review. A human-review flag must be preserved regardless of model confidence.

CLI sessions write to `benchmarks/sessions/` and Fast runs to `benchmarks/results/fast-analysis/` by default. With `--out-dir DIR`, sessions use `DIR/s` and Fast runs use `DIR/f`.

### Session API

The decision analysis system exposes a session-based API for building product surfaces that aren't tied to a single terminal run. Sessions persist to `benchmarks/sessions/` and track the full state machine: `running → awaiting_user_action → completed / failed`.

```javascript
import { handleDecisionSessionRequest } from './scripts/decision-session-service.mjs';

const result = await handleDecisionSessionRequest({
  method: 'POST', path: '/decision-sessions',
  body: { question: 'Should we change pricing?', scenario_class: 'pricing', available_providers: ['claude'] }
}, options);

if (result.ok && result.data.session.ux_state === 'not_ready') {
  await handleDecisionSessionRequest({
    method: 'POST', path: `/decision-sessions/${result.data.session.session_id}/follow-up`,
    body: { action: 'create_follow_up_brief' }
  }, options);
}
```

Follow-up actions: `gather_more_evidence` creates a collection brief unless `additional_evidence` is supplied, in which case it re-analyzes that input; `create_follow_up_brief` writes a review brief; `open_human_review` records a request without contacting anyone. `/confirm` and `/decline` are available only when a session explicitly offers them.

### Telemetry

Run `node scripts/telemetry.mjs` to see a summary of confidence distributions, escalation funnel, and terminal states across all runs. The log lives at `benchmarks/telemetry/events.jsonl`.

Set `SHIPWRIGHT_OUTPUT_ROOT` to redirect default decision session, Fast/Rigor run, and telemetry output under another directory. The session tests set this to a disposable directory so mocked results stay out of user benchmark output.

If you're working from a OneDrive-synced repo on Windows, you can move generated outputs to a short local root after a run:

```bash
node scripts/archive-generated-outputs.mjs --dry-run
node scripts/archive-generated-outputs.mjs --target-root C:\shipwright-artifacts
```

That preserves the `benchmarks/results/` and `benchmarks/telemetry/` layout under the shorter root, which helps avoid OneDrive path-length sync failures on deep benchmark trees.

### 2) Add product context and go

```bash
cp shipwright/examples/CLAUDE.md.example your-project/CLAUDE.md
# Fill in your product name, personas, metrics, and priorities, even rough answers help
```

Then open Claude Code in your project and run:

```text
/shipwright I'm a PM at [company] working on [brief context]
```

That's it. The orchestrator reads your CLAUDE.md, picks up your context, and routes you to the right workflow. `/shipwright` is the branded Claude Code entrypoint; `/start` still works as a backwards-compatible alias. If you skip the CLAUDE.md, Shipwright still works, but outputs will be generic instead of tailored to your product.

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

Shipwright also includes `scripts/collect-research.mjs`, a local helper that reads no API keys. For a research question it writes a `needs-interactive-followup` pack with suggested queries for the host's own web search. For known public pages passed with `--url`, it builds a compact evidence pack and a `facts.json` sidecar with deterministic pricing, review, product, date, and package-registry facts, including adapter-backed metadata from npm, PyPI, and crates.io. Page captures are cached under `.shipwright/cache/research/v1/` for 24 hours by default. To clear the local cache manually, run `node scripts/collect-research.mjs --clear-cache`.

## Standalone Mode (Any Tool)

You can use any skill directly without workflows, agents, or orchestrator:

```text
Read skills/execution/prd-development/SKILL.md and write a PRD for [feature].
```

Use standalone mode for one framework and one question. Move up to workflows when you need repeatable, multi-step output quality.

## Proof and Quality Gates

Want proof before adoption? Start here:

- [Case studies](case-studies/) for anonymized, unverified usage illustrations
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
Confidence: High, revenue impact is quantifiable from published industry benchmarks, and
competitor capability gap is sourced from press releases and analyst reports.
Decision owner/date: PM (2026-03-15). Revisit after first discovery call.

## Unknowns and Evidence Gaps
- EHR platform(s) in use, determines integration path
- Payer mix breakdown, affects whether the documented revenue gap is material at this client's scale
- Whether any value-based contracts are already in place, changes the urgency framing

## Pass/Fail Readiness
PASS, competitive claims are sourced, revenue impact is quantified, discovery entry points are
ranked by evidence quality, and unknowns are listed with resolution path (first call).
FAIL condition: if competitive capability claims are taken from positioning pages only with no
outcome data, or if revenue impact has no source.
```

## Keeping Your Install Up to Date

After pulling new changes in the Shipwright repo, use the portable Node installer from the source checkout:

```text
node "<absolute-source-root>/scripts/install.mjs" "<project-path>"
node "<absolute-source-root>/scripts/install.mjs" "<project-path>" --apply
```

The preview reports changes and conflicts. The apply command updates only files previously installed
by Shipwright that have not been locally changed. `scripts/sync.sh` remains a Bash compatibility
wrapper; the Node installer works on Windows, macOS, and Linux.

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
