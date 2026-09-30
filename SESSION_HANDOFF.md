# Session Handoff

Last updated: 2026-09-29

## Open work: feature-skill fixes

A review of the feature-design skills (`prd-development`, `design-review`, `/tech-handoff`) turned up four content problems. Fix them here first; Ian has other copies to port to afterward.

1. **PRD template asks for invented quotes.** `skills/execution/prd-development/SKILL.md:55` (Quote from Leadership) and `:61` (Customer Quote, "a fictional happy customer"). This contradicts `AGENTS.md:154` ("Do not invent customer quotes") and the skill's own Minimum Evidence Bar. Invented quotes also get lifted into decks later. Either require a real sourced quote with a `[TBD, requires: ...]` fallback, or drop both sections.
2. **Design review pushes the model to manufacture findings.** `skills/technical/design-review/SKILL.md:292` says all-green verdicts mean the review wasn't rigorous, and `:295` says to simulate the legal perspective when there is no legal team. With one model playing seven reviewers, these produce plausible invented concerns and invented compliance findings. Suggested direction: an all-green result must cite what was checked; perspectives with no real input get marked "not assessed" rather than simulated. Also consider saying plainly that the seven perspectives are one model's views and are correlated.
3. **`/tech-handoff` never looks at the codebase.** `commands/tech-handoff.md` goes PRD, tech spec, design review, epics, stories with no step that reads the target repo. Architecture, data model and API contracts get written blind. Add a step before the tech spec: if a codebase is available, read the relevant modules and ground the spec in existing patterns; if not, label architecture sections as hypotheses. Check `skills/technical/technical-spec/SKILL.md` for the same gap.
4. **UX is a placeholder.** PRD section 5 is essentially "[Link to designs]". No skill produces flows or screen states. Minimum fix: section 5 asks for key flows plus empty, loading, error and permission states per screen, and the Recommended Next Artifact can point to a design or UI step when there is UI work.

## Also do

- Bump `version` in `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` (both still `2.0.0`). Claude Code only refreshes a plugin cache when the version changes, which is why Ian's installed copy is stuck on July content.

## Constraints for this repo

- Public repo. No references to private tooling or private repos anywhere (skills, README, docs, commit messages); Ian's global instructions list what's off-limits. No em dashes in any shipped skill, command or README text.
- Keep Shipwright skill structure intact: Depth table, Minimum Evidence Bar, Shipwright Signature closing blocks, Weak vs. Strong examples.
- Run any existing benchmark/validation scripts that cover these skills after editing, and report results honestly.

## Notes

- `.claude/` is already gitignored here. Four detached Cursor worktrees exist under `~/.cursor/worktrees/shipwright/`; they are old and not part of this work.
