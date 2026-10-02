# Session Handoff

Last updated: 2026-10-02

## Current

Public release remains on hold. The October 1 repairs (`7fa1d48`, `6e93f14`, `ec53084`) made author-written records consistent and did not raise matched Claude semantic scores. L1 through L4 stay deferred. Local `main` is eight commits ahead of `origin/main` and has not been pushed.

On 2026-10-02 three offline checks were added. None is installed or packaged. `scripts/condition-coverage.mjs` matches the later 20 human grades (8 of 8 fails, 0 of 12 passes) and, scored once on the earlier 20, caught 0 of 9. `scripts/constraint-echo.mjs` takes the noun attached to unknown, not established, except, optional, only if, and different, and requires the decision to carry it. Scored once on both archives with no later edit: later set 7 of 8 fails and 12 of 12 passes flagged; earlier set 7 of 9 fails and 10 of 11 passes flagged. `scripts/paraphrase-echo.mjs` judged the 173 quote pairs once, after the rubric was committed. 28 pairs were echo and 145 were drop. The document tallies did not move. Details are in `docs/condition-coverage-2026-10-02.md`. No live rerun was started. Public release remains on hold.

## Done

The original release-audit repair is committed at `38a1138` (baseline `c18e4d7`); the Grok follow-up note is at `3a4ea2c`. The historical audit in `docs/independent-release-audit.md` stays unchanged, as does the Astra record in `docs/astra-redline-review.md`.

Two further adversarial reviews by fresh-context read-only Claude subagents are recorded in `docs/adversarial-review-2026-09-30.md`. Each ran three rounds of findings, repairs and rebuttals. Both stopped at the three-round limit, not by agreement.

- First review (13 findings): pricing attribution, visible-text scanning, confidence parsing, temp-directory leaks. Committed at `30b5d8f` with the Astra repairs and post-review fixes the user asked for: indented code blocks, temp cleanup, test temp-folder leaks.
- Second red-line review (21 findings, all accepted): committed at `2e3bd99`, `3ff74d4`, and the commit carrying this handoff. Highlights: one shared Markdown scanner (`scripts/markdown-scan.mjs`, packaged) for validator and extractor; envelope examples in code no longer break or silently skip contract checks; "$29/month" billing parsing; multi-product pricing labels; decision routing for common price and build-or-buy questions; no internal-tooling references in public code or packaged docs; no em dashes in user-facing output.

The round-3 repairs of the second review (CRLF thematic breaks, inline marker mentions, price-routing modifiers) and two follow-on corrections were verified by the coordinator only.

## Next

Planned work items 1 to 9 are done, in local commits `da2ba01`, `f2e5309`, `1d67c4b`, `2b28af0` and `f59d0c2` (item 7, approved by the user), plus `dist/shipwright` rebuilt at `3ec22c0` (123 files, 48 skills). Live-acceptance follow-ups are `2e719be` (installer writes the behavior rules) and `1793ea6` (no-em-dash rule, `--uninstall`). Details, the third review round (one finding, R1, accepted and fixed) and current limits are in `docs/adversarial-review-2026-09-30.md` under "Planned-work follow-up".

Latest full verification, run before the last commit: 572 tests passed, with none failed, skipped or cancelled. Repository validation reports zero errors (46 skills, seven agents, 17 workflows). `git diff --check` is clean. All 4,113 benchmark output files are unchanged and none were added. The final run added nothing to the system temp folder.

Pushed to `origin/main` on 2026-09-30 (through `5489d02`); CI passes on ubuntu, macos and windows. Before the push, the unpushed commits were rewritten locally to replace internal-tooling wording in four review docs and one commit message; `docs/independent-release-audit.md` was left unchanged at the user's direction and still has two generic mentions. The pre-rewrite history is on local branch `backup/pre-scrub-2026-09-30`. The first push failed macOS CI: every CLI's entry guard silently exited when run through a symlinked path; fixed in `c80236a` and `5489d02`.

User decisions (2026-09-30):
- `docs/astra-redline-review.md` is approved for the public repo.
- No history rewrite. Older internal-tooling wording is already on public `origin/main`; the current tree is clean. Do not force-push.
- Review finding R1 accepted and fixed; no further review rounds.
- Item 7 (value-only PRD metric cells, Source column) approved and done.
- Live acceptance run authorized. Generated output must avoid em dashes (2026-09-30). `--uninstall` approved and added.

Live acceptance, 2026-09-30, run once per host from disposable installs (242 files each) under the session scratch folder, graded with `node scripts/live-acceptance.mjs --check`: Claude Code 2.1.285 passed 4 of 10 (prd-draft, competitive-landscape, coding-question, structured-prd-artifact); codex-cli 0.159.2 passed 0 of 10. What the failures show:
- Neither host produced the labeled decision format (RECOMMENDATION, CONFIDENCE, NEEDS_HUMAN_REVIEW and the rest) for the three "should we" prompts. The decision-routing rules live in the repo's `AGENTS.md`; the installer does not put them in the target project for either host. Codex still named the governance class, low confidence and human review, in prose.
- Closing blocks were often missing on framework prompts from both hosts.
- Every Codex transcript contains em dashes. The "no em dash" condition is the harness's own rule; nothing in the shipped instructions asks generated output to avoid them, so it is a product decision whether to keep it.
- The ambiguous-pricing check is wrong: the prompt is about a vendor contract, yet the check also requires a build-or-buy question. Both hosts asked sensible clarifying questions.
- The Claude sessions loaded the maintainer's global instructions, whose voice rules discourage fronted labels; that confounds the label checks on that host.

Second live run, after `2e719be` (installer writes the behavior rules into a marked block in the target `AGENTS.md` and `CLAUDE.md`; vendor-pricing check fixed): Claude Code passed 10 of 10. Codex met every content condition on all 10 prompts and failed only the em dash check (1 to 5 em dashes per transcript, 20 in total), so it scores 0 of 10 as graded and 10 of 10 on content.

Third Codex run, after `1793ea6` (no-em-dash rule in the installed block, plus `install.mjs --uninstall`): 10 of 10. Uninstall preview and apply on that disposable install removed every installed file and the managed block, kept nothing, refused nothing, and left `.git` and the `.shipwright/research` evidence packs that the Codex sessions wrote by running the research collector.

Block trim and re-runs. The installed block went from 638 to 284 words (`3345b60`); a test holds it under 350. Run 4 on the trimmed block: Codex 10 of 10, Claude 7 of 10 (two decision answers without closing blocks, one verdict on an unclear question). The trim had cut the line that applies closing blocks to decisions, and the old block had quoted the vendor-pricing acceptance prompt word for word as its clarification example, so the earlier Claude 10 of 10 on that check was partly taught to the test. `3ec22c0` restored both rules in general wording (308 words). Run 5: Claude 10 of 10, Codex 9 of 10 (one em dash in one transcript; runs 3 and 4 had none, so one run per version cannot separate this from noise). Claude runs 4 and 5 used `--setting-sources project,local`; whether that excludes the maintainer's global CLAUDE.md was never confirmed.

## Remaining

The September 30 list below is historical. The open release question is the condition check in `docs/condition-coverage-2026-10-02.md`: the plain checker is not accurate enough to block a recommendation, and another wording or reconciliation pass is not the next step.

1. Confirm whether `claude -p --setting-sources project,local` excludes the user-level CLAUDE.md (a one-line probe from the install dir).
2. Acceptance runs once per version; a rate claim (for example em dash slips) needs several runs per host.
3. The acceptance prompts are fixed and known; keep host-instruction wording free of them so passes stay meaningful.
4. Rebuild `dist/shipwright` again if anything packaged changes after `3ec22c0`.

## Working rules learned

- Auto mode blocks this session from spawning nested `claude -p` runs; the user ran the Claude half with the `!` prefix. Codex runs were allowed.

- Parallel subagents in one worktree must never run `git checkout`, `restore` or `stash` for ablation; save and restore their own file copies instead. One reset wiped another agent's edits this session.

## Do not commit

`benchmarks/results/` and `benchmarks/telemetry/` are local run output.

## Constraints

- Public repo. Public code and packaged files must not reference internal, unreleased tooling. No em dashes in shipped skills, commands, README text or user-facing output strings. `docs/structured-artifacts.md` is packaged.
- Keep skill structure: Depth, Minimum Evidence Bar, signature closing blocks, Weak vs. Strong.
- Report test results only after a run. Historical counts in earlier review notes refer to their own trees; use the "Current verification" section of `docs/adversarial-review-2026-09-30.md`.
- Known limits are listed there under "Current limits".
