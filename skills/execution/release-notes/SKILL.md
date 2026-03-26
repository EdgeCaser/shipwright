---
name: release-notes
category: execution
tags: [changelog, customer-communication, release-management, multi-audience, content-adaptation]
inputs: [merged PRs or completed tickets, release version and date, feature descriptions and bug fixes]
outputs: [customer-facing release notes, internal release notes by audience, channel-adapted variants]
pairs_with: [go-to-market-strategy, sprint-planning, competitive-battlecard]
---

# Release Notes Generator

## Description

Transforms Jira/Linear tickets, changelogs, and commit histories into polished, customer-facing release notes. Supports segmentation by audience (end users, admins, developers) and tone calibration for different channels.

## When to Use

- After each release or deployment
- Preparing changelog entries for product updates
- Drafting customer communications for major releases
- Creating internal release summaries for support, sales, and CS teams

## Framework

### Step 1: Gather Raw Inputs

Collect the raw materials for the release:

```markdown
## Release: [version / name]
## Date: [release date]
## Type: [Major / Minor / Patch / Hotfix]

### Raw Inputs
- [ ] Merged PRs / commits since last release
- [ ] Completed Jira/Linear tickets
- [ ] Design specs for new features
- [ ] Bug reports that were resolved
- [ ] Performance improvements with benchmarks
- [ ] Breaking changes or deprecations
```

### Step 2: Categorize Changes

Group changes into standard categories:

```markdown
### New Features
- [Feature name]: [One-sentence description of what users can now do]

### Improvements
- [Area]: [What got better and how it helps]

### Bug Fixes
- [Fixed]: [What was broken and what the fix means for users]

### Performance
- [Area]: [What improved — include numbers if available]

### Breaking Changes
- [Change]: [What stopped working and what to do instead]

### Deprecations
- [Feature]: [What's being phased out, timeline, and migration path]
```

### Step 3: Write Customer-Facing Notes

**Rules for good release notes:**
- Lead with value, not implementation
- Use customer language, not engineering jargon
- Explain "what you can do now" not "what we changed"
- Include visuals (screenshots, GIFs) for significant UI changes
- Call out breaking changes prominently

```markdown
# What's New in [Product] [Version]
[Release date]

## Highlights

### [Feature Name] — [Benefit headline]
[2-3 sentences explaining what this enables for the user. Focus on the outcome, not the mechanism. Include a concrete example of when you'd use this.]

### [Improvement Name] — [Benefit headline]
[1-2 sentences on what got better.]

## Fixes & Improvements
- **[Area]:** [Plain-language description of what was fixed]
- **[Area]:** [Description]

## Breaking Changes
> **Action required:** [Clear description of what changed, who's affected, and what to do]

## Coming Soon
[Optional: tease what's next to maintain momentum]
```

### Step 4: Write Internal Release Notes

Different audience, different depth:

```markdown
# Internal Release Notes: [Version]

## For Support/CS Teams
### What customers will notice:
- [Visible change 1 — with talking points for customer questions]
- [Visible change 2]

### Known issues still open:
- [Issue] — Workaround: [steps]

### FAQ for customer questions:
Q: [Anticipated question]
A: [Suggested response]

## For Sales Teams
### New selling points:
- [Feature] enables [use case] — relevant for [segment]

### Competitive implications:
- [How this changes our competitive position]

## For Engineering/On-Call
### Deployment notes:
- [Migration steps, feature flags, rollback procedure]

### Monitoring:
- [What to watch — metrics, alerts, dashboards]
```

### Step 5: Channel Adaptation

Adapt the same content for different channels:

| Channel | Length | Tone | Focus |
|---|---|---|---|
| In-app changelog | 1-2 sentences per item | Concise, scannable | What's new |
| Email announcement | 3-5 paragraphs | Warm, excited | Top highlights + CTA |
| Blog post | 500-1000 words | Narrative, detailed | Story behind the release |
| Social media | 1-2 sentences | Punchy, visual | Single biggest highlight |
| Slack/internal | Bullet points | Casual, practical | What the team needs to know |

## Output Format

Produce:
1. **Customer-Facing Release Notes** — polished, benefit-oriented
2. **Internal Release Notes** — segmented by audience (Support, Sales, Eng)
3. **Channel Variants** — adapted versions for email, blog, social, in-app

## Common Mistakes to Avoid

- **Engineering jargon** — "Refactored the query layer" means nothing to customers; "Search is now 3x faster" does
- **Listing every ticket** — Customers don't need to see "Fixed typo in tooltip." Curate.
- **Burying breaking changes** — These need prominent placement and clear migration instructions
- **No internal notes** — Support and sales teams get blindsided without a heads-up
- **Inconsistent cadence** — Ship release notes with every release; silence erodes trust
