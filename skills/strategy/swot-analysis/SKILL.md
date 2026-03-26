---
name: swot-analysis
category: strategy
tags: [strengths-weaknesses, opportunities-threats, strategic-options, competitive-position, cross-reference]
inputs: [product or business unit scope, competitive and market context, internal capabilities assessment]
outputs: [SWOT grid with evidence, strategic options matrix, top prioritized actions]
pairs_with: [pestel-analysis, competitive-landscape, product-strategy-session]
---

# SWOT Analysis

## Description

Produces a structured Strengths, Weaknesses, Opportunities, and Threats analysis for a product, feature, or business unit. Goes beyond listing items by cross-referencing quadrants to generate strategic options (SO, WO, ST, WT strategies).

## When to Use

- Evaluating a new market entry or product expansion
- Preparing for strategic planning sessions
- Assessing a product's competitive position before roadmap planning
- Briefing leadership on where a product stands
- Comparing multiple strategic options side-by-side

## Framework

### Step 1: Define the Subject

Be specific about what you're analyzing. "Our product" is too broad. "Our onboarding flow for enterprise customers" is actionable.

### Step 2: Fill the Four Quadrants

```markdown
# SWOT Analysis: [Subject]

**Date:** [date]
**Scope:** [what exactly is being analyzed]

## Strengths (Internal, Positive)
What do we do well? What advantages do we have? What do customers cite as reasons they chose us?

| Strength | Evidence | Relative to Competitors |
|---|---|---|
| [e.g., "Fastest time-to-value in category"] | [e.g., "Avg onboarding: 3 days vs industry 14 days"] | [Ahead / Parity / Unique] |
| | | |
| | | |

## Weaknesses (Internal, Negative)
Where do we underperform? What do customers complain about? What do competitors do better?

| Weakness | Evidence | Impact |
|---|---|---|
| [e.g., "No mobile app"] | [e.g., "35% of support tickets mention mobile"] | [High / Medium / Low] |
| | | |
| | | |

## Opportunities (External, Positive)
What market trends favor us? What unmet needs exist? What changes (regulatory, technological, behavioral) could we exploit?

| Opportunity | Source | Time Horizon |
|---|---|---|
| [e.g., "New EU regulation requires audit trails"] | [e.g., "EU Digital Services Act, effective Q3 2026"] | [Near / Medium / Long] |
| | | |
| | | |

## Threats (External, Negative)
What competitors or market shifts could hurt us? What trends work against our model? What dependencies are at risk?

| Threat | Likelihood | Severity | Mitigation |
|---|---|---|---|
| [e.g., "Incumbent launches free tier"] | [High / Med / Low] | [High / Med / Low] | [Initial mitigation idea] |
| | | | |
| | | | |
```

### Step 3: Cross-Reference for Strategic Options

This is where SWOT becomes useful instead of just a list. Combine quadrants:

```markdown
## Strategic Options

### SO Strategies (Strengths + Opportunities)
Use strengths to capture opportunities:
- [e.g., "Leverage our fast onboarding to win enterprise deals before the new regulation deadline"]

### WO Strategies (Weaknesses + Opportunities)
Fix weaknesses to unlock opportunities:
- [e.g., "Build mobile app to capture the growing mobile-first buyer segment"]

### ST Strategies (Strengths + Threats)
Use strengths to defend against threats:
- [e.g., "Emphasize our depth of integrations as a moat against the incumbent's free tier"]

### WT Strategies (Weaknesses + Threats)
Mitigate worst-case scenarios:
- [e.g., "If we can't ship mobile before the incumbent launches free, partner with a mobile-first vendor"]
```

### Step 4: Prioritize

Rank the strategic options by impact and feasibility. Identify which belong on the roadmap now vs. later.

## Output Format

Produce:
1. **SWOT Grid** with evidence for each item (not just assertions)
2. **Strategic Options Matrix** (SO, WO, ST, WT) with at least 2 options per quadrant
3. **Top 3 Actions** ranked by urgency and impact

## Common Mistakes to Avoid

- **Listing without evidence** - "Great team" is not a strength. "3 engineers with 10+ years in payments infrastructure" is.
- **Confusing internal and external** - Strengths/Weaknesses are things you control. Opportunities/Threats are things happening to you.
- **Stopping at the grid** - The four lists are inputs, not outputs. The strategic options are the actual deliverable.
- **Ignoring the WT quadrant** - It's uncomfortable but it's where your biggest risks live.
- **Doing SWOT in isolation** - Combine with competitive landscape, PESTEL, or customer feedback for grounded inputs.
