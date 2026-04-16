# PRD: Fraud Detection ML — Cross-Tenant Pattern Learning

**Status:** Draft for Decision  
**Owner:** Product  
**Date:** 2026-04-16  
**Artifact Type:** PRD (Decision-Gate Format)

---

## Decision Frame

### The Core Conflict

Production-grade fraud detection ML requires training on broad, diverse transaction patterns to generalize beyond any single tenant's data volume and fraud distribution. Every current enterprise contract contains a strict data isolation clause: customer data may not be used in any shared model or training corpus.

These two requirements are in direct conflict. This PRD does not paper over that conflict — it frames it as a gate that must be resolved before any engineering work begins.

### Decision Required

Before scoping or resourcing this feature, leadership must choose one of three paths:

| Path | Description | Contract Impact | Accuracy Ceiling |
|------|-------------|-----------------|------------------|
| **A — Federated Learning** | Train locally per tenant; aggregate only model updates (gradients), never raw data | Likely compliant with current clauses if legal confirms gradient aggregation ≠ data sharing | Near-parity with centralized training at sufficient tenant count (≥20–30 active tenants) |
| **B — Contract Amendment** | Renegotiate isolation clauses to permit anonymized, aggregated training corpus | Requires legal + sales alignment; at-risk for existing renewals | Full accuracy, no architectural constraint |
| **C — Per-Tenant Models Only** | Deploy isolated models per customer; accept accuracy limitations for smaller tenants | Zero contract risk | Materially degraded for tenants with <6 months transaction history or <10K monthly transactions |

### What This PRD Cannot Resolve

This document cannot determine whether federated gradient aggregation constitutes "shared model training" under current contract language. That is a legal determination, not a product one. Path A is the only path where that ambiguity is the critical gate; Paths B and C are unambiguous.

---

## Problem Statement

### Customer Pain

Enterprise customers in payments, lending, and marketplace verticals lose 0.3–1.8% of GMV to fraud. They are purchasing or evaluating fraud tooling and expect production-grade detection rates. "Production-grade" in industry benchmarks means:

- Precision ≥ 85% at 95% recall on out-of-sample data
- Generalization to novel fraud patterns not seen in a single tenant's history
- Low false-positive rate (<0.5%) to avoid blocking legitimate transactions

### Why Per-Tenant Models Fail at Threshold

Fraud patterns are rare events (~0.1–2% of transactions) with high variance. A tenant with 50K monthly transactions has roughly 50–1,000 labeled fraud cases per month — insufficient to train a robust model without substantial class imbalance and overfitting risk. Cross-tenant patterns (e.g., a fraud ring operating across multiple platforms) are invisible to per-tenant models by definition.

This is not a data engineering problem that can be solved with better feature engineering on a single tenant's data alone. The accuracy gap is structural.

### Why Contracts Block the Obvious Solution

The isolation clauses were written to address legitimate customer concerns: competitive sensitivity (Tenant A does not want Tenant B learning their transaction patterns), regulatory exposure (GDPR, CCPA, SOC 2 obligations that customers have with their own end users), and reputational risk. These concerns are real and were bargained for. Unilaterally violating them — even with "anonymization" — creates contract breach exposure and trust damage that likely exceeds the product benefit.

---

## Proposed Solution Scope (Path-Conditional)

### If Path A (Federated Learning) — Preferred If Legally Cleared

**Architecture:** Each tenant's transaction data stays within a tenant-isolated compute environment. A local model trains on that tenant's data. Only gradient updates (parameter deltas) are transmitted to a central aggregation server. The aggregated global model is then redistributed to all participating tenants.

**Privacy properties:**
- Raw transaction data never leaves tenant boundary
- Differential privacy noise can be applied to gradients before transmission
- Tenant cannot be re-identified from gradient contribution alone (with DP)

**Legal gate:** Does transmitting gradient updates constitute using customer data in a "shared model or training corpus"? This must be answered by legal review of actual contract language — not a product assumption.

**Minimum viable tenant count for this to work:** Federated learning degrades with <10 participants. With <5, the global model may not outperform per-tenant baselines. Current enterprise customer count and expected participation rate is an open question (see Unknowns).

**Scope:**
- Federated training infrastructure (coordinator service, gradient aggregation)
- Per-tenant local training jobs
- Secure gradient transmission with differential privacy
- Model versioning and rollback per tenant
- Compliance attestation logging for audits

**Out of scope for v1:** Real-time fraud scoring (inference), customer-facing dashboards, manual review workflows.

### If Path B (Contract Amendment)

Product scope is straightforward centralized ML training. The gate is entirely in legal/sales — estimated 6–12 month renegotiation cycle for enterprise agreements. This PRD does not scope that work.

### If Path C (Per-Tenant Only)

Scope reduces to per-tenant model training pipelines with explicit accuracy SLA documentation showing ceiling limitations. Sales and CS must set expectations accordingly. This is a defensible near-term position if the market does not yet require cross-tenant accuracy.

---

## Unknowns & Evidence Gaps

| # | Unknown | Why It Blocks | How to Resolve | Owner | Timeline |
|---|---------|---------------|----------------|-------|----------|
| U-1 | Does gradient aggregation constitute "data sharing" under current contract language? | Determines whether Path A is viable without renegotiation | Legal review of 5 representative contracts against federated learning technical spec | Legal | 2 weeks |
| U-2 | How many enterprise tenants have sufficient transaction volume for federated learning to be statistically meaningful? | Federated learning requires ≥10–20 active participants to outperform per-tenant baselines | Data pull: tenant transaction volumes, fraud event counts, activity recency | Data/Analytics | 1 week |
| U-3 | What accuracy delta exists between per-tenant and cross-tenant models on our actual data? | Quantifies the stakes; if delta is small, Path C may be acceptable near-term | Benchmark study using synthetic or consented data | ML Engineering | 3–4 weeks |
| U-4 | What is customer willingness to amend contracts for improved fraud detection? | Determines Path B feasibility and sales burden | 5 customer discovery calls at renewal or expansion stage | Sales/CS | 3 weeks |
| U-5 | Are there regulatory frameworks (e.g., GDPR Article 89 research exemption, synthetic data generation) that create a compliant path not yet considered? | May unlock Path A or a Path D not currently scoped | External legal/privacy counsel with ML specialization | Legal + Product | 4 weeks |
| U-6 | Do competitors offer cross-tenant fraud detection? If so, how do they handle isolation? | Competitive positioning and possible precedent for contract language | Competitive research, customer RFP language review | Product | 2 weeks |

**Critical path:** U-1 (legal determination on gradients) gates all Path A investment. U-3 (accuracy delta) gates the urgency and priority level of the entire feature. Both should be resolved before any engineering resources are allocated.

---

## Pass/Fail Readiness

This feature is **NOT ready to enter development.** The following criteria must pass before any engineering sprint is authorized:

### Hard Gates (All Must Pass)

| Gate | Criterion | Status |
|------|-----------|--------|
| G-1 | Legal has reviewed current contract language and issued written determination on whether federated gradient aggregation constitutes prohibited data sharing | **OPEN** |
| G-2 | Leadership has selected a Path (A, B, or C) with documented rationale | **OPEN** |
| G-3 | Minimum participating tenant count confirmed to be ≥10 (Path A only) | **OPEN** |
| G-4 | Accuracy delta between per-tenant and cross-tenant baseline is quantified and accepted as material by product leadership | **OPEN** |

### Soft Gates (Should Pass, Can Proceed With Risk Acknowledgment)

| Gate | Criterion | Status |
|------|-----------|--------|
| S-1 | At least 3 customers have expressed willingness to discuss contract amendment (Path B signal) | **OPEN** |
| S-2 | Competitive landscape review complete | **OPEN** |
| S-3 | ML Engineering has validated federated learning framework feasibility in our infrastructure | **OPEN** |

**Earliest realistic go/no-go decision:** 4 weeks from PRD approval, assuming legal review (U-1) and accuracy delta study (U-3) are kicked off immediately.

---

## Recommended Next Artifact

**Immediate (this week):**
1. **Legal Review Brief** — Product to write a 1-page technical summary of federated learning gradient aggregation for legal team review against contract language. Do not assume this is compliant; get the determination in writing.
2. **Data Pull Request** — Analytics to provide per-tenant transaction volume, fraud event counts, and activity recency distribution to assess federated learning viability.

**After legal determination (2–4 weeks):**
3. **Path Selection Memo** — Leadership alignment document comparing Path A/B/C on accuracy, timeline, contract risk, and revenue impact. This is the decision document; this PRD is the framing document.

**If Path A is selected:**
4. **Federated Learning Architecture RFC** — Engineering design document covering coordinator service, gradient aggregation, differential privacy implementation, and tenant onboarding requirements.

**If Path B is selected:**
4. **Contract Amendment Playbook** — Sales and legal co-own a standardized amendment template and objection-handling guide for enterprise renewals.

**If Path C is selected:**
4. **Accuracy SLA Documentation** — Defines per-tenant model performance ceilings by transaction volume tier; feeds into sales qualification and CS expectation-setting.

---

## Appendix: Why This PRD Stops Here

A PRD that scopes engineering work before the legal question is resolved would create false momentum. Teams would begin designing infrastructure for a solution that may be contractually prohibited, require rework, and — worse — might quietly proceed on an assumption that "anonymization makes it fine" without a formal legal determination.

The most useful thing this document can do is name the gate clearly, assign the resolution owner (Legal), and prevent the feature from entering any sprint until that gate is passed. Speed here comes from resolving the unknowns in parallel, not from starting to build.
