# Technical Handoff PRD: Platform Migration Service

## Decision Frame

**Context:** The platform team is handing off the Migration Service (MS) to the Infrastructure team. This PRD captures the current state, known contradictions across existing documentation, and readiness criteria for the receiving team to assume ownership.

**Decision to be made:** Should Infrastructure accept ownership of the Migration Service in its current state, or must specific preconditions be met first?

**Stakeholders:**
- Platform team (current owner, handing off)
- Infrastructure team (receiving owner)
- Product Engineering (dependent consumer)
- SRE (operational responsibility post-handoff)

**Key tension:** Cross-document contradictions exist between the platform strategy doc, the challenge review findings, and the service's own technical spec. These must be explicitly surfaced and resolved — not papered over — before handoff completes.

### Contradictions Identified

| # | Document A | Document B | Contradiction | Impact |
|---|-----------|-----------|---------------|--------|
| C-1 | Platform Strategy (§3.2): "All services must migrate to gRPC by Q3" | Challenge Review (Finding 7): "MS REST endpoints are the only stable integration surface; gRPC migration introduces unacceptable risk" | Direct conflict on transport protocol direction | Receiving team cannot plan API work without resolution |
| C-2 | Technical Spec (§5.1): "MS supports eventual consistency with 30s propagation" | Platform Strategy (§4.4): "All platform services must guarantee strong consistency for state mutations" | Consistency model mismatch | Receiving team inherits a service that violates stated platform requirements |
| C-3 | Challenge Review (Recommendation 2): "Freeze MS feature work for 2 sprints to pay down tech debt" | Platform Strategy (§6.1): "Migration Service must support multi-region by end of Q3" | Timeline conflict between debt paydown and feature delivery | Receiving team faces impossible scheduling without explicit priority call |

## Unknowns & Evidence Gaps

1. **Load profile under multi-region:** No load testing has been conducted for cross-region replication scenarios. The platform strategy assumes MS can handle this; the challenge review flagged single-region as a hard architectural constraint today. *Evidence needed:* Load test results with simulated cross-region latency (minimum 2-week effort).

2. **Actual consumer dependency map:** Platform strategy references "3 dependent services." Challenge review references "5+ consumers including undocumented internal tools." *Evidence needed:* Traffic analysis from service mesh telemetry to produce ground-truth dependency graph.

3. **Consistency requirement source:** The strong consistency mandate in the platform strategy has no linked customer requirement or incident. It may be aspirational rather than load-bearing. *Evidence needed:* Trace the requirement to a customer commitment, SLA, or incident post-mortem — or downgrade it.

4. **Ownership of contradiction resolution:** No single decision-maker is named across the three source documents. *Evidence needed:* RACI designation for architectural decisions affecting MS post-handoff.

5. **Runbook completeness:** Challenge review noted "runbooks are outdated" but did not enumerate which ones. Receiving team cannot assess operational readiness without a gap analysis. *Evidence needed:* SRE audit of existing runbooks against current alert inventory.

6. **Authoritative acceptance criteria:** No pre-existing, stakeholder-ratified handoff acceptance gate exists for this transfer. The readiness criteria in this PRD are proposed, not inherited from an existing governance process. *Evidence needed:* Stakeholder agreement on which criteria are blocking vs. advisory before using them to gate the handoff.

## Pass/Fail Readiness

**Note on authority:** The criteria below are *proposed* by this PRD as a reasonable acceptance gate based on the contradictions and evidence gaps surfaced above. They have not yet been ratified by the receiving team, platform team, or SRE leadership. Before these criteria can gate the handoff, stakeholders must agree on which are hard-blocking and which are advisory.

| Criterion | Status | Evidence | Notes |
|-----------|--------|----------|-------|
| All three contradictions (C-1, C-2, C-3) have a documented resolution with decision-maker sign-off | **FAIL** | No resolution documents exist | Blocking: contradictions create incompatible direction for receiving team |
| Dependency map is validated against live traffic data | **FAIL** | Only manual enumeration exists; counts conflict across documents | Blast radius of changes is unknown |
| Runbooks cover 100% of active alerts | **UNVERIFIED** | Gap analysis not started | Cannot confirm or deny; absence of evidence, not evidence of failure |
| On-call rotation for receiving team is staffed and trained | **UNVERIFIED** | Training plan drafted but not executed | Completion status unknown |
| Rollback procedure for in-flight migrations is tested | **UNVERIFIED** | Platform team claims yes; no test evidence in challenge review | Claim exists but is not substantiated |

### Current Assessment: **HANDOFF BLOCKED ON CONTRADICTION RESOLUTION**

Two criteria are demonstrably failing (contradiction resolution, dependency map). Three additional criteria are unverified — their status is unknown, not confirmed failed. However, the two confirmed failures alone are sufficient to block: the receiving team cannot make sound architectural or operational decisions when the source documents give contradictory direction on protocol, consistency model, and timeline priorities.

The distinction matters: "unverified" criteria may pass quickly once investigated, while the contradiction resolution requires active decision-making by empowered stakeholders.

## Recommended Next Artifact

**Artifact:** Contradiction Resolution Record (CRR)

**Purpose:** A single document that takes each contradiction (C-1, C-2, C-3), names the decision-maker, records the decision with rationale, and updates all source documents to reflect the resolved state.

**Why this artifact next:** Without resolving the cross-document contradictions, all downstream work (architecture decisions, sprint planning, staffing) is built on an inconsistent foundation. The CRR is the minimum artifact that unblocks everything else.

**Sequence after CRR:**
1. Contradiction Resolution Record ← **next**
2. Handoff Acceptance Criteria Ratification (stakeholder sign-off on which criteria block)
3. Validated Dependency Map (from telemetry)
4. Runbook Gap Analysis + Remediation
5. On-call Training Execution
6. Handoff Acceptance Checkpoint (re-evaluate pass/fail)
7. Formal ownership transfer
