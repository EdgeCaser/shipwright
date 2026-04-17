# PRD: AI-Assisted Content Moderation System

> **Status:** BLOCKED — contains an unresolved spec conflict that must be resolved before implementation can proceed.

---

## Decision Frame

### The Core Conflict

The current spec contains three requirements that cannot be simultaneously satisfied under the documented operating model:

| Requirement | Source |
|---|---|
| AI flags content automatically | Spec |
| A human reviewer must approve every removal decision | Spec |
| Removals must complete within 60 seconds | SLA |

The human review queue currently averages 4 hours. Under this operating model, mandatory human pre-approval of removals is structurally incompatible with the 60-second SLA. This is not a tuning problem — it is a conflict that requires an explicit decision. Whether that conflict is resolvable through staffing, dedicated fast lanes, or escalation rules is itself an open question (see Unknowns below), but it cannot be assumed away during spec design. The requesting team must either confirm an operational path that closes the gap or choose which requirement to relax.

### What Must Be Decided

The requesting team must choose one of the following resolution paths before this spec can be built:

**Path 1 — Provisional Removal (AI acts first, human reviews after)**
The AI removes content within the 60-second SLA. Human reviewers audit removals within an agreed post-hoc window (e.g., 4 hours). Overturned removals trigger content restoration and creator notification. "Mandatory human review" is reframed as a mandatory reversal window, not a pre-approval gate.

- Meets 60-second SLA.
- Requires accepting that some removals will be wrong until overturned.
- Requires a defined restoration SLA and appeals workflow.
- Shifts human review from a gate to an audit.

**Path 2 — SLA Renegotiation (accept human-gated latency)**
The 60-second SLA is renegotiated to reflect actual human review capacity. The SLA is redefined as the time from AI flag to human decision, not to removal execution.

- Preserves mandatory pre-approval semantics.
- Requires stakeholder agreement that the 60-second SLA is not binding for human-reviewed decisions.
- May be suitable if the content category is low-velocity or high-stakes (e.g., legal hold content).

**Path 3 — Tiered Authorization (SLA tier by AI confidence)**
High-confidence AI decisions (above a defined threshold) proceed to removal without human pre-approval. Decisions below threshold enter the human review queue with an extended SLA.

- Partial SLA compliance (fast tier meets 60 seconds; slow tier does not).
- Requires defining confidence threshold and its validation methodology.
- Introduces a two-tier system that must be governed and audited separately.
- Shifts risk: miscalibrated thresholds silently route content to wrong tier.

**Path 4 — Operational Remediation (close the gap through resourcing)**
If burst capacity, dedicated review lanes, or escalation rules can reduce human review latency to under 60 seconds for the relevant content class, the spec conflict dissolves without relaxing any stated requirement. This path is currently unverified — see Unknowns.

- Preserves all stated requirements if feasible.
- Requires evidence that the 4-hour average is reducible to under 60 seconds for this content class.
- Requires staffing and tooling investment that is currently unscoped.

### Recommended Path

Path 1 is the most viable starting point for a high-velocity moderation system given documented queue capacity. It preserves the 60-second SLA, retains meaningful human oversight through mandatory audit, and maps to common practice for platform moderation at scale. However, it requires the requesting team to explicitly accept provisional-removal semantics — this is a policy decision, not a technical one.

Path 4 should be investigated in parallel before Path 1 is committed: if operational remediation is feasible, it avoids requiring any requirement relaxation. If it is not feasible, Path 1 becomes the default recommendation.

Path 3 is viable as a Phase 2 refinement once confidence threshold data exists from Path 1 operations.

---

## Unknowns & Evidence Gaps

The following questions are currently unanswered and block final spec lock:

1. **Can human review latency be reduced to under 60 seconds for this content class through operational changes?** The 4-hour average may reflect queue volume, staffing, tooling, or content mix. If burst capacity or dedicated fast lanes exist for high-priority content, the conflict may be resolvable without relaxing any requirement. This is the first question to answer before committing to a resolution path.

2. **What are the legal or regulatory obligations driving the "mandatory human review" requirement?** If human pre-approval is legally required (e.g., DSA compliance, contractual obligation), Paths 1 and 3 may not be available regardless of technical feasibility.

3. **What is the acceptable false-positive rate for AI-driven provisional removals?** Required to evaluate whether Path 1 is acceptable at all. Without a stated tolerance, the spec cannot be evaluated for safety.

4. **Does the 4-hour average apply to the same content class covered by the 60-second SLA?** If the queue handles a broader content mix, the relevant latency for this specific content class may differ.

5. **What is the restoration SLA if a provisional removal is overturned?** Path 1 is incomplete without a defined recovery path. Restoration latency is a user-harm vector that needs its own SLA.

6. **Is the 60-second SLA externally committed or internally aspirational?** A contractual SLA cannot be renegotiated; an aspirational one can. The answer determines whether Path 2 is available.

7. **What content categories are in scope?** Risk profiles differ significantly across content types. Category-level tiering may change which path applies per content type.

---

## Pass/Fail Readiness

| Criterion | Status | Blocker |
|---|---|---|
| Spec is internally consistent under current operating model | **FAIL** | 60-second SLA + mandatory human pre-approval conflict at 4-hour queue depth |
| Operational remediation feasibility assessed | **UNKNOWN** | Required before committing to a resolution path |
| Decision owner identified | **UNKNOWN** | Resolution requires a policy decision; owner not named in spec |
| Legal/regulatory constraints documented | **UNKNOWN** | Human review requirement may be legally mandated — not stated |
| False-positive tolerance stated | **FAIL** | Required to evaluate Path 1 risk |
| Restoration/appeals workflow specified | **FAIL** | Required for any provisional-removal implementation |
| Content volume/velocity and queue composition known | **UNKNOWN** | Required to evaluate whether 4-hour average applies to this content class |

**Overall Readiness: NOT READY FOR IMPLEMENTATION**

This spec should not proceed to engineering scoping until the resolution path is chosen and the FAIL items are closed.

---

## Recommended Next Artifact

**Produce a Decision Brief addressed to the product owner, operations lead, and legal/policy stakeholder**, covering:

1. A plain-language summary of the four resolution paths with their tradeoffs.
2. A direct question to operations: Can human review latency for this content class be reduced to under 60 seconds through staffing, tooling, or escalation rules? What would that require?
3. A direct question to legal/policy: Is mandatory human pre-approval a regulatory requirement or a product policy preference?
4. A request for stated false-positive tolerance and content volume/composition data.
5. A proposed decision timeline (suggest 5 business days to avoid implementation delay).

Once the decision brief is returned with answers, this PRD can be relocked in a single revision pass. Engineering scoping should not begin until that revision is complete.

