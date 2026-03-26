---
name: feedback-triage
description: "Ingests raw customer feedback from multiple channels (support tickets, NPS responses, app store reviews, feature requests, sales call notes, social media) and produces a categorized, deduplicated, prioritized view of what customers are telling you. Turns noisy signal into actionable intelligence."
category: customer-intelligence
---

# Feedback Triage & Taxonomy

## Description

Ingests raw customer feedback from multiple channels (support tickets, NPS responses, app store reviews, feature requests, sales call notes, social media) and produces a categorized, deduplicated, prioritized view of what customers are telling you. Turns noisy signal into actionable intelligence.

## When to Use

- Monthly or quarterly feedback synthesis across channels
- After a spike in support tickets or negative reviews
- Before prioritization or planning sessions to ground decisions in customer evidence
- Building a "voice of the customer" report for leadership
- Onboarding onto a new product area and need to understand the feedback landscape

## Framework

### Step 1: Ingest & Normalize

Collect raw feedback and normalize it into a common format:

```markdown
## Feedback Register

| ID | Source | Date | Customer Segment | Verbatim | Sentiment | Topic (auto) |
|---|---|---|---|---|---|---|
| F001 | Support ticket | [date] | Enterprise | "[raw quote]" | Negative | [initial tag] |
| F002 | NPS (score: 3) | [date] | SMB | "[raw quote]" | Negative | [initial tag] |
| F003 | App Store | [date] | Unknown | "[raw quote]" | Positive | [initial tag] |
| F004 | Feature request | [date] | Mid-market | "[raw quote]" | Neutral | [initial tag] |
| F005 | Sales call note | [date] | Enterprise | "[raw quote]" | Negative | [initial tag] |
```

**Normalization rules:**
- Preserve verbatim quotes — don't paraphrase at this stage
- Tag sentiment: Positive / Neutral / Negative / Mixed
- Tag source channel
- Tag customer segment if identifiable (plan tier, company size, persona)
- Assign a preliminary topic tag (will be refined in clustering)

### Step 2: Deduplicate & Cluster

Group related feedback into themes using bottom-up clustering:

```markdown
## Feedback Clusters

### Cluster: [Theme Name — e.g., "Export functionality is unreliable"]
**Volume:** [N] pieces of feedback across [N] channels
**Segments affected:** [Enterprise, SMB, etc.]
**Sentiment distribution:** [N] negative, [N] neutral, [N] positive
**Trend:** [Increasing / Stable / Decreasing over past [timeframe]]

**Representative quotes:**
- "[Quote 1]" — [Source, Segment, Date]
- "[Quote 2]" — [Source, Segment, Date]
- "[Quote 3]" — [Source, Segment, Date]

**Variations within this cluster:**
- Sub-theme A: [description] ([N] mentions)
- Sub-theme B: [description] ([N] mentions)
```

**Clustering rules:**
- Name clusters as assertions, not labels: "Users can't reliably export to PDF" not "Export"
- A cluster needs 3+ independent pieces of feedback to be meaningful
- Track cross-channel confirmation (same theme from support AND reviews = stronger signal)
- Separate "feature requests" from "bug reports" from "usability complaints" — they need different responses

### Step 3: Categorize by Type

```markdown
## Feedback Taxonomy

### Bugs & Reliability Issues
| Cluster | Volume | Severity | Segments | Trend |
|---|---|---|---|---|
| [Cluster name] | [N] | Critical/High/Med/Low | [segments] | [↑/→/↓] |

### Usability & Experience Issues
| Cluster | Volume | Severity | Segments | Trend |
|---|---|---|---|---|

### Feature Requests & Enhancements
| Cluster | Volume | Revenue Signal | Segments | Trend |
|---|---|---|---|---|

### Praise & Positive Signal
| Cluster | Volume | Segments | What They Love |
|---|---|---|---|

### Churn & Competitive Mentions
| Cluster | Volume | Competitor Named | Reason for Leaving |
|---|---|---|---|
```

### Step 4: Prioritize

Score each cluster for action priority:

```markdown
## Priority Scoring

| Cluster | Volume | Revenue Impact | Segment Value | Trend | Solvability | Priority Score |
|---|---|---|---|---|---|---|
| [Cluster] | [1-5] | [1-5] | [1-5] | [1-5] | [1-5] | [weighted avg] |

**Weighting:**
- Volume (20%): How many customers mention this
- Revenue Impact (25%): Does this affect paying/high-value customers?
- Segment Value (20%): Are affected customers in our ICP?
- Trend (15%): Is this getting worse?
- Solvability (20%): Can we realistically address this?
```

### Step 5: Produce the Feedback Report

```markdown
## Voice of the Customer Report — [Period]

### Executive Summary
- **Total feedback processed:** [N] items from [N] channels
- **Top 3 themes:** [Theme 1], [Theme 2], [Theme 3]
- **Emerging signal:** [New theme that appeared this period]
- **Positive signal:** [What customers love most]

### Priority Action Items
1. [Highest priority cluster] — Recommended action: [specific]
2. [Second priority] — Recommended action: [specific]
3. [Third priority] — Recommended action: [specific]

### Detailed Cluster Analysis
[Full cluster details as structured above]

### Methodology
- Sources: [list of channels analyzed]
- Period: [date range]
- Total items: [N]
- Deduplication rate: [X]% (N raw → N unique)
```

## Output Format

Produce a Feedback Intelligence Report with:
1. **Executive Summary** — top-line themes and recommended actions
2. **Feedback Register** — normalized raw data
3. **Cluster Analysis** — themed groupings with volume, sentiment, and trends
4. **Taxonomy** — categorized by type (bugs, UX, feature requests, praise, churn)
5. **Priority Matrix** — scored and ranked for action

## Common Mistakes to Avoid

- **Counting votes, not understanding needs** — 50 people asking for "dark mode" might really mean "the UI is hard on my eyes during evening use"
- **Recency bias** — This week's angry ticket is not automatically the highest priority; look at trends
- **Ignoring positive feedback** — What customers love tells you what NOT to break
- **Single-channel blindness** — Support tickets skew toward bugs; NPS skews toward overall sentiment; you need multiple channels
- **No deduplication** — One customer submitting 10 tickets about the same issue is 1 signal, not 10
