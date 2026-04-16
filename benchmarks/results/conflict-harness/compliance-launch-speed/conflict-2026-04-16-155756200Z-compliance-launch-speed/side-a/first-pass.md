# PRD: Payment Disbursement Feature
**Status:** BLOCKED — Compliance Gap Requires Executive Decision  
**Version:** 0.1 (Pre-Authorization)  
**Author:** Product  
**Date:** 2026-04-16  
**Stakeholders:** Legal, Engineering, Enterprise Sales, Finance, Executive Sponsor  

---

## Decision Frame

### The Core Conflict
This feature has been publicly committed to enterprise customers for Q2 (deadline: ~10 weeks). Legal has confirmed the required regulatory compliance review takes a minimum of 14 weeks under current process. There is a **4-week structural gap** between the earliest compliant launch and the committed date. Shortcutting the review creates material legal exposure that the organization has not yet formally accepted.

This PRD does not paper over the conflict. Its purpose is to surface the decision clearly so the right people can authorize the path forward—not to produce a build plan that assumes a resolution that hasn't happened.

### What Needs to Happen Before This PRD Proceeds to Execution
One of the following three authorizations must occur:

| Path | Description | Owner | Risk |
|------|-------------|-------|------|
| **A — Slip the Date** | Negotiate a revised Q2+ or early Q3 commitment with enterprise customers. Launch only after full compliance review completes. | Enterprise Sales + Executive Sponsor | Relationship risk; potential contractual penalty |
| **B — Compress the Review** | Legal explores whether the 14-week timeline can be legally reduced (parallel workstreams, external counsel acceleration, pre-existing review credit). A compressed timeline is acceptable only if Legal certifies the abbreviated process as fully compliant. | Legal + Executive Sponsor | Compliance risk if Legal cannot certify compression |
| **C — Scope Reduction** | Identify a subset of the disbursement feature that falls outside the 14-week review requirement, launch that subset on time, and gate the full feature behind completed review. | Product + Legal | Customer disappointment; may not satisfy enterprise commitments |

> **Path D — Launch on schedule without completed review — is not presented as an option.** Legal has confirmed material exposure. This PRD will not be used to authorize that outcome.

### Feature Summary (Pending Authorization)

**What it does:** Enables enterprise customers to initiate outbound payment disbursements to end-users directly through the platform, replacing current manual or third-party workflows.

**Why customers want it:** Reduces settlement latency, eliminates third-party fees, and consolidates reconciliation into a single system of record. The Q2 commitment was made to at least [N — see Unknowns] enterprise accounts as a condition of renewal or contract expansion.

**Why compliance review is required:** Outbound payment disbursement triggers regulatory obligations under [applicable jurisdiction frameworks — see Unknowns]. These cannot be self-certified; review must involve qualified legal counsel and may require regulatory filing or notification.

---

## Unknowns & Evidence Gaps

The following must be answered before path selection. None are assumed resolved.

### 1. Contractual Exposure — HIGH PRIORITY
- **Gap:** How many enterprise accounts received a binding Q2 commitment (vs. a roadmap preview)? Are penalties or termination rights triggered by a slip?
- **Why it matters:** The cost of slipping the date is unknown. If no binding contractual obligation exists, Path A is nearly costless. If termination clauses apply, the calculus changes.
- **Owner:** Enterprise Sales + Legal  
- **Resolution target:** Within 5 business days

### 2. Compliance Review Compressibility — HIGH PRIORITY
- **Gap:** Legal stated 14 weeks under *current process*. Has anyone asked whether the process itself can be restructured? Are any components already complete from prior reviews (e.g., KYC/AML framework review that partially overlaps)?
- **Why it matters:** Path B is only viable if Legal can certify compression without increasing exposure.
- **Owner:** Legal  
- **Resolution target:** Within 5 business days

### 3. Scope Floor — MEDIUM PRIORITY
- **Gap:** Is there a version of this feature (e.g., read-only disbursement scheduling, or disbursements capped below a threshold that falls outside review scope) that can ship on time without triggering the 14-week requirement?
- **Why it matters:** Path C may satisfy the spirit of the enterprise commitment without the legal risk.
- **Owner:** Product + Legal  
- **Resolution target:** Within 7 business days

### 4. Regulatory Filing Dependencies — MEDIUM PRIORITY
- **Gap:** Does the compliance review require external regulatory notification or filing that has a fixed minimum timeline regardless of internal effort?
- **Why it matters:** Some review compression is legally impossible if external filings impose mandatory waiting periods. This would eliminate Path B entirely.
- **Owner:** Legal  
- **Resolution target:** Within 5 business days

### 5. Customer Tolerance for Partial Delivery — MEDIUM PRIORITY
- **Gap:** Would enterprise customers accept a scoped launch (Path C) as satisfying their Q2 commitment, or is the full disbursement capability the material requirement?
- **Why it matters:** Path C is only viable if customers accept it as contract-compliant.
- **Owner:** Enterprise Sales  
- **Resolution target:** Within 10 business days

---

## Pass/Fail Readiness

This PRD advances to execution planning **only if** all of the following gates clear:

| Gate | Criterion | Status |
|------|-----------|--------|
| G1 — Path Authorization | An executive sponsor has formally selected Path A, B, or C with documented rationale | ❌ Not cleared |
| G2 — Legal Certification | Legal has issued written sign-off on the selected path as compliant (or, for Path B, certified the compressed timeline as legally valid) | ❌ Not cleared |
| G3 — Customer Commitment Audit | Contractual obligations to enterprise accounts are documented, including any penalties for delay | ❌ Not cleared |
| G4 — Scope Definition | For Path B or C, a precise feature scope has been defined that Legal can certify and Sales can represent to customers | ❌ Not cleared |
| G5 — Engineering Feasibility | Engineering has confirmed the selected scope is deliverable within the authorized timeline | ❌ Not cleared (premature until G1-G4 clear) |

**Current status: 0 of 5 gates cleared.** Proceeding to engineering specification before G1–G4 are resolved would produce waste: the build plan depends entirely on which path is selected.

---

## Recommended Next Artifact

**Produce a Decision Memo for Executive Sponsor, not a build spec.**

The bottleneck is not engineering readiness—it is an unresolved organizational decision about acceptable risk and customer relationship management. A build spec written now would be speculative and likely discarded when the path is selected.

**The Decision Memo should contain:**
1. Quantified contractual exposure for each path (from Sales + Legal — see Unknowns 1 and 5)
2. Legal's written assessment of whether Path B is achievable and what it would require (Unknown 2 and 4)
3. A recommended path with explicit risk acceptance statement for executive signature
4. A trigger: once the memo is signed, this PRD resumes at the approved scope and timeline

**Owner of Decision Memo:** Product, with Legal and Enterprise Sales as required contributors  
**Target completion:** 10 business days  
**Escalation path if unknowns cannot be resolved in 10 days:** Executive sponsor convenes a 60-minute decision session with Legal, Sales, and Finance to force path selection under incomplete information

---

## Appendix: What This PRD Is Not

This document does not:
- Assume the date will slip or that compliance can be compressed
- Present a build plan for any path (premature until authorization)
- Recommend accepting legal exposure as a calculated risk (that decision belongs to authorized executives with full information, not to Product)
- Treat the 14-week review as a soft constraint that engineering creativity can solve

When the path is authorized and G1–G4 gates clear, this PRD will be updated to version 1.0 with full feature specification, engineering requirements, and launch plan.
