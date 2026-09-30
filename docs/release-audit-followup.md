# Release audit follow-up

Review date: 2026-09-29. Repair baseline: `c18e4d7`. Repair commit: `38a113849a66eb0af4c793c2e417c74a201a6ef8`. Historical audit: [independent-release-audit.md](independent-release-audit.md), left unchanged. Repair write-up under review: [release-audit-remediation.md](release-audit-remediation.md).

This is an independent re-review of that repair. The remediation report and the green suite were treated as claims. Line numbers refer to `38a1138`. Re-check them before editing.

**Verdict: further repair required.** Routing, packaging, the readiness split, and the fixture replay hold. One comparison predicate still accepts a contradictory visible Decision Frame. Fix that before calling the validation repair closed. Do not reopen the resolved items below.

Live Claude/Codex activation is still unrun. That is a separate acceptance gap, not a reason to redo the code repair.

## What to change

### 1. Stop substring matches on confidence, owner, and date

`scripts/validate-artifact.mjs` lines 278-281. For `confidence`, `owner`, and `decision_date`, the visible line passes when its normalized text contains the normalized JSON value:

```javascript
if (!normalizeProse(value).includes(normalizeProse(String(artifact.decision_frame[key])))) {
  fail(`Visible Decision Frame ${key} disagrees with JSON.`, decision.lineNumber);
}
```

`normalizeProse` lowercases and turns punctuation into spaces. `includes` then accepts a longer or negated string.

Reproduced from `benchmarks/fixtures/prd-hidden-scope-creep/final-pass.md` by changing only the visible line, or the owner pair below. Each result was `valid: true` with no `prose-json-mismatch`.

| JSON | Visible line | Expected |
|---|---|---|
| `confidence: "high"` | `Confidence: highly uncertain` | mismatch |
| `confidence: "high"` | `Confidence: not high` | mismatch |
| `owner: "Alex Kim"` | `Owner: Alex Kimball` | mismatch |
| `decision_date: "2026-04-02"` | `Decision date: not 2026-04-02` | mismatch |

Impact: the check added for SW-VALID-002 still lets the page a person reads contradict the confidence, owner, or date in the envelope. Metric numbers already reject this class of match (`metricValueMatches` requires one parsed number and numeric equality). These three fields need the same discipline.

Smallest fix: do not use `includes` for these fields.

- Confidence is the enum `low`, `medium`, or `high`. Accept the visible value only when that enum word appears as a whole word. `highly` must not satisfy `high`. A negation in that line (`not`, `no`, `never`) must fail.
- Owner and decision date should match the normalized JSON value as a complete value, not as a prefix or an embedded substring. `alex kim` must not satisfy `alex kimball`. A leading negation must fail.
- Keep the existing overlap check for recommendation, tradeoff, and revisit trigger.

Do not build a semantic parser. "Delay the release" versus "Ship the release" can still pass the recommendation overlap test. That limit is already stated in `docs/structured-artifacts.md`: deterministic comparison cannot prove semantic equivalence. The substring cases above are a broken predicate, not that limit.

Regression, in `tests/audit-validation.test.mjs`: the four substitutions above produce `prose-json-mismatch` and `valid: false`. Keep the existing paraphrase test ("Release the bounded support-team workflow handoff") passing.

### 2. Count a bare URL in a Source column as a row source

`scripts/validate-artifact.mjs` lines 982-983 and 1001-1006. A row is treated as sourced only when the Source, Citation, or Reference cell matches `hasCitationMarker`. That helper accepts a bracketed number, `(source: ...)`, a markdown link, or `see https://...`. A cell whose entire value is `https://example.com/pricing` does not match.

Reproduced: a table `| Pro | $49 | https://example.com/pricing |` with header `Source` still yields `unsupported-dollar`. The same price with `[page](https://example.com/pricing)` in the Source cell does not.

Expected: an explicit source column that contains a URL covers that row. A URL in some other column still does not.

Impact is narrower than the first item. The warning is honest about the marker list, and the default CLI exits 0. `--require-ready` then promotes every warning to an engineering blocker, so a normal price table with raw URLs fails handoff.

Smallest fix: if the designated source cell contains `https://` or `http://`, set `source` true. Do not restore the old rule that any URL in the paragraph excuses every number.

Regression: a price table whose Source cell is only a URL produces no `unsupported-dollar`. A URL in a Notes column, with no citation on the price cell, still warns.

### 3. Align the case-study index with the unverified label

`case-studies/README.md` lines 3-4 say the folder is an anonymized, unverified illustration. Lines 7-8 then say "real problems, real stakes, real outcomes."

The case file itself is already qualified. `case-studies/prospect-reframe-to-deal.md` opens as an unverified account and labels the time and outcome as reported. The public README points at "anonymized, unverified usage illustrations." Do not rewrite the narrative to claim the engagement never happened. Lack of a public record does not establish that.

Smallest fix: change lines 7-8 so they do not call the outcomes real or proof. "Reported problems and reported outcomes" matches the header.

Regression: `case-studies/README.md` does not call these outcomes real, proof, or production evidence.

## Do not relitigate

These were checked against `c18e4d7` and against `38a1138`. The remediation rationales hold.

| Claim | Judgment |
|---|---|
| Cited public files named internal tooling | Withdrawn. At `c18e4d7`, README, `agents/orchestrator.md`, and `docs/structured-artifacts.md` described an absent second review in generic terms. They did not name a private product or repository. README and the orchestrator now say "a second automated model review." `docs/structured-artifacts.md` still uses the older generic wording. Leave that disclosure. Do not delete the statement that a second automated review is absent. |
| Lowercase structured enums were already documented | Accepted. `docs/structured-artifacts.md` already required lowercase `mode` and `depth`. Visible comparison folds case. Keep the JSON enums lowercase. |
| The shared contract already overrode older command text | Accepted as a narrowing. Precedence was documented, and no host was run, so there was no observed host failure. The `/write-prd` stop was still in the command the model receives. That stop is gone now. Do not put it back. |
| The Bash updater already delegated to Node | Accepted. Baseline `scripts/sync.sh` already executed `node scripts/install.mjs`. The defect was the documented Windows path. The plugin guide now gives the Node command. Keep `scripts/sync.sh` as a wrapper. |
| The validator already distinguished readiness internally | Accepted, with one correction. The old code used a distinct `readiness-failed` type, then the CLI exited 1 for every issue. Honest FAIL was also severity `error`. The repair makes honest FAIL informational, contract errors exit 1, and `--require-ready` exits 2. Keep that split. |
| Minor deferrals were already informational | Accepted. Minor deferral was severity `info`. The defect was the exit code. Critical deferral correctly blocks readiness without making the envelope malformed. |
| Qualifying the case study is enough | Accepted for the case file and the public README. Do not assert that the engagement did not occur. The index sentence in item 3 is the only leftover. |
| Replacement PASS gates dropped real coverage | Rejected. The six cited gates require evidenced items and say not to invent rows. A one-artifact audit may pass only when it refuses a trend claim. Zero items are not declared universally sufficient. Do not put the numeric floors back. |

## Disposition of the original audit

| ID | Status | Practical result |
|---|---|---|
| SW-ROUTE-001 | Resolved | "Write a PRD for customer onboarding" and "Sprint plan for the engineering team" stay high confidence with `autoEscalate` false. "Here are our prices; recommend packaging" routes to pricing with no external-research blocker. "Look up current competitor prices" still requires research. "for board review" and "status update to customers" still escalate. |
| SW-ROUTE-002 | Resolved | `/write-prd` reuses supplied input, asks at most two questions, and continues past the press release. `commands/start.md` delegates only when the host has an agent tool. |
| SW-ROUTE-003 | Resolved | Light design review and `/tech-handoff` use Engineering, Customer Voice, and Devil's Advocate. Standard and Deep keep seven. Unavailable perspectives stay "Not assessed." |
| SW-VALID-001 | Resolved | Table cells are checked. A URL in another sentence does not cover a percentage. Citation findings are warnings. Default exit is 0. Item 2 above is a leftover strictness, not the original miss. |
| SW-VALID-002 | Partially resolved | Six visible fields, the leading PASS/FAIL line, approval records, and PRD metric columns are checked. Item 1 is the remaining hole. |
| SW-VALID-003 | Resolved | A Light PRD may PASS with an explicit baseline gap and stay directionally ready. Engineering readiness stays false. Strategy does not inherit that exception. An honest FAIL is valid and unready. |
| SW-VALID-004 | Resolved | A waiver needs owner, reason, and `human_decision` with or without `--related`. Minor deferral stays informational. Critical deferral blocks readiness. Colliding finding IDs fail validation. Engineering handoff requires the matching reports. |
| SW-DEC-001 | Resolved | High confidence plus an uncertainty payload stays provisional. `needs_human_review` stays not ready. With the rigor runner absent, the follow-up is evidence or human review. The inner `route()` function still contains "Add a third provider" for a present runner that lacks a third family. Production calls `routeWithCapabilities`. Do not strip that inner branch. |
| SW-DEC-002 | Resolved within the stated boundary | Context files must be regular files inside the scenario directory. Absolute paths, traversal, missing files, secret basenames, and a junction escape fail before the runner. Explicit absolute scenario JSON paths still work. |
| SW-DIST-001 | Resolved | Bundle README is `docs/plugin-guide.md`. Packaged helper commands use the installed root. A disposable project update uses Node and preserves project instructions. The Bash wrapper only delegates. |
| SW-DIST-002 | Resolved; naming allegation withdrawn | See the rationale table. Finish item 3 only. |
| SW-GUARD-001 | Resolved | See the rationale table. |

## Fixture replay

`runBenchmarkSuite` on the seven default scenarios returns four PASS, one FAIL, and two DNF. Keep that expectation.

| Scenario | Status | Why |
|---|---|---|
| `board-update-ambiguity` | PASS | Final envelope valid and directionally ready. First pass still flags `unsupported-numeric`. |
| `churn-conflicting-signals` | PASS | Valid and ready. |
| `event-automation-boundary` | PASS | Final pass valid and ready. First pass still flags `challenge-finding-unresolved`. |
| `prd-hidden-scope-creep` | PASS | Visible fields were filled from the existing synthetic payload. `metadata.status` moved from `approved` to `draft`. No approval record was invented. |
| `pricing-partial-data` | FAIL | Valid strategy that declares FAIL. `readiness.ready` is false. Validator error count is 0. This is the honest-FAIL bucket. |
| `handoff-contradiction` | DNF | Invalid because the waiver still has no `human_decision`. Kept on purpose. Do not add a synthetic approval or waiver record to make it pass. |
| `feature-weak-evidence` | DNF | The visible verdict is FAIL, and the evidence array is empty. Empty evidence on a non-exploratory artifact is a contract error (`missing-evidence`), so the file is unusable. DNF is the invalid bucket. Do not reclassify it as FAIL unless the contract changes. |

`deriveScenarioStatus` in `scripts/run-benchmarks.mjs`: valid and unready becomes FAIL; anything unusable becomes DNF; otherwise the artifact's own PASS or FAIL is the suite status. Readiness INFO does not increment `validator_error_count`.

Earlier files in `benchmarks/results/` were generated before this validator split. Do not compare them to this replay without saying so. Do not commit that directory or `benchmarks/telemetry/`.

## Advice for the patch

- Edit `scripts/validate-artifact.mjs` and `tests/audit-validation.test.mjs` for items 1 and 2. Edit `case-studies/README.md` for item 3. No schema change is required.
- Item 1 is the code change that should land before the audit is closed. Items 2 and 3 can ride in the same patch.
- After the patch, run `node scripts/validate-repository.mjs` and `node --test --test-concurrency=1 tests/*.test.mjs`. The re-review run on this tree was 456 passed, 0 failed, 0 skipped, and repository validation reported 0 errors, 46 frameworks, 7 agents, 17 workflows. Report the new counts from the new run.
- The remediation note says an earlier full run failed two controller tests and a later rerun passed. This re-review ran only the final tree. Do not cite the intermediate failure as something this review reproduced.
- Do not run live model CLIs, search providers, or `scripts/collect-research.mjs` for this patch. Do not install into a real project. The existing disposable-project test is the install check.
- Do not touch `benchmarks/results/` or `benchmarks/telemetry/`.
- Public repo. Packaged files stay free of the internal tooling names. No em dashes in shipped skills, commands, or README text.
- `docs/independent-release-audit.md` stays as the historical record. Point corrections at this file.
- Directory submission still waits on a separate observed Claude and Codex acceptance pass. Fixture replay does not measure model output. `engineeringReady` does not grant human approval. The installer is still not crash-transactional, and retired files are still reported rather than deleted. Those limits are documented and do not need another code change in this patch.

## Checks behind this note

Ran on the `38a1138` tree:

- `node scripts/validate-repository.mjs`: 0 errors; 46 frameworks, 7 agents, 17 workflows.
- `git diff --check c18e4d7..38a1138`: clean.
- `node --test --test-concurrency=1 tests/*.test.mjs`: 456 passed, 0 failed, 0 skipped. The suite includes the fresh bundle, packaged link check, and disposable Node update.
- A local probe imported `validateArtifact` and `runBenchmarkSuite`. It produced the four false agreements in item 1, the bare-URL warning in item 2, and the 4/1/2 replay table above. The probe was not left in the repo.

Not run: live Claude or Codex sessions, search providers, credential use, install into a real project, publication, or push.
