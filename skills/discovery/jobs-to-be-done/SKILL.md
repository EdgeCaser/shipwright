---
name: jobs-to-be-done
category: discovery
tags: [jtbd, customer-needs, outcome-driven-innovation, opportunity-scoring, job-mapping]
inputs: [product domain or context, target customer segment, research data or interviews]
outputs: [job statements and job map, outcome statements with opportunity scores, underserved opportunity recommendations]
pairs_with: [discovery-interview-prep, opportunity-solution-tree, user-story-writing]
---

# Jobs-to-Be-Done Analysis

## Description

Applies the Jobs-to-Be-Done (JTBD) framework to frame customer needs as job statements and identify underserved needs. Based on the work of Clayton Christensen and Tony Ulwick's Outcome-Driven Innovation methodology.

## When to Use

- Reframing product strategy around customer outcomes instead of features
- Identifying new market opportunities by finding underserved jobs
- Writing better user stories grounded in real customer motivation
- Evaluating whether a proposed feature actually addresses a meaningful job

## Key Concepts

**Job:** The progress a customer is trying to make in a particular circumstance. Jobs are stable over time — technology changes, jobs don't.

**Three layers of jobs:**
1. **Functional job** — The practical task (e.g., "get from A to B quickly")
2. **Emotional job** — How they want to feel (e.g., "feel confident I'll arrive on time")
3. **Social job** — How they want to be perceived (e.g., "appear responsible to my team")

**Hiring and firing:** Customers "hire" products to do a job and "fire" them when something does it better.

## Framework

### Step 1: Identify the Core Job

Work with the PM to articulate the main job using the canonical format:

```
When I [situation/context],
I want to [motivation/goal],
So I can [desired outcome].
```

**Rules for good job statements:**
- Describe the customer's goal, not your product's function
- Include the triggering context — jobs exist in situations
- Focus on outcomes, not solutions
- Should be solution-agnostic (no product names or feature names)

**Example:**
```
When I'm preparing for a board meeting,
I want to quickly assemble key metrics into a narrative,
So I can demonstrate progress and maintain investor confidence.
```

### Step 2: Map the Job Steps

Break the core job into its constituent steps using the Universal Job Map:

| Step | Description | Questions to Ask |
|---|---|---|
| 1. Define | What needs to be accomplished? | "How do you figure out what needs doing?" |
| 2. Locate | Find inputs needed | "Where do you get what you need to start?" |
| 3. Prepare | Set up for execution | "What preparation is required?" |
| 4. Confirm | Verify readiness | "How do you know you're ready to proceed?" |
| 5. Execute | Perform the core task | "Walk me through doing the actual thing" |
| 6. Monitor | Track progress | "How do you know it's going well?" |
| 7. Modify | Make adjustments | "What do you do when things go wrong?" |
| 8. Conclude | Finish and clean up | "How do you wrap up?" |

### Step 3: Identify Desired Outcomes

For each job step, define what success looks like using Outcome Statements:

```
[Direction] + [metric] + [object of control] + [contextual qualifier]

Examples:
- Minimize the time it takes to gather data from multiple sources
- Minimize the likelihood of presenting outdated metrics
- Increase the confidence that the narrative matches the data
```

**Rules:**
- Start with a direction: Minimize, Increase, Reduce, Maximize
- Reference something measurable, even if not precisely quantified
- Keep solution-agnostic — no product or feature names

### Step 4: Assess Satisfaction (Opportunity Scoring)

For each outcome, assess:
- **Importance** (1-10): How much does this matter to the customer?
- **Satisfaction** (1-10): How well is this currently served?

**Opportunity Score** = Importance + max(Importance - Satisfaction, 0)

| Score Range | Interpretation |
|---|---|
| 15-20 | Underserved — high opportunity |
| 10-14 | Appropriately served — moderate opportunity |
| 0-9 | Overserved — low opportunity (or table stakes) |

### Step 5: Identify Competing Solutions

Map what customers currently "hire" to do this job:
- Direct competitors (same category)
- Indirect competitors (different category, same job)
- Non-consumption (doing nothing or manual workarounds)

## Output Format

```markdown
# Jobs-to-Be-Done Analysis: [Domain]

## Core Job Statement
When I [context], I want to [goal], So I can [outcome].

## Job Map
| Step | Customer Activity | Pain Points | Current Workarounds |
|---|---|---|---|
| Define | ... | ... | ... |
| [etc.] | | | |

## Desired Outcomes (ranked by opportunity score)
| # | Outcome Statement | Importance | Satisfaction | Opp. Score |
|---|---|---|---|---|
| 1 | Minimize the time to... | 9 | 3 | 15 |
| [etc.] | | | | |

## Competitive Landscape (by job, not by product)
| Solution Hired | Job Steps Served | Strengths | Weaknesses |
|---|---|---|---|

## Underserved Opportunities
[Top 3-5 outcomes with highest opportunity scores, with strategic implications]

## Recommendations
[What to explore next — prototype tests, deeper research, etc.]
```

## Common Mistakes to Avoid

- **Defining jobs as features** — "I want to use a Gantt chart" is a solution, not a job
- **Ignoring context** — Jobs only make sense in specific situations
- **Skipping emotional and social jobs** — Functional alone misses half the picture
- **Surveying importance without satisfaction** — You need both to find opportunity
- **Competitor analysis by product instead of by job** — Your real competition might not be in your category
