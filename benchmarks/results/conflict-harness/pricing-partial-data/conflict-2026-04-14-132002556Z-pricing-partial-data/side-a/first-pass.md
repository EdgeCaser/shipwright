# Pricing Strategy Recommendation Under Partial Market Data

## Decision Frame

**Context:** We are evaluating a pricing change with incomplete market data. The core decision is whether to proceed with a pricing adjustment now, defer until more data is available, or run a controlled experiment to fill critical gaps before committing.

**Decision type:** Reversible with cost. Pricing changes can be rolled back, but each change carries switching costs: customer trust erosion, sales team retraining, contract renegotiation cycles, and brand perception shifts. This is not a free option.

**Stakeholders:** Product, Sales, Finance, Customer Success. Each has different loss functions — Sales optimizes for deal velocity, Finance for margin, CS for retention, Product for positioning coherence.

**Time pressure:** Moderate. No immediate competitive forcing function has been established in the available evidence. However, the absence of evidence of competitive pressure is not evidence of absence — this is itself a gap.

## Unknowns & Evidence Gaps

The following critical unknowns make a high-confidence recommendation impossible at this stage:

| Gap ID | Unknown | Impact on Decision | Fillable? | Method |
|--------|---------|-------------------|-----------|--------|
| G-1 | **Competitive pricing landscape** — No current competitor price points or packaging structures provided | Cannot assess whether proposed price is above/below market or how competitors may respond | Yes | Competitive intelligence sweep, win/loss analysis |
| G-2 | **Price elasticity of demand** — No historical data on how volume responds to price changes in this market | Cannot model revenue impact of price increase vs. decrease | Yes, partially | Conjoint analysis, historical cohort analysis, A/B test |
| G-3 | **Customer willingness-to-pay distribution** — No segmented WTP data | Cannot determine if a single price point or tiered structure is appropriate | Yes | Van Westendorp survey, Gabor-Granger, customer interviews |
| G-4 | **Current churn drivers and price sensitivity** — No data on whether price is a stated or revealed churn factor | Risk of accelerating churn if price increases hit price-sensitive segments | Yes | Churn exit survey analysis, CS ticket classification |
| G-5 | **Margin structure and cost basis** — No unit economics provided | Cannot evaluate whether pricing change improves or threatens margin sustainability | Yes | Finance data pull |
| G-6 | **Contract and commitment structure** — Unknown how many customers are on fixed-term vs. month-to-month | Determines blast radius and timeline of any change | Yes | Billing system query |

**Assessment:** Gaps G-1 through G-4 are decision-critical. Making a pricing recommendation without them is equivalent to guessing with a professional vocabulary. G-5 and G-6 are execution-critical — needed before implementation even if direction is established.

## Pass/Fail Readiness

**Verdict: FAIL — Not ready for a pricing decision.**

Rationale:
- Zero context files or evidence artifacts were provided. Every dimension of a responsible pricing recommendation — competitive position, customer WTP, elasticity, margin impact — is ungrounded.
- A pricing strategy built on no evidence is indistinguishable from a pricing guess. Shipping a guess as a strategy creates false confidence and exposes the organization to unforced errors.
- The responsible action is to name what we don't know, specify what evidence would change the decision, and define the fastest path to that evidence.

**What would change this to PASS:**
1. Competitive pricing data for top 3-5 alternatives (G-1 resolved)
2. At minimum, directional WTP data from 15+ customer interviews or survey responses (G-3 partially resolved)
3. Historical retention data segmented by price sensitivity indicators (G-4 resolved)
4. Unit economics showing current margin at existing price point (G-5 resolved)

With items 1-3, we could draft a directional recommendation. With all four, we could draft a confident one.

## Recommended Next Artifact

**Artifact:** Pricing Evidence Collection Plan (research brief)

**Purpose:** Define the minimum viable evidence package that enables a defensible pricing decision within 2-4 weeks.

**Contents should include:**
1. **Competitive audit scope** — Which competitors, which price dimensions (list price, effective price, packaging), what sources
2. **WTP research design** — Method selection (Van Westendorp vs. conjoint vs. interviews), sample size, segment definitions, timeline
3. **Internal data pulls** — Churn analysis by cohort, win/loss pricing mentions, margin waterfall, contract structure distribution
4. **Decision criteria** — Pre-commit to what evidence patterns would lead to: (a) price increase, (b) price decrease, (c) repackaging without price change, (d) no change
5. **Kill criteria** — What findings would make us abandon the pricing change initiative entirely

**Why this artifact next:** Jumping to a pricing recommendation without evidence is the highest-risk path. A 2-4 week evidence sprint is cheap insurance against a pricing mistake that could take quarters to unwind. The research brief forces alignment on what "enough data" looks like before the organization spends the political capital of a pricing change.
