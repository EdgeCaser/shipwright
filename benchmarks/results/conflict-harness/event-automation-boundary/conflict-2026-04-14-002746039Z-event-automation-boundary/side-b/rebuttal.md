# Critique: finding-2

- Target Side: side_a
- Target Claim IDs: side_a-claim-1
- Attack Type: evidence_gap
- Severity: medium

## Claim Under Attack
Approval gates must be enforced at the message-send layer (not the generation layer) to create a zero-bypass architecture where no LLM output containing pricing, date commitments, or policy language can reach clients without human review.

## Evidence Or Reason
The artifact asserts a zero-bypass architecture but provides no implementation proof, threat model, test strategy, or integration map showing that all outbound WhatsApp paths, templates, operator edits, retries, admin overrides, and third-party API calls are actually mediated by the same send-layer gate. It also admits gate bypass via admin-level console access, which weakens the absolute 'zero-bypass' framing unless the claim is narrowed to non-admin runtime paths.

