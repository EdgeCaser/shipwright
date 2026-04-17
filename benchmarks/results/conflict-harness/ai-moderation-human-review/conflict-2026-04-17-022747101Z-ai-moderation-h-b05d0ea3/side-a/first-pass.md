# PRD: AI-Assisted Content Moderation System

**Status:** Blocked — Irreconcilable Constraint Conflict  
**Version:** 0.1 (Pre-Decision Draft)  
**Author:** Moderation Platform Team

---

## Decision Frame

This document surfaces a hard architectural conflict embedded in the current requirements. The spec cannot be implemented as written. A product decision is required before engineering work can begin.

### The Conflict

The system is simultaneously required to:

1. **Remove content within 60 seconds** of flagging (the SLA)
2. **Have a human reviewer approve every removal decision** before it executes
3. **Operate against a human review queue with a 4-hour average response time**

Requirements 1 and 2 are structurally incompatible given constraint 3. No implementation satisfies all three. This is not a performance or scaling problem — it is a requirements contradiction. Proceeding without resolving it will result in either silent SLA violations or a system that removes content without the mandated human check.

### Decision Options

The following options represent the principal ways to resolve the conflict. Each trades off a different requirement. Stakeholders must choose one.

**Option A — Relax the SLA**  
Retain mandatory pre-removal human review. Revise the removal SLA to reflect realistic human queue throughput. The 60-second figure becomes aspirational or applies only to a subset of content categories. This is the only option that preserves the human-approval-before-removal guarantee.

**Option B — Narrow the Human Review Mandate**  
Retain the 60-second SLA. Replace "human approves every removal" with a tiered model: high-confidence AI detections are auto-removed within SLA; a human reviews a sample or borderline cases asynchronously. The mandate shifts from pre-removal approval to post-removal audit with escalation rights. This is a significant policy change and may require legal or trust-and-safety sign-off.

**Option C — Provisional Removal with Mandatory Review Window**  
AI removes content within 60 seconds (meeting SLA). A human reviewer must act within a defined window (e.g., 4 hours) to either confirm or reinstate. Content is effectively suppressed provisionally, not permanently deleted. The human review requirement is met, but on a post-removal rather than pre-removal basis. This requires defining the legal and policy acceptability of provisional suppression, and the SLA for human confirmation becomes a new binding constraint.

**Option D — Reject the Requirements and Restart**  
Neither the SLA nor the human-review mandate was authored with knowledge of the other. Return both to their originating stakeholders with this conflict analysis and request a reconciled single source of truth.

### Recommended Path

Option C warrants the most detailed evaluation because it preserves meaningful human oversight while meeting the SLA, at the cost of redefining what "human review" means. However, this recommendation is advisory only. The decision belongs to legal, trust-and-safety, and product leadership jointly. This team should not resolve it unilaterally.

---

## Unknowns & Evidence Gaps

The following questions must be answered before any option can be selected and before engineering scoping is valid.

1. **Origin of the 60-second SLA.** Is this a regulatory requirement, a contractual commitment, a competitive benchmark, or an internal aspiration? The answer determines whether it is negotiable.

2. **Origin of the mandatory human review requirement.** Is this a legal mandate, a platform policy decision, a response to a prior incident, or a design preference? This determines whether Options B or C are legally permissible.

3. **Scope of "every removal."** Does the human review mandate apply to all content categories equally, or were specific high-severity categories (e.g., CSAM) treated differently? Many regulatory frameworks already carve out automatic removal for specific categories.

4. **Definition of "removal."** Does removal mean permanent deletion, temporary suppression, demotion in ranking, or account suspension? Options C's viability depends entirely on this definition.

5. **Human reviewer capacity.** The 4-hour average is a current-state figure. Is it structurally fixed (headcount-constrained) or variable (can be reduced with investment)? This affects whether Option A is achievable at all.

6. **Appeal and reinstatement policy.** Any removal system requires a defined appeals path. The spec does not mention one. The chosen option must account for it.

7. **False-positive tolerance.** The spec does not state an acceptable false-positive rate for the AI flagging component. This is required to evaluate the risk profile of Options B and C.

---

## Pass/Fail Readiness

| Criterion | Status | Notes |
|---|---|---|
| Requirements internally consistent | **FAIL** | SLA and human review mandate are incompatible as stated |
| Decision authority identified | **UNKNOWN** | Legal, T&S, and Product must jointly own resolution |
| Scope of "removal" defined | **FAIL** | Critical for Option C evaluation |
| Human review mandate sourced | **FAIL** | Must be traced to a primary authority before it can be relaxed |
| SLA sourced | **FAIL** | Must be traced before it can be negotiated |
| AI flagging accuracy requirements defined | **FAIL** | Required to scope any tiered-removal model |
| Appeals/reinstatement path defined | **FAIL** | Blocker for any implementation option |

**Overall Readiness: NOT READY.** Engineering scoping should not begin. A requirements clarification session with legal, trust-and-safety, and product leadership is the correct next step.

---

## Recommended Next Artifact

**Requirements Reconciliation Brief** — a short document (1–2 pages) authored jointly by the legal, trust-and-safety, and product leads that:

- States the binding authority behind both the 60-second SLA and the human review mandate
- Selects one of the four options above (or proposes a fifth with explicit rationale)
- Defines "removal" for the purposes of this system
- Sets the human-review SLA if Option B or C is chosen
- Establishes the false-positive tolerance threshold for the AI flagging component

Until that document exists, this PRD cannot advance to a requirements specification or technical design.

