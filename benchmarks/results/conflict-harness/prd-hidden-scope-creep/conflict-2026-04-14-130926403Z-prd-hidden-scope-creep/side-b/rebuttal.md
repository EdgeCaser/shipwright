# Critique: finding-2

- Target Side: side_a
- Target Claim IDs: side_a-claim-4
- Attack Type: evidence_gap
- Severity: medium

## Claim Under Attack
The recommended next artifact is an instrumentation spec (not a technical design), with a concrete go/no-go threshold of 5% handoff frequency to prevent investing in a rare-event problem.

## Evidence Or Reason
The artifact presents a hard 5% go/no-go threshold as if it were decision-useful, but no visible evidence justifies that cutoff. Frequency alone is also an incomplete gate: a lower-frequency handoff problem could still merit investment if severity, revenue impact, or CSAT damage is high. Without a rationale tying 5% to cost, pain, or opportunity size, the threshold looks arbitrary rather than evidence-based.

