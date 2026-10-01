# Installed artifact reconciliation: bounded repair and live acceptance

Date: 2026-10-01 (America/Los_Angeles). Live sessions ran September 30; final grading and review continued October 1. Status: local implementation verified; semantic repair remains partial and public release remains on hold.

## Baseline and evidence

The checkout started on local `main` at `7fa1d48b72ebdac080a0e37e36e9b4121c40df8d`, `Tighten evidence and PRD consistency guidance`. Only untracked benchmark results and telemetry were present. The experimental baseline was built from a Git archive of that commit. The earlier remediation report's statement that it made no commit remains historical and unchanged.

New durable evidence is under:

`C:\Users\ianfe\.codex\visualizations\2026\10\01\01a0f5ee-9433-7930-81a9-291d7921353d\mechanism-remediation`

The previous evidence archive was inspected without modification, starting with completion checks, semantic grading, instruction-consumption records, independent review and relevant answers. Its records support 584 passing tests, a 123-file fresh package, 24 live attempts, two attempts without answers, and 22 structural passes. Its bounded semantic ledger contains 12 passes and 10 failures. Those counts describe that assessment; they do not certify every statement in those answers. L1-L4 and the public release hold carried forward.

## Mechanism and scope

The repair adds one installed local reconciliation command with three focused record checks. It does not introduce a model-review chain.

- **Evidence and applicability:** fetched results can retain bounded cleaned page context, a passage, URL, retrieval time, body hash and truncation flag. Search snippets remain distinct. Evidence records connect claims to source passages and required case inputs. Competitor tuples preserve provider, plan, feature, price, currency, unit and billing cadence. Conditional or unresolved claims stay explicit.
- **Inputs and calculations:** canonical inputs distinguish supplied facts, assumptions, proposals and unknowns. Typed ratios preserve numerator/denominator roles, population, period and units; arithmetic is recomputed. Conditional revenue calculations cannot be labeled causal forecasts. Unsupported calculations remain unresolved.
- **Promises and behavior:** promises reference operative behaviors. Checks compare triggers, populations, online/offline boundaries, maximum versus percentile latency, prerequisites, exceptions and proposed versus implemented status.
- **Final reconciliation:** exact visible excerpts map declared records to the saved draft. A separate author reading records observations about source support, user facts, consistency and approval. The receipt hashes the artifact and record. The ordinary artifact validator runs separately after the last rewrite.

`recordConsistency` describes declared records. `semanticStatus: requires-review` and `readiness: not-assessed` are explicit. Exit 0 can include unresolved warnings. The checks cannot establish source authenticity, semantic entailment, complete claim coverage, authentic user input or human approval. The author can omit a prerequisite or encode the same mistake in the draft and its record. Live acceptance tests that limitation directly.

The workflow document, host instructions and output standard point to the executable step. The package allowlist distributes the workflow document and all four helpers. Existing routing, installer behavior, artifact validity/readiness semantics, structured PRD checks and public em dash rules remain intact.

### Changed files

- `scripts/reconcile-artifact.mjs`, `scripts/reconcile-evidence.mjs`, `scripts/reconcile-inputs.mjs`, `scripts/reconcile-behavior.mjs`.
- `scripts/collect-research.mjs`, `scripts/build-plugin.mjs`.
- `docs/artifact-reconciliation.md`, `docs/host-instructions.md`, `docs/output-standard.md`, `docs/workflow-contract.md`.
- Four matching `tests/reconcile-*.test.mjs` files and `tests/collect-research.test.mjs`.
- This report. Raw evidence and generated benchmark outputs are excluded from the commit.

## Delegation and isolation

Three non-Astra implementation workers had non-overlapping ownership. Evidence/applicability used GPT-6 Sol at high effort with an 8,000-token advisory checkpoint; decision inputs used GPT-6 Sol at high effort with 7,000; PRD consistency used GPT-5.6 Terra at medium effort with 5,000. Their files were, respectively, the evidence helper plus collector and matching tests; the inputs helper and tests; and the behavior helper and tests. They were instructed to request reassignment before editing other files and not to spawn descendants. No descendants or effort escalation were used. Worker token counters were unavailable; these were advisory budgets, not measured consumption.

The coordinator owned integration, shared documents, packaging, the live harness, grading and this report. Workers received focused prior failures and generic acceptance properties. They did not receive the exact new transfer scenarios. Production edits started only after all four baseline sessions completed.

## Deterministic and package verification

The final implementation suite passed **627/627 tests**, with no skips or failures, using the documented single-concurrency Node test command. The repository validator reported zero errors (46 skills, seven agents, 17 workflows). Whitespace checks passed. Existing tests for installer safety, routing, structured PRDs, V1-V7, L5/L6 and public em dashes were retained.

An earlier integrated suite was 626/627 because the shared host instructions exceeded the existing 350-word limit. The block was shortened; the test was not weakened. Pure behavior integration checks also exposed and corrected a Set iteration error, rejection of zero latency, and an unknown field suppressing unrelated contradictions before live installation.

The fresh live package (`repaired-bundle-v2`) has 128 files. Verification imported 14 modules, resolved 36 relative references, checked all nine changed distributed file contents, and compared 4,032 installed files across the 16 repaired projects. An unused preliminary harness installation selected the baseline installer's allowlist; this was corrected by importing the installer from the selected source snapshot before any repaired live attempt. All repaired sessions use the verified v2 installation.

Behavioral tests cover inconsistent inputs and outputs plus positive controls: supported ratios and conditional arithmetic, complete and partial source tuples, conditional recommendations, weaker supported promises, offline boundaries, and zero-delay commit behavior. Replacing each pure reconciler with an empty result in separate disposable copies made the unchanged focused suites fail: evidence 7/10 failures, inputs 11/13, behavior 7/11. These ablations show test sensitivity, not a causal estimate of live quality.

## Live design and settings

Four transfer scenarios and explicit criteria were frozen before implementation: a privacy publication decision, a safety-training renewal discount decision, a field-access revocation PRD, and a team-chat packaging comparison. They differ materially from the preserved known failures. Positive controls include a supplied randomized prospect experiment with calculable rates, supported PRD behavior, and a useful provisional comparison despite missing own-product demand evidence.

The four original failure prompts were retained as known regressions, not labeled unseen transfer evidence. Groups are reported separately: committed Claude baseline, repaired Claude, fresh repaired Claude repeats, repaired Codex, and original Claude regressions. A bounded semantic pass is limited to the frozen criteria and independently checked material claims. It is separate from structure, evidence acquisition and approval provenance.

Every live invocation counts, including two local permissions preflights and any failed attempts. Sessions run at most two concurrently in fresh disposable projects. Node was 25.4.0, Claude Code 2.1.286 and Codex 0.159.2. Claude requested and reported `claude-opus-5-5`, high effort. Codex requested `gpt-6-astra`, xhigh effort; configured identity does not independently attest the served model. Existing global host profiles were unchanged, so fresh sessions were not sterile global profiles.

Claude used `dontAsk`, restricted tool selection, no external MCP configuration, and allowed plain Node commands. Codex used ephemeral sessions, workspace-write sandbox and live web search. Both were authorized only for public research and local disposable drafting/validation. Compound-command denials, provider errors and tool traces are retained. Plain local writing and installed validator execution succeeded in both preflights. No credentials were inspected or exported, and no real project was installed, published or released.

## Results, execution evidence and cost

**22 of 24 permitted attempts were used:** 20 substantive sessions and two successful permissions preflights. Every invocation completed; there were no network failures or timeouts. The two remaining reserve attempts were not used to chase a passing result.

| Group | Structure | Bounded semantic pass | Mean seconds | Tools | Reported USD |
|---|---:|---:|---:|---:|---:|
| Committed Claude baseline | 4/4 | 3/4 | 263.5 | 109 | 5.36243 |
| Repaired Claude, first sessions | 4/4 | 2/4 | 325.25 | 119 | 6.40183 |
| Repaired Claude, fresh repeats | 4/4 | 1/4 | 341 | 144 | 6.69713 |
| Repaired Codex | 4/4 | 4/4 | 552.5 | 70 commands | Unavailable |
| Preserved failures, repaired Claude | 4/4 | 1/4 | 323.5 | 134 | 6.08888 |

The matched Claude comparison shows no aggregate semantic improvement. Some defects changed, and the PRD repeat varied materially. Four bounded Codex passes have no matched Codex baseline here, so they do not establish a repair effect or host superiority. Known regressions remain distinct from new transfer evidence. Overall, 11 of 20 substantive answers passed the bounded assessment and nine failed. All 20 passed structure and retained absent approval provenance. None is certified in full.

### Every attempt

IDs identify the corresponding `runs/NN-*` evidence directory. S is structural validity; M is the bounded semantic assessment. The per-attempt ledger separately records source support, preservation of facts, consistency and approval, including caveats on passing answers.

| ID | Host / group / case | S | M | Seconds | Observed reason or limit |
|---|---|---|---|---:|---|
| 01 | Claude baseline L1 privacy | Pass | Pass | 320 | Holds publication and retains applicability prerequisites. |
| 02 | Claude baseline L2 renewals | Pass | Fail | 201 | Opening assigns the whole customer population to an unknown renewal window. Correct arithmetic elsewhere does not repair that fact. |
| 03 | Claude baseline L3 field PRD | Pass | Pass | 271 | Preserves core behavior. Host validator attempts denied; coordinator validated saved draft. |
| 04 | Claude baseline L4 team chat | Pass | Pass | 262 | Sampled current competitor tuples and conditions agree with primary sources. |
| 05 | Claude repaired L1 | Pass | Fail | 353 | Correct hold, but data-broker and affiliate applicability omit prerequisites. |
| 06 | Claude repaired L2 | Pass | Fail | 251 | Revenue-weighted formula becomes a seat-weighted retention trigger without equal seat values. |
| 07 | Claude repaired L3 | Pass | Pass | 383 | Core behavior preserved; a separate dialog/acceptance-criterion qualifier mismatch remains. |
| 08 | Claude repaired L4 | Pass | Pass | 314 | Useful qualified comparison; host explicitly retained generated fetch extracts, not raw primary context. |
| 09 | Claude repeat L1 | Pass | Fail | 410 | Table uncertainty becomes categorical applicability and broader closing guidance. |
| 10 | Claude repeat L2 | Pass | Fail | 300 | Heterogeneous contract values become an organization-count retention rule. |
| 11 | Claude repeat L3 | Pass | Fail | 343 | Unestablished manual locking becomes launch behavior and is later described as supplied. |
| 12 | Claude repeat L4 | Pass | Pass | 311 | Conditional comparison preserves unresolved workspace-login entitlement. |
| 13 | Codex repaired L1 | Pass | Pass | 498 | Required legal predicates and unresolved case inputs retained. |
| 14 | Codex repaired L2 | Pass | Pass | 548 | Correct experimental rates and conditional value-weighted renewal economics. |
| 15 | Codex repaired L3 | Pass | Pass | 703 | Proposed stronger behavior separated from supplied limits. Close to the 720-second cap. |
| 16 | Codex repaired L4 | Pass | Pass | 461 | Core prices, cadence, plan conditions and final recommendation agree. |
| 17 | Claude original acquisition failure | Pass | Pass | 126 | Bounded L1 target passes; shared-account commercial-value reasoning still has a separate caveat, as in the prior review. |
| 18 | Claude original price-increase failure | Pass | Fail | 170 | Unweighted extra-churn operating rule and acquisition-to-renewal inference remain. |
| 19 | Claude original SSO PRD failure | Pass | Fail | 599 | Recovery prerequisites improved; IdP-disable guarantee omits optional-password and population exceptions. |
| 20 | Claude original note-pricing failure | Pass | Fail | 399 | Table leaves billing cadence unknown; final comparative positioning drops that uncertainty. |
| 21 | Claude permissions preflight | N/A | N/A | 34 | Local write and plain installed validator succeeded; one denied compound command. |
| 22 | Codex permissions preflight | N/A | N/A | 54 | Local write and plain installed validator succeeded. |

Attempts 21 and 22 ran first chronologically and consumed the reserve allocation. Full prompts, answers, tool events, errors, permission denials, counters and grading rationales are preserved. `acceptance-summary.json`, `semantic-review.json` and `final-metrics.json` index them. Nineteen final saved artifacts were successfully validated after their last rewrite by the host; baseline 3 attempted only denied compound commands. All 20 passed independent coordinator validation of the final saved artifact. Their SHA-256 hashes are retained in those ledgers and each `result.json`. Codex 13, 15 and 16 omitted only the saved memory-citation metadata footer from inline delivery; normalized substantive bodies match, but byte-identical delivery is not claimed. No substantive response contained a public em dash.

### Proof of installed execution and limits

All 16 repaired substantive sessions actually executed their installed reconciliation command and produced a receipt matching both the final saved artifact and logical record hashes. The baseline sessions had no such execution. Traces contain 35 executions, including seven with errors and 28 without errors; instruction reads and denied commands are excluded. Final receipts retain unresolved warnings and do not declare readiness. The collector ran where research was required, but no configured search provider returned results; hosts used permitted public browsing. Successful primary-page capture by the new collector is covered by deterministic tests, not established by these live sessions.

The helper caught missing input excerpts, malformed records, passages outside retained context and mismatched prerequisites. Run 19 emitted three `optional-prerequisite` errors, followed by artifact and record changes and a final zero-error receipt. This is evidence of a local correction during installed use, not a successful whole-answer repair: its unqualified IdP-disable statement still conflicts with optional password access. In run 5 the author repaired record errors while a legal omission survived. Shared author errors and incomplete record coverage are the central remaining limitation.

Material external checks used primary CPPA and California statutory sources, Slack pricing and help documentation, and vendor pricing pages. Exact passages and coordinator retrievals are in `primary-*.json`. The data-broker rule incorporates the CCPA business definition, contradicting run 5's threshold-free assertion. Slack pricing cadence and SAML exceptions were independently confirmed. Obsidian shared-vault support and annual/monthly prices were confirmed. Notion and Craft rendered other currencies to the coordinator; their exact USD tuples were not independently confirmed and are not declared false. Run 20 fails for losing its own stated cadence uncertainty in synthesis. CISA returned 403 to the coordinator, leaving run 19's quotation unverified. These gaps are recorded rather than treated as source support.

### Cost and host limitations

The first repaired Claude group took 61.75 additional seconds per answer on average (+23.4%), used 10 additional tools across four answers, and reported $1.03941 more cost (+19.4%) than baseline. Repeats took 77.5 additional seconds per answer over baseline. The experiment is too small and web activity too variable to attribute these changes causally to the helper. The command itself makes no model calls; composing records and correcting them adds author work.

Claude's unique assistant-response IDs numbered 77 baseline, 93 repaired, 94 repeat, 81 regression and six preflight. These are observable response IDs, not an independently complete count of all provider calls. Claude tools included 11 searches and 97 fetches across all sessions; Codex recorded 14 web-search events in addition to 74 commands including preflight. Nested fetch processing and global profiles affect cost. Codex dollar cost and complete provider-call counts were unavailable. Reported Claude cost across all 17 Claude attempts was $24.85682.

| Group | Input tokens | Cache creation | Cache read | Output | Reported thinking/reasoning |
|---|---:|---:|---:|---:|---:|
| Claude baseline | 154 | 295,792 | 4,287,055 | 94,090 | 24,912 |
| Claude repaired | 186 | 316,015 | 5,017,952 | 130,216 | 37,186 |
| Claude repeat | 188 | 345,830 | 5,366,153 | 131,336 | 32,310 |
| Claude regressions | 162 | 321,237 | 4,736,851 | 121,495 | 29,622 |
| Claude preflight | 12 | 28,494 | 153,159 | 2,396 | 185 |
| Codex repaired | 3,947,667 | 0 | 3,607,808 | 61,874 | 14,341 |
| Codex preflight | 134,816 | 0 | 114,048 | 857 | 114 |

These are CLI aggregate counters across repeated turns, not single-context sizes or directly comparable accounting categories. Claude's detailed `modelUsage` also records nested Haiku processing; its per-model figures and costs are preserved. No worker/coordinator token total is available. Thirty-four Claude permission denials were retained, principally compound shell commands outside the plain-Node allowance; hosts retried allowed plain commands. Codex had no recorded denials. No safeguard was bypassed or global profile changed. Global instruction hashes and available initialization metadata are in `host-customization.json`; Codex used existing memory.

## Independent review

A fresh non-author GPT-6 Sol reviewer at high effort inspected the integrated code, focused tests, package records, actual helper execution and representative passing and failing artifacts. It had a 4,000-token advisory checkpoint; no measured counter was available. The reviewer made no edits and ran no live sessions. Its findings and coordinator reproduction are saved in `independent-review.md` in the evidence directory.

The review found no concrete new machine-check or packaging regression in its focused scope. It independently confirmed the L1 and L3 failures in runs 5, 11 and 19, supported baseline 2's population-preservation FAIL, and supported keeping all four release gates deferred.

One grading correction was accepted after re-reading run 20: using Craft as a flat-model example does not itself require a known billing cadence, so that part of the initial rationale was withdrawn. The narrow FAIL remains for unsupported same-cadence Notion positioning; the numeric inequality is not disproved. This is a comparability/support failure, with useful conditional advice retained. No aggregate counts changed.

A separate final coordinator audit reproduced baseline 3's denied validator calls and corrected the analyzer, which had counted attempts as execution. The report now distinguishes 19 successful host final validations from 20 coordinator validations. All repaired sessions did validate successfully, and all 16 final logical record hashes also match their receipts. No production repair followed review and no additional live attempt was needed.

## Dispositions and release readiness

Evidence-backed dispositions after independent review:

| Finding | Disposition | Evidence and remaining cause |
|---|---|---|
| L1: evidence applicability | Deferred | Executable input/source links now exist, but Claude runs 5 and 9 still omit legal prerequisites in material claims or final guidance. Run 5's author review admits leaving out an unquoted criterion. A consistent self-authored record cannot repair an incomplete legal rule. Codex run 13 preserves the required predicates. |
| L2: inputs and quantitative reasoning | Deferred | Typed inputs and arithmetic checks catch declared scope/role contradictions. Claude runs 6 and 10 still convert heterogeneous contract value into seat/organization retention rules in operative guidance. Codex run 14 uses conditional value-weighted renewal economics correctly. |
| L3: promises and operative behavior | Deferred | The helper checks declared trigger, population, boundary, latency and prerequisite contradictions. Runs 7 and 15 pass the core criteria; repeat 11 promotes unestablished behavior into launch copy. Run 19 fixes declared prerequisites but still overstates IdP-disable coverage. Coverage and assumption labeling remain semantic gaps. |
| L4: competitor evidence and final synthesis | Deferred | Slack comparisons pass sampled core facts, as did baseline. Generated fetch extracts still substitute for directly retained primary context, and run 20 loses its own cadence uncertainty in comparative positioning. No general source-acquisition or final-recommendation improvement is demonstrated. |

**Next specific experiment:** test a narrower pre-draft extraction step that creates canonical supplied-input records and captures cited primary passages with surrounding applicability and table context, then checks the final recommendation for omitted conditions. Freeze that extraction before drafting so the author cannot silently make both sides agree. Compare a focused independent coverage check against the current author-only record on the preserved failures and new positive controls, measuring quality and added cost. This is a proposed bounded experiment, not a new mandatory model chain or authorization to continue this run.

The local repair is complete as an executable, packaged consistency mechanism with behavioral regression coverage. It made some declared contradictions actionable during installed use, but **did not improve aggregate matched Claude semantic results**. The current results do not justify accumulating more wording changes or unscheduled reruns. Structural success and local deterministic repair remain separate from semantic reliability. **Public release remains on hold for L1-L4.**

## Preservation and completion

Before cleanup, 6,314 disposable files were copied to `disposable-snapshot` under the new evidence directory, and every copied file was verified against its original SHA-256. The exact temporary `disposable` directory was then removed after resolved-path containment checks. Former paths in raw traces no longer exist; the snapshot preserves their relative structure. All prompts, responses, errors, tool traces and grading records remain in the durable evidence directory.

The final preservation check confirmed 11,439 protected files unchanged, with no missing or added protected files. That includes the original audit reports, prior evidence archive, benchmark results and telemetry. The three intentionally edited production documents are explicitly excluded from that protected comparison. The installation comparison found all 5,610 installed files across 22 projects unchanged by hosts. No later or unrelated tracked changes were present or discarded.

The verified implementation, focused tests and this new report are the only files included in the local repair commit. Generated benchmark outputs and raw evidence are excluded. Nothing was pushed, published or released. The commit is identified in the completion response and durable `completion-checks.json` to avoid embedding a self-referential commit hash here.
