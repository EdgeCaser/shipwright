# Installing Shipwright

## Complete project install (Claude Code and Codex)

Use Node.js 22+ from a source checkout. The destination must be an existing project directory:

```bash
node "/path/to/shipwright/scripts/install.mjs" "/path/to/your-project"
node "/path/to/shipwright/scripts/install.mjs" "/path/to/your-project" --apply
```

Preview first, then apply. Both hosts receive flat `skills/<name>/SKILL.md` folders plus the docs, agents, commands, schemas and runtime helpers referenced by those skills. The installer does not overwrite root `AGENTS.md`, `CLAUDE.md`, unrelated files or locally changed installed files. It records hashes in `.shipwright-install.json`; conflicts stop the whole update before writes. Retired files are reported, never deleted automatically.

Put project-relative paths or `*` patterns in `.shipwright-ignore` to preserve selected installed files. The installer's check output lists changes, conflicts, exclusions and retired files. An older copy without ownership metadata is treated as unowned: back it up or explicitly exclude conflicts before migrating.

For updates, rerun the two Node commands above from the source checkout. `scripts/sync.sh` is a
Bash compatibility wrapper; it is not the portable update path.

Restart/reload your host to discover skills. In Claude project copies use `/leeward`; a plugin uses the plugin namespace, such as `/leeward:shipwright`. In Codex use the `leeward-concierge` skill or a matching plain-language PM request. Native Claude agent/command registration is host-specific; the Codex concierge executes those workflows in the current session when appropriate.

## Directory/plugin distribution

```text
node "<absolute-source-root>/scripts/build-plugin.mjs" "<new-output-directory>"
```

Build into a new directory. The resulting bundle includes 46 frameworks and two routing/research entry skills, `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, local dependencies and public docs. Package the contents of this folder so manifests are at the plugin root. Use this bundle for submission, not a partial copy of category folders.

The generated flat layout follows the [Codex plugin layout](https://developers.openai.com/plugins/build/plugins) and [Claude conversion guidance](https://developers.openai.com/plugins/guides/submit-claude-plugin). Host activation still needs the observed checks in `docs/shipwright-v2-proof-runbook.md`.

## Other tools

For an agent that can read local Markdown, keep the complete bundle together and ask it to read `skills/<name>/SKILL.md`. Resolve supporting paths from the bundle's `manifest.json`, not the product project's current directory. Automatic discovery and native commands vary by host; they are not guaranteed by plain Markdown compatibility.

The PM frameworks can run without Node. Node is needed for the collector and deterministic validators; if unavailable, follow the documented evidence/tool fallback and explicitly mark automated checks unrun. Do not claim a helper ran when it did not.

## Research without keys

The collector reads no API keys. A query run writes suggested follow-up queries for the host's own web search, and `--url` captures known public pages. Keep the helper's working directory in the user's project while invoking it by its absolute installed path, so evidence packs land there.
