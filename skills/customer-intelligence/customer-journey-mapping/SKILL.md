---
name: customer-journey-mapping
description: "Creates end-to-end customer journey maps with stages, touchpoints, actions, emotions, pain points, and moments of truth. Produces maps that connect the experience layer to product opportunities and measurement points."
category: customer-intelligence
---

# Customer Journey Mapping

## Description

Creates end-to-end customer journey maps with stages, touchpoints, actions, emotions, pain points, and moments of truth. Produces maps that connect the experience layer to product opportunities and measurement points.

## When to Use

- Redesigning a core product experience (onboarding, upgrade, renewal)
- Aligning cross-functional teams on the end-to-end customer experience
- Identifying the highest-leverage improvement opportunities in the user lifecycle
- Preparing for a design sprint or UX research initiative
- Onboarding new team members to understand the customer experience holistically

## Framework

### Step 1: Define Scope & Persona

```markdown
## Journey Map Scope

**Persona:** [Name — from your persona library]
**Journey:** [Which journey — e.g., "First-time user from signup to first value moment"]
**Trigger:** [What initiates this journey — e.g., "Colleague shares a link to a project"]
**End state:** [What "done" looks like — e.g., "User has created their first project and invited a teammate"]
**Time span:** [Minutes / Hours / Days / Weeks]
```

### Step 2: Map the Stages

Break the journey into high-level stages:

```markdown
## Journey Stages

| Stage | Description | Duration | Entry Trigger | Exit Trigger |
|---|---|---|---|---|
| 1. Awareness | Discovers the product exists | Variable | [trigger] | Visits website/app |
| 2. Evaluation | Assesses whether it fits their need | [time] | Visits site | Signs up / leaves |
| 3. Onboarding | First-run experience | [time] | Signs up | Reaches activation |
| 4. First Value | Achieves the core outcome | [time] | Completes setup | "Aha moment" |
| 5. Habit | Incorporates into routine | [time] | First value | Regular usage |
| 6. Expansion | Deepens usage or upgrades | [time] | Habit formed | More features / seats |
```

### Step 3: Detail Each Stage

For each stage, map the full experience:

```markdown
### Stage [N]: [Name]

**User goal:** [What they're trying to accomplish at this stage]

#### Touchpoints & Actions
| Touchpoint | Channel | User Action | System Response |
|---|---|---|---|
| [Landing page] | Web | Reads headline, scans features | Page load, social proof |
| [Signup form] | Web | Enters email, creates password | Validation, welcome email |
| [Onboarding wizard] | In-app | Follows guided setup | Progress indicators |

#### Emotional Journey
| Moment | Emotion | Intensity (1-5) | Trigger |
|---|---|---|---|
| [Seeing the landing page] | Curious | 3 | [Clear headline] |
| [Hitting a confusing step] | Frustrated | 4 | [Unclear UI label] |
| [Completing first task] | Satisfied | 5 | [Visible result] |

#### Pain Points
| Pain Point | Severity | Evidence | Frequency |
|---|---|---|---|
| [Can't find the next step] | High | [Support tickets, session recordings] | [X% of users] |
| [Loading time too long] | Medium | [Analytics, NPS comments] | [X% of sessions] |

#### Moments of Truth
Critical decision points where the user decides to continue or leave:

- **MOT 1:** [Description — e.g., "User sees the empty state after signup"]
  - Current experience: [What happens now]
  - Ideal experience: [What should happen]
  - Drop-off rate: [X]% of users leave at this point

#### Opportunities
| Opportunity | Impact | Effort | Quick Win? |
|---|---|---|---|
| [Improve empty state with templates] | High | Small | Yes |
| [Add progress indicator to onboarding] | Medium | Small | Yes |
| [Redesign signup flow] | High | Large | No |
```

### Step 4: Identify Cross-Stage Patterns

```markdown
## Cross-Stage Analysis

### Emotional Arc
[Describe the overall emotional trajectory — where are the peaks and valleys?]

### Critical Drop-Off Points
| Transition | Drop-Off Rate | Primary Reason | Opportunity |
|---|---|---|---|
| Evaluation → Signup | [X]% | [reason] | [opportunity] |
| Signup → Activation | [X]% | [reason] | [opportunity] |
| Activation → Habit | [X]% | [reason] | [opportunity] |

### Moments of Delight
- [Moment 1]: [What makes users happy — protect and amplify this]
- [Moment 2]: [Another positive moment to preserve]

### Channel Consistency Gaps
| Touchpoint A | Touchpoint B | Inconsistency | Impact |
|---|---|---|---|
| [Website messaging] | [In-app experience] | [Promise vs. reality gap] | [Disappointment at onboarding] |

### Service Blueprinting (Backstage)
| Frontstage Action | Backstage Process | Support System | Failure Point |
|---|---|---|---|
| [User clicks "Get Started"] | [Account provisioning] | [Auth service] | [Timeout under load] |
```

### Step 5: Measurement Framework

```markdown
## Journey Metrics

| Stage | Key Metric | Current | Target | Data Source |
|---|---|---|---|---|
| Awareness | Website visits from target segment | [N] | [target] | [Analytics] |
| Evaluation | Signup conversion rate | [X]% | [target] | [Analytics] |
| Onboarding | Onboarding completion rate | [X]% | [target] | [Product analytics] |
| First Value | Time to first value (TTFV) | [X days] | [target] | [Product analytics] |
| Habit | Day-30 retention | [X]% | [target] | [Product analytics] |
| Expansion | Expansion revenue rate | [X]% | [target] | [Billing] |
```

## Output Format

Produce a Customer Journey Map with:
1. **Scope & Persona** — who and what journey
2. **Stage Map** — high-level journey stages
3. **Stage Details** — touchpoints, emotions, pain points, moments of truth per stage
4. **Cross-Stage Analysis** — drop-offs, patterns, delight moments
5. **Opportunity Register** — prioritized list of improvements
6. **Measurement Framework** — metrics per stage

## Common Mistakes to Avoid

- **Inside-out mapping** — Map from the customer's perspective, not your product's feature list
- **Happy path only** — Include error states, confusion, and abandonment
- **No evidence** — Every pain point needs a source: analytics, research, or support data
- **Too granular** — A journey map is strategic, not a UI flowchart; stay at the experience level
- **Maps that sit on a shelf** — Connect every pain point to an opportunity with an owner
