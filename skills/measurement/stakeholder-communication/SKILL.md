---
name: stakeholder-communication
category: measurement
tags: [status-updates, executive-summary, pyramid-principle, risk-escalation, steering-committee]
inputs: [project status data, audience type, key metrics and risks]
outputs: [status update document, risk escalation brief, cross-functional update]
pairs_with: [executive-briefing, stakeholder-mapping, metrics-dashboard]
---

# Stakeholder Communication

## Description

Drafts status updates, steering committee decks, and executive summaries calibrated to audience seniority and information needs. Uses the Pyramid Principle (lead with the answer) and adapts depth, tone, and format by stakeholder type.

## When to Use

- Weekly or biweekly status updates to leadership
- Steering committee or executive review preparation
- Cross-functional alignment communications
- Escalation or risk communication to senior leadership
- Project kickoff or completion announcements

## Framework

### The Pyramid Principle

Always lead with the conclusion, then support it:

```
Level 1: Answer / Recommendation (what you want them to know or do)
  Level 2: Supporting arguments (why)
    Level 3: Evidence (data and specifics)
```

**Never bury the lead.** Executives read the first sentence. If the most important thing is on page 3, they'll never see it.

### Communication Templates by Audience

#### Template 1: Executive Status Update (C-Suite / VP)

```markdown
# [Product/Initiative] Status Update — [Date]

## Bottom Line
[One sentence: Are we on track, at risk, or off track? What's the most important thing they need to know?]

**Status: 🟢 On Track / 🟡 At Risk / 🔴 Off Track**

## Key Metrics
| Metric | Target | Actual | Trend |
|---|---|---|---|
| [North Star] | [target] | [actual] | [↑/↓/→] |
| [Key metric 2] | [target] | [actual] | [↑/↓/→] |

## Highlights
- [Win 1 — quantified impact]
- [Win 2 — quantified impact]

## Risks & Blockers
| Risk | Impact | Mitigation | Need from You |
|---|---|---|---|
| [Risk 1] | [impact] | [what we're doing] | [decision or resource needed] |

## Decisions Needed
1. [Decision with options and recommendation]

## Next Week's Focus
- [Priority 1]
- [Priority 2]
```

**Rules for exec communication:**
- Maximum 1 page / 5 minutes of reading time
- Lead with status and bottom line
- Only include risks that require their action
- Every risk should have a mitigation and a clear ask

#### Template 2: Steering Committee Update

```markdown
# Steering Committee Update: [Initiative]
## [Date]

### Executive Summary (30 seconds)
[2-3 sentences: Where are we, what's changed, what needs attention]

### Progress Against Milestones
| Milestone | Target Date | Status | Notes |
|---|---|---|---|
| [Milestone 1] | [date] | ✅ Complete | [delivered on time] |
| [Milestone 2] | [date] | 🔄 In Progress | [on track for delivery] |
| [Milestone 3] | [date] | ⚠️ At Risk | [reason and mitigation] |

### Budget Status
| Category | Budgeted | Spent | Remaining | Forecast |
|---|---|---|---|---|
| [Engineering] | $[X] | $[Y] | $[Z] | [On/Over/Under budget] |

### Key Decisions Made Since Last Update
1. [Decision] — Rationale: [why] — Impact: [what changes]

### Decisions Required from Committee
1. **[Decision needed]**
   - Option A: [description] — Pro: [x] / Con: [y]
   - Option B: [description] — Pro: [x] / Con: [y]
   - **Recommendation:** [Option X] because [rationale]

### Risks & Issues
| # | Description | Owner | Severity | Status |
|---|---|---|---|---|
| R1 | [Risk] | [Name] | High/Med/Low | [Mitigating/Monitoring/Escalated] |

### Next Review: [Date]
```

#### Template 3: Cross-Functional Team Update

```markdown
# [Initiative] Team Update — Week of [Date]

## What We Shipped
- [Shipped item — with link to release notes / demo]

## What We Learned
- [Learning from user feedback, data, or experiment]

## What's Next
- [Next sprint goal / focus area]

## Where We Need Help
- **From [Team]:** [Specific request]
- **From [Team]:** [Specific request]

## FYI / Awareness
- [Something other teams should know about]
```

#### Template 4: Risk Escalation

```markdown
# Risk Escalation: [Issue Name]

## Situation (what happened)
[Factual description — 2-3 sentences max]

## Impact (why it matters)
- [Business impact — revenue, users, reputation]
- [Timeline impact — delay, missed commitment]
- [Who is affected]

## Actions Taken
1. [What we've already done]
2. [What's in progress]

## Options & Recommendation
| Option | Pros | Cons | Cost |
|---|---|---|---|
| A: [Description] | [pro] | [con] | [cost] |
| B: [Description] | [pro] | [con] | [cost] |

**Recommendation:** [Option] because [rationale]

## Decision Needed By: [Date/Time]
**Decision-maker:** [Name]
```

### Audience Calibration Guide

| Audience | Length | Detail Level | Tone | Focus On |
|---|---|---|---|---|
| C-Suite | < 1 page | Headline only | Decisive, concise | Outcomes, risks, decisions needed |
| VP/Director | 1-2 pages | Key details | Professional, data-driven | Progress, trade-offs, recommendations |
| Cross-functional peers | 1 page | Moderate detail | Collaborative, open | What's shipping, where you need help |
| Engineering team | As needed | Full detail | Technical, specific | Specs, blockers, technical decisions |
| Board/Investors | 1-2 pages | Curated metrics | Confident, forward-looking | Growth, milestones, market position |

## Output Format

Produce the appropriate communication document based on the audience:
1. **Identify the audience** — who's reading this and what do they care about
2. **Select the template** — match audience to format
3. **Draft the communication** — Pyramid Principle, lead with the answer
4. **Calibrate the detail** — right depth for the audience
5. **Specify the ask** — every communication should have a clear "so what" for the reader

## Common Mistakes to Avoid

- **Burying the lead** — Put the most important thing first, not last
- **Status without "so what"** — "We completed 12 tickets" is trivia without "which means we're on track to hit the Q2 target"
- **Asymmetric reporting** — Report risks with the same rigor as wins; hiding bad news erodes trust
- **No clear ask** — If you need a decision, state it explicitly with a deadline
- **Same update for every audience** — What the CEO needs is different from what the engineering lead needs
