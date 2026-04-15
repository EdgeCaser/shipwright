# Technical Handoff PRD: Platform Migration to Unified Service Layer

## Decision Frame

**What we are deciding:** Whether to proceed with the technical handoff of the Platform Migration initiative from the Strategy phase to the Engineering Execution phase.

**Why now:** The platform strategy document (v2.3) was approved by the Architecture Review Board on 2026-03-28. The challenge review (CR-2026-041) completed on 2026-04-07 with a conditional pass. Engineering sprint capacity opens 2026-04-21. Delaying beyond this window pushes delivery past the Q3 contractual SLA deadline.

**What is NOT in scope:** Runtime performance optimization (deferred to Phase 2), third-party integration rewrites (owned by Partnerships team), and data migration sequencing (owned by Data Engineering under a separate PRD).

**Cross-document contradictions identified:**

| Source A | Source B | Contradiction | Resolution |
|----------|----------|---------------|------------|
| Platform Strategy v2.3 states "all services migrate to gRPC by Q3" | Challenge Review CR-2026-041 flags "gRPC adoption blocked for 3 services due to legacy client constraints" | Scope mismatch on migration completeness | Adopt CR finding: 3 services remain on REST with gRPC adapter facade. Strategy doc to be amended. |
| Strategy doc lists 4 microservices in critical path | Engineering capacity plan lists 5 (includes AuthZ service) | Service count discrepancy | AuthZ was added post-strategy approval per security audit SA-2026-012. Strategy doc outdated. Correct count is 5. |
| Strategy doc projects 12-week delivery | Challenge review estimates 16 weeks citing integration test gaps | Timeline disagreement | Accept 16-week estimate. 12-week figure excluded integration hardening identified in challenge review. |

**Decision criteria for handoff approval:**
1. All contradictions between strategy and challenge review are explicitly reconciled (see table above)
2. Engineering team confirms capacity for 16-week timeline
3. Dependency owners (Data Eng, Partnerships) acknowledge interface contracts
4. Risk register reflects challenge review findings, not strategy-phase assumptions

## Unknowns & Evidence Gaps

### High-Impact Unknowns

1. **Legacy client migration willingness** — The 3 services that cannot move to gRPC depend on external client upgrade timelines we do not control. No binding commitments exist from client teams. *Evidence needed:* Written confirmation from top-3 clients on upgrade timeline or explicit acceptance of adapter facade as permanent.

2. **AuthZ service integration complexity** — Added to scope post-strategy, no architecture spike completed. Estimated effort is based on analogy to prior AuthN migration, which encountered 3 weeks of unanticipated SSO edge cases. *Evidence needed:* 1-week spike before sprint 1 commitment. *Risk:* Spike could reveal complexity that expands scope beyond current 2-sprint estimate, triggering an ARB escalation and further delaying handoff.

3. **Integration test environment availability** — Challenge review flagged that the shared staging environment has a 2-week booking backlog. Parallel workstreams risk environment contention. *Evidence needed:* Environment reservation confirmed or dedicated environment provisioned. *Risk:* The 2-week backlog means even initiating a reservation today may not yield availability within the target resolution window.

### Medium-Impact Unknowns

4. **Observability coverage for new gRPC services** — Current monitoring stack assumes REST semantics. gRPC status codes and streaming metrics require dashboard rework. No estimate exists. *Evidence needed:* SRE team assessment of monitoring migration effort.

5. **Contract test coverage** — Strategy doc claims 85% contract coverage. Challenge review tested and measured 62%. Gap is material for handoff confidence. *Evidence needed:* Actual coverage report from CI pipeline, not strategy-phase estimates.

### Blocker Resolution Confidence Assessment

The four blocking items below carry materially different resolution confidence levels. Two depend on external parties whose response timelines we do not control:

| Blocker | Owner | Dependency Type | Confidence in 2-Week Resolution | Basis |
|---------|-------|-----------------|--------------------------------|-------|
| Written sprint capacity allocation | EM (internal) | Internal | HIGH | Verbal confirmation already given; written form is procedural |
| AuthZ integration spike | Engineering lead (internal) | Internal, but outcome-uncertain | MEDIUM | Spike can be scheduled immediately, but results may reveal scope expansion rather than resolution |
| Interface contracts signed | Data Eng + Partnerships (cross-team) | External to platform team | LOW | Data Eng contract drafted but unsigned; Partnerships contract not yet drafted. Neither team has committed to a review timeline. |
| Integration test environment | Platform infrastructure (shared resource) | Constrained shared resource | LOW | 2-week booking backlog means reservation initiated today may not clear within window |

**Implication:** The characterization of blocking items as "resolvable within 1-2 weeks" applies only to the two internally-owned blockers. The two externally-dependent blockers have no evidence supporting rapid resolution. This means the handoff delay could extend to 3-4 weeks if external parties do not prioritize, and the overall assessment should be treated as a **sequencing problem with external dependency risk**, not a pure sequencing problem.

## Pass/Fail Readiness

### Pass Criteria Assessment

| Criterion | Status | Evidence | Verdict |
|-----------|--------|----------|---------|
| Cross-document contradictions reconciled | DONE | See Decision Frame table; 3 contradictions identified and resolved with clear authority hierarchy (challenge review supersedes strategy where they conflict) | PASS |
| Engineering capacity confirmed for 16-week plan | PENDING | Verbal confirmation from EM; written sprint allocation not yet submitted | CONDITIONAL |
| Dependency interface contracts signed | PENDING | Data Eng contract drafted, not signed. Partnerships contract not yet drafted. No committed review timeline from either team. | FAIL |
| Risk register updated with challenge review findings | DONE | Risk register v1.4 incorporates all 7 findings from CR-2026-041 | PASS |
| AuthZ spike completed | NOT STARTED | Spike not scheduled. Outcome uncertain: may confirm 2-sprint estimate or expand scope. | FAIL |
| Integration test environment reserved | NOT STARTED | No reservation submitted. Shared environment has 2-week booking backlog. | FAIL |

### Overall Readiness Verdict: CONDITIONAL FAIL

**Rationale:** 2 of 6 criteria pass outright. 1 is conditional on written confirmation. 3 fail. The handoff cannot proceed as-is. Two of the three failing criteria depend on external parties or constrained shared resources with no committed resolution timelines, meaning the path to clearance carries dependency risk beyond the platform team's direct control. A realistic resolution window is 2-4 weeks, not 1-2 weeks, unless escalation secures prioritized attention from Data Eng, Partnerships, and infrastructure teams.

**Blocking items (must resolve before handoff):**
- [ ] Dependency interface contracts signed by Data Eng and Partnerships *(external dependency — no committed timeline)*
- [ ] AuthZ integration spike completed — 1 week if results confirm estimates; longer if scope expands *(internal but outcome-uncertain)*
- [ ] Integration test environment reserved or provisioned *(constrained shared resource — 2-week backlog)*
- [ ] Written sprint capacity allocation from EM *(internal — high confidence)*

## Recommended Next Artifact

**Artifact:** Engineering Execution Plan (EEP) — but gated on resolving the 4 blocking items above.

**Sequencing:**
1. **This week (2026-04-14 → 2026-04-18):** Initiate all resolution tracks in parallel:
   - EM submits written sprint allocation *(expected to close this week)*
   - Engineering lead initiates AuthZ spike *(1-week duration, results by 2026-04-25)*
   - TPM submits environment reservation request *(availability subject to 2-week backlog)*
   - TPM circulates interface contracts to Data Eng and Partnerships with explicit ask for signed response by 2026-04-25
2. **Escalation checkpoint (2026-04-25):** Assess blocker status. If external blockers remain open:
   - Escalate contract signing to VP Engineering and partner team leads
   - Evaluate provisioning a dedicated test environment if shared environment remains unavailable
   - If AuthZ spike reveals complexity beyond 2-sprint estimate, escalate to ARB for scope reduction
3. **Target EEP production (2026-04-28 → 2026-05-02):** If all blockers clear by escalation checkpoint, produce EEP with:
   - Sprint-level breakdown of 5-service migration
   - Integration test strategy addressing the 62% → 85% coverage gap
   - gRPC adapter facade design for 3 legacy-constrained services
   - Monitoring migration plan from SRE assessment
4. **Hard deadline:** If any blocker remains unresolved by 2026-05-02, return to ARB with a scope reduction proposal to preserve the Q3 SLA commitment.

**Handoff owner:** Platform TPM
**Decision authority for scope changes:** Architecture Review Board
**Escalation trigger:** Any blocking item unresolved by 2026-04-25
