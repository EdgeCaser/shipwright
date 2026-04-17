# Critique: finding-2

- Target Side: side_a
- Target Claim IDs: side_a-claim-1
- Attack Type: evidence_gap
- Severity: medium

## Claim Under Attack
R1 (2-second real-time updates) and R2 (batch as authoritative source of truth) are architecturally incompatible as stated — they cannot be simultaneously satisfied without a dual-write system, which the team has already rejected.

## Evidence Or Reason
The incompatibility is overstated from the visible record. The case packet says the requirements are incompatible 'without a dual-write system that introduces consistency risk the team has previously rejected,' but that does not prove dual-write is the only way to satisfy both requirements as a product spec. A PRD could preserve both user outcomes by explicitly distinguishing provisional real-time dashboard values from batch-final reporting values, or by narrowing 'source of truth' to finalized reporting rather than every user-visible metric. Side A presents an absolute architectural claim without showing that alternative semantic contracts were ruled out by the text provided.

