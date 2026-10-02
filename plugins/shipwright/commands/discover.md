---
name: discover
description: "Run a full discovery cycle: brainstorm opportunities, identify assumptions, prioritize, and design experiments."
---

Shipwright root: `${CLAUDE_PLUGIN_ROOT}`. Read Shipwright docs and run its helper scripts from that absolute path; it stands in for `<installed-root>` and `<absolute-shipwright-root>` below. If it still shows a variable name, locate the root from this file's path instead.

# /discover, Full Discovery Workflow

Before executing, read `docs/workflow-contract.md` from this Shipwright installation. Resolve it relative to this file's parent installation root (or the plugin root), not the user's product directory. Its handoff, depth, evidence and authorization rules apply throughout.

Run this command to execute a structured product discovery cycle. This applies one opportunity-mapping framework through four stages.

## Workflow Steps

### Step 1: Opportunity Mapping
Read and apply the framework from `skills/opportunity-solution-tree/SKILL.md`.

Ask the PM:
- What is the desired outcome we're targeting?
- What do we already know about customer needs in this area?
- What evidence do we have (interviews, data, support tickets)?

Produce an Opportunity Solution Tree with the desired outcome at the top and customer opportunities mapped below.

### Step 2: Assumption Identification
For the top 3-5 opportunities and their proposed solutions, surface the riskiest assumptions.

Categorize each assumption:
- **Desirability:** Will customers want this?
- **Viability:** Will this work for the business?
- **Feasibility:** Can we build this?
- **Usability:** Can customers figure this out?

### Step 3: Assumption Prioritization
Prioritize assumptions using a Risk × Impact matrix:
- Risk = How likely is this assumption to be wrong? (Low confidence = high risk)
- Impact = If this assumption is wrong, how much does it change our plan?

Focus on HIGH risk × HIGH impact assumptions first.

### Step 4: Experiment Design
For each of the top 3 riskiest assumptions, design a lightweight experiment:
- Method (prototype test, survey, data analysis, concierge, Wizard of Oz)
- Success criteria (what result validates the assumption)
- Failure criteria (what result invalidates it)
- Timeline and cost

## Output

Produce a single **Discovery Report** document containing:
1. Opportunity Solution Tree
2. Assumption Register (all assumptions, categorized and scored)
3. Experiment Backlog (top 3 experiments, fully specified)
4. Recommended next steps
