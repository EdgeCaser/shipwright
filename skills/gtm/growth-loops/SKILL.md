---
name: growth-loops
category: gtm
tags: [growth-strategy, acquisition-loops, engagement-loops, monetization-loops, compounding-growth, reforge]
inputs: [current product growth data, existing acquisition and retention channels, growth goals or plateau diagnosis]
outputs: [growth loop inventory and evaluation, intervention priorities ranked by leverage, new loop proposals with tests]
pairs_with: [go-to-market-strategy, product-strategy-session, market-sizing]
---

# Growth Loops Identification

## Description

Maps acquisition, engagement, and monetization loops to identify self-reinforcing growth mechanisms. Moves beyond the linear funnel model to identify compounding loops where output from one cycle becomes input for the next. Based on Reforge's growth loops framework.

## When to Use

- Building or refining a growth strategy
- Diagnosing why growth has plateaued
- Evaluating which growth investments will compound vs. be one-time
- Aligning product, marketing, and engineering on growth priorities

## Key Concepts

**Growth loop vs. funnel:** A funnel is linear (top → bottom, then done). A loop is circular (output feeds back as input, creating compounding growth).

**Loop components:**
1. **Input** — what enters the loop (new users, content, data)
2. **Action** — what the user does inside the product
3. **Output** — what the action produces that feeds back as new input

## Framework

### Step 1: Identify Existing Loops

Map every loop currently operating in the product:

```markdown
## Acquisition Loops (how new users arrive)

### Loop: [Name — e.g., "User-Generated Content SEO"]
```
New user → Creates content → Content indexed by Google → New users discover via search → [repeat]
```

**Input:** [What starts the cycle]
**Action:** [What the user does]
**Output:** [What this produces that feeds back]
**Cycle time:** [How long one loop takes]
**Current performance:** [Metrics — e.g., "Each piece of content generates 12 visits/month"]
**Compounding?** [Yes/No — does it get stronger over time?]

### Loop: [Name — e.g., "Viral Invite"]
```
User gets value → Invites colleague → Colleague signs up → Gets value → Invites more → [repeat]
```

**Viral coefficient:** [K-factor — invites × conversion rate]
**Current K:** [number — >1 means viral growth, <1 means loop decays]

---

## Engagement Loops (how users come back)

### Loop: [Name — e.g., "Data Network Effect"]
```
User adds data → Product gets smarter → Better recommendations → More usage → More data → [repeat]
```

**Retention driver:** [What specifically brings users back]
**Frequency:** [How often this loop fires — daily, weekly, monthly]
**Strength indicator:** [Metric — e.g., "Users who complete X retain at 2x the baseline"]

---

## Monetization Loops (how revenue grows)

### Loop: [Name — e.g., "Seat Expansion"]
```
Team lead adopts → Team sees value → More seats purchased → More usage data → Proves ROI → Budget increase → [repeat]
```

**Revenue impact:** [How this loop contributes to revenue growth]
**Net Revenue Retention:** [NRR % — >100% means expansion outpaces churn]
```

### Step 2: Evaluate Loop Strength

```markdown
## Loop Evaluation

| Loop | Type | Cycle Time | Compounding? | Current Strength | Investment Level |
|---|---|---|---|---|---|
| [Loop 1] | Acquisition | [time] | Yes/No | Strong/Medium/Weak | High/Med/Low |
| [Loop 2] | Engagement | [time] | Yes/No | Strong/Medium/Weak | High/Med/Low |
| [Loop 3] | Monetization | [time] | Yes/No | Strong/Medium/Weak | High/Med/Low |

### Strength Assessment Criteria:
- **Strong:** Loop is self-sustaining, growing without proportional investment
- **Medium:** Loop operates but requires ongoing investment to maintain
- **Weak:** Loop exists in theory but isn't producing meaningful results yet
```

### Step 3: Identify Highest-Leverage Interventions

```markdown
## Intervention Opportunities

For each loop, identify where a small improvement would have the biggest compounding effect:

### Loop: [Name]
**Bottleneck:** [Where the loop loses the most volume]
**Current conversion at bottleneck:** [X]%
**Intervention:** [What we could do to improve it]
**Estimated impact:** [If we improve bottleneck from X% to Y%, loop output increases by Z%]
**Effort:** [T-shirt size]
**Compounding effect:** [How this improvement multiplies over N cycles]
```

### Step 4: Design New Loops

If existing loops are insufficient, design new ones:

```markdown
## Proposed New Loop: [Name]

**Thesis:** We believe that [mechanism] will create a self-reinforcing loop because [reasoning].

**Loop diagram:**
[Step 1] → [Step 2] → [Step 3] → feeds back to [Step 1]

**Key assumptions:**
1. [Assumption — e.g., "Users will share because they get value from sharing"]
2. [Assumption — e.g., "Shared content will convert at >5%"]

**MVP test:** [Smallest thing we can build to test if this loop works]
**Success criteria:** [What metric at what level validates the loop]
```

## Output Format

Produce a Growth Loops Analysis with:
1. **Loop Inventory** — all currently operating loops mapped
2. **Loop Evaluation** — strength, cycle time, compounding assessment
3. **Intervention Priorities** — highest-leverage improvements ranked
4. **New Loop Proposals** — designed loops with hypotheses and tests
5. **Investment Recommendation** — where to focus growth engineering effort

## Common Mistakes to Avoid

- **Funnel thinking** — Funnels are one-and-done; loops compound. Design for loops.
- **Ignoring cycle time** — A strong loop that takes 6 months per cycle won't save you this quarter
- **Over-investing in weak loops** — If the loop isn't working after reasonable investment, try a different loop
- **All acquisition, no engagement** — Leaky bucket. Fix engagement loops before pouring more into acquisition.
- **Assuming virality** — Most products aren't viral (K < 1). That's fine. Content loops, paid loops, and sales loops compound too.
