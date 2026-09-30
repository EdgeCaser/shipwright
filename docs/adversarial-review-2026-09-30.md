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

## Final verification

| Check | Result |
|---|---|
| Full suite | 501 passed, 0 failed, 0 skipped, 0 cancelled |
| Repository validation | 0 errors; 46 skills, 7 agents, 17 workflows |
| `git diff --check` | clean |
| Benchmark fingerprints after the final full run | 4,113 files, identical hashes, none added |
| Working-tree file status | same file set as at start, plus this record |

The fingerprint check was also run after each intermediate full-suite run, with the same result. No live model or search provider, credential, real-project installation, publication, commit or push was used.

## Remaining limits

- The C-01 and C-02 repairs were verified by the coordinator only. The reviewer did review and confirm the coordinator's CRLF fix during round 3.
- Metric citation text containing numbers is treated as citation, not measurement (A-05).
- A structured envelope whose JSON contains `-->` ends early; `docs/structured-artifacts.md` now tells producers to write `->` or escape it as `-->`.
- A code-span `<!--` whose `-->` falls in the same paragraph hides that paragraph's remaining text.
- Deterministic tests do not establish live Claude or Codex host behavior; that acceptance pass is still separate.

## After the review, at the user's request

- **Indented code blocks.** The user judged the A-03 limit worth fixing. Outside a list, a block indented four spaces or a tab after a blank line or heading is now treated as code, as Markdown renders it. Inside a list, indentation continues the item and stays visible. Regressions cover both; each half fails when ablated.
- **Temp folder cleanup.** The 1,637 empty `shipwright-session-*` and `shipwright-fast-*` folders left before the A-06 fix were removed with a non-recursive delete.
- **More test leaks.** A temp-folder audit showed four test files (`run-benchmarks`, `prepare-blind-review`, `compile-blind-review`, `generate-proof-pack`) leaving fixture folders on every run. They now use `tests/helpers/temp-dirs.mjs`, which removes its folders when the test process exits. A full run now adds no entries to the system temp folder. The 1,392 leftover folders with those four prefixes were deleted; no script, skill or command creates those prefixes.
- **One unexplained suite abort.** One full run stopped after four tests in the first file, `archive-generated-outputs`, with exit code 1 and no error text. Five later full runs passed completely. It has not been reproduced.

These changes went to the second red-line review below.
