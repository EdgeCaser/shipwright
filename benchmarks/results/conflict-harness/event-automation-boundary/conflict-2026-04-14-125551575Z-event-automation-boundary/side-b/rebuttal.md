# Critique: finding-2

- Target Side: side_a
- Target Claim IDs: side_a-claim-2
- Attack Type: evidence_gap
- Severity: medium

## Claim Under Attack
The human approval gate for pricing must use rule-based classification (regex + structured field detection) rather than LLM-based detection to avoid the recursive problem of trusting an LLM to police itself.

## Evidence Or Reason
This claim asserts necessity without showing that rule-based detection can actually achieve the required coverage in event-management conversations. Pricing commitments are often implied rather than expressed in obvious numeric or keyword forms, so regex plus field detection may miss soft commitments, bundled offers, or paraphrased payment terms. The artifact also provides no comparative evidence that a deterministic detector is more reliable than a bounded classifier for this domain, so the proposed mechanism is an unsupported design conclusion rather than a demonstrated requirement.

