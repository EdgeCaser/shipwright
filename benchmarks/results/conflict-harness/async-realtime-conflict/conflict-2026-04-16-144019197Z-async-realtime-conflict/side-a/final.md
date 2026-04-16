# PRD: Unified Data Pipeline — Real-Time Visibility & Batch Reporting

**Status:** BLOCKED (architecture) / PARTIAL (requirements)  
**Author:** Data Platform Team  
**Date:** 2026-04-16  
**Version:** 0.2 (Post-Critique Revision)

---

## Decision Frame

### The Core Conflict

The requirements as written create an architectural tension that cannot be resolved within this PRD alone. Specifically:

| Requirement | Implication |
|---|---|
| Real-time dashboard updates within 2 seconds of any event | Events must reach a queryable store in near-real-time — requires a streaming or event-driven path |
| Nightly batch aggregation as the **source of truth** for all reporting | Authoritative numbers are produced once per day from a separate batch pipeline |

The conflict is a **consistency guarantee problem**, not a stylistic one. Real-time dashboards will by definition display non-authoritative data at all times until batch closes — unless the requirements are re-framed to explicitly acknowledge that distinction. The current PRD does not make that framing explicit.

**Key revision from first pass:** The PRD is not entirely non-actionable before an architectural path is chosen. Requirements can be written — and some work can begin — at the level of user-facing semantics: what does the dashboard *promise* to users, and what does the reporting store *guarantee* to downstream consumers? Separating those two contracts is itself a deliverable that does not require implementation architecture to be settled first.

However, development cannot begin — and tickets cannot be sized — without resolving the implementation path. The scope of parallelism between now and that decision is bounded.

### Decision Required Before Development Begins

Three primary paths exist. These are not exhaustive of all possible framings, but they cover the space of realistic options given the team's prior dual-write rejection:

**Path 1 — Real-time is display-only, batch is truth**  
Real-time dashboards show provisional data, labeled as such. Batch numbers are the only ones used for decisions, reports, and downstream systems. No consistency guarantee between the two paths is required or promised. Implementation: separate streaming consumer writes to a hot store; batch pipeline writes to cold store; no reconciliation needed.

**Path 2 — Real-time is truth, batch is deprecated**  
Streaming pipeline becomes the authoritative source. Nightly batch is eliminated or demoted to an audit/replay role. Implementation: streaming aggregations replace batch; replay capability handles late-arriving data.

**Path 3 — Lambda/Kappa architecture with explicit consistency contract**  
Dual-write is accepted, but with a written consistency contract (defined reconciliation window, divergence tolerance, alerting on divergence, explicit SLA for when batch numbers overwrite real-time). This is the previously rejected path — reconsidering it requires explicit sign-off from the team leads who rejected it, with documented rationale for changed conditions.

**Alternative framings** (not enumerated in full here) may exist — for example, a requirements-level rewrite that replaces "source of truth" with a scoped definition (e.g., "authoritative for financial export only") could reduce the conflict surface without choosing between the three paths above. Such framings should be explored in the ADR recommended below.

**Development cannot begin until a path is selected and the receiving team confirms the consistency contract.** Requirements work, user-facing caveat design, and event bus schema investigation can proceed in parallel.

---

## What Is Actionable Now (Pre-Path Decision)

The following can be written, designed, and validated before an implementation path is chosen:

1. **Provisional data labeling contract** — Define what the dashboard promises to users when displaying real-time data. At minimum: is the data labeled as provisional? Is a staleness indicator shown? This is a product decision, not an engineering one, and it constrains all three paths.

2. **Authoritative reporting contract** — Define which downstream consumers treat batch output as authoritative, and what their tolerance is for a reporting lag. Inventorying these consumers (see U2) is the highest-priority parallel workstream.

3. **Shared non-functional requirements** — Retention, availability, idempotency, and backfill requirements are unambiguous across all paths and can be written into shared infrastructure tickets now.

4. **Event bus schema investigation** — Required regardless of path. Can begin immediately.

---

## Functional Requirements (Path-Conditional)

### Shared Requirements (All Paths)

- Pipeline must ingest events from the existing event bus (schema: TBD, see Unknowns)
- Dashboard refresh must reflect events within the latency target (2s for real-time path, N/A for batch-only)
- Nightly batch must complete within the maintenance window (window not yet defined — see Unknowns)
- All aggregations must be idempotent (replay-safe)

### Path 1 Requirements (Real-time display-only)

- Real-time store: hot read path, TTL-based retention (dashboard lookback window only)
- Batch store: cold read path, persistent, source of truth for all report exports and downstream API consumers
- Dashboard UI must display provisional data label when reading from hot store
- No reconciliation service required

### Path 2 Requirements (Streaming as truth)

- Streaming aggregations must handle late-arriving events up to N minutes (N = TBD)
- Watermark strategy must be defined before implementation
- Batch pipeline decommission plan required (separate workstream)

### Path 3 Requirements (Dual-write, if accepted)

- Consistency contract document required before sprint planning
- Divergence alerting: alert if real-time and batch totals diverge by >X% within Y hours of batch close
- Reconciliation window: batch numbers overwrite real-time within Z hours of batch completion
- Rollback plan required for divergence events

---

## Non-Functional Requirements

| Attribute | Target | Notes |
|---|---|---|
| Real-time latency | ≤ 2s p95 event-to-dashboard | Measured at dashboard query, not ingest — see U3 |
| Batch SLA | Complete by 06:00 local | Window not yet confirmed |
| Availability | 99.5% for real-time path | Batch outage ≠ dashboard outage in Path 1/2 |
| Data retention | 90 days queryable | Confirm with compliance |
| Backfill capability | Required | Replay must not break idempotency |

---

## Unknowns & Evidence Gaps

### Critical (blocks path selection)

**U1 — Stakeholder intent on "source of truth"**  
Who authored the nightly-batch-as-source-of-truth requirement, and what problem were they solving? If the intent was auditability and reconciled financials, Path 1 likely satisfies it. If the intent was that real-time numbers must never be acted on, Path 1 may not be sufficient. A scoped rewrite of this requirement (e.g., "authoritative for financial export only") may dissolve the conflict without choosing between the three paths.

**U2 — Downstream consumers of batch output**  
Are there external systems, finance reports, or contractual SLAs that read from the batch store? If yes, Path 2 (deprecating batch) requires a migration plan and potentially renegotiated SLAs. This is a hard dependency and the highest-priority parallel investigation.

**U3 — Definition of "event" for the 2-second SLA**  
Is the 2-second window from event occurrence, event publication to the bus, or event arrival at the pipeline? These differ by potentially 10–30 seconds in the current infrastructure. The SLA as written may be physically impossible without additional instrumentation.

### Important (shapes implementation)

**U4 — Late-arriving event volume and distribution**  
What percentage of events arrive more than 5 minutes after occurrence? This determines watermark strategy feasibility and whether Path 2 is viable without significant infrastructure work.

**U5 — Dashboard query patterns**  
Are users querying pre-aggregated metrics or ad-hoc slices? Pre-aggregated metrics are compatible with streaming materialized views; ad-hoc slices on a hot store at 2s latency require more careful capacity planning.

**U6 — Previous dual-write rejection: documented rationale?**  
Is there a written post-mortem or ADR documenting why dual-write was rejected? If yes, it should be linked here. If no, the rejection rationale must be reconstructed before Path 3 can be fairly evaluated.

**U7 — Maintenance window for batch**  
Nightly batch window start/end time and current runtime not documented in the requirements. Required for SLA definition.

---

## Pass/Fail Readiness

### Readiness Gates

| Gate | Owner | Status |
|---|---|---|
| G1: Path selection (1, 2, or 3) confirmed by product and engineering leads | Product + Eng Lead | OPEN |
| G2: Downstream batch consumers inventoried | Data Engineering | OPEN — parallel workstream can begin now |
| G3: "Source of truth" requirement intent clarified with original author | Product | OPEN — parallel workstream can begin now |
| G4: Late-arriving event data pulled from current pipeline telemetry | Data Engineering | OPEN |
| G5: If Path 3 selected — consistency contract drafted and signed off by team leads who rejected dual-write | Eng Lead | OPEN |
| G6: Provisional data labeling contract defined for dashboard UI | Product | OPEN — can begin now |

### What IS ready

- Shared non-functional requirements (retention, availability, idempotency) can be written into tickets now
- Event bus schema investigation can begin in parallel
- Dashboard provisional-data labeling design can be prototyped under any path
- Downstream consumer inventory (G2) and stakeholder intent clarification (G3) are parallel-safe

### Fail Conditions

This spec **fails** if:
- Development begins on Path 3 without a written consistency contract
- Real-time and batch pipelines are built in parallel with an implicit assumption that they will agree
- The 2-second SLA is accepted as-is without clarifying the event timestamp definition
- The dashboard ships without an explicit user-facing label distinguishing provisional from authoritative data

---

## Recommended Next Artifact

**Artifact: Architecture Decision Record (ADR) — Pipeline Consistency Model**

The PRD cannot advance to sprint planning until the path decision is made. The right vehicle is a lightweight ADR that:

1. States the primary paths (and any alternative requirement framings) with their consistency guarantees and trade-offs
2. Records the team's prior dual-write rejection with its rationale
3. Forces an explicit decision with sign-off from product, engineering, and downstream stakeholders
4. Specifies the consistency contract if Path 3 is chosen
5. Includes a scoped "source of truth" rewrite option for evaluation (may dissolve the conflict at lower implementation cost)

**Suggested format:** One-page ADR (Context / Options / Decision / Consequences)  
**Suggested owner:** Engineering Lead with Product co-sign  
**Suggested deadline:** Before next sprint planning session

Once the ADR is committed, this PRD should be updated to reflect the chosen path and the conditional requirements collapsed to a single implementation spec.

---

## Appendix: Why Dual-Write Is Hard (Reference for Path 3 Evaluation)

For teams considering Path 3 with fresh eyes, the canonical failure modes:

- **Silent divergence:** Real-time and batch produce different totals; no alert fires; stakeholders make decisions on incorrect real-time numbers for days before batch close reveals the gap
- **Reconciliation race conditions:** Batch overwrites real-time at close, but in-flight real-time updates during the overwrite window produce a third, transient state
- **Operational complexity:** Two pipelines means two failure modes, two on-call runbooks, two sets of schema migrations
- **Trust erosion:** Once a divergence event is visible to users, confidence in both numbers degrades even after reconciliation

These are not theoretical — they are the documented failure patterns from the team's prior rejection. Path 3 is viable only with explicit mitigations for each.
