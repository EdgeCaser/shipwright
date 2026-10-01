# Release readiness findings, 2026-09-30

**Verdict: hold.** This is a new review of `b9b6f8d`, focused on behavior a user can encounter in an installed project. It does not amend the frozen historical record in `docs/independent-release-audit.md`. The seven findings below were reproduced locally on Windows. They are separate from the limits already recorded in `docs/adversarial-review-2026-09-30.md` and `SESSION_HANDOFF.md`.

## Findings

### V1. Forged install-record entry can delete a user file

- **Severity/category:** blocker, release-blocker
- **Location:** `scripts/install.mjs:143-166`
- **Reproduction:** Install into an empty disposable project. Create `user-note.txt` containing `my user data`. Add `"user-note.txt": SHA256("my user data")` to `.shipwright-install.json` under `hashes`, then call `uninstallShipwright(project, { apply: true })`. The result lists `user-note.txt` as removed, `refused` is empty, and the user file is gone. An entry absent from Shipwright's installed-file set should be refused.
- **Repair target:** Treat the record as untrusted input. Restrict removal to verified Shipwright-owned paths and refuse inconsistent records before destructive work. Test a forged in-project path as well as the existing traversal and link cases.

### V2. Uninstall silently removes edits inside a managed host block

- **Severity/category:** high, release-blocker
- **Location:** `scripts/install.mjs:119-131,169-179`
- **Reproduction:** Install into a disposable project. Insert `My added instruction` immediately before `<!-- shipwright:end -->` in `AGENTS.md`, then uninstall with `apply: true`. The edit disappears; `blocksRemoved` includes `AGENTS.md` and `kept` is empty. A modified installed block should be preserved or explicitly refused.
- **Repair target:** Verify the block against its installed content before removal. Keep user text outside the block byte-for-byte, and make a refused uninstall recoverable without losing its record.

### V3. The PRD skill's metric table conflicts with structured validation

- **Severity/category:** high, release-blocker
- **Location:** `skills/execution/prd-development/SKILL.md:121-127`; `scripts/validate-artifact.mjs:321-339`
- **Reproduction:** Follow the skill's `Goal | Metric | Current | Target | Timeframe | Source` table with `12%` and `20%` cells, and append an otherwise valid PRD artifact whose metric has `unit: "%"`. `validateArtifact(..., { artifactType: 'prd', expectStructured: true })` returns `valid: false` with `Visible metric "Activation Rate" unit disagrees with JSON.` Adding a `Unit` column containing `%` returns `valid: true` with no issues.
- **Repair target:** Align the skill, shipped PRD examples and eval text with the validator's required field-labeled unit. Keep the value-only cells and Source column rule.

### V4. Live acceptance can pass behaviorally wrong transcripts

- **Severity/category:** high, output-doubt
- **Location:** `scripts/live-acceptance.mjs:27-35,114-123,174-190`
- **Reproduction:** `gradeTranscript` passes a governance reply made only of `governance`, the five decision labels, the four closing-block names and `stress-test`, with no answer in any section. It also passes this ambiguous-pricing reply: `Take the cheaper vendor now; sign the contract today. Which option should we choose?` The first should fail for empty sections; the second contains a verdict before clarification.
- **Repair target:** Check heading placement and nonempty, relevant section content; reject clear verdict language in clarification-only answers. Keep a human transcript review gate for semantic correctness and describe the grader as an offline smoke check, not proof of decision quality.

### V5. Decision keywords capture ordinary coding and PRD work

- **Severity/category:** medium, output-doubt
- **Location:** `scripts/route-request.mjs:16-27`
- **Reproduction:** `node scripts/route-request.mjs "Should we kill the worker process after a timeout?" --format json` returns `decision-analysis`, `product_strategy`, `HIGH`. `node scripts/route-request.mjs "Should we publish the PRD for review?" --format json` returns `decision-analysis`, `publication`, `HIGH`. These should remain coding help and PRD review work, respectively, without the high-stakes decision format.
- **Repair target:** Constrain triggers by what is being killed or published, and add both false-positive cases to the routing corpus without breaking the genuine product-line and public-announcement cases.

### V6. Duplicate managed-block end markers are accepted

- **Severity/category:** medium, release-blocker
- **Location:** `scripts/install.mjs:34-43`
- **Reproduction:** `applyManagedBlock('prefix\n<!-- shipwright:begin -->\nbody\n<!-- shipwright:end -->\n<!-- shipwright:end -->\n', 'replacement')` succeeds and leaves one stray end marker. Malformed marker sets should be refused before writing.
- **Repair target:** Require exactly one ordered begin/end pair, including on uninstall, and test duplicate ends and mixed malformed markers.

### V7. Public CLI help still emits an em dash

- **Severity/category:** low, hygiene
- **Location:** `scripts/shipwright.mjs:191`
- **Reproduction:** `node scripts/shipwright.mjs --help` prints `Shipwright — PM decision analysis`. The public output rule requires no em dash.
- **Repair target:** Replace the character in the help string and add a focused output assertion.

## What passed and what remains unverified

- `node scripts/validate-repository.mjs`: zero errors, 46 skills, seven agents, 17 workflows.
- `node --test --test-concurrency=1 tests/*.test.mjs`: 572 passed, none failed or skipped.
- A fresh disposable bundle had 123 files and 48 skills; all ten bundled scripts imported. Existing package-reference tests passed.
- In copies outside the repository, the `Source column` and `citation text in a metric value cell` regression tests each passed with the fix and failed when its guard was removed.
- This review did not run live model sessions, CI on Linux or macOS, exhaustive ablation, or a before/after fingerprint of benchmark outputs. `benchmarks/results/` and `benchmarks/telemetry/` were left untouched. Before this document was added, those pre-existing directories were the only untracked paths.

**Release gate:** Repair V1-V7, add focused regressions for each, rerun the full repository checks and a fresh package/install/uninstall exercise, then obtain a review of the integrated changes. A passing deterministic suite alone does not establish host behavior or source truth.
