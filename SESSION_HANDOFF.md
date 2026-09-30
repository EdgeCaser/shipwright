# Session Handoff

Last updated: 2026-09-29

## Done this session: feature-skill fixes

All four content problems from the review are fixed in the working tree. Ian asked to see the PRD and design-review diffs before the commit, so the commit and push happen after his approval.

1. **Invented quotes.** `skills/execution/prd-development/SKILL.md` Quote from Leadership and Customer Quote now require a real sourced quote with date, or `[TBD, requires: ...]`. A rule above the template says the launch is imagined but the quotes are not. Two new Common Mistakes entries.
2. **Manufactured findings.** `skills/technical/design-review/SKILL.md` Step 2 has two rules: cite what you checked, and mark perspectives with no real input `Not assessed` rather than simulating them. A paragraph says that one model running seven perspectives produces correlated views. Each perspective gained a `Checked against` line and `Not assessed` as a verdict option. The Synthesis gained a Coverage block. Overall Verdict table gained a third column. Pass/Fail fails any Green that cites nothing. The two Common Mistakes that pushed toward manufactured Yellows and simulated Legal are replaced.
3. **Blind tech spec.** `commands/tech-handoff.md` gained Step 2 "Ground in the Codebase" (steps renumbered to 6). `skills/technical/technical-spec/SKILL.md` gained a Codebase Notes block in Step 1, a read-before-you-design rule, a new Insufficient Evidence sentence, a FAIL condition, and a Common Mistakes entry.
4. **UX placeholder.** PRD section 5 now asks for key flows plus per-screen empty, loading, error, no-permission and success states, and points to design as the next step when UI work has no mockups.

Also: version bumped 2.0.0 to 2.3.0 in `.claude-plugin/plugin.json` and `marketplace.json` (CHANGELOG was already at 2.2.0), CHANGELOG entry added.

Checks run: `bash scripts/validate.sh` all pass; `node --test tests/*.test.mjs` 377 pass. No em dashes in touched files. No benchmark scenario covers these three skills directly, so no benchmark run applies.

## Left

- Commit and push after Ian approves the PRD and design-review wording.
- `examples/golden-outputs/prd.md` still has a Customer Quote with no source line. It is a synthetic example for a fictional company, so it does not violate the new rule in spirit, but it no longer models the template. Optional follow-up: add a source line to it.
- The same fixes are ported and committed in Ian's other copy.

## Constraints for this repo

- Public repo. No references to private tooling or private repos anywhere (skills, README, docs, commit messages); Ian's global instructions list what's off-limits. No em dashes in any shipped skill, command or README text.
- Keep Shipwright skill structure intact: Depth table, Minimum Evidence Bar, Shipwright Signature closing blocks, Weak vs. Strong examples.
- Run any existing benchmark/validation scripts that cover these skills after editing, and report results honestly.

## Notes

- `.claude/` is already gitignored here. Four detached Cursor worktrees exist under `~/.cursor/worktrees/shipwright/`; they are old and not part of this work.
