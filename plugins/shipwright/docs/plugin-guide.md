# Shipwright Plugin Guide

This directory is a self-contained Shipwright plugin for Claude Code and Codex. It includes the
skills, commands, agents, supporting documentation, and helper scripts those files reference.

## Use the plugin

Reload your host after installing this directory. In Claude Code, use namespaced commands such as
`/shipwright:write-prd` or `/shipwright:start`. In Codex, invoke `shipwright-concierge` or ask a
product-management question in plain language.

Use a direct command when you know the job. Use `/shipwright:start` when you need help choosing a
workflow. The included `README.md` is this guide; source-checkout development commands are not
part of the plugin.

## Run included helpers

When an instruction calls a helper, first find this plugin's root: the nearest ancestor containing
`manifest.json`. Use its absolute path so the command does not depend on the current product
directory. For example:

```text
node "<absolute-shipwright-root>/scripts/validate-artifact.mjs" "<artifact-path>"
node "<absolute-shipwright-root>/scripts/collect-research.mjs" --query "<primary query>" --mode auto
```

The research helper can create evidence packs in the current project and can use configured search
credentials. Read `docs/workflow-contract.md` before running it.

## Source checkout installation and updates

To install Shipwright into another project from a source checkout, use Node.js 22 or newer:

```text
node "<absolute-source-root>/scripts/install.mjs" "<project-path>"
node "<absolute-source-root>/scripts/install.mjs" "<project-path>" --apply
```

The first command previews changes. The second writes the install. Run the same two commands after
updating the source checkout. This Node command is the portable update path for Windows, macOS,
and Linux. `scripts/sync.sh` remains a Bash compatibility wrapper and is not required.

## Package scope

The package intentionally excludes credentials, local installation records, generated run outputs,
and source-only development commands. The source repository and issue tracker are
[github.com/EdgeCaser/shipwright](https://github.com/EdgeCaser/shipwright), as listed in the
plugin manifest metadata.
