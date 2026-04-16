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

A north star metric must satisfy **five criteria simultaneously**, not just one:

1. **Predictive of retention** — not just present-period activity
2. **Correlated with revenue** — tied to paid conversion or expansion, not vanity sessions
3. **Actionable** — a team can move it through deliberate product changes, not just acquisition spend; teams outside monetization must be able to influence it
4. **Legible** — explainable to the board without a methodology footnote, computable without a multi-week data pipeline
5. **Stable and timely** — consistent across measurement periods, available at the cadence leadership needs to act on it

A metric that scores highly on retention prediction but fails actionability, timeliness, or cross-functional operability is not a north star — it is an analyst's tool. These criteria must all be evaluated, not just the predictive ones.

**Provisional recommendation:** Define active user as *a user who completes the product's primary value action at least once in the measurement period, with a minimum session depth threshold.* This aligns with product's core-action framing. Before committing, this definition must pass all five criteria above — not just retention and LTV correlation.

Do not average the three definitions. A blended composite would be arithmetically defensible and strategically meaningless — it would inherit the noise of all three without the signal of any one.

---

## Unknowns & Evidence Gaps

**Gap 1 — Retention correlation is unvalidated.**
Which of the three definitions best predicts 30/60/90-day user retention? Without this data, any definition choice is a values assertion, not an evidence-based recommendation.

**Gap 2 — Revenue correlation is unvalidated.**
For freemium or subscription products: which definition's cohort converts to paid at the highest rate? The definition that best predicts LTV is a necessary (not sufficient) input to the north star selection.

**Gap 3 — Actionability and timeliness are unassessed.**
Even a definition with strong predictive power may be a poor north star if it is lagging (e.g., only computable monthly with a 2-week delay), expensive to compute, or only movable by one team. The validation sprint must include an explicit operability assessment: how quickly can each definition be computed, and which teams can directly influence it?

**Gap 4 — Historical trend divergence is uncharacterized.**
The 40% difference tells us the definitions diverge — but we don't know if they diverge consistently or variably over time. If they tracked together until 18 months ago and then separated, that separation is a signal about a product or acquisition change, not just a definitional artifact.

**Gap 5 — Ownership and governance are undefined.**
Who is accountable for moving the north star? A metric without an owner becomes a reporting artifact.

**Gap 6 — Measurement period is ambiguous.**
All three definitions likely differ on their time window (DAU/WAU/MAU). The period chosen changes which behaviors count and affects both stability and timeliness. This must be standardized.

---

## Pass/Fail Readiness

**NOT READY** to commit to a final single number today.

| Readiness Gate | Status | Blocker |
|---|---|---|
| Retention correlation analysis complete | ❌ Blocked | Requires data pull across all three definition cohorts |
| Revenue/LTV correlation analysis complete | ❌ Blocked | Requires finance team collaboration on cohort matching |
| Operability assessment complete (timeliness, actionability, stability) | ❌ Blocked | Not yet scoped |
| Historical trend reconciliation complete | ❌ Blocked | Requires 24-month lookback under each definition |
| Metric owner designated | ❌ Blocked | Leadership alignment not yet complete |
| Measurement period standardized | ⚠️ Partial | Can be resolved in metric definition session |

**READY** to do two things immediately:

1. **Eliminate the growth-team definition as the north star.** Any-session definitions measure acquisition reach, not product value delivery. They are necessary for funnel reporting but fail the actionability and retention-predictive criteria structurally. This can be decided now without additional data.

2. **Establish a 10-business-day validation sprint** scoped across all five criteria — not just retention and LTV correlation.

**What leadership should report in the interim:** Report all three numbers transparently with definitions attached, and explicitly flag that a north star consolidation is in progress. This is less clean than one number but more honest than a number that is quietly disputed by two of three teams.

---

## Recommended Next Artifact

**Artifact: Active User Definition Validation Analysis**

This analysis should be produced by data/analytics within 10 business days, with input from all three teams on their definition parameters.

**Structure:**

1. **Cohort construction** — For the trailing 12 months, classify users under each of the three definitions for each month. Produce three parallel time series.

2. **Retention correlation** — For each cohort in each month, measure 30/60/90-day return rate. Score each definition by predictive strength (R² or equivalent).

3. **Revenue correlation** — Measure conversion-to-paid and expansion revenue rate for each cohort. Score each definition.

4. **Operability scorecard** — For each definition: (a) how quickly is it computable after period close, (b) which teams can directly move it through product decisions vs. only acquisition spend, (c) how stable is it across rolling periods. A definition that wins on prediction but loses badly on operability should be flagged as an analyst tool, not a north star candidate.

5. **Trend reconciliation** — Plot all three definitions' time series on a single chart. Identify when and why they diverge. Annotate with product launches, acquisition campaigns, and platform changes.

6. **Recommendation** — Rank definitions against all five criteria. The definition with the strongest combined score across prediction, actionability, timeliness, stability, and legibility becomes the proposed north star. Present runner-up tradeoffs explicitly.

**Decision gate:** If the winning definition produces a trend that shows flat or declining growth, that is the correct answer. A north star metric that shows growth when the product is declining is more dangerous than a declining metric that is accurate.

**Owners:** Data analytics lead (primary), Finance and Product as co-reviewers, Growth as input provider.

**Format:** Single-page executive summary with supporting appendix. The executive summary should contain one chart (three-definition time series), one table (five-criteria scorecard), and one paragraph recommendation. Readable in under three minutes.

