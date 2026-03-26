---
name: prd-development
description: "Produces a comprehensive Product Requirements Document using Amazon's Working Backwards method: start with the press release, then FAQ, then detailed requirements. This approach forces clarity of thought by starting from the customer outcome and working backward to the requirements."
category: execution
default_depth: standard
---

# PRD Development

## Description

Produces a comprehensive Product Requirements Document using Amazon's Working Backwards method: start with the press release, then FAQ, then detailed requirements. This approach forces clarity of thought by starting from the customer outcome and working backward to the requirements.

## When to Use

- Kicking off a new feature or product initiative
- Aligning cross-functional teams on scope and requirements
- Documenting decisions for future reference
- Before engineering estimation or design exploration

## Depth

| Scope | Use When | Sections to Include |
|---|---|---|
| **Light** | Small feature or fast-follow with clear scope | Press Release headline + summary, Goals & Success Metrics, Scope (In/Out), Open Questions |
| **Standard** | New feature or cross-functional initiative | All sections |
| **Deep** | New product line, platform migration, or regulatory feature | All sections + competitive analysis appendix, data privacy impact assessment, rollout experiment design |

**Omit rules:** At Light depth, skip the full Press Release, FAQ, and Detailed Requirements phases. Produce a 1-page brief: problem, proposed solution, success metric, scope boundaries, and open questions.

## Framework

### Phase 1: Working Backwards (The Press Release)

Before writing requirements, write a fictional press release announcing the finished product. This forces you to think from the customer's perspective.

```markdown
# Internal Press Release: [Feature/Product Name]

## Headline
[One sentence that a customer would care about]

## Subheading
[Who is it for and what benefit do they get?]

## Summary Paragraph
[2-3 sentences: What is being launched? What problem does it solve? What's the key benefit?]

## Problem Statement
[Describe the problem from the customer's perspective. No jargon. A customer should recognize this as their problem.]

## Solution
[How does the product solve this problem? Focus on the experience, not the implementation.]

## Quote from Leadership
"[Why this matters to the company and to customers]"

## How It Works
[3-5 bullet points describing the customer experience, step by step]

## Customer Quote
"[A quote from a fictional happy customer that captures the value]"

## Call to Action
[What should the reader do next?]
```

### Phase 2: FAQ

```markdown
# Frequently Asked Questions

## Customer FAQ
Q: [Question a customer would ask]
A: [Answer]

Q: [Question about how it works]
A: [Answer]

Q: [Question about pricing or availability]
A: [Answer]

## Internal FAQ
Q: Why now? What's the urgency?
A: [Answer with data]

Q: What are we NOT building?
A: [Explicit scope exclusions]

Q: How will we measure success?
A: [Metrics and targets]

Q: What are the biggest risks?
A: [Top 3 risks and mitigations]

Q: What's the estimated effort?
A: [T-shirt size and breakdown]
```

### Phase 3: Detailed Requirements

```markdown
# Product Requirements Document: [Feature Name]

## Metadata
- Author: [PM name]
- Last updated: [date]
- Status: [Draft / In Review / Approved]
- Stakeholders: [list]

## 1. Context & Motivation
[Why are we doing this? What evidence supports the need?]
- Customer evidence: [interviews, support tickets, usage data]
- Business case: [revenue impact, retention impact, strategic alignment]
- Opportunity cost: [what we're NOT doing to do this]

## 2. Goals & Success Metrics
| Goal | Metric | Current | Target | Timeframe |
|---|---|---|---|---|
| [Goal 1] | [metric] | [baseline] | [target] | [when] |
| [Goal 2] | [metric] | [baseline] | [target] | [when] |

**Guardrail metrics** (must NOT get worse):
- [metric] must stay above [threshold]

## 3. User Stories
### Persona: [Name]
- As a [persona], I want to [action] so that [outcome]
  - Acceptance criteria:
    - [ ] [Criterion 1]
    - [ ] [Criterion 2]
  - Edge cases:
    - [Edge case 1: expected behavior]

### Persona: [Name]
[Repeat for each relevant persona]

## 4. Scope
### In Scope
- [Requirement 1]
- [Requirement 2]

### Out of Scope
- [Item 1] — Rationale: [why]
- [Item 2] — Rationale: [why]

### Future Considerations
- [Item that may come later]

## 5. Design & UX Requirements
- [Link to designs / wireframes]
- [Key interaction patterns]
- [Accessibility requirements]

## 6. Technical Considerations
- [API changes needed]
- [Data model implications]
- [Performance requirements]
- [Security considerations]

## 7. Dependencies
| Dependency | Team/System | Status | Risk |
|---|---|---|---|
| [Dep 1] | [team] | [status] | [risk level] |

## 8. Rollout Plan
- [ ] Phase 1: [Internal dogfood — date]
- [ ] Phase 2: [Beta with N% — date]
- [ ] Phase 3: [GA — date]

## 9. Open Questions
| Question | Owner | Due Date | Resolution |
|---|---|---|---|
| [Question 1] | [name] | [date] | [TBD / resolved] |
```

## Minimum Evidence Bar

**Required inputs:** A problem statement with at least one form of customer evidence (interviews, support tickets, usage data, or market research). At Light depth, prior PRD, launch data, or documented stakeholder alignment satisfies the evidence requirement for fast-follows with clear scope.

**Acceptable evidence:** Customer interview transcripts, support ticket volume/trends, usage analytics, churned-customer feedback, competitive teardowns, or sales call recordings.

**Insufficient evidence:** If no customer evidence exists for the stated problem, produce a partial artifact with unanswered sections marked `[TBD — requires: customer interviews, support ticket analysis, or usage data]` and flag the artifact as draft-only.

**Hypotheses vs. findings:**
- **Findings:** Problem statement, current metric baselines, and documented customer pain must be grounded in evidence.
- **Hypotheses:** Proposed solution, success metric targets, and estimated effort are hypotheses -- label them as such until validated through design review or prototype testing.

## Output Format

Produce a complete PRD with all three phases:
1. **Press Release** — customer-facing narrative
2. **FAQ** — customer and internal questions answered
3. **Detailed Requirements** — full specification

**Shipwright Signature (required closing):**
4. **Decision Frame** — build/buy/partner recommendation, trade-off, confidence with evidence quality, owner, decision date, revisit trigger
5. **Unknowns & Evidence Gaps** — unvalidated customer assumptions, missing technical feasibility data, untested pricing or GTM hypotheses
6. **Pass/Fail Readiness** — PASS if problem is evidence-backed, success metrics have baselines and targets, and scope boundaries are explicit; at Light depth, PASS if problem is evidence-backed (prior PRD, launch data, or stakeholder alignment qualifies), scope boundaries are explicit, and at least one success metric is identified; FAIL if no customer evidence exists or success metrics lack baselines
7. **Recommended Next Artifact** — Which Shipwright skill to run next and why

## Common Mistakes to Avoid

- **Starting with requirements** — Always start with the press release to ground the work in customer value
- **No success metrics** — If you can't measure success, you can't know if you succeeded
- **Missing "out of scope"** — Scope creep starts when boundaries aren't explicit
- **Writing for engineers only** — A good PRD is readable by design, marketing, and leadership too
- **Treating the PRD as final** — It's a living document; update it as you learn

## Weak vs. Strong Output

**Weak:**
> **Problem:** Users have trouble with onboarding. We should make it better. **Success metric:** Improve onboarding completion.

No customer evidence, no baseline, no target -- impossible to scope, estimate, or measure.

**Strong:**
> **Problem:** 62% of trial users abandon onboarding at the integration step (Mixpanel, Jan-Feb data). Support tickets citing "can't connect my data" increased 3x since v2.1 launched. **Success metric:** Integration-step completion rate from 38% to 65% within 60 days of launch; support tickets tagged "integration-setup" decrease by 50%.

Grounded in specific data, cites sources, and sets measurable targets with timeframes.
