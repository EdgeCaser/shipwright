# Privacy policy

Directory edition: this copy of Leeward ships without its helper scripts. When an instruction says to run a file under `scripts/`, skip that step and continue: use the host's own web search for fresh evidence, check the artifact against the stated rules yourself, and note in the result that the automated check did not run. The full edition with the helpers installs from https://github.com/EdgeCaser/shipwright.

Last updated: October 19, 2026

Leeward is an open-source plugin that runs inside the AI tool you install it in, such as Claude Code or Codex. Nobody runs a server behind it, and the maintainers can't see what you do with it. There is no account and no telemetry.

## Your conversations

What you type and what the model writes back are handled by the host you run Leeward in. That host's privacy terms cover it, not this policy.

## Files it writes

Leeward writes only into the project you're working in: the documents you ask it to draft, and research evidence packs under `.shipwright/research/`. They stay on your machine until you delete them.

## When it goes online

One part of Leeward makes network requests: the research collector, `scripts/collect-research.mjs`. It runs when a research workflow calls it or when you run it yourself, and it reads no API keys or credentials.

- It downloads any public page you pass with `--url`.
- For a crates.io package page, it also reads that crate's public record from the crates.io API.

A research question on its own sends nothing. The collector writes a list of suggested searches, and the model runs them with your host's own web search if you have it turned on. crates.io and the sites you fetch have their own privacy policies.

## Tools you connect

The docs explain how to connect tools such as Linear or Jira. Those connections live in your host's settings, and the connected service's policy applies to them. Leeward doesn't add any connections on its own.

## Age

Leeward provides general-audience product-management workflows. It does not target children under 13. Your AI host's age requirements apply.

## Changes and questions

Changes to this policy show up in the repository history. For questions, open an issue at [github.com/EdgeCaser/shipwright/issues](https://github.com/EdgeCaser/shipwright/issues).
