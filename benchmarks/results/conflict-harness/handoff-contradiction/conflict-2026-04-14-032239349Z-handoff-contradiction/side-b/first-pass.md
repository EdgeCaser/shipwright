# Technical Handoff PRD: Platform Migration & Consolidation

## Decision Frame

**Context:** The platform team is handing off a partially-completed migration from a monolithic API gateway to a federated service mesh. The prior phase delivered authentication federation and rate-limiting at the edge, but left three services on the legacy gateway with conflicting documentation about their migration readiness.

**Decision to be made:** Should the receiving team proceed with migrating the remaining three services (Billing, Notifications, Audit Log) to the federated mesh in Q3, or should they stabilize the hybrid state and defer migration to Q4?

**Stakeholders:**
- Platform Engineering (handoff source): completed Phase 1, transitioning focus to infrastructure cost optimization
- Product Infrastructure (handoff target): will own ongoing migration and operational support
- Security & Compliance: requires consistent auth posture across all services by EOY
- Finance: Billing service freeze window Oct 1–Nov 15 constrains scheduling

**Cross-Document Contradictions Identified:**

The following contradictions exist across the platform strategy document, the challenge review findings, and the Phase 1 completion report. These must be resolved before committing to a migration timeline:

| # | Contradiction | Source A | Source B | Impact |
|---|---|---|---|---|
| C1 | Billing service readiness | Platform strategy marks Billing as "mesh-ready, no blockers" | Challenge review identifies 3 undocumented synchronous DB calls that violate mesh timeout policy | **Critical** — migrating Billing without resolving this causes cascading timeout failures |
| C2 | Auth token format | Phase 1 report states "all services migrated to JWT-based auth" | Audit Log service still issues opaque session tokens per its own API spec v2.3 | **High** — hybrid token handling adds attack surface and operational complexity |
| C3 | Traffic routing | Platform strategy specifies "zero-downtime blue-green cutover" | Challenge review notes the Notifications service has no health-check endpoint, making blue-green impossible | **Medium** — requires either adding health checks or using a canary strategy instead |

## Unknowns & Evidence Gaps

### Hard Unknowns (cannot proceed without answers)

1. **Billing synchronous call inventory** — The challenge review flagged 3 synchronous DB calls but did not enumerate them. The receiving team needs a complete call graph for the Billing service's critical payment path before estimating refactoring effort. *Evidence needed: distributed trace capture of 1 week of production Billing traffic.*

2. **Audit Log token migration scope** — It is unknown whether the opaque session tokens are used only internally or are also exposed to external compliance integrations (SOC 2 audit trail exports). If external, migration requires partner notification and a deprecation window. *Evidence needed: API consumer inventory from the Audit Log team.*

### Soft Unknowns (can proceed with risk acceptance)

3. **Notifications service SLA under mesh** — No load testing has been performed for the Notifications service behind the mesh's sidecar proxy. Latency overhead is estimated at 2-8ms but unvalidated. *Evidence needed: synthetic load test at 2x peak traffic.*

4. **Legacy gateway decommission timeline** — Platform strategy says "decommission after full migration" but does not define a keep-alive period for rollback. If rollback window is 30 days, the hybrid operational cost is ~$14K/month. *Evidence needed: platform team to specify rollback SLA.*

5. **Team capacity for Q3** — The receiving team's Q3 allocation assumes 2 senior engineers dedicated to migration. If the infrastructure cost optimization initiative (platform team's new focus) generates urgent shared-infrastructure work, this allocation is at risk. *Evidence needed: confirmed Q3 staffing plan from engineering leadership.*

## Pass/Fail Readiness

### Gate Criteria Assessment

| Gate | Status | Rationale |
|---|---|---|
| Authentication consistency | **FAIL** | Contradiction C2 unresolved — Audit Log still uses opaque tokens. Cannot meet Security & Compliance EOY requirement without a migration plan for this service. |
| Data integrity under migration | **FAIL** | Contradiction C1 unresolved — Billing synchronous calls not inventoried. Risk of payment processing failures during cutover is unacceptable without mitigation. |
| Deployment safety | **CONDITIONAL PASS** | Contradiction C3 is resolvable — Notifications can use canary deployment instead of blue-green. Requires updating runbooks but not architectural changes. |
| Operational readiness | **CONDITIONAL PASS** | Receiving team has mesh operational experience from Phase 1 services. Gap: no runbook exists for the hybrid state (some services on mesh, some on legacy gateway). |
| Rollback capability | **FAIL** | No defined rollback SLA or tested rollback procedure. Legacy gateway preservation cost and duration unspecified. |

**Overall Readiness: NOT READY for Q3 migration start.**

The three FAIL gates require resolution before the handoff is complete. Two are driven directly by cross-document contradictions (C1, C2), and one by an evidence gap (rollback SLA). The receiving team should not accept the handoff until these are resolved.

### Recommended Sequencing if Gates Are Cleared

If contradictions are resolved by mid-Q3:
1. **Notifications** first (lowest risk, canary-compatible, no billing freeze constraint)
2. **Audit Log** second (after token migration plan is executed)
3. **Billing** last (after synchronous call refactoring, before Oct 1 freeze window)

## Recommended Next Artifact

**Artifact: Contradiction Resolution Tracker + Revised Migration Runbook**

Before the handoff can proceed, produce:

1. **Contradiction Resolution Tracker** — A single document that takes each of the three contradictions (C1–C3) and records: the ground truth (verified by the platform team), the corrective action, the owner, and the target resolution date. This replaces the conflicting statements across the three source documents with a single authoritative record.

2. **Revised Migration Runbook** — Updated to reflect the actual service states (not the aspirational states in the platform strategy), including:
   - Billing: synchronous call refactoring tasks and acceptance criteria
   - Audit Log: token migration plan with external partner notification timeline
   - Notifications: canary deployment procedure (replacing blue-green)
   - Hybrid-state operational procedures for the transition period
   - Rollback SLA and tested rollback procedures

3. **Handoff Acceptance Checklist** — A gate-by-gate sign-off document that both teams execute together, with each gate requiring evidence (not just assertion) of readiness.

**Target completion: 3 weeks from handoff initiation.** The receiving team should not commit to Q3 migration dates until the Contradiction Resolution Tracker shows all three items resolved with evidence.
