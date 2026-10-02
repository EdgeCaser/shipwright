# Live evaluation runbook

1. Freeze the candidate commit, scenario set, baseline prompt, evidence budgets, scoring instructions and failure criteria before generating outputs.
2. Install the generated bundle in clean Claude Code and Codex projects. Confirm skill discovery and path resolution in each host, recording host versions and loaded skill names.
3. Run the behavioral acceptance cases in `evals/release-acceptance.md` on both hosts. Capture prompts, actual tool actions and full outputs. Mark each case PASS, FAIL or NOT RUN with evidence; code tests do not substitute for these observations.
4. Generate baseline and Shipwright artifacts independently using the fixed scenarios and comparable budgets. Preserve first outputs, revisions, failures and timing. Do not supply the candidate's final answer to the baseline.
5. Validate automated envelopes and related-artifact references. Manually check source support, prose/JSON agreement, constraint propagation and authority boundaries.
6. Use `scripts/prepare-blind-review.mjs` when appropriate to prepare neutral reviewer material. Assign at least three independent reviewers and share only its `reviewer/` folder and retain its `admin/` folder privately. Record actual reviewer identity separately from anonymized IDs.
7. Collect score sheets before unblinding, then run the benchmark comparison. Verify provenance records and report missing observations, thresholds and confidence limits.
8. Publish only claims supported by the observed comparison. Fix blockers and rerun affected cases. Any result affected by changed prompts or inputs belongs to a new run.

Public release sign-off requires actual activation and representative workflow success on both intended hosts. Directory acceptance itself remains the directory maintainer's decision.
