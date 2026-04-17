# PRD: Data Pipeline — Real-Time Dashboard & Batch Reporting

**Status:** BLOCKED — architectural conflict requires resolution before implementation begins  
**Owner:** Data Platform Team  
**Version:** 0.2 (Post-Critique Revision)

---

## Decision Frame

The requirements document contains two specifications that create a consistency conflict without explicit scoping:

- **R1 (Real-Time):** Dashboard updates must reflect any event within 2 seconds of occurrence.
- **R2 (Batch Authority):** Nightly batch aggregation is the authoritative source of truth for all reporting.

As literally written, these requirements conflict. R1 demands a low-latency streaming path. R2 designates a batch-derived dataset as canonical. If both are enforced without qualification, any real-time number shown to a user will diverge from the reporting source of truth until the next batch run — a gap that may be up to ~24 hours.

**Revised framing (in response to critique):** The conflict is not purely architectural — it is partly semantic. The requirements could be reconciled if both stakeholders accept a two-tier data contract: real-time dashboard values are explicitly labeled as provisional estimates, and the batch layer remains authoritative only for finalized reporting. This is not the same as a dual-write system, and it may not carry the consistency risk that was previously rejected. However, this semantic contract must be explicitly agreed upon — it is not implied by the current requirements text, and treating it as implicit would introduce the same confusion the current conflict creates.

The previously known reconciliation mechanism — a dual-write system (stream + batch writing to the same downstream store) — has been previously rejected by the team due to consistency risk. This PRD does not re-litigate that decision, but also does not assume it forecloses all reconciliation paths.

One of the following mutually exclusive paths must be chosen:

| Path | What changes | Downstream impact |
|------|-------------|-------------------|
| **A. Relax R1** | Real-time dashboard dropped or replaced with near-real-time (e.g., minute-level refresh) | Dashboard shows lagged data; batch remains authoritative |
| **B. Relax R2** | Batch demoted from "source of truth" to "reconciliation layer" | Streaming becomes authoritative; reporting pipeline requires redesign |
| **C. Scope-split** | Real-time applies only to operational metrics; batch applies only to financial/compliance reporting | Two separate pipelines with explicit scope boundaries |
| **D. Semantic contract** | Both requirements preserved, but real-time values are explicitly labeled provisional; batch-final values govern all reporting | Requires product and stakeholder agreement on two-tier data semantics; no dual-write needed, but divergence window must be disclosed to users |
| **E. Revisit dual-write rejection** | Team re-examines previously rejected dual-write approach with explicit consistency contract | Consistency risk must be formally scoped and accepted |

**This PRD cannot progress to implementation until one path is selected.** Writing implementation specs against both R1 and R2 as currently stated — without a semantic contract or scope boundary — will produce contradictory engineering work.

---

## Unknowns & Evidence Gaps

The following questions must be answered to select a path.

**1. Who owns each requirement, and do they know they conflict?**  
R1 and R2 may have originated from different stakeholders (e.g., product vs. finance/analytics). It is unknown whether either party is aware of the conflict or whether one requirement was written assuming the other did not exist.

**2. Is a provisional/final two-tier contract acceptable to both stakeholders?**  
Path D requires that both the R1 stakeholder (who wants real-time visibility) and the R2 stakeholder (who wants batch authority) accept that dashboard values and reporting values can legally diverge during the batch window. If the R1 stakeholder objects to labeling their dashboard data as provisional, Path D collapses back into paths A or B.

**3. What is the actual use case for the real-time dashboard?**  
The 2-second latency target suggests operational monitoring (e.g., error spikes, live event tracking). If the dashboard is used for operational response rather than reporting, divergence from the batch source of truth may be acceptable — but must be stated explicitly.

**4. What reporting workflows depend on R2 being strictly authoritative?**  
If R2 satisfies audit, compliance, or contractual obligations, Path B (demoting batch) may be non-negotiable. If R2 is a convention, it is negotiable.

**5. What specifically was rejected about the dual-write approach?**  
The rejection is noted but not characterized. If the objection was implementation complexity, it may not apply to Path D (which does not require dual-write). If the objection was to consistency semantics under failure conditions, it may apply to both Path D and Path E.

**6. What is the acceptable staleness tolerance for dashboards?**  
The 2-second target may be a preference rather than a hard operational requirement. If 60-second or 5-minute refresh is operationally acceptable, Path A becomes lower-cost without meaningful product impact.

---

## Pass/Fail Readiness

| Gate | Status | Blocking? |
|------|--------|-----------|
| Architectural path selected (A, B, C, D, or E) | **FAIL** | Yes |
| Stakeholder alignment on R1 vs. R2 priority | **FAIL** | Yes |
| Two-tier semantic contract evaluated (Path D) | **FAIL** | Yes — new path requires explicit stakeholder agreement |
| Dual-write rejection rationale documented | **FAIL** | Yes — determines whether rejection applies to Path D |
| Real-time use case characterized | **FAIL** | Yes — required to evaluate Paths A, C, D |
| Batch authority scope characterized | **FAIL** | Yes — required to evaluate Paths B, C |

**Readiness verdict: NOT READY FOR IMPLEMENTATION SPEC**

This PRD is ready to advance only to a stakeholder alignment session. Proceeding to engineering design without resolving the above gates will result in contradictory implementation work that must be discarded.

---

## Recommended Next Artifact

**Artifact:** Conflict Resolution Brief (1-page, stakeholder-facing)  
**Owner:** Product + Data Platform lead  
**Audience:** R1 stakeholder (likely product/ops) and R2 stakeholder (likely analytics/finance), plus the team member who previously rejected dual-write  
**Contents:**
- Plain-language statement of the conflict (no architecture jargon)
- The five paths with trade-offs stated in business terms, including the two-tier semantic contract option
- A single question to each stakeholder: *what is the minimum acceptable version of your requirement?*
- Explicit question to dual-write rejector: *does the semantic contract path (Path D) carry the same risks you rejected, or different ones?*

**Why this before an implementation spec:** The conflict is a requirements problem, not an engineering problem. The critique correctly identified that semantic reframing may reconcile both requirements — but that reframing requires stakeholder agreement that is not present in the current requirements text. Producing an implementation spec now would require the engineering team to either pick a path unilaterally or design for both (which resurrects the dual-write risk in a different form).
