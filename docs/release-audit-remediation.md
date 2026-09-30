# Release audit remediation

Baseline: `c18e4d7`, inspected 2026-09-29. The historical [independent audit](independent-release-audit.md) remains unchanged. Existing `benchmarks/results/` and `benchmarks/telemetry/` are preserved and excluded from this repair.

**Local repair complete:** all 12 audit IDs have supported dispositions below; the final local suite passes 456/456. Release sign-off remains blocked on the separately observed Claude/Codex acceptance pass.

## Contract decisions

- Contract validity and intended-use readiness are separate. Warnings and informational findings remain visible. An honest FAIL is not a malformed artifact. Engineering handoff explicitly requires engineering readiness.
- Light PRD PASS means directional use only. Missing measurements stay explicit and cannot become fabricated zeroes or engineering approval.
- Approval and waiver records need a human identity, decision reference and timestamp. Deterministic checks can verify record structure, not authenticate a human decision. No historical fixture receives a synthetic approval.
- Resolution entries are checked without related reports. Handoff must include reports needed to verify finding identity, severity and coverage.
- Visible required fields and structured signatures must agree substantively. Equivalent prose is allowed; deterministic comparison cannot establish complete semantic equivalence or source truth.
- Helpers resolve from the absolute installation root while project work stays project-local. Scenario context is confined to the resolved scenario directory; traversal, secret names, missing files and linked escapes are rejected before model execution.

## Disposition tracker

| Audit finding | Disposition | Repair and verification |
|---|---|---|
| SW-ROUTE-001 | Fixed | Reader phrases are distinct from product subjects. Supplied prices/packaging routes to pricing without external research; explicit fresh lookups retain research escalation. Regression coverage includes customer onboarding, engineering sprint planning and actual customer-facing updates. |
| SW-ROUTE-002 | Fixed | Removed the press-release approval stop; reused supplied inputs and limited questions; delegation depends on host support. Clear routes bypass the helper without forcing Rigorous mode. Command regressions in `tests/audit-distribution.test.mjs`. |
| SW-ROUTE-003 | Fixed | Review output and handoff now follow selected depth; Light covers three core perspectives. Engineering delivery separately requires the structured PRD readiness gate and technical-spec semantic review. Depth regression in `tests/audit-distribution.test.mjs`. |
| SW-VALID-001 | Fixed | Numeric claims in tables, including pricing rows, receive citation checks. Sources attach to a sentence/cell or explicit row source; unrelated paragraph URLs no longer excuse claims. Warnings remain visible and default to exit 0. Regression coverage in `tests/audit-validation.test.mjs` and `tests/validate-artifact.test.mjs`. |
| SW-VALID-002 | Fixed within documented comparison limits | Six visible Decision Frame fields and the actual leading readiness verdict are checked for all structured Markdown. PRD metric fields bind to their table columns, including numeric strings and sign. Approval requires a traceable human decision record. The incomplete/self-approved pattern remains a negative regression; the canonical PRD is an honest draft. Equivalent wording has a positive regression; arbitrary semantic equivalence still needs review. |
| SW-VALID-003 | Fixed | API and CLI distinguish contract validity, declared-use readiness and engineering readiness. Light PRDs retain explicit baseline gaps; an honest FAIL stays valid. Engineering handoff requires complete measurements/decisions, detailed PRD requirements and required review context. Producer, schema, documentation and benchmark consumer agree; tests exercise valid directional PASS, honest FAIL and CLI exit codes. |
| SW-VALID-004 | Fixed | Resolution entries are checked intrinsically, including waiver owner/reason/human provenance. Minor deferral stays informational; Critical deferral blocks readiness. Engineering handoff requires reports matching each resolution and dispositions for supplied findings. Colliding report IDs fail validation. Regressions cover missing reports, unrelated reports, collisions and waivers with/without related context. |
| SW-DEC-001 | Fixed | High confidence with an uncertainty payload remains provisional. Human-review flags still block acting. Capability-aware routing offers evidence or human review when the automated rigor runner is absent, including one-provider governance. Unit regressions cover these branches without live calls. |
| SW-DEC-002 | Fixed within the stated filesystem boundary | Context files must be regular files under the scenario directory; absolute/drive-relative inputs, traversal, missing files, known secret names and realpath escapes fail before runner invocation. Synthetic tests cover the session-service path and a Windows junction escape. Relative scenario identifiers cannot escape their scenario root. Explicit absolute scenario JSON paths remain supported. |
| SW-DIST-001 | Fixed | Added a package-specific guide, quoted absolute installed helpers and portable Node update guidance. Packaged golden examples repair four additional broken links. Tests inspect helper references and Markdown links, build a fresh temporary bundle, and apply a changed-source update in a disposable project. Local edits and project instructions survive; conflicts are detected before writes. The existing Bash wrapper already delegates to Node. |
| SW-DIST-002 | Fixed in part; allegation rejected in part | README and case study label the outcome as an unverified reported illustration. The named public documents contain generic absent-review descriptions, not an identifiable internal tool name; that allegation is unsupported. Accurate unavailable-review disclosures remain. No assertion is made that the engagement did not occur. |
| SW-GUARD-001 | Fixed | All six cited PASS gates use meaningful scope/evidence coverage instead of numeric floors. A single-artifact audit is valid with an explicit limit on trend conclusions. Focused instruction regression checks cover all six skills; zero items is not declared universally sufficient. |

Lowercase structured enums are already explicitly documented and are retained. The shared workflow contract already overrides older command instructions; conflicting text is being removed, without claiming a host failure was observed. The redundant Linux validation-only CI job was removed because the three-platform test matrix already runs the same Node validator.

## Verification

Final verification on local Windows:

- `node --test --test-concurrency=1 tests/*.test.mjs`: **456 passed, zero failed or skipped**.
- `node scripts/validate-repository.mjs`: **zero errors**, 46 frameworks, seven agents, 17 workflows.
- `git diff --check`: **clean**.
- The suite builds fresh temporary bundles with 48 flat skill directories, imports the packaged validator, checks packaged Markdown links and relative helper commands, and verifies the linked golden examples are present.
- Disposable-project tests use the Node installer to apply an actual source change, preserve project instructions/local additions, reject linked installation directories, and stop local-edit conflicts before any update writes. No Bash is required for that update path.
- Context-file regressions use synthetic files and injected runners. The Windows junction escape test ran successfully; no security test was skipped.

The first full suite ran 451 tests: 449 passed and two controller regressions failed. Both were repaired; the affected controller/orchestrator rerun passed 80/80. The final full run was justified by those failures and the subsequent review fixes. No live provider/search calls, credentials, real-project installation, host activation, publication or push were performed.

A fresh non-author reviewer found four additional gaps: string-valued numbers could match longer values by substring; a visible FAIL could be excused by a later mention of PASS; the Light PRD measurement exception also applied to strategy; and the text CLI omitted engineering-readiness blockers. All four now have focused regressions and fixes. The reviewer confirmed the repairs and found no further material defect in the bounded review. Parent integration additionally removed a price-table exemption, retained waiver ownership requirements, and bound related reports to their actual finding IDs. Documentation clarifies that deterministic engineering readiness does not confer human approval or authorization.

Fixture migration uses only existing synthetic payload values to complete visible fields and removes unsupported `approved` labels. The historical `handoff-contradiction/final-pass.md` still claims a waiver without traceable provenance; it is deliberately retained as an invalid negative regression. The replay now expects four PASS, one FAIL and two DNF results instead of five/one/one. Readiness failures no longer inflate contract-error counts. Earlier generated results remain untouched and are not directly comparable without noting this validator change.

## Remaining release limits

Actual Claude/Codex activation, model behavior, source truth, provenance authenticity and independent review require separately observed acceptance. Fixture replay is deterministic regression evidence only. Installer conflict preflight does not provide crash rollback, and retired files remain reported for deliberate review rather than automatic deletion.

The context guard is a path/name boundary, not an operating-system sandbox or secret-content detector. A concurrent filesystem mutation can race preflight/read, and an innocuously named hardlink is not distinguishable through realpath. Use trusted scenario directories; no real secrets were used to test these boundaries.

## Resources

Coordinator: Astra. Implementation workers: `gpt-6-sol` at high effort for validation and routing/security; `gpt-5.6-terra` at medium effort for distribution/instructions. Initial advisory checkpoints: 12,000 / 8,000 / 8,000 tokens. Validation received a 4,000-token allowance increase for visible metric binding and readiness regressions; distribution received 2,000 more for actual changed-source package/update verification; routing received 2,000 more for the two observed controller regressions. No worker token counters or enforceable token caps are exposed; these are planning allowances, not measured usage. A fresh non-author `gpt-6-sol` worker reviewed the integrated changes at high effort (5,000-token advisory checkpoint). No model substitutions or descendant agents were used.
