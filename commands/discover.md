---
name: discover
description: "Run a full discovery cycle: brainstorm opportunities, identify assumptions, prioritize, and design experiments."
---

# /discover, Full Discovery Workflow

Run this command to execute a structured product discovery cycle. This chains four skills into a single end-to-end workflow.

## Workflow Steps

### Step 1: Opportunity Mapping
Read and apply the framework from `/skills/discovery/opportunity-solution-tree/SKILL.md`.

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
