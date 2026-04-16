# PRD: SMB Market Entry
**Status:** Draft — Pre-Validation Gate  
**Owner:** Product  
**Last Updated:** 2026-04-16  
**Confidence:** Low — no direct SMB evidence in hand

---

## Decision Frame

### Problem
The company has saturated its initial enterprise motion and is evaluating SMB as the next growth surface. SMB represents a structurally different buyer: shorter sales cycles, lower ACVs, higher volume, self-serve or low-touch onboarding expectations, and faster churn due to budget sensitivity. The core question is whether the unit economics of an SMB segment can produce a viable business given our current cost structure and product.

### Decision Being Made
This PRD is **not** a build authorization. It is a readiness assessment for whether the team has sufficient signal to commit budget and headcount to an SMB go-to-market. The output of this document is a go/no-go on a structured SMB validation sprint, not on an SMB launch.

### Scope
- **In scope:** Identification of critical unknowns, proxy assumptions requiring validation, minimum viable evidence set to proceed
- **Out of scope:** Feature roadmap, pricing architecture, GTM channel selection — all contingent on validation findings

### Assumptions Being Tested
The business case currently rests on enterprise benchmarks adjusted downward by 40% based on PM intuition. This is a starting hypothesis, not a forecast. The 40% haircut is an unanchored scalar with no comparable benchmark basis. It should be treated as a sensitivity variable, not a grounded estimate.

---

## Unknowns & Evidence Gaps

The following gaps are **blocking** — they must be resolved before a launch PRD can be written with defensible projections.

### Gap 1 — Conversion Rate Proxy (Critical)
**Assumed:** Enterprise conversion rate × 0.60  
**Why this is insufficient:** Enterprise conversion is shaped by multi-stakeholder procurement, relationship-driven sales, and long evaluation cycles. SMB buyers convert via different mechanisms: trial-to-paid friction, solo decision-making, and price sensitivity at checkout. The structural drivers are non-analogous. A 40% discount on a non-comparable baseline produces a number with false precision.  
**What's needed:** Trial conversion data from at least one comparable SMB SaaS product in adjacent category, OR a 90-day pilot with 50–100 SMB prospects tracked through funnel.

### Gap 2 — Contract Value Distribution (Critical)
**Assumed:** Enterprise ACV × 0.60  
**Why this is insufficient:** SMB pricing is not a linear compression of enterprise pricing. SMB buyers are highly price-elastic; the viable price point is constrained by willingness-to-pay thresholds that our enterprise data cannot reveal. We do not know whether the SMB segment can support a price point that covers our current CAC structure.  
**What's needed:** Pricing sensitivity interviews (n ≥ 20 SMB buyers in target vertical), or a landing page price experiment.

### Gap 3 — Churn Dynamics (Critical)
**Assumed:** Enterprise churn × 0.60 (implying higher SMB churn)  
**Why this is insufficient:** The direction of the adjustment is plausible but the magnitude is arbitrary. SMB churn drivers — budget cuts, founder pivots, seasonal cash flow — are categorically different from enterprise churn (contract non-renewal, competitive displacement, consolidation). The 40% scalar does not capture this structural difference.  
**What's needed:** Churn benchmarks from public SMB SaaS cohort data (e.g., Bessemer Cloud Index SMB cohorts, OpenView SaaS benchmarks) as a minimum; ideally a 6-month cohort from a pilot.

### Gap 4 — CAC Structure Mismatch (Critical)
**Assumed:** Existing sales motion can be adapted  
**Why this is insufficient:** Enterprise CAC is dominated by outbound sales and relationship costs. SMB CAC typically must be 3–5× lower to produce acceptable LTV:CAC ratios at lower ACVs. We have no data on what an SMB-optimized acquisition channel would cost, nor whether our brand has organic SMB pull.  
**What's needed:** Estimate of low-touch acquisition cost via at least one channel (paid search, PLG referral, partner), with conversion funnel modeled from first principles.

### Gap 5 — Product-Market Fit Signal (Moderate)
**Assumed:** Enterprise product is sufficient for SMB needs with minor configuration  
**Why this is insufficient:** No SMB users have been interviewed. The product may be over-engineered for SMB use cases (complexity tax) or missing SMB-critical features (e.g., self-serve billing, simplified onboarding, low-cost tier).  
**What's needed:** 10–15 discovery interviews with SMB buyers in target verticals to identify job-to-be-done fit and friction points.

---

## Pass/Fail Readiness

### Current State: FAIL — Insufficient to Authorize Launch

| Readiness Criterion | Status | Blocker? |
|---|---|---|
| Direct SMB buyer interviews conducted | Not done | Yes |
| SMB conversion rate from comparable benchmark or pilot | Not done | Yes |
| Pricing sensitivity validated | Not done | Yes |
| Churn model grounded in SMB cohort data | Not done | Yes |
| CAC estimate for low-touch channel | Not done | Yes |
| Product fit assessment with SMB users | Not done | Yes |

**All six criteria are unmet.** The current business case is a hypothesis scaffold, not a validated projection. Proceeding to build authorization on this basis carries high risk of misallocated headcount and a GTM motion tuned to the wrong buyer.

### What Would Constitute a PASS
A launch PRD may be authorized when:
1. At least 15 SMB discovery interviews completed across 2+ verticals
2. A pricing experiment or willingness-to-pay study yields a defensible ACV range
3. One acquisition channel has a measured or modeled CAC with LTV:CAC ≥ 3:1 at validated ACV
4. A 60–90 day pilot with ≥ 50 SMB accounts provides early retention signal
5. Churn assumption is grounded in at least one external SMB SaaS cohort benchmark

---

## Recommended Next Artifact

### Artifact: SMB Validation Sprint Plan
**Format:** Research + experiment brief  
**Owner:** Product + Sales (1 AE dedicated to SMB discovery)  
**Timeline:** 8 weeks  
**Budget required:** Minimal — interview recruitment, landing page experiment tooling, 1 AE time allocation

**Sprint deliverables:**
1. **Week 1–3:** 15 SMB discovery interviews (recruiting via LinkedIn outbound + current enterprise customer referrals to their SMB network)
2. **Week 2–4:** Pricing page experiment — test 2–3 price points with SMB-targeted landing page, measure trial signups and stated intent
3. **Week 3–8:** Soft pilot — identify 3–5 enterprise customers with SMB subsidiaries willing to onboard on existing product; track 60-day activation and retention
4. **Week 6–8:** Benchmark pull — use Bessemer, OpenView, or Paddle public SMB SaaS benchmarks to anchor churn and conversion assumptions

**Gate decision at Week 8:** If pilot retention ≥ 70% at 60 days, pricing experiment yields ACV supporting LTV:CAC ≥ 3, and discovery interviews confirm clear job-to-be-done fit → authorize launch PRD. Otherwise, pivot or pause.

**What this sprint does NOT require:** Engineering resources, product changes, or GTM infrastructure. It is a pure discovery sprint. The cost of not doing it is writing a launch PRD on a foundation that may be structurally wrong.

---

## Appendix: Proxy Assumption Register

All figures below are **working hypotheses only** — not projections. They are documented here to make current assumptions explicit and to define what validation would either confirm or replace.

| Metric | Enterprise Baseline | Proxy Assumption | Adjustment Basis | Confidence |
|---|---|---|---|---|
| Trial conversion rate | [Enterprise figure] | Baseline × 0.60 | Intuition | Very Low |
| ACV | [Enterprise figure] | Baseline × 0.60 | Intuition | Very Low |
| Annual churn | [Enterprise figure] | Baseline × 1.67 (inverse of 0.60) | Intuition | Very Low |
| CAC | [Enterprise figure] | Unknown — no SMB channel tested | None | Not estimated |

These numbers must not appear in any external communication, board deck, or investment memo in their current form. They are internal scaffolding pending replacement by validated data.

