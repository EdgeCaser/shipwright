# Revised artifact

## Summary
This PRD should not be treated as implementation-ready in its current form because it specifies both sub-2-second dashboard updates for any event and nightly batch aggregation as the source of truth for all reporting, while also stating that satisfying both would require a dual-write approach with consistency risk that has previously been rejected. The immediate product requirement is to remove the contradiction and force an explicit decision on authoritative freshness semantics before delivery planning.

## Problem
The current requirements conflict:
- real-time dashboard updates within 2 seconds of any event
- nightly batch aggregation as the source of truth for all reporting

The case packet states these are architecturally incompatible without a dual-write system, and that this option has already been rejected. As written, the PRD contains unresolved product and architecture conflict.

## Product Decision
The PRD should designate nightly batch aggregation as the authoritative source for reporting unless stakeholders explicitly reopen the architecture decision and accept the associated consistency-risk tradeoff. Any faster dashboard surface, if retained in scope, should be framed as a non-authoritative operational view pending stakeholder confirmation that this satisfies the need.

## Goals
- Eliminate the contradiction in reporting requirements.
- Preserve internal consistency between product requirements and stated architectural constraints.
- Make implementation readiness contingent on a clear decision about authoritative reporting freshness.
- Prevent ambiguous use of dashboard and reporting language.

## Non-Goals
- Reintroducing dual-write implicitly.
- Treating unresolved stakeholder needs as settled.
- Claiming authoritative sub-2-second reporting without an explicit architecture decision.

## Requirements
1. The PRD must not state both sub-2-second authoritative reporting and nightly batch authoritative reporting for the same pipeline.
2. Nightly batch aggregation remains the default authoritative reporting path unless a separate decision explicitly reopens the rejected dual-write tradeoff.
3. Any fast dashboard experience included in scope must be labeled as operational or non-authoritative unless stakeholders explicitly require otherwise.
4. Metrics, exports, and downstream reporting consumers must align to the authoritative reporting path named in the PRD.
5. If stakeholders require authoritative real-time reporting, the team must pause PRD finalization and open a separate architecture and decision review.

## User Impact
This approach preserves a clear source of truth for reporting while keeping open the possibility of a faster operational surface. It does not assume that a non-authoritative fast view is sufficient; that point requires stakeholder confirmation.

## Risks
- Stakeholders may reject a non-authoritative fast dashboard if they actually need authoritative real-time reporting.
- Teams may continue to blur dashboard and reporting terminology, recreating ambiguity.
- The feature may stall if the unresolved requirement conflict is not escalated into an explicit decision.

## Decision Frame
The decision is not simply how to word the PRD; it is whether the team will keep one authoritative nightly reporting pipeline or reopen a previously rejected approach in order to support authoritative real-time reporting. The recommended path is to rewrite the PRD around nightly batch as the default authoritative reporting source and treat any fast dashboard concept as conditional on stakeholder confirmation unless leadership explicitly reopens the architecture tradeoff.

## Unknowns & Evidence Gaps
- Whether stakeholders need authoritative real-time reporting or only fast operational visibility.
- Whether a non-authoritative dashboard would satisfy the intended user need.
- Which consumers and decisions depend on the dashboard versus formal reporting outputs.
- Whether the prior rejection of the dual-write approach is final for this feature scope.

## Pass/Fail Readiness
Pass if the team resolves the contradiction by naming one authoritative reporting path and explicitly documenting whether any fast surface is operational-only or whether architecture review must be reopened.
Fail if the PRD continues to require both real-time authoritative updates and nightly authoritative truth in the same pipeline without resolving the rejected consistency-risk conflict.

## Recommended Next Artifact
A PRD addendum or decision memo that does three things:
- names the authoritative reporting source
- records whether a fast dashboard is operational-only or insufficient for stakeholder needs
- captures whether the previously rejected dual-write tradeoff remains closed or is being formally reconsidered
