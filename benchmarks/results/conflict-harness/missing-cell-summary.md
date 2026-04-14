# Conflict Harness Batch Summary

Runs completed: 2
Errors: 0

## Run Results

| Scenario | Side A | Side B | Judge | Status | Winner | Margin | Confidence | Human Review | Disagreement | Declared | Revised |
|---|---|---|---|---|---|---|---|---|---|---|---|
 | churn-conflicting-signals | gpt | claude | claude-judge | completed | side_a | 0.40 | medium | false | 0.17 | 1.00 | 1.00 | 
 | churn-conflicting-signals | gpt | claude | gpt-judge | completed | side_a | 0.10 | low | true | 0.42 | 1.00 | 1.00 | 

## Judge Agreement Analysis

| Scenario | claude-judge Winner | gpt-judge Winner | Agree? | Margin Delta |
|---|---|---|---|---|
 | churn-conflicting-signals | side_a | side_a | YES | 0.30 | 

**Completed comparisons:** 1/1
**Judge agreement rate:** 1/1 (100%)
**Average margin delta:** 0.30

Interpretation: Agreement is above 70%. Single-judge runs are usable with a caveat that judge family affinity exists but does not dominate across scenarios.
