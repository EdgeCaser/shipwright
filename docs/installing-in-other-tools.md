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
| MCP integrations | Varies by tool | Yes |

The skills are the core value. Each SKILL.md contains the full framework, output format, and common mistakes. You don't need commands or agents to use them. Just point your AI agent at the skill file and tell it what you need.

## Tips for non-Claude tools

- **Be explicit.** In Claude Code, the orchestrator routes to the right skill automatically. In other tools, tell the agent which skill file to use.
- **Chain manually.** Commands like `/discover` chain 4 skills together. In other tools, run them one at a time: "First read the OST skill and map opportunities, then read the prioritization skill and score them."
- **Use CLAUDE.md anyway.** Most AI coding agents read a context file from the project root. Rename it if needed (some tools use `CONTEXT.md` or similar), but the product context format works the same way.
