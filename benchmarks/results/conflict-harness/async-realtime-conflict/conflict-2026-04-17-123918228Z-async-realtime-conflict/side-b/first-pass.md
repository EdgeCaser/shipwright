# PRD: Split Operational Freshness From Authoritative Reporting

## Decision Frame
This feature should not be specified as a single pipeline with both sub-2-second authoritative updates and nightly batch as the sole source of truth. The product requirement should instead define two output classes:

- An operational dashboard view that updates within 2 seconds of event arrival and is explicitly labeled provisional.
- Authoritative reporting outputs generated from the nightly batch aggregation.

This keeps the user-facing freshness goal while avoiding a design that depends on a previously rejected dual-write consistency pattern.

## Product Requirement
### Goal
Enable fast visibility into new events without redefining the authoritative reporting model.

### Non-Goals
- Making real-time dashboard values the source of truth for reporting.
- Introducing a dual-write architecture to keep real-time and batch stores synchronized as co-equal authorities.
- Hiding expected differences between provisional operational metrics and authoritative nightly metrics.

### User Problem
Users need near-immediate visibility into incoming events for monitoring and operational response. At the same time, reporting requires a stable authoritative source that is produced through nightly aggregation. The current requirement set collapses these into one pipeline contract, which creates an implementation conflict.

### Proposed Requirement Language
1. The system shall provide dashboard updates within 2 seconds of event ingestion for operational monitoring use cases.
2. The system shall designate nightly batch aggregation as the authoritative source of truth for reporting, exports, and any metric used for formal business review.
3. Any operational dashboard metric derived before nightly reconciliation shall be labeled provisional.
4. The system shall define which surfaces show provisional values and which surfaces show authoritative values.
5. The system shall provide a clear reconciliation experience when provisional and authoritative values differ.

### Rationale
The conflicting requirement is not resolved by forcing both guarantees into one pipeline contract. It is resolved by separating freshness from authority at the product level. That gives engineering a viable implementation target and gives stakeholders a clearer expectation model.

### Acceptance Criteria
- Dashboard surfaces intended for operational monitoring receive event-driven updates within 2 seconds.
- Reporting surfaces, scheduled exports, and formal aggregates read from nightly batch outputs only.
- Product copy and interface labeling distinguish provisional operational data from authoritative reporting data.
- The PRD identifies the exact downstream consumers assigned to each data class.
- The implementation does not require dual-write synchronization between two authoritative stores.

## Unknowns & Evidence Gaps
- Which existing dashboard surfaces are expected to be operational versus authoritative.
- Whether stakeholders will accept provisional labels on near-real-time metrics.
- What reconciliation behavior is required when users compare dashboard and report values after the nightly run.
- Whether any current consumers implicitly assume a single metric definition across both monitoring and reporting contexts.

## Pass/Fail Readiness
Pass if:
- Stakeholders agree that operational freshness and reporting authority are separate product contracts.
- The team confirms the design avoids the previously rejected consistency-risk pattern.
- The PRD enumerates affected surfaces and assigns each to provisional or authoritative data.

Fail if:
- The requirement still demands one pipeline to satisfy both real-time authority and nightly batch authority simultaneously.
- The feature depends on dual-write or equivalent cross-store synchronization to mask the conflict.
- The PRD leaves user-facing discrepancy handling undefined.

## Recommended Next Artifact
A revised PRD addendum that includes:
- Surface-by-surface classification of provisional versus authoritative outputs.
- User-facing labeling and reconciliation rules.
- An architecture decision record confirming rejection of dual-write and documenting the selected separation of concerns.
