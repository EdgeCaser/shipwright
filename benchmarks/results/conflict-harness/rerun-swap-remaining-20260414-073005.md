# Conflict Harness Batch Summary

Runs completed: 12
Errors: 0

## Run Results

| Scenario | Side A | Side B | Judge | Status | Winner | Margin | Confidence | Human Review | Disagreement | Declared | Revised |
|---|---|---|---|---|---|---|---|---|---|---|---|
 | netflix-qwikster | gpt | claude | claude-judge | completed | side_b | 0.20 | medium | false | 0.29 | 1.00 | 1.00 | 
 | netflix-qwikster | gpt | claude | gpt-judge | completed | side_b | 0.34 | medium | false | 0.29 | 1.00 | 1.00 | 
 | prd-hidden-scope-creep | gpt | claude | claude-judge | completed | side_b | 0.10 | low | true | 0.42 | 1.00 | 1.00 | 
 | prd-hidden-scope-creep | gpt | claude | gpt-judge | completed | side_a | 0.40 | medium | true | 0.42 | 1.00 | 1.00 | 
 | pricing-partial-data | gpt | claude | claude-judge | completed | side_b | 1.00 | high | false | 0.75 | 1.00 | 1.00 | 
 | pricing-partial-data | gpt | claude | gpt-judge | completed | side_b | 0.16 | low | true | 0.50 | 1.00 | 1.00 | 
 | supermicro-export-controls | gpt | claude | claude-judge | completed | side_a | 0.20 | medium | false | 0.00 | 1.00 | 1.00 | 
 | supermicro-export-controls | gpt | claude | gpt-judge | completed | side_a | 0.40 | medium | false | 0.29 | 1.00 | 1.00 | 
 | yahoo-microsoft | gpt | claude | claude-judge | completed | side_b | 0.60 | medium | false | 0.35 | 1.00 | 1.00 | 
 | yahoo-microsoft | gpt | claude | gpt-judge | completed | side_a | 0.28 | medium | false | 0.25 | 1.00 | 1.00 | 
 | zillow-offers | gpt | claude | claude-judge | completed | side_b | 0.20 | medium | false | 0.27 | 1.00 | 1.00 | 
 | zillow-offers | gpt | claude | gpt-judge | completed | side_a | 0.50 | high | false | 0.17 | 1.00 | 1.00 | 

## Judge Agreement Analysis

| Scenario | claude-judge Winner | gpt-judge Winner | Agree? | Margin Delta |
|---|---|---|---|---|
 | netflix-qwikster | side_b | side_b | YES | 0.14 | 
 | prd-hidden-scope-creep | side_b | side_a | **NO** | 0.30 | 
 | pricing-partial-data | side_b | side_b | YES | 0.84 | 
 | supermicro-export-controls | side_a | side_a | YES | 0.20 | 
 | yahoo-microsoft | side_b | side_a | **NO** | 0.32 | 
 | zillow-offers | side_b | side_a | **NO** | 0.30 | 

**Completed comparisons:** 6/6
**Judge agreement rate:** 3/6 (50%)
**Average margin delta:** 0.35

Interpretation: Agreement is between 50-70%. Judge family affinity is a significant variable. Dual-judge runs should be the default for any publishable conclusion.
