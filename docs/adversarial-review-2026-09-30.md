# Adversarial review, 2026-09-30

Starting point: commit `3a4ea2c` plus the uncommitted Astra red-line repairs recorded in [astra-redline-review.md](astra-redline-review.md). That record and [independent-release-audit.md](independent-release-audit.md) stay unchanged as history.

The reviewer was a fresh-context Claude subagent with read-only access to the repository. It wrote probes only to a scratch directory and ran only targeted test files. It never saw the coordinator's conclusions before reporting. The coordinator reproduced every finding with the reviewer's probes before accepting or rejecting it, implemented all repairs, and ran the full suite.

**Outcome: stopped at the three-round limit, not by agreement.** Round 3 ended with two new P3 findings (C-01, C-02). Both were repaired and ablation-tested after the reviewer's last report. They have not had an independent re-review.

## Baseline, verified before any change

| Check | Result |
|---|---|
| `node --test --test-concurrency=1 tests/*.test.mjs` | 488 passed, 0 failed, 0 skipped |
| `node scripts/validate-repository.mjs` | 0 errors; 46 skills, 7 agents, 17 workflows |
| SHA-256 of `benchmarks/results/` and `benchmarks/telemetry/` | 4,113 files, unchanged by the suite, none added |

The reported 488 and zero-error figures held.

## Round 1

Seven confirmed findings. The round-3 unnamed-product repair from the previous review was the reviewer's first target.

| ID | Sev | Finding | Disposition |
|---|---|---|---|
| A-01 | P2 | Text-extracted prices carry no product identity. `pricing-diff` labelled them with the pack's product, including a product named on a different domain: a price from alpha.example rendered as `| Gamma | Enterprise | $99 |`. The unnamed-product class from round 3 of the Astra review was still reachable through the common no-JSON-LD path. | Accepted. Tuples carry `source_url`; a shared `pricingProductLabel` in `scripts/pricing-tuples.mjs` decides labels for both renderers. |
| A-02 | P3 | An inline `` `<!--` `` in a code span ran to end of document, silently dropping all later citation warnings. | Accepted. Only a line-start comment may run unclosed to end of document. |
| A-03 | P3 | A contract inside a fence nested in a list item, or inside a four-space indented code block, still satisfied the visible checks. | Partly accepted. Indented fences are recognized. Indented code blocks are not; blanking indented lines would also hide nested-list prose. `docs/structured-artifacts.md` now says so. Reviewer agreed. |
| A-04 | P3 | `Confidence: high, because no segment-level baseline exists yet.` failed as a contradiction because any `no`/`not` in the line failed. | Accepted. Only a level immediately negated (`high not`, `high is not`) fails; a leading `not high` still fails. |
| A-05 | P3 | A contradicting number inside descriptive citation text, such as `42 [baseline was 142](url)`, is dropped from metric comparison. | **Rejected.** See rebuttal below. Reviewer accepted. |
| A-06 | P3 | Every session-driven Fast run leaked an empty `shipwright-session-*` directory in the system temp folder. | Accepted. The coordinator found the same leak on the Codex output path in `run-fast-analysis.mjs` and fixed both. |
| A-07 | P3 | `buildPricingDiff` threw on a `null` fact. | Accepted. Non-object facts are skipped. |

**A-05 rebuttal.** An existing contract test requires `42 [audit 2026](url)` and `42 (source: audit-2026)` to pass. Citation text routinely contains years, report numbers and page numbers. Counting digit-bearing citation text as a measurement would turn ordinary citations into contract errors with exit code 1. Distinguishing "baseline was 142" from "Q1 2026 benchmark" is the semantic comparison the contract already disclaims. The displayed value is still compared exactly: `142 [42](url)` and `[142](url)` fail. The reviewer could not produce a rule that separates the cases without new false errors, and accepted this as a known limit.

**Declined optional items**, which the reviewer agreed are not contract violations: collapsing duplicate JSON-LD rows (it would merge distinct unnamed products that share an offer), pipe escaping in comparison cells (pre-existing), `'0.00'` free-tier detection (hand-written facts only), legacy sessions saved without `pending_follow_up`, and inconsistent evidence formatting in prompts.

**Release hygiene, R-01.** `scripts/pricing-tuples.mjs`, `tests/helpers/`, `tests/pricing-tuples.test.mjs`, `tests/redline-session.test.mjs` and the review records are untracked. Tracked files import `pricing-tuples.mjs`, so a `git commit -a` would produce a tree whose formatter, comparison and plugin build fail on import. Stage those files explicitly when committing.

A coordinator-found regression during round 1: the first A-01 rule broke the existing `does not imply USD when currency is missing` test, which expects a product named on the price's own page to label that price. The rule was narrowed before the reviewer's round 2.

## Round 2

The reviewer verified A-04, A-06 (including backslash, trailing-slash, forward-slash, lowercase-drive and `..` TEMP forms) and A-07. It accepted both rebuttals. Four new counterexamples, all confirmed and accepted:

| ID | Finding | Repair |
|---|---|---|
| B-01 | A code-span `<!--` still paired with any later `-->`. A correct PRD fixture with one such sentence failed with 9 `prose-json-mismatch` errors because the opener paired with the envelope's closer. This predates the A-02 change. | An inline comment must close before a blank line. The coordinator then found and fixed a CRLF gap in that guard (`\r?\n`). |
| B-02 | A fence opened on the bullet line itself (`- ```markdown`) still counted as visible. | Fence openers accept a list marker. |
| B-03 | A text price inheriting the page's single product got a different free-tier key from that product's JSON-LD rows, so one product showed both `Yes` and `No`. | Free-tier grouping keys on the displayed label; only `Unnamed product` keeps per-product IDs. |
| B-04 | A page-title identity (`product`/`company` facts) still labelled prices from a different host. | Same-source naming also uses page-derived `product` facts; the pack fallback needs every price on the tuple's host. |

A side effect caught by the coordinator: the page-title rule made the formatter print `Alpha / Starter` under an `Alpha` heading for ordinary single-page packs. The formatter now omits a product label equal to its group heading.

## Round 3

The reviewer confirmed B-01 through B-04 with LF and CRLF inputs and re-ran every earlier probe with no regression. It found that the label suppression hid no real distinction. Two new P3 findings, both reproduced and accepted:

| ID | Finding | Repair, not independently re-reviewed |
|---|---|---|
| C-01 | The pack fallback could still come from a host with no prices: title "Alpha" on alpha.example labelled the only price, which was on reviews.example, as Alpha. The two renderers disagreed. | The fallback also requires every `product_name`, `product` and `company` fact to share the tuple's host. |
| C-02 | A line-start `<!--` inside a fenced code example hid the rest of the document, because comments were stripped before fences were found. A correct artifact preceded by such an example failed with exit code 1. | `visibleMarkdown` is one line scan: whichever block starts first wins, so `<!--` in a fence is code and a fence marker in a comment is hidden. Inline comments are stripped afterwards. |

## Regression coverage

Every accepted repair has a test that was ablation-checked: with the fix reverted, the test fails; with it restored, the test passes. The ablations covered the label rule, the single-host and identity-host fallback conditions, the page-title rule, the free-tier key, the null-fact guard, the temp-directory cleanup, the comment regex, the CRLF guard, the list-marker fence opener, the confidence negation rule and the single-scan structure. Two scripted ablations silently failed to apply at first and were redone until the target test failed.

The suite grew from 488 to 501 tests during the review. Nine are new test functions across `tests/audit-validation.test.mjs`, `tests/pricing-tuples.test.mjs` and `tests/redline-session.test.mjs`. Four are new cases in existing parameterized loops: two confidence contradictions and two hidden-fence forms.

## Verification at the end of the first review

| Check | Result |
|---|---|
| Full suite | 501 passed, 0 failed, 0 skipped, 0 cancelled |
| Repository validation | 0 errors; 46 skills, 7 agents, 17 workflows |
| `git diff --check` | clean |
| Benchmark fingerprints after the final full run | 4,113 files, identical hashes, none added |
| Working-tree file status | same file set as at start, plus this record |

The fingerprint check was also run after each intermediate full-suite run, with the same result. No live model or search provider, credential, real-project installation, publication, commit or push was used.

## Limits at the end of the first review

- The C-01 and C-02 repairs were verified by the coordinator only. The reviewer did review and confirm the coordinator's CRLF fix during round 3.
- Metric citation text containing numbers is treated as citation, not measurement (A-05).
- A structured envelope whose JSON contains `-->` ends early; `docs/structured-artifacts.md` now tells producers to write `->` or escape it as `--\u003e`.
- A code-span `<!--` whose `-->` falls in the same paragraph hides that paragraph's remaining text.
- Deterministic tests do not establish live Claude or Codex host behavior; that acceptance pass is still separate.

## After the review, at the user's request

- **Indented code blocks.** The user judged the A-03 limit worth fixing. Outside a list, a block indented four spaces or a tab after a blank line or heading is now treated as code, as Markdown renders it. Inside a list, indentation continues the item and stays visible. Regressions cover both; each half fails when ablated.
- **Temp folder cleanup.** The 1,637 empty `shipwright-session-*` and `shipwright-fast-*` folders left before the A-06 fix were removed with a non-recursive delete.
- **More test leaks.** A temp-folder audit showed four test files (`run-benchmarks`, `prepare-blind-review`, `compile-blind-review`, `generate-proof-pack`) leaving fixture folders on every run. They now use `tests/helpers/temp-dirs.mjs`, which removes its folders when the test process exits. A full run now adds no entries to the system temp folder. The 1,392 leftover folders with those four prefixes were deleted; no script, skill or command creates those prefixes.
- **One unexplained suite abort.** One full run stopped after four tests in the first file, `archive-generated-outputs`, with exit code 1 and no error text. Five later full runs passed completely. It has not been reproduced.

These changes went to the second red-line review below.

# Second red-line review

At the user's request, a new fresh-context Claude subagent reviewed the whole repository at `30b5d8f`, read-only, under the same rules. The coordinator reproduced every finding before deciding on it. Each round's repairs were committed after a full passing run: `2e3bd99`, `3ff74d4`, and the commit that carries this section.

**Outcome: stopped at the three-round limit, not by agreement.** Round 3 reported three P3 findings, all accepted and repaired after the reviewer's last report. Those repairs, and a regression the existing suite caught while making them, have had no independent re-review.

## Round 1: 14 findings, all accepted

| ID | Sev | Finding | Repair |
|---|---|---|---|
| D-01 | P3 | With no identity facts, the pack label came from the first fact's host, so a price on alpha.example showed as reviews.example. | The fallback needs at least one identity fact; otherwise the price's own host labels it. |
| D-02 | P2 | Two page titles on one host named two products; a third, untitled page's price took the first product's name. | The fallback needs exactly one distinct product and company on the price's host. Identity headings join several products instead of picking the first. |
| D-03 | P2 | `$29/month`, `/mo`, `/year` and ` / month` lost their billing period and dropped to medium confidence. Pre-existing. | The slash form no longer needs a word boundary. |
| D-04 | P3 | A fence closer indented four or more spaces ended a column-0 fence. | A closer counts only within three columns of its container. |
| D-05 | P3 | A list followed by a heading, or a `* * *` break, left list state on, so real indented code counted as visible. | Headings and breaks end lists; a break is not a list marker. |
| D-06 | P3 | A line starting with ```` ``` ```` in prose, an inline span, silently dropped all later citation warnings. | The citation splitter trusts already-visible text. |
| D-07 | P3 | Two hidden-content test halves passed whether or not the feature existed. A visible requirements heading indented one to three spaces caused a false NOT READY. | Tests assert on the scanner directly. The readiness heading allows up to three spaces. |
| D-08 | P3 | The packaged doc's escape for an arrow had been written as a literal arrow by the coordinator's edit tool, so following it produced invalid JSON. | Correct escape, and a test that follows the doc's own text. |
| D-09 | P3 | A fenced example of the envelope made a correct artifact invalid, under a misleading "invalid JSON" message. | Markers inside code are ignored; the message says the block is unusable. |
| D-10 | P3 | The handoff was stale at `30b5d8f`. | Refreshed below and in `SESSION_HANDOFF.md`. |
| D-11 | P3 | "Raise the price of the Pro plan", "increase our prices" and "build or buy" missed decision routing. | Wider verb and build-or-buy patterns. |
| D-12 | Improvement | Pricing and facts output, which artifacts cite, used em dashes. | Hyphens, colons and full stops. |
| D-13 | P3, policy | Public code, tests and a packaged doc described internal, unreleased tooling. | Reworded to describe Rigor Mode as not included. Historical audit and review records were left as written. Git history still contains the old wording; removing it would need a history rewrite and force push. |
| D-14 | Improvement | The validator CLI took a flag's value as the file path. | Values of known flags are skipped. |

## Round 2: 4 findings, all accepted

The reviewer answered two coordinator questions. User-facing decision explanations fall under the em-dash rule; batch progress lines and telemetry placeholders are developer tooling and do not. The fence-base approximation has no reachable effect on closers.

| ID | Sev | Finding | Repair |
|---|---|---|---|
| E-01 | P2 | Regression from D-09. The envelope mask used its own fence rules, so some code examples before the envelope hid it. With default flags, a contradicting artifact then passed with exit 0. | One shared scanner, `scripts/markdown-scan.mjs` (packaged), classifies lines for both the validator and the extractor. An envelope found only inside code now produces a warning. |
| E-02 | P3 | Regression from D-05. A heading or break nested in a list item hid the item's text. | Only a column-0 heading or break ends a list. |
| E-03 | P3 | Regression from D-11. "Change the pricing page headline" and similar questions routed as price decisions. | Page, copy and announcement words are excluded; the noun form needs a decision verb. |
| E-04 | Improvement | Seven decision explanations shown to users used em dashes, two with the "not just X" construction. | Rewritten; a source test guards it. |

## Round 3: 3 findings, all accepted, repaired without re-review

| ID | Sev | Finding | Repair |
|---|---|---|---|
| F-01 | P3 | CRLF input defeated the D-05 thematic-break rule. | The scanner classifies each line without its trailing carriage return. |
| F-02 | P3 | An inline-code mention of the envelope marker made a correct artifact invalid. Pre-existing. | A marker counts only at line start or directly after another comment's closer. The contract doc now says the envelope starts its own line. |
| F-03 | P3 | "Raise the Pro plan price", "raise Pro prices" and similar phrasings missed decision routing. | Up to three modifiers may precede the noun. |

The first F-02 repair accepted markers only at line start. The existing contract test for duplicate envelopes then failed, because `--><!-- shipwright:artifact` on one line went uncounted. Markdown treats text after a comment's closer as HTML, so the rule now also accepts a marker directly after `-->`. While widening F-03, the coordinator found two new false positives, "change who owns pricing" and "reduce time spent on pricing", and excluded connective and effort words from the modifier slot. Both are covered by tests.

## Regression coverage, second review

Every accepted code repair has a test that fails when the repair is reverted. The coordinator ran 22 ablations across the three rounds. Two scripted ablations were mangled by shell quoting at first and were redone from script files until the target test failed. Each commit was preceded by a full run with the TAP reporter enabled.

# Planned-work follow-up

Items 1 to 6, 8 and 9 of the plan in `SESSION_HANDOFF.md` were done in five local commits. Item 7 (value-only PRD metric cells with a Source column) was approved later and landed in `f59d0c2` with 4 new tests and one rewritten; they fail against the previous validator.

| Batch | Commit | Work | Tests added |
|---|---|---|---|
| A | `da2ba01` | Tooling em dashes removed (10 output strings in `run-fast-batch.mjs` and `telemetry.mjs`); README and CONTRIBUTING suite command writes a TAP report; `visibleMarkdown` skips inline code spans before removing inline comments; a broken envelope with an early `-->` names that cause and the escape | 13 |
| B | `f2e5309` | Review finding R1, below | 2 |
| C | `1d67c4b` | 51-row routing corpus (30 decision, 21 not); "buy vs build", "buy or build" and hyphenated forms now route; a "should we" question about pricing or build-or-buy that matches no class gets MEDIUM and a clarification hint | 3 |
| D | `2b28af0` | `scripts/live-acceptance.mjs` and `docs/live-acceptance.md`: ten prompts with written pass conditions, offline grading of saved transcripts; no live session was run. Not packaged | 12 |
| E | none | `dist/shipwright` rebuilt from `2b28af0` (122 files, 48 skills; `markdown-scan.mjs` present) | 0 |

Every code change has a test that fails when the change is reverted: ten ablation runs, all from script files. One caveat: of the four code-span tests, only the one with a whole comment inside a span fails on the old scanner; the other three are guards that already passed.

During batch A, seven files were reset to `HEAD` at once, apparently by the item 1 subagent, which then re-applied only its own edits. That wiped the item 3 and item 4 edits. They were restored from the item 4 agent's saved copies, the lost tests were re-added and re-ablated, and later briefs forbade `git checkout`, `restore` and `stash`.

## Third review round, `3ff74d4..da2ba01`

One fresh read-only reviewer, one round, scoped to `git diff 3ff74d4..da2ba01`. It reported one reproduced finding and checked code-span masking, the envelope lookbehind, pricing routing, em dashes in output strings and internal-tooling references without finding a defect.

- R1 (low, accepted, fixed in `f2e5309`): a malformed envelope was blamed on an early `-->` whenever unrelated prose with `-->` followed it. Reproduction: `<!-- shipwright:artifact` then `{"a":1,}` then `-->` on its own line, then `prose --> here`. The early-close cause now applies only when the closer that ended the block follows JSON text on the same line. Both new tests fail on the previous code.

The reviewer did not re-check the ablations; the coordinator's record above covers them.

## Current verification

| Check | Result |
|---|---|
| Full suite | 556 passed, 0 failed, 0 skipped, 0 cancelled |
| Repository validation | 0 errors; 46 skills, 7 agents, 17 workflows |
| `git diff --check` | clean |
| Benchmark results and telemetry | 4,113 files, identical hashes, none added |
| System temp folder | no entries added by the batch D and final runs; batch B and C runs coincided with empty GUID-named `.tmp` files that also appear between runs and match no code in the repo |
| Plugin bundle `dist/shipwright` | rebuilt at `f59d0c2`: 122 files, 48 skills |

The unexplained suite abort from the first review did not recur. The documented suite command now writes a TAP file, so a recurrence leaves a record of the last test that started.

## Current limits

- Round-3 repairs (F-01, F-02, F-03) of the second review and the two follow-on corrections were verified by the coordinator only.
- A-05 is closed by item 7 (`f59d0c2`, approved breaking change): PRD metric tables need a Source column and value cells hold only a value or placeholder. A citation-like word after a number ("40 Gartner") still passes as a unit; "40% per Gartner" is rejected.
- Routing is keyword-based. The corpus covers 51 phrasings, not every paraphrase. The clarification fallback is literal: "Should we update the pricing page?" also gets the hint.
- Live acceptance ran once per host: Claude 4 of 10, Codex 0 of 10. Details and causes are in `SESSION_HANDOFF.md`; the largest gap is that installed projects do not receive the decision-routing rules.

The user's decisions on these limits are in `SESSION_HANDOFF.md`.
