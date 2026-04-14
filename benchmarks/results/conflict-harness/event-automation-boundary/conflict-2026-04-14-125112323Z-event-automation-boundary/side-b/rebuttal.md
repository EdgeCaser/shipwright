# Critique: finding-2

- Target Side: side_a
- Target Claim IDs: side_a-claim-1
- Attack Type: evidence_gap
- Severity: medium

## Claim Under Attack
LLM boundaries must be enforced architecturally (output filter layer + human approval gates) rather than relying on prompt engineering alone, because prompt-based restrictions are bypassable and insufficient for financial commitment safety.

## Evidence Or Reason
The claim overstates what the proposed architecture proves. A pattern-based output filter plus human approval gate may reduce risk, but the artifact provides no evidence that this specific filter design can reliably detect implied commitments, paraphrased pricing language, or multi-turn jailbreak behavior. Without concrete specs for the classifier/filter logic, false-negative analysis, or evidence that all outbound paths are actually gate-enforced, 'architectural enforcement' is asserted rather than demonstrated.

