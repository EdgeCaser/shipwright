# Conflict Harness Batch Summary

Runs completed: 12
Errors: 1

## Run Results

| Scenario | Side A | Side B | Judge | Status | Winner | Margin | Confidence | Human Review | Disagreement | Declared | Revised |
|---|---|---|---|---|---|---|---|---|---|---|---|
 | churn-conflicting-signals | gpt | claude | claude-judge | error | — | — | — | — | — | — | — | 
 | churn-conflicting-signals | gpt | claude | gpt-judge | completed | side_b | 0.30 | medium | true | 0.38 | 1.00 | 1.00 | 
 | event-automation-boundary | gpt | claude | claude-judge | completed | side_b | 0.60 | medium | false | 0.29 | 1.00 | 1.00 | 
 | event-automation-boundary | gpt | claude | gpt-judge | completed | tie | 0.00 | low | true | 0.29 | 1.00 | 1.00 | 
 | feature-weak-evidence | gpt | claude | claude-judge | completed | side_b | 0.55 | medium | false | 0.67 | 1.00 | 1.00 | 
 | feature-weak-evidence | gpt | claude | gpt-judge | completed | side_a | 0.30 | medium | false | 0.42 | 1.00 | 1.00 | 
 | netflix-qwikster | gpt | claude | claude-judge | completed | side_a | 0.20 | medium | false | 0.33 | 1.00 | 1.00 | 
 | netflix-qwikster | gpt | claude | gpt-judge | completed | tie | 0.04 | low | true | 0.25 | 1.00 | 1.00 | 
 | prd-hidden-scope-creep | gpt | claude | claude-judge | completed | side_b | 0.50 | medium | false | 0.33 | 1.00 | 1.00 | 
 | prd-hidden-scope-creep | gpt | claude | gpt-judge | completed | side_a | 0.60 | medium | false | 0.42 | 1.00 | 1.00 | 
 | pricing-partial-data | gpt | claude | claude-judge | completed | side_b | 1.00 | high | true | 0.33 | 1.00 | 1.00 | 
 | pricing-partial-data | gpt | claude | gpt-judge | completed | side_a | 0.50 | medium | false | 0.67 | 1.00 | 1.00 | 

## Judge Agreement Analysis

| Scenario | claude-judge Winner | gpt-judge Winner | Agree? | Margin Delta |
|---|---|---|---|---|
| churn-conflicting-signals | ERROR | side_b | — | — |
 | event-automation-boundary | side_b | tie | **NO** | 0.60 | 
 | feature-weak-evidence | side_b | side_a | **NO** | 0.25 | 
 | netflix-qwikster | side_a | tie | **NO** | 0.16 | 
 | prd-hidden-scope-creep | side_b | side_a | **NO** | 0.10 | 
 | pricing-partial-data | side_b | side_a | **NO** | 0.50 | 

**Completed comparisons:** 5/6
**Judge agreement rate:** 0/5 (0%)
**Average margin delta:** 0.32

**WARNING:** 1 scenario(s) did not complete with both judges. The agreement rate is based on partial coverage and should not be used for publishability decisions. Rerun failed scenarios before drawing conclusions.

## Errors

- **churn-conflicting-signals** (claude-judge): Run record failed validation:
$.sides.side_a.first_pass.open_questions[0]: Expected string.
$.sides.side_a.first_pass.open_questions[1]: Expected string.
$.sides.side_a.first_pass.open_questions[2]: Expected string.
