---
name: okrs
description: "Draft, review, and stress-test OKRs for a team or product area."
---

Shipwright root: `${CLAUDE_PLUGIN_ROOT}`. Read Shipwright docs and run its helper scripts from that absolute path; it stands in for `<installed-root>` and `<absolute-shipwright-root>` below. If it still shows a variable name, locate the root from this file's path instead.

# /okrs - OKR Authoring Workflow

Before executing, read `docs/workflow-contract.md` from this Shipwright installation. Resolve it relative to this file's parent installation root (or the plugin root), not the user's product directory. Its handoff, depth, evidence and authorization rules apply throughout.

Run this command to draft OKRs, check them for common anti-patterns, and produce a finalized set ready for review.

## Workflow Steps

### Step 1: Context Gathering
Ask the PM:
- What time period are these OKRs for?
- What are the top 1-3 strategic priorities for this period?
- What happened last period? (Which OKRs hit, which missed, what changed?)
- Are there company-level OKRs these need to cascade from?

### Step 2: Draft OKRs
Read and apply the framework from `skills/okr-authoring/SKILL.md`.

Draft 2-3 Objectives with 3-5 Key Results each. Ensure:
- Objectives are qualitative and inspiring
- Key Results are quantitative and measurable
- Each Key Result has a clear current value and target value

### Step 3: Anti-Pattern Audit
Review the drafted OKRs against common failure modes:
- Key Results that are actually tasks (outputs, not outcomes)
- Objectives that are too vague to be meaningful
- Missing baselines (can't measure progress without a starting point)
- Sandbagging (targets set too low to be meaningful)
- Too many OKRs (more than 3 objectives signals lack of focus)

Flag any issues and suggest fixes.

### Step 4: Alignment Check
Map each OKR to:
- Which strategic priority it supports
- Which team members own each Key Result
- What dependencies exist on other teams

## Output

Produce an **OKR Document** containing:
1. 2-3 Objectives with 3-5 Key Results each (audited and clean)
2. Scoring criteria for each Key Result (what does 0.3, 0.7, 1.0 look like?)
3. Dependency map
4. Recommended check-in cadence and review dates
