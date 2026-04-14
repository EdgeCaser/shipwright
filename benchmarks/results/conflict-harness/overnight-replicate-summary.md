# Conflict Harness Batch Summary

Runs completed: 26
Errors: 13

## Run Results

| Scenario | Side A | Side B | Judge | Status | Winner | Margin | Confidence | Human Review | Disagreement | Declared | Revised |
|---|---|---|---|---|---|---|---|---|---|---|---|
 | blockbuster-total-access | claude | gpt | claude-judge | completed | side_b | 0.20 | medium | false | 0.25 | 1.00 | 1.00 | 
 | blockbuster-total-access | claude | gpt | gpt-judge | completed | side_b | 0.50 | medium | false | 0.29 | 1.00 | 1.00 | 
 | board-update-ambiguity | claude | gpt | claude-judge | completed | side_a | 0.60 | medium | false | 0.42 | 1.00 | 1.00 | 
 | board-update-ambiguity | claude | gpt | gpt-judge | completed | side_b | 0.40 | medium | false | 0.33 | 1.00 | 1.00 | 
 | churn-conflicting-signals | claude | gpt | claude-judge | completed | side_b | 0.20 | medium | false | 0.17 | 1.00 | 1.00 | 
 | churn-conflicting-signals | claude | gpt | gpt-judge | completed | side_b | 0.60 | medium | false | 0.35 | 1.00 | 1.00 | 
 | event-automation-boundary | claude | gpt | claude-judge | error | — | — | — | — | — | — | — | 
 | event-automation-boundary | claude | gpt | gpt-judge | completed | side_a | 0.40 | medium | false | 0.29 | 1.00 | 1.00 | 
 | feature-weak-evidence | claude | gpt | claude-judge | completed | side_b | 0.60 | medium | false | 0.25 | 1.00 | 1.00 | 
 | feature-weak-evidence | claude | gpt | gpt-judge | completed | side_a | 0.14 | medium | false | 0.25 | 1.00 | 1.00 | 
 | handoff-contradiction | claude | gpt | claude-judge | completed | side_a | 1.60 | high | false | 0.33 | 1.00 | 1.00 | 
 | handoff-contradiction | claude | gpt | gpt-judge | completed | side_b | 0.40 | medium | false | 0.67 | 1.00 | 1.00 | 
 | meta-muse-spark | claude | gpt | claude-judge | completed | side_a | 0.80 | high | false | 0.33 | 1.00 | 1.00 | 
 | meta-muse-spark | claude | gpt | gpt-judge | completed | side_b | 0.30 | medium | false | 0.29 | 1.00 | 1.00 | 
 | netflix-qwikster | claude | gpt | claude-judge | error | — | — | — | — | — | — | — | 
 | netflix-qwikster | claude | gpt | gpt-judge | error | — | — | — | — | — | — | — | 
 | prd-hidden-scope-creep | claude | gpt | claude-judge | error | — | — | — | — | — | — | — | 
 | prd-hidden-scope-creep | claude | gpt | gpt-judge | error | — | — | — | — | — | — | — | 
 | pricing-partial-data | claude | gpt | claude-judge | error | — | — | — | — | — | — | — | 
 | pricing-partial-data | claude | gpt | gpt-judge | error | — | — | — | — | — | — | — | 
 | supermicro-export-controls | claude | gpt | claude-judge | error | — | — | — | — | — | — | — | 
 | supermicro-export-controls | claude | gpt | gpt-judge | error | — | — | — | — | — | — | — | 
 | yahoo-microsoft | claude | gpt | claude-judge | error | — | — | — | — | — | — | — | 
 | yahoo-microsoft | claude | gpt | gpt-judge | error | — | — | — | — | — | — | — | 
 | zillow-offers | claude | gpt | claude-judge | error | — | — | — | — | — | — | — | 
 | zillow-offers | claude | gpt | gpt-judge | error | — | — | — | — | — | — | — | 

## Judge Agreement Analysis

| Scenario | claude-judge Winner | gpt-judge Winner | Agree? | Margin Delta |
|---|---|---|---|---|
 | blockbuster-total-access | side_b | side_b | YES | 0.30 | 
 | board-update-ambiguity | side_a | side_b | **NO** | 0.20 | 
 | churn-conflicting-signals | side_b | side_b | YES | 0.40 | 
| event-automation-boundary | ERROR | side_a | — | — |
 | feature-weak-evidence | side_b | side_a | **NO** | 0.46 | 
 | handoff-contradiction | side_a | side_b | **NO** | 1.20 | 
 | meta-muse-spark | side_a | side_b | **NO** | 0.50 | 
| netflix-qwikster | ERROR | ERROR | — | — |
| prd-hidden-scope-creep | ERROR | ERROR | — | — |
| pricing-partial-data | ERROR | ERROR | — | — |
| supermicro-export-controls | ERROR | ERROR | — | — |
| yahoo-microsoft | ERROR | ERROR | — | — |
| zillow-offers | ERROR | ERROR | — | — |

**Completed comparisons:** 6/13
**Judge agreement rate:** 2/6 (33%)
**Average margin delta:** 0.51

**WARNING:** 7 scenario(s) did not complete with both judges. The agreement rate is based on partial coverage and should not be used for publishability decisions. Rerun failed scenarios before drawing conclusions.

## Errors

- **event-automation-boundary** (claude-judge): Run record failed validation:
$.sides.side_b.first_pass.open_questions[0]: Expected string.
$.sides.side_b.first_pass.open_questions[1]: Expected string.
- **netflix-qwikster** (claude-judge): judge judge turn failed with exit code 1:
- **netflix-qwikster** (gpt-judge): first_pass side_a turn failed with exit code 1:
- **prd-hidden-scope-creep** (claude-judge): first_pass side_a turn failed with exit code 1:
- **prd-hidden-scope-creep** (gpt-judge): first_pass side_a turn failed with exit code 1:
- **pricing-partial-data** (claude-judge): first_pass side_a turn failed with exit code 1:
- **pricing-partial-data** (gpt-judge): first_pass side_a turn failed with exit code 1:
- **supermicro-export-controls** (claude-judge): first_pass side_a turn failed with exit code 1:
- **supermicro-export-controls** (gpt-judge): first_pass side_a turn failed with exit code 1:
- **yahoo-microsoft** (claude-judge): first_pass side_a turn failed with exit code 1:
- **yahoo-microsoft** (gpt-judge): first_pass side_a turn failed with exit code 1:
- **zillow-offers** (claude-judge): first_pass side_a turn failed with exit code 1:
- **zillow-offers** (gpt-judge): first_pass side_a turn failed with exit code 1:
