---
name: sprint
description: "Prepare a complete sprint plan: goal, capacity, story selection, dependency check, and sprint agreement."
---

# /sprint — Sprint Planning Workflow

Run this command to prepare for sprint planning with a structured, ready-to-discuss sprint plan.

## Workflow Steps

### Step 1: Define the Sprint Goal
Read and apply `/skills/execution/sprint-planning/SKILL.md`.

Ask the PM:
- What's the most important outcome for this sprint?
- Which roadmap initiative(s) does this sprint serve?
- Are there any hard deadlines or commitments this sprint?

Draft a sprint goal using the template:
"This sprint, we will [action] so that [outcome]. We'll know we succeeded when [measurable result]."

### Step 2: Calculate Capacity
- List team members and availability (accounting for PTO, on-call, meetings)
- Calculate total person-days
- Allocate: 60-70% sprint goal work, 10-15% bugs, 10-15% tech debt, 10% buffer

### Step 3: Select Stories
From the backlog, pull stories that:
1. Directly support the sprint goal (first priority)
2. Are estimated and have complete acceptance criteria
3. Fit within capacity allocation

Flag any stories that are missing acceptance criteria or estimates.

### Step 4: Dependency & Risk Check
For each committed story:
- Identify cross-team dependencies
- Assess risk level (Low/Medium/High)
- Define mitigation for Medium and High risks

### Step 5: Draft Sprint Agreement
Assemble the sprint agreement:
- Sprint goal
- Committed stories (with estimates)
- Stretch stories (if capacity allows)
- Explicitly deferred items
- Definition of done for the sprint

## Output

Produce a **Sprint Plan** document containing:
1. Sprint Goal
2. Capacity Breakdown
3. Committed Scope (stories + estimates)
4. Dependency Map
5. Risk Register
6. Sprint Agreement (committed, stretch, deferred)
