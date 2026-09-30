# Release contract review

## Conclusion

The repository had meaningful contract and execution failures despite a green test suite. This review corrected the failures listed below and added regression checks. It does not establish that model behavior is infallible or that Shipwright outperforms other prompts.

**Release status:** deterministic checks and package validation pass. Live activation and representative end-to-end behavior on both target hosts remain unverified; complete `docs/shipwright-v2-proof-runbook.md` before claiming cross-host release sign-off.

## Scope

Reviewed the 46 framework skills, two Codex entry skills, seven agent definitions, 20 commands (17 workflows plus three helpers), output and recovery contracts, three artifact schemas, routing and session execution, research retrieval, benchmark/blind-review tools and installation paths. Existing local run outputs and telemetry were preserved. No directory submission, remote publication or plugin installation into the user's host was performed.

## Material findings and fixes

| Priority | Failure | Correction |
|---|---|---|
| High | Empty/malformed artifacts could pass or crash validation; a Sources heading suppressed claim checks. | Fail empty, duplicate, truncated and non-object envelopes; validate shape before semantics; require nearby citation markers for detected prose claims. |
| High | Automated consumers required JSON that authoring skills never promised to emit. | Shared structured-handoff contract, explicit producer request, schemas available in installed bundles and a prose/JSON agreement check. Ordinary chat does not require duplicated JSON. |
| High | Missing and blank fields, duplicate IDs, dangling evidence references and assumptions could masquerade as support. | Required fields and nonblank values enforced; evidence IDs checked; assumptions distinguished from factual support; metric/date checks tightened. |
| High | Challenge severities/verdicts disagreed across prose and schemas; review findings could disappear at handoff. | Stable finding IDs, canonical verdicts and severity names, Critical-to-ESCALATE rule and explicit resolved/waived/deferred disposition. Human waivers cannot be invented. |
| High | Runtime offered an absent multi-model harness and could suppress human-review needs; uncertainty data disappeared in presentation. | Capability-aware execution routes, preserved human review, required actionable uncertainty payload and correct nested-payload presentation. |
| High | Re-analysis reused the same evidence or the old scenario prompt; a nonzero process exit could count as successful analysis. | New evidence required for another analysis, otherwise produce a collection brief; use the refined prompt; preserve context files and reject failed/timed-out processes. |
| High | Installer could overwrite root instructions or local files and omit required schema/doc dependencies. | Full bundle install, hash-based ownership, conflict preflight, symlink refusal, no automatic deletion and preservation of root instructions. |
| Medium | Explicit commands and binary decision questions misrouted; workflow roles lacked required skills. | Command precedence, corrected decision-class matching, route/agent permission alignment and repository-wide registration checks. |
| Medium | Light-depth omissions conflicted with PASS gates; arbitrary sample/finding/action quotas encouraged blocking or invention. | Depth-aware intended-use gates, support sparse scoped evidence, preserve material safety checks and eliminate invented quotas. |
| Medium | Repeated approval, classification, formatting and repair steps added cost without improving the artifact. | One shared contract, optional helpers, reuse upstream work, no blanket plan approval and one bounded repair. Nested orchestrators return plans to the main dispatcher. |
| Medium | Research timeout covered only response headers. | Deadline remains active through response body consumption, tested against a stalled local response. |
| Medium | Benchmark summaries trusted stale aggregates, accepted invalid ratings and duplicate raters, and could silently omit unknown scenarios. | Recomputed aggregates, bounded scores, distinct IDs, validated assignment slots and strict scenario selection. |
| Medium | Blind-review ordering used a public fixed seed and packed the condition key beside reviewer material. | Private random seed by default; separate reviewer/admin folders. Actual independence and blinding still require human verification. |
| Medium | Documentation implied fixture replay proved quality and included incorrect API/install examples. | Corrected examples, restored scoring/proof documentation and explicitly separated fixtures, live model checks and independent comparison evidence. |

## Verification

- 417 Node tests pass on the local Windows environment, including 40 added regression tests. Baseline: 377 tests.
- Repository validator passes for 46 frameworks, seven agents and 17 workflow registrations, including referenced public docs and evals.
- Seven fixture scenarios replay as expected: five PASS, one FAIL (pricing evidence insufficient), one DNF (weak-evidence PRD incomplete). These deliberate failures remain failures; publishable proof readiness is false.
- Generated package contains 48 flat skill directories with dependencies. Codex's plugin validator passes. Claude Code's strict manifest validator passes with no warnings; its result did not enumerate skill contents, so this is manifest validation only.
- Existing-artifact compatibility is stricter: older partial v2 payloads require revalidation and evidence-backed repair. Never automatically fill missing business facts to migrate them.

## Remaining limits

The validator checks a useful subset of correctness. It cannot establish source truth, human approval, reviewer independence, complete contradiction coverage or agreement between all visible prose and hidden JSON. Source support, constraint propagation and actual model compliance need the observed cases in `evals/release-acceptance.md`. No independent live comparison was run during this review.

CI runs the Node tests on Windows, macOS and Linux; only the local Windows run was observed here. Full installer rollback after disk or process failure is not transactional; conflict detection occurs before writes, and local-file conflicts are protected.
