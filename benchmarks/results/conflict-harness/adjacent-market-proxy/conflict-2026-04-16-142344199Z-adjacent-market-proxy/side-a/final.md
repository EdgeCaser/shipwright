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
This PRD is **not** a build authorization. It is a readiness assessment for whether the team has sufficient signal to commit budget and headcount to an SMB go-to-market. The output of this document is a go/no-go on a structured SMB validation program, not on an SMB launch.

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
**Why this is insufficient:** The direction of the adjustment is plausible but the magnitude is arbitrary. SMB churn drivers — budget cuts, founder pivots, seasonal cash flow — are categorically different from enterprise churn drivers. The 40% scalar does not capture this structural difference. A credible churn input requires 6+ months of cohort observation; no 8-week sprint can resolve this gap directly.  
**What's needed:** External SMB SaaS cohort benchmarks (e.g., Bessemer Cloud Index, OpenView, Paddle) as a minimum floor; a 6-month pilot cohort as the definitive validation. Short-window retention (60 days) is an early signal only — not a churn estimate.

### Gap 4 — CAC Structure Mismatch (Critical)
**Assumed:** Existing sales motion can be adapted  
**Why this is insufficient:** Enterprise CAC is dominated by outbound sales and relationship costs. SMB CAC typically must be 3–5× lower to produce acceptable LTV:CAC ratios at lower ACVs. We have no data on what an SMB-optimized acquisition channel would cost, nor whether our brand has organic SMB pull.  
**What's needed:** Estimate of low-touch acquisition cost via at least one channel (paid search, PLG referral, partner), with conversion funnel modeled from first principles. Note: channel experiments carry real spend; cost basis must be estimated before authorizing.

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
4. Early 60-day retention signal from a soft pilot is available (with the explicit caveat that this is not a churn estimate — churn validation requires a separate 6-month cohort)
5. Churn assumption is grounded in at least one external SMB SaaS cohort benchmark pending cohort maturity

---

## Recommended Next Artifact

### Artifact: SMB Validation Program Brief
**Format:** Phased research + experiment brief  
**Owner:** Product + Sales  
**Structure:** Two distinct phases with separate cost and authorization gates

---

**Phase 1 — Discovery Sprint (8 weeks)**  
*Purpose:* Resolve the gaps that can be resolved quickly and cheaply. Does not resolve churn.

| Week | Activity | Cost Basis Needed Before Starting |
|---|---|---|
| 1–3 | 15 SMB discovery interviews (LinkedIn outbound + enterprise referrals) | Recruiter time or incentive budget estimate |
| 2–4 | Pricing page experiment — 2–3 price points, SMB-targeted landing page | Paid traffic budget estimate; AB testing tooling cost |
| 3–8 | Soft pilot — 3–5 SMB-adjacent accounts, track 60-day activation | AE time allocation; account sourcing plan |
| 6–8 | External benchmark pull — Bessemer, OpenView, Paddle SMB cohort data | Research hours only |

*Phase 1 gate:* If discovery confirms job-to-be-done fit, pricing experiment yields a viable ACV, and 60-day activation is positive → authorize Phase 2. If any of these fail, pause before further investment.

**Caveat on Phase 1 cost characterization:** AE time, paid acquisition experiments, and interview recruitment are real resource commitments. A cost estimate must be produced before Phase 1 is authorized — this brief does not supply one.

---

**Phase 2 — Churn Validation Cohort (6 months)**  
*Purpose:* Resolve the one gap Phase 1 cannot — actual SMB churn dynamics under live conditions.

- Expand soft pilot to 30–50 active SMB accounts
- Track monthly retention, expansion, and contraction over 6 months
- Compare against external benchmarks from Phase 1 to assess whether the product is performing in-line with category or diverging

*Phase 2 gate:* If 6-month cohort retention supports a viable LTV:CAC model at the validated ACV → authorize launch PRD with real projections replacing proxy assumptions.

---

**What this program does NOT do in Phase 1:** Validate churn. A 60-day retention read is an early signal, not a churn estimate. Any business case built on 60-day retention data as a churn proxy will carry the same structural flaw as the current enterprise proxy — it must be labeled accordingly.

---

## Appendix: Proxy Assumption Register

All figures below are **working hypotheses only** — not projections. They are documented here to make current assumptions explicit and to define what validation would either confirm or replace.

| Metric | Enterprise Baseline | Proxy Assumption | Adjustment Basis | Confidence | Validation Path |
|---|---|---|---|---|---|
| Trial conversion rate | [Enterprise figure] | Baseline × 0.60 | Intuition | Very Low | Phase 1 pilot funnel |
| ACV | [Enterprise figure] | Baseline × 0.60 | Intuition | Very Low | Phase 1 pricing experiment |
| Annual churn | [Enterprise figure] | Baseline × 1.67 (inverse of 0.60) | Intuition | Very Low | Phase 2 cohort (6 months minimum) |
| CAC | [Enterprise figure] | Unknown — no SMB channel tested | None | Not estimated | Phase 1 channel experiment (requires cost budget) |

These numbers must not appear in any external communication, board deck, or investment memo in their current form. They are internal scaffolding pending replacement by validated data.

