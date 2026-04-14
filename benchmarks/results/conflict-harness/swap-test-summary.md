# Conflict Harness Batch Summary

Runs completed: 10
Errors: 0

## Run Results

| Scenario | Side A | Side B | Judge | Status | Winner | Margin | Confidence | Human Review | Disagreement | Declared | Revised |
|---|---|---|---|---|---|---|---|---|---|---|---|
 | blockbuster-total-access | gpt | claude | claude-judge | completed | side_b | 1.00 | high | false | 0.33 | 1.00 | 1.00 | 
 | blockbuster-total-access | gpt | claude | gpt-judge | completed | side_a | 0.32 | high | false | 0.29 | 1.00 | 1.00 | 
 | board-update-ambiguity | gpt | claude | claude-judge | completed | side_a | 1.20 | medium | false | 0.33 | 1.00 | 1.00 | 
 | board-update-ambiguity | gpt | claude | gpt-judge | completed | side_a | 0.20 | medium | true | 0.67 | 1.00 | 1.00 | 
 | handoff-contradiction | gpt | claude | claude-judge | completed | side_b | 0.80 | high | false | 0.25 | 1.00 | 1.00 | 
 | handoff-contradiction | gpt | claude | gpt-judge | completed | side_a | 0.48 | medium | false | 0.33 | 1.00 | 1.00 | 
 | meta-muse-spark | gpt | claude | claude-judge | completed | side_a | 0.80 | high | false | 0.27 | 1.00 | 1.00 | 
 | meta-muse-spark | gpt | claude | gpt-judge | completed | tie | 0.02 | low | true | 0.38 | 1.00 | 1.00 | 
 | yahoo-microsoft | gpt | claude | claude-judge | completed | side_b | 0.40 | medium | false | 0.29 | 1.00 | 1.00 | 
 | yahoo-microsoft | gpt | claude | gpt-judge | completed | tie | 0.00 | low | true | 0.25 | 1.00 | 1.00 | 

## Judge Agreement Analysis

| Scenario | claude-judge Winner | gpt-judge Winner | Agree? | Margin Delta |
|---|---|---|---|---|
 | blockbuster-total-access | side_b | side_a | **NO** | 0.68 | 
 | board-update-ambiguity | side_a | side_a | YES | 1.00 | 
 | handoff-contradiction | side_b | side_a | **NO** | 0.32 | 
 | meta-muse-spark | side_a | tie | **NO** | 0.78 | 
 | yahoo-microsoft | side_b | tie | **NO** | 0.40 | 

**Completed comparisons:** 5/5
**Judge agreement rate:** 1/5 (20%)
**Average margin delta:** 0.64

Interpretation: Agreement is below 50%. Judge family affinity dominates the verdict. The harness needs a third-provider judge or consensus mechanism before any conclusion is publishable.
