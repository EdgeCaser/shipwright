---
name: user-research-synthesis
description: "Transforms raw interview notes, survey responses, and observational data into structured insight cards using affinity mapping techniques. Produces themed findings with evidence trails so product decisions are traceable back to user evidence."
category: discovery
default_depth: standard
---

# User Research Synthesis

## Description

Transforms raw interview notes, survey responses, and observational data into structured insight cards using affinity mapping techniques. Produces themed findings with evidence trails so product decisions are traceable back to user evidence.

## When to Use

- After completing a batch of 5+ customer interviews
- Synthesizing mixed-method research (interviews + survey + analytics)
- Preparing research readouts for stakeholders
- Building an evidence base before making product decisions

## Depth

| Scope | Use When | Sections to Include |
|---|---|---|
| **Light** | Quick theme extraction from 3-5 interviews for a team standup | Steps 1-2 (Extract Atomic Notes + Cluster into Themes) only |
| **Standard** | Post-sprint synthesis for a stakeholder readout | All steps |
| **Deep** | Multi-method study synthesis (interviews + survey + analytics) or longitudinal research | All steps + cross-method triangulation matrix, segment-level theme comparison, evidence strength audit |

**Omit rules:** At Light depth, skip Steps 3-4 (Insight Cards and Research Summary). Produce only the atomic notes register and theme clusters with participant counts.

## Framework

### Step 1: Extract Atomic Notes

Read through raw data and extract individual observations. Each note should be:
- **Atomic** — one observation per note
- **Specific** — includes context (who, when, what happened)
- **Behavioral** — describes what people did or said, not what they think

**Format:**
```
[Note ID] | [Participant ID] | [Observation]
N001 | P03 | Spent 4 minutes looking for the export button before asking for help
N002 | P07 | "I just screenshot the dashboard and paste it into Slack" — workaround for sharing
N003 | P01 | Abandoned onboarding at step 3, said "I'll come back to this later"
```

### Step 2: Cluster into Themes

Group related notes into themes using bottom-up affinity mapping:
- Start with the notes, not with pre-defined categories
- Name each cluster with a descriptive insight statement, not a label
- A good theme name is an assertion: "Users create workarounds to share data with non-users" not "Sharing"

**Format:**
```markdown
### Theme: [Insight statement]
Strength: [Strong / Moderate / Emerging] (based on evidence volume)
Participants: [P01, P03, P07] ([N] of [total])

Supporting evidence:
- [Note ID]: [observation]
- [Note ID]: [observation]
- [Note ID]: [observation]

Counter-evidence:
- [Note ID]: [observation that contradicts or nuances this theme]
```

### Step 3: Produce Insight Cards

For each theme, produce a structured insight card:

```markdown
## Insight Card: [ID]

### Observation
[What we saw — factual, behavioral description]

### Evidence
- [N] participants exhibited this behavior
- Key quotes: "[verbatim quote]" — P03
- Behavioral data: [specific actions observed]

### Implication
[What this means for the product — the "so what?"]

### Confidence Level
[HIGH / MEDIUM / LOW]
- HIGH: 60%+ of participants, consistent across segments
- MEDIUM: 30-60% of participants, or segment-specific
- LOW: < 30% of participants, or single strong signal worth tracking

### Recommended Next Steps
- [ ] [Action — e.g., "Test hypothesis X with prototype"]
- [ ] [Action — e.g., "Quantify frequency with analytics"]
```

### Step 4: Build the Research Summary

Assemble insight cards into a research readout:

```markdown
# Research Summary: [Study Name]
## Methodology: [Interviews / Survey / Mixed]
## Participants: [N] across [segments]
## Date range: [start] — [end]

## Top-Line Findings
1. [Strongest insight — one sentence]
2. [Second strongest insight]
3. [Third strongest insight]

## Detailed Insight Cards
[Insert all cards, ordered by confidence level]

## Key Uncertainties
- [What we still don't know]
- [Questions that emerged during research]

## Methodological Notes
- [Limitations — sample size, recruitment bias, etc.]
- [What we'd do differently next time]
```

## Minimum Evidence Bar

**Required inputs:** Raw research data from at least 3 participants — interview transcripts, notes, survey responses, or observational records with participant identifiers.

**Acceptable evidence:** Verbatim quotes, behavioral observations, timestamped session recordings, survey free-text responses, support ticket excerpts, or analytics event logs tied to specific users or segments.

**Insufficient evidence:** If fewer than 3 participants or only a single data source is available, state "Insufficient evidence for theme-level synthesis" and stop and recommend completing additional interviews via discovery-interview-prep or supplementing with quantitative data before attempting this skill.

**Hypotheses vs. findings:**
- **Findings:** Themes rated "Strong" (60%+ participants) and their insight card observations must be grounded in specific, cited evidence.
- **Hypotheses:** Themes rated "Emerging" (< 30% participants) are hypotheses — label as "signal to track" and recommend validation method in the insight card's next steps.

## Output Format

Produce:
1. **Atomic notes register** — all extracted observations
2. **Theme map** — clustered insights with evidence
3. **Insight cards** — structured findings
4. **Research summary** — executive-level readout

**Shipwright Signature (required closing):**
5. **Decision Frame** — Top findings and their product implications, trade-off between acting on current evidence vs. gathering more data, confidence in themes with evidence quality and sample size, owner, decision date, revisit trigger
6. **Unknowns & Evidence Gaps** — Segments not represented in the sample, themes with only counter-evidence, questions that emerged but were not explored
7. **Pass/Fail Readiness** — PASS if at least 2 themes reach "Strong" or "Moderate" strength with multi-participant evidence and counter-evidence is documented (at Light depth: PASS if at least 2 theme clusters emerge with multi-participant evidence; insight cards and research summary not required); FAIL if themes are pre-defined rather than emergent or evidence trails are missing
8. **Recommended Next Artifact** — Which Shipwright skill to run next and why

## Common Mistakes to Avoid

- **Theming too early** — Let patterns emerge from the data, don't force notes into pre-existing categories
- **Ignoring counter-evidence** — Always include observations that contradict a theme
- **Conflating observation and interpretation** — Keep "what we saw" separate from "what it means"
- **Overclaiming from small samples** — 5 interviews is signal, not proof. Label confidence honestly
- **Losing the evidence trail** — Every insight must link back to specific participant observations

## Weak vs. Strong Output

**Weak:**
> Theme: "Users struggle with navigation"
> Strength: Moderate
> Supporting evidence: Several participants had trouble.

No participant IDs, no specific observations, theme name is a label rather than an assertion.

**Strong:**
> Theme: "Users create manual workarounds to share dashboard data with non-product stakeholders"
> Strength: Strong (5 of 8 participants)
> Supporting evidence: N002 (P07): "I just screenshot the dashboard and paste it into Slack"; N014 (P03): exported to CSV and reformatted in Google Sheets weekly; N019 (P01): built a Zapier integration to auto-email a PDF.

Assertive theme name, specific participant count, each note is atomic with behavioral detail and participant ID.
