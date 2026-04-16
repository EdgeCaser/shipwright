# Revised artifact

# PRD: Event Reporting Pipeline Decision-Ready Revision

## Problem
The current specification requires both:
- real-time dashboard updates within 2 seconds of any event
- nightly batch aggregation as the source of truth for all reporting

Per the scenario, these requirements are architecturally incompatible without a dual-write or dual-truth pattern that the team has previously rejected because of consistency risk.

## Product Goal
Provide fast operational visibility while preserving a single authoritative reporting layer.

## Proposed Product Direction
This PRD does not treat the original conflict as resolved. It recommends a stakeholder decision: either explicitly separate operational real-time views from authoritative reporting, or remove one of the conflicting requirements.

## Recommended Requirement Rewrite
If stakeholders approve the recommended direction, the requirement set should be rewritten as follows:
- Operational dashboards display provisional event activity within 2 seconds for at least 95% of successfully ingested events.
- Nightly batch aggregation remains the sole source of truth for official reporting, exports, finance-sensitive metrics, and historical analysis.
- Provisional dashboard metrics must be labeled as non-authoritative until nightly reconciliation completes.
- The product must expose freshness, reconciliation state, and any detected drift between provisional and authoritative values.
- The system must not implement dual-write of authoritative business metrics.

## Users
- Operators monitoring live activity
- Managers reviewing daily performance
- Analysts consuming trusted reports

## Functional Requirements
- Support low-latency operational visibility only if stakeholders approve provisional semantics.
- Preserve batch-generated outputs as the only authoritative reporting layer.
- Record and surface reconciliation drift between provisional and batch values.
- Ensure finalized reports always display batch-derived values.

## Non-Functional Requirements
- Avoid architectures that recreate the previously rejected consistency-risk pattern.
- Failures in the low-latency path must not block batch truth generation.
- UI must distinguish provisional versus authoritative states clearly enough to reduce misuse.

## Success Metrics
- 95% of approved operational dashboard events visible within 2 seconds.
- 100% of official reports generated from nightly batch outputs.
- Reconciliation drift tracked and kept within an agreed threshold for any provisional metric shown.
- Fewer support or stakeholder complaints caused by dashboard-versus-report confusion.

## Out of Scope
- Making both sub-2-second and nightly outputs simultaneously authoritative for the same metrics.
- Real-time finance, compliance, or historical reporting.
- Reintroducing a dual-write consistency model previously rejected by the team.

## Risks
- Stakeholders may reject provisional semantics and continue to demand conflicting outcomes.
- Users may still misread operational data as final unless labeling is explicit.
- Some metric classes may be unsuitable for provisional display even with reconciliation.

## Decision Frame
The decision required is not whether to implement both original requirements as written; that path is blocked by an already rejected architectural pattern in the scenario. The decision is whether stakeholders will approve a split-purpose model in which real-time data is operational and provisional, while nightly batch remains authoritative. If they do not approve that reframing, the PRD should fail and the requirements must be renegotiated before build begins.

## Unknowns & Evidence Gaps
- Whether the business owner accepts provisional real-time dashboards as satisfying the original intent.
- Which metric families can safely appear before reconciliation.
- Whether the 2-second SLA is needed for all events or only operationally critical subsets.
- What reconciliation drift threshold is acceptable before a dashboard becomes misleading.

## Pass/Fail Readiness
Pass only if stakeholders explicitly approve revised semantics that separate provisional operational visibility from authoritative reporting. Fail if any approver insists that the same metrics must be both sub-2-second and authoritative without accepting the associated consistency-risk architecture.

## Recommended Next Artifact
A requirements decision memo for stakeholder sign-off that records one of two outcomes: approval of the provisional-versus-authoritative split, or removal/reprioritization of one of the conflicting requirements.
