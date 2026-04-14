# Pricing Strategy Recommendation Under Partial Market Data

## Decision Frame

**Core Question:** Should we proceed with a pricing change given that market data is incomplete?

**Decision Type:** Reversible pricing adjustment with bounded downside, not a permanent structural commitment.

**Stakes:** Pricing changes directly affect revenue, customer acquisition/retention, and competitive positioning. Acting on partial data risks mispricing in either direction — leaving revenue on the table or triggering churn. However, *not* acting also carries cost: if current pricing is misaligned with value delivery, every delay compounds the gap.

**Decision Criteria:**
- Do we have enough signal to bound the range of reasonable prices?
- Can we structure the change to be reversible or graduated?
- Is the cost of waiting for complete data greater than the cost of a bounded wrong move?

**Recommendation: Do not commit to a full pricing change now. Instead, execute a structured pricing experiment with explicit learning goals.**

## Unknowns & Evidence Gaps

| Gap | What We Don't Know | Impact on Decision | Mitigation |
|-----|-------------------|-------------------|------------|
| **Willingness to Pay (WTP)** | No Van Westendorp or conjoint data from current customers | Cannot anchor new price to demonstrated value perception | Run WTP survey on segment sample (2-week turnaround) |
| **Competitive pricing** | Partial view — know 2 of ~5 direct competitors' pricing; no insight into negotiated/enterprise rates | Risk of anchoring to visible competitors while invisible ones undercut | Supplement with win/loss interview data from sales team |
| **Price elasticity** | No historical data on churn response to past price changes (if any) | Cannot model revenue impact under different price points | Use cohort-based A/B test on new customers to measure elasticity before applying to base |
| **Segment-level value variance** | Unclear whether all segments derive equal value; usage data may reveal divergence | A single price change may over-serve low-value segments and under-serve high-value ones | Analyze usage/engagement data by segment before setting uniform vs. tiered pricing |
| **Cost structure shifts** | Unknown whether COGS or delivery costs are changing in ways that force margin action | If costs are rising, delay has direct margin erosion cost | Finance team input on 90-day cost trajectory |

**Critical unknown:** Without WTP data, any price point is a guess dressed as strategy. This is the single highest-value data gap to close.

## Pass/Fail Readiness

**Readiness Verdict: FAIL — Not ready for a committed pricing change.**

| Readiness Criterion | Status | Detail |
|---------------------|--------|--------|
| Bounded price range supported by evidence | ❌ FAIL | No WTP data; competitor data covers <50% of field |
| Reversibility mechanism in place | ⚠️ PARTIAL | Technically reversible, but price rollbacks damage trust and signal instability |
| Segment impact modeled | ❌ FAIL | No segment-level elasticity or value analysis completed |
| Stakeholder alignment | ⚠️ PARTIAL | Decision frame agreed, but no executive sign-off on experiment approach |
| Downside bounded | ⚠️ PARTIAL | Can limit blast radius via new-customer-only rollout, but base repricing unscoped |

**What would flip this to PASS:**
1. WTP survey results from ≥100 customers across top 2 segments
2. At least 3 of 5 competitor price points confirmed (public or via sales intelligence)
3. Segment-level usage analysis showing value delivery variance
4. Executive alignment on experiment-first approach with defined go/no-go criteria

## Recommended Next Artifact

**Artifact: Pricing Experiment Design Document**

Scope: Design a controlled pricing test that generates the missing evidence while limiting exposure.

**Contents should include:**
1. **Test structure:** New-customer cohort A/B test with 2-3 price points bracketing the hypothesized range
2. **Sample size and duration:** Statistical power calculation for detecting meaningful conversion/churn differences
3. **WTP research brief:** Survey instrument, target sample, and timeline for parallel WTP data collection
4. **Go/no-go criteria:** Explicit thresholds (conversion rate delta, churn signal, revenue per account) that determine whether to proceed to base repricing
5. **Rollback plan:** Pre-committed conditions under which the experiment terminates early
6. **Competitive intelligence sprint:** 2-week bounded effort to fill competitor pricing gaps via sales team debriefs and public source scraping

**Timeline:** 4-6 weeks to generate actionable data; full pricing decision at week 6 review.

**Why this sequence:** Committing to a price change under current evidence levels is decision theater — it looks decisive but is actually a coin flip. The experiment approach converts uncertainty into data at low cost and preserves optionality. The only scenario where immediate action is justified is if margin erosion from cost increases forces the hand — and we need Finance input to confirm or rule that out within 1 week.
