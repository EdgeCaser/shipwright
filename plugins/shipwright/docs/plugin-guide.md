# Leeward Plugin Guide

This directory is a self-contained Leeward plugin for Claude Code and Codex. It includes the
skills, commands, agents, supporting documentation, and helper scripts those files reference.

## Use the plugin

Reload your host after installing this directory. In Claude Code, use namespaced commands such as
`/leeward:write-prd` or `/leeward:start`. In Codex, invoke `leeward-concierge` or ask a
product-management question in plain language.

Use a direct command when you know the job. Use `/leeward:start` when you need help choosing a
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

Read `docs/workflow-contract.md` before running the research helper.

## Network access

Skills, commands, agents and every helper other than the research collector work offline. The
research collector, `scripts/collect-research.mjs`, runs only when an instruction or the user calls
it. It reads no API keys and calls no search API. It makes these requests:

- It downloads any public page passed with `--url`.
- For a crates.io package page, it also reads that crate's public record from the crates.io API.

A query without `--url` makes no network request; it writes a fallback pack listing follow-up
queries for the host's own web search. Evidence packs are written to `.shipwright/research/` in
the current project. Nothing is sent to the Leeward maintainers, and the plugin collects no
telemetry.

## Source checkout installation and updates

To install Leeward into another project from a source checkout, use Node.js 22 or newer:

```text
node "<absolute-source-root>/scripts/install.mjs" "<project-path>"
node "<absolute-source-root>/scripts/install.mjs" "<project-path>" --apply
```

The first command previews changes. The second writes the install. Run the same two commands after
updating the source checkout. This Node command is the portable update path for Windows, macOS,
and Linux. `scripts/sync.sh` remains a Bash compatibility wrapper and is not required.

## Package scope

The package intentionally excludes credentials, local installation records, generated run outputs,
and source-only development commands. Leeward was first developed under the name Shipwright, which the repository still uses. The source repository and issue tracker are
[github.com/EdgeCaser/shipwright](https://github.com/EdgeCaser/shipwright), as listed in the
plugin manifest metadata.
