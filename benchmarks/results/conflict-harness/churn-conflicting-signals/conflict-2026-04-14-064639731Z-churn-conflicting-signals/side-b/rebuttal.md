# Critique: finding-2

- Target Side: side_a
- Target Claim IDs: side_a-claim-1
- Attack Type: evidence_gap
- Severity: high

## Claim Under Attack
A churn reduction PRD is only decision-useful under conflicting signals if it separates preventable churn from strategic churn and applies segment-specific, guardrailed interventions instead of a blanket retention push.

## Evidence Or Reason
The claim asserts that a three-bucket churn taxonomy (value-destruction, neutral, strategic) is the necessary foundation for decision-usefulness, yet the artifact's own Unknowns section admits: no concrete churn drivers are identified, no segment-level breakdown exists, no profitability context is available, and no baseline confidence model exists for the conflicting signals. The PRD prescribes an elaborate classification layer, intervention engine, and review cadence built entirely on top of a taxonomy with zero empirical grounding. This is not a decision-useful PRD — it is a speculative operating model dressed as requirements. A genuinely decision-useful artifact under signal conflict would first specify what the conflicting signals actually are, quantify the gap between them, and define the minimum evidence threshold needed before any classification scheme is adopted. Instead, the artifact skips straight to a mature retention program architecture while acknowledging it lacks the data to populate any of its own acceptance criteria. The Decision Frame says 'proceed only if it distinguishes preventable from strategic churn,' but the artifact provides no method for making that distinction with current data — making the pass condition self-defeating.

