# Critique: finding-2

- Target Side: side_a
- Target Claim IDs: side_a-claim-1, side_a-claim-2
- Attack Type: evidence_gap
- Severity: high

## Claim Under Attack
Phase 1 should be designed as an operator-assist system with deterministic workflow control and mandatory human approval for any pricing commitment, with LLM usage bounded to safe tasks.

## Evidence Or Reason
The entire safety model rests on a pricing-detection layer that the artifact itself admits has no validated false-positive or false-negative rates (listed under Unknowns & Evidence Gaps). A PRD that calls pricing approval 'mandatory' while simultaneously acknowledging the detection mechanism is unvalidated is making a structural promise it cannot yet keep. The artifact specifies no fallback for detection failures—no mention of confidence thresholds, human sampling of non-flagged messages, or a secondary check. If the detector misses commitment language (false negative), the 'strict human approval' guarantee silently fails and an unapproved price reaches the customer. If it over-flags (false positive), operator fatigue degrades the workflow benefit that justifies building the system. The PRD treats detection as a solved prerequisite rather than the highest-risk component requiring its own acceptance criteria, pilot design, and degradation strategy before Phase 1 scope can be considered ready.

