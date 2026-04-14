# Critique: finding-2

- Target Side: side_a
- Target Claim IDs: side_a-claim-1
- Attack Type: evidence_gap
- Severity: medium

## Claim Under Attack
The LLM must be architecturally isolated from client-facing response delivery, with pricing commitments gated by explicit human approval — enforced at the API layer, not by prompt engineering or policy alone.

## Evidence Or Reason
This is presented as a must-have architectural requirement, but the artifact provides no evidence that API-layer isolation is the necessary or sufficient control for this scenario. It does not compare alternative enforcement patterns, define the actual threat model, or show why the proposed separation would prevent indirect leakage through templating, retrieval, operator actions, or misclassified fields. Without concrete failure modes or validation evidence, the claim reads as an asserted design preference rather than a demonstrated requirement.

