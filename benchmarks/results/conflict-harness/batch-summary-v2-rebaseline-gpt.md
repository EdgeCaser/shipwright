# Conflict Harness Batch Summary

Runs completed: 13
Errors: 1

## Run Results

| Scenario | Side A | Side B | Judge | Status | Winner | Margin | Confidence | Human Review | Disagreement | Declared | Revised |
|---|---|---|---|---|---|---|---|---|---|---|---|
 | blockbuster-total-access | claude | gpt | gpt-judge | completed | side_b | 0.20 | low | true | 0.33 | 1.00 | 1.00 | 
 | board-update-ambiguity | claude | gpt | gpt-judge | completed | side_b | 0.30 | low | true | 0.50 | 1.00 | 1.00 | 
 | churn-conflicting-signals | claude | gpt | gpt-judge | completed | side_a | 0.20 | medium | false | 0.33 | 1.00 | 1.00 | 
 | event-automation-boundary | claude | gpt | gpt-judge | completed | tie | 0.00 | low | true | 0.50 | 1.00 | 1.00 | 
 | feature-weak-evidence | claude | gpt | gpt-judge | completed | side_b | 0.30 | medium | false | 0.42 | 1.00 | 1.00 | 
 | handoff-contradiction | claude | gpt | gpt-judge | completed | side_b | 0.86 | medium | true | 0.17 | 1.00 | 1.00 | 
 | meta-muse-spark | claude | gpt | gpt-judge | completed | side_a | 0.20 | medium | false | 0.42 | 1.00 | 1.00 | 
 | netflix-qwikster | claude | gpt | gpt-judge | completed | side_a | 0.20 | low | false | 0.33 | 1.00 | 1.00 | 
 | prd-hidden-scope-creep | claude | gpt | gpt-judge | error | — | — | — | — | — | — | — | 
 | pricing-partial-data | claude | gpt | gpt-judge | completed | side_b | 0.30 | medium | false | 0.50 | 1.00 | 1.00 | 
 | supermicro-export-controls | claude | gpt | gpt-judge | completed | tie | 0.00 | low | true | 0.17 | 1.00 | 1.00 | 
 | yahoo-microsoft | claude | gpt | gpt-judge | completed | side_a | 0.40 | medium | false | 0.29 | 1.00 | 1.00 | 
 | zillow-offers | claude | gpt | gpt-judge | completed | side_a | 0.14 | medium | false | 0.29 | 1.00 | 1.00 | 

## Errors

- **prd-hidden-scope-creep** (gpt-judge): Model output is not valid JSON: Expected ',' or '}' after property value in JSON at position 1712 (line 5 column 1594)
