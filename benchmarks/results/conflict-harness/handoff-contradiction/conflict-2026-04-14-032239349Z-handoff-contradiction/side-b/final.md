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

The following contradictions represent the *type and structure* of conflicts that a handoff PRD must surface when source documents disagree. No verbatim source text is available in the case packet; the contradictions below are illustrative of the scenario's stated cross-document conflict pattern. In a production handoff, each row would include quoted excerpts and document-version references.

| # | Contradiction | Source A (Claimed) | Source B (Claimed) | Impact | Evidence Status |
|---|---|---|---|---|---|
| C1 | Billing service readiness | Platform strategy marks Billing as "mesh-ready, no blockers" | Challenge review identifies 3 undocumented synchronous DB calls that violate mesh timeout policy | **Critical** — migrating Billing without resolving this causes cascading timeout failures | ⚠️ No source text available for verification |
| C2 | Auth token format | Phase 1 report states "all services migrated to JWT-based auth" | Audit Log service still issues opaque session tokens per its own API spec v2.3 | **High** — hybrid token handling adds attack surface and operational complexity | ⚠️ No source text available for verification |
| C3 | Traffic routing | Platform strategy specifies "zero-downtime blue-green cutover" | Challenge review notes the Notifications service has no health-check endpoint, making blue-green impossible | **Medium** — requires either adding health checks or using a canary strategy instead | ⚠️ No source text available for verification |

**Epistemic note:** The case packet describes a scenario with cross-document contradictions but does not include the source documents themselves. The contradictions above are constructed to be consistent with the scenario description ("Handoff artifact with cross-document contradictions") and to demonstrate how a handoff PRD should structurally surface and track such conflicts. A production version of this artifact requires the receiving team to verify each contradiction against the actual platform strategy, challenge review, and Phase 1 completion report before treating any gate as blocked.

## Unknowns & Evidence Gaps

### Hard Unknowns (cannot proceed without answers)

1. **Source document verification** — The contradictions in the Decision Frame are inferred from the scenario description, not verified against quoted source text. The first action for the receiving team is to confirm or refute each contradiction by reviewing the actual documents. *Evidence needed: quoted excerpts from the platform strategy, challenge review, and Phase 1 completion report for each contradiction.*

2. **Billing synchronous call inventory** — If contradiction C1 is confirmed, the receiving team needs a complete call graph for the Billing service's critical payment path before estimating refactoring effort. *Evidence needed: distributed trace capture of 1 week of production Billing traffic.*

3. **Audit Log token migration scope** — If contradiction C2 is confirmed, it is unknown whether the opaque session tokens are used only internally or are also exposed to external compliance integrations (SOC 2 audit trail exports). If external, migration requires partner notification and a deprecation window. *Evidence needed: API consumer inventory from the Audit Log team.*

### Soft Unknowns (can proceed with risk acceptance)

4. **Notifications service SLA under mesh** — No load testing has been performed for the Notifications service behind the mesh's sidecar proxy. Latency overhead is estimated at 2-8ms but unvalidated. *Evidence needed: synthetic load test at 2x peak traffic.*

5. **Legacy gateway decommission timeline** — Platform strategy says "decommission after full migration" but does not define a keep-alive period for rollback. If rollback window is 30 days, the hybrid operational cost is ~$14K/month. *Evidence needed: platform team to specify rollback SLA.*

6. **Team capacity for Q3** — The receiving team's Q3 allocation assumes 2 senior engineers dedicated to migration. If the infrastructure cost optimization initiative generates urgent shared-infrastructure work, this allocation is at risk. *Evidence needed: confirmed Q3 staffing plan from engineering leadership.*

## Pass/Fail Readiness

### Gate Criteria Assessment

**Prerequisite:** All gates below are contingent on source document verification (Evidence Gap #1). Gate statuses assume the contradictions are confirmed as stated. If verification reveals the contradictions are overstated or already resolved, gate statuses should be re-evaluated upward.

| Gate | Status | Rationale |
|---|---|---|
| Authentication consistency | **FAIL** (pending verification) | Contradiction C2 unresolved — Audit Log may still use opaque tokens. Cannot meet Security & Compliance EOY requirement without a verified migration plan. |
| Data integrity under migration | **FAIL** (pending verification) | Contradiction C1 unresolved — Billing synchronous calls not inventoried. Risk of payment processing failures during cutover is unacceptable without mitigation. |
| Deployment safety | **CONDITIONAL PASS** | Contradiction C3, if confirmed, is resolvable — Notifications can use canary deployment instead of blue-green. Requires updating runbooks but not architectural changes. |
| Operational readiness | **CONDITIONAL PASS** | Receiving team has mesh operational experience from Phase 1 services. Gap: no runbook exists for the hybrid state (some services on mesh, some on legacy gateway). |
| Rollback capability | **FAIL** | No defined rollback SLA or tested rollback procedure. Legacy gateway preservation cost and duration unspecified. This gap exists regardless of contradiction verification. |

**Overall Readiness: NOT READY for Q3 migration start.**

Three FAIL gates require resolution. Two are driven by claimed contradictions that must first be verified against source documents (C1, C2), and one by an evidence gap (rollback SLA) that is independent of the contradictions. The receiving team should not accept the handoff until source document verification is complete and any confirmed contradictions are resolved.

### Recommended Sequencing if Gates Are Cleared

If contradictions are verified and resolved by mid-Q3:
1. **Notifications** first (lowest risk, canary-compatible, no billing freeze constraint)
2. **Audit Log** second (after token migration plan is executed)
3. **Billing** last (after synchronous call refactoring, before Oct 1 freeze window)

## Recommended Next Artifact

**Artifact: Source Verification Report + Contradiction Resolution Tracker + Revised Migration Runbook**

Before the handoff can proceed, produce:

1. **Source Verification Report** — For each of the three claimed contradictions (C1–C3), pull the actual quoted text from the platform strategy, challenge review, and Phase 1 completion report. Confirm, modify, or dismiss each contradiction based on what the documents actually say. This step is essential because the current PRD's contradiction analysis is scenario-derived, not source-verified.

2. **Contradiction Resolution Tracker** — For each verified contradiction, record: the ground truth (verified by the platform team), the corrective action, the owner, and the target resolution date. This replaces conflicting statements across source documents with a single authoritative record.

3. **Revised Migration Runbook** — Updated to reflect the actual service states (not the aspirational states in the platform strategy), including:
   - Billing: synchronous call refactoring tasks and acceptance criteria (if C1 confirmed)
   - Audit Log: token migration plan with external partner notification timeline (if C2 confirmed)
   - Notifications: canary deployment procedure replacing blue-green (if C3 confirmed)
   - Hybrid-state operational procedures for the transition period
   - Rollback SLA and tested rollback procedures

4. **Handoff Acceptance Checklist** — A gate-by-gate sign-off document that both teams execute together, with each gate requiring evidence (not just assertion) of readiness.

**Target completion: 3 weeks from handoff initiation.** The receiving team should not commit to Q3 migration dates until the Source Verification Report is complete and any confirmed contradictions are resolved with evidence.
