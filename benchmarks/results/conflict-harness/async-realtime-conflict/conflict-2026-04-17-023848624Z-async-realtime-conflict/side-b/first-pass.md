# PRD: Reporting Pipeline Consistency Resolution

## Summary
This PRD resolves a requirements conflict in the reporting pipeline specification. The current draft requires both near-immediate dashboard updates within 2 seconds of any event and nightly batch aggregation as the source of truth for all reporting. The scenario states these requirements are architecturally incompatible without a dual-write system, and that this consistency-risk approach has already been rejected. The product requirement should therefore prioritize a single authoritative reporting path and define any fast feedback surface as explicitly non-authoritative until a separate decision reopens architecture tradeoffs.

## Problem
The current requirements combine:
- real-time dashboard updates within 2 seconds of any event
- nightly batch aggregation as the source of truth for all reporting

The scenario packet states that satisfying both requires a dual-write system with consistency risk, and that this option has previously been rejected. As written, the PRD is internally inconsistent and not implementation-ready.

## Product Decision
The pipeline will use nightly batch aggregation as the only source of truth for reporting outputs. Any dashboard experience that needs faster visibility must be defined as a non-authoritative operational view and must not be described as reporting truth.

## Goals
- Preserve one authoritative reporting path.
- Remove architectural contradiction from the PRD.
- Enable implementation planning without reopening a previously rejected consistency-risk design.
- Make user-facing freshness semantics explicit.

## Non-Goals
- Reintroducing a dual-write architecture.
- Claiming sub-2-second freshness for authoritative reporting.
- Treating exploratory or operational views as equivalent to official reporting outputs.

## Requirements
1. Nightly batch aggregation is the authoritative source for all reporting.
2. Any interface showing fresher event activity must be labeled as provisional or operational, not source-of-truth reporting.
3. Metrics, exports, and downstream reporting consumers must use the nightly batch output.
4. The PRD must remove language that implies both sub-2-second reporting truth and nightly batch reporting truth simultaneously.
5. If stakeholders require authoritative sub-2-second reporting, that must be handled as a separate architecture decision with explicit review of the previously rejected consistency-risk tradeoff.

## User Impact
Users retain a consistent and auditable reporting source. If a fast dashboard surface is later added, users must understand that it is intended for rapid visibility rather than final reporting reconciliation.

## Risks
- Stakeholders may view the revised requirement as a reduction in responsiveness.
- Teams may reintroduce ambiguity by using "dashboard" and "reporting" interchangeably.
- A provisional fast view could be misused as an authoritative source unless labeling and downstream boundaries are explicit.

## Decision Frame
The decision is whether to preserve a single authoritative nightly reporting pipeline or force the PRD to require both immediate reporting updates and nightly truth despite the stated architectural conflict. The recommended choice is to preserve nightly batch aggregation as the sole reporting source of truth and rewrite the PRD so any fast surface is explicitly non-authoritative.

## Unknowns & Evidence Gaps
- The packet does not specify whether stakeholders actually need authoritative real-time reporting or only rapid operational visibility.
- The packet does not define which consumers are using the "dashboard" versus formal reporting outputs.
- The packet does not include acceptance language for how provisional views should be labeled or governed.
- The packet does not clarify whether the previously rejected architecture decision can be revisited.

## Pass/Fail Readiness
Pass if the team accepts one authoritative reporting source and rewrites the PRD to separate operational freshness from reporting truth.
Fail if the PRD continues to require both sub-2-second authoritative reporting and nightly authoritative reporting in the same pipeline.

## Recommended Next Artifact
A revised PRD addendum that explicitly separates:
- authoritative reporting data products
- optional non-authoritative operational dashboard views
- ownership of freshness semantics and labeling
- a decision log entry recording rejection of dual-write consistency risk for this feature
