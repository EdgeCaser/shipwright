# Technical Handoff PRD: Platform Migration to Unified Service Layer

## Decision Frame

**Decision owner:** Platform Engineering Lead
**Decision type:** Go / No-Go on migrating legacy service endpoints to the Unified Service Layer (USL) for Q3 release.
**Deadline:** 2026-05-15 (architecture lock for Q3 sprint planning)
**Irreversibility:** Medium-High. Once downstream consumers migrate to USL contracts, rollback requires maintaining dual endpoints for 2+ quarters.

### Context

The platform currently operates three independent API gateway configurations (customer-facing, internal tooling, partner integrations) with divergent authentication, rate-limiting, and schema validation behaviors. The USL proposal consolidates these into a single gateway with policy-based routing.

**Cross-document contradiction identified:** The platform strategy document (v2.3) states USL will "eliminate all legacy endpoints by Q3 end," while the challenge review (CR-2026-018) notes that partner integration contracts have SLA-protected endpoint stability guarantees through Q4. These two commitments are mutually exclusive under the current timeline.

**Resolution required before Go decision:** Either (a) negotiate partner SLA amendment to permit migration, (b) extend legacy endpoint deprecation to Q4+1, or (c) scope USL Phase 1 to exclude partner endpoints entirely.

### Stakeholder Positions

| Stakeholder | Position | Constraint |
|---|---|---|
| Platform Strategy (v2.3) | Full migration by Q3 | Budget allocated assumes legacy infra decommission savings |
| Challenge Review (CR-2026-018) | Partner endpoints stable through Q4 | Contractual SLA, breach triggers penalty clauses |
| Engineering | Prefer phased rollout | Capacity for full migration is 1.4x current team bandwidth |
| Partner Success | Protect partner experience | 3 top-tier partners renew in Q4; disruption risks churn |

## Unknowns & Evidence Gaps

### Critical Unknowns

1. **Partner SLA flexibility** — No evidence that partner contracts permit early migration. Legal review has not been initiated. Without this, the Q3 full-migration target in the platform strategy is unachievable without breach risk.

2. **Performance parity under consolidation** — USL benchmarks were run against synthetic traffic. No load testing against production partner traffic patterns (which include batch operations up to 10K requests/minute). The challenge review flagged this gap but no remediation is scheduled.

3. **Authentication reconciliation** — Customer-facing endpoints use OAuth 2.0 + PKCE, internal uses mTLS, partner uses API key + IP allowlist. The platform strategy assumes a "unified auth layer" but the technical design document does not specify how IP allowlist policies translate to the new gateway. This is a design gap, not an implementation detail.

### Evidence Gaps

| Gap | Impact | Mitigation |
|---|---|---|
| No partner traffic load test | Could discover latency regression post-migration | Run shadow traffic test against USL staging with production replay |
| No legal review of SLA amendment | Blocks Go decision entirely for partner scope | Initiate legal review by 2026-04-21 |
| Auth policy mapping incomplete | Risk of partner access disruption at cutover | Require auth design spec with partner policy matrix before architecture lock |
| Cost model assumes full decommission | Partial migration changes ROI calculation | Finance to model phased decommission scenario |

## Pass/Fail Readiness

### Pass Criteria (all must be true for Go)

- [ ] **Legal confirmation** that partner SLA permits migration OR scope explicitly excludes partner endpoints from Phase 1
- [ ] **Load test results** demonstrating p99 latency within 10% of current partner endpoint performance under production-equivalent traffic
- [ ] **Auth policy mapping document** reviewed and approved by Security, covering all three current auth patterns
- [ ] **Rollback plan** documented with <4hr RTO for any single endpoint group
- [ ] **Cross-document alignment** — platform strategy and challenge review recommendations reconciled into a single agreed timeline

### Current Assessment: NO-GO

**Rationale:** Two of five pass criteria have blocking dependencies (legal review not started, load test not scheduled). The cross-document contradiction between strategy and challenge review remains unresolved, meaning no authoritative timeline exists. Proceeding without resolution risks either contractual breach or underfunded parallel infrastructure.

### Fail Conditions (any triggers No-Go)

- Partner SLA amendment rejected and no scope reduction agreed
- Load test shows >25% p99 latency regression on partner traffic patterns
- Auth policy mapping reveals incompatible security requirements that need gateway redesign

## Recommended Next Artifact

**Artifact:** Scoped Migration Plan (Phase 1: Internal + Customer; Phase 2: Partner)

**Rationale:** Given the cross-document contradiction and unresolved partner SLA question, the highest-value next step is a phased migration plan that:

1. Decouples the unblocked work (internal + customer endpoints) from the blocked work (partner endpoints)
2. Preserves the Q3 value delivery for 2 of 3 endpoint groups
3. Creates a concrete decision point for partner migration once legal review completes
4. Resolves the strategy-vs-challenge-review contradiction by making the phasing explicit rather than forcing premature alignment

**Required inputs for next artifact:**
- Legal review initiation confirmation (by 2026-04-21)
- Engineering capacity estimate for phased vs. full migration
- Finance model for partial decommission ROI

**Handoff to:** Engineering Lead + Program Manager for sprint planning scoping
