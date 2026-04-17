# Critique: finding-1

- Target Side: side_b
- Target Claim IDs: side_b-claim-3
- Attack Type: evidence_gap
- Severity: high

## Claim Under Attack
The final shutdown date should be gated by customer-specific migration readiness and contract exposure rather than set immediately from internal maintenance goals alone.

## Evidence Or Reason
Side B asserts migration readiness and contract exposure as the primary gating criteria but never establishes a floor condition that prevents indefinite deferral. Without a concrete fallback deadline or escalation trigger, this criterion is unbounded — customers who never complete migration effectively veto the sunset permanently. Side B's own Pass/Fail section flags this risk ('The organization keeps supporting the legacy API indefinitely with no narrowing of scope or exit criteria') but the Decision Frame provides no mechanism to prevent it. The claim is operationally incomplete: a gate without a fallback is not a deprecation strategy, it is an open-ended support commitment dressed as one.

