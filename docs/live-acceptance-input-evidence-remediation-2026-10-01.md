# Input and evidence remediation, 2026-10-01

## Decision and scope

This report records a bounded repair from `6e93f14ab88784bd0f667ceb9f2afffa82a60213` (`Add installed reconciliation with unresolved semantic release gates`). Public release remains on hold. Local consistency checks are useful, but neither internally consistent records nor hashes establish semantic correctness.

Durable evidence: `C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f869-ee43-73c3-8664-c78108d48903/input-evidence-remediation`. Paths below are relative to that directory unless stated otherwise. Raw evidence and generated benchmark outputs are excluded from the commit.

The initial checkout matched the expected baseline, with only the protected untracked benchmark directories. Historical reports and the prior evidence archive were preserved. `prior-verification.json` reproduces the previous group's recorded results: 627 tests, 20 structural passes, Claude semantic passes of 3/4 baseline, 2/4 repaired, 1/4 repeat, Codex 4/4 without a matched Codex baseline, and preserved regressions 1/4. Nineteen host final validations succeeded; all 16 repaired records matched their final receipts. Its aggregate improvement claim remains negative, with L1-L4 deferred. The prior Craft flat-pricing example was not a demonstrated error; the Notion failure concerned unsupported cadence comparability, not a disproved numerical inequality.

## Repair and limits

### Preserve supplied inputs before drafting

`scripts/capture-inputs.mjs` writes a versioned input history before the designated final draft exists. It preserves request passages, exact supplied excerpts, typed quantities and behavior provenance. Revisions need reasons, retain prior files and link their logical hashes. Final reconciliation checks the initial and latest digests, supplied fields, history links and designated artifact path.

The installed helper cannot authenticate the host's original user-message channel. An author-written `request.txt` is labeled `author-copy`; a supplied local file is also explicitly unauthenticated. Neither prevents a mistaken original extraction, omitted passage, another draft path or replacement of the entire history by its owner. A test deliberately accepts an internally consistent but incorrect numerical extraction to preserve this limitation. Captures establish recorded identity and observable ordering, not truth or authorization.

### L2: quantity, population and economic basis

`reconcile-inputs.mjs` distinguishes revenue, customer and seat measures, acquisition and renewal evidence, comparison populations, observation windows and no-change revenue baselines. New break-even records preserve the multiplier, weighting basis, horizon and intended use. An equal-value assumption can support conditional arithmetic. Customer or seat retention cannot authorize a revenue operating threshold. Unknown inputs produce explicit unresolved results rather than requiring rejection of every useful answer.

Typed fields remain author extractions. A misleading excerpt or incorrect supplied value can survive when the record repeats the same error. New deterministic checks do not infer whether final prose expresses the correct counterfactual.

### L3: supplied behavior, proposals and implementation

`reconcile-behavior.mjs` anchors supplied behavior to captured records. It distinguishes event receipt from application, proposed requirements from implementation evidence, and preserves trigger, population, boundary, latency kind, prerequisites and exceptions. Implementation claims require anchored implementation excerpts; a proposed capability cannot establish existing behavior.

`reconcile-artifact.mjs` also inventories visible text outside exact excerpt mappings, including headings and repeated occurrences. This is an inspection aid. It counts all unmapped nonempty lines but returns only the first 50; it has no continuation interface. Run 6 explicitly reviewed only that printed portion of 73 lines. Unmapped text can be harmless and mapped text can remain unsupported. The receipt does not classify omitted material claims or establish entailment. No mandatory model review chain was added; no independent model coverage architecture was evaluated or claimed effective.

### L1/L4: capture public sources and retain dependencies

`collect-research.mjs --url` accepts known public URLs without a search provider. `public-source-fetch.mjs` validates each HTTP(S) destination, checks every DNS answer, pins the checked address and repeats validation at redirects. Direct mode permits eight URLs, three concurrent captures, four redirects, a 1 MiB body limit and a maximum 30-second total deadline per URL including DNS. Only HTML, XHTML and plain text are supported. Credentials in URLs, private/reserved addresses, unsupported responses and acquisition failures remain explicit gaps. It does not bypass access restrictions.

Retained context includes source URL, retrieval time, content identity and truncation limits. Source prerequisites link relevant case inputs and referenced definitions. Comparison records preserve provider, plan, feature, price, currency, unit, cadence and conditions, with typed exact-excerpt mappings for final rows and conclusions. Paraphrases and table references are accepted as text anchors, without claiming they are semantically faithful. A fetched page or matching tuple does not authenticate authority or prove support.

### Integration and changed files

- New runtime files: `scripts/capture-inputs.mjs`, `scripts/public-source-fetch.mjs`.
- Updated runtime files: `scripts/collect-research.mjs`, `scripts/reconcile-artifact.mjs`, `scripts/reconcile-inputs.mjs`, `scripts/reconcile-behavior.mjs`, `scripts/reconcile-evidence.mjs`; `scripts/build-plugin.mjs` includes both new helpers.
- Installed workflow documentation: `docs/artifact-reconciliation.md`, `docs/host-instructions.md`, `docs/workflow-contract.md`, `docs/output-standard.md`.
- Tests: new capture and public-fetch suites; updated collector, artifact, input, behavior and evidence suites.

Version 1 records remain compatible and provide no snapshot assurance. Version 2 adds input history and uncovered-text receipts. Existing structural-validity/readiness semantics are unchanged.

## Experimental design and verification

`transfer-scenarios.json` and `freeze.json` froze four new prompts and grading criteria before production edits: GDPR processing records, maintenance-subscription renewals, kiosk logout and code-hosting packaging. Inputs include sufficient arithmetic and bounded behavior alongside explicit uncertainty. Exact transfer prompts were withheld from implementation workers. `regression-scenarios.json` preserves the wording from previous runs 5, 10, 19 and 20. Those are known regressions, not unseen evidence.

Four fresh Claude baseline sessions ran against a package built from the committed checkpoint before edits. The coordinator initially recorded four bounded passes. While grading repeat run 9, comparison against baseline exposed the same misplaced "low-risk" exemption condition in baseline run 1. Applying the frozen criterion consistently corrected the baseline to 3/4; `grading-correction-01.json` retains the original grade and correction. Other baseline grades explicitly disclose peripheral unsupported statements; they do not certify every assertion. The repaired package is used for four Claude runs, four fresh Claude repeats, four Codex runs and four known Claude regressions. Results are kept separate. No matched Codex baseline exists and no host superiority can be inferred.

### Deterministic checks and packaging

The stable full suite passed 658/658 tests. The repository validator passed with 46 skills, seven agents and 17 workflows. Whitespace checks passed. Coverage includes installer safety, routing, structured PRD contracts and public em dash handling.

The fresh package has 130 files, 16 importable JavaScript modules and 36 resolved documentation links. All 11 changed distributed files match the checkout after documented path rewriting; 4,096 installed files match the bundle across 16 repaired projects and both host layouts. `package-verification.json` records the comparisons.

Disposable ablations disabled each reconciliation domain and reran its focused tests: evidence caught 10 failures, inputs 19, behavior 11. Positive cases remained in each suite. These demonstrate deterministic test sensitivity only, not a causal live model effect.

An early full run overlapped the final evidence-schema edits and failed two tests (comparison schema and installer source-identity check). After edits stopped, the full suite passed. An earlier package allowlist check caught the missing new public-fetch import; adding the helper to the package fixed it. Negative results are retained in `full-suite.tap` and the work evidence; the stable result is `full-stable.tap`.

### Hosts, permissions and attempt budget

Node `v25.4.0`, Claude Code `2.1.286`, Codex CLI `0.159.2`. Claude uses `claude-opus-5-5`, high effort, fresh nonpersistent sessions, restricted tools and plain Node execution. Codex uses `gpt-6-astra`, xhigh effort, ephemeral sessions, workspace-write and live web search. `settings.json` retains exact arguments. Existing global profiles and authentication were unchanged; fresh sessions do not mean clean profiles.

The current host instruction inventory is in `host-instruction-files-current.json`. Claude has a user-level instruction file; its attempts to read an additional personal voice guide were sometimes denied. Codex read existing global memory and appended memory citations to some saved answers. Those are relevant customization differences, not independent evidence for the answers. The inventory is a current hash snapshot, not proof of historical global-file identity. No credentials or private connectors were read for this experiment.

The cap is 24 live invocations, at most two simultaneously. All four reserve slots were consumed by preflights: attempts 21 and 22 failed provider connectivity under the outer sandbox and produced no answer; both were terminated after 102 seconds. Attempts 23 and 24 succeeded with normal authorized authentication, local writing and installed validation. One Claude compound discovery command was denied and recovered through allowed tools. `transport-notes.json` retains the details.

Automatic approval review initially rejected the elevated retry launch as allegedly unauthorized external transfer. No CLI invocation started from that rejection. The same action was approved after the coordinator supplied the user's explicit session authorization and verified the staged public distribution and synthetic prompts. No safeguard was bypassed and no credentials were inspected. All substantive attempts count toward the remaining 20 slots; no live retries remain after that allocation.

## Live outcomes and dispositions

All 24 allocated CLI attempts completed: 20 substantive sessions and four preflights. Two preflights failed; the other 22 invocations completed normally. No substantive session timed out. All 20 substantive artifacts passed structural validation; bounded semantic results follow.

| Group | Structure | Semantic passes | Sum of case seconds | Tool events | Reported USD cost |
|---|---:|---:|---:|---:|---:|
| Claude baseline | 4/4 | 3/4 | 1451 | 129 | $7.0605 |
| Repaired Claude | 4/4 | 2/4 | 1821 | 173 | $10.5001 |
| Fresh Claude repeats | 4/4 | 1/4 | 1853 | 191 | $10.5265 |
| Repaired Codex | 4/4 | 4/4 | 2333 | 123 | Unavailable |
| Preserved Claude regressions | 4/4 | 2/4 | 1907 | 187 | $10.1334 |

The repaired Claude group took **25.5% more case time** and reported **48.7% more cost** than its matched baseline. These are descriptive changes in four cases, not causal estimates. Time is summed per attempt, not wall time for the parallel queue. Repeat variability remains material. Codex has no matched baseline; its four passes establish neither a repair effect nor general host superiority. Known regressions are not unseen transfer evidence.

### Every live attempt

Numbers identify evidence directories, not chronological order: preflights 21-24 preceded baseline 1-4, then repaired runs 5-20. Every substantive row passed structure.

| Attempt | Host/group | Finding | Semantic | Seconds | Reported USD | Bounded result |
|---|---|---|---|---:|---:|---|
| 1 | claude/baseline | L1 | FAIL | 418 | $2.2693 | Low-risk exception condition; grade corrected. |
| 2 | claude/baseline | L2 | PASS | 296 | $1.4328 | Conditional weighted economics preserved. |
| 3 | claude/baseline | L3 | PASS | 346 | $1.7373 | Core kiosk limits preserved. |
| 4 | claude/baseline | L4 | PASS | 391 | $1.6211 | Price conditions retained. |
| 5 | claude/repaired | L1 | PASS | 486 | $3.0530 | Activity-specific rule and unknowns preserved. |
| 6 | claude/repaired | L2 | FAIL | 327 | $1.6292 | Count-rate precision used for revenue margin. |
| 7 | claude/repaired | L3 | PASS | 409 | $2.1694 | Core receipt/application and offline limits retained. |
| 8 | claude/repaired | L4 | FAIL | 599 | $3.6484 | Basic export becomes Enterprise-only in rationale. |
| 9 | claude/repeat | L1 | FAIL | 488 | $2.8107 | Low-risk exception replaces current risk condition. |
| 10 | claude/repeat | L2 | FAIL | 420 | $1.9748 | Changed-price revenue receives price uplift again. |
| 11 | claude/repeat | L3 | PASS | 364 | $2.0212 | Core limits retained; ancillary defects disclosed. |
| 12 | claude/repeat | L4 | FAIL | 581 | $3.7198 | Active-seat comparability asserted without support. |
| 13 | codex/repaired | L1 | PASS | 598 | Unavailable | Risk condition retained throughout. |
| 14 | codex/repaired | L2 | PASS | 608 | Unavailable | Old-price valuation explicitly defined. |
| 15 | codex/repaired | L3 | PASS | 677 | Unavailable | Local application and erasure proposals gated. |
| 16 | codex/repaired | L4 | PASS | 450 | Unavailable | Feature/cadence/first-year conditions retained. |
| 17 | claude/regression | L1 | PASS | 475 | $2.3635 | Prior applicability prerequisites restored. |
| 18 | claude/regression | L2 | PASS | 413 | $2.0033 | Retained list value replaces partner-count threshold. |
| 19 | claude/regression | L3 | FAIL | 600 | $3.2668 | IdP-removal promise omits Optional-password exception. |
| 20 | claude/regression | L4 | FAIL | 419 | $2.4997 | Unresolved cadence/currency lost in 20%-below claim. |

| Preflight | Host | Outcome | Seconds | Reported USD |
|---|---|---|---:|---:|
| 21 | claude | Connection failed; no answer; terminated | 102 | Unavailable |
| 22 | codex | Connection failed; no answer; terminated | 102 | Unavailable |
| 23 | claude | Local writing and installed validator succeeded | 26 | $0.3065 |
| 24 | codex | Local writing and installed validator succeeded | 55 | Unavailable |

All prompts, responses, raw events, stderr, command arguments, denials and result metadata are under runs/<number>-*/. semantic-review.json separates source support, user facts, consistency and approval provenance. Harness keyword grades are not the installed structural validator. Run 17 exposes a harness false alarm: it expects governance, although publication is correct. Its actual validator passes; production validation was not weakened.

### Material failures and grading boundaries

- **L1:** Runs 1 and 9 loosen the exception to low-risk processing despite giving the stricter condition elsewhere. The main hold-publication decision remains sound. [DPC Article 30 guidance](https://www.dataprotection.ie/en/dpc-guidance/records-of-processing-article-30-guidance) and its retained PDF support the current activity-specific test. The [Parliament procedure record](https://oeil.europarl.europa.eu/oeil/en/procedure-file?reference=2025/0130(COD)) distinguishes a pending proposal from enacted law.
- **L2:** Run 6 uses customer-count uncertainty to assess a revenue-weighted margin. Run 10 defines retention using actual full-price revenue, then applies the price multiplier again. Actual changed-price revenue must match 100% of no-change revenue to break even; the 88% illustration requires unchanged-price retained value. Run 14 explicitly preserves that basis. Run 18 fixes the preserved count-threshold error, but its claim that the test design is ready for approval remains unsupported.
- **L3:** Transfer passes are bounded to commit, receipt/application, percentile/maximum, offline and proposal/implementation distinctions. Several PRDs still assert unproved dependency status or contain ancillary gate inconsistencies. These are not certified by the pass. The baseline also passed the core transfer case. Regression 19 still promises that IdP removal blocks the next console sign-in while Optional mode permits passwords. Its FAQ adds break-glass and existing-session exceptions but misses ordinary Optional-password users.
- **L4:** Run 8 correctly distinguishes basic log export from API access in its table, then attributes both export and SAML to Enterprise pricing in the rationale. Run 12 asserts active-seat comparability without matching billable populations. [GitHub audit documentation](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization) and [license definitions](https://docs.github.com/en/billing/reference/github-license-users) support those distinctions. Regression 20 repeats a percentage price advantage despite its own unresolved Notion cadence and currency notes. The [Craft flat bundle](https://www.craft.do/pricing) is supported; it is not the failure, and no numerical inequality is claimed disproved.

Primary checks and acquisition limits are retained in the primary-*.json files. The California regression was checked against [Civil Code 1798.140](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.140.) and [CPPA guidance](https://cppa.ca.gov/faq). [GitHub billing cycles](https://docs.github.com/en/billing/concepts/billing-cycles), [Slite pricing](https://slite.com/pricing) and [Obsidian pricing](https://obsidian.md/pricing) were checked for the final comparisons. The coordinator's CISA fetch returned 403; the SSO failure rests on the artifact's internal contradiction. This is verification of bounded material criteria, not certification of every legal, commercial or technical sentence.

### Installed execution and final identity

All **16/16** repaired substantive runs successfully captured inputs before their first designated final draft write. All 16 have final artifact, logical record and latest snapshot digests matching a retained receipt. Initial and revised histories verify. Revisions in runs 10, 15, 16, 17, 18 and 20 retain prior files and explicit reasons. File-write traces establish observable ordering, not when internal model reasoning began. All captures are author copies that match verbatim harness passages on coordinator inspection; this does not authenticate them through the installed helper.

All **20/20** substantive sessions have successful host validation after the final saved-file rewrite. The coordinator independently validates every saved artifact. Actual successful results support these counts. A denied compound command initially confused first-write detection in run 10; a variable-resolved helper path initially escaped validation detection in run 16. Both evidence-analysis errors were corrected against raw traces. Production code was unchanged.

Successful installed direct-URL text captures appear in runs 5, 8, 9, 12, 17, 19 and 20. Some results are truncated or are not primary authorities; the collector's metadata does not determine authority. Codex research runs 13 and 16 recorded network-access failures, including EACCES, and used browsing fallback. A zero collector exit code alone is not a successful page capture. mechanism-review.json retains result-level evidence, errors and content identities.

The uncovered-text inventory accompanied observable author corrections in runs 6 and 11, but errors remained. Run 11 removed an unsupported customer-need assertion. This is an author correction, not independent review or causal proof of benefit. The first-50-line limit prevented complete inventory review in run 6. Repeated extraction-schema corrections also caused snapshot revisions: capture validation does not fully enforce every downstream domain schema.

Final hashes bind saved files, not every inline wrapper. Claude responses contain the saved body plus process notes. Codex runs 13-15 match the saved body after removing its memory-citation block; run 16 matches after outer whitespace trimming. These differences are recorded in inline-extras.json, not described as exact byte identity. No substantive difference in those Codex bodies was found.

### Release dispositions

| Finding | Disposition | Evidence and remaining gate |
|---|---|---|
| L1 | Deferred | Input/source acquisition and recorded prerequisites work; applicability conditions still disappear in final prose. Require reliable preservation across fresh cases. |
| L2 | Deferred | Typed measures and counterfactuals catch declared mismatches; live count-versus-revenue and price-basis errors survive. Require correct valuation, population and horizon in actual recommendations. |
| L3 | Deferred | Core transfer limits survive, but the baseline already passed and final-prose coverage remains incomplete. The preserved SSO exception failure remains. |
| L4 | Deferred | Source capture succeeds and typed anchors retain metadata, but feature, unit and cadence conditions disappear in conclusions. Require supported final positioning. |

V1-V7, L5 and L6 were not reopened; their existing deterministic regressions remain in the passing suite. Local implementation verification is separate from public release readiness. **No aggregate matched Claude improvement was demonstrated; public release remains on hold.**

### Next specific experiment

Stop live reruns at this budget. Before adding a mandatory model-review chain, create a blinded offline set of at least eight paired correct/incorrect archived excerpts covering unchanged-price versus changed-price revenue, count versus value weighting, behavior exceptions/provenance, and feature/unit/cadence conditions. Test one focused independent checker that must cite exact conflicts and a specific correction. Measure false alarms, misses, corrections surviving reintegration, latency, calls and available cost. Include clean controls and challenge current grading boundaries. This proposed study has not run and would not count as installed acceptance; a later authorized fresh-session test is still required.

## Available usage

The installed capture/reconciliation helpers make no model calls. No live host invoked an Agent/Task delegation tool. Exposed Claude request IDs count observed requests, not invisible backend subcalls. Claude reports ancillary Haiku aggregates already included in total cost; do not add them again. Top-level token usage and per-model totals have different coverage.

| Group | Exposed Claude request IDs | Opus cost | Ancillary Haiku cost | Opus output tokens | Haiku input/output tokens |
|---|---:|---:|---:|---:|---|
| Claude baseline | 97 | $6.5012 | $0.5593 | 131390 | 436473 / 8565 |
| Repaired Claude | 130 | $10.1832 | $0.3169 | 181944 | 274820 / 2415 |
| Fresh Claude repeats | 136 | $10.1973 | $0.3292 | 188684 | 238287 / 4176 |
| Preserved Claude regressions | 146 | $10.1009 | $0.0325 | 189995 | 18726 / 756 |
| Claude preflights | 5 | $0.3065 | Not separately reported | 1664 | Not separately reported |

Codex repaired-run reported tokens: {"input_tokens":4496914,"cached_input_tokens":4131200,"cache_write_input_tokens":0,"output_tokens":61183,"reasoning_output_tokens":12682}. Codex USD costs and model-request counts are unavailable. Claude cache reads/writes and thinking-token counts are retained per model in usage-summary.json. These are CLI list-cost reports, not invoices or measured subscription charges. Exact per-fetch internal attribution and coordinator, worker and collaboration-reviewer counters are unavailable. Advisory allocations are not measured usage. Raw per-run metadata is retained rather than estimating missing counters.

## Resource and delegation record

Three implementation workers had exact non-overlapping ownership: evidence/applicability (`gpt-6-sol`, high, 8,000-token advisory checkpoint), decision inputs (`gpt-6-sol`, high, 7,000), behavior (`gpt-5.6-terra`, medium, 5,000). No descendants were authorized. The coordinator owned shared capture, orchestration, packaging, live runs, grading and this report. Worker token counters are unavailable; advisory allocations are not measured usage. Workers did not run live acceptance.

## Independent review and resolutions

One fresh, read-only non-author reviewer used `gpt-6-sol` at high effort with a 4,000-token advisory checkpoint. It inspected integrated helpers, packaging, actual execution and ordering, representative answers, grading boundaries, cost and limitations. Measured reviewer usage is unavailable. This collaboration review used no live CLI attempt and is not installed acceptance or an evaluation of a model coverage-checking architecture.

The coordinator reproduced its four findings against saved answers and retained primary-source evidence:

1. Runs 19 and 20 retain material failures: the SSO summary/FAQ loses the ordinary Optional-mode password exception, and note-price positioning loses unresolved cadence/currency conditions. Their failures and the release hold remain.
2. Run 12's active-seat comparison remains a narrow FAIL because GitHub billing includes relevant dormant users and pending invitations. This does not disprove a numeric price inequality.
3. Run 18 retains its bounded numeric/population PASS. Its claim that the renewal test design is approved is unsupported while cohort, variance and sample size remain unresolved. This result is not an approved experiment or a readiness pass.
4. Runs 7 and 11 retain narrow L3 transfer passes, with artifact defects explicitly preserved. They assert unsupplied dependency statuses. Run 7 also measures screen clearing from receipt in R6 but from commit in AC6; G1 permits dropping R6 while reconnect handling still depends on it. Run 11 has inconsistent gate wording. Their core frozen distinctions survive, and both answers themselves mark readiness FAIL.

The reviewer found no additional concrete runtime defect in this bounded inspection. No grades changed, no post-review runtime repair was made, and no additional live attempt was run. Full findings and per-finding resolutions are retained in `independent-review.md` and `review-resolutions.json` in the evidence directory. Preserved answers were not rewritten to remove defects.

## Completion

Local verification passed: 658 tests, repository validation, whitespace checks, fresh-package references/imports/installations and all 11 changed distributed-file comparisons. All 24 authorized live attempts were consumed; all 20 substantive saved answers passed structural validation, while semantic outcomes remain mixed as reported above. No aggregate matched Claude semantic improvement was demonstrated. L1–L4 remain deferred and public release remains on hold.

The preservation check verified all 11,126 protected files unchanged, no protected additions, all 6,232 installed file identities unchanged after live execution, and unchanged frozen prompts. Before cleanup, all 6,980 disposable files were archived under `disposable-snapshot` and verified against their original SHA-256 identities. Historical paths under `disposable` in traces map to that archive after cleanup. Raw evidence stays outside the repository commit. `preservation-verification.json`, `archive-manifest.json`, `cleanup.json` and `completion-checks.json` retain verification, cleanup and local commit details. The local commit includes only this repair's implementation, tests and report; no push, publication or release is authorized or performed.
