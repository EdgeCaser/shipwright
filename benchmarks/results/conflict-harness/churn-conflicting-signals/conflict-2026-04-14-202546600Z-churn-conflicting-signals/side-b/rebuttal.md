# Critique: finding-2

- Target Side: side_a
- Target Claim IDs: side_a-claim-1
- Attack Type: evidence_gap
- Severity: medium

## Claim Under Attack
Conflicting churn signals most commonly arise from Simpson's Paradox in aggregated metrics, so cohort-level disaggregation is the essential first diagnostic step before any intervention design.

## Evidence Or Reason
The visible artifact gives no case-specific evidence that aggregation error is the likely cause here; it only names Simpson's Paradox as a generic best practice. In this scenario, conflicting signals could just as plausibly come from metric-definition mismatch, contract timing, pricing changes, or weak leading indicators. Elevating cohort disaggregation to the essential first step overstates confidence without showing that the current conflict is actually aggregation-driven.

