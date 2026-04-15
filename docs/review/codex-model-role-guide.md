# Codex Note: Model Role Guide

Status: Proposed
Date: 2026-04-14
Author: Codex

## Purpose

This note summarizes how the current model families behave in Shipwright based on recent harness work and judge-analysis runs.

## Short version

- `Codex`: best workflow worker
- `Claude`: strong worker and useful strategy counterweight
- `GPT`: best default single runtime judge today
- `Gemini`: best ambiguity detector and third-panel judge, but not the best default worker or default solo runtime judge

## Role comparison

| Role | Codex | Claude | GPT | Gemini |
|---|---|---|---|---|
| Workflow worker | Best fit | Strong | Good | Weaker |
| Judge / evaluator | Strong | Strong | Strong | Strong but repair-dependent |
| Orchestrator input | Strong | Strong | Strong | Useful but less operationally reliable |
| Schema adherence | Strong | Good | Strong | Weakest in recent runs |
| Agentic smoothness | Best | Very good | Good | Less consistent |
| Uncertainty signaling | Good | Weakest | Good | Best |
| Default solo runtime judge | Good | Risk of overconfidence | Best current default | Too repair-dependent |
| Best special use | execution + analysis | strategy counterweight | default screening judge | ambiguity detector / third panel |

## Recommended defaults

### Workflow execution

- Default worker: `Codex`
- Strong alternative / counterweight: `Claude`
- Do not default to `Gemini` as the workflow-running agent in this repo

### Single-judge runtime evaluation

- Default: `GPT`

Why:

- better review-flag and uncertainty behavior than Claude
- materially better operational reliability than Gemini
- safest current single-judge default, even though it is not unbiased

### Escalation and panels

- Two-judge contrast panel: `Claude + GPT`
- Triple panel: `Claude + GPT + Gemini`

Why:

- `Claude + GPT` expose family disagreement quickly
- `Gemini` adds the most value when disagreement, abstention, or ambiguity is itself signal

## When to prefer one model over another

### Prefer `GPT` when

- you want the default single judge
- you need a production-usable runtime evaluator
- you want a judge that is more likely to surface review flags than Claude

### Prefer `Claude` when

- you want a strategy-heavy counterweight
- you want a second opinion on executive or board-level framing
- you are testing whether GPT's artifact-utility lean is skewing decisions

### Prefer `Gemini` when

- the case is contradiction-heavy or boundary-heavy
- ambiguity itself is important signal
- you are running replay analysis, tie-breaking research, or a triple panel

### Prefer `Codex` when

- the task is multi-step and agentic
- code edits, harness fixes, or workflow glue matter
- you need a model to keep a complex process moving end-to-end

## Operational cautions

- `Gemini` remains repair-dependent in richer replay studies and should not be treated as the cleanest production default judge.
- `Claude` appears more overconfident than `GPT` when used alone as a judge.
- `GPT` is not neutral; it is simply the safest current single-judge default when balancing bias, review signaling, and operational reliability.

## Practical rule

If you are unsure:

1. Use `GPT` for a cheap single-judge screen.
2. Escalate to `Claude + GPT` when the result matters.
3. Add `Gemini` when disagreement or ambiguity itself is the thing you want to measure.
