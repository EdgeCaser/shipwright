---
name: write-prd
description: "Generate a complete PRD using Amazon's Working Backwards method: press release, FAQ, then detailed requirements."
---

# /write-prd, PRD Development Workflow

Before executing, read `docs/workflow-contract.md` from this Shipwright installation. Resolve it relative to this file's parent installation root (or the plugin root), not the user's product directory. Its handoff, depth, evidence and authorization rules apply throughout.

Run this command to produce a full Product Requirements Document using the Working Backwards method.

## Workflow Steps

### Step 1: Gather Context
Use the problem statement, customer context, and evidence already supplied. Ask at most two
targeted questions only when a missing decision would materially change the PRD:
- What problem are we solving?
- Who is the target customer/persona?
- What evidence supports this need? (interviews, data, requests)
- Any existing strategic context? (Check CLAUDE.md for product context)

### Step 2: Write the Press Release
Read and apply `skills/execution/prd-development/SKILL.md`.

Write a fictional press release announcing the finished product:
- Headline (customer-centric)
- Summary paragraph
- Problem statement (from customer's perspective)
- Solution description (experience, not implementation)
- How it works (3-5 steps)
- Customer quote (sourced verbatim, or `[TBD, requires: customer quote]`)

Use the press release to test the product narrative, then continue to the complete PRD. Mark
unresolved assumptions and questions in the artifact rather than pausing the workflow.

### Step 3: Write the FAQ
Customer FAQ (3-5 questions a customer would ask) and Internal FAQ covering:
- Why now?
- What are we NOT building?
- How will we measure success?
- What are the biggest risks?

### Step 4: Write User Stories
Read and apply `skills/execution/user-story-writing/SKILL.md`.

For each persona, generate user stories with:
- Story statement (As a / I want / So that)
- Acceptance criteria (Given/When/Then)
- Edge cases
- Definition of done

### Step 5: Complete the PRD
Assemble the full PRD with all sections:
- Context & Motivation
- Goals & Success Metrics (with guardrails)
- User Stories
- Scope (In / Out / Future)
- Technical Considerations
- Dependencies
- Rollout Plan
- Open Questions

## Output

Produce a complete **PRD document** ready for stakeholder review at the selected depth. At Light
depth, follow the PRD skill's one-page brief omit rules. At Standard or Deep depth, include:
1. Press Release
2. FAQ (Customer + Internal)
3. Detailed Requirements with User Stories
4. Success Metrics
5. Rollout Plan
