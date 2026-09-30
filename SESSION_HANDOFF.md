# Session Handoff

Last updated: 2026-09-30

## Done

The original release-audit repair is committed at `38a1138` (baseline `c18e4d7`); the Grok follow-up note is at `3a4ea2c`. The historical audit in `docs/independent-release-audit.md` stays unchanged, as does the Astra record in `docs/astra-redline-review.md`.

Two further adversarial reviews by fresh-context read-only Claude subagents are recorded in `docs/adversarial-review-2026-09-30.md`. Each ran three rounds of findings, repairs and rebuttals. Both stopped at the three-round limit, not by agreement.

- First review (13 findings): pricing attribution, visible-text scanning, confidence parsing, temp-directory leaks. Committed at `30b5d8f` with the Astra repairs and post-review fixes the user asked for: indented code blocks, temp cleanup, test temp-folder leaks.
- Second red-line review (21 findings, all accepted): committed at `2e3bd99`, `3ff74d4`, and the commit carrying this handoff. Highlights: one shared Markdown scanner (`scripts/markdown-scan.mjs`, packaged) for validator and extractor; envelope examples in code no longer break or silently skip contract checks; "$29/month" billing parsing; multi-product pricing labels; decision routing for common price and build-or-buy questions; no internal-tooling references in public code or packaged docs; no em dashes in user-facing output.

The round-3 repairs of the second review (CRLF thematic breaks, inline marker mentions, price-routing modifiers) and two follow-on corrections were verified by the coordinator only.

## Next

Planned work items 1 to 6, 8 and 9 are done, in local commits `da2ba01`, `f2e5309`, `1d67c4b` and `2b28af0`, plus a rebuilt `dist/shipwright` (122 files, 48 skills). Details, the third review round (one finding, R1, accepted and fixed) and current limits are in `docs/adversarial-review-2026-09-30.md` under "Planned-work follow-up".

Latest full verification, run before the last commit: 552 tests passed, with none failed, skipped or cancelled. Repository validation reports zero errors (46 skills, seven agents, 17 workflows). `git diff --check` is clean. All 4,113 benchmark output files are unchanged and none were added. The final run added nothing to the system temp folder.

Nothing is pushed.

User decisions (2026-09-30):
- `docs/astra-redline-review.md` is approved for the public repo.
- No history rewrite. Older internal-tooling wording is already on public `origin/main`; the current tree is clean. Do not force-push.
- Review finding R1 accepted and fixed; no further review rounds.

## Remaining

1. Item 7, only on user approval: require PRD metric cells to hold only the value, with sources in a Source column (breaking contract change).
2. Live Claude and Codex acceptance: `node scripts/live-acceptance.mjs --plan`, then `--check <dir>` on saved transcripts. Running live sessions needs user authorization. See `docs/live-acceptance.md`.
3. Rebuild `dist/shipwright` again if anything packaged changes after `2b28af0`.

## Working rules learned

- Parallel subagents in one worktree must never run `git checkout`, `restore` or `stash` for ablation; save and restore their own file copies instead. One reset wiped another agent's edits this session.

## Do not commit

`benchmarks/results/` and `benchmarks/telemetry/` are local run output.

## Constraints

- Public repo. Public code and packaged files must not reference internal, unreleased tooling. No em dashes in shipped skills, commands, README text or user-facing output strings. `docs/structured-artifacts.md` is packaged.
- Keep skill structure: Depth, Minimum Evidence Bar, signature closing blocks, Weak vs. Strong.
- Report test results only after a run. Historical counts in earlier review notes refer to their own trees; use the "Current verification" section of `docs/adversarial-review-2026-09-30.md`.
- Known limits are listed there under "Current limits".
