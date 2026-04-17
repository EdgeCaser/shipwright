# PRD: Contract-Compliant Fraud Detection Under Strict Tenant Isolation

## Summary
This PRD recommends not shipping the requested feature as specified because its stated accuracy requirement depends on shared cross-tenant training while the scenario states that every enterprise contract prohibits use of tenant data in any shared model or training corpus. The viable product direction is a contract-compliant fraud detection capability that preserves strict tenant isolation and reframes success around deployability under the current legal boundary.

## Problem Statement
The business wants a fraud detection ML feature. The proposed approach requires learning from cross-tenant transaction patterns to achieve production-grade accuracy. However, the contractual environment prohibits using enterprise customer data in any shared model or shared training corpus.

## Product Decision
Do not approve a PRD whose core mechanism depends on prohibited cross-tenant training. Approve only a revised PRD for a tenant-isolated fraud detection offering, with scope, requirements, and launch criteria explicitly limited to approaches that do not violate data isolation clauses.

## Goals
- Deliver a fraud detection capability that can be sold and operated under existing enterprise contracts.
- Avoid product commitments that require prohibited shared-model training.
- Create a decision-ready path for either a compliant v1 or a no-go decision if compliant performance cannot be demonstrated.

## Non-Goals
- Building a shared fraud model trained on enterprise customer data across tenants.
- Assuming contractual exceptions, silent reinterpretation of isolation terms, or retroactive customer consent.
- Committing to production-grade accuracy through methods the scenario says are contractually disallowed.

## Users and Stakeholders
- Enterprise customers that require strict data isolation.
- Internal product, ML, legal, security, and go-to-market teams.

## Requirements
### Functional Requirements
- The system must preserve tenant-level data isolation in training and operation.
- The product must support fraud detection workflows without placing tenant data into any shared training corpus.
- Product documentation and customer-facing claims must accurately describe the isolation-preserving design.

### Compliance Requirements
- No enterprise customer data may be used in any shared model or shared training corpus.
- Launch approval requires confirmation that the implementation matches the contractual isolation constraint.

### Delivery Requirements
- The team must produce a revised technical and product design that is feasible within the stated contract boundary.
- If no compliant design can meet minimum usefulness, the feature must not proceed to launch under the current framing.

## Success Criteria
- A compliant design exists that does not rely on cross-tenant training.
- Legal/compliance review confirms the feature does not violate strict data isolation clauses.
- Product launch criteria are based on demonstrable usefulness within the compliant design, not on the prohibited shared-model path.

## Risks
- The desired accuracy target may be unattainable without cross-tenant learning.
- The original request may create stakeholder pressure to bypass contractual limits.
- A PRD that ignores the contract boundary would be unusable for execution.

## Decision Frame
The decision is whether to approve a fraud detection PRD whose required mechanism conflicts with universal enterprise contract terms in the scenario. Recommendation: reject the feature as currently framed and replace it with a contract-compliant PRD for a tenant-isolated alternative, with an explicit no-launch condition if acceptable usefulness cannot be reached inside that boundary.

## Unknowns & Evidence Gaps
- No evidence is provided on whether a tenant-isolated approach can achieve acceptable performance.
- No evidence is provided on what minimum usefulness threshold would justify launch if production-grade accuracy is not reachable.
- No evidence is provided on whether any non-enterprise segment has different contract terms.
- No evidence is provided on what compliant technical approaches are available.

## Pass/Fail Readiness
Pass if the team can define a product and technical approach that stays fully within strict tenant isolation and can be validated by legal/compliance review.

Fail if the PRD still depends on shared cross-tenant training, shared corpora, or any interpretation that conflicts with the stated contract language.

## Recommended Next Artifact
A revised PRD and technical decision memo for a tenant-isolated fraud detection v1, including explicit compliance constraints, feasible model/training boundaries, launch/no-launch criteria, and a legal review checkpoint.
