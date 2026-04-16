# PRD: AI-Assisted Content Moderation with Human Review

**Status:** Draft — Requires Stakeholder Resolution Before Engineering Handoff
**Version:** 0.2
**Owner:** Trust & Safety Product

---

## Decision Frame

### The Core Conflict

This spec contains a structural contradiction that cannot be resolved through engineering alone. Before a single line of code is written, stakeholders must choose which constraint to relax:

| Constraint | As Written | Implied Requirement |
|---|---|---|
| Removal SLA | 60 seconds | Automated execution capability |
| Human approval gate | Every removal | Human in the loop *before* action |
| Human queue depth | 4-hour avg response | Human is a bottleneck, not a gate |

**The gap is 239x.** A 60-second SLA and a 4-hour human pre-authorization cycle cannot both be mandatory on the same decision path. One of them must be relaxed. This PRD exists to force that determination.

**Important framing correction:** The phrase "approve every removal decision" in the spec reads as pre-removal authorization — a human gate that must be cleared before the AI acts. Any architecture that substitutes post-removal confirmation for pre-removal authorization does not satisfy the spec as written; it rewrites the spec. The resolution paths below are honest about which paths comply with the spec as written and which require stakeholder agreement to reinterpret it.

### Three Resolution Paths

Stakeholders must select one. Each has a fundamentally different risk posture and compliance interpretation.

**Path 1 — Accelerated Human Queue (Spec-Compliant)**
Keep the mandatory pre-approval gate. Reduce human queue time to under 60 seconds through dedicated staffing, on-call reviewer pools, or contractor surge capacity.

- Compliance posture: Fully satisfies the spec as written. No reinterpretation required.
- Risk: Operationally expensive; queue SLA degrades under volume spikes; does not scale with content growth
- Mitigation: Dynamic staffing model, volume forecasting, hard queue capacity limits that throttle ingestion before SLA is breached
- Open question: What staffing model and cost structure are required to hold a <60s queue at peak load?

**Path 2 — Tiered SLA by Content Category (Partial Reinterpretation)**
The AI assigns a confidence and category tier. Only Tier 1 (e.g., CSAM, credible imminent threat) triggers pre-approved auto-removal — where the "human approval" is operationalized as a standing policy authorization from legal/trust-and-safety leadership rather than per-item reviewer sign-off. Tier 2 (policy-ambiguous) routes to human review with a relaxed SLA (e.g., 30 minutes). Tier 3 (low confidence) receives async review with no immediate action.

- Compliance posture: Requires legal agreement that standing policy authorization satisfies "human reviewer approves every removal." This is a reinterpretation of the spec, not a literal reading.
- Risk: Defining confidence bands is a hard calibration problem; Tier 1 scope creep is common; regulators may not accept the standing-authorization interpretation
- Mitigation: Quarterly band audits, locked Tier 1 taxonomy with legal sign-off, explicit regulatory pre-clearance
- Open question: Will applicable regulators (DSA, NetzDG, platform agreements) accept standing policy authorization as equivalent to per-item human review?

**Path 3 — Provisional Removal (Requires Spec Rewrite)**
The AI removes content immediately upon high-confidence flag. Human reviewers confirm or restore within a defined window (e.g., 4 hours). The 60-second SLA is met; the human reviews retroactively.

- Compliance posture: Does **not** satisfy "approve every removal decision" as written. This path requires explicit stakeholder agreement to rewrite the requirement before it can be implemented. Calling this a "resolution" without that agreement would be misleading.
- Risk: Content creators experience wrongful removal during the review window; potential regulatory non-compliance
- Mitigation: Publisher notification + expedited appeals queue; legal opinion confirming post-removal review satisfies applicable obligations
- Open question: Is there a legal or regulatory basis — specific to the applicable jurisdictions and platform agreements — under which post-removal confirmation satisfies the human-approval requirement? This must be answered in writing before this path can be recommended.
- Note: Some platforms operate under this model under specific regulatory frameworks (e.g., DSA's tiered obligations). However, whether it applies here depends on jurisdiction, content category, and the specific contractual language in this spec — which are unknown from the scenario as presented.

### Position on Recommendation

This PRD does not recommend a path. The first-pass draft recommended Path 3 (Provisional Removal) as the "correct resolution" and "standard industry model." That framing was wrong: it asserted a legal and regulatory acceptability that is not established by the scenario facts, and it effectively reinterpreted the spec without acknowledging doing so. The correct artifact for choosing between these paths is a decision meeting that includes legal counsel — not a product spec that picks a path and calls it standard.

Path 1 is the only spec-compliant option without legal reinterpretation. If Path 1 is operationally unacceptable, the stakeholder group must explicitly authorize a spec change before Paths 2 or 3 can be pursued.

---

## Functional Specification (Conditional on Path Selection)

This section will be completed after path selection. The following applies regardless of path chosen:

### AI Flagging Layer (All Paths)

- **Input:** Content submission event stream (text, image, video metadata)
- **Output:** `{content_id, flag_reason, confidence_score, confidence_tier, recommended_action, evidence_snapshot}`
- **Latency target:** Flag decision ≤5 seconds from submission
- **Explainability requirement:** Every flag must include a human-readable reason string referencing a specific policy clause

### Human Review Layer (Path-Dependent)

- Path 1: Reviewer receives flag within seconds; decision required within 60 seconds; removal executes on reviewer approval
- Path 2: Tier 1 executes on standing authorization; Tier 2 reviewer decision required within 30 minutes; Tier 3 async
- Path 3: Reviewer confirms or restores within 4 hours; restoration triggers publisher notification and audit log

### Audit & Compliance (All Paths)

- Every decision (AI and human) logged immutably with timestamp, actor, confidence score, policy reference
- Weekly false-positive/false-negative rate reports
- Quarterly confidence band recalibration with legal and policy sign-off

---

## Unknowns & Evidence Gaps

### High Priority — Blocks Architecture Decision

1. **What does "approve every removal decision" mean under applicable regulations and the platform's legal obligations?** This is the load-bearing question. If pre-removal authorization is legally required, Path 3 is non-compliant and Path 1 or a very narrow Path 2 are the only options. If post-removal confirmation satisfies applicable requirements, Path 3 becomes viable. **Required:** Written legal opinion from counsel familiar with DSA, NetzDG, and any platform-specific regulatory agreements before architecture decision.

2. **What is the actual false-positive rate at each confidence threshold on production content distribution?** The tiered model (Path 2) depends on Tier 1 being calibrated tightly enough that wrongful removals are rare. Threshold numbers are placeholders without offline evaluation on labeled data. **Required:** Model evaluation on labeled dataset representing production content distribution.

3. **What is peak-load queue behavior?** The 4-hour average may mask multi-day depth during viral content incidents. A staffing model for Path 1 cannot be sized without this. **Required:** Volume forecasting model and queue stress test.

### Medium Priority — Blocks Calibration

4. **What content categories are in scope?** Hate speech, CSAM, spam, misinformation, copyright, and self-harm have different confidence thresholds, regulatory obligations, and reviewer expertise requirements. A single undifferentiated system is likely wrong.

5. **Who owns the Tier 1 taxonomy definition?** Without a named owner and governance process, scope will drift under operational pressure. This is an ownership question, not an engineering question.

6. **What is the publisher notification SLA?** Speed of notification affects appeals volume and legal exposure. Not specified in the scenario.

### Low Priority — Deferred

7. Reviewer tooling budget and platform selection (existing vs. custom).
8. Data retention requirements for evidence snapshots by jurisdiction and content type.

---

## Pass/Fail Readiness

**Current status: BLOCKED**

Two gates must clear before engineering handoff:

| Gate | Owner | Condition |
|---|---|---|
| Legal opinion | Legal counsel | Written determination of whether pre-removal or post-removal human review satisfies applicable obligations |
| Architecture decision | Stakeholder group (Legal, Policy, Product, Eng leads) | Select path with explicit acknowledgment of spec change if Path 2 or 3 is chosen |

Once those two gates clear, the following can proceed:

| Track | Ready? | Condition |
|---|---|---|
| AI model calibration | Yes, start now | Offline eval on labeled dataset to establish threshold candidates |
| Reviewer tooling scoping | Yes, start now | Platform selection and workflow design |
| Volume forecasting | Yes, start now | Historical flagging data analysis |
| Engineering architecture | Blocked | Requires path decision |
| Staffing model | Blocked | Requires volume forecast + path decision |

**Estimated time to engineering-ready PRD:** 2–3 weeks post stakeholder alignment meeting.

---

## Recommended Next Artifact

**An Architecture Decision Record (ADR)** co-authored by Legal, Policy, and Engineering that:

1. States the chosen path (1, 2, or 3) with explicit acknowledgment of which spec requirements are satisfied as written vs. reinterpreted
2. Documents the legal opinion on pre-removal vs. post-removal human review, including jurisdiction scope
3. Records dissenting positions if alignment is incomplete
4. Sets the confidence threshold calibration target (e.g., Tier 1 false-positive rate ≤ 0.1%) as a go/no-go condition for any auto-action path

This PRD cannot be meaningfully revised until that ADR exists.

---

## Revision Note

v0.1 of this PRD recommended Provisional Removal (Path 3) as the "correct resolution" and characterized it as the "standard industry model." That framing has been retracted. The recommendation assumed legal and regulatory acceptability that is not established by the scenario facts, and it reinterpreted "approve every removal decision" as post-removal confirmation without disclosing that the plain reading requires pre-removal authorization. The corrected position is that path selection requires a legal opinion, and no path can be recommended without one.
