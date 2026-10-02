# Clean-host probe result, 2026-10-02

Two Claude passes, model `claude-opus-5-5`, `--setting-sources project`, no effort flag. Transcripts are local and are not in this repo. The script did not score the five cases. This note is the hand grade.

## What ran

The first workdir was `C:\Users\ianfe\AppData\Local\shipwright-clean-host-probe`. Sterility listed `C:\Users\ianfe\.claude\CLAUDE.md` and the install `CLAUDE.md`. The five cases were not started. That session cost about $0.18. Its loaded skill list did not include the user skill folder names `canvas-design`, `memsync-memory`, or `theme-factory`.

The graded workdir was `C:\shipwright-clean-host-probe`. Its only parent is `C:\`, which has no instruction file. Sterility listed one path, `C:\shipwright-clean-host-probe\CLAUDE.md`. The same user skill names were absent. Built-in skills and three built-in plugins still loaded. The five cases then ran. The six sessions on this workdir cost about $1.76.

Every long answer says `capture-inputs.mjs`, `reconcile-artifact.mjs`, and `validate-artifact.mjs` did not run. The session reported that file writes were denied under `dontAsk`.

## Grade

| Case | Question | Mark |
|---|---|---|
| `governance-decision` | Does a 30-person headcount stand in for low filing risk? | No. Merger control stays undetermined until deal value, party financials, and jurisdictions are known. The answer says company size alone cannot settle it. The headcount is used for key-person fragility. |
| `pricing-decision` | Is "next quarter" treated as day one, or is new-customer conversion the renewal trigger? | No. Renewal churn is described as able to land after next quarter ends. New customers are a test group. The 13% line is labeled an illustration that assumes every subscriber takes the full 15%. |
| `prd-draft` | Does the press copy end access immediately while requirements keep the session alive? | No. The press release, FAQ, and requirements agree: a disabled IdP account cannot start a new session, and an open session lasts until the configured maximum. |
| `pricing-framework` | Are Notion audit logs placed on a non-Enterprise tier, or is an annual discount stated that the page does not support? | Audit logs are not placed on a Notion tier. The answer's own upgrade trigger sends SSO or audit logs to Enterprise. The competitor table does say Notion annual billing "saves up to 20%". A fetch of `https://www.notion.com/pricing` during grading did not contain that sentence. Plus at $10 and Business at $20 did match, and the page puts Audit log on Enterprise. The session's own fetch summary contained the 20% line, and the answer says those summaries were not checked against the raw tables. |
| `ambiguous-pricing-decision` | Does it ask and stop without a verdict? | Yes. It asks for the options and the decision criteria, and it does not give a verdict. |

## Second pass

The first transcripts were moved to `transcripts-pass-1`. The same drive-root install was run again. Sterility again listed only `C:\shipwright-clean-host-probe\CLAUDE.md`. The six sessions cost about $1.23. The helper scripts again did not run. The sessions reported that shell writes were denied.

| Case | Mark |
|---|---|
| `governance-decision` | No headcount filing substitute. The answer says being small does not make the review safe, and it names deal value, both companies' finances, the countries involved, and exemptions. The 30 people are used for key-person risk. |
| `pricing-decision` | No. It says prospect conversion does not predict renewal, and it holds existing subscribers until separate churn evidence exists. The 13% line is again labeled an illustration. |
| `prd-draft` | No. An offboarding boundary is stated for every section: removing someone in the identity provider stops new sign-ins, and an open session lasts until it expires or an admin revokes it. |
| `pricing-framework` | Notion's Business row is given SAML SSO, not audit logs. The answer's own later tier is where it puts SSO and audit logs. The table again says "Save up to 20% with yearly", and this time it marks the annual-versus-monthly split as unverified. |
| `ambiguous-pricing-decision` | Yes. It asks what the options are and what matters, and it gives no verdict. |

## Decision Frame

Both clean passes agree. The four named September 30 failures did not reproduce. These five Claude prompts are finished. Leave the four offline checkers frozen. Directory submission is still a human decision: two passes on one host are not a broad rate, and the helper scripts did not execute in either pass.

## Unknowns & Evidence Gaps

Built-in skills, built-in plugins, managed policy, and the unset effort flag can still differ from the September 30 sessions. The "up to 20%" Notion line is in both answers. The grading fetch of the pricing page did not contain that sentence. Codex was not part of either pass.

## Pass/Fail Readiness

Fail as an automatic ship gate. Pass as the profile question for these five prompts, twice: with the user `CLAUDE.md` outside the parent walk, the headcount filing substitute, the next-quarter and conversion mistakes, and the immediate-cutoff contradiction did not appear.

## Recommended Next Artifact

A yes or no on directory submission from this evidence. Another Claude run of these five prompts would spend the set again. The Codex probe setup is in `docs/codex-clean-host-probe.md` and has not been run.
