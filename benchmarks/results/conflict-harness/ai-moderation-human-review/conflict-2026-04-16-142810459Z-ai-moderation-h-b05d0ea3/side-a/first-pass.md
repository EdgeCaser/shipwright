# PRD: AI-Assisted Content Moderation with Human Review

**Status:** Draft — Requires Stakeholder Resolution Before Engineering Handoff
**Version:** 0.1
**Owner:** Trust & Safety Product

---

## Decision Frame

### The Core Conflict

This spec contains a structural contradiction that cannot be resolved through engineering alone. Before a single line of code is written, stakeholders must choose which constraint to relax:

| Constraint | As Written | Implied Requirement |
|---|---|---|
| Removal SLA | 60 seconds | Automated execution capability |
| Human approval gate | Every removal | Human in the loop before action |
| Human queue depth | 4-hour avg response | Human is a bottleneck, not a gate |

**The gap is 239x.** A 60-second SLA and a 4-hour human review cycle cannot both be mandatory on the same decision path. One of them is aspirational; this PRD exists to force that determination.

### Three Resolution Paths

Stakeholders must select one. Each has a fundamentally different risk posture.

**Path 1 — Provisional Removal (Recommended)**
The AI removes content immediately upon high-confidence flag. Human reviewers confirm or restore within a defined window (e.g., 4 hours). The 60-second SLA is met; the human retains final authority but acts retroactively, not as a gate. False positives are recoverable. This is how most scaled platforms operate under regulatory pressure.

- Risk: Content creators experience wrongful removal during the review window
- Mitigation: Publisher notification + expedited appeals queue
- Regulatory fit: Satisfies DSA/NetzDG removal-speed requirements; human review satisfies due-process requirements

**Path 2 — Tiered SLA by Confidence Band**
The AI assigns a confidence tier. Only Tier 1 (e.g., CSAM, credible imminent threat) triggers auto-removal within 60 seconds. Tier 2 (policy-ambiguous) routes to human review with a relaxed SLA (e.g., 30 minutes with queue prioritization). Tier 3 (low confidence) gets async review.

- Risk: Defining confidence bands is a hard calibration problem; Tier 1 scope creep is common
- Mitigation: Quarterly band audits, locked Tier 1 taxonomy with legal sign-off
- Regulatory fit: Requires documented band definitions to withstand audit

**Path 3 — Accelerated Human Queue**
Keep the mandatory pre-approval gate but invest in reducing human queue time to under 60 seconds (dedicated staffing, on-call reviewer pools, contractor surge capacity).

- Risk: Operationally expensive; queue SLA degrades under volume spikes; does not scale
- Mitigation: Dynamic staffing model, volume forecasting
- Regulatory fit: Cleanest compliance posture; highest cost and fragility

### Recommended Path

Path 1 (Provisional Removal) with Path 2 tiering for high-stakes categories. This decouples the speed obligation from the accountability obligation. The 60-second SLA is met by the AI; the human review obligation is met asynchronously within a defined restoration window. This is not a workaround — it is the standard industry model for operating under simultaneous speed and due-process requirements.

---

## Functional Specification (Path 1 + Path 2 Hybrid)

### AI Flagging Layer

- **Input:** Content submission event stream (text, image, video metadata)
- **Output:** `{content_id, flag_reason, confidence_score, confidence_tier, recommended_action, evidence_snapshot}`
- **Confidence tiers:**
  - Tier 1 (≥0.97): Auto-remove, notify publisher, create human review record
  - Tier 2 (0.80–0.96): Soft-suppress (reduce distribution), escalate to priority human queue, SLA 30 minutes
  - Tier 3 (<0.80): Log, async human review queue, no immediate action
- **Latency target:** Flag decision ≤5 seconds from submission
- **Explainability requirement:** Every flag must include a human-readable reason string referencing a specific policy clause

### Human Review Layer

- **Tier 1 reviews:** Confirmation or restoration within 4 hours. Restorations trigger publisher notification and audit log entry.
- **Tier 2 reviews:** Decision required within 30 minutes. Reviewer sees AI confidence score, evidence snapshot, policy clause, and publisher history.
- **Reviewer tooling requirements:** One-click confirm/restore, policy reference panel, escalation path to legal hold
- **Queue management:** Priority routing by tier; Tier 1 restorations surfaced above new Tier 2 decisions

### Appeals

- Publisher-facing appeal form, triggered automatically on Tier 1 removal notification
- Appeal routes to separate reviewer (not original AI flag)
- Appeal resolution SLA: 24 hours

### Audit & Compliance

- Every decision (AI and human) logged immutably with timestamp, actor, confidence score, policy reference
- Weekly false-positive/false-negative rate reports by tier
- Quarterly confidence band recalibration with legal and policy sign-off

---

## Unknowns & Evidence Gaps

### High Priority — Blocks Architecture

1. **What is the actual false-positive rate at each confidence threshold?** The entire tiered model depends on Tier 1 being calibrated tightly enough that wrongful removals are rare. Without model benchmarks on production content distribution, the threshold numbers in this PRD are placeholders. **Required:** Offline evaluation on labeled dataset before thresholds are hardcoded.

2. **What is the legal definition of "human approval" in applicable jurisdictions?** If the DSA, NetzDG, or platform-specific regulator requires pre-removal human approval (not post-removal confirmation), Path 1 fails compliance and Path 3 becomes mandatory regardless of cost. **Required:** Legal opinion from EU and relevant national counsel before architecture decision.

3. **What is the actual volume and distribution of flagged content?** The 4-hour human queue SLA is an average — peak load behavior is unknown. A queue that handles 100 items/hour at 4-hour avg may hit 40-hour avg during a viral content incident. **Required:** Volume forecasting model and queue stress test before staffing model is finalized.

### Medium Priority — Blocks Calibration

4. **What content categories are in scope?** "Content moderation" encompasses hate speech, spam, CSAM, misinformation, copyright, self-harm, and more. Confidence thresholds, regulatory obligations, and reviewer expertise differ by category. A single undifferentiated system is likely wrong.

5. **What is the publisher notification SLA?** Publishers need to know when content is removed and why. The speed of that notification affects appeals volume and legal exposure. Not specified.

6. **Who owns the Tier 1 taxonomy?** Legal? Policy? Trust & Safety ops? If this is unowned, Tier 1 scope will drift in both directions under pressure.

### Low Priority — Deferred

7. What is the reviewer tooling budget? Does an existing moderation platform (e.g., Salesforce Content Moderation, Jira Service Management) cover the workflow, or is custom tooling required?

8. What are the data retention requirements for evidence snapshots? Varies by jurisdiction and content type.

---

## Pass/Fail Readiness

**Current status: BLOCKED**

This PRD is not ready for engineering handoff. Two gates must clear first:

| Gate | Owner | Condition |
|---|---|---|
| Architecture decision | Stakeholder group (Legal, Policy, Product, Eng leads) | Select Path 1, 2, or 3 and sign off | 
| Legal opinion on pre-approval requirement | Legal counsel | Written opinion on whether post-removal human confirmation satisfies applicable regulations |

Once those two gates clear, the following can proceed in parallel:

| Track | Ready? | Condition |
|---|---|---|
| AI model calibration | Yes, can start now | Offline eval on labeled dataset to establish threshold candidates |
| Reviewer tooling scoping | Yes, can start now | Platform selection and workflow design |
| Volume forecasting | Yes, can start now | Historical flagging data analysis |
| Engineering architecture | Blocked | Requires architecture decision |
| Staffing model | Blocked | Requires volume forecast + architecture decision |

**Estimated time to engineering-ready PRD:** 2–3 weeks post stakeholder alignment meeting.

---

## Recommended Next Artifact

**An Architecture Decision Record (ADR)** co-authored by Legal, Policy, and Engineering that:

1. States the chosen path (1, 2, or 3) with explicit acknowledgment of the tradeoff being accepted
2. Documents the legal opinion on pre-removal vs post-removal human review
3. Records dissenting positions if alignment is incomplete
4. Sets the confidence threshold calibration target (e.g., Tier 1 false-positive rate ≤ 0.1%)

This PRD cannot be meaningfully revised until that ADR exists. Attempting to engineer against the current spec will produce a system that satisfies neither the 60-second SLA nor the human review requirement — it will simply hide the conflict in implementation debt.

---

## Appendix: Why This PRD Does Not Pick a Final Number

Stakeholders sometimes expect a PRD to paper over requirement conflicts with confident-sounding specifications. This document declines to do that. The 60-second SLA and the mandatory human pre-approval gate are not a calibration problem — they are a policy problem. The right artifact for a policy problem is a decision meeting with documented outcomes, not a product spec with placeholder thresholds. This PRD's job is to make that meeting unavoidable and productive.
