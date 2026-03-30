---
name: challenge
description: "Run a red-team review against a Shipwright artifact and return a Challenge Report with verdict, findings, and resolution conditions."
---

# /challenge — Adversarial Review

Run this command to pressure-test an existing artifact with Shipwright's red-team agent.

## Workflow Steps

### Step 1: Identify the Artifact

Ask the PM:

- What artifact should be challenged?
- Is the artifact pasted here, available as a file path, or available from prior session context?
- Who is the intended audience for the artifact?
- If Shipwright produced it, which workflow or agent produced it?

Do not guess by reading the most recent file in the working directory. The artifact must be explicitly identified.

### Step 2: Set the Review Depth

If the PM has not already specified depth, ask:

- Do you want Light, Standard, or Deep review?

Use:

- **Light** for a fast spot-check
- **Standard** for the normal full sweep
- **Deep** for high-stakes artifacts that need maximum scrutiny

### Step 3: Dispatch Red-Team

Read and apply `/skills/technical/adversarial-review/SKILL.md`.

Dispatch `@red-team` with:

- the artifact under review
- the chosen depth
- the intended audience
- any specific area the PM wants pressure-tested

### Step 4: Return the Challenge Report

Return a complete **Challenge Report** with:

1. Context
2. Analysis and findings
3. Decision Frame
4. Risks and Open Questions
5. Action Plan

### Step 5: Ask for Next Action

If the verdict is `DEFEND` or `ESCALATE`, ask the PM whether they want to send the findings back to the producing agent.

In v1 this is PM-mediated. The command does not automatically reopen the original workflow.

If the PM says yes and a producing Shipwright agent is known, pass both the original artifact and the findings verbatim to that agent and ask it to respond to each finding directly rather than summarizing or selectively filtering them.

If the PM says yes but no producing agent is known, say so explicitly and ask whether they want to nominate a Shipwright agent to revise the artifact or handle the revision manually.

## Output

Produce a **Challenge Report** that:

1. States a verdict: `CLEAR`, `DEFEND`, or `ESCALATE`
2. Lists evidence-backed findings with severity and resolution conditions
3. Makes the next action obvious for the PM
