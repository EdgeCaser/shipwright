# Conflict Harness Batch Summary

Runs completed: 26
Errors: 14

## Run Results

| Scenario | Side A | Side B | Judge | Status | Winner | Margin | Confidence | Human Review | Disagreement | Declared | Revised |
|---|---|---|---|---|---|---|---|---|---|---|---|
 | blockbuster-total-access | gpt | claude | claude-judge | completed | side_b | 1.00 | high | false | 0.38 | 1.00 | 1.00 | 
 | blockbuster-total-access | gpt | claude | gpt-judge | error | — | — | — | — | — | — | — | 
 | board-update-ambiguity | gpt | claude | claude-judge | error | — | — | — | — | — | — | — | 
 | board-update-ambiguity | gpt | claude | gpt-judge | completed | side_a | 0.60 | medium | false | 0.67 | 1.00 | 1.00 | 
 | churn-conflicting-signals | gpt | claude | claude-judge | completed | side_b | 0.40 | medium | false | 0.38 | 1.00 | 1.00 | 
 | churn-conflicting-signals | gpt | claude | gpt-judge | completed | side_a | 0.22 | medium | false | 0.42 | 1.00 | 1.00 | 
 | event-automation-boundary | gpt | claude | claude-judge | completed | tie | 0.00 | medium | true | 0.50 | 1.00 | 1.00 | 
 | event-automation-boundary | gpt | claude | gpt-judge | completed | side_a | 0.22 | medium | false | 0.38 | 1.00 | 1.00 | 
 | feature-weak-evidence | gpt | claude | claude-judge | completed | side_a | 0.20 | medium | false | 0.42 | 1.00 | 1.00 | 
 | feature-weak-evidence | gpt | claude | gpt-judge | completed | side_a | 0.30 | medium | false | 0.42 | 1.00 | 1.00 | 
 | handoff-contradiction | gpt | claude | claude-judge | completed | side_b | 1.80 | high | false | 0.67 | 1.00 | 1.00 | 
 | handoff-contradiction | gpt | claude | gpt-judge | completed | side_a | 0.40 | medium | true | 0.42 | 1.00 | 1.00 | 
 | meta-muse-spark | gpt | claude | claude-judge | completed | tie | 0.00 | medium | true | 0.29 | 1.00 | 1.00 | 
 | meta-muse-spark | gpt | claude | gpt-judge | completed | side_a | 0.10 | medium | false | 0.33 | 1.00 | 1.00 | 
 | netflix-qwikster | gpt | claude | claude-judge | error | — | — | — | — | — | — | — | 
 | netflix-qwikster | gpt | claude | gpt-judge | error | — | — | — | — | — | — | — | 
 | prd-hidden-scope-creep | gpt | claude | claude-judge | error | — | — | — | — | — | — | — | 
 | prd-hidden-scope-creep | gpt | claude | gpt-judge | error | — | — | — | — | — | — | — | 
 | pricing-partial-data | gpt | claude | claude-judge | error | — | — | — | — | — | — | — | 
 | pricing-partial-data | gpt | claude | gpt-judge | error | — | — | — | — | — | — | — | 
 | supermicro-export-controls | gpt | claude | claude-judge | error | — | — | — | — | — | — | — | 
 | supermicro-export-controls | gpt | claude | gpt-judge | error | — | — | — | — | — | — | — | 
 | yahoo-microsoft | gpt | claude | claude-judge | error | — | — | — | — | — | — | — | 
 | yahoo-microsoft | gpt | claude | gpt-judge | error | — | — | — | — | — | — | — | 
 | zillow-offers | gpt | claude | claude-judge | error | — | — | — | — | — | — | — | 
 | zillow-offers | gpt | claude | gpt-judge | error | — | — | — | — | — | — | — | 

## Judge Agreement Analysis

| Scenario | claude-judge Winner | gpt-judge Winner | Agree? | Margin Delta |
|---|---|---|---|---|
| blockbuster-total-access | side_b | ERROR | — | — |
| board-update-ambiguity | ERROR | side_a | — | — |
 | churn-conflicting-signals | side_b | side_a | **NO** | 0.18 | 
 | event-automation-boundary | tie | side_a | **NO** | 0.22 | 
 | feature-weak-evidence | side_a | side_a | YES | 0.10 | 
 | handoff-contradiction | side_b | side_a | **NO** | 1.40 | 
 | meta-muse-spark | tie | side_a | **NO** | 0.10 | 
| netflix-qwikster | ERROR | ERROR | — | — |
| prd-hidden-scope-creep | ERROR | ERROR | — | — |
| pricing-partial-data | ERROR | ERROR | — | — |
| supermicro-export-controls | ERROR | ERROR | — | — |
| yahoo-microsoft | ERROR | ERROR | — | — |
| zillow-offers | ERROR | ERROR | — | — |

**Completed comparisons:** 5/13
**Judge agreement rate:** 1/5 (20%)
**Average margin delta:** 0.40

**WARNING:** 8 scenario(s) did not complete with both judges. The agreement rate is based on partial coverage and should not be used for publishability decisions. Rerun failed scenarios before drawing conclusions.

## Errors

- **blockbuster-total-access** (gpt-judge): final side_b turn failed with exit code 1: Timed out after 120000ms.
- **board-update-ambiguity** (claude-judge): Run record failed validation:
$.sides.side_a.first_pass.open_questions[0]: Expected string.
$.sides.side_a.first_pass.open_questions[1]: Expected string.
- **netflix-qwikster** (claude-judge): rebuttal side_b turn failed with exit code 1:
- **netflix-qwikster** (gpt-judge): first_pass side_b turn failed with exit code 1:
- **prd-hidden-scope-creep** (claude-judge): first_pass side_b turn failed with exit code 1:
- **prd-hidden-scope-creep** (gpt-judge): first_pass side_b turn failed with exit code 1:
- **pricing-partial-data** (claude-judge): first_pass side_b turn failed with exit code 1:
- **pricing-partial-data** (gpt-judge): first_pass side_b turn failed with exit code 1:
- **supermicro-export-controls** (claude-judge): first_pass side_b turn failed with exit code 1:
- **supermicro-export-controls** (gpt-judge): first_pass side_b turn failed with exit code 1:
- **yahoo-microsoft** (claude-judge): first_pass side_b turn failed with exit code 1:
- **yahoo-microsoft** (gpt-judge): first_pass side_b turn failed with exit code 1:
- **zillow-offers** (claude-judge): first_pass side_b turn failed with exit code 1:
- **zillow-offers** (gpt-judge): first_pass side_b turn failed with exit code 1:
