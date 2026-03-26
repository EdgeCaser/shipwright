---
name: retrospective-facilitator
description: "Runs structured team retrospectives using proven formats (Start/Stop/Continue, 4Ls, Sailboat, Mad/Sad/Glad). Produces an action item list with owners, due dates, and follow-up mechanisms to ensure retro outcomes actually lead to change."
category: measurement
---

# Retrospective Facilitator

## Description

Runs structured team retrospectives using proven formats (Start/Stop/Continue, 4Ls, Sailboat, Mad/Sad/Glad). Produces an action item list with owners, due dates, and follow-up mechanisms to ensure retro outcomes actually lead to change.

## When to Use

- End of sprint retrospectives
- Post-launch reviews
- Post-incident retrospectives
- Quarterly team health checks
- After any significant milestone or project completion

## Available Formats

### Format 1: Start / Stop / Continue

Best for: Regular sprint retros. Simple and actionable.

```markdown
## Start (things we should begin doing)
- [Suggestion] — Raised by: [name/role]
  - Why: [reasoning]

## Stop (things we should stop doing)
- [Suggestion] — Raised by: [name/role]
  - Why: [reasoning]

## Continue (things that are working well)
- [Observation] — Raised by: [name/role]
  - Evidence: [why this is working]
```

### Format 2: 4Ls (Liked, Learned, Lacked, Longed For)

Best for: Post-project or post-launch retros. Good for capturing learnings.

```markdown
## Liked (what went well)
- [Item]

## Learned (new insights or skills gained)
- [Item]

## Lacked (what was missing)
- [Item]

## Longed For (what we wish we had)
- [Item]
```

### Format 3: Sailboat

Best for: Visual teams. Good for identifying risks alongside positives.

```markdown
## Wind (what propelled us forward)
- [Tailwind factor]

## Anchor (what held us back)
- [Drag factor]

## Rocks (risks ahead)
- [Upcoming risk]

## Island (our goal / destination)
- [What we're sailing toward]
```

### Format 4: Mad / Sad / Glad

Best for: Emotional check-ins. Good when team morale needs attention.

```markdown
## Mad (frustrated about)
- [Item]

## Sad (disappointed about)
- [Item]

## Glad (happy about)
- [Item]
```

## Framework

### Step 1: Set the Stage

```markdown
## Retrospective: [Sprint/Project/Event Name]
**Date:** [date]
**Participants:** [names]
**Facilitator:** [name]
**Format:** [chosen format]
**Time scope:** [what period are we reflecting on]

### Ground Rules
- Focus on processes and systems, not individuals
- Assume positive intent
- Be specific — "communication was bad" → "We didn't have a single source of truth for the API spec, which caused 3 misalignment bugs"
- Everyone participates
```

### Step 2: Gather Input

For each format category, gather observations:

```markdown
## Observations

[Use the chosen format structure above]

### Themes (clustered from raw observations)
| Theme | Observations | Votes/Frequency |
|---|---|---|
| [Theme 1 — e.g., "Requirements clarity"] | [N] related items | [N] votes |
| [Theme 2 — e.g., "Cross-team communication"] | [N] related items | [N] votes |
| [Theme 3] | [N] | [N] |
```

### Step 3: Discuss Top Themes

For each prioritized theme (top 2-3 by votes):

```markdown
### Theme: [Name]

**What happened:**
[Factual description of the issue or success]

**Root cause(s):**
- [Cause 1]
- [Cause 2]

**Impact:**
[How this affected the team, product, or users]

**Proposed action:**
[Specific, actionable improvement]
```

### Step 4: Define Action Items

```markdown
## Action Items

| # | Action | Owner | Due Date | Status | Success Criteria |
|---|---|---|---|---|---|
| 1 | [Specific action] | [Name] | [Date] | Open | [How we know it's done] |
| 2 | [Specific action] | [Name] | [Date] | Open | [How we know it's done] |
| 3 | [Specific action] | [Name] | [Date] | Open | [How we know it's done] |

### Follow-Up Plan
- Action items reviewed at: [next retro / standup / 1:1]
- Accountability mechanism: [how we'll track progress]
```

### Step 5: Review Previous Action Items

```markdown
## Previous Retro Action Items (Review)

| Action | Owner | Status | Outcome |
|---|---|---|---|
| [Action from last retro] | [Name] | [Done / In Progress / Not Started] | [What happened] |
```

## Output Format

Produce a Retrospective Report with:
1. **Setup** — date, participants, format, scope
2. **Observations** — gathered input using the chosen format
3. **Themes** — clustered and prioritized
4. **Discussion** — root causes and proposed actions for top themes
5. **Action Items** — owned, dated, with success criteria
6. **Previous Items Review** — accountability check

## Common Mistakes to Avoid

- **No action items** — A retro without actions is just venting
- **Unowned actions** — "The team will improve communication" means nobody will
- **Never reviewing past actions** — Without follow-through, teams stop trusting retros
- **Blame culture** — Focus on systems and processes, not individuals
- **Always the same format** — Rotate formats to keep retros fresh and surface different insights
