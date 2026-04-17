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

**Legal Feasibility Brief** (owner: Legal, due before next product review)

A 1–2 page brief answering:
1. What does the data isolation clause prohibit, precisely?
2. Does federated learning / differential privacy / synthetic data satisfy the clause as written?
3. What is the feasibility and timeline for contract amendment if required?

This brief is the critical path item. No other workstream should begin until it exists. Once the brief is available, the product team can schedule a path-selection meeting with the relevant stakeholders and return this PRD to active development with a chosen path and scoped requirements.

**Secondary artifact (parallel, optional):** Engineering spike doc on federated learning feasibility — scoped to 3–5 days, answering whether Path B is technically achievable given current team capabilities. This can run in parallel with the legal brief if engineering bandwidth allows, but should not be treated as a commitment to Path B.
