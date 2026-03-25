# Sprint Planning Support

## Description

Helps PMs scope sprints, draft sprint goals tied to product outcomes, flag dependency risks, and balance capacity across new work, tech debt, and bug fixes. Grounded in Scrum methodology with practical adaptations for product-led teams.

## When to Use

- Preparing for sprint planning ceremonies
- Drafting sprint goals that connect to product outcomes
- Balancing competing priorities within a fixed capacity
- Identifying dependency risks before committing scope

## Framework

### Step 1: Define the Sprint Goal

A sprint goal is NOT a list of tickets. It's a single outcome statement the team commits to.

**Template:**
```
This sprint, we will [action] so that [outcome].
We'll know we succeeded when [measurable result].
```

**Good sprint goals:**
- "Enable self-serve onboarding so that new users can reach first value without sales assistance. Success: 30% of trial signups complete onboarding unassisted."
- "Resolve the top 3 data export reliability issues so that enterprise customers can trust automated reports. Success: Export error rate drops from 12% to < 2%."

**Bad sprint goals:**
- "Complete JIRA-1234, JIRA-1235, JIRA-1236" (that's a task list, not a goal)
- "Make progress on the dashboard redesign" (not measurable)

### Step 2: Capacity Planning

```markdown
## Sprint Capacity

### Team Availability
| Team Member | Role | Available Days | Notes |
|---|---|---|---|
| [Name] | [Eng/Design/QA] | [N] of [total] | [PTO, on-call, etc.] |

### Total Capacity: [N] person-days

### Allocation Guidelines
| Category | Target % | Person-Days | Rationale |
|---|---|---|---|
| Sprint goal work | 60-70% | [N] | New feature / initiative work |
| Bug fixes | 10-15% | [N] | Customer-reported and critical bugs |
| Tech debt | 10-15% | [N] | Reliability, performance, maintainability |
| Buffer | 10% | [N] | Unknowns, support escalations, reviews |
```

### Step 3: Story Selection & Commitment

```markdown
## Candidate Stories (ordered by sprint goal alignment)

### Sprint Goal Stories
| Story | Points/Days | Dependencies | Risk | Notes |
|---|---|---|---|---|
| [Story 1] | [est.] | None | Low | Core to sprint goal |
| [Story 2] | [est.] | Story 1 | Med | Needs design review |

### Bug Fixes (prioritized)
| Bug | Severity | Points/Days | Customer Impact |
|---|---|---|---|
| [Bug 1] | Critical | [est.] | [N] customers affected |

### Tech Debt
| Item | Points/Days | Benefit |
|---|---|---|
| [Item 1] | [est.] | [What it improves] |

### Total Committed: [N] points/days out of [capacity]
### Utilization: [X]% (target: 80-85%)
```

### Step 4: Dependency & Risk Check

```markdown
## Dependency Map
| Story | Depends On | Owner | Status | Risk Level |
|---|---|---|---|---|
| [Story] | [External API ready] | [Platform team] | [In progress] | HIGH |
| [Story] | [Design mockups] | [Designer] | [Complete] | LOW |

## Risk Register
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| [Design not finalized] | Medium | High | [Timebox: if not done by day 3, descope to v1] |
| [External dependency slips] | Low | High | [Parallel workstream ready] |
```

### Step 5: Sprint Agreement

```markdown
## Sprint [N] Agreement

**Sprint Goal:** [outcome statement]
**Duration:** [start] — [end]
**Capacity:** [N] person-days

**We commit to:**
- [Story list with estimates]

**We'll stretch to (if capacity allows):**
- [Stretch story 1]

**We will NOT do this sprint:**
- [Explicitly deferred item] — Reason: [why]

**Definition of Done for this sprint:**
- [ ] All committed stories meet their acceptance criteria
- [ ] Sprint goal metric is measurable (instrumentation in place)
- [ ] No critical bugs introduced
- [ ] Demo-ready for sprint review
```

## Output Format

Produce a Sprint Plan with:
1. **Sprint Goal** — outcome-oriented commitment
2. **Capacity Plan** — team availability and allocation
3. **Committed Scope** — stories with estimates, ordered by priority
4. **Dependencies & Risks** — flagged and mitigated
5. **Sprint Agreement** — what's in, what's stretch, what's out

## Common Mistakes to Avoid

- **Overcommitting** — Leave 10-15% buffer; things always take longer than expected
- **No sprint goal** — Without one, the sprint is just a random batch of work
- **Ignoring tech debt** — Zero tech debt allocation leads to compounding slowdowns
- **Hidden dependencies** — Surface cross-team deps before the sprint starts, not during
- **100% utilization** — Teams at 100% have no capacity for the unexpected; target 80-85%
