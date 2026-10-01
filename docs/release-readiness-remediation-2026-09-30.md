# Release readiness remediation, 2026-09-30

**Local repair: V1-V7 fixed and verified offline. Public release: HOLD.** The changes address the reproducible backlog against `b9b6f8d`. Live host behavior, source truth and human approval remain unverified. No finding was rejected or deferred, and none was already satisfied by the starting code.

## Disposition

Test names below identify source regressions in the working tree; no commit was created. Ablations replaced the relevant fixed file with its `b9b6f8d` version in a disposable repository copy, never in the shared checkout.

| ID | Status | Evidence and changed files | Tests and ablations | Remaining risk |
|---|---|---|---|---|
| V1 | Fixed | `scripts/install.mjs` restricts record paths and directories to package targets, checks recorded file hashes against trusted source-package bytes, and refuses inconsistent entries before uninstall writes. The original forged `user-note.txt` case now preserves every file and the record. Review also reproduced deletion of replacement user text at `.codex/README.md` with a forged matching hash; this now refuses without writes. | `tests/release-contracts.test.mjs`: `forged in-project record entries cannot remove user files or begin uninstall`, `forged hashes at packaged paths cannot authorize deletion of user content`, and `forged block separator metadata cannot strip user instructions`. Preview and apply both preserve bytes; restoring the original record/file permits retry. All fail against the original installer. Existing traversal and linked-path tests pass. | Trust is anchored in the caller-selected source package. Old package hashes or retired paths can now require manual reconciliation; the installer does not guess ownership from an editable record. |
| V2 | Fixed | `scripts/install.mjs` records block hashes, refuses reinstall over edited or unverifiable blocks, and preserves edited blocks on uninstall. Block hashes must also match the trusted template. Partial uninstall keeps the record while edits remain. Separator metadata is bounded so it cannot strip arbitrary outside instructions. The generated block comment describes this behavior. | `tests/release-contracts.test.mjs`: `reinstall refuses edited managed blocks and keeps outside user text byte-for-byte`, `uninstall refuses an edited managed block and remains recoverable`, `forged managed-block hashes cannot authorize removal of edited instructions`. These fail against the original installer. Disposable lifecycle checks preserve mixed line endings, spaces and a missing final newline; restoring a block then retrying removes the record. | Old records without block hashes are unverifiable and retain their blocks. Move custom instructions outside the managed block before deliberately reconciling an old installation. Filesystem operations are not a crash-atomic transaction. |
| V3 | Fixed | `skills/execution/prd-development/SKILL.md`, `examples/golden-outputs/prd.md`, and `evals/prd.md` now use `Goal / Metric / Segment / Current / Target / Unit / Timeframe / Source`. The review's missing Unit was real; Segment was also necessary for the structured fixture. Current and Target contain values only. No validator weakening was needed. | `tests/validate-artifact.test.mjs`: `validateArtifact accepts the shipped PRD metric table contract` reads the actual skill header, fills a row from the valid PRD fixture, and passes structured validation with `%`, `12`, `20`, and a separate Source cell. Restoring the old skill fails this regression. Existing Source-column and value-cell citation checks pass. | A passing template contract does not prove a live model will follow it. |
| V4 | Fixed | `scripts/live-acceptance.mjs` checks section placement and content, confidence/review values, reasoning bullets, and obvious verdict language in clarification answers. Labels-only governance, unrelated-heading content, and the reported imperative verdict fail. Review's additional `We should sign...` and `The cheaper vendor is the right choice...` transcripts now fail too. `docs/live-acceptance.md` requires human transcript review and calls grading an offline smoke check. | `tests/live-acceptance.test.mjs`: `decision sections need answers under their headings` and `clarification answer cannot include a verdict before its question`. Both fail against the original grader; synthetic good transcripts still pass. | Lexical checks cannot establish semantic relevance, decision quality, source truth or approval. They can miss paraphrases or reject valid phrasing. Human transcript review remains a release gate. |
| V5 | Fixed | `scripts/route-request.mjs` constrains destructive verbs by object and runtime context, and removes generic document publication from high-stakes triggers. Worker-process, background-service timeout and failed-deployment API shutdown questions avoid decision analysis. PRD publication routes to `write-prd`. Product-line shutdown, price changes, acquisition and public announcements retain their scenario classes. | `tests/route-request.test.mjs`: expanded `phrase corpus: decision routing and scenario class`, including the two original false positives and the review's service cases. The corpus fails against the original router and passes with the repair. A product-line shutdown following a failed deployment remains `product_strategy`. | Routing remains heuristic. Offline classification does not prove host instruction compliance on arbitrary user language. |
| V6 | Fixed | `scripts/install.mjs` shares one marker parser for install and uninstall: exactly one ordered begin/end pair, or no markers. Duplicate ends, reversed/mixed markers and incomplete pairs fail before writes. | `tests/release-contracts.test.mjs`: `duplicate and mixed managed markers are rejected before install writes` and `malformed markers stop uninstall before any file is removed`. Both fail against the original installer. Fresh disposable install with duplicate ends leaves the project byte-for-byte unchanged. | A user must repair malformed markers before retrying. |
| V7 | Fixed | `scripts/shipwright.mjs` help now prints `Shipwright - PM decision analysis`. | New `tests/cli-help.test.mjs`: `public CLI help contains no em dash`; passes now and fails with the original CLI. Fresh-package scan also found no U+2014 in 69 public README, command and skill Markdown files. | This checks shipped text and observed CLI output, not future model-generated prose. |

## Verification

- Initial integrated focused run: **147 passed**, none failed or skipped, across release contracts, artifact validation, CLI help, live acceptance, routing and package distribution.
- After review fixes: **102 passed**, none failed or skipped, across all affected installer, distribution, routing and live-acceptance tests.
- Repository validator: **zero errors**, 46 skills, seven agents, 17 workflows.
- Full Node suite after all code changes: **583 passed**, zero failed, cancelled or skipped. The documented command was used with both spec and TAP reporters; destinations were redirected into the named temporary directory to avoid repository artifacts.
- Fresh bundle after review fixes: **123 files, 48 skills; all 10 packaged scripts imported; 41 local links/helper references resolved**. Installed `.codex` file bytes matched the freshly built package. The installer itself is a checkout tool, not a bundled script.
- Disposable projects exercised install preview, apply, unchanged reinstall, uninstall preview, malformed marker sets, malformed record JSON, forged entries, edited blocks, recovery and uninstall. No real project was installed into.
- Public em dash checks: CLI help and 69 packaged public Markdown files passed; existing decision-output and installed-host-instruction checks passed in the suite. Host instructions were not tuned to acceptance prompts.
- `git diff --check` passed. Before/after SHA-256 comparison found **4,114 protected files unchanged**: the historical audit and all 4,113 files under `benchmarks/results/` and `benchmarks/telemetry/`. The audit hash remains `d8816b425387c9dd3ee0852ea4e42a48d786ce79c8f6962ae2ce7abbad823417`.

Reproduction commands from the repository root:

```text
node --test --test-concurrency=1 tests/release-contracts.test.mjs tests/validate-artifact.test.mjs tests/cli-help.test.mjs tests/live-acceptance.test.mjs tests/route-request.test.mjs tests/audit-distribution.test.mjs
node scripts/validate-repository.mjs
node --test --test-concurrency=1 --test-reporter=spec --test-reporter=tap --test-reporter-destination=<temporary-directory>/full-spec.txt --test-reporter-destination=<temporary-directory>/full.tap tests/*.test.mjs
node scripts/build-plugin.mjs <new-temporary-directory>/bundle
git diff --check
```

### Ablation evidence

In a disposable copy outside the repository, each group passed with the repair and failed when only its relevant file was replaced by the original version. Tests and fixtures remained unchanged. These are grouped reversions, not exhaustive line-by-line causal ablations.

| Original file substituted | Findings tested | Result |
|---|---|---|
| `scripts/install.mjs` | V1, V2, V6 | Nine selected tests pass repaired; original fails eight, including each new installer safety regression. The pre-existing incomplete-marker test passes both. |
| `skills/execution/prd-development/SKILL.md` | V3 | Shipped-template regression: repaired pass, original fail. |
| `scripts/live-acceptance.mjs` | V4 | Both negative-transcript regressions: repaired pass, original fail. |
| `scripts/route-request.mjs` | V5 | Seven selected routing tests pass repaired; original fails the phrase corpus. |
| `scripts/shipwright.mjs` | V7 | CLI help regression: repaired pass, original fail. |

## Independent review and constraints

Three implementation workers used the requested models and efforts with disjoint ownership: installer (`gpt-6-sol`, high), PRD/CLI (`gpt-5.6-terra`, medium), acceptance/routing (`gpt-6-sol`, medium). No descendants were spawned. The coordinator owned integration and the three reproduced follow-up fixes. Advisory checkpoints were planning limits; measured token usage was not available.

One fresh, non-author `gpt-6-sol` reviewer at high effort reviewed the integrated diff read-only. It reproduced three material residuals: trusted-path content forgery (V1), declarative verdicts in clarification (V4), and runtime-service routing (V5). All three were repaired with focused regressions and affected checks rerun. The same reviewer resumed after a service interruption and completed its review. It found no further material issue in PRD/CLI alignment. Its pre-fix focused run passed 79 tests, demonstrating why a green suite alone was insufficient. The final follow-up edits were verified by the coordinator; no second independent review is claimed.

No live model sessions, external network requests, credentials, real-project installs, publication, commits or pushes were used. The deterministic suite includes its existing loopback HTTP timeout fixture. Temporary copies, projects and reports were confined to a named OS temporary directory and removed after verification.

## Release verdict

**Local repair passes the observed deterministic and disposable-install checks. Public release remains on hold.** A separate authorized live acceptance pass must exercise the installed version in each supported host. A maintainer must inspect the resulting transcripts for correct routing, relevant decisions, source truth and actual approval provenance. Linux/macOS behavior and live host behavior were not established by this Windows run.

### Later authorized live acceptance

The user subsequently authorized live sessions. See [the live acceptance results](live-acceptance-results-2026-09-30.md) for both hosts, original failures, a structured PRD retest, and a closing-heading checker follow-up. The local suite now has 584 passing tests. Public release remains on hold because transcript inspection found material answer-quality failures. The evidence above describes the original offline repair phase.
