# PRD: Unified Event Pipeline — Real-Time Visibility & Authoritative Reporting

**Status:** BLOCKED — Architectural conflict requires resolution before implementation begins  
**Owner:** Data Platform Team  
**Last Updated:** 2026-04-17

---

## Decision Frame

This PRD surfaces a direct architectural contradiction between two requirements that were committed independently and cannot both be satisfied without a design pattern the team has formally rejected.

**Requirement A (Real-Time):** Dashboard surfaces must reflect any event within 2 seconds of occurrence.

**Requirement B (Batch Authority):** Nightly batch aggregation is the designated source of truth for all reporting.

**The Conflict:** Satisfying both requirements simultaneously against their full stated scope requires a dual-write architecture — events written to a low-latency store for live display and to a batch-oriented store for authoritative aggregation. These two stores will diverge during any failure window, replication lag, or late-arriving event. The team has previously evaluated and rejected dual-write on consistency grounds.

**This PRD does not propose a solution.** It documents the conflict, frames the decision the stakeholders must make, and defines readiness gates that must clear before engineering begins.

**Three canonical resolution paths have been identified.** Additional approaches may exist depending on scope clarifications not present in this packet (see Unknowns below), but any candidate approach should be evaluated against this taxonomy before being treated as a fourth path:

| Path | What changes | What is lost |
|------|-------------|---------------|
| **1. Drop real-time requirement** | Dashboards update on batch cadence (nightly or near-nightly) | Sub-2-second visibility |
| **2. Drop batch-authority requirement** | Stream becomes source of truth; batch becomes derivative or eliminated | Auditable nightly reconciliation; historical reprocessing guarantees |
| **3. Accept dual-write with explicit consistency contract** | Team revisits its prior rejection with bounded failure modes documented | Team's prior judgment that dual-write risk is unacceptable |

**On scope-narrowing alternatives:** Approaches such as labeling the real-time surface as provisional, narrowing which downstream consumers count as "reporting," or limiting batch authority to a defined subset of metrics may appear to resolve the conflict. These are not dismissed — they are unresolved. Whether they constitute a genuine fourth path or are variants of Path 2 (partial batch authority drop) or Path 3 (bounded dual-write) depends on answers to Unknowns 2 and 3 below. They should be enumerated explicitly in the Decision Brief.

---

## Unknowns & Evidence Gaps

The following questions must be answered before any path can be selected. They are listed in dependency order — earlier answers constrain later ones.

**1. Why was dual-write rejected previously?**  
The rejection is documented as a team decision, but the specific failure scenario, incident, or risk model that drove it is not present in this packet. Without understanding the original objection, it is impossible to determine whether Path 3 is a reconsideration of a well-reasoned policy or a re-exposure to a known hazard. This also determines whether scope-narrowing approaches escape the original objection or merely reproduce it at smaller scale.

**2. Who owns the "source of truth" designation for batch, and over what scope?**  
If batch authority is a contractual, compliance, or audit requirement (external constraint), Paths 1 and 3 may be closed regardless of technical preference. If it is an internal engineering convention, it can be renegotiated — and its scope ("all reporting" vs. a defined subset) may itself be negotiable. Narrowing this scope is the clearest path to a genuine fourth option that does not collapse into dual-write.

**3. What is the actual use case for sub-2-second updates, and on which surfaces?**  
The requirement is stated as a latency threshold, not as a user outcome. It is unknown whether the downstream behavior (operator action, alerting, customer-facing display) requires true real-time data or whether a longer lag would satisfy the same need. It is also unknown whether the threshold applies to all dashboard surfaces or only specific ones — a narrowed real-time scope might not conflict with batch authority at all.

**4. What is the failure mode tolerance for the real-time surface?**  
If the live dashboard shows a stale or incorrect value during a pipeline hiccup, what happens? If the answer is "nothing consequential," the consistency risk of dual-write may be bounded. If the answer is "operators make decisions on this data," the risk profile is materially different.

**5. What is the event volume and aggregation shape?**  
The feasibility of a pure-streaming path (Path 2) depends on whether batch aggregations can be recomputed incrementally in stream. This is unknown without event volume, schema complexity, and aggregation shape.

---

## Pass/Fail Readiness

This PRD is **not ready for engineering handoff**. The following gates must pass before work can begin on any implementation path.

### Hard Gates (all must pass)

- [ ] **Conflict resolved:** Stakeholders have selected a path (from the three canonical paths or a scope-narrowed variant documented in the Decision Brief) and recorded the rationale in writing.
- [ ] **Dual-write rejection reviewed:** If Path 3 or a dual-write variant is selected, the original rejection rationale has been retrieved, the team has evaluated whether conditions have changed, and a bounded consistency contract has been defined.
- [ ] **Source-of-truth authority clarified:** The "batch as source of truth" requirement has been traced to its origin (compliance, audit, internal convention) and the owning party has confirmed whether the designation and its scope are negotiable.
- [ ] **Real-time use case validated:** The sub-2-second threshold has been tied to a specific user action or system behavior on identified surfaces, not just stated as a latency target.

### Soft Gates (should pass; exceptions require sign-off)

- [ ] **Scope-narrowing options evaluated:** The Decision Brief explicitly addresses whether narrowing the real-time surface, the reporting scope, or both creates a conflict-free path, and records why that path is or is not viable.
- [ ] **Failure mode documented:** For whichever path is chosen, the behavior under pipeline failure has been written down and accepted by the product owner.

---

## Recommended Next Artifact

**Do not write a technical design document yet.**

The recommended next step is a **Decision Brief** — a single-page document that:

1. Summarizes the three canonical paths and any scope-narrowing variants, with their trade-offs
2. Answers Unknowns 1 and 2 above (dual-write rejection rationale; source-of-truth authority and scope)
3. Explicitly evaluates whether a narrowed-scope approach resolves the conflict without dual-write
4. Captures a signed stakeholder decision on which path to pursue

The Decision Brief should be owned by the product manager and data platform lead jointly, reviewed in a single working session with the relevant stakeholders, and completed before any spike or prototype work begins.

Once the Decision Brief is signed, this PRD should be updated with the chosen path, the dropped or narrowed requirement explicitly marked, and the relevant unknowns resolved. At that point, a technical design can proceed.

---

## Out of Scope (this version)

- Implementation design for any pipeline path
- Cost or infrastructure sizing
- Vendor or technology selection
- Migration plan from current state

These are deferred until the architectural conflict is resolved.
