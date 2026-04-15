# Conflict Harness Batch Summary

Runs completed: 22
Errors: 0

## Run Results

| Scenario | Judge | Status | Winner | Margin | Confidence | Human Review | Disagreement | Adopted |
|---|---|---|---|---|---|---|---|---|
 | blockbuster-total-access | claude-judge | completed | tie | 0.00 | medium | true | 0.38 | 1.00 | 
 | blockbuster-total-access | gpt-judge | completed | side_b | 0.80 | high | false | 0.33 | 1.00 | 
 | board-update-ambiguity | claude-judge | completed | side_a | 0.20 | medium | false | 0.75 | 1.00 | 
 | board-update-ambiguity | gpt-judge | completed | side_b | 0.34 | medium | false | 0.50 | 1.00 | 
 | churn-conflicting-signals | claude-judge | completed | side_a | 0.40 | medium | false | 0.25 | 1.00 | 
 | churn-conflicting-signals | gpt-judge | completed | side_b | 0.80 | medium | false | 0.17 | 1.00 | 
 | event-automation-boundary | claude-judge | completed | side_a | 0.80 | high | false | 0.29 | 1.00 | 
 | event-automation-boundary | gpt-judge | completed | tie | 0.08 | low | true | 0.29 | 1.00 | 
 | feature-weak-evidence | claude-judge | completed | side_a | 0.40 | medium | false | 0.67 | 1.00 | 
 | feature-weak-evidence | gpt-judge | completed | tie | 0.00 | low | true | 0.67 | 1.00 | 
 | handoff-contradiction | claude-judge | completed | side_a | 0.20 | medium | false | 0.50 | 1.00 | 
 | handoff-contradiction | gpt-judge | completed | side_a | 1.00 | medium | false | 0.33 | 1.00 | 
 | netflix-qwikster | claude-judge | completed | side_a | 0.20 | medium | false | 0.29 | 1.00 | 
 | netflix-qwikster | gpt-judge | completed | tie | 0.04 | low | true | 0.25 | 1.00 | 
 | prd-hidden-scope-creep | claude-judge | completed | side_a | 0.80 | high | false | 0.33 | 1.00 | 
 | prd-hidden-scope-creep | gpt-judge | completed | side_a | 0.24 | low | true | 0.42 | 1.00 | 
 | pricing-partial-data | claude-judge | completed | side_a | 1.20 | high | false | 0.33 | 1.00 | 
 | pricing-partial-data | gpt-judge | completed | tie | 0.00 | low | true | 0.42 | 1.00 | 
 | yahoo-microsoft | claude-judge | completed | side_a | 0.40 | medium | false | 0.43 | 1.00 | 
 | yahoo-microsoft | gpt-judge | completed | side_a | 0.30 | medium | false | 0.27 | 1.00 | 
 | zillow-offers | claude-judge | completed | side_a | 0.40 | medium | false | 0.25 | 1.00 | 
 | zillow-offers | gpt-judge | completed | side_b | 0.40 | medium | false | 0.13 | 1.00 | 

## Judge Agreement Analysis

| Scenario | claude-judge Winner | gpt-judge Winner | Agree? | Margin Delta |
|---|---|---|---|---|
 | blockbuster-total-access | tie | side_b | **NO** | 0.80 | 
 | board-update-ambiguity | side_a | side_b | **NO** | 0.14 | 
 | churn-conflicting-signals | side_a | side_b | **NO** | 0.40 | 
 | event-automation-boundary | side_a | tie | **NO** | 0.72 | 
 | feature-weak-evidence | side_a | tie | **NO** | 0.40 | 
 | handoff-contradiction | side_a | side_a | YES | 0.80 | 
 | netflix-qwikster | side_a | tie | **NO** | 0.16 | 
 | prd-hidden-scope-creep | side_a | side_a | YES | 0.56 | 
 | pricing-partial-data | side_a | tie | **NO** | 1.20 | 
 | yahoo-microsoft | side_a | side_a | YES | 0.10 | 
 | zillow-offers | side_a | side_b | **NO** | 0.00 | 

**Completed comparisons:** 11/11
**Judge agreement rate:** 3/11 (27%)
**Average margin delta:** 0.48

Interpretation: Agreement is below 50%. Judge family affinity dominates the verdict. The harness needs a third-provider judge or consensus mechanism before any conclusion is publishable.
