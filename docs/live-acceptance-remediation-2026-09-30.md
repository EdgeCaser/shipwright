# Live acceptance remediation: 2026-09-30

## Verdict

**Local repair: implemented and verified, with partial answer-quality improvement. Public release: HOLD.**

The seven-file instruction and example repair passes the repository checks and a fresh installed-package check. The live evidence does not support marking any of L1-L4 reliably fixed. Their dispositions are **deferred**, with the original and fresh failures retained.

Across **24 attempts**, two produced no answer because of the outer network sandbox. The other **22 answers passed the unchanged structural smoke checker**. Coordinator review records **12 bounded semantic passes and 10 failures**. These are judgments about the tested failure modes, not an overall model ranking or proof that every sentence is true. All 24 attempts count against the authorized cap; no further live sessions were run.

## Scope, ownership and evidence

Baseline and origin/main were verified at `1de6a1c227493dd62a754090c8a4b7085b2768a2`; no commit or push was made. The existing untracked benchmark result and telemetry directories were preserved.

Three non-Astra implementation workers had disjoint ownership and no descendants:

| Work | Model / effort | Advisory checkpoint |
|---|---|---|
| L1/L4 evidence contracts | gpt-6-sol / high | 8,000 tokens |
| L2 decision scope | gpt-6-sol / medium | 6,000 tokens |
| L3 PRD consistency, evaluation and example | gpt-5.6-terra / medium | 5,000 tokens |

These were planning checkpoints, not measured usage. Only the coordinator ran live acceptance, packaging and full tests. A fresh gpt-6-sol/high read-only reviewer used a 4,000-token advisory checkpoint after the first integrated live batch.

The four transfer scenarios were frozen at **2026-10-01T03:58:22.923Z**, before implementation. Their exact wording was withheld from implementation workers. Subjects were a health-app regulatory announcement, education-discount renewals, workspace deletion, and design-review packaging. [Frozen prompts and rubric](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/transfer-scenarios.json>).

Evidence root: [live-remediation](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/paths.json>). Each run retains its prompt, CLI arguments, events, stderr, final response, tool trace and result. [Semantic review ledger](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/semantic-review.json>) separates evidence quality, user facts, internal consistency and approval provenance. [Primary-source observations](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/source-verification.json>) includes access failures and unresolved checks. The original reports and transcripts were not edited.

## Findings, mechanisms and dispositions

| Finding | Disposition | Evidence and remaining gate |
|---|---|---|
| L1: unsupported regulatory reassurance/statistic | **Deferred** | Both original-scenario retries avoid the original reassurance/statistic. Claude transfer 10 still assigns likely non-applicability without necessary facts; repeat 17 improves. Require repeated applicability-input checks on unseen cases. |
| L2: timing and population drift | **Deferred** | Original timing improves, but run 4's summary and revisit trigger overreach. Transfer 12 and repeat 18 misuse the buyer count as a conversion denominator. Final run 23 still asserts detectable-effect size without the inputs, and its trade-off says higher prices arrive now despite the future window. |
| L3: promises conflict with requirements | **Deferred** | Specific IdP/session mismatch improves; run 6 promises recovery protection while allowing no recovery account. Transfer 14 promises immediate cutoff while accepting a percentile delay. Repeat 19 improves. Final run 24 aligns the main five-minute metric but promises universal mobile cutoff while allowing offline-cache purge only on reconnection. |
| L4: competitor plan/cadence errors | **Deferred** | Original run 8 drops cadence caveats in its opening. Transfer 16 falsely excludes Starter signed-in guests. Repeat 20 preserves requested tuples, but still relies on repeated page summaries. Require source context and final recommendation reconciliation. |

### Root-cause evidence

- **L1:** Original Claude governance read the output standard (event line 10) and did no research. It inferred likely low filing risk from headcount and supplied an unchecked acquisition-failure statistic. The FTC's filing tests require transaction and party facts; headcount does not supply them. This was an evidence-handling failure, not a demonstrated routing defect. [FTC filing guidance](https://www.ftc.gov/enforcement/premerger-notification-program/hsr-resources/steps-determining-whether-hsr-filing).
- **L2:** Original Claude read the output standard and pricing skill, rather than the orchestrator. A relative quarter became a specific immediate date; acquisition evidence was extended to renewal behavior. The repair was therefore placed in both decision paths. New run 12 did not visibly receive either specialized boundary paragraph, but it did receive the output standard. Run 23 received the final numerical-input rule and still overreached. Missing consumption explains some exposure differences; it does not explain away observed failures.
- **L3:** Both hosts consumed the installed PRD skill. The original contradiction was within one draft, between its announcement and session requirements. New run 14 reproduces the same general failure with deletion timing. Final run 24 received the added operative-acceptance mapping. No keyword checker is treated as a semantic validator.
- **L4:** Inspection corrected the initial diagnosis: original Claude's WebFetch result itself misassigned Notion audit logs to Business (event line 36, tool result `toolu_01BtSJprS8sg8jKHNAQPCq8D`). It also supplied unsupported annual-price estimates. Final synthesis repeated the extraction error. Notion's primary documentation assigns audit logs to Enterprise. [Notion audit-log documentation](https://www.notion.com/help/audit-log). The new Miro failure is independently contradicted by its signed-in guest permissions. [Miro guest guide](https://help.miro.com/hc/en-us/articles/360021415119-Collaboration-with-Guests).

[Original trace inspection](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/baseline-inspection.json>) and [Changed instruction delivery](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/instruction-consumption.json>) preserve the evidence. The latter records exact changed prose delivered in successful tool results; it establishes delivery only.

### Changed files

- `docs/output-standard.md`: reconcile material claims with inspected evidence through the final summary; require case inputs before reassuring applicability claims; preserve complete price/feature tuples. Follow-up adds calculation units, denominators, populations, time periods and study-design checks.
- `docs/workflow-contract.md`: extracted facts and page summaries remain provisional until source context or corroborating primary evidence supports them. Carry plan and billing boundaries into final claims.
- `agents/orchestrator.md` and `skills/pricing/pricing-strategy/SKILL.md`: preserve timing, customer populations and conditions; separate acquisition from renewal evidence, and conditional revenue arithmetic from forecasts or profit.
- `skills/execution/prd-development/SKILL.md`: trace material promises through scope, requirements, dependencies and rollout. Follow-up compares promises directly with operative acceptance measures, including percentile targets and optional safeguards.
- `evals/prd.md`: add general cross-section consistency anchors. The final anchor no longer repeats the original SSO acceptance scenario.
- `examples/golden-outputs/prd.md`: remove the invented customer quote; bound v1 integrations and read-only behavior; reconcile the actual golden answer with scheduled collection, manual gaps and incomplete evidence coverage. The separate without-Shipwright contrast example remains intact.

No production scripts, schemas, acceptance prompts or graders changed. No new test merely asserts instruction wording.

## Every live attempt

Settings keys:

- **C:** Codex CLI **0.159.2**, configured `gpt-6-astra`, `xhigh`; ephemeral session, workspace-write sandbox, live web search, JSON trace. The trace does not independently certify the served model.
- **H:** Claude Code **2.1.286**, requested and observed primary `claude-opus-5-5`, explicit `high`; no session persistence, strict MCP configuration, `dontAsk`. Read/Write/Edit, local discovery, skills, public web and Node execution enabled. Some results also report Haiku for tool processing.
- **A:** first integrated package. **B:** final reviewed correction package. Same synthetic prompt, operational constraint and host settings within comparisons; each attempt uses a new installed project.

D = reported denied tool calls. A denial is a harness limitation, distinct from a wrong answer. The smoke checker runs outside the host; a structural PASS does not mean the host successfully ran its installed validator.

| # | Settings | Package / group | Finding | Structure | Semantics | D | Observed result / response |
|---|---|---|---|---|---|---|---|
| 1 | C | A / original | L1 | N/A | NOT ASSESSED | 0 | [No answer; network sandbox failure, interrupted.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/01-codex-original-governance-decision/result.json>) |
| 2 | H | A / original | L1 | N/A | NOT ASSESSED | 0 | [No answer; network sandbox failure, interrupted.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/02-claude-original-governance-decision/result.json>) |
| 3 | C | A / original | L2 | PASS | PASS | 0 | [Planning window and cohorts preserved; conditional arithmetic.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/03-codex-original-pricing-decision/response.md>) |
| 4 | H | A / original | L2 | PASS | FAIL | 1 | [Timing improves; summary revenue claim and OR trigger exceed evidence.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/04-claude-original-pricing-decision/response.md>) |
| 5 | C | A / original | L3 | PASS | PASS | 0 | [Provider disablement, local revocation and required recovery identity agree.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/05-codex-original-prd-draft/response.md>) |
| 6 | H | A / original | L3 | PASS | FAIL | 2 | [Offboarding fixed; promised recovery protection remains optional in flow.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/06-claude-original-prd-draft/response.md>) |
| 7 | C | A / original | L4 | PASS | PASS | 0 | [Bounded Notion/Slite examples; own price explicitly proposed.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/07-codex-original-pricing-framework/response.md>) |
| 8 | H | A / original | L4 | PASS | FAIL | 2 | [Opening cadence parity conflicts with own table and Slite source.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/08-claude-original-pricing-framework/response.md>) |
| 9 | C | A / transfer | L1 | PASS | PASS | 0 | [Applicability remains undetermined; no exemption from staff count.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/09-codex-transfer-transfer-regulatory-announcement/response.md>) |
| 10 | H | A / transfer | L1 | PASS | FAIL | 1 | [Likely HIPAA exclusion despite unmapped provider relationships.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/10-claude-transfer-transfer-regulatory-announcement/response.md>) |
| 11 | C | A / transfer | L2 | PASS | PASS | 0 | [H2 window, rolling renewals and cohort boundaries preserved.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/11-codex-transfer-transfer-education-renewals/response.md>) |
| 12 | H | A / transfer | L2 | PASS | FAIL | 1 | [Buyer count becomes conversion denominator; count/revenue assumptions missing.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/12-claude-transfer-transfer-education-renewals/response.md>) |
| 13 | C | A / transfer | L3 | PASS | PASS | 0 | [Access cutoff and requirements agree; backup clock explicitly unresolved.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/13-codex-transfer-transfer-record-deletion/response.md>) |
| 14 | H | A / transfer | L3 | PASS | FAIL | 1 | [Immediate lock conflicts with p99 five-minute target.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/14-claude-transfer-transfer-record-deletion/response.md>) |
| 15 | C | A / transfer | L4 | PASS | PASS | 0 | [Primary plan/price tuples preserved; visitor-document conflict explicit.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/15-codex-transfer-transfer-visual-collaboration/response.md>) |
| 16 | H | A / transfer | L4 | PASS | FAIL | 2 | [Wrong Starter guest tier drives packaging recommendation.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/16-claude-transfer-transfer-visual-collaboration/response.md>) |
| 17 | H | A / repeat | L1 | PASS | PASS | 1 | [No probable exemption; required applicability inputs remain open.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/17-claude-repeat-transfer-regulatory-announcement/response.md>) |
| 18 | H | A / repeat | L2 | PASS | FAIL | 1 | [Repeats unsupported conversion interval from buyer count.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/18-claude-repeat-transfer-education-renewals/response.md>) |
| 19 | H | A / repeat | L3 | PASS | PASS | 1 | [Consistent access cutoff; backup assumption labeled and gated.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/19-claude-repeat-transfer-record-deletion/response.md>) |
| 20 | H | A / repeat | L4 | PASS | PASS | 2 | [Required tuples correct; monthly unknown; extraction remains summary-only.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/20-claude-repeat-transfer-visual-collaboration/response.md>) |
| 21 | C | A / original retry | L1 | PASS | PASS | 0 | [Fresh retry: no headcount reassurance or unverified failure statistic.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/21-codex-harness-retry-governance-decision/response.md>) |
| 22 | H | A / original retry | L1 | PASS | PASS | 1 | [Regulatory unknown; shared-account value overstatement remains a caveat.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/22-claude-harness-retry-governance-decision/response.md>) |
| 23 | H | B / affected | L2 | PASS | FAIL | 1 | [No numeric interval, but still asserts sample sensitivity with unknown denominator.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/23-claude-after-review-transfer-education-renewals/response.md>) |
| 24 | H | B / affected | L3 | PASS | FAIL | 1 | [Main five-minute target now agrees with its metric, but the universal mobile-access promise conflicts with offline-cache purge only on reconnection. L3 remains deferred.](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/runs/24-claude-after-review-transfer-record-deletion/response.md>) |

Original versus transfer: all eight Codex answers preserve the targeted boundaries; the archived Codex originals already did so. In Claude's first successful original set, L1 improves while L2-L4 retain material residuals. All four first Claude transfers fail the targeted semantic review. Three clean repeats improve (L1/L3/L4); L2 still fails. Both affected final checks are recorded above and do not replace earlier samples.

### Permissions and comparison limits

Attempts 1 and 2 could not reach provider services under the outer sandbox and were interrupted. Their retries are 21 and 22. An initial escalation was automatically rejected over alleged insufficient authorization to transmit repository-derived material. The coordinator cited the user's explicit authorization and verified that staging contained distribution/installer files without credentials; the same bounded live action was then approved. No unresolved permission request remains.

Claude repeatedly formed compound shell commands that exceeded its Node allowlist. Some recovered with a plain Node command; others honestly disclosed that validation did not run. Runs 12 and 23 also disclose changes after validation. Permission failures remain separate from visible semantic contradictions. The local writing tools were enabled throughout this repair.

Compared with the archived baseline, Claude effort is now explicitly high (earlier effort was not recorded), Write/Edit are enabled, draft-writing permission is stated, and concurrency is capped at two rather than three per host. Codex explicitly selects live web search. Normal host customization remained present: Codex read user memory and, in one case, the writing-style skill. Fresh sessions and projects therefore do not mean sterile host profiles.

Some research collectors returned empty packs because no search provider was configured. Other answers skipped the collector based on an overbroad interpretation of credential or scratch-path restrictions. These traces do not establish uniform protocol compliance. Public source checks found inaccessible pages and cross-page disagreements; missing evidence is retained as a gap. There was no private-app use, credential inspection, publication, real-project installation or external-system mutation observed in the reviewed traces.

## Independent review and final correction

[Independent-review record](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/independent-review.json>) records the fresh reviewer, exact findings and dispositions. It confirmed the four transfer failures and the bounded improvements in runs 19 and 22. Run 22's claim that shared accounts cannot create acquisition value overstates its own split-spend exception; it is retained as a reasoning caveat even though the original L1 regulatory behavior improved.

The reviewer reproduced two integration issues: the actual golden PRD still promised more than its requirements, and the evaluation anchor repeated the acceptance scenario. Both were corrected. It initially compared the golden answer against the separately labeled baseline example; the coordinator challenged that comparison and the reviewer withdrew it. Only the reproduced contradiction within the actual golden answer was repaired.

One follow-up batch added general quantitative-input and promise-to-acceptance checks, reconciled the example, and generalized the evaluation anchor. The coordinator assumed ownership after the workers finished. The last two authorized sessions tested the affected education and deletion transfers. No additional reviewer, worker descendants or live attempts were started.

## Verification and preservation

- Focused regressions passed before and after integration: release contracts, artifact validation, CLI help, live acceptance grading, routing, distribution and price tuples.
- Repository validator: **0 errors; 46 skills, 7 agents, 17 workflows**.
- Full documented Node suite: **584 passed**, 0 failed/cancelled/skipped, both before review and after the final correction. [Final test log](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/full-final-spec.txt>).
- `git diff --check` passed. Existing V1-V7, structured PRD validity/readiness and L6 heading regressions remain green. L5's prior successful structured retest is preserved; the narrative PRD sessions here do not establish new structured-host reliability.
- Fresh initial and final bundles: **123 files, 48 bundled skills, 10 script imports and 41 checked relative/helper references**. All seven changed source files match packaged bytes after the expected path rewrites. Public bundle em dash checks passed. [Initial package and ablation check](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/package-verification.json>); [Final package check](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/package-final-verification.json>).
- Disposable ablation restored baseline versions of the seven files only in a copied source tree and rebuilt it. All seven packaged hashes changed as expected. This is deterministic propagation evidence, **not** a live semantic ablation or proof that instructions caused a better answer.
- Final preservation checks compare **4,505 protected files** and **5,856 installed-file hashes**. Benchmark results remain 4,112 files, telemetry 1 file, original evidence 387 files; five protected reports account for the remainder. No original evidence or protected benchmark file was added, changed or removed. [Hash comparison](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/protected-check.json>).
- All new final responses contain zero em dashes. Complete disposable sources, bundles, project drafts and research packs are archived and byte-verified before temporary-directory removal. [Archive verification](<C:/Users/ianfe/.codex/visualizations/2026/10/01/01a0f59b-39f9-7020-8dea-f599fcc4cc0b/live-remediation/archive-check.json>). The evidence manifest covers the retained files. The named temporary directory was removed after archival; an elevated cleanup was needed for the disposable Codex instruction copies.

Commands are recorded in the harness and logs. The full suite used `node --test --test-concurrency=1` with spec/TAP reporters and `tests/*.test.mjs`. No tests were weakened to accept an incorrect response.

## Remaining release gates

1. **L1:** evaluate applicability from a required-input record and refuse a case-specific probability conclusion until those inputs are evidenced. Repeat on unseen domains with expert review.
2. **L2:** test a separate input-normalization/checking step that records units, denominators, cohort and time window before calculation; compare the final summary and trigger against that record. Run 23 shows that an additional instruction alone is insufficient.
3. **L3:** test a separate consistency pass over concrete requirement/acceptance pairs, including optional prerequisites and timing quantifiers. Recheck both original SSO and different state-change tasks across repeated sessions.
4. **L4:** test evidence capture that retains primary plan rows and their context, with an explicit unknown when only an uncorroborated summary is available. Independently reconcile the recommendation against those rows.
5. Make installed validator execution dependable under the declared host permissions, and require final-artifact validation after any rewrite. Keep structure, readiness, source truth and human approval distinct.
6. A maintainer must review the retained answers, primary-source gaps and approval provenance before release. Passing tests, citations and assistant review are insufficient release authorization.

The bounded repair is complete at the authorized session limit. The remaining work is a new evidence-handling experiment and repeated acceptance, followed by human release review.
