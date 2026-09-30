# Session Handoff

Last updated: 2026-09-30

## Done

The original release-audit repair is committed at `38a1138` (baseline `c18e4d7`); the Grok follow-up note is at `3a4ea2c`. The historical audit in `docs/independent-release-audit.md` stays unchanged, as does the Astra record in `docs/astra-redline-review.md`.

Two further adversarial reviews by fresh-context read-only Claude subagents are recorded in `docs/adversarial-review-2026-09-30.md`. Each ran three rounds of findings, repairs and rebuttals. Both stopped at the three-round limit, not by agreement.

- First review (13 findings): pricing attribution, visible-text scanning, confidence parsing, temp-directory leaks. Committed at `30b5d8f` with the Astra repairs and post-review fixes the user asked for: indented code blocks, temp cleanup, test temp-folder leaks.
- Second red-line review (21 findings, all accepted): committed at `2e3bd99`, `3ff74d4`, and the commit carrying this handoff. Highlights: one shared Markdown scanner (`scripts/markdown-scan.mjs`, packaged) for validator and extractor; envelope examples in code no longer break or silently skip contract checks; "$29/month" billing parsing; multi-product pricing labels; decision routing for common price and build-or-buy questions; no internal-tooling references in public code or packaged docs; no em dashes in user-facing output.

The round-3 repairs of the second review (CRLF thematic breaks, inline marker mentions, price-routing modifiers) and two follow-on corrections were verified by the coordinator only.

## Next

Latest full verification, run before the last commit: 522 tests passed, with none failed, skipped or cancelled. Repository validation reports zero errors (46 skills, seven agents, 17 workflows). `git diff --check` is clean. All 4,113 benchmark output files are unchanged, none were added, and the run added nothing to the system temp folder.

Nothing is pushed.

User decisions (2026-09-30):
- `docs/astra-redline-review.md` is approved for the public repo.
- No history rewrite. Older internal-tooling wording is already on public `origin/main`; the current tree is clean. Do not force-push.
- Rebuild `dist/shipwright` only after all planned changes below are done.

## Planned work, in order

1. Sweep em dashes from developer tooling output (`scripts/run-fast-batch.mjs`, `scripts/telemetry.mjs` progress lines and placeholders); add a source test like the orchestrate one.
2. Make the documented full-suite command capture a TAP report, so a recurrence of the unexplained abort leaves a diagnostic.
3. Mask inline code spans before the inline-comment pass in `scripts/markdown-scan.mjs` `visibleMarkdown` (visible text only; block comments and the envelope are already classified by the line scan).
4. When envelope JSON fails to parse and the block contains an early `-->`, report that cause and the `--\u003e` escape instead of the raw JSON error.
5. One focused independent review round covering the diff from `3ff74d4` to the end of items 1-4.
6. Routing: a table-driven phrase corpus test (about 50 positive and negative questions), and a fallback so a "should we" question that mentions pricing or build versus buy but matches no decision class gets MEDIUM confidence and a clarification hint.
7. Optional, only on user approval: require PRD metric cells to hold only the value, with sources in a Source column (breaking contract change).
8. Live Claude and Codex acceptance: write a script (disposable install, about ten prompts, written pass conditions); running it needs user authorization for live sessions.
9. Rebuild `dist/shipwright`.

## Do not commit

`benchmarks/results/` and `benchmarks/telemetry/` are local run output.

## Constraints

- Public repo. Public code and packaged files must not reference internal, unreleased tooling. No em dashes in shipped skills, commands, README text or user-facing output strings. `docs/structured-artifacts.md` is packaged.
- Keep skill structure: Depth, Minimum Evidence Bar, signature closing blocks, Weak vs. Strong.
- Report test results only after a run. Historical counts in earlier review notes refer to their own trees; use the "Current verification" section of `docs/adversarial-review-2026-09-30.md`.
- Known limits are listed there under "Current limits".
