# PRD: Reconciled Event Reporting Pipeline

## Problem
The current requirements ask for dashboard updates within 2 seconds of any event while also declaring nightly batch aggregation as the source of truth for all reporting. In the current architecture, those goals conflict because meeting both would require a dual-write or dual-truth pattern that the team has already rejected due to consistency risk.

## Product Goal
Provide fast operational visibility without compromising the integrity of official reporting.

## Decision
Treat sub-2-second dashboard updates as a provisional operational view and treat nightly batch aggregation as the authoritative reporting layer.

## Users
- Operators monitoring live system activity
- Managers reviewing daily and historical performance
- Analysts consuming trusted reporting outputs

## Requirements
### Functional
- Events must appear in the operational dashboard within 2 seconds for at least 95% of successfully ingested events.
- The operational dashboard must be explicitly labeled as provisional and may differ from finalized reporting until nightly reconciliation completes.
- Nightly batch aggregation remains the sole source of truth for official reporting, exports, finance-sensitive metrics, and historical trend analysis.
- A reconciliation job must compare provisional event counts with nightly aggregated counts and surface drift metrics.
- If provisional and batch values differ, finalized reporting must always display batch-derived values.
- Metric definitions used in the dashboard and batch layer must share a common semantic contract where possible, even if execution paths differ.

### Non-Functional
- The design must avoid dual-write of authoritative business metrics.
- The system must expose freshness and reconciliation status in the UI.
- Failures in the low-latency path must not block batch truth generation.

## Success Metrics
- 95% of operational dashboard updates visible within 2 seconds of ingestion.
- 100% of official reports generated from nightly batch outputs.
- Reconciliation drift below an agreed threshold for stable metric classes.
- Reduction in user confusion, measured by support tickets related to dashboard-versus-report mismatch.

## Out of Scope
- Real-time financial close or compliance reporting.
- Replacing nightly batch as the authoritative historical store.
- Any architecture that depends on previously rejected dual-write consistency patterns.

## Risks
- Users may misread provisional dashboard values as final.
- Some metrics may be unsuitable for low-latency approximation.
- Reconciliation drift may create trust issues unless clearly explained in product UX.

## Decision Frame
The feature should be approved only as a split-purpose pipeline: low-latency views for operations, nightly batch outputs for truth. The conflicting original requirement should be rewritten, not implemented literally.

## Unknowns & Evidence Gaps
- Which metric families are safe to expose provisionally before batch reconciliation.
- Acceptable reconciliation drift thresholds by stakeholder group.
- Whether 2-second latency is required for all events or only a subset of operationally meaningful ones.
- What UX language best prevents users from treating provisional metrics as final.

## Pass/Fail Readiness
Pass if stakeholders accept a two-tier model with explicit provisional versus authoritative semantics and remove the requirement that both outputs represent the same truth at the same time. Fail if stakeholders insist that sub-2-second updates and nightly batch outputs must both be authoritative for the same metrics without architectural risk tradeoffs.

## Recommended Next Artifact
A revised architecture decision memo and requirements addendum that defines metric tiers, authority rules, reconciliation behavior, UI labeling, and acceptance criteria for provisional versus authoritative outputs.
