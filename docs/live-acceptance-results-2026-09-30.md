# Live acceptance results: 2026-09-30

## Verdict

**Public release remains on hold.** The V1-V7 local repair passes deterministic checks. Real installed-host sessions now provide additional evidence, but transcript inspection found four material answer-quality failures. An initial structured PRD mismatch passed on a fresh retest with draft-writing tools enabled; the original failure remains in the record.

This follows [the local remediation report](release-readiness-remediation-2026-09-30.md). Its no-network/no-live statement describes the earlier repair phase. The user separately authorized these live sessions and public research afterward. The historical independent audit is unchanged.

## Method and evidence

- Windows, September 30 Pacific time (October 1 UTC). Each case used a fresh disposable project installed from the repaired checkout.
- Codex CLI 0.159.2, configured `gpt-6-astra` at `xhigh`: nine new scenarios plus the earlier structured PRD smoke test. That earlier test used local-only constraints, so these are ten distinct scenarios across two runs, not a uniform ten-case batch.
- Claude Code 2.1.286: ten scenarios, observed primary model `claude-opus-5-5`. Some results also report `claude-haiku-4-5-20251001` for host tool processing. No Agent tool was enabled.
- The canonical questions in `scripts/live-acceptance.mjs` were unchanged. Every new batch question received the same operational constraint: disposable project, public research allowed, no private apps, credential inspection, other agents, installed-instruction changes, publication or external-system changes; answer inline.
- Up to three sessions ran concurrently within each host. All 19 batch sessions exited successfully without a timeout. This is one sample per scenario, not a reliability estimate or model comparison.
- Claude used `dontAsk` with reading, skills, public web tools and Node shell commands allowed. A structured PRD scratch-file shell command was denied. The resulting output explicitly disclosed that validation had not run. A separate retest enables local Write/Edit tools; its result is recorded below.
- Public web requests appear in the actual Claude tool trace even where the aggregate `server_tool_use` counters say zero. Those counters must not be interpreted as no browsing.

Local evidence directory:

`~/.codex/visualizations/2026/09/30/01a0f474-28ee-72d0-8c41-04d39306bd8e/shipwright-live-acceptance-2026-09-30/`

Each `<host>/<scenario-id>/` contains the exact prompt, final response, event trace, stderr and result. The root contains original and regraded results, the runner, installed-file snapshot, regression evidence, full test logs and protected-file hashes. These are local artifacts, not committed benchmark results. The earlier Codex PRD evidence remains in the sibling `shipwright-live-test/` directory.

## Scenario results

Smoke results below use the corrected heading grader. The original batch reported 17/19; regrading the same unedited transcripts reports 18/19. Including the earlier Codex structured PRD gives 19/20 distinct scenarios. A smoke pass checks structure, not the truth of an answer.

The additional Claude structured PRD retest passed, for 21 total live sessions including the earlier Codex smoke. This does not replace the initial failing sample or establish repeatability.

| Scenario | Codex smoke | Claude smoke | Coordinator inspection |
|---|---|---|---|
| `ambiguous-pricing-decision` | PASS | PASS | Both requested clarification without a verdict. |
| `coding-question` | PASS | PASS | Both produced ordinary debounce code using `clearTimeout`, without PM closing sections. |
| `governance-decision` | PASS | PASS | Codex kept acquisition conditional on diligence. Claude made an unsupported regulatory inference from headcount; material failure L1. |
| `pricing-decision` | PASS | PASS | Codex stated the revenue arithmetic assumptions. Claude changed the timing premise and overextended a new-customer test; material failure L2. |
| `build-vs-buy-decision` | PASS | PASS | Both gave provisional buying recommendations and identified missing internal costs. Claude generalized its assumed maintenance-cost crossover too strongly; the figures remain assumptions, not a procurement case. |
| `prd-draft` | PASS | PASS | Both acknowledged missing first-party evidence. Claude's offboarding promise conflicts with its own session-lifetime requirement; material failure L3. |
| `pricing-framework` | PASS | PASS after grader repair | Both labeled proposed prices as hypotheses. Claude misstated a competitor feature tier; material failure L4. Its initial missing-heading failures were checker false negatives. |
| `market-sizing` | PASS | PASS | Both exposed assumed buyer filters and contract values. Codex's sampled arithmetic reconciled. Claude's confidence and description of its SOM as a solid plan overstate assumed sales capacity; its rounded 55 customers corresponds to 53 after stated churn. Neither estimate is validated market truth. |
| `competitive-landscape` | PASS | PASS | Both used primary pricing pages and identified hypotheses. Several key prices were spot-checked; complaint trends and every feature/fee were not independently verified. |
| `structured-prd-artifact` | PASS, earlier run | FAIL | Claude's visible metric name includes a definition absent from JSON; material contract failure L5. Both retained exploratory readiness FAIL rather than claiming approval. |

The coordinator read the responses and inspected relevant tool traces. This is assistant review, not independent human acceptance or proof of all source claims.

## Material findings and dispositions

### L1: unsupported regulatory reassurance, unresolved

In `claude/governance-decision/response.md`, the answer infers likely low US filing risk from a target having 30 employees. It had neither transaction value nor relevant party financials, and its trace contains no research call. The [FTC filing tests](https://www.ftc.gov/enforcement/premerger-notification-program/hsr-resources/steps-determining-whether-hsr-filing) depend on commerce, transaction value, party size and exemptions; headcount does not establish those conditions. The answer also quotes an acquisition-failure statistic from memory without verifying it.

The output-standard evidence rule was read by this session and already requires support or an explicit assumption for every material claim. This is a reproduced output failure, not evidence that the local router chose the wrong route. No host instructions were tuned to this acquisition question.

### L2: altered pricing premise, unresolved

In `claude/pricing-decision/response.md`, the answer treats a change "next quarter" as an immediate change on the quarter's first day, then uses that invented effective date to justify postponement. The prompt supplied no notice date, effective date, customer cohort or jurisdiction. Its proposed trigger for extending a change to existing subscribers also relies on new-customer conversion without establishing renewal behavior. A valid next step is to obtain those missing facts; the transcript cannot establish them.

### L3: inconsistent PRD offboarding promise, unresolved

In `claude/prd-draft/response.md`, the proposed press release promises that access ends as soon as IT disables the IdP account. The FAQ says existing sessions survive until their configured lifetime expires and SCIM is outside v1. The former promise exceeds the latter requirements. The draft correctly reports missing customer data, but that does not make contradictory security behavior ready for handoff.

### L4: competitor claim contradicted by source, unresolved

In `claude/pricing-framework/response.md`, the answer places Notion audit logs in its Business tier. The [Notion pricing page](https://www.notion.com/pricing) places audit logs under Enterprise. The source was accessed in the live trace, so a citation and successful fetch did not guarantee accurate synthesis. The same output supplies inferred annual discounts without clear supporting billing-cadence evidence. Its proposed price is explicitly a hypothesis, but the competitor benchmark still requires correction.

### L5: structured metric mismatch, reproduced; host reliability unresolved

The original `claude/structured-prd-artifact/response.md` fails the installed contract: the metric cell appends a parenthetical definition to the JSON metric name and includes no matching metric ID. The other two metric rows agree. The validator's exact-name-or-ID matching is intentional.

In a disposable copy of the response, moving only that definition into a separate paragraph makes structural validation pass, while readiness remains FAIL. See `metric-name-reproduction.json` and `metric-name-corrected.md`. The original response is preserved. This manual correction is not counted as a successful host run. The initial host could not run its attempted scratch-file validation command under the test permissions.

**Fresh retest: PASS.** Same canonical question and operational constraint, new installed project, now with Write/Edit tools enabled. The host wrote `.shipwright/scratch/self-serve-sso-prd.md`, recovered from a compound-shell-command denial by using a plain Node invocation, ran the installed validator, and fixed an unsupported-numeric warning. Its final validator result contained only informational exploratory readiness FAIL. The coordinator also graded the returned inline artifact successfully. See `retest/claude/structured-prd-artifact/` and `retest-results.json`. No source, framework, host instruction or acceptance question changed between runs. The observed recovery supports making local draft-writing available for structured artifact work; randomness and changed permissions are confounded, so it does not prove causation or reliability.

### L6: closing-heading false negatives, fixed

The live pricing answer used `Unknowns and evidence gaps`, `Pass/Fail readiness` and `Recommended next artifact`. It included substantive content under all three. The grader accepted `and` but required exact capitalization, contrary to the output standard's allowance for varied phrasing.

Changed `scripts/live-acceptance.mjs`, `tests/live-acceptance.test.mjs` and `docs/live-acceptance.md`: closing-heading recognition and boundaries ignore case. Decision-label recognition remains separate so a Decision Frame field is not mistaken for a top-level verdict section. Empty sections and forbidden PM closing sections in coding responses still fail.

The new regression passes. In a disposable module copy, disabling only the case-insensitive matching makes the unchanged live response fail on those three headings again; the repaired grader passes it. See `heading-ablation.json`. No shipped instructions or fixed acceptance questions changed.

## Verification and limits

- Focused live-acceptance tests: 15 passed.
- Full documented Node suite after the checker fix: 584 passed, zero failures, cancellations or skips. Spec and TAP reports were redirected to the named temporary directory.
- Repository validator: zero errors, 46 skills, seven agents, 17 workflows.
- Protected-file comparison: all 4,114 files unchanged, including the historical audit and 4,113 benchmark result/telemetry files; file count unchanged.
- All 4,880 recorded installed-file hashes matched after the batch and retest; root host instruction files also matched the installed snapshot.
- No em dash appeared in the 19 original batch responses, earlier Codex PRD or Claude retest. Public-source checks and final cleanup are recorded with the completion evidence.
- The checker is not distributed in the plugin, so this follow-up did not change the previously verified bundle or installed instructions. Fresh disposable installs supplied the live sessions.
- `git diff --check` passed. The named temporary directory was removed after evidence archival. No commit, push or publication occurred.

The live runs exercise the Windows CLI hosts with the listed tool restrictions. They do not establish desktop UI behavior, other operating systems, all supported model settings, repeatability, source truth, legal correctness or human approval. Collector fallback was exercised where no search provider was configured; private authenticated research was not tested. Permission choices affected at least one validation attempt.

## Next release gate

Preserve the failures as regression examples. Repair evidence discipline and cross-section consistency through general contracts or validation, then test fresh questions and repeated runs before claiming improved reliability. Have a maintainer review sources, approvals and the retained outputs. Do not publish on the strength of structural pass counts.
