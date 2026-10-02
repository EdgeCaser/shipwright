---
name: shipwright
description: "Start here in Claude Code. Branded alias for the Shipwright orchestrator that routes plain-language PM requests to the right workflow, skill, or specialist."
---

Shipwright root: `${CLAUDE_PLUGIN_ROOT}`. Read Shipwright docs and run its helper scripts from that absolute path; it stands in for `<installed-root>` and `<absolute-shipwright-root>` below. If it still shows a variable name, locate the root from this file's path instead.

# /shipwright, Start Here

Before executing, read `docs/workflow-contract.md` from this Shipwright installation. Resolve it relative to this file's parent installation root (or the plugin root), not the user's product directory. Its handoff, depth, evidence and authorization rules apply throughout.

Use `/shipwright` as the default entrypoint after installing Shipwright in Claude Code.

This command is a branded alias for `/start`. Before responding:

1. Read `commands/start.md`.
2. Read `agents/orchestrator.md`.
3. Apply the exact orchestration behavior, execution modes, and guardrails defined there.
4. Treat any inline text supplied after `/shipwright` as the user's opening request.
5. Prefer `/shipwright` in user-facing guidance, but keep `/start` working for backwards compatibility.
