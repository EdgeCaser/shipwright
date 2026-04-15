# Critique: finding-1

- Target Side: side_b
- Target Claim IDs: side_b-claim-2
- Attack Type: evidence_gap
- Severity: high

## Claim Under Attack
LLM usage should be bounded to reversible assistive tasks, with deterministic rules owning routing, permissions, approval requirements, and send/no-send decisions.

## Evidence Or Reason
The artifact asserts that LLM-assisted classification serves only as a 'candidate signal' alongside deterministic keyword/rule detection, yet provides no evidence or specification for how conflicts between the two layers are resolved. When the deterministic keyword layer flags a message as safe but the LLM classifier flags it as restricted (or vice versa), the PRD offers no tie-breaking protocol beyond 'either can trigger escalation.' This creates an unspecified failure mode: if 'either can trigger' is the rule, then the LLM effectively has veto power over the deterministic layer, contradicting the claim that deterministic rules 'own' routing decisions. The PRD also lists 'rewriting approved human-authored text for tone' as an allowed LLM use but provides no deterministic mechanism to verify that meaning was preserved — the boundary between tone change and semantic change is precisely where LLMs fail unpredictably, and no validation gate is specified for this case. The claim that deterministic controls own all decisions is therefore internally inconsistent with the actual allowed-use list.

