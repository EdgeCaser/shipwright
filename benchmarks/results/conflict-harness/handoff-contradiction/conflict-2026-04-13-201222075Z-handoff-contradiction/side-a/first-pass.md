# Technical Handoff PRD: Platform Migration to Unified Service Layer

## Decision Frame

**Context:** The platform team is migrating from a monolithic API gateway to a unified service layer. This handoff PRD captures the technical state, outstanding decisions, and readiness assessment to transfer ownership from the architecture team to the platform engineering team.

**Decision to be made:** Should the platform engineering team accept this handoff and proceed to implementation sprint planning, or are there unresolved contradictions and evidence gaps that require resolution first?

**Stakes:** Accepting a handoff with unresolved cross-document contradictions risks building against conflicting requirements. The platform strategy doc specifies eventual consistency as the data model, while the challenge review flagged strong consistency requirements for the payments subsystem. These cannot both be true without explicit boundary definitions.

**Key Contradictions Identified:**

1. **Consistency model conflict:** Platform strategy (Section 4.2) mandates eventual consistency across all service boundaries. Challenge review (Finding CR-7) identifies payment state transitions requiring strong consistency with ACID guarantees. No reconciliation document exists.

2. **Latency budget conflict:** Platform strategy allocates 200ms p99 budget per service hop. Challenge review measured current p99 at 340ms for the auth→payment→ledger chain and flagged this as a blocker. The strategy document does not acknowledge this measurement.

3. **API versioning conflict:** Platform strategy specifies URL-based versioning (/v2/). Challenge review recommends header-based versioning to avoid routing complexity. No decision record exists resolving this.

## Unknowns & Evidence Gaps

| ID | Unknown | Impact | Evidence Needed | Current State |
|----|---------|--------|-----------------|---------------|
| UG-1 | Which services require strong consistency boundaries? | Architectural — wrong choice causes data loss or performance degradation | Service-by-service consistency requirements audit | No audit exists; strategy assumes uniform eventual consistency |
| UG-2 | What is the actual latency budget after auth chain overhead? | Feasibility — may invalidate the 200ms hop budget | Load test results under production-equivalent traffic | Challenge review has partial measurements; no full load test |
| UG-3 | Has the API versioning approach been decided? | Developer experience, routing complexity, client migration cost | ADR (Architecture Decision Record) with trade-off analysis | Two contradictory recommendations exist with no resolution |
| UG-4 | What is the rollback plan if the unified service layer degrades payment processing? | Operational safety | Runbook with rollback triggers and procedures | Not authored |
| UG-5 | Are downstream consumers aware of the consistency model change? | Integration risk | Consumer impact assessment | No assessment conducted |

## Pass/Fail Readiness

**Overall Assessment: FAIL — Do Not Accept Handoff**

| Criterion | Status | Rationale |
|-----------|--------|-----------|
| Cross-document consistency | FAIL | Three material contradictions between platform strategy and challenge review remain unresolved (consistency model, latency budget, API versioning) |
| Evidence completeness | FAIL | No load test data validating latency assumptions; no consistency requirements audit |
| Rollback safety | FAIL | No rollback runbook for payment-critical path |
| Stakeholder alignment | FAIL | No evidence that downstream consumers have been consulted on consistency model changes |
| Scope clarity | PASS | Service boundaries and migration scope are well-defined in both documents |
| Technical specification depth | PASS | API contracts, schema definitions, and deployment topology are sufficiently detailed for implementation |

**Blocking items that must be resolved before re-evaluation:**

1. Publish an ADR resolving the consistency model conflict — define explicit strong-consistency boundaries for payment-critical services within the eventual-consistency architecture
2. Complete load testing to validate or revise the 200ms p99 latency budget
3. Resolve API versioning approach in a single decision record
4. Author rollback runbook for the payment processing path

## Recommended Next Artifact

**Artifact:** Architecture Decision Record (ADR) — "Consistency Boundaries in Unified Service Layer"

**Why this artifact next:** The consistency model contradiction is the highest-impact unresolved conflict. It affects data integrity guarantees, service boundary design, and the feasibility of the latency budget. Resolving this single contradiction will likely cascade into resolving or reframing the latency and versioning conflicts.

**Scope of the ADR:**
- Enumerate services requiring strong consistency (with evidence from domain analysis)
- Define the boundary protocol between strong and eventual consistency zones
- State the accepted latency cost of strong consistency where required
- Document the decision process and participants

**After the ADR:** Re-run the challenge review against the updated platform strategy to verify contradiction resolution, then re-evaluate handoff readiness. Expected timeline to re-evaluation: 1-2 sprints depending on load test infrastructure availability.
