# Critique: finding-1

- Target Side: side_b
- Target Claim IDs: side_b-claim-1
- Attack Type: evidence_gap
- Severity: high

## Claim Under Attack
Because the case provides no concrete churn evidence, the PRD should not prescribe a broad retention feature and should first require a bounded churn diagnostic sprint.

## Evidence Or Reason
This claim treats absence of evidence in the case packet as evidence that no action should be taken, conflating an artifact constraint with a product recommendation. The prompt asks to 'write a churn reduction PRD when signals conflict with strategy targets' — the conflicting signals ARE the scenario, not a gap to route around. By deferring all commitments to a future diagnostic sprint, Side B produces a discovery plan rather than a PRD, failing to demonstrate how a product team should make tradeoff decisions under signal conflict. A stronger PRD would acknowledge uncertainty while still committing to decision criteria, fallback interventions, and conditional launch paths — showing how to act despite ambiguity rather than how to avoid acting until ambiguity is resolved. The repeated [ctx-1] citations all reference the same absence-of-data observation, giving an illusion of evidence discipline while actually anchoring every major decision on a single meta-observation about the prompt's constraints.

