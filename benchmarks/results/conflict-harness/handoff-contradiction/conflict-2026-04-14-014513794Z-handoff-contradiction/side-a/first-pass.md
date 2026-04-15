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

## Pass/Fail Readiness

### Pass Criteria (all must be true for handoff to proceed)

| Criterion | Status | Evidence |
|-----------|--------|----------|
| All three contradictions (C-1, C-2, C-3) have a documented resolution with decision-maker sign-off | **FAIL** | No resolution documents exist |
| Dependency map is validated against live traffic data | **FAIL** | Only manual enumeration exists |
| Runbooks cover 100% of active alerts | **FAIL** | Gap analysis not started |
| On-call rotation for receiving team is staffed and trained | **FAIL** | Training plan drafted but not executed |
| Rollback procedure for in-flight migrations is tested | **UNKNOWN** | Platform team claims yes; no test evidence in challenge review |

### Current Verdict: **NOT READY FOR HANDOFF**

Five pass criteria evaluated; zero confirmed passing. The handoff cannot proceed without creating unacceptable operational risk for the receiving team.

## Recommended Next Artifact

**Artifact:** Contradiction Resolution Record (CRR)

**Purpose:** A single document that takes each contradiction (C-1, C-2, C-3), names the decision-maker, records the decision with rationale, and updates all source documents to reflect the resolved state.

**Why this artifact next:** Without resolving the cross-document contradictions, all downstream work (architecture decisions, sprint planning, staffing) is built on an inconsistent foundation. The CRR is the minimum artifact that unblocks everything else.

**Sequence after CRR:**
1. Contradiction Resolution Record ← **next**
2. Validated Dependency Map (from telemetry)
3. Runbook Gap Analysis + Remediation
4. On-call Training Execution
5. Handoff Acceptance Checkpoint (re-evaluate pass/fail)
6. Formal ownership transfer
