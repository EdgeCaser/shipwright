# Codex clean-host probe result, 2026-10-02

One pass, model `gpt-6-astra`, with `--ignore-user-config`, `--ignore-rules`, and `--sandbox workspace-write`. No effort flag. The process exited 0 after about 227 seconds. Transcripts are local, under `C:\shipwright-codex-clean-host-probe-operator\transcripts`, and are not in this repo. The script did not score the five cases. This note is the hand grade.

## What ran

Sterility listed one path, `C:\shipwright-codex-clean-host-probe\AGENTS.md`. That file is inside the workdir. The five cases then ran.

Each case tried to read an installed skill with PowerShell `Get-Content`. Codex rejected every attempt with `blocked by policy`. The targets were `shipwright-concierge`, `pricing-strategy`, `prd-development`, and the installed copies of `artifact-reconciliation.md`, `output-standard.md`, and `workflow-contract.md`. Capture, reconciliation, and validation did not run. The saved events show no read under `~/.codex/memories`.

## Grade

These marks cover the named September 30 questions. The installed skill files were unread, so the marks describe the answers that were written from the startup `AGENTS.md`.

| Case | Question | Mark |
|---|---|---|
| `governance-decision` | Does a 30-person headcount stand in for low filing risk? | The headcount is not used that way. The answer says headcount does not establish strategic value, and it lists key-person dependencies as evidence still needed. It does not state the filing test: commerce, transaction value, party size, and exemptions. It says a competitor purchase merits competition review and cites FTC guidance on pre-merger diligence. |
| `pricing-decision` | Is "next quarter" treated as day one, or is new-customer conversion the renewal trigger? | Neither. The answer says the timing is unsupported and asks for evidence over a purchase or renewal cycle. It says evidence about one group does not by itself justify a change for the other. The 13.04% line is labeled arithmetic under an identical-subscription assumption. |
| `prd-draft` | Does the press copy end access immediately while requirements keep the session alive? | No PRD was written. After the policy block, the session stopped. There is no press copy and no requirements text. |
| `pricing-framework` | Are Notion audit logs placed on a non-Enterprise tier, or is an annual discount stated that the page does not support? | Neither claim appears. The answer says the public page shows Plus at $10 per member per month, with collaborative blocks and file uploads. The saved page-open event records 761 lines and does not include that sentence. A second view in the same event is an internal error. The $80 per editor per year figure is the answer's own proposed pilot price. |
| `ambiguous-pricing-decision` | Does it ask and stop without a verdict? | Yes. It asks for the two options, total cost, contract length, included services, and cancellation terms, and it gives no verdict. |

## Decision Frame

Startup sterility held: the only instruction path was the install `AGENTS.md`. The four named failures are absent from the answers that exist. The PRD case produced no artifact. Command policy blocked the skill reads, so this pass does not measure Shipwright's installed skills on Codex.

## Unknowns & Evidence Gaps

Effort stayed unset because user config was ignored. The Notion Plus price was not checked against the page body saved from this session, because that body is not in the event log. A later session that can read the install could still show a filing substitute, a renewal mistake, a session-lifetime contradiction, or a Notion tier error.

## Pass/Fail Readiness

Fail as a Codex listing measurement. The host was sterile at startup, and the product workflow did not run. Shared skills and instruction files stay as they are.

## Recommended Next Artifact

The probe command now sets `windows.sandbox` to `unelevated`. These five prompts have not been shown to Codex again. A rerun needs a new operator directory because these transcripts remain. The Claude copies of these prompts stay finished.
