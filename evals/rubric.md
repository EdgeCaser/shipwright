# Universal Evaluation Rubric

This rubric applies to any artifact produced by a Shipwright skill or workflow. Every artifact should be scored on these 4 dimensions. Artifact-specific rubrics add 2-3 additional dimensions on top of these.

## Dimensions

### 1. Clarity

**What it measures:** Could a new team member read this artifact and act on it without asking follow-up questions?

| Score | Anchor |
|---|---|
| **3 (Weak)** | Jargon-heavy, ambiguous language. Multiple sections require clarification to understand what's being said. Reader would need a meeting to interpret the document. |
| **6 (Adequate)** | Generally clear, but some sections use vague language ("improve the experience," "better performance") that different readers would interpret differently. |
| **9 (Strong)** | Every statement is specific and unambiguous. Metrics have numbers. Timelines have dates. "Improve onboarding" becomes "reduce time-to-first-value from 47 days to 30 days by Q3." |

**Common failure mode:** Using qualitative language where quantitative language is needed. "Significantly improve retention" scores a 4. "Increase 12-month retention from 72% to 80%" scores an 8.

### 2. Completeness

**What it measures:** Are all required sections filled with substance, not placeholders or boilerplate?

| Score | Anchor |
|---|---|
| **3 (Weak)** | Multiple sections are empty, contain placeholder text ("[TBD]", "[fill in later]"), or are so generic they could apply to any product. |
| **6 (Adequate)** | All sections are filled, but some are thin. The document covers the territory but doesn't go deep on any dimension. No obvious gaps, but a reviewer would ask "what about X?" for 2-3 areas. |
| **9 (Strong)** | Every section has substantive content specific to this product and situation. Edge cases are addressed. Counter-arguments are anticipated. A reviewer would struggle to find a missing consideration. |

**Common failure mode:** Filling every section with roughly equal depth. A 9/10 document is opinionated about where depth matters — it goes deep on the hard decisions and stays concise on the obvious ones.

### 3. Actionability

**What it measures:** Does every section point to a decision, an owner, or a concrete next step?

| Score | Anchor |
|---|---|
| **3 (Weak)** | The document describes the situation but doesn't drive action. Reads like a report, not a decision tool. "Here are the options" without a recommendation. |
| **6 (Adequate)** | Recommendations exist but are hedged. "We should consider X" instead of "We will do X, owned by Y, by Z date." Some sections end without clear next steps. |
| **9 (Strong)** | Every section that implies a decision explicitly states it. Every action has an owner and a deadline. Open questions have owners and due dates. The reader knows exactly what to do after reading. |

**Common failure mode:** Presenting analysis without committing to a recommendation. Strong artifacts take a position. It's fine to say "we're 70% confident" — it's not fine to say "there are pros and cons to each approach."

### 4. Correctness

**What it measures:** Are frameworks applied properly? Are trade-offs real (not invented)? Is evidence genuine (not hallucinated)?

| Score | Anchor |
|---|---|
| **3 (Weak)** | Frameworks are misapplied (e.g., a SWOT with identical items in Strengths and Opportunities). Evidence is vague or unsourced. Trade-offs feel manufactured to fill a template. |
| **6 (Adequate)** | Frameworks are applied correctly but mechanically. Evidence is present but not verified. Trade-offs are reasonable but not deeply examined. |
| **9 (Strong)** | Frameworks are applied with judgment — the template is adapted to fit the situation, not the other way around. Evidence is specific and sourced. Trade-offs reflect genuine tension, not just "more work vs. less work." |

**Common failure mode:** Symmetrical analysis where reality is asymmetric. If a SWOT has exactly 4 items in each quadrant, or a competitive analysis shows every competitor as "equal but different," the analysis is likely template-driven rather than reality-driven.

## Scoring process

1. Read the complete artifact once without scoring
2. Score each dimension independently (don't let one dimension bias another)
3. Write a one-sentence justification for each score
4. Identify the lowest-scoring dimension — that's where revision effort should focus
5. Re-score after revision to confirm improvement

## Interpreting scores

| Average | Interpretation |
|---|---|
| 8-10 | Strong artifact. Ready for stakeholder review. |
| 6-7 | Adequate. Usable internally but needs tightening before sharing widely. |
| 4-5 | Weak. Has structural issues beyond polish. Identify the low-scoring dimension and rework that section. |
| 1-3 | Not usable. Framework was likely misapplied or insufficient context was provided. Re-run with better inputs. |
