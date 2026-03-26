# Installing Shipwright in Other AI Coding Agents

Shipwright's skills are plain markdown files. They work in any AI coding agent that reads skill files from a known directory. Here's how to set it up in each tool.

## Claude Code

This is Shipwright's primary target. Copy everything into your project's `.claude/` directory:

```bash
cp -r shipwright/skills/ your-project/.claude/skills/
cp -r shipwright/agents/ your-project/.claude/agents/
cp -r shipwright/commands/ your-project/.claude/commands/
```

Or install as a plugin (see [Quick Start](../README.md#quick-start) in the README).

## Cursor

Cursor reads skills from `.cursor/skills/`:

```bash
mkdir -p your-project/.cursor/skills/
cp -r shipwright/skills/ your-project/.cursor/skills/
```

Commands and agents are Claude Code-specific features. In Cursor, reference skills directly by telling the agent to read a skill file:

```
Read .cursor/skills/execution/prd-development/SKILL.md and use that framework to write a PRD for [feature].
```

## OpenAI Codex CLI

Codex reads from `.codex/skills/`:

```bash
mkdir -p your-project/.codex/skills/
cp -r shipwright/skills/ your-project/.codex/skills/
```

Same as Cursor: reference skills by path when you want to use a specific framework.

## Gemini CLI

Gemini CLI reads from `.gemini/skills/`:

```bash
mkdir -p your-project/.gemini/skills/
cp -r shipwright/skills/ your-project/.gemini/skills/
```

## OpenCode

OpenCode reads from `.opencode/skills/`:

```bash
mkdir -p your-project/.opencode/skills/
cp -r shipwright/skills/ your-project/.opencode/skills/
```

## Kiro

Kiro reads from `.kiro/skills/`:

```bash
mkdir -p your-project/.kiro/skills/
cp -r shipwright/skills/ your-project/.kiro/skills/
```

## What works everywhere vs. Claude Code only

| Feature | All tools | Claude Code only |
|---|---|---|
| Skills (SKILL.md files) | Yes | Yes |
| Commands (/discover, /sprint, etc.) | No | Yes |
| Agents (@discovery-researcher, etc.) | No | Yes |
| Orchestrator (/start) | No | Yes |
| Evaluation rubrics (evals/) | Yes | Yes |
| Pass/fail quality gates | Yes | Yes |
| MCP integrations | Varies by tool | Yes |

## Standalone mode (any tool)

Skills are the core value. Each SKILL.md contains the full framework, output format, and common mistakes. You don't need commands, agents, or the orchestrator to get value from Shipwright.

### How to use a skill directly

Point your AI agent at the skill file and tell it what you need:

```
Read .cursor/skills/execution/prd-development/SKILL.md and use that framework to write a PRD for [feature].
```

Replace the path prefix with whatever your tool uses (`.cursor/skills/`, `.codex/skills/`, `.gemini/skills/`, etc.).

### Five things you can do with one skill

| Want to... | Skill | Prompt |
|---|---|---|
| Write a PRD | `execution/prd-development` | `Read [path]/SKILL.md and write a PRD for [feature].` |
| Run a SWOT | `strategy/swot-analysis` | `Read [path]/SKILL.md and run a SWOT analysis on [topic].` |
| Plan a sprint | `execution/sprint-planning` | `Read [path]/SKILL.md and plan the next sprint.` |
| Triage feedback | `customer-intelligence/feedback-triage` | `Read [path]/SKILL.md and triage this feedback: [paste feedback].` |
| Write an exec briefing | `communication/executive-briefing` | `Read [path]/SKILL.md and write a briefing for [topic].` |

### Chaining skills manually

Commands like `/discover` chain 4 skills together automatically. In non-Claude tools, chain them manually:

```
First, read [path]/discovery/opportunity-solution-tree/SKILL.md and map
the opportunity space for [problem area].

Then, read [path]/strategy/prioritization-advisor/SKILL.md and score
the opportunities using RICE.
```

This produces the same output as a workflow — you're just sequencing it yourself instead of letting a command file do it.

### Evaluating standalone output

After generating an artifact, use the evaluation rubrics:

```
Read evals/prd.md and score the PRD you just wrote. Be honest about weaknesses.
```

The rubrics work in any tool. They don't depend on agents or commands.

For binary quality gating:

```
Read evals/pass-fail.md and tell me PASS or FAIL for this artifact.
If FAIL, list failed gates and exact fixes.
```

For consistent output signature, use [docs/output-standard.md](output-standard.md).

## Tips for non-Claude tools

- **Be explicit.** In Claude Code, the orchestrator routes to the right skill automatically. In other tools, tell the agent which skill file to use.
- **Provide product context.** Copy the `CLAUDE.md.example` template and fill it in. Most AI coding agents read a context file from the project root. Rename it if needed (some tools use `CONTEXT.md` or similar), but the product context format works the same way.
- **Use the composition model.** If you want to build your own multi-step processes, read [docs/composition-model.md](composition-model.md) for the mental model behind how skills, workflows, and agents relate.
