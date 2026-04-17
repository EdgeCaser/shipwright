# PRD: Data Pipeline — Real-Time Dashboard & Batch Reporting

**Status:** BLOCKED — architectural conflict requires resolution before implementation begins  
**Owner:** Data Platform Team  
**Version:** 0.1 (Pre-Decision Draft)

---

## Decision Frame

The requirements document contains two specifications that cannot be simultaneously satisfied by a single-pipeline architecture without a dual-write system:

- **R1 (Real-Time):** Dashboard updates must reflect any event within 2 seconds of occurrence.
- **R2 (Batch Authority):** Nightly batch aggregation is the authoritative source of truth for all reporting.

These requirements are in direct architectural conflict. R1 demands a low-latency streaming path. R2 designates a batch-derived dataset as canonical. If both are enforced as written, any real-time number shown to a user will diverge from the reporting source of truth until the next batch run — which may be up to ~24 hours. The gap is not a bug; it is the intended design of a batch-authoritative system.

The only known reconciliation mechanism — a dual-write system (stream + batch writing to the same downstream store) — has been previously rejected by the team due to consistency risk. This PRD does not re-litigate that decision. It surfaces the conflict so that one of the following mutually exclusive paths can be chosen:

| Path | What changes | Downstream impact |
|------|-------------|-------------------|
| **A. Relax R1** | Real-time dashboard is dropped or replaced with near-real-time (e.g., minute-level refresh) | Dashboard shows lagged data; batch remains authoritative |
| **B. Relax R2** | Batch is demoted from "source of truth" to "reconciliation layer" | Streaming data becomes authoritative; reporting pipeline requires redesign |
| **C. Scope-split** | Real-time applies only to operational metrics; batch applies only to financial/compliance reporting | Two separate pipelines with explicit scope boundaries |
| **D. Revisit dual-write rejection** | Team re-examines previously rejected dual-write approach with explicit consistency contract | Consistency risk must be formally scoped and accepted |

**This PRD cannot progress to implementation until one path is selected.** Writing implementation specs against both R1 and R2 as currently stated will produce contradictory engineering work.

---

## Unknowns & Evidence Gaps

The following questions must be answered to select a path. None can be resolved from the requirements document as written.

**1. Who owns each requirement, and do they know they conflict?**  
R1 and R2 may have originated from different stakeholders (e.g., product vs. finance/analytics). It is unknown whether either party is aware of the conflict or whether one requirement was written with the assumption that the other did not exist.

**2. What is the actual use case for the real-time dashboard?**  
The 2-second latency target suggests operational monitoring (e.g., error spikes, live event tracking). If the dashboard is used for operational response rather than reporting, it may be acceptable for it to diverge from the batch source of truth — but this must be stated explicitly, not assumed.

**3. What reporting workflows depend on R2 being strictly authoritative?**  
If R2 exists to satisfy audit, compliance, or contractual obligations, Path B (demoting batch) may be non-negotiable regardless of preference. If R2 is a convention rather than a hard constraint, it is negotiable.

**4. What specifically was rejected about the dual-write approach?**  
The rejection is noted but not characterized. If the objection was implementation complexity (resolvable), it differs from an objection to consistency semantics under failure conditions (harder to resolve). Without this characterization, Path D cannot be evaluated.

**5. What is the acceptable staleness tolerance for dashboards?**  
The 2-second target may be a stakeholder preference rather than a hard operational requirement. If 60-second or 5-minute refresh is operationally acceptable, Path A becomes lower-cost without meaningful product impact.

---

## Pass/Fail Readiness

| Gate | Status | Blocking? |
|------|--------|-----------|
| Architectural path selected (A, B, C, or D) | **FAIL** | Yes |
| Stakeholder alignment on R1 vs. R2 priority | **FAIL** | Yes |
| Dual-write rejection rationale documented | **FAIL** | Yes — required to evaluate Path D |
| Real-time use case characterized | **FAIL** | Yes — required to evaluate Path A/C |
| Batch authority scope characterized | **FAIL** | Yes — required to evaluate Path B/C |

**Readiness verdict: NOT READY FOR IMPLEMENTATION SPEC**

This PRD is ready to advance only to a stakeholder alignment session. Proceeding to engineering design without resolving the above gates will result in contradictory implementation work that must be discarded.

---

## Recommended Next Artifact

**Artifact:** Conflict Resolution Brief (1-page, stakeholder-facing)  
**Owner:** Product + Data Platform lead  
**Audience:** R1 stakeholder (likely product/ops) and R2 stakeholder (likely analytics/finance), plus the team member who previously rejected dual-write  
**Contents:**
- Plain-language statement of the conflict (no architecture jargon)
- The four paths with their respective trade-offs stated in business terms
- A single question to each stakeholder: *what is the minimum acceptable version of your requirement?*

**Why this before an implementation spec:** The conflict is a requirements problem, not an engineering problem. Producing an implementation spec now would require the engineering team to either pick a path unilaterally (producing the wrong thing) or hedge by designing for both (producing dual-write, which was rejected). The conflict resolution brief surfaces the decision to the people who own it.
