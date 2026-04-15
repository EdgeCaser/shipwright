# Pricing Strategy Recommendation Under Partial Market Data

## Decision Frame

**Core question:** Should we adjust pricing now with incomplete market data, or defer until better data is available?

**Stakes:** Pricing changes are high-leverage and partially reversible. A price increase risks churn if competitors are undercutting; a price decrease risks margin erosion that is psychologically difficult to reverse. The cost of waiting is opportunity cost if the market has already moved.

**What we are actually deciding:** Not the final price point, but whether the current evidence meets the threshold to act, and if not, what the minimum viable research plan looks like to reach that threshold.

**Framing constraint:** With partial data, the strategy must be designed to be *updateable* — we are choosing a decision architecture, not a permanent number.

## Unknowns & Evidence Gaps

| Gap | Impact on Decision | Closable? | Estimated Cost to Close |
|---|---|---|---|
| Competitor pricing (current) | High — cannot assess relative position without it | Likely — mystery shopping, public price pages, sales intel | Estimated 1-2 weeks, low cost (contingent on market transparency) |
| Price elasticity of demand | High — cannot model churn/uptake response | Partially — requires A/B test or conjoint study | Estimated 4-8 weeks, moderate cost (depends on test infrastructure readiness) |
| Customer willingness-to-pay distribution | High — risk of anchoring to internal assumptions | Likely — Van Westendorp or Gabor-Granger survey | Estimated 2-4 weeks, moderate cost (depends on customer access) |
| Segment-level margin data | Medium — blended margins mask cross-subsidy | Likely — finance team analysis | Estimated 1 week, internal effort |
| Channel partner impact | Medium — pricing changes may violate agreements or trigger renegotiation | Yes — contract review + partner conversations | 1-2 weeks |
| Macroeconomic demand sensitivity | Low-Medium — relevant in recessionary periods | Partially — proxy via recent pipeline velocity trends | Available now |

**What we DO have (assumed baseline):**
- Internal cost structure and current margins
- Historical sales volume at current price
- Anecdotal competitive intel (not systematic)
- Customer satisfaction/NPS trends

**Important caveat:** The timelines and cost estimates above are heuristic ranges drawn from common B2B pricing research practice, not from verified operational constraints in this specific context. Actual feasibility depends on factors such as test infrastructure maturity, customer panel availability, and competitive market transparency. These estimates should be validated against the organization's real capabilities before committing to a research timeline.

## Pass/Fail Readiness

**Verdict: FAIL — Not ready to commit to a specific price change.**

**Rationale:** The three highest-impact unknowns (competitor pricing, elasticity, WTP distribution) remain unaddressed. The case provides no evidence that these gaps have been investigated, nor that the organization has assessed whether they are closable on a practical timeline. Acting on pricing without demand-side or competitive signals substitutes intuition for strategy. However, this verdict is *conditional*: it assumes no exogenous forcing function is present and that the cost of delay is bounded.

**What could flip this to PASS:**
1. Competitive pricing data collected and analyzed (minimum 3 direct competitors)
2. At least one demand-side signal — either a WTP survey (n≥100 target customers) or a controlled price test on a non-critical segment
3. Segment-level margin analysis completed to identify where pricing power actually exists

**Alternatively, a forcing function** (imminent competitor move, cost structure change making current price unsustainable, contract renewal deadline) would justify proceeding under partial data — but with a *bounded* approach: price test on a single segment, exposure capped at ≤15% of revenue base, 90-day review gate with pre-defined kill criteria.

**Note on the FAIL verdict:** This does not mean "do nothing." It means the appropriate immediate action is structured research, not a pricing commitment. Delay has its own costs (opportunity cost, competitive exposure), and the research plan below is designed to minimize that delay.

## Recommended Next Artifact

**Artifact:** Pricing Research Brief — a scoped research plan to close the top 3 evidence gaps.

**Contents should include:**
1. **Competitive audit scope** — which competitors, which products/tiers, data collection method, owner, deadline
2. **WTP study design** — methodology (Van Westendorp recommended for speed), sample definition, screening criteria, analysis plan
3. **Feasibility check** — explicit validation of whether the estimated research timelines are achievable given current organizational capabilities (customer panel access, test infrastructure, analyst bandwidth)
4. **Bounded price test design** (if forcing function exists) — segment selection, test vs. control, success/failure metrics, kill criteria, duration
5. **Decision checkpoint** — calendar date where leadership reviews findings and makes go/no-go on price change with improved data

**Why this artifact next:** A pricing decision made with partial data carries unquantified risk in both directions (overpricing causes churn, underpricing erodes margin). The research brief converts the current uncertainty into a bounded project with a clear decision point. This path prioritizes decision quality over decision speed, which is appropriate when the cost of reversal is high and no forcing function has been identified.
