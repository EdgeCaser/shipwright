# Critique: finding-2

- Target Side: side_a
- Target Claim IDs: side_a-claim-3
- Attack Type: evidence_gap
- Severity: medium

## Claim Under Attack
A commitment-detection guardrail using deterministic pattern scanning must sit between LLM output and client delivery, with a target of 0% false negatives and less than 15% false positives on pricing and commitment language

## Evidence Or Reason
This claim asserts a deterministic scanner can reliably catch all pricing and commitment language, but the artifact provides no evidence that regex/keyword rules are sufficient against paraphrases, indirect commitments, multilingual variants, or context-dependent confirmations. Setting a 0% false-negative target is especially unsupported because the PRD does not define the pattern set, coverage methodology, adversarial test design, or how recall is validated on realistic conversation data. Without that visible support, the safety property is asserted rather than demonstrated.

