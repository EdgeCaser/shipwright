# Churn Reduction PRD: Resolving Conflicting Signals

## Decision Frame

**Problem statement:** Churn metrics indicate elevated customer attrition, but the signals conflict with current strategy targets — e.g., usage metrics show healthy engagement while revenue churn accelerates, or NPS remains stable while logo churn spikes. This PRD defines how to diagnose the root conflict, prioritize interventions, and establish pass/fail gates before committing engineering resources.

**Decision to be made:** Should we (a) re-segment the churn definition to isolate the conflicting cohorts, (b) adjust strategy targets to reflect the actual retention landscape, or (c) hold current strategy and investigate whether the conflicting signals are measurement artifacts?

**Stakeholders:** Product (owns retention metric), Growth (owns acquisition/expansion targets that may conflict), Finance (owns revenue churn definition), Data Science (owns signal integrity).

**Why signals conflict matters:** When leading indicators (engagement, NPS, feature adoption) diverge from lagging indicators (revenue churn, logo churn, contraction), the most common failure mode is picking the comfortable signal and ignoring the uncomfortable one. This PRD forces explicit reconciliation.

### Conflict Root-Cause Taxonomy

Conflicting signals can arise from multiple distinct mechanisms. The correct diagnostic path depends on which mechanism is dominant — no single root cause should be assumed without evidence.

| Root Cause Category | Example | Diagnostic Action | Priority |
|---|---|---|---|
| **Aggregation artifact (Simpson's Paradox)** | Aggregate churn flat, but mature-customer churn spiking while new-customer churn dropping | Cohort vintage disaggregation | Run in parallel |
| **Metric-definition mismatch** | Logo churn rising while revenue churn stable because definitions use different denominators or time windows | Metric audit — align definitions across teams | Run in parallel |
| **Contract timing / pricing changes** | Annual cohort renewing into higher price point triggers cancellations; monthly cohort unaffected | Contract-timing analysis cross-referenced with pricing changes | Run in parallel |
| **Stale or invalid leading indicators** | DAU/MAU healthy but engagement doesn't actually predict renewal for this product | Engagement-retention correlation analysis | Run in parallel |
| **Survivorship bias in feedback signals** | NPS stable because only retained (satisfied) customers respond; churned customers never surveyed | Win-back interviews with recently churned accounts | Run in parallel |
| **Expansion revenue masking contraction** | Net revenue retention positive, but gross churn accelerating underneath upsell growth | Decompose NRR into gross retention + expansion components | Run in parallel |

**Key principle:** These diagnostics should run in parallel, not sequentially. The conflict taxonomy above is not rank-ordered — the actual root cause must be discovered, not assumed.

## Unknowns & Evidence Gaps

1. **Cohort-level churn disaggregation is missing.** Aggregate churn rate blends new-customer churn (expected) with mature-customer churn (alarming). Cohort vintage analysis is one of several parallel diagnostics needed to determine whether the conflicting signal is an aggregation artifact or reflects a genuine divergence.
   - *Evidence needed:* Cohort retention curves by signup quarter, segmented by plan tier and acquisition channel.
   - *Owner:* Data Science.
   - *Timeline:* 1 sprint.

2. **Metric definitions may not be aligned across teams.** Product, Finance, and Growth may each calculate churn differently (logo vs. revenue, gross vs. net, monthly vs. annual window). Definitional mismatch alone can produce apparently conflicting signals without any real behavioral change.
   - *Evidence needed:* Side-by-side comparison of churn definitions used by each stakeholder team, including denominator, time window, and exclusion rules.
   - *Owner:* Data Science + Finance.
   - *Timeline:* 1 week.

3. **Strategy targets may encode stale assumptions.** If targets were set assuming X% gross churn and actual is 1.5X%, the "conflict" is between reality and a plan, not between two real signals.
   - *Evidence needed:* Audit of target-setting assumptions from last planning cycle. What churn rate was modeled? What has changed?
   - *Owner:* Finance + Product.
   - *Timeline:* 1 week.

4. **Churn reason attribution is unreliable.** Exit surveys have <15% response rate (industry typical). Cancellation flow captures "reason" but options are vague ("too expensive", "not using enough"). No win-back interview program exists.
   - *Evidence needed:* Structured win-back interviews with 20+ recently churned accounts from the conflicting cohort.
   - *Owner:* Customer Success.
   - *Timeline:* 3 weeks.

5. **Competitive displacement vs. budget cut vs. product gap.** Without knowing *why* customers leave, interventions are guesses. Price cuts won't help if the issue is missing functionality; feature investment won't help if the issue is budget pressure.
   - *Evidence needed:* Competitive loss analysis cross-referenced with churn timing.
   - *Owner:* Product Marketing.
   - *Timeline:* 2 weeks.

6. **Leading indicator validity is unverified.** The engagement metrics we trust may not actually predict retention. Has anyone validated that DAU/MAU or feature adoption correlates with renewal in our data?
   - *Evidence needed:* Predictive model or simple correlation analysis between engagement features and 90-day retention.
   - *Owner:* Data Science.
   - *Timeline:* 2 sprints.

## Pass/Fail Readiness

**This PRD is NOT ready for solution design.** Before committing to any churn intervention, the following gates must clear:

| Gate | Status | Criteria | Blocking? |
|---|---|---|---|
| Metric definition audit | ❌ Not started | All stakeholder churn definitions documented and reconciled | Yes |
| Cohort disaggregation complete | ❌ Not started | Churn rates by vintage, tier, channel available in dashboard | Yes |
| Target assumptions audited | ❌ Not started | Finance confirms whether targets assumed current churn levels | Yes |
| Win-back interviews (n≥15) | ❌ Not started | Qualitative themes coded and clustered | Yes |
| Leading indicator validation | ❌ Not started | Engagement-retention correlation established or debunked | Yes |
| Root cause identified or triaged | ❌ Not started | Team agrees on dominant conflict mechanism from taxonomy above, with evidence | Yes |

**Current readiness: FAIL.** We have a symptom (conflicting signals) but not a diagnosis. Shipping interventions now means guessing.

### Anti-patterns to avoid

- **Don't assume the root cause.** Aggregation error, metric mismatch, pricing changes, and invalid leading indicators are all plausible — let the parallel diagnostics reveal which one dominates rather than anchoring on a single hypothesis.
- **Don't average the signals.** "Churn is moderate" when one signal says low and another says high is worse than picking either signal.
- **Don't default to the cheapest intervention.** Email campaigns are cheap but useless if the problem is product-market fit erosion.
- **Don't let urgency skip diagnosis.** A 2-week investigation that targets the right lever beats a same-week launch that targets the wrong one.

## Recommended Next Artifact

**Immediate next step:** Churn Diagnostic Brief (not a solution PRD).

Before writing a solution-oriented PRD with features, timelines, and success metrics, produce a 2-page Diagnostic Brief that answers:

1. Are the conflicting signals real (two valid metrics genuinely disagree) or artifactual (definitions, timing, or aggregation explain the discrepancy)?
2. Which specific cohort(s) are churning at elevated rates?
3. What is the top-ranked churn driver from win-back interviews?
4. What is the revenue-at-risk in the next 90 days if no action is taken?

**After the Diagnostic Brief clears review**, the recommended artifact sequence is:

1. **Churn Intervention Options Memo** — 3 candidate interventions with expected impact, cost, and time-to-effect, ranked by confidence.
2. **Solution PRD** — for the selected intervention, with measurable success criteria tied to the specific churn cohort identified.
3. **Experiment Design Doc** — if the intervention is testable (A/B or staged rollout), define control/treatment and minimum detectable effect.

This sequence ensures we solve the *diagnosed* problem, not the *assumed* one.
