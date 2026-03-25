---
name: write-prd
description: "Generate a complete PRD using Amazon's Working Backwards method: press release, FAQ, then detailed requirements."
---

# /write-prd — PRD Development Workflow

Run this command to produce a full Product Requirements Document using the Working Backwards method.

## Workflow Steps

### Step 1: Gather Context
Ask the PM for:
- What problem are we solving?
- Who is the target customer/persona?
- What evidence supports this need? (interviews, data, requests)
- Any existing strategic context? (Check CLAUDE.md for product context)

### Step 2: Write the Press Release
Read and apply `/skills/execution/prd-development/SKILL.md`.

Write a fictional press release announcing the finished product:
- Headline (customer-centric)
- Summary paragraph
- Problem statement (from customer's perspective)
- Solution description (experience, not implementation)
- How it works (3-5 steps)
- Customer quote (fictional)

Review with the PM before proceeding. The press release is the alignment tool — if it doesn't feel right, the PRD won't either.

### Step 3: Write the FAQ
Customer FAQ (3-5 questions a customer would ask) and Internal FAQ covering:
- Why now?
- What are we NOT building?
- How will we measure success?
- What are the biggest risks?

### Step 4: Write User Stories
Read and apply `/skills/execution/user-story-writing/SKILL.md`.

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

Produce a complete **PRD document** ready for stakeholder review, containing:
1. Press Release
2. FAQ (Customer + Internal)
3. Detailed Requirements with User Stories
4. Success Metrics
5. Rollout Plan
