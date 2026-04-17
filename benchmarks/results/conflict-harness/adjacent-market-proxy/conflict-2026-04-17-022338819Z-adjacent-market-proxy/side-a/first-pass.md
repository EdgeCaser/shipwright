# PRD: SMB Market Entry
**Status:** Pre-validation — Not approved for execution
**Owner:** Product / Strategy
**Last Updated:** 2026-04-17

---

## Decision Frame

**The decision:** Whether to greenlight an SMB go-to-market motion, and if so, what evidence must be in hand before committing budget and headcount.

**What this PRD is and is not:** This document frames the SMB entry opportunity and exposes the current evidence state. It is not a launch plan. Execution approval is gated on the readiness criteria in the Pass/Fail section below.

**Strategic context:** The company has three years of enterprise sales data and a functioning enterprise motion. SMB represents a materially different buyer profile — shorter sales cycles, lower contract values, higher volume, distinct churn drivers, and different support cost structures. The strategic hypothesis is that the core product can serve SMB buyers with targeted packaging and pricing adjustments.

**Scope:** This PRD covers the decision to invest in SMB discovery and a limited pilot. It does not authorize full market launch.

---

## Unknowns & Evidence Gaps

This section is the operational core of this document. The business case currently rests on enterprise figures adjusted downward by 40%. That adjustment is explicitly intuition-based, not derived from SMB research, comparable benchmarks, or any direct buyer signal. The following gaps must be treated as **blocking unknowns** before financial projections can be relied upon.

### Gap 1 — SMB Conversion Rate
**What we have:** Enterprise conversion rate from our own pipeline.
**What we need:** SMB conversion rate for this product category.
**Why the proxy is unreliable:** Enterprise buyers engage with longer evaluation cycles, dedicated procurement, and formal vendor review. SMB buyers decide faster, with less process, and often on different criteria (ease of setup, time-to-value, price transparency). Our enterprise funnel mechanics do not map to SMB acquisition channels. A 40% discount applied to an enterprise conversion rate could be too optimistic or too conservative — we cannot determine which without data.
**Risk if wrong:** Financial model misses by an unknown multiplier. Pipeline sizing and CAC estimates are built on a foundation with no empirical grounding.

### Gap 2 — SMB Contract Value and Willingness to Pay
**What we have:** Enterprise ACV and deal structure data.
**What we need:** SMB willingness to pay, preferred pricing model (seat-based, usage-based, flat), and expected ACV range.
**Why the proxy is unreliable:** SMB buyers face hard budget ceilings that enterprise buyers do not. Packaging and pricing that converts enterprise accounts may not be purchasable by SMB buyers regardless of product fit. The 40% reduction applied to enterprise ACV is an assumption with no buyer validation.
**Risk if wrong:** Unit economics may not support the go-to-market motion at any realistic volume.

### Gap 3 — SMB Churn Drivers and Retention Profile
**What we have:** Enterprise churn rates and the primary reasons enterprise customers leave.
**What we need:** SMB churn expectations for this product category — which are driven by different factors (cash flow pressure, team turnover, simpler competitive alternatives, lower switching costs).
**Why the proxy is unreliable:** Enterprise churn is typically driven by strategic fit and procurement lock-in. SMB churn is typically driven by price sensitivity, ease of cancellation, and faster competitive substitution. These are structurally different.
**Risk if wrong:** LTV projections are inflated. Payback period assumptions are wrong. The cohort model underlying the business case does not hold.

### Gap 4 — SMB Support and Onboarding Cost
**What we have:** Enterprise customer success and support cost structure.
**What we need:** Estimated SMB support cost per account given self-serve expectations and lower revenue per account to absorb that cost.
**Why the proxy is unreliable:** Enterprise accounts absorb high-touch CS cost across large ACV. SMB accounts do not. If SMB accounts require even moderate support, margins compress rapidly. This cost was not surfaced in the current business case.
**Risk if wrong:** Gross margin assumptions are wrong. The unit economics case collapses at scale.

### Gap 5 — Buyer Identity and Acquisition Channel
**What we have:** Enterprise ICP and sales-led acquisition motion.
**What we need:** SMB buyer identity (who decides, what triggers evaluation, which channels reach them) and which acquisition model — product-led, sales-assisted, or partner-led — is viable.
**Risk if wrong:** GTM design is built for the wrong buyer. CAC and ramp assumptions are wrong.

---

## Pass/Fail Readiness

The following criteria must be satisfied before this PRD moves to execution approval. These are binary gates, not scoring dimensions.

| Criterion | Required Evidence | Current State | Gate Status |
|---|---|---|---|
| SMB willingness to pay validated | ≥15 SMB buyer interviews with pricing response data | None conducted | **BLOCKED** |
| Conversion rate proxy validated | Pilot data or comparable benchmark from SMB-adjacent product | None available | **BLOCKED** |
| Churn assumption validated | SMB cohort data or third-party benchmark for this category | None available | **BLOCKED** |
| Support cost modeled for SMB | Cost-per-ticket analysis at SMB support volume | Not modeled | **BLOCKED** |
| Acquisition channel identified | Channel test or buyer-sourcing data | Not tested | **BLOCKED** |
| Business case re-run on validated inputs | Updated model using research outputs, not adjusted enterprise proxy | Not completed | **BLOCKED** |

**Current readiness state: NOT READY FOR EXECUTION**

All six gates are blocked. The business case as constructed cannot be relied upon for resource allocation decisions. Proceeding to execution on current inputs carries material risk of misallocating budget and headcount against projections that have no empirical grounding in the target segment.

---

## Recommended Next Artifact

**Artifact:** SMB Discovery Sprint Plan

**Purpose:** Close the six blocking gaps above through a structured, time-boxed discovery effort before any execution commitment is made.

**Recommended scope:**
- **Buyer interviews:** 15–20 SMB buyers (current non-customers) covering willingness to pay, evaluation triggers, competitive alternatives, and support expectations. Target completion: 6 weeks.
- **Pricing test:** A lightweight pricing page or sales conversation test with 5–10 SMB prospects to generate willingness-to-pay signal.
- **Benchmark sourcing:** Identify whether any comparable SaaS products in this category have published or obtainable SMB cohort benchmarks that can serve as a calibration reference.
- **Support cost model:** Work with CS and finance to model SMB support cost per account at two volume scenarios.
- **Channel test:** Run a small paid or outbound acquisition test to establish baseline SMB CAC range before committing to GTM design.

**Success output:** A revised business case built on research inputs, with explicit confidence ratings on each assumption, replacing the current enterprise-proxy model. If discovery outputs do not support a viable unit economics case, this is the correct moment to surface that — not after execution budget is committed.

**Owner:** Product + Research lead
**Recommended timeline:** 6–8 weeks

---

*This PRD does not recommend for or against SMB market entry. It frames the decision honestly given current evidence, identifies what must be learned before the decision can be made responsibly, and proposes a concrete path to closing those gaps.*
