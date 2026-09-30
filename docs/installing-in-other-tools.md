# Installing Shipwright

## Complete project install (Claude Code and Codex)

Use Node.js 22+ from a source checkout. The destination must be an existing project directory:

```bash
node /path/to/shipwright/scripts/install.mjs /path/to/your-project
node /path/to/shipwright/scripts/install.mjs /path/to/your-project --apply
```

Preview first, then apply. Both hosts receive flat `skills/<name>/SKILL.md` folders plus the docs, agents, commands, schemas and runtime helpers referenced by those skills. The installer does not overwrite root `AGENTS.md`, `CLAUDE.md`, unrelated files or locally changed installed files. It records hashes in `.shipwright-install.json`; conflicts stop the whole update before writes. Retired files are reported, never deleted automatically.

Put project-relative paths or `*` patterns in `.shipwright-ignore` to preserve selected installed files. The installer's check output lists changes, conflicts, exclusions and retired files. An older copy without ownership metadata is treated as unowned: back it up or explicitly exclude conflicts before migrating.

`bash scripts/sync.sh --install PROJECT` remains a compatibility wrapper. The installed `bash shipwright-sync.sh` checks for updates, and `--yes` applies them. It reads the saved source checkout path; it does not pull Git changes or contact a service.

Restart/reload your host to discover skills. In Claude project copies use `/shipwright`; a plugin uses the plugin namespace, such as `/shipwright:shipwright`. In Codex use the `shipwright-concierge` skill or a matching plain-language PM request. Native Claude agent/command registration is host-specific; the Codex concierge executes those workflows in the current session when appropriate.

## Directory/plugin distribution

```bash
node scripts/build-plugin.mjs dist/shipwright
```

Build into a new directory. The resulting bundle includes 46 frameworks and two routing/research entry skills, `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, local dependencies and public docs. Package the contents of this folder so manifests are at the plugin root. Use this bundle for submission, not a partial copy of category folders.

The generated flat layout follows the [Codex plugin layout](https://developers.openai.com/plugins/build/plugins) and [Claude conversion guidance](https://developers.openai.com/plugins/guides/submit-claude-plugin). Host activation still needs the observed checks in `docs/shipwright-v2-proof-runbook.md`.

## Other tools

For an agent that can read local Markdown, keep the complete bundle together and ask it to read `skills/<name>/SKILL.md`. Resolve supporting paths from the bundle's `manifest.json`, not the product project's current directory. Automatic discovery and native commands vary by host; they are not guaranteed by plain Markdown compatibility.

The PM frameworks can run without Node. Node is needed for the collector and deterministic validators; if unavailable, follow the documented evidence/tool fallback and explicitly mark automated checks unrun. Do not claim a helper ran when it did not.

## Research credentials

The collector uses supported keys from the environment or the user's project `.env`. Keep the helper's working directory in that project while invoking the helper by its absolute installed path. Never include credentials in a release bundle or display them in an artifact. Missing keys allow a bounded interactive-research fallback.
