# Codex clean-host probe

Prepared on 2026-10-02. No session has been started by preparing this check. This is a maintainer check. It is not a release gate, and `scripts/build-plugin.mjs` does not package it. It does not edit the Claude probe or the shared instruction files. The 2026-10-02 run is graded in `docs/codex-clean-host-probe-results-2026-10-02.md`. Those transcripts stay outside this repo.

September 30 Codex answers on these five prompts passed the coordinator read while user config was loaded. This probe asks the same questions with that config left out.

## Session

One Codex session per case, from a disposable install. The model is `gpt-6-astra`. The September 30 exec flags are kept, with `--ignore-user-config`, `--ignore-rules`, `-c windows.sandbox="unelevated"`, and `--model gpt-6-astra` added.

`node <codex.js> exec --ephemeral --skip-git-repo-check --sandbox workspace-write --cd <workdir> --json --output-last-message <transcript> --ignore-user-config --ignore-rules -c windows.sandbox="unelevated" --model gpt-6-astra -`

The prompt is the process stdin. The runner reads the last-message file as UTF-8. Each session waits up to 30 minutes.

`--ignore-user-config` skips `$CODEX_HOME/config.toml`. Auth still uses `CODEX_HOME`. The September 30 `xhigh` effort lived in that config, so this command does not set an effort. That residual stays. `--ignore-rules` skips user and project execpolicy rules. On the 2026-10-02 pass, PowerShell `Get-Content` of the installed skills was rejected with `blocked by policy` while the Windows sandbox backend was unset. `windows.sandbox="unelevated"` turns that backend on. A one-command check then read a file inside a disposable directory. The same check also read a file in a sibling directory, so this setting does not confine reads to the workdir.

There is no flag that skips `AGENTS.md`. The installer writes that file into the workdir. Codex can also read parent `AGENTS.md` files. `~/.codex/AGENTS.md` is user scope and is not treated as a project parent. If a session lists it, or any other path outside the workdir, the five cases are not started.

The September 30 sandbox was `workspace-write`, and one of those sessions read a file under `~/.codex/memories`. This probe uses the same sandbox plus the unelevated Windows backend. Sterility only reports startup instruction paths.

## Directories

Session cwd: `C:\shipwright-codex-clean-host-probe`.

This is a different directory from the Claude install at `C:\shipwright-clean-host-probe`. `--prepare` refuses when a parent contains `AGENTS.md`, `AGENTS.override.md`, or a project `.codex/AGENTS.md`.

Operator files live in `C:\shipwright-codex-clean-host-probe-operator`. The grade sheet stays out of the session cwd.

## Cases

The prompts are the same September 30 strings the Claude probe used. Order: sterility, `governance-decision`, `pricing-decision`, `prd-draft`, `pricing-framework`, `ambiguous-pricing-decision`.

| Id | Human question |
|---|---|
| `governance-decision` | Does the verdict treat a 30-person headcount as enough to call the filing risk low, or does it leave the filing test on commerce, transaction value, party size, and exemptions? |
| `pricing-decision` | Does the verdict treat "next quarter" as the quarter's first day, or use new-customer conversion as the renewal trigger for existing subscribers? |
| `prd-draft` | Does the press or launch copy say access ends as soon as the IdP account is disabled, while the requirements say an existing session lasts until its configured session lifetime? |
| `pricing-framework` | Does the answer place Notion audit logs on a non-Enterprise tier, or state an annual discount the page does not support? |
| `ambiguous-pricing-decision` | Does the answer ask for the missing vendor-contract facts and stop without a verdict? |

## Commands

Prepare does not start a session:

```text
node scripts/codex-clean-host-probe.mjs --prepare --workdir C:\shipwright-codex-clean-host-probe --operator C:\shipwright-codex-clean-host-probe-operator
```

The operator starts the sessions by hand. The 2026-10-02 operator directory already has transcripts, so another pass needs a new operator directory. The command is:

```text
$env:SHIPWRIGHT_CODEX_CLEAN_HOST_PROBE = '1'
node scripts/codex-clean-host-probe.mjs --run --workdir C:\shipwright-codex-clean-host-probe --operator C:\shipwright-codex-clean-host-probe-operator
```

`--run` and `--live` exit non-zero unless `SHIPWRIGHT_CODEX_CLEAN_HOST_PROBE=1`. A second pass exits non-zero when any transcript already exists. After the files exist:

```text
node scripts/codex-clean-host-probe.mjs --check C:\shipwright-codex-clean-host-probe-operator
```

Mark the five questions by hand. A structural smoke grade is not the result of this probe.
