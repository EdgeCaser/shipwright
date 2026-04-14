# Critique: finding-2

- Target Side: side_a
- Target Claim IDs: side_a-claim-1
- Attack Type: evidence_gap
- Severity: high

## Claim Under Attack
When churn signals conflict, retention work should be segmented by both churn risk and evidence confidence rather than deployed as a single global program.

## Evidence Or Reason
The artifact asserts segmentation by evidence confidence as the highest-confidence path but provides no evidence that this two-axis model (risk × confidence) actually outperforms alternatives. The confidence axis itself is undefined — no threshold, no methodology for computing it, no validation that the team can reliably distinguish high-confidence from low-confidence risk signals. Without operationalizing what 'evidence confidence' means or citing any prior instance where this decomposition improved retention outcomes, the claim is a plausible-sounding framework imposed on the problem rather than derived from it. The PRD also never addresses the possibility that segmentation itself introduces harmful delays — accounts misclassified as 'low-confidence' receive only 'diagnostic outreach' while they churn. The cost of the framework's false negatives is unexamined.

