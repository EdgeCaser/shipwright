# Technical Handoff PRD: Platform Migration & API Consolidation

## Decision Frame

**Context:** The platform team is consolidating three legacy API surfaces (v1 REST, v2 REST, GraphQL gateway) into a single unified API layer. The challenge review surfaced tensions between the platform strategy document (which commits to GraphQL-first) and the operational readiness assessment (which flags GraphQL gateway latency as a blocking P0 issue). This PRD clarifies the nature of that tension, identifies what evidence would resolve it, and defines the handoff scope.

**Decision to be made:** Whether to proceed with the GraphQL-first consolidation as stated in the platform strategy, pivot to a REST-first approach that avoids the latency blocker, or adopt a hybrid approach that sequences REST migration first while the GraphQL latency issue is resolved.

**Stakeholders:**
- Platform Engineering (owner)
- API Consumer Teams (mobile, web, partner integrations)
- SRE/Infrastructure (operational readiness)
- Product Leadership (strategy alignment)

**Key tension identified:** The platform strategy document (v3.2, dated 2026-03-01) states "GraphQL gateway will serve as the single entry point for all API consumers by Q3 2026." The challenge review (dated 2026-04-08) classifies GraphQL gateway P99 latency at 1.2s as a P0 blocker, with estimated remediation timeline of 8-12 weeks. Whether these two commitments are compatible depends on unresolved scheduling details: specifically, when within Q3 the cutover is planned, whether the 8-12 week estimate reflects calendar time or engineering time, and whether the P0 classification applies to immediate rollout or final consolidation readiness. Neither document provides sufficient schedule detail to confirm or rule out compatibility. Until that ambiguity is resolved, the safest posture is to treat them as potentially conflicting and plan accordingly.

**Recommended resolution:** Adopt a sequenced hybrid approach — migrate v1 REST consumers to v2 REST immediately (low risk, well-understood), while GraphQL latency remediation proceeds in parallel. GraphQL becomes the consolidated target only after latency drops below the 200ms P99 SLO. This approach is robust to both outcomes: if the timeline proves compatible, Phase 2 proceeds on schedule; if not, Phase 1 work is not wasted.

## Unknowns & Evidence Gaps

| # | Unknown | Impact | Current Evidence | What Would Resolve It |
|---|---------|--------|------------------|-----------------------|
| U1 | Root cause of GraphQL gateway latency regression | Determines whether 8-12 week estimate is credible | Challenge review cites "N+1 resolver patterns and missing DataLoader implementation" but no profiling data attached | Flame graph analysis of P99 requests under production load |
| U2 | Number of v1 REST consumers still active | Determines migration effort for Phase 1 | Platform strategy claims "fewer than 10" but API gateway logs were not cited as evidence | API gateway access logs from last 90 days, grouped by consumer |
| U3 | Partner integration contract obligations | May constrain migration timeline regardless of technical readiness | No evidence in either document; challenge review flags this as unexamined | Legal review of partner API SLAs and change notification requirements |
| U4 | Whether mobile team can absorb client-side migration work in Q2 | Affects consumer-side rollout sequencing | Platform strategy assumes mobile team capacity without citing sprint commitments | Mobile team tech lead confirmation of Q2 capacity allocation |
| U5 | GraphQL gateway cost under consolidated load | Operational readiness only tested at current partial load | No load testing evidence for projected consolidated traffic (3x current) | Load test at 3x projected traffic with cost monitoring |
| U6 | Precise Q3 2026 cutover date and whether 8-12 week estimate is calendar or engineering time | Determines whether the strategy timeline and remediation estimate are actually compatible | Neither document specifies the planned cutover date within Q3 or clarifies the basis of the remediation estimate | Platform lead to confirm target cutover date; engineering lead to clarify estimate basis (calendar vs. engineering weeks) and confidence interval |

## Pass/Fail Readiness

### Pass Criteria

| Criterion | Status | Evidence |
|-----------|--------|----------|
| v2 REST API covers all v1 REST endpoints | **PASS** | Platform strategy Appendix B shows endpoint mapping matrix; challenge review did not dispute completeness |
| Migration runbook exists for v1→v2 consumer cutover | **PASS** | Referenced in platform strategy §4.2; SRE confirmed runbook review complete |
| Rollback procedure documented and tested | **PASS** | Challenge review §3.1 confirms rollback tested in staging |
| Consumer team notification sent ≥30 days before cutover | **NOT YET** | Blocked on resolving U2 (active consumer count) and U3 (partner obligations) |

### Fail Criteria (Blockers)

| Criterion | Status | Evidence |
|-----------|--------|----------|
| GraphQL P99 latency < 200ms SLO | **FAIL** | Challenge review measures 1.2s P99; 6x above SLO |
| Load testing at projected consolidated volume | **FAIL** | No evidence of load testing beyond current partial traffic |
| Cross-document alignment on target architecture timeline | **AT RISK** | Platform strategy and challenge review create ambiguity on GraphQL readiness; compatibility depends on unresolved scheduling details (U6). This PRD resolves by recommending sequencing that is robust to either outcome. |

**Overall readiness: CONDITIONAL PASS for Phase 1 (REST consolidation only). FAIL for full GraphQL consolidation until latency and load testing blockers are resolved and timeline compatibility (U6) is confirmed.**

## Recommended Next Artifact

**Artifact:** Technical Design Document (TDD) for Phase 1 REST Consolidation

**Scope:** The TDD should cover:
1. v1→v2 REST consumer migration playbook with per-consumer cutover plan
2. Traffic shifting strategy (percentage-based rollout with automated rollback triggers)
3. Monitoring and alerting configuration for migration health
4. Success criteria for declaring Phase 1 complete and triggering Phase 2 (GraphQL) planning

**Prerequisites before TDD can begin:**
- U2 resolved (active v1 consumer count confirmed from logs)
- U3 resolved (partner SLA review complete)
- U6 resolved (Q3 cutover date and estimate basis confirmed)
- Platform and SRE leads aligned on sequenced approach (this PRD serves as the alignment artifact)

**Parallel workstream:** GraphQL latency remediation should proceed as an independent engineering effort with its own technical spike document. Phase 2 planning gates on that remediation achieving the 200ms P99 SLO in staging under 3x load.
