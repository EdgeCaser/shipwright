# Conflict Harness Batch Summary

Runs completed: 4
Errors: 0

## Run Results

| Scenario | Judge | Status | Winner | Margin | Confidence | Human Review | Disagreement | Adopted |
|---|---|---|---|---|---|---|---|---|
 | meta-muse-spark | claude-judge | completed | side_a | 1.00 | high | false | 0.33 | 1.00 | 
 | meta-muse-spark | gpt-judge | completed | tie | 0.04 | low | true | 0.50 | 1.00 | 
 | supermicro-export-controls | claude-judge | completed | side_a | 0.40 | medium | false | 0.46 | 1.00 | 
 | supermicro-export-controls | gpt-judge | completed | side_b | 0.40 | medium | false | 0.17 | 1.00 | 

## Judge Agreement Analysis

| Scenario | claude-judge Winner | gpt-judge Winner | Agree? | Margin Delta |
|---|---|---|---|---|
 | meta-muse-spark | side_a | tie | **NO** | 0.96 | 
 | supermicro-export-controls | side_a | side_b | **NO** | 0.00 | 

**Completed comparisons:** 2/2
**Judge agreement rate:** 0/2 (0%)
**Average margin delta:** 0.48

Interpretation: Agreement is below 50%. Judge family affinity dominates the verdict. The harness needs a third-provider judge or consensus mechanism before any conclusion is publishable.
