# Live acceptance

This guide is for maintainers. It checks that an installed Shipwright behaves correctly inside Claude Code and Codex: plain-language requests reach the right framework, high-stakes decisions return a verdict, ambiguous ones ask first, and non-Shipwright questions are left alone.

The harness in `scripts/live-acceptance.mjs` never starts an agent. It prints the commands you run by hand and grades the transcripts you save. Running the prompts uses live model sessions, which need the maintainer's authorization. Do not run them in CI or from an unattended job.

## Run the plan

```text
node scripts/live-acceptance.mjs --plan --agent claude
node scripts/live-acceptance.mjs --plan --agent codex --workdir /path/to/empty-dir
```

The plan lists the setup steps and ten prompts, each with the exact command. Nothing in it has been run. Pass `--workdir` to see real paths; otherwise `<workdir>` is a placeholder. `--out` sets the transcript folder (default `<workdir>/transcripts`).

To check the installer step without any agent, run `node scripts/live-acceptance.mjs --prepare`. It installs Shipwright into a fresh temporary directory and removes it on exit. With `--workdir` it installs into that empty directory and keeps it.

## Save transcripts

1. Make an empty disposable directory and install into it with the repo installer, as the plan shows. Never install into a real project.
2. Reload the host in that directory so it finds the skills.
3. Run each command from the plan. The commands redirect the reply to `<id>.md` in the transcript folder. If you use the interactive UI instead, paste the full reply into that file.

For structured artifacts, allow local draft writes and execution of the installed Node validator inside the disposable project. Record the host's tool permissions and any denials with the transcript. Keep failed attempts when retesting with different permissions; a later pass does not erase the first result.

When you are done, `node scripts/install.mjs <workdir> --uninstall --apply` removes the installed files from the workdir, or delete the disposable directory.

## Check

```text
node scripts/live-acceptance.mjs --check /path/to/transcripts
```

The table shows PASS or FAIL per prompt with the reasons. The exit code is non-zero if any prompt fails or any transcript is missing.

`--live` exists only to refuse. Without `SHIPWRIGHT_LIVE_ACCEPTANCE=1` it exits non-zero. With it set, it prints that live running is the operator's step and still starts nothing.

## Prompts and pass conditions

Every transcript must also contain no em dash and be more than a few words long.

The four closing blocks are Decision Frame, Unknowns & Evidence Gaps, Pass/Fail Readiness and Recommended Next Artifact. The five decision sections are RECOMMENDATION, CONFIDENCE, NEEDS_HUMAN_REVIEW, SUMMARY and KEY_REASONING.

Closing-heading checks ignore capitalization and accept "and" in place of "&". These variations do not excuse empty sections or change the evidence requirements.

| Id | What it tests | Pass conditions |
|---|---|---|
| `market-sizing` | Routes to market sizing | TAM, SAM, SOM, assumptions, four closing blocks |
| `pricing-framework` | Routes to pricing strategy | Pricing content, value metric or tiers, four closing blocks |
| `prd-draft` | Routes to a PRD | Problem or context, success metrics, scope, four closing blocks |
| `competitive-landscape` | Routes to competitive landscape | Competitors, positioning or gaps, four closing blocks |
| `governance-decision` | Acquisition question | Five decision sections with answers, governance named, stress-test offer, four closing blocks |
| `pricing-decision` | Price increase question | Five decision sections with answers, pricing named, four closing blocks |
| `build-vs-buy-decision` | Build versus buy question | Five decision sections with answers, product_strategy named, four closing blocks |
| `ambiguous-pricing-decision` | Vague pricing question | Asks a clarifying question or requests the missing details; no verdict or RECOMMENDATION section |
| `coding-question` | Non-Shipwright coding | Code block, clearTimeout; no decision sections, no closing blocks |
| `structured-prd-artifact` | Structured PRD handoff | `shipwright:artifact` block, four closing blocks, `validate-artifact` passes with artifact type prd and a structured block required |

## Scope

This script is a development tool. It is not in the distributed bundle, and the distribution tests do not list it. The grader is an offline smoke check for heading placement, nonempty sections and some obvious verdict language. A maintainer must read every transcript to judge whether the answer is relevant, whether claims are supported by true sources, and whether host routing and human approval worked. A failed row can also reflect a correct answer phrased in a way the text checks miss.
