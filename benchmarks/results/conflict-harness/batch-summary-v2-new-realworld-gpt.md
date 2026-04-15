# Conflict Harness Batch Summary

Runs completed: 6
Errors: 2

## Run Results

| Scenario | Side A | Side B | Judge | Status | Winner | Margin | Confidence | Human Review | Disagreement | Declared | Revised |
|---|---|---|---|---|---|---|---|---|---|---|---|
 | bayer-breakup-not-now | claude | gpt | gpt-judge | completed | side_b | 0.30 | medium | false | 0.17 | 1.00 | 1.00 | 
 | google-adtech-breakup-remedies | claude | gpt | gpt-judge | completed | side_b | 0.30 | medium | false | 0.29 | 1.00 | 1.00 | 
 | intel-foundry-separation | claude | gpt | gpt-judge | completed | side_b | 0.20 | medium | false | 0.33 | 1.00 | 1.00 | 
 | nissan-honda-merger-collapse | claude | gpt | gpt-judge | completed | side_b | 0.30 | medium | false | 0.13 | 1.00 | 1.00 | 
 | openai-nonprofit-control | claude | gpt | gpt-judge | error | — | — | — | — | — | — | — | 
 | paramount-skydance-deal | claude | gpt | gpt-judge | error | — | — | — | — | — | — | — | 

## Errors

- **openai-nonprofit-control** (gpt-judge): Run record failed validation:
$.sides.side_a.first_pass.conclusion_confidence: Expected one of: low, medium, high.
- **paramount-skydance-deal** (gpt-judge): Model output is not valid JSON: Expected ',' or '}' after property value in JSON at position 638 (line 5 column 519)
