# Pricing Strategy Recommendation Under Partial Market Data

## Decision Frame

This recommendation addresses how to set or adjust pricing when market data is materially incomplete. The core tension: waiting for complete data delays revenue impact and competitive positioning; acting on incomplete data risks mispricing that erodes margin or volume.

**Decision owner:** Product / Revenue leadership
**Decision horizon:** Near-term pricing action (30–90 days)
**Stakes:** Meaningful — mispricing by >15% in either direction typically produces measurable harm (margin compression or demand destruction)

The recommended frame is **bounded commitment**: make the smallest pricing move that is defensible under current evidence, with pre-defined triggers that escalate to a full adjustment once evidence gaps close. This is not "wait and see" — it is a structured commitment with an explicit revision schedule.

---

## Unknowns & Evidence Gaps

Pricing decisions require three evidence classes. Below is the gap assessment under the stated partial-data condition:

| Evidence Class | Required Signal | Current Status | Gap Severity |
|---|---|---|---|
| **Demand elasticity** | Price sensitivity curve (own-price elasticity) | Unknown / assumed | High |
| **Competitive benchmarks** | Competitor price points and recent moves | Partial or stale | Medium |
| **Willingness to pay (WTP)** | Segment-level WTP distribution | Unknown | High |
| **Cost floor** | Fully-loaded unit economics | Assumed available | Low |
| **Churn / retention signal** | Price-driven churn rate at current price | Unknown | Medium |

**Critical gap:** Without own-price elasticity or segment WTP, any price increase is a hypothesis, not a forecast. Confidence intervals on volume impact are wide enough to make P&L projections unreliable.

**Acceptable partial data:** Cost floor + rough competitive band is sufficient to bound the downside (don't price below cost, don't price wildly above market). It is not sufficient to optimize.

---

## Pass/Fail Readiness

**Readiness test:** Should we execute a pricing change now, or is the evidence gap too large?

### Pass criteria (all must be true to proceed with any bounded move)
- [ ] Cost floor confirmed — fully-loaded unit economics documented
- [ ] At least one competitive anchor — one comparable product's price is known and recent (<6 months)
- [ ] A rollback mechanism exists — pricing can be reversed or grandfathered within 30 days if demand signal turns negative
- [ ] A measurement plan is in place — volume, conversion rate, and churn will be tracked weekly post-change
- [ ] **Category risk screen passed** — see below

### Category risk screen (gates the size of any bounded move)

The appropriate ceiling for a "low-risk" initial move varies by product context. Before applying any delta, answer these:

| Risk Factor | Example | Effect on Threshold |
|---|---|---|
| Annual or multi-year contracts | SaaS, enterprise software | Even 1–2% may trigger procurement review or renegotiation |
| High price salience | Commodity inputs, consumer staples | Customers notice small changes; churn risk elevated |
| Psychologically significant price points | $99 → $100, $999 → $1,000 | Non-linear response at round-number boundaries |
| Procurement / committee buying | B2B with formal RFP process | Any increase can restart a vendor review |
| Regulatory or contractual MFN clauses | Marketplace sellers, enterprise MSAs | Price moves may trigger automatic adjustments elsewhere |

**If none of these apply:** A small initial move (historically in the single-digit-percent range for consumer/SMB products with monthly billing) is often within observational noise and serves as a learning investment. The exact ceiling should be calibrated against your category's known churn sensitivity, not assumed from a generic benchmark.

**If one or more apply:** Treat any move — regardless of magnitude — as requiring explicit elasticity evidence before execution. A 1% increase in an annual-contract enterprise product can be as consequential as a 15% increase in a monthly-subscription consumer product.

### Fail criteria (any one blocks execution)
- No demand elasticity signal whatsoever (no A/B history, no survey, no cohort data)
- Competitive landscape is actively shifting (announced moves pending)
- No rollback path (contractual or technical lock-in prevents reversal)
- Category risk screen flags high salience or annual-contract structure with no elasticity data

### Current readiness verdict (under zero provided evidence)
**Conditional pass for a small, context-calibrated move — if the category risk screen clears.** Fail for any move in high-salience or annual-contract contexts until at least one elasticity proxy is obtained.

**Rationale:** The prior version of this recommendation stated ≤5% as a generic safe threshold. That framing has been revised: there is no universally safe delta under partial data. The threshold is context-dependent. In favorable contexts (monthly billing, low salience, easy rollback), a small initial move generates learning with limited downside. In unfavorable contexts, even a 1–2% move carries material risk. The bounded-commitment posture remains correct; the specific bound requires a category risk screen, not a generic percentage.

---

## Recommended Next Artifact

**Artifact:** Pricing Sensitivity Test Plan

**Why this next:** The strategy recommendation above is blocked on elasticity data. The fastest path to that data is a structured test, not additional research. A test plan defines the cohort, the price delta, the duration, and the success metric — it converts the evidence gap into a 2–4 week sprint rather than an open-ended research project.

**Minimum test plan contents:**
- Hypothesis: "A X% price increase will reduce conversion by no more than Y%"
- Category risk screen results (determines whether a live test is safe or a survey/conjoint is required instead)
- Test group definition (segment, channel, geography)
- Control condition
- Primary metric + threshold for "acceptable" outcome
- Duration and sample size (back-calculate from expected volume)
- Decision rule: if primary metric stays above threshold → proceed with full rollout; if not → hold at current price and investigate

**Alternative next artifact (if test is not feasible):** Competitive Pricing Audit — structured sweep of 3–5 comparable products to establish a defensible market anchor, which at minimum enables the cost-floor + market-band bounded move described above.

---

*Confidence note: This recommendation is calibrated for a generic pricing decision with no product context provided. Confidence is medium — the framework is sound, but the pass/fail thresholds and safe-move ceiling require calibration against actual product economics, contract structure, and segment data not present in this case packet. The category risk screen is the highest-priority input before any action.*
