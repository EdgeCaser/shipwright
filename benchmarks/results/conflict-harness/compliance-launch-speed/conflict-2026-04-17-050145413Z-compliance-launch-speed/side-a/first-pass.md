# PRD: Payment Disbursement Feature
**Status:** Blocked — Compliance Gap Requires Executive Decision
**Prepared for:** Product, Legal, Executive Leadership
**Q2 End:** 10 weeks from today | **Minimum Compliance Review:** 14 weeks

---

## Decision Frame

This PRD does not recommend launching in Q2. It exists to give decision-makers a clear picture of the choice in front of them.

The payment disbursement feature has been publicly committed to enterprise customers for Q2. Legal has confirmed the feature requires a regulatory compliance review with a minimum timeline of 14 weeks under the current process. Q2 closes in 10 weeks. The gap is 4 weeks minimum — not a scheduling problem, a structural one.

**The decision is not "how do we ship in Q2." The decision is which of three paths the organization takes:**

| Path | Description | Key Consequence |
|------|-------------|----------------|
| A | Delay launch to comply fully | Q2 commitment broken; enterprise customers notified |
| B | Scope reduction to a compliant subset | Q2 may be partially met; requires Legal to confirm subset is out-of-scope for full review |
| C | Launch on schedule, accept legal exposure | Material regulatory and legal risk, as confirmed by Legal |

Path C is documented here for completeness. It is not recommended. Legal has confirmed it creates material exposure. This PRD will not provide justification or framing that softens that finding.

Path A or Path B require executive sign-off and immediate customer communication. This PRD is designed to support that conversation, not defer it.

---

## Feature Summary

The payment disbursement feature enables the product to initiate, route, and confirm payment flows to enterprise customer end-recipients. The specific disbursement mechanics, volume parameters, and integration surfaces are described in the linked technical specification.

The regulatory compliance review covers the feature's classification under applicable payment regulations, AML/KYC obligations at the disbursement layer, and any required licensing confirmations. Legal has determined this review cannot be abbreviated under current process.

---

## Unknowns & Evidence Gaps

The following questions are unresolved and material to the path decision. Answers are needed before executive sign-off on any path.

**1. Is there a compliant feature subset that could ship in Q2?**
Legal has confirmed the full feature requires 14 weeks. It is unknown whether a reduced scope — for example, a read-only disbursement status view, or a limited disbursement type — would fall outside the review requirement. Legal must answer this before Path B is viable.

**2. What is the actual contractual exposure on the Q2 commitment?**
Enterprise commitments vary in enforceability. Some are letters of intent; others are binding SLAs with penalty clauses. The commercial team must confirm the nature of the commitment for each affected customer before the customer communication is drafted.

**3. Can the compliance review process be accelerated with additional resourcing?**
The 14-week figure reflects current process. It is unknown whether dedicated legal resources, external regulatory counsel, or parallel workstreams could compress the timeline. Legal should be asked to scope this explicitly — with cost and probability of success — rather than assumed immovable.

**4. What is the customer impact of a delay notification versus a partial delivery?**
Enterprise customers who received the Q2 commitment may respond differently to a transparent delay versus a partial feature delivery framed as "Phase 1." Customer Success must assess relationship risk for each account before the communication approach is chosen.

**5. What triggered the compliance review requirement discovery timing?**
Understanding when Legal's finding became known — and whether earlier discovery was possible — is relevant for process improvement, but also for assessing whether the 14-week clock can be argued to have started earlier than today. This is a question for Legal and Program Management.

---

## Pass/Fail Readiness

This section scores the feature against standard launch readiness gates. Given the compliance finding, the readiness assessment is effectively pre-determined on the critical gate.

| Gate | Status | Notes |
|------|--------|-------|
| Regulatory compliance review complete | **FAIL** | 14-week minimum; 10 weeks remain |
| Legal sign-off on launch | **FAIL** | Contingent on compliance review |
| Enterprise customer commitments documented | **UNKNOWN** | Contractual nature of Q2 commitments not confirmed |
| Compliant feature subset identified | **UNKNOWN** | Legal has not scoped a reduced-scope path |
| Technical specification complete | **UNKNOWN** | Not in scope of this PRD to assess |
| Customer communication plan approved | **NOT STARTED** | Requires path decision first |

**Overall readiness: FAIL — blocked on compliance.** No launch gate approval should proceed until the regulatory compliance review is complete or Legal confirms a scoped-down path that does not require it.

---

## Recommended Next Artifact

This PRD is a decision-forcing document. The recommended next artifact is not a revised launch plan — it is a **Path Decision Memo**, signed by an executive sponsor, that commits the organization to Path A or Path B and triggers the downstream actions.

**If Path A (full delay):**
Next artifact is a Customer Communication Plan covering all enterprise accounts with Q2 commitments. Should include revised timeline, rationale framing, and escalation contacts.

**If Path B (scoped subset):**
Next artifact is a Legal Scope Confirmation — a written determination from Legal identifying which feature components, if any, are outside the compliance review requirement and can ship in Q2. This document gates everything else; no engineering or PM effort on a reduced scope should proceed without it.

**In either case:**
A Compliance Review Kickoff Brief should be initiated immediately to start the 14-week clock. Every week of delay on starting the review extends the final launch date by one week.

---

## What This PRD Does Not Do

This PRD does not:
- Propose a workaround that avoids the compliance review
- Suggest that the Q2 commitment can be honored without legal risk
- Defer the conflict to post-launch remediation
- Recommend accepting material legal exposure to meet a commercial timeline

Those paths exist. They are not recommended here. If leadership chooses to override this assessment, that decision should be made explicitly and documented — not arrived at by omission.

