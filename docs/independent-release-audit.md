# Independent release audit

Audit date: 2026-09-29. Snapshot: commit `8f7ffaf` (`Harden Shipwright contracts, evaluation safeguards, and distribution`). Versions in `manifest.json` and `.claude-plugin/plugin.json` are `2.3.0`.

This pass inspected the committed tree after `docs/release-review.md` had already landed. It did not run the test suite, build a bundle, install the package, call a model, or submit anything to a directory. Line numbers refer to `8f7ffaf`. Re-check them before editing; do not assume they survived later commits.

**Release recommendation: hold.** Do not submit this tree to the Claude or Codex directories until the high findings below are fixed and the local regressions are run. Live host activation remains a separate, still unrun, acceptance pass.

`docs/release-review.md` is the prior pass. Its green local suite and its "deterministic checks pass" status do not cover the defects below. Several of its claimed fixes are only partly present.

## How to read a finding

Each finding has the file and line, the trigger, expected behavior, what the code does, user impact, evidence, the smallest fix, and a regression that would catch a relapse. Evidence is inspection of `8f7ffaf` unless a finding says otherwise.

## SW-ROUTE-001 — High

Ordinary product requests are forced onto the heavy path.

`scripts/route-request.mjs` lines 6-8 and 264-279. Audience matching is:

```text
/\b(board|leadership|executive|exec|ceo|vp|sales|customer|engineering)\b/i
```

Research signals are `market`, `tam`, `sam`, `som`, `pricing`, `competitive`, `competitor`, and `research`. Any match adds a blocker and sets `autoEscalate`. `agents/orchestrator.md` lines 156-167 and `commands/start.md` lines 62-70 then refuse Fast mode and build a Rigorous plan. Pricing, competitive, and market asks also gain a research phase.

Trigger: "Write a PRD for the customer onboarding flow." Also "Sprint plan for the engineering team" and "Pricing page copy from the numbers I pasted."

Expected: a clear single-skill request with supplied inputs runs directly. Naming the work is not an external audience and is not a demand for a web search.

Actual: `customer` and `engineering` are whole-word matches, so confidence cannot be HIGH. The research words escalate even when the user already supplied the evidence.

Impact: the default PM session does extra research, extra questions, and extra artifacts, and may go looking for facts the user did not ask for.

`tests/route-request.test.mjs` only covers "board review" and "competitive pricing research," so the broad matches stay green.

Smallest fix: treat audience as external only when the user names the reader ("for the board," "status update to sales"). Treat research words as a research need only when the user asks for fresh external facts or no local evidence was supplied.

Regression: `routeRequest('Write a PRD for customer onboarding')` is HIGH, `autoEscalate` false, and has no audience blocker. `routeRequest('Here are our prices; recommend packaging')` does not set `external-research-required`.

## SW-ROUTE-002 — Medium

`/write-prd` still stops for approval after the press release.

`commands/write-prd.md` lines 21-32 ask four intake questions and then say "Review with the PM before proceeding." `docs/workflow-contract.md` lines 11-14 say a clear request authorizes drafting, questions are capped at two, and there is no blanket approval checkpoint.

`commands/start.md` lines 124-127 require the Claude Agent tool. `agents/orchestrator.md` lines 5-9 give that agent only Read, Glob, Grep, and Bash. Codex has no tool by that name. The concierge says to continue in the current session. This command does not.

Trigger: `/write-prd` with a problem statement and tickets already in the prompt.

Expected: one PRD, reusing the supplied evidence, with at most two questions when a decision is actually missing.

Actual: the command tells the model to interview, draft only the press release, and wait. An orchestrator subagent also cannot dispatch, because the Agent tool is not in its tool list.

Impact: a straightforward PRD stalls or fails a tool call before the requirements exist.

Smallest fix: delete the mid-workflow review stop. Ask one question only when evidence or scope is missing. In `start.md`, delegate only when the host has a working agent tool. Otherwise write the artifact in the current session.

Regression: a command-contract check fails if `commands/write-prd.md` tells the model to wait for review before the PRD is complete.

## SW-ROUTE-003 — Medium

Light design review is specified as both three and seven perspectives.

`skills/technical/design-review/SKILL.md` lines 27-32 allow three perspectives at Light depth. Lines 302-312 still require "7 Perspective Reviews." `commands/tech-handoff.md` lines 51-53 always run all seven. `evals/release-acceptance.md` says failing a Light review only because seven perspectives are missing is itself a failure.

Trigger: "Light design review of this one-screen change," or `/tech-handoff` on a small feature.

Expected: Light review covers Engineering, Customer Voice, and Devil's Advocate. Missing legal or sales input is `Not assessed`, not invented.

Actual: the output section and the handoff command demand seven populated perspectives. The same skill says not to simulate a perspective that has no input.

Impact: the model invents Legal, Sales, Executive, and Design findings, or it fails its own checklist for following the Light rule.

Smallest fix: make the output list depth-dependent, and point `/tech-handoff` at the skill's depth table.

Regression: a text check that the Light output format names three perspectives, and that `commands/tech-handoff.md` does not hard-require seven.

## SW-VALID-001 — High

The citation checker ignores the tables where the numbers live.

`scripts/validate-artifact.mjs` lines 770-776 exempt a paragraph whose first line starts with `|`. Lines 779-784 treat any URL in the paragraph as a citation for every number in it. Lines 928-930 exit 1 on any issue, including a warning.

Trigger: a PRD metric table of "$4.2M ARR" and "62%" with no source. Or one homepage URL next to an unrelated percentage.

Expected: unsourced quantities in tables are flagged. A link supports only the claim it is attached to. Warnings do not share a failure channel with a broken envelope.

Actual: table claims produce no issue. One URL suppresses the paragraph. A warning fails the process, so a repair loop rewrites prose and leaves the table alone.

The regression around a "Sources" heading covers prose only.

Smallest fix: check table cells. Require the citation to sit on the same claim. Exit 0 for warnings. Reserve a nonzero code for contract errors.

Regression: a markdown table containing `$4M` and no citation yields `unsupported-dollar`. A paragraph with an unrelated URL and a percentage still yields `unsupported-numeric`.

## SW-VALID-002 — High

A clean validator result does not mean the visible artifact is complete, and the release test locks that in.

`benchmarks/fixtures/prd-hidden-scope-creep/final-pass.md` lines 3-6 show a Decision Frame with only a recommendation. Lines 26-28 set `metadata.status` to `approved`. Lines 43-45 say `PASS`. The JSON recommendation is a different sentence from the visible one. `tests/release-contracts.test.mjs` requires this fixture to produce zero errors. `scripts/validate-artifact.mjs` never compares visible text with the comment payload. `schemas/artifacts/prd.schema.json` allows `approved` with no approval record.

`docs/structured-artifacts.md` says a clean hidden payload must not excuse a defective visible artifact. `docs/release-review.md` says a prose/JSON agreement check was added. It was not.

Trigger: this fixture, or any PRD whose JSON is complete, whose visible Decision Frame is one line, and whose status is `approved`.

Expected: the six visible Decision Frame fields, readiness, and metric values match the JSON. `approved` requires an explicit human approval record. The happy-path fixture meets that bar.

Actual: schema and semantic checks read the JSON only. The suite's canonical PASS artifact is visibly thinner than the output standard and marks itself approved.

Impact: a handoff can trust `PASS` and `approved` while the page a human reads is incomplete.

Smallest fix: compare the visible signature fields with the JSON. Reject `approved` unless a field names a human source. Stop using this fixture as a zero-error oracle until the prose is complete. Do not auto-fill approval.

Regression: this fixture, unchanged, reports a prose/JSON mismatch and an unearned `approved` status.

## SW-VALID-003 — High

Light PRDs may PASS with missing baselines. The validator rejects that, and it also rejects an honest FAIL.

`skills/execution/prd-development/SKILL.md` lines 31-32 tell Light mode to skip the press release, FAQ, and detailed requirements. Lines 211-219 then require all three phases, and say a Light brief can PASS with explicit baseline and target gaps.

`scripts/validate-artifact.mjs` lines 295-311 reject PASS when a baseline, target, or decision field matches `TBD`, `unknown`, or `not measured`. The same block adds an error whenever status is FAIL or `exploratory-draft`. The CLI exits 1. `tests/release-contracts.test.mjs` locks the FAIL behavior in.

Trigger: a Light PRD whose metric is identified, whose baseline is `[TBD, requires: analytics export]`, and whose readiness is FAIL or PASS as the skill allows.

Expected: Light PASS means directional and not engineering-ready, with the gaps visible. An honest FAIL is a well-formed unreadiness result, not a corrupt file, and is not sent back for another rewrite.

Actual: structured PASS with those gaps is `readiness-failed`. Structured FAIL uses the same error class as a broken envelope. The output section still asks for the full three-phase PRD. The only clean validator result is a PASS with invented numbers.

Smallest fix: teach the validator the skill's Light gate. Separate "well-formed but not ready" from "malformed." Align the output section with the Light omit rules.

Regression: a Light envelope with baseline `[TBD, requires: export]` and status FAIL has no schema error and is not reported as corrupt. The same envelope with status PASS and a fabricated baseline of `0`, while the prose says the baseline is unknown, fails.

## SW-VALID-004 — Medium

Challenge disposition is enforced only on the lucky path.

`scripts/validate-artifact.mjs` lines 481-528 check findings only when a related challenge report is passed in. Every `deferred` finding becomes an issue, including Minor, and the CLI fails the process. A waived item is checked for a nonempty `waiver_reason` and `owner` only on that related-file path. The schema does not require those fields when `state` is `waived`. Nothing checks that a human actually waived it.

Trigger: validate a PRD that defers a Minor finding, without `--related`. Or waive a Critical finding with `owner: "PM"` and `waiver_reason: "approved"` and no related report.

Expected: deferred Critical blocks readiness. Deferred Minor stays visible and does not fail an otherwise valid draft. A waiver without the human decision fails even when the related file is omitted.

Actual: omitted `--related` skips the check. Supplied `--related` fails the process for a recorded minor deferral. Self-written waiver text passes the schema.

Smallest fix: validate `challenge_resolution` on the artifact itself. Error only for deferred or unresolved Critical findings, and for waivers that lack a human-source field. Do not fail the process on a recorded minor deferral.

Regression: a PRD with one deferred Minor and no related file has no `challenge-finding-unresolved` error. A waived Critical with no human-source field fails with or without `--related`.

## SW-DEC-001 — High

The decision runner mislabels strong answers, and it still points at a review stack that is not installed.

`scripts/orchestrate.mjs` lines 349-366 and 409-416. `isWeak` is true when an uncertainty payload is present, even at high confidence. With one provider, a cross-family class returns `more_rigor_recommended` and the follow-up "Add a third provider or treat this as provisional."

`routeWithCapabilities` (lines 284-296) strips `double_panel` and `judge` only when those modes were already selected. One provider never selects them, so the provider-install instruction survives. `scripts/decision-execution.mjs` lines 107-112 correctly refuse to run that mode. The router has already told the user to install CLIs in order to reach it.

A high-confidence result that also includes `uncertainty_payload` is treated as weak. With the default single provider, the explanation says the result is below the confidence threshold.

Trigger: a fast run of "Should we restructure the board?" with only Claude available, high confidence, and no human-review flag. Second trigger: a pricing answer with `confidence_band: "high"` plus an uncertainty payload.

Expected: high confidence stays provisional. Human review stays mandatory when the flag is set. The missing multi-model runner is unavailable. The next action is evidence or human review, not "install more model CLIs."

Actual: one-provider governance returns `more_rigor_recommended` and "Add a third provider." High confidence plus a payload returns `not_ready` and a false threshold explanation.

Smallest fix: do not treat the presence of an uncertainty payload as low confidence. If the rigor runner is absent, never recommend another provider as the way to get a stronger automated review. Keep `needs_human_review: true` on the not-ready path.

Regression: `{confidence: high, uncertainty payload, one provider}` expects `provisional`. Governance with the rigor runner unavailable expects no "third provider" action.

Do not execute a live provider call to prove this. The branch conditions are unit-testable with `routeWithCapabilities`.

## SW-DEC-002 — Medium

Scenario context files are read from anywhere and placed in the model prompt.

`scripts/run-fast-analysis.mjs` lines 110-119 resolve `inputs.context_files` from the scenario directory with `path.resolve` and concatenate the text into the prompt. An absolute path or `../` leaves that directory. The session request body is spread into `startDecisionSession`, which accepts `scenario_path`.

Trigger: a scenario JSON sets `context_files` to a path outside the scenario folder, including a project `.env`.

Expected: reads stay inside an explicit root. Missing files fail. Secrets are not eligible context.

Actual: any path the process can read is loaded and would be sent to the provider command. The prompt label "data" does not stop the read.

This traversal was not executed.

Smallest fix: resolve each file, require it to stay under the scenario directory or an explicit allowlist, and refuse `.env` and known secret names.

Regression: `context_files: ["../../.env"]` throws before any provider process starts.

## SW-DIST-001 — High

The bundle a directory would receive does not match the instructions packed inside it.

`scripts/build-plugin.mjs` lines 32-37 copy a subset of scripts, plus `README.md`. The packaged README still tells a user to run `scripts/install.mjs`, `scripts/validate-repository.mjs`, `scripts/build-plugin.mjs`, and `scripts/shipwright.mjs` (`README.md` lines 82-99 and 116-131). Those files are not on the allowlist. The README's case-study and golden-output links are not in the bundle either.

`agents/orchestrator.md` lines 265-270 tell the model to run `node scripts/collect-research.mjs` or `node .claude/scripts/collect-research.mjs`. A marketplace plugin keeps the helper under the plugin root. `skills/technical/adversarial-review/SKILL.md` lines 41-44 use the same source-relative validator command.

`scripts/sync.sh` and the installed `shipwright-sync.sh` are bash. The documented update path fails in Windows PowerShell unless Git Bash is present. `node scripts/install.mjs` is the portable installer.

Trigger: install the built plugin and follow its README, or ask for market evidence from a plugin rather than this checkout.

Expected: every command in the packaged README exists in the package, or the README is a plugin guide and points at the installed absolute path. The collector and validator run from the directory that contains `manifest.json`.

Actual: plugin users hit missing scripts. Research falls through to ad hoc browsing or stops. Windows users who follow the sync section cannot run the updater.

`dist/` is gitignored. `dist/shipwright-2.3.0-review.zip` was not unpacked. Do not submit either until a fresh bundle is diffed.

Smallest fix: give the bundle its own short README. Invoke helpers from the directory that contains `manifest.json`. Ship a Node updater, or document `node <source>/scripts/install.mjs <project> --apply` as the only update command.

Regression: after `pluginFiles()`, every `node scripts/...` command in packaged markdown resolves to a packaged file. Orchestrator and adversarial-review do not hard-code a checkout-only relative path.

## SW-DIST-002 — Medium

The public package still makes an unsourced proof claim, and it still names the private review runner.

`README.md` lines 246-247 and `case-studies/README.md` lines 3-8 call `case-studies/prospect-reframe-to-deal.md` a production proof point. That file says a deal was signed in under ten minutes. It has no date, artifact, or checkable source.

Packaged text still names the private multi-model review runner in order to say it is absent: `README.md` lines 141-143, `agents/orchestrator.md` line 32, `docs/structured-artifacts.md` line 19, and the proof docs listed in `manifest.json`, which the bundle copies. The public README must not reference that runner.

Trigger: a directory reviewer reads the README, the case study, and the packaged agent.

Expected: public proof is a sourced result or an illustration. Packaged files do not name the private runner.

Actual: the only case study is an unsourced outcome claim. The runner remains named across files the bundle ships.

Whether the engagement happened was not investigated. The defect is the unsupported public claim.

Smallest fix: remove the case study from the public README until it has a checkable record, or relabel it as an anecdote. Remove the runner's name from every file on the package allowlist. Describe the limit as "a second automated model review is not included" without naming the private system.

Regression: a package-text scan fails if packaged markdown names that runner, or if the README calls the case study proof.

## SW-GUARD-001 — Medium

These PASS gates still require a count the evidence may not support. They are pass conditions, not examples.

- `skills/discovery/discovery-interview-prep/SKILL.md` line 168: at least 3 questions per theme, including Light.
- `skills/discovery/workflow-questionnaire/SKILL.md` line 275: at least 3 behavioral questions per domain, including Light.
- `skills/discovery/jobs-to-be-done/SKILL.md` line 169: at least 3 scored outcomes at Standard.
- `skills/gtm/competitive-battlecard/SKILL.md` line 168: at least 3 objection handlers.
- `skills/execution/user-story-writing/SKILL.md` line 175: 3+ acceptance criteria, 2+ at Light.
- `skills/measurement/artifact-quality-audit/SKILL.md` line 136: at least 2 artifacts.

`docs/workflow-contract.md` lines 55-56 say example counts are not quotas. `docs/release-review.md` says invented quotas were eliminated.

Trigger: one real objection, one theme with two sound questions, or a request to audit the single memo that exists.

Expected: PASS when the supported items meet the evidence bar. A short list stays short.

Actual: the gate fails the artifact, and the usual repair is to add items until the count is met.

Smallest fix: replace count floors with "every included item is evidenced; zero is valid when the record supports zero." Keep real statistical floors, such as experiment power, where the method requires them.

Regression: a lint fails if these PASS sentences require a numeric minimum that is not a measurement-validity rule.

## Contract mismatches

| Producer | Consumer | Mismatch |
|---|---|---|
| Skill Decision Frame uses High / Light / Fast | Schema enums are `high`, `light` or `quick`, `fast` | A faithful visible frame fails the envelope until the case is edited |
| PRD Light PASS allows baseline gaps | Validator rejects `TBD` on PASS and rejects honest FAIL | Clean validation requires invented metrics |
| Design-review Light is 3 perspectives | Output section and `/tech-handoff` require 7 | Depth and handoff disagree |
| Workflow contract: draft when the request is clear | `/write-prd` waits after the press release | Extra approval on the main PRD path |
| Workflow contract: absolute install root | Orchestrator and adversarial review use `scripts/...` and `.claude/scripts/...` | Plugin and project installs miss the helper |
| Capability wrapper drops unavailable multi-model modes | One-provider governance still says to add a provider | The disclaimer never runs on that branch |
| Visible markdown | Hidden artifact JSON | No comparer. The release fixture differs and still has zero errors |
| Challenge waiver needs a human | Schema accepts `waived` plus a note | Self-waiver passes unless `--related` is supplied and the text fields are empty |
| `metadata.status: approved` | No approval record in the schema | The model can approve its own PRD |
| Output standard, six visible fields | Validator reads JSON only | Prose can omit owner, date, and revisit trigger |
| Benchmark status PASS | Fixture replay in `run-benchmarks.mjs` | Authored markdown, not a live generation, produces the suite status |

## Unnecessary steps

These can go without weakening a real check:

- The `/write-prd` stop for press-release approval.
- Route escalation on the bare words `customer` and `engineering`.
- Running `route-request.mjs` when the user already typed an explicit command. The concierge says to skip it. `start.md` still uses it as the mode switch.
- The second job in `.github/workflows/validate.yml`, which only repeats `validate-repository.mjs` after the matrix job has run it.
- Forcing seven design-review perspectives at Light depth.
- Telling a one-provider governance session to add model CLIs.

Keep the conflict check before install writes, the refusal to put secrets in a bundle, and the single repair-then-stop rule.

## Evaluation gaps, by release risk

1. No observed host run. `evals/release-acceptance.md` says every case stays NOT RUN until tool calls are recorded. That includes activation, injection, offline research, and authorization.
2. Fixture PASS is not product quality. The suite replays authored markdown. The canonical PASS fixture is incomplete in prose and self-approved.
3. `tests/release-contracts.test.mjs` encodes the validator's blind spot by requiring zero errors on that fixture.
4. Routing tests miss `customer` and `engineering`.
5. Decision routing tests miss the uncertainty-payload case and one-provider governance.
6. The prior review's "417 tests passed" and its host-validator results were not reproduced by this audit. Treat them as unverified, and as insufficient even if they pass.
7. Blind-review independence was not observed. The code splits reviewer and admin folders. That does not prove the reviewers were independent.

## Comparison with the prior review

New issues that review missed: SW-ROUTE-001, SW-VALID-001, SW-DEC-001, SW-DEC-002, SW-DIST-001, SW-DIST-002, and the canonical fixture's visible Decision Frame and `approved` status.

Claimed fixes that remain incomplete:

- Prose/JSON agreement. The validator does not compare them. The same review's limits section admits this. The findings table overclaims.
- Capability-aware routes. True only when the inner router already selected `double_panel` or `judge`.
- Eliminated quotas. The PASS floors in SW-GUARD-001 remain.
- No blanket plan approval. `/write-prd` still has one.
- Human waivers cannot be invented. The code checks nonempty strings when a related report is attached.
- Light-depth gates. PRD Light and the design-review output format still contradict the validator and the acceptance case.

Disagreements:

- FAIL-as-validator-error stops a FAIL artifact from looking clean. It also gives a repair loop one success condition: flip the status to PASS and fill the gaps. That is SW-VALID-003.
- The scope-creep final fixture is not evidence the handoff contract holds.
- Install conflict-before-write looks real. A crash mid-write is still not rolled back. Retired files are reported and left on disk, so a renamed skill can remain loaded beside the new one.

## Repair order

Do the instruction and code repairs before any directory submission. Do not start live model calls, search-provider calls, or a host install as part of the code repair. Those spend quota, can read a project `.env`, and write into a project.

1. Instruction conflicts: SW-ROUTE-001, SW-ROUTE-002, SW-ROUTE-003, SW-GUARD-001, the PRD Light output section, packaged helper paths, and SW-DIST-002 wording. File edits only.
2. Validator and decision router: SW-VALID-001 through SW-VALID-004, SW-DEC-001, SW-DEC-002, plus the regressions named on each finding. `node --test` is local. Do not point a test at a live model runner.
3. Split the release fixture. Make `final-pass.md` prose match a legitimately complete JSON, or change the test so the current file is expected to fail. Do not invent an approval record.
4. Only when a candidate bundle is wanted: `node scripts/build-plugin.mjs <new-directory>` writes a directory and does not call a model. Then search packaged markdown for missing script targets and for the private runner's name. Do not submit `dist/` or the existing review zip.
5. Host checks are a later explicit approval. `node scripts/install.mjs <project> --apply` writes `.claude/`, `.codex/`, `.shipwright-install.json`, and `shipwright-sync.sh`. Acceptance cases on Claude and Codex can browse and, if a research key is in that project's `.env`, call Brave or Tavily. `node scripts/shipwright.mjs` spawns `claude`, `codex`, or `gemini`. Do not point `context_files` at a real `.env`.
6. Do not run `shipwright-sync.sh --yes` against a project that matters until the updater is the Node installer.

Untracked `benchmarks/results/` and `benchmarks/telemetry/` are local run output. Do not commit them.

## Commands and their side effects

| Command | Writes | Network or credentials | Cost |
|---|---|---|---|
| `node scripts/validate-repository.mjs` | No | No | No |
| `node --test --test-concurrency=1 tests/*.test.mjs` | Temp dirs only, if tests use them | The stalled-body test binds localhost. It does not call a search API | No |
| `node scripts/build-plugin.mjs <new-dir>` | A new directory | No | No |
| `node scripts/install.mjs <project>` | No, preview only | No | No |
| `node scripts/install.mjs <project> --apply` | Project `.claude/`, `.codex/`, install record, sync script | No | No |
| `node scripts/shipwright.mjs` | `benchmarks/sessions/` and `benchmarks/results/fast-analysis/` unless `--out-dir` is set | Spawns a local model CLI with the user environment | Model usage |
| `node scripts/collect-research.mjs` | `.shipwright/` under the working directory | Reads project `.env` and calls Brave or Tavily when a key is present | Search quota |
