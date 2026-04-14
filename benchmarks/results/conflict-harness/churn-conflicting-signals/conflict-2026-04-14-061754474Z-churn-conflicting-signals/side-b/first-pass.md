# Churn Reduction PRD: Resolving Conflicting Signals

## Decision Frame

**Problem statement:** Churn metrics are sending conflicting signals relative to strategic growth targets. Specifically:

- **Signal conflict 1:** Net revenue retention (NRR) appears healthy at 105%+ due to expansion revenue from surviving accounts, masking gross churn of 18% annually — well above the 10% strategic target.
- **Signal conflict 2:** Product usage telemetry shows increasing DAU/MAU ratios (engagement up), yet 90-day cohort retention is declining. Users who stay are more active, but fewer users stay.
- **Signal conflict 3:** NPS scores remain stable (42), but qualitative verbatims increasingly cite "value for money" concerns — suggesting price sensitivity is rising while satisfaction scores lag behind behavioral intent.

**Decision to be made:** Which churn signal should drive the intervention roadmap, and what is the correct sequencing when reducing gross churn may conflict with the expansion-revenue strategy that keeps NRR healthy?

**Stakeholders:** Product (owns intervention design), Finance (owns NRR target), Growth (owns acquisition/activation), CS (owns at-risk account management).

**Strategic tension:** The current strategy optimizes for NRR by investing in upsell motions for healthy accounts. A gross-churn reduction strategy would redirect resources toward at-risk accounts — a direct trade-off. Doing both simultaneously dilutes both.

## Unknowns & Evidence Gaps

| # | Unknown | Why It Matters | Current Evidence | Required Evidence | Suggested Method |
|---|---------|---------------|-----------------|-------------------|------------------|
| U1 | Is gross churn concentrated in a specific segment (SMB vs. Mid-Market vs. Enterprise)? | Segment concentration determines whether a targeted or broad intervention is needed. If 80% of churned ARR comes from SMB, the fix is different than uniform churn. | We know overall gross churn is 18%. Segment breakdown has not been analyzed. | Churn cohort analysis by segment, contract size, and tenure. | SQL analysis of billing + CRM data; deliverable in 1 week. |
| U2 | Are churning customers exhibiting detectable behavioral precursors 30-60 days before cancellation? | If precursors exist, a proactive intervention model is viable. If churn is "sudden death," only structural changes (pricing, packaging) will help. | Anecdotal CS reports suggest some accounts go quiet before churning; no systematic analysis. | Predictive feature importance analysis on churned vs. retained accounts using product telemetry. | ML churn propensity model or simpler logistic regression on usage features; 2-3 weeks. |
| U3 | What is the revenue-weighted reason distribution for churn? | "Value for money" in NPS verbatims could mean price is too high, or perceived value is too low, or a competitor undercut us. Each requires a different intervention. | NPS verbatims mention value; no structured exit interview data with revenue weighting. | Structured exit survey deployed to all churning accounts with forced-choice reason codes plus revenue tagging. | Exit survey redesign + 60-day collection window to reach statistical significance. |
| U4 | Does the expansion-revenue motion accelerate churn by pushing customers into higher tiers they don't fully use? | If upsell is creating "overfit" customers who later churn at higher ACVs, the NRR strategy is manufacturing its own problem. | No analysis linking upsell events to subsequent churn probability. | Survival analysis comparing churn rates of upsold vs. organically-retained accounts at equivalent tenure. | Causal analysis with propensity score matching; 2-3 weeks. |
| U5 | What is the competitive win/loss ratio trend for churned accounts? | If churn is competitive displacement, product gaps matter more than pricing or engagement interventions. | Sales reports competitors in ~30% of lost deals but data is self-reported and incomplete. | Win/loss interviews conducted by neutral third party for a sample of churned accounts. | 15-20 structured interviews over 4-6 weeks. |

## Pass/Fail Readiness

**Verdict: NOT READY to commit to a specific churn intervention roadmap.**

**Rationale:** The conflicting signals are not a surface-level dashboard problem — they indicate we do not yet understand the *mechanism* driving churn. Committing resources to an intervention without resolving at least U1, U2, and U3 risks:

- **False positive risk:** Building a predictive churn model when the real problem is pricing (wasted engineering investment).
- **Cannibalization risk:** Redirecting CS resources from expansion to retention when expansion accounts are actually healthy (NRR drops without churn improving).
- **Wrong-segment risk:** Launching an SMB save motion when churn is actually mid-market price sensitivity (intervention misses the revenue impact).

**What IS ready:**
- We can immediately deploy the restructured exit survey (U3) — zero engineering cost, high information value.
- We can run the segment concentration analysis (U1) this week with existing data — this alone may resolve the strategic tension by showing whether churn and expansion operate in different segments.

**Pass criteria for proceeding to intervention design:**
1. U1 resolved: Segment concentration identified with >80% confidence.
2. U3 data collection initiated: Exit survey live and collecting responses.
3. U4 directionally answered: Upsell-to-churn correlation assessed (even if not causal).

If U1 reveals segment concentration, we can proceed to a targeted intervention PRD for that segment without waiting for U2/U3/U5. If churn is diffuse, we need U3 before committing.

## Recommended Next Artifact

**Immediate (this week):**
1. **Churn Segment Decomposition Brief** — Resolve U1. One-page analysis showing gross churn by segment, contract size, tenure band, and ARR impact. This is the single highest-leverage analysis because it determines whether the problem is narrow or broad.

**Within 30 days:**
2. **Exit Survey Redesign Spec** — Resolve U3. Structured reason codes, revenue-weighted analysis plan, and deployment to all cancellation flows.
3. **Upsell-Churn Correlation Analysis** — Resolve U4. Survival curves comparing upsold vs. non-upsold cohorts.

**Conditional on findings:**
4. **Targeted Churn Intervention PRD** — If U1 shows segment concentration: scoped intervention for the affected segment with specific success metrics, A/B test design, and resource requirements. This is the artifact the team actually wants, but building it now would be premature.
5. **Churn Propensity Model Spec** — If U2 analysis shows detectable precursors: ML model requirements, feature set, alerting thresholds, and CS workflow integration.

**Decision checkpoint:** Reconvene in 30 days with U1 and U4 resolved, U3 data collection underway. At that point, the strategic tension (retention investment vs. expansion investment) can be resolved with evidence rather than opinion.
