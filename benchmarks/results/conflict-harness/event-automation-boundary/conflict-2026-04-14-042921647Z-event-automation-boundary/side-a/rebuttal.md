# Critique: finding-1

- Target Side: side_b
- Target Claim IDs: side_b-claim-3
- Attack Type: evidence_gap
- Severity: medium

## Claim Under Attack
The boundary classification system requires a quantified false-negative target (<2%) validated against a real-message test corpus before launch, because even a small rate of undetected pricing commitments creates contractual and financial liability.

## Evidence Or Reason
The claim asserts a specific pre-launch threshold of <2% false negatives, but the artifact provides no evidence that 2% is the right cutoff, that a 200-message corpus is statistically sufficient, or that this level of residual risk is acceptable for pricing commitments with contractual consequences. The liability rationale could just as easily support a stricter standard, a different metric, or a different control design; without evidence, the numeric target reads as arbitrary rather than decision-useful.

