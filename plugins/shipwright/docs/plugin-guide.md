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

Read `docs/workflow-contract.md` before running the research helper.

## Network access and credentials

Skills, commands, agents and every helper other than the research collector work offline. The
research collector, `scripts/collect-research.mjs`, runs only when an instruction or the user calls
it, and it makes these requests:

- If `BRAVE_SEARCH_API_KEY` is set, it sends the search query and that key to the Brave Search API
  (`api.search.brave.com`).
- If `TAVILY_API_KEY` is set, it sends the search query and that key to the Tavily API
  (`api.tavily.com`).
- It downloads the public pages those searches return, and any page passed with `--url`.
- For a crates.io package page, it also reads that crate's public record from the crates.io API.

The collector reads the two keys from the environment or from a `.env` file in the current
directory, and sends each key only to its own provider. With neither key set it makes no search
requests and writes a fallback pack listing follow-up queries. Evidence packs are written to
`.shipwright/research/` in the current project. Nothing is sent to the Shipwright maintainers, and
the plugin collects no telemetry.

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
