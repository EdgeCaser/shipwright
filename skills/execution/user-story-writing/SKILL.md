---
name: user-story-writing
category: execution
tags: [user-stories, acceptance-criteria, invest-criteria, story-splitting, given-when-then]
inputs: [PRD requirements or epic scope, persona definitions, feature context]
outputs: [user stories with acceptance criteria, edge case tables, definition of done checklists]
pairs_with: [prd-development, epic-breakdown, jobs-to-be-done]
---

# User Story Writing

## Description

Generates user stories with acceptance criteria, edge cases, and definition of done. Supports splitting epics into right-sized stories using the INVEST criteria. Based on Mike Cohn's user story methodology.

## When to Use

- Breaking down PRD requirements into implementable work items
- Sprint planning and backlog grooming
- Ensuring engineering, design, and QA share the same understanding of "done"
- Training teams on effective story writing

## Key Concepts

### INVEST Criteria

Every story should be:
- **I**ndependent — Can be built and delivered separately from other stories
- **N**egotiable — Details can be discussed; it's not a rigid contract
- **V**aluable — Delivers value to a user or stakeholder
- **E**stimable — Team can estimate the effort required
- **S**mall — Completable within one sprint
- **T**estable — Clear criteria to verify it works

## Framework

### Step 1: Story Format

```
As a [persona],
I want to [action/capability],
So that [benefit/outcome].
```

**Rules:**
- The persona should be specific (not "a user" — use named personas)
- The action should describe a goal, not a UI interaction
- The benefit must be from the user's perspective

**Good:** "As a hiring manager, I want to filter candidates by years of experience, so that I can quickly find qualified applicants for senior roles."

**Bad:** "As a user, I want a dropdown, so that I can select things."

### Step 2: Acceptance Criteria

Use Given/When/Then format for testable criteria:

```markdown
### Acceptance Criteria

**AC1: [Scenario name]**
- Given [precondition]
- When [action]
- Then [expected result]

**AC2: [Scenario name]**
- Given [precondition]
- When [action]
- Then [expected result]

**AC3: [Negative / edge case]**
- Given [precondition]
- When [invalid action or edge condition]
- Then [expected error handling / graceful behavior]
```

**Rules:**
- Minimum 3 acceptance criteria per story (happy path, alternate path, error path)
- Each criterion must be independently testable
- Include data boundaries (max length, empty states, null values)
- Include permission/access scenarios if relevant

### Step 3: Edge Cases & Error States

```markdown
### Edge Cases
| Scenario | Expected Behavior |
|---|---|
| [Empty state — no data] | [What the user sees] |
| [Maximum data — 10,000 items] | [Performance expectation] |
| [Concurrent editing] | [Conflict resolution behavior] |
| [Network failure mid-action] | [Recovery behavior] |
| [Invalid input] | [Validation message] |
```

### Step 4: Definition of Done

```markdown
### Definition of Done
- [ ] All acceptance criteria pass
- [ ] Edge cases handled per specification
- [ ] Unit tests written and passing
- [ ] Integration tests updated
- [ ] Accessibility review complete (keyboard nav, screen reader)
- [ ] Performance within acceptable thresholds
- [ ] Code reviewed and approved
- [ ] Design review complete
- [ ] Documentation updated (if user-facing)
- [ ] Feature flag configured (if applicable)
```

### Step 5: Story Splitting (when stories are too large)

**Splitting strategies:**
1. **By workflow step** — Registration → Login → Profile setup
2. **By data variation** — Text input → File upload → Rich text
3. **By operation** — Create → Read → Update → Delete
4. **By role** — Admin view → Member view → Guest view
5. **By platform** — Web → Mobile → API
6. **By happy path vs. edge case** — Core flow → Error handling → Bulk operations

**Template for split stories:**
```markdown
## Original Epic: [Epic name]

### Story 1: [Core happy path]
As a [persona], I want to [simplest version], so that [core value].
Estimate: [S/M]

### Story 2: [Variation or extension]
As a [persona], I want to [additional capability], so that [additional value].
Estimate: [S/M]
Depends on: Story 1

### Story 3: [Edge cases and error handling]
As a [persona], I want [graceful handling of X], so that [I don't lose work / get confused].
Estimate: [S]
Depends on: Story 1
```

## Output Format

For each user story, produce:
1. **Story statement** — As a / I want to / So that
2. **Acceptance criteria** — Given/When/Then for each scenario
3. **Edge cases** — table of scenarios and expected behaviors
4. **Definition of done** — checklist
5. **Estimation notes** — dependencies, risks, unknowns

## Common Mistakes to Avoid

- **Stories that are tasks** — "Set up database table" is a task, not a user story
- **Missing the "so that"** — Without the benefit, you can't evaluate trade-offs
- **Acceptance criteria that duplicate implementation** — Describe *what*, not *how*
- **Stories too large to estimate** — If it can't fit in a sprint, split it
- **Ignoring unhappy paths** — Error states and empty states are where UX quality lives
