# Critique: finding-2

- Target Side: side_a
- Target Claim IDs: side_a-claim-1
- Attack Type: evidence_gap
- Severity: medium

## Claim Under Attack
LLM usage must be bounded by a default-deny classification architecture where pricing-adjacent queries are escalated regardless of classifier confidence, and all LLM-generated client-facing messages pass through a deterministic output validation layer that blocks any commitment or pricing language.

## Evidence Or Reason
The claim asserts a specific safety architecture as necessary, but the artifact provides no evidence that keyword allowlists, confidence thresholds, regex scanners, or deterministic validators can reliably detect pricing and commitment intent in messy event-planning conversations. It also does not justify why 0.95 confidence is the right routing threshold or how the validator handles paraphrased, implicit, multilingual, or context-dependent pricing commitments.

