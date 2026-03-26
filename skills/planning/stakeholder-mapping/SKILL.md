---
name: stakeholder-mapping
description: "Maps stakeholders on a Power × Interest grid, defines engagement strategies per quadrant, tracks alignment over time, and produces a communication plan. Ensures PMs invest their limited influence capital where it matters most."
category: planning
---

# Stakeholder Mapping (Power × Interest)

## Description

Maps stakeholders on a Power × Interest grid, defines engagement strategies per quadrant, tracks alignment over time, and produces a communication plan. Ensures PMs invest their limited influence capital where it matters most.

## When to Use

- Kicking off a new initiative that touches multiple teams or executives
- Navigating organizational complexity around a controversial decision
- New PM onboarding to understand the political landscape
- Before a major launch that requires cross-functional buy-in
- When stakeholder misalignment is blocking progress

## Framework

### Step 1: Identify Stakeholders

```markdown
## Stakeholder Register: [Initiative Name]

| # | Name | Role / Title | Team | Relationship to Initiative |
|---|---|---|---|---|
| S1 | [Name] | [Title] | [Team] | [Decision-maker / Influencer / Contributor / Informed] |
| S2 | [Name] | [Title] | [Team] | [Role] |
| S3 | [Name] | [Title] | [Team] | [Role] |

### Stakeholder Types
- **Decision-maker:** Has authority to approve, block, or fund
- **Influencer:** Shapes the decision-maker's opinion
- **Contributor:** Provides expertise, resources, or execution
- **Informed:** Needs to know but doesn't decide
```

### Step 2: Map Power × Interest

```markdown
## Power × Interest Grid

Rate each stakeholder:
- **Power (1-5):** Ability to impact the initiative's success (budget, authority, resources, political influence)
- **Interest (1-5):** How much they care about this initiative's outcome

| Stakeholder | Power | Interest | Quadrant | Current Stance |
|---|---|---|---|---|
| [S1] | [1-5] | [1-5] | [Manage Closely / Keep Satisfied / Keep Informed / Monitor] | [Champion / Supportive / Neutral / Resistant / Hostile] |

### Quadrant Definitions

```
              HIGH INTEREST
                   │
    Keep Satisfied │  Manage Closely
    (High Power,   │  (High Power,
     Low Interest)  │   High Interest)
                   │
HIGH POWER ────────┼──────── LOW POWER
                   │
    Monitor        │  Keep Informed
    (Low Power,    │  (Low Power,
     Low Interest)  │   High Interest)
                   │
              LOW INTEREST
```

### Engagement Strategy by Quadrant

| Quadrant | Strategy | Frequency | Channel |
|---|---|---|---|
| **Manage Closely** | Deep partnership. Regular 1:1s. Co-create the solution. Address concerns proactively. | Weekly | 1:1 meetings, Slack DM |
| **Keep Satisfied** | Keep them happy without overwhelming. Executive summaries. Escalate decisions to them. | Biweekly | Email summaries, steering committee |
| **Keep Informed** | Regular updates. Invite to demos. Give them a voice. | Monthly | Team updates, all-hands |
| **Monitor** | Light touch. Don't ignore, but don't over-invest. | Quarterly | Broad comms, newsletters |
```

### Step 3: Analyze Alignment & Risk

```markdown
## Alignment Analysis

### Champions (actively support)
| Stakeholder | Why They Support | How to Leverage |
|---|---|---|
| [Name] | [Their motivation] | [How they can help — e.g., "Can advocate in exec meeting"] |

### Resistors (actively oppose or passively block)
| Stakeholder | Why They Resist | Risk Level | Engagement Plan |
|---|---|---|---|
| [Name] | [Their concern] | [High/Med/Low] | [Specific plan to address their concern] |

### Swing Votes (could go either way)
| Stakeholder | What They Care About | What Would Win Them | What Would Lose Them |
|---|---|---|---|
| [Name] | [Their priorities] | [How to get their support] | [What would push them to resist] |

### Influence Network
Who influences whom?
- [Decision-maker A] is heavily influenced by [Influencer B]
- [Resistor C] reports to [Champion D] — potential path to resolution
- [Swing Vote E] trusts [F's] technical judgment
```

### Step 4: Build the Communication Plan

```markdown
## Stakeholder Communication Plan

| Stakeholder | Quadrant | Key Message | Channel | Frequency | Owner | Next Touch |
|---|---|---|---|---|---|---|
| [S1] | Manage Closely | [Tailored message — what they care about] | 1:1 | Weekly | [PM] | [Date] |
| [S2] | Keep Satisfied | [Executive summary focus] | Email | Biweekly | [PM] | [Date] |

### Communication Principles
1. **Tailor the message** — Each stakeholder cares about different things; don't send the same update to everyone
2. **Bad news travels fast** — Tell "Manage Closely" stakeholders about risks BEFORE they hear from someone else
3. **Ask, don't just inform** — Engagement is more powerful than broadcasting
4. **Track commitments** — If you promised to follow up, follow up
```

### Step 5: Track Over Time

```markdown
## Alignment Tracking

| Stakeholder | Start | Month 1 | Month 2 | Month 3 | Trend | Notes |
|---|---|---|---|---|---|---|
| [S1] | Neutral | Supportive | Supportive | Champion | ↑ | Won over after demo |
| [S2] | Resistant | Resistant | Neutral | Neutral | → | Concern partially addressed |
| [S3] | Champion | Champion | Champion | Champion | → | Consistent ally |

### Escalation Triggers
If any "Manage Closely" stakeholder moves to "Resistant":
- [ ] Schedule urgent 1:1 within 48 hours
- [ ] Understand the specific concern (don't assume)
- [ ] Develop a resolution plan
- [ ] Involve their champion/influencer if direct approach fails
```

## Output Format

Produce a Stakeholder Map with:
1. **Register** — all stakeholders with roles
2. **Power × Interest Grid** — mapped and quadranted
3. **Alignment Analysis** — champions, resistors, swing votes, influence network
4. **Communication Plan** — tailored by stakeholder
5. **Tracking Sheet** — alignment over time with escalation triggers

## Common Mistakes to Avoid

- **Mapping only the obvious stakeholders** — Include indirect influencers, executive assistants, and "shadow" decision-makers
- **Static map** — Stakeholder positions change; update monthly
- **Same message to everyone** — The VP of Engineering cares about different things than the VP of Sales
- **Ignoring resistors** — Unaddressed resistance becomes sabotage; engage early
- **Over-investing in "Monitor" quadrant** — Don't spend weekly 1:1 time on people who have low power and low interest
