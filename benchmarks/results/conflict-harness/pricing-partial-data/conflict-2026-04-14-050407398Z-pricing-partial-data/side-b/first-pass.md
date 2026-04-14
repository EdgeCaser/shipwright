# Pricing Strategy Recommendation Under Partial Market Data

## Decision Frame

**Core question:** Should we adjust pricing now with incomplete market data, or defer until better data is available?

**Stakes:** Pricing changes are high-leverage and partially reversible. A price increase risks churn if competitors are undercutting; a price decrease risks margin erosion that is psychologically difficult to reverse. The cost of waiting is opportunity cost if the market has already moved.

**What we are actually deciding:** Not the final price point, but whether the current evidence meets the threshold to act, and if not, what the minimum viable research plan looks like to reach that threshold.

**Framing constraint:** With partial data, the strategy must be designed to be *updateable* — we are choosing a decision architecture, not a permanent number.

## Unknowns & Evidence Gaps

| Gap | Impact on Decision | Closable? | Estimated Cost to Close |
|---|---|---|---|
| Competitor pricing (current) | High — cannot assess relative position without it | Yes — mystery shopping, public price pages, sales intel | 1-2 weeks, low cost |
| Price elasticity of demand | High — cannot model churn/uptake response | Partially — requires A/B test or conjoint study | 4-8 weeks, moderate cost |
| Customer willingness-to-pay distribution | High — risk of anchoring to internal assumptions | Yes — Van Westendorp or Gabor-Granger survey | 2-4 weeks, moderate cost |
| Segment-level margin data | Medium — blended margins mask cross-subsidy | Yes — finance team analysis | 1 week, internal effort |
| Channel partner impact | Medium — pricing changes may violate agreements or trigger renegotiation | Yes — contract review + partner conversations | 1-2 weeks |
| Macroeconomic demand sensitivity | Low-Medium — relevant in recessionary periods | Partially — proxy via recent pipeline velocity trends | Available now |

**What we DO have (assumed baseline):**
- Internal cost structure and current margins
- Historical sales volume at current price
- Anecdotal competitive intel (not systematic)
- Customer satisfaction/NPS trends

## Pass/Fail Readiness

**Verdict: FAIL — Not ready to commit to a specific price change.**

**Rationale:** The three highest-impact unknowns (competitor pricing, elasticity, WTP distribution) are all closable within 4-8 weeks at moderate cost. Making a pricing decision without any of these three is operating on intuition, not strategy. The risk-reward ratio does not justify acting now unless there is an exogenous forcing function (e.g., contract renewal cycle, competitive emergency, board mandate).

**Conditions that would flip this to PASS:**
1. Competitive pricing data collected and analyzed (minimum 3 direct competitors)
2. At least one demand-side signal — either a WTP survey (n≥100 target customers) or a controlled price test on a non-critical segment
3. Segment-level margin analysis completed to identify where pricing power actually exists

**Exception path:** If a forcing function exists (imminent competitor move, cost structure change making current price unsustainable), proceed with a *bounded* price test on a single segment rather than a broad change. Cap exposure at ≤15% of revenue base. Set a 90-day review gate.

## Recommended Next Artifact

**Artifact:** Pricing Research Brief — a scoped research plan to close the top 3 evidence gaps within 6 weeks.

**Contents should include:**
1. **Competitive audit scope** — which competitors, which products/tiers, data collection method, owner, deadline
2. **WTP study design** — methodology (Van Westendorp recommended for speed), sample definition, screening criteria, analysis plan
3. **Bounded price test design** (if forcing function exists) — segment selection, test vs. control, success/failure metrics, kill criteria, duration
4. **Decision checkpoint** — calendar date (6 weeks out) where leadership reviews findings and makes go/no-go on price change with complete data

**Why this artifact next:** A pricing decision made with partial data is a guess with a strategy label. The research brief converts the current uncertainty into a bounded, time-boxed project with a clear decision point. This is the lowest-risk path to a high-confidence pricing change.
