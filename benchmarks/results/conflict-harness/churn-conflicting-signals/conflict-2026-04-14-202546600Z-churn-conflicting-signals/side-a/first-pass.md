# Churn Reduction PRD: Resolving Conflicting Signals

## Decision Frame

**Problem statement:** Churn metrics indicate elevated customer attrition, but the signals conflict with current strategy targets — e.g., usage metrics show healthy engagement while revenue churn accelerates, or NPS remains stable while logo churn spikes. This PRD defines how to diagnose the root conflict, prioritize interventions, and establish pass/fail gates before committing engineering resources.

**Decision to be made:** Should we (a) re-segment the churn definition to isolate the conflicting cohorts, (b) adjust strategy targets to reflect the actual retention landscape, or (c) hold current strategy and investigate whether the conflicting signals are measurement artifacts?

**Stakeholders:** Product (owns retention metric), Growth (owns acquisition/expansion targets that may conflict), Finance (owns revenue churn definition), Data Science (owns signal integrity).

**Why signals conflict matters:** When leading indicators (engagement, NPS, feature adoption) diverge from lagging indicators (revenue churn, logo churn, contraction), the most common failure mode is picking the comfortable signal and ignoring the uncomfortable one. This PRD forces explicit reconciliation.

### Conflict Taxonomy

| Signal A (Positive) | Signal B (Negative) | Likely Root Cause | Danger Level |
|---|---|---|---|
| High DAU/MAU | Rising revenue churn | Power users stay, mid-market contracts lapse | High — revenue impact masked by engagement vanity metric |
| Stable NPS | Rising logo churn | Satisfied customers still leave (switching costs dropped, competitor pricing) | High — NPS is lagging and survivors-biased |
| Low support tickets | Accelerating churn | Silent churn — disengaged users never complain, just leave | Critical — no early warning system |
| Strong expansion revenue | Net churn positive | New upsells mask underlying contraction in base | Medium — sustainable short-term but compounds |

## Unknowns & Evidence Gaps

1. **Cohort-level churn disaggregation is missing.** Aggregate churn rate blends new-customer churn (expected) with mature-customer churn (alarming). Without cohort vintage analysis, we cannot determine if the "conflicting signal" is simply Simpson's Paradox in the aggregate.
   - *Evidence needed:* Cohort retention curves by signup quarter, segmented by plan tier and acquisition channel.
   - *Owner:* Data Science.
   - *Timeline:* 1 sprint.

2. **Strategy targets may encode stale assumptions.** If targets were set assuming X% gross churn and actual is 1.5X%, the "conflict" is between reality and a plan, not between two real signals.
   - *Evidence needed:* Audit of target-setting assumptions from last planning cycle. What churn rate was modeled? What has changed?
   - *Owner:* Finance + Product.
   - *Timeline:* 1 week.

3. **Churn reason attribution is unreliable.** Exit surveys have <15% response rate (industry typical). Cancellation flow captures "reason" but options are vague ("too expensive", "not using enough"). No win-back interview program exists.
   - *Evidence needed:* Structured win-back interviews with 20+ recently churned accounts from the conflicting cohort.
   - *Owner:* Customer Success.
   - *Timeline:* 3 weeks.

4. **Competitive displacement vs. budget cut vs. product gap.** Without knowing *why* customers leave, interventions are guesses. Price cuts won't help if the issue is missing functionality; feature investment won't help if the issue is budget pressure.
   - *Evidence needed:* Competitive loss analysis cross-referenced with churn timing.
   - *Owner:* Product Marketing.
   - *Timeline:* 2 weeks.

5. **Leading indicator validity.** The engagement metrics we trust may not actually predict retention. Has anyone validated that DAU/MAU or feature adoption correlates with renewal in our data?
   - *Evidence needed:* Predictive model or simple correlation analysis between engagement features and 90-day retention.
   - *Owner:* Data Science.
   - *Timeline:* 2 sprints.

## Pass/Fail Readiness

**This PRD is NOT ready for solution design.** Before committing to any churn intervention, the following gates must clear:

| Gate | Status | Criteria | Blocking? |
|---|---|---|---|
| Cohort disaggregation complete | ❌ Not started | Churn rates by vintage, tier, channel available in dashboard | Yes |
| Target assumptions audited | ❌ Not started | Finance confirms whether targets assumed current churn levels | Yes |
| Win-back interviews (n≥15) | ❌ Not started | Qualitative themes coded and clustered | Yes |
| Leading indicator validation | ❌ Not started | Engagement-retention correlation established or debunked | Yes |
| Conflict resolved or named | ❌ Not started | Team agrees on which signal to trust and why, or explicitly names the bet | Yes |

**Current readiness: FAIL.** We have a symptom (conflicting signals) but not a diagnosis. Shipping interventions now means guessing.

### Anti-patterns to avoid

- **Don't average the signals.** "Churn is moderate" when one signal says low and another says high is worse than picking either signal.
- **Don't default to the cheapest intervention.** Email campaigns are cheap but useless if the problem is product-market fit erosion.
- **Don't let urgency skip diagnosis.** A 2-week investigation that targets the right lever beats a same-week launch that targets the wrong one.

## Recommended Next Artifact

**Immediate next step:** Churn Diagnostic Brief (not a solution PRD).

Before writing a solution-oriented PRD with features, timelines, and success metrics, produce a 2-page Diagnostic Brief that answers:

1. Which specific cohort(s) are churning at elevated rates?
2. Is the "conflict" real (two valid signals disagree) or artifactual (one signal is miscalculated or stale)?
3. What is the top-ranked churn driver from win-back interviews?
4. What is the revenue-at-risk in the next 90 days if no action is taken?

**After the Diagnostic Brief clears review**, the recommended artifact sequence is:

1. **Churn Intervention Options Memo** — 3 candidate interventions with expected impact, cost, and time-to-effect, ranked by confidence.
2. **Solution PRD** — for the selected intervention, with measurable success criteria tied to the specific churn cohort identified.
3. **Experiment Design Doc** — if the intervention is testable (A/B or staged rollout), define control/treatment and minimum detectable effect.

This sequence ensures we solve the *diagnosed* problem, not the *assumed* one.
