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

This section is the operational core of this document. The business case currently rests on enterprise figures adjusted downward by 40% based on intuition, with no SMB interviews, pilots, or comparable benchmarks conducted. That adjustment is explicitly unvalidated — not derived from SMB research or any direct buyer signal. The enterprise figures may or may not translate directionally to SMB; the problem is that we cannot currently distinguish between the two cases. The following gaps represent **high-uncertainty unknowns** that limit the reliability of financial projections until addressed.

### Gap 1 — SMB Conversion Rate
**What we have:** Enterprise conversion rate from our own pipeline.
**What we need:** SMB conversion rate for this product category.
**Why confidence is low:** Enterprise buyers engage with longer evaluation cycles, dedicated procurement, and formal vendor review. SMB buyers decide faster, with less process, and often on different criteria (ease of setup, time-to-value, price transparency). Our enterprise funnel mechanics may not map to SMB acquisition channels. A 40% discount applied to an enterprise conversion rate could be too optimistic or too conservative — we cannot determine which without data.
**Risk if wrong:** Financial model misses by an unknown margin. Pipeline sizing and CAC estimates rest on an assumption with no SMB-sourced grounding.

### Gap 2 — SMB Contract Value and Willingness to Pay
**What we have:** Enterprise ACV and deal structure data.
**What we need:** SMB willingness to pay, preferred pricing model (seat-based, usage-based, flat), and expected ACV range.
**Why confidence is low:** SMB buyers may face hard budget ceilings that enterprise buyers do not. Packaging and pricing that converts enterprise accounts may or may not be purchasable by SMB buyers. The 40% reduction applied to enterprise ACV has not been tested against buyer response.
**Risk if wrong:** Unit economics may not support the go-to-market motion at any realistic volume.

### Gap 3 — SMB Churn Drivers and Retention Profile
**What we have:** Enterprise churn rates and the primary reasons enterprise customers leave.
**What we need:** SMB churn expectations for this product category.
**Why confidence is low:** Enterprise churn is often driven by strategic fit and procurement lock-in. SMB churn may be driven by different factors — price sensitivity, ease of cancellation, faster competitive substitution. Whether the enterprise pattern is a useful prior for SMB is unknown.
**Risk if wrong:** LTV projections may be inflated. Payback period assumptions may not hold.

### Gap 4 — SMB Support and Onboarding Cost
**What we have:** Enterprise customer success and support cost structure.
**What we need:** Estimated SMB support cost per account given self-serve expectations and lower revenue per account to absorb that cost.
**Why confidence is low:** Enterprise accounts absorb high-touch CS cost across large ACV. SMB accounts do not. This cost was not surfaced in the current business case and may compress margins if not modeled.
**Risk if wrong:** Gross margin assumptions may be materially off.

### Gap 5 — Buyer Identity and Acquisition Channel
**What we have:** Enterprise ICP and sales-led acquisition motion.
**What we need:** SMB buyer identity (who decides, what triggers evaluation, which channels reach them) and which acquisition model — product-led, sales-assisted, or partner-led — is viable.
**Risk if wrong:** GTM design is built for the wrong buyer. CAC and ramp assumptions rest on untested channel assumptions.

---

## Pass/Fail Readiness

The following criteria represent the evidence that would need to be in hand before this PRD could responsibly move to execution approval. These thresholds are not arbitrary — they reflect the minimum signal required to distinguish between a viable and a non-viable unit economics case given the current evidence state. With no SMB inputs available, any execution commitment is made under high uncertainty across all five dimensions above.

| Criterion | Required Evidence | Current State | Gate Status |
|---|---|---|---|
| SMB willingness to pay validated | ≥15 SMB buyer interviews with pricing response data | None conducted | **BLOCKED** |
| Conversion rate proxy tested | Pilot data or comparable benchmark from SMB-adjacent product | None available | **BLOCKED** |
| Churn assumption tested | SMB cohort data or third-party benchmark for this category | None available | **BLOCKED** |
| Support cost modeled for SMB | Cost-per-ticket analysis at SMB support volume | Not modeled | **BLOCKED** |
| Acquisition channel identified | Channel test or buyer-sourcing data | Not tested | **BLOCKED** |
| Business case re-run on validated inputs | Updated model using research outputs, not adjusted enterprise proxy | Not completed | **BLOCKED** |

**Current readiness state: NOT READY FOR EXECUTION**

All six gates are blocked not because enterprise data is necessarily wrong as a directional signal, but because it is entirely unvalidated for this segment. The distinction matters: the enterprise figures may turn out to be reasonable priors once tested. But proceeding to execution commitment before that test occurs means allocating budget and headcount against projections whose error range is unknown and could be large in either direction.

---

## Recommended Next Artifact

**Artifact:** SMB Discovery Sprint Plan

**Purpose:** Close the five high-uncertainty gaps above through a structured, time-boxed discovery effort before any execution commitment is made.

**Recommended scope:**
- **Buyer interviews:** 15–20 SMB buyers (current non-customers) covering willingness to pay, evaluation triggers, competitive alternatives, and support expectations. Target completion: 6 weeks.
- **Pricing test:** A lightweight pricing page or sales conversation test with 5–10 SMB prospects to generate willingness-to-pay signal.
- **Benchmark sourcing:** Identify whether any comparable SaaS products in this category have published or obtainable SMB cohort benchmarks that can serve as a calibration reference for the enterprise-proxy assumptions.
- **Support cost model:** Work with CS and finance to model SMB support cost per account at two volume scenarios.
- **Channel test:** Run a small paid or outbound acquisition test to establish baseline SMB CAC range before committing to GTM design.

**Success output:** A revised business case built on research inputs, with explicit confidence ratings on each assumption, replacing the current enterprise-proxy model. Discovery may confirm that the 40% adjustment was reasonable, or it may reveal the adjustment needs to be larger or smaller. Either outcome is more useful than proceeding blind. If discovery outputs do not support a viable unit economics case, this is the correct moment to surface that — not after execution budget is committed.

**Owner:** Product + Research lead
**Recommended timeline:** 6–8 weeks

---

*This PRD does not recommend for or against SMB market entry. It frames the decision honestly given current evidence, identifies what must be learned before the decision can be made responsibly, and proposes a concrete path to closing those gaps.*
