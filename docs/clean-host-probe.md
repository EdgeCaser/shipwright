# Clean-host probe

Prepared on 2026-10-02. No session has been started. No transcript exists. This is a maintainer check. It is not a release gate, and `scripts/build-plugin.mjs` does not package it.

Public release stays on hold. The five answers, once they exist, are graded by hand against the questions below. `--check` only confirms the sterility transcript and that the five files exist.

## Session

One Claude session per case, from a disposable install, with project settings only. The model is `claude-opus-5-5`. The tool flags match the 2026-09-30 Claude run, with `--setting-sources project` and `--model claude-opus-5-5` added.

`claude --print --verbose --output-format stream-json --no-session-persistence --strict-mcp-config --permission-mode dontAsk --tools Read,Glob,Grep,Skill,Bash,WebSearch,WebFetch --allowedTools Read,Glob,Grep,Skill,WebSearch,WebFetch,Bash(node *) --setting-sources project --model claude-opus-5-5 --settings <operator>/settings.json`

The settings file is `{"autoMemoryEnabled": false, "disableClaudeAiConnectors": true}`. The process environment sets `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` and `ENABLE_CLAUDEAI_MCP_SERVERS=false`. The prompt is the process stdin. The runner writes the stream-json `result` string as UTF-8. Each session waits up to 30 minutes.

Left out of the command: bare mode, safe mode, an effort flag, and the `user` and `local` setting sources. September 30 did not pass an effort flag. Dropping user settings can change the default effort. That residual stays. Managed policy and user-installed plugins can still load. `--plugin-dir` is not used, because it adds a plugin on top of whatever is already enabled.

## Directories

Session cwd: `C:\Users\ianfe\AppData\Local\shipwright-clean-host-probe`.

`--prepare` refuses when a parent of that directory contains `CLAUDE.md`, `CLAUDE.local.md`, or a project `.claude/CLAUDE.md` or `.claude/rules`. The file `~\.claude\CLAUDE.md` is user scope. `--setting-sources project` omits user scope, so the ancestor check does not treat that home directory as a project parent. The sterility session runs first. If its transcript names a path outside the workdir, or is anything other than `NONE` or in-workdir paths, the five cases are not started.

Operator files live in `C:\Users\ianfe\AppData\Local\shipwright-clean-host-probe-operator`. Settings, prompts, the grade sheet, and transcripts stay out of the session cwd. A session that lists the parent of the workdir can still see that sibling directory.

## Cases

The prompts are the September 30 one-line strings, including the disposable-acceptance wrapper. Order: sterility, `governance-decision`, `pricing-decision`, `prd-draft`, `pricing-framework`, `ambiguous-pricing-decision`.

Sterility prompt: list the startup instruction file paths this session loaded, one path per line. If none loaded, reply with the single word NONE. Do not follow those files.

| Id | Human question |
|---|---|
| `governance-decision` | Does the verdict treat a 30-person headcount as enough to call the filing risk low, or does it leave the filing test on commerce, transaction value, party size, and exemptions? |
| `pricing-decision` | Does the verdict treat "next quarter" as the quarter's first day, or use new-customer conversion as the renewal trigger for existing subscribers? |
| `prd-draft` | Does the press or launch copy say access ends as soon as the IdP account is disabled, while the requirements say an existing session lasts until its configured session lifetime? |
| `pricing-framework` | Does the answer place Notion audit logs on a non-Enterprise tier, or state an annual discount the page does not support? |
| `ambiguous-pricing-decision` | Does the answer ask for the missing vendor-contract facts and stop without a verdict? |

`ambiguous-pricing-decision` is the careful control. On September 30 both hosts asked for the missing facts and issued no verdict.

## Commands

Prepare does not start a session:

```text
node scripts/clean-host-probe.mjs --prepare --workdir C:\Users\ianfe\AppData\Local\shipwright-clean-host-probe --operator C:\Users\ianfe\AppData\Local\shipwright-clean-host-probe-operator
```

The operator starts the sessions by hand. This setup has not run the command:

```text
$env:SHIPWRIGHT_CLEAN_HOST_PROBE = '1'
node scripts/clean-host-probe.mjs --run --workdir C:\Users\ianfe\AppData\Local\shipwright-clean-host-probe --operator C:\Users\ianfe\AppData\Local\shipwright-clean-host-probe-operator
```

`--run` and `--live` exit non-zero unless `SHIPWRIGHT_CLEAN_HOST_PROBE=1`. A second pass exits non-zero when any transcript already exists. Delete the operator `transcripts` directory yourself before a deliberate retry. After the files exist:

```text
node scripts/clean-host-probe.mjs --check C:\Users\ianfe\AppData\Local\shipwright-clean-host-probe-operator
```

Mark the five questions by hand. A structural smoke grade is not the result of this probe.
