---
name: discovery-interview-prep
description: "Generates comprehensive preparation materials for customer discovery interviews including interview guides, screener criteria, and debrief templates. Grounded in the Jobs-to-Be-Done methodology and \"The Mom Test\" principles."
category: discovery
---

# Discovery Interview Prep

## Description

Generates comprehensive preparation materials for customer discovery interviews including interview guides, screener criteria, and debrief templates. Grounded in the Jobs-to-Be-Done methodology and "The Mom Test" principles.

## When to Use

- Preparing for a round of customer discovery interviews
- Training new PMs or researchers on interview technique
- Shifting from opinion-gathering to evidence-gathering conversations
- Need a structured guide to avoid leading questions

## Framework

### The Mom Test Principles

Every interview guide must follow Rob Fitzpatrick's rules:

1. **Talk about their life, not your idea** — Ask about past behavior, not hypothetical future behavior
2. **Ask about specifics, not generics** — "Walk me through the last time you..." not "Do you usually..."
3. **Listen, don't pitch** — The interview is for learning, not selling
4. **Seek disconfirming evidence** — Actively look for reasons your assumptions are wrong

### Interview Guide Generation

**Inputs needed from the PM:**
- Target persona or segment
- Discovery objective (what you're trying to learn)
- Current assumptions to test (optional but recommended)
- Product area or domain context

**Guide structure:**

```markdown
# Discovery Interview Guide
## Context: [objective]
## Persona: [who we're talking to]
## Duration: [30-60 min recommended]

### Warm-Up (5 min)
- [Rapport-building questions about their role/context]
- [Establish they fit the target persona]

### Core Discovery (20-40 min)
#### Theme 1: [Current behavior]
- "Walk me through the last time you [relevant activity]..."
- "What happened next?"
- "How did you decide to [action]?"
- [Follow-up probes for specifics]

#### Theme 2: [Pain points and workarounds]
- "What's the hardest part about [activity]?"
- "Tell me about a time that was particularly frustrating..."
- "What did you try? What happened?"

#### Theme 3: [Outcomes and motivation]
- "What would it mean for you if [problem] were solved?"
- "How do you measure success for [activity] today?"
- "What have you tried to solve this? What happened?"

### Wrap-Up (5 min)
- "Is there anything I should have asked but didn't?"
- "Who else do you think I should talk to about this?"
- [Thank them, discuss next steps]

### DO NOT ASK
- Leading questions: "Don't you think X would be great?"
- Hypothetical questions: "Would you use a product that..."
- Opinion questions: "What do you think about..."
```

### Screener Criteria

Generate a screener to qualify participants:

```markdown
# Participant Screener
## Must-have criteria (all required):
- [Criterion 1 — e.g., "Has performed [activity] in the past 30 days"]
- [Criterion 2 — e.g., "Decision-maker or strong influencer for [domain]"]

## Nice-to-have criteria (at least 2 of N):
- [Criterion A]
- [Criterion B]

## Disqualification criteria:
- [e.g., "Works at a competitor"]
- [e.g., "Has not experienced the target problem"]

## Screening questions (for recruitment):
1. [Question that maps to must-have criterion 1]
2. [Question that maps to must-have criterion 2]
```

### Debrief Template

Generate a post-interview debrief template:

```markdown
# Interview Debrief
## Participant: [ID / name]
## Date: [date]
## Interviewer: [name]

### Key Quotes (verbatim)
- "[Quote 1]" — context: [when they said this]
- "[Quote 2]" — context: [when they said this]

### Observations
- [Behavior observed or described]
- [Emotion detected]
- [Workaround mentioned]

### Surprises (things we didn't expect)
- [Surprise 1]

### Assumption Validation
| Assumption | Supported? | Evidence |
|---|---|---|
| [Assumption 1] | Yes / No / Mixed | [What they said/did] |

### Follow-Up Actions
- [ ] [Action item]
```

## Output Format

Produce three documents:
1. **Interview Guide** — ready-to-use question flow
2. **Screener** — recruitment qualification criteria
3. **Debrief Template** — post-interview capture sheet

## Common Mistakes to Avoid

- **Asking "would you use X?"** — People can't reliably predict future behavior
- **Not asking for specifics** — "Usually" and "generally" hide the truth; push for "last time"
- **Talking more than listening** — The interviewer should speak < 30% of the time
- **Skipping the debrief** — Insights decay fast; debrief within 24 hours
- **Only interviewing fans** — Include churned users, non-users, and detractors
