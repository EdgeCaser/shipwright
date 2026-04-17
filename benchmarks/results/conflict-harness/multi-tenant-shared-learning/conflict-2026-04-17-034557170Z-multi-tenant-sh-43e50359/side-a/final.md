# PRD: Fraud Detection ML — Cross-Tenant Pattern Recognition

**Status:** Blocked — Requires Legal and Commercial Resolution Before Engineering Commitment

---

## Decision Frame

**The Core Conflict**

The fraud detection feature as currently scoped cannot be built as described. Every enterprise customer contract contains a data isolation clause prohibiting use of their transaction data in any shared model or training corpus. The ML approach required to reach production-grade accuracy depends on exactly what those contracts prohibit: cross-tenant pattern learning.

This is not an engineering problem with an engineering solution. It is a legal, commercial, and product strategy problem. The PRD cannot responsibly proceed to scope, timeline, or resource allocation until the following decision is resolved:

> **Decision Required:** Which path does the business choose — renegotiate contracts, change the technical approach, or narrow the product scope — and who owns that decision?

**Why This Matters Now**

Committing engineering resources before this decision is resolved risks building a compliant but ineffective model (if the team works around the constraint without resolving it), building a non-compliant model that creates legal liability (if the team proceeds as if the constraint doesn't apply), or building nothing usable at all after significant sunk cost.

**Three Viable Paths**

| Path | Description | What Must Be True |
|---|---|---|
| A — Contract Amendment | Renegotiate data isolation clauses to permit opt-in cross-tenant model training | Legal signs off; customers agree; amendment process is feasible |
| B — Federated / Privacy-Preserving Architecture | Use federated learning, differential privacy, or synthetic data so no raw cross-tenant data is shared | Accuracy targets are achievable under these constraints; engineering effort is scoped |
| C — Tenant-Only Models | Train per-tenant models; accept lower accuracy at tenant launch; improve over time as per-tenant data grows | Business accepts accuracy ceiling; pricing model reflects this limitation |

No path is recommended here because the inputs required to evaluate them — legal feasibility, accuracy benchmarks under alternative architectures, customer willingness to amend, and business tolerance for reduced accuracy — are not available. This PRD names the decision; it does not make it.

---

## Unknowns & Evidence Gaps

The following unknowns must be resolved before this PRD can move to execution. Each is a hard blocker for at least one path.

**Legal / Contractual**
- What is the exact language of the data isolation clause? Does it prohibit only raw data sharing, or does it extend to derived signals, model weights, or embeddings?
- Is there a customer notification or consent mechanism already defined in existing contracts that could permit opt-in participation?
- What is legal's preliminary read on whether federated learning or differential privacy satisfies the clause as written, or whether it requires amendment?
- What is the amendment process — timeline, approval chain, customer consent rate required?

**Technical / Accuracy**
- What accuracy threshold defines "production-grade" for this feature? Without a specific threshold, Path B and Path C cannot be evaluated.
- Has any internal or external analysis been done on achievable accuracy for per-tenant models at typical enterprise customer data volumes?
- What is the known accuracy delta (if any) between centralized cross-tenant training and federated approaches for fraud detection in analogous contexts?

**Commercial / Customer**
- Have any customers been asked informally whether they would consider amending their isolation clause in exchange for improved fraud detection?
- Is the fraud detection feature being positioned as a differentiator that justifies re-opening contract terms, or is it a table-stakes feature that must fit existing terms?
- If accuracy under Path C is materially lower at launch, does the sales team have a defensible narrative, or does this create a competitive risk?

**Organizational**
- Who has authority to decide between Paths A, B, and C? This decision spans Legal, Sales, Engineering, and Product — it is not a unilateral product call.
- What is the escalation path if Legal and Sales cannot agree on approach?

---

## Pass/Fail Readiness

This PRD uses the following gates to determine readiness to proceed to engineering scoping.

| Gate | Criterion | Current Status |
|---|---|---|
| Legal clearance | Legal has confirmed in writing which technical architecture satisfies existing contract language, OR has confirmed that contract amendment is feasible and in progress | **Not met** |
| Accuracy baseline defined | Product and stakeholders have agreed on a specific accuracy threshold that defines "production-grade" for this feature | **Not met** |
| Path selected | A single path (A, B, or C) has been chosen by an accountable decision-maker | **Not met** |
| Customer signal (if Path A) | At least one anchor customer has indicated willingness to discuss contract amendment | **Not met — only required for Path A** |
| Architecture feasibility (if Path B) | Engineering has confirmed that federated or privacy-preserving architecture is technically feasible within the team's current capabilities and timeline constraints | **Not met — only required for Path B** |

**Verdict:** This feature is not ready to enter engineering scoping. It is ready to enter a structured decision sprint with Legal, Sales, and Engineering leads.

---

## Recommended Next Artifact

Two workstreams should run in parallel. Neither unblocks the other — both feed the path-selection meeting.

**Workstream 1 — Legal Feasibility Brief** (owner: Legal, due before next product review)

A 1–2 page brief answering:
1. What does the data isolation clause prohibit, precisely — raw data only, or also derived signals, model weights, and embeddings?
2. Does federated learning / differential privacy / synthetic data satisfy the clause as written?
3. What is the feasibility and timeline for contract amendment if required?

This brief is the critical path item for Path A and for determining whether Path B satisfies the contract without amendment. It does not need to complete before technical feasibility work begins.

**Workstream 2 — Engineering Feasibility Spike** (owner: Engineering, 3–5 days)

A lightweight spike answering:
1. Can the team implement a federated or privacy-preserving architecture (Path B) within current capabilities?
2. What accuracy is achievable with per-tenant-only training (Path C) at representative enterprise data volumes?

This work is independent of legal's analysis. Technical feasibility constrains which paths are viable regardless of what legal concludes — if Path B is not technically achievable, the legal question about whether it satisfies the contract is moot.

**Path-Selection Meeting** (owner: cross-functional decision-maker spanning Legal, Sales, Engineering, Product)

Scheduled once both workstreams have produced initial findings. No path should be selected before both inputs exist.
