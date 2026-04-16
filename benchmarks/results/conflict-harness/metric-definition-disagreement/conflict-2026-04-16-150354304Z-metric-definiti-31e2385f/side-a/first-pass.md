# North Star Metric Recommendation: Resolving the Active User Definition Conflict

---

## Decision Frame

**The real problem is not which number is right. The problem is that leadership has asked for a number before agreeing on what question that number should answer.**

Three teams hold three defensible definitions because they serve three different decision domains:

| Team | Likely Definition | Decision It Serves |
|---|---|---|
| Finance | Paying or billable users | Revenue forecasting, cohort LTV |
| Product | Users who completed a core value action (e.g., created, shared, retained a key object) | Feature prioritization, UX health |
| Growth | Any user with a qualifying session in the period | Acquisition efficiency, funnel volume |

A 40% variance across definitions is not a data quality problem — it is a scope problem. Each definition is internally consistent within its domain. The conflict is that all three are being asked to answer a single question they were not individually designed to answer.

**The north star must be defined by the business question, not inherited from a team's existing instrumentation.**

The business question leadership is actually asking: *Is this product creating durable value at scale?*

That question requires a metric that is:
1. **Predictive of retention** — not just present-period activity
2. **Predictive of revenue** — correlated with paid conversion or expansion, not vanity sessions
3. **Actionable** — a team can move it through deliberate product changes, not just acquisition spend
4. **Legible** — explainable to the board without a methodology footnote

**Provisional recommendation:** Define active user as *a user who completes the product's primary value action at least once in the measurement period, with a minimum session depth threshold.* This aligns with product's core-action framing but requires a retention-correlation validation pass before committing.

Do not average the three definitions. A blended composite would be arithmetically defensible and strategically meaningless — it would inherit the noise of all three without the signal of any one.

---

## Unknowns & Evidence Gaps

**Gap 1 — Retention correlation is unvalidated.**
The critical unknown: which of the three definitions best predicts 30/60/90-day user retention? Without this data, any definition choice is a values assertion, not an evidence-based recommendation. A user who logs in once and churns is not the same as a user who returns.

**Gap 2 — Revenue correlation is unvalidated.**
For freemium or subscription products: which definition's cohort converts to paid at the highest rate? The definition that best predicts LTV is the one that should anchor financial planning.

**Gap 3 — Historical trend divergence is uncharacterized.**
The 40% difference tells us the definitions diverge — but we don't know if they diverge consistently or variably over time. If they tracked together until 18 months ago and then separated, that separation is a signal about a product or acquisition change, not just a definitional artifact.

**Gap 4 — Ownership and governance are undefined.**
Who is accountable for moving the north star? A metric without an owner becomes a reporting artifact. Until a team owns it and is evaluated on it, definitional compromise is cosmetic.

**Gap 5 — Measurement period is ambiguous.**
All three definitions likely differ on their time window (daily active, weekly active, monthly active). The period chosen changes which behaviors count. This must be standardized before any single number can be reported.

---

## Pass/Fail Readiness

**NOT READY** to commit to a final single number today.

| Readiness Gate | Status | Blocker |
|---|---|---|
| Retention correlation analysis complete | ❌ Blocked | Requires data pull across all three definition cohorts |
| Revenue/LTV correlation analysis complete | ❌ Blocked | Requires finance team collaboration on cohort matching |
| Historical trend reconciliation complete | ❌ Blocked | Requires 24-month lookback under each definition |
| Metric owner designated | ❌ Blocked | Leadership alignment not yet complete |
| Measurement period standardized | ⚠️ Partial | Can be resolved in metric definition session |

**READY** to do two things immediately:

1. **Eliminate the growth-team definition as the north star.** Any-session definitions measure acquisition reach, not product value delivery. They are necessary for funnel reporting but should not be the company's single north star metric. This can be decided now without additional data.

2. **Establish a 10-business-day data sprint** to run retention and LTV correlation across finance and product definitions, using the methodology described in the Recommended Next Artifact section below.

**What leadership should report in the interim:** Report all three numbers transparently with definitions attached, and explicitly flag that a north star consolidation is in progress. This is less clean than one number but more honest than a number that is quietly disputed by two of three teams.

---

## Recommended Next Artifact

**Artifact: Active User Definition Validation Analysis**

This analysis should be produced by data/analytics within 10 business days, with input from all three teams on their definition parameters.

**Structure:**

1. **Cohort construction** — For the trailing 12 months, classify users under each of the three definitions for each month. Produce three parallel time series.

2. **Retention correlation** — For each cohort in each month, measure 30/60/90-day return rate. Score each definition by its predictive strength (R² or equivalent).

3. **Revenue correlation** — For freemium/subscription products: measure conversion-to-paid and expansion revenue rate for each cohort. Score each definition.

4. **Trend reconciliation** — Plot all three definitions' time series on a single chart. Identify when and why they diverge. Annotate with product launches, acquisition campaigns, and platform changes.

5. **Recommendation** — The definition with the strongest combined retention + revenue predictive score becomes the proposed north star. Present the tradeoffs of the runner-up definitions explicitly so leadership understands what is being deprioritized.

**Decision gate:** If the winning definition produces a trend that shows flat or declining growth, that is the correct answer. A north star metric that shows growth when the product is declining is more dangerous than a declining metric that is accurate. The goal is not to find the most flattering definition — it is to find the most truthful one.

**Owners:** Data analytics lead (primary), Finance and Product as co-reviewers, Growth as input provider.

**Format:** Single-page executive summary with supporting appendix. The executive summary should contain one chart (three-definition time series), one table (correlation scores), and one paragraph recommendation. It should be readable in under three minutes.

