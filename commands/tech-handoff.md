---
name: tech-handoff
description: "Complete handoff from strategy to engineering: PRD, technical spec, design review, epic breakdown, and user stories."
---

# /tech-handoff — Strategy-to-Engineering Handoff Workflow

Run this command to take an approved strategic initiative and produce everything engineering needs to start building. This is the most comprehensive workflow — it chains 5 skills into the full PM-to-engineering handoff.

## Workflow Steps

### Step 1: PRD Development
Read and apply `/skills/execution/prd-development/SKILL.md`.

Ask the PM:
- What initiative are we handing off?
- Is there an existing strategy document or brief?
- Who are the key stakeholders and reviewers?

Produce the full PRD using the Working Backwards method: press release, FAQ, detailed requirements with user stories and success metrics.

### Step 2: Technical Specification
Read and apply `/skills/technical/technical-spec/SKILL.md`.

Translate the PRD into an engineering-ready technical spec:
- System architecture with ADRs for key decisions
- API contracts (if applicable)
- Data model changes and migrations
- Non-functional requirements (performance, security, reliability)
- Rollout and rollback plan

### Step 3: Design Review
Read and apply `/skills/technical/design-review/SKILL.md`.

Run the 7-perspective review on the combined PRD + tech spec:
- Engineering, Design, Executive, Legal, Customer Voice, Devil's Advocate, Sales
- Synthesize: consensus, tensions, blockers, open questions

Surface any issues that need resolution before proceeding to breakdown.

### Step 4: Epic Breakdown
Read and apply `/skills/execution/epic-breakdown/SKILL.md`.

Decompose the initiative into shippable epics:
- Each with hypothesis, success metric, scope boundaries, and estimated effort
- Sequenced by risk (riskiest first) and dependencies
- Validated against the breakdown checklist

### Step 5: User Story Writing
Read and apply `/skills/execution/user-story-writing/SKILL.md`.

For the first 1-2 epics (the ones engineering will start on), produce complete user stories:
- Story statements (As a / I want / So that)
- Acceptance criteria (Given / When / Then)
- Edge cases and error states
- Definition of done

## Output

Produce a **Tech Handoff Package** containing:
1. PRD (press release + FAQ + detailed requirements)
2. Technical Specification (architecture, API, data model, NFRs)
3. Design Review Report (7-perspective synthesis)
4. Epic Breakdown (sequenced with hypotheses and metrics)
5. User Stories (for first 1-2 epics, with full acceptance criteria)

This package gives engineering everything they need to estimate, plan, and start building.
