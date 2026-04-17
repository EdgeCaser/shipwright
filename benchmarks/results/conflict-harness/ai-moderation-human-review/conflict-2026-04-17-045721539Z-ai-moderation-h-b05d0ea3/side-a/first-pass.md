# PRD: AI-Assisted Content Moderation System

> **Status:** BLOCKED — contains an unresolved spec conflict that must be resolved before implementation can proceed.

---

## Decision Frame

### The Core Conflict

The current spec contains three requirements that cannot simultaneously be satisfied:

| Requirement | Source |
|---|---|
| AI flags content automatically | Spec |
| A human reviewer must approve every removal decision | Spec |
| Removals must complete within 60 seconds | SLA |

Human review averages 4 hours. Human pre-approval of removals is therefore structurally incompatible with the 60-second SLA. This is not a tuning problem — it is a logical contradiction. No implementation path resolves it without the requesting team choosing which requirement to relax.

### What Must Be Decided

The requesting team must choose one of the following three resolution paths before this spec can be built:

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

### Recommended Path

Path 1 is the most viable starting point for a high-velocity moderation system. It preserves the 60-second SLA, retains meaningful human oversight through mandatory audit, and maps to common industry practice for platform moderation at scale. However, it requires the requesting team to explicitly accept provisional-removal semantics — this is a policy decision, not a technical one, and it must be documented as such.

Path 3 is viable as a Phase 2 refinement once confidence threshold data exists from Path 1 operations.

---

## Unknowns & Evidence Gaps

The following questions are currently unanswered and block final spec lock:

1. **What is the acceptable false-positive rate for AI-driven provisional removals?** The risk tolerance for wrongful removal governs whether Path 1 is acceptable at all. Without a stated tolerance, the spec cannot be evaluated for safety.

2. **What is the content volume and velocity?** Human review queue depth of 4 hours could reflect understaffing, high volume, or both. If volume is low, staffing investment could close the gap and make Path 2 viable.

3. **What are the legal or regulatory obligations driving the "mandatory human review" requirement?** If human pre-approval is legally required (e.g., GDPR, DSA compliance, contractual obligation), Paths 1 and 3 may not be available regardless of technical feasibility.

4. **What is the restoration SLA if a provisional removal is overturned?** Path 1 is incomplete without a defined recovery path. Restoration latency is a user-harm vector that needs its own SLA.

5. **Is the 60-second SLA externally committed or internally aspirational?** An aspirational SLA can be renegotiated; a contractual one cannot. The answer changes which paths are available.

6. **What content categories are in scope?** A system moderating spam has different risk profiles than one moderating potential self-harm content. Category-level risk tiering may change which path applies per content type.

---

## Pass/Fail Readiness

| Criterion | Status | Blocker |
|---|---|---|
| Spec is internally consistent | **FAIL** | 60-second SLA + mandatory human pre-approval are mutually exclusive |
| Decision owner identified | **UNKNOWN** | Resolution path requires a policy decision; owner not named in spec |
| Legal/regulatory constraints documented | **UNKNOWN** | Human review requirement may be legally mandated — not stated |
| False-positive tolerance stated | **FAIL** | Required to evaluate Path 1 risk |
| Restoration/appeals workflow specified | **FAIL** | Required for any provisional-removal implementation |
| Content volume/velocity known | **UNKNOWN** | Required to evaluate Path 2 viability |

**Overall Readiness: NOT READY FOR IMPLEMENTATION**

This spec should not proceed to engineering scoping until the resolution path is chosen and the FAIL items are closed.

---

## Recommended Next Artifact

**Produce a Decision Brief addressed to the product owner and legal/policy stakeholder**, covering:

1. A plain-language summary of the three resolution paths with their tradeoffs.
2. A direct question: Is mandatory human pre-approval a legal/regulatory requirement or a product policy preference?
3. A request for stated false-positive tolerance and content volume data.
4. A proposed timeline for decision (suggest 5 business days to avoid implementation delay).

Once the decision brief is returned with answers, this PRD can be relocked in a single revision pass. Engineering scoping should not begin until that revision is complete.

