---
name: leeward-help
description: "Show the Leeward start menu for Claude Code: common paths, direct workflows, specialist agents, and when to use each."
---

Shipwright root: `${CLAUDE_PLUGIN_ROOT}`. Read Shipwright docs and run its helper scripts from that absolute path; it stands in for `<installed-root>` and `<absolute-shipwright-root>` below. If it still shows a variable name, locate the root from this file's path instead.

# /leeward-help, Start Menu

Before executing, read `docs/workflow-contract.md` from this Shipwright installation. Resolve it relative to this file's parent installation root (or the plugin root), not the user's product directory. Its handoff, depth, evidence and authorization rules apply throughout.

Use this command when you want a compact menu of what Shipwright can do inside Claude Code.

When invoked, respond with a concise guide that includes:

## Shipwright

**Start here:** `/leeward [what you need in plain English]`

**Three common paths**
- **New feature:** `/discover` → `/write-prd` → `/tech-handoff`
- **Quarterly planning:** `/customer-review` → `/strategy` → `/okrs`
- **Launch:** `/strategy` → `/plan-launch` → `/sprint`

**Common direct workflows**
- `/write-prd`, new feature requirements
- `/competitive`, competitive intelligence
- `/pricing`, pricing and packaging
- `/strategy`, strategic bets and boundaries
- `/plan-launch`, GTM planning
- `/challenge`, adversarial review of a finished artifact
- `/status`, stakeholder updates

**Specialist agents**
- `@discovery-researcher`, market, competitor, and evidence gathering
- `@strategy-planner`, strategy, positioning, prioritization, OKRs
- `@execution-driver`, epics, stories, sprint plans, release notes
- `@customer-intelligence`, feedback, churn, journey, voice of customer
- `@cross-functional-liaison`, meeting notes, updates, decision logs
- `@red-team`, pressure-test completed artifacts

**Rule of thumb**
- Use `/leeward` when you are not sure where to start.
- Use a direct workflow when you already know the job to be done.
- Use a specialist agent when you want one narrow kind of work.

Close by inviting the user to either run `/leeward` with a plain-English task or choose one direct workflow now.
