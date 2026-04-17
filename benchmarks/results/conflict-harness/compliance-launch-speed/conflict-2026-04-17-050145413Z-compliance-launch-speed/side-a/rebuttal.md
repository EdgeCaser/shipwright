# Critique: finding-1

- Target Side: side_b
- Target Claim IDs: side_b-claim-1
- Attack Type: evidence_gap
- Severity: medium

## Claim Under Attack
The regulated feature should not launch in Q2 because the required compliance review cannot complete before quarter end.

## Evidence Or Reason
Side B treats the 14-week minimum as fixed and immutable, but its own open questions acknowledge a formal process change could alter the minimum review duration without increasing legal exposure. The PRD never investigates whether that path is available — it simply assumes the constraint is static and builds its entire replan on that assumption. If a process acceleration exists (e.g., parallel review tracks, pre-submission preparation that started earlier, regulatory pre-clearance), the 10-week gap may be closable through legitimate means. By treating the 14-week floor as settled fact rather than a variable requiring verification, Side B's core claim — and its downstream launch recommendation — rests on an unexamined premise. A decision-useful PRD would have surfaced this as a blocker question before declaring Q2 categorically unachievable.

