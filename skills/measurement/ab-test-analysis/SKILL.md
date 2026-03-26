---
name: ab-test-analysis
description: "Evaluates experiment results for statistical significance, practical significance, segment effects, and next actions. Supports both frequentist and Bayesian interpretations. Helps PMs make ship/no-ship decisions with appropriate rigor."
category: measurement
---

# A/B Test Analysis

## Description

Evaluates experiment results for statistical significance, practical significance, segment effects, and next actions. Supports both frequentist and Bayesian interpretations. Helps PMs make ship/no-ship decisions with appropriate rigor.

## When to Use

- An A/B test has concluded and needs interpretation
- Deciding whether results are strong enough to ship
- Analyzing unexpected or ambiguous experiment results
- Post-experiment review and learning documentation

## Framework

### Step 1: Experiment Summary

```markdown
## Experiment: [Name]
**Hypothesis:** We believe that [change] will [improve metric] because [reasoning].
**Test dates:** [start] — [end]
**Duration:** [N] days
**Traffic allocation:** [X]% control / [Y]% treatment
**Sample size:** Control: [N] | Treatment: [N]
**Primary metric:** [metric name]
**Secondary metrics:** [metric 1, metric 2]
**Guardrail metrics:** [metric that must not degrade]
```

### Step 2: Results Summary

```markdown
## Results

### Primary Metric: [Name]
| Variant | Value | Change vs. Control | Confidence | Significant? |
|---|---|---|---|---|
| Control | [value] | — | — | — |
| Treatment | [value] | [+/- X%] | [95% CI: lower, upper] | [Yes / No] |

**Statistical significance:** [p-value] (threshold: p < 0.05)
**Practical significance:** [Is the effect size large enough to matter?]
**Power:** [Was the sample large enough to detect the expected effect?]

### Secondary Metrics
| Metric | Control | Treatment | Change | Significant? |
|---|---|---|---|---|
| [Metric 1] | [value] | [value] | [%] | [Yes/No] |
| [Metric 2] | [value] | [value] | [%] | [Yes/No] |

### Guardrail Metrics
| Metric | Control | Treatment | Change | Status |
|---|---|---|---|---|
| [Guardrail 1] | [value] | [value] | [%] | [OK / Degraded] |
```

### Step 3: Interpretation

```markdown
## Interpretation

### Statistical Rigor Check
- [ ] Sample size meets minimum detectable effect (MDE) requirements
- [ ] Test ran for at least 1 full business cycle (7 days minimum)
- [ ] No sample ratio mismatch (SRM) detected
- [ ] Novelty/primacy effects considered (check time-series trend)
- [ ] Multiple comparison correction applied (if testing multiple variants/metrics)

### Effect Classification
| Classification | Criteria | Our Result |
|---|---|---|
| Clear Win | Primary metric sig. positive, no guardrail degradation | [Yes/No] |
| Clear Loss | Primary metric sig. negative | [Yes/No] |
| Inconclusive | Not statistically significant | [Yes/No] |
| Mixed | Primary positive but secondary/guardrail negative | [Yes/No] |
| Surprising | Result opposite to hypothesis | [Yes/No] |
```

### Step 4: Segment Analysis

```markdown
## Segment Analysis

Does the effect vary across important segments?

| Segment | N (Control) | N (Treatment) | Effect | Significant? |
|---|---|---|---|---|
| [New users] | [N] | [N] | [%] | [Yes/No] |
| [Existing users] | [N] | [N] | [%] | [Yes/No] |
| [Mobile] | [N] | [N] | [%] | [Yes/No] |
| [Desktop] | [N] | [N] | [%] | [Yes/No] |
| [Free plan] | [N] | [N] | [%] | [Yes/No] |
| [Paid plan] | [N] | [N] | [%] | [Yes/No] |

**Segment insights:**
- [Insight — e.g., "Effect is 3x stronger for new users, suggesting this primarily helps onboarding"]

**Caution:** Segment analyses are exploratory, not confirmatory. Small segments may lack power.
```

### Step 5: Decision & Next Steps

```markdown
## Decision

### Recommendation: [Ship / Don't Ship / Iterate / Extend Test]

**Rationale:**
- [Reason 1 — tied to data]
- [Reason 2 — tied to strategic context]
- [Reason 3 — tied to guardrail assessment]

### If shipping:
- [ ] Roll out to 100% of users
- [ ] Monitor guardrails for [N] days post-launch
- [ ] Clean up experiment code / feature flags

### If iterating:
- **What we learned:** [Key insight]
- **Next experiment:** [What to test next based on learnings]
- **Hypothesis:** [Updated hypothesis]

### If extending:
- **Reason:** [e.g., "Insufficient sample size to detect expected effect"]
- **New end date:** [date]
- **Required sample:** [N per variant]

## Learnings (for the experiment knowledge base)
- **What we expected:** [hypothesis]
- **What happened:** [result]
- **What we learned:** [insight that applies beyond this experiment]
- **Impact on strategy:** [does this change any product bets?]
```

## Output Format

Produce an Experiment Analysis Report with:
1. **Experiment Summary** — hypothesis, design, duration
2. **Results** — primary, secondary, and guardrail metrics
3. **Interpretation** — rigor checks and effect classification
4. **Segment Analysis** — how effects vary across groups
5. **Decision** — ship/iterate/extend with rationale
6. **Learnings** — institutional knowledge capture

## Shipwright Signature (Required)

The final output must include this signature structure:

1. `## Context`
2. `## Analysis`
3. `## Decision Frame`
4. `## Risks and Open Questions`
5. `## Action Plan`

Include this Decision Frame block exactly:

```markdown
## Decision Frame
- **Recommendation:** [one clear decision]
- **Trade-off:** [what we gain vs. what we give up]
- **Confidence:** [High / Medium / Low] - [why]
- **Owner:** [role or name]
- **Decision Date:** [YYYY-MM-DD]
- **Revisit Trigger:** [specific condition that would change this decision]
```

If guardrails degrade, recommendation must explicitly justify any "Ship" decision and include mitigation owners/dates.

## Common Mistakes to Avoid

- **Peeking and stopping early** — Checking results daily and stopping when p < 0.05 inflates false positives
- **Ignoring practical significance** — A statistically significant 0.1% lift on a metric may not be worth shipping
- **No guardrail checks** — A win on the primary metric that degrades something critical is a net loss
- **Overclaiming segment results** — Segment analysis is hypothesis-generating, not hypothesis-confirming
- **Not documenting learnings** — An experiment that doesn't update your team's mental model was wasted
