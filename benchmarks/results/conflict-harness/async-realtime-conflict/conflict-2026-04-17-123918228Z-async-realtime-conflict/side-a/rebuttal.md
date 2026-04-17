# Critique: finding-1

- Target Side: side_b
- Target Claim IDs: side_b-claim-1
- Attack Type: evidence_gap
- Severity: high

## Claim Under Attack
The requirement set should be rewritten to separate provisional real-time operational views from authoritative nightly reporting rather than forcing both guarantees into one pipeline.

## Evidence Or Reason
Side B asserts the separation resolves the conflict, but provides no evidence that stakeholders will accept a two-tier model where near-real-time dashboard values are explicitly demoted to 'provisional.' The original requirements state real-time updates within 2 seconds — not that those updates may differ from authoritative figures with no guaranteed correction window. If the business use case driving the 2-second requirement is operational decision-making (e.g., triggering alerts or interventions), provisional-labeled values that could be materially wrong until the next nightly run create a different but equally serious product risk. Side B names this gap in its own Unknowns section ('Whether stakeholders will accept provisional labels') yet still recommends the separation as the PRD's core decision — before that acceptance is confirmed. That is a premature prescriptive conclusion drawn without the evidence needed to support it.

