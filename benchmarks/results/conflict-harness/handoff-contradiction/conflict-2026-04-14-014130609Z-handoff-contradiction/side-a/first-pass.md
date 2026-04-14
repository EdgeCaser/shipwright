# Technical Handoff PRD: Platform Migration to Unified Service Layer

## Decision Frame

**Context:** The platform team is handing off a partially-completed migration from a monolithic API gateway to a unified service layer. This PRD captures the current state, unresolved contradictions across existing documentation, and readiness assessment for the receiving team.

**Decision Required:** Should the receiving team (Platform Infrastructure) accept the handoff and proceed to production rollout, or must specific preconditions be met first?

**Stakeholders:**
- Handing-off team: API Platform (original owners)
- Receiving team: Platform Infrastructure
- Dependent teams: Mobile, Web, Partner Integrations

**Scope Boundary:** This PRD covers the handoff decision only — not the full migration plan. The migration plan is a separate artifact owned by the receiving team post-acceptance.

### Cross-Document Contradictions Identified

| # | Document A | Document B | Contradiction | Severity |
|---|-----------|-----------|---------------|----------|
| C-1 | Platform Strategy (v3.2) states "all traffic routes through unified gateway by Q3" | Challenge Review (2026-03-28) states "partner traffic excluded from unified gateway until compliance audit completes" | Scope of unified gateway is inconsistent — strategy assumes full coverage, challenge review carves out partner traffic | **High** — affects capacity planning and SLA commitments |
| C-2 | Architecture Decision Record (ADR-47) specifies "mTLS for all service-to-service communication" | Runbook (v2.1) documents "API key auth for internal services behind VPN" | Authentication mechanism for internal services is contradictory — cannot implement both as default | **High** — security posture ambiguity blocks production readiness |
| C-3 | Platform Strategy (v3.2) targets "99.95% availability SLA" | Capacity Plan (Q2) models infrastructure for "99.9% availability" | 0.05% SLA gap represents ~22 minutes/month of additional required uptime not budgeted in infrastructure | **Medium** — resolvable but requires explicit cost decision |
| C-4 | Challenge Review recommends "feature flags for gradual rollout" | Migration Runbook specifies "blue-green cutover with instant rollback" | Deployment strategy is contradictory — gradual vs. atomic approaches have different failure modes and monitoring requirements | **Medium** — tactical decision, but must be resolved before rollout planning |

## Unknowns & Evidence Gaps

### Critical Unknowns (must resolve before handoff acceptance)

1. **Partner traffic routing decision (relates to C-1):** No authoritative decision exists on whether partner traffic is in-scope for Q3. The compliance audit referenced in the challenge review has no documented timeline or owner.
   - *Evidence needed:* Written decision from compliance team with timeline
   - *Fallback:* Exclude partner traffic from initial scope, document as Phase 2

2. **Authentication standard resolution (relates to C-2):** ADR-47 was approved but the runbook was updated more recently. It is unclear which represents current intent.
   - *Evidence needed:* Confirmation from security architecture on which auth mechanism is canonical
   - *Fallback:* Default to mTLS (ADR-47) as it is the more secure option; update runbook

### Important Unknowns (should resolve within 2 weeks of handoff)

3. **Load testing under unified routing:** No load test results exist for the unified service layer handling current peak traffic (documented at 12K RPS). The capacity plan models steady-state only.
   - *Evidence needed:* Load test at 1.5x peak (18K RPS) with latency percentiles

4. **Rollback time validation:** Neither the blue-green nor feature-flag approach has a documented rollback time. The SLA implies rollback must complete within the error budget window.
   - *Evidence needed:* Timed rollback drill with results documented

### Acknowledged Unknowns (acceptable to carry forward)

5. **Long-term deprecation timeline for legacy gateway:** Not needed for handoff decision but should be planned within 90 days of acceptance.

## Pass/Fail Readiness

### Readiness Criteria

| Criterion | Status | Blocking? | Notes |
|-----------|--------|-----------|-------|
| Cross-document contradictions catalogued | **PASS** | — | Four contradictions identified above |
| Critical contradictions have resolution path | **FAIL** | Yes | C-1 and C-2 have no authoritative resolution |
| Receiving team has reviewed architecture | **PASS** | — | Review completed 2026-04-10 |
| Runbook matches current system state | **FAIL** | Yes | Runbook contradicts ADR-47 on auth (C-2) |
| Monitoring and alerting in place | **PASS** | — | Grafana dashboards and PagerDuty routing confirmed |
| Rollback procedure documented and tested | **FAIL** | Yes | Procedure documented but not tested; deployment strategy unresolved (C-4) |
| Dependent teams notified of handoff | **PASS** | — | Mobile, Web, Partners notified 2026-04-08 |
| On-call rotation transferred | **NOT STARTED** | Yes | Requires resolution of auth mechanism to update incident response procedures |

### Verdict: **HANDOFF NOT READY**

Four blocking criteria are unmet. The root cause is unresolved cross-document contradictions that cascade into operational gaps. Specifically:
- Cannot finalize on-call procedures without knowing the auth mechanism (C-2)
- Cannot test rollback without choosing a deployment strategy (C-4)
- Cannot validate scope without partner traffic decision (C-1)

### Conditions for Re-Assessment

The handoff should be re-assessed when:
1. Security architecture confirms canonical auth mechanism (resolves C-2)
2. Product/compliance provides written partner traffic scope decision (resolves C-1)
3. Engineering leads align on deployment strategy with documented rationale (resolves C-4)
4. Rollback drill completed with measured time-to-recovery

Estimated time to resolve: 1-2 sprint cycles if owners are assigned this week.

## Recommended Next Artifact

**Artifact:** Contradiction Resolution Register (CRR)

**Rationale:** The primary blocker is not missing work — it is conflicting documentation that prevents the receiving team from knowing what "done" looks like. A CRR would:
1. Assign an explicit owner to each contradiction (C-1 through C-4)
2. Set a resolution deadline (recommend: end of current sprint)
3. Document the resolution decision with rationale
4. Trigger updates to all affected documents (strategy, ADRs, runbooks)

Once the CRR is complete, the handoff readiness assessment should be re-run against the same criteria above. If all blocking items pass, proceed to formal handoff with a 2-week shadowing period where both teams share on-call.

**Secondary Artifact (post-handoff):** Updated Migration Runbook incorporating all CRR resolutions, to be owned by the receiving team.
