# Churn Reduction PRD: Resolving Conflicting Signals

## Decision Frame

**Problem statement:** Monthly churn rate has increased from 4.2% to 6.1% over the past two quarters, but conflicting internal signals make root-cause attribution uncertain and the correct intervention unclear.

**Conflicting signals identified:**

| Signal | Direction | Source | Implication |
|--------|-----------|--------|-------------|
| NPS scores | Stable/improving (72→74) | Quarterly survey | Product satisfaction is not degrading |
| Support ticket volume | Up 35% | Zendesk | Users are hitting more friction |
| Feature adoption (new) | Up 18% | Product analytics | Engaged users are exploring |
| Time-to-value for new cohorts | Degraded 22% | Onboarding funnel | New users struggle to reach aha moment |
| Expansion revenue | Up 12% | Billing | Retained users are spending more |
| Involuntary churn (payment failures) | Up 40% | Stripe | Mechanical churn masking voluntary patterns |

**Core tension:** Strategy targets emphasize net revenue retention (NRR > 110%) and new feature velocity. Churn reduction competes for engineering resources with expansion-driving features. The signal conflict means we risk optimizing for the wrong lever — cutting voluntary churn when the problem is mechanical, or investing in onboarding when the real issue is pricing friction.

**Decision required:** Should we (a) prioritize involuntary churn recovery (payment dunning, retry logic), (b) invest in onboarding time-to-value improvements, or (c) hold and run a diagnostic sprint before committing resources?

**Recommendation:** Option (c) — run a 2-week diagnostic sprint before committing to a solution. The conflicting signals create unacceptable risk of misallocation. The diagnostic sprint has a defined exit criterion: a decomposed churn waterfall that attributes at least 80% of the delta to specific, actionable causes.

## Unknowns & Evidence Gaps

### Critical unknowns (must resolve before building)

1. **Churn decomposition is missing.** We report a single churn number but have not separated voluntary vs. involuntary, nor segmented by cohort vintage, plan tier, or usage intensity. Without this, any intervention is a guess.
   - *Evidence needed:* Churn waterfall analysis segmented by voluntary/involuntary, cohort, plan, and engagement quartile.
   - *Owner:* Data team.
   - *Timeline:* 5 business days.

2. **Support ticket → churn correlation is unvalidated.** Ticket volume is up, but we don't know if ticket-filing users churn at higher rates or if the increase reflects a more vocal but loyal segment.
   - *Evidence needed:* Survival analysis comparing ticket-filing users vs. non-filers within the same cohort and plan.
   - *Owner:* Data team.
   - *Timeline:* 3 business days (can run in parallel with #1).

3. **Payment failure root cause is unclear.** The 40% increase in involuntary churn could be card expiration cycles, a billing provider issue, international payment method gaps, or pricing-tier sticker shock triggering cancellation-before-charge.
   - *Evidence needed:* Stripe failure reason codes, retry success rates, geographic and plan-tier breakdown.
   - *Owner:* Payments/billing team.
   - *Timeline:* 2 business days.

### Important but deferrable unknowns

4. **NPS respondent bias.** If churned users don't receive or complete NPS surveys, the stable score is survivorship bias. Need to check survey delivery against churn timing.
5. **Competitive displacement signal.** No win/loss data on whether churned users are leaving for a competitor or leaving the category entirely.
6. **Onboarding degradation cause.** Time-to-value increase could be product complexity, audience shift (less technical users), or a broken activation flow — each demands a different fix.

### What we will NOT investigate in this phase

- Pricing restructuring (separate initiative, longer cycle)
- Brand/positioning churn drivers (unmeasurable in this timeframe)

## Pass/Fail Readiness

**Readiness verdict: NOT READY to commit to a solution.**

The PRD cannot recommend a specific churn intervention because the prerequisite diagnostic evidence does not exist. Committing resources now would be premature.

### Pass criteria for proceeding to solution design

| # | Criterion | Status | Blocking? |
|---|-----------|--------|-----------|
| 1 | Churn waterfall with voluntary/involuntary split by segment | Not started | Yes |
| 2 | Support ticket → churn correlation validated or falsified | Not started | Yes |
| 3 | Payment failure root cause identified with actionable categories | Not started | Yes |
| 4 | NPS survivorship bias checked | Not started | No (but affects confidence) |
| 5 | At least 80% of churn delta attributed to specific causes | Not started | Yes — exit criterion for diagnostic sprint |

### Risks of proceeding without evidence

- **Misallocation risk (HIGH):** If involuntary churn is the primary driver, investing in onboarding improvements wastes a quarter of engineering time with no churn impact.
- **Strategy conflict risk (MEDIUM):** Churn interventions that slow feature velocity may reduce expansion revenue, worsening NRR even if gross churn improves.
- **Measurement risk (MEDIUM):** Without a decomposed baseline, we cannot measure the impact of any intervention we ship.

## Recommended Next Artifact

**Next artifact:** Churn Diagnostic Sprint Brief

**Purpose:** Define the 2-week diagnostic sprint scope, assign owners to each evidence gap above, establish the exit criterion (80% attribution waterfall), and schedule the go/no-go review.

**Contents of the sprint brief:**
1. Sprint goal and exit criteria
2. Evidence workstreams with owners and deadlines (mapped from Unknowns above)
3. Data access requirements and instrumentation gaps
4. Go/no-go review meeting — scheduled for end of sprint with VP Product and VP Engineering
5. Decision tree: which intervention path to pursue based on diagnostic findings (involuntary-heavy → dunning/payments track; onboarding-heavy → activation track; distributed → portfolio approach with staged rollout)

**After the diagnostic sprint**, the follow-on artifact will be one of:
- **Payments Recovery PRD** — if involuntary churn accounts for >50% of the delta
- **Onboarding Acceleration PRD** — if time-to-value degradation correlates with >50% of voluntary churn
- **Churn Portfolio Roadmap** — if causes are distributed and require multiple parallel workstreams

**Timeline:** Diagnostic sprint starts within 3 business days of PRD approval. Go/no-go review 2 weeks later. Solution PRD drafted within 1 week of go decision.
