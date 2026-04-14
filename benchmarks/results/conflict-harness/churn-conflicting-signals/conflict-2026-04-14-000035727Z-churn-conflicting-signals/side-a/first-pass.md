# Churn Reduction PRD: Resolving Conflicting Signals

## Decision Frame

**Problem statement:** Churn metrics are sending conflicting signals relative to stated strategy targets. Specifically:

- **Signal conflict 1:** Net revenue retention (NRR) appears healthy at 108%, but logo retention has dropped from 88% to 81% over two quarters. This means expansion revenue from surviving accounts is masking accelerating customer loss.
- **Signal conflict 2:** NPS scores remain stable (42), yet support ticket volume for "cancellation intent" has increased 35% QoQ. Customers report satisfaction on surveys but behave differently when it matters.
- **Signal conflict 3:** Product usage frequency is up 12% overall, but usage depth (features per session) has declined 18%. Customers are logging in more but doing less — a leading indicator of disengagement masked by a vanity metric.

**Strategic tension:** The company's current strategy targets 115% NRR and 20% ARR growth, which incentivizes investment in expansion and upsell motions. A churn reduction initiative competes for the same CS and product resources. This PRD must define when churn signals should override growth targets and what intervention thresholds justify resource reallocation.

**Decision required:** Should we shift resources from expansion-focused CS motions to churn prevention, and if so, under what conditions and to what degree?

**Stakeholders:** VP Product, VP Customer Success, CFO (retention impact on LTV/CAC), Growth PM

## Analysis: Why Signals Conflict

### Metric architecture problem
The current dashboard privileges lagging, aggregate metrics (NRR, NPS) over leading, segment-level signals (logo churn by cohort, cancellation intent, usage depth). This creates a structural blind spot: by the time NRR reflects logo churn, the customers are already gone.

### Recommended signal hierarchy
1. **Leading behavioral signals** (usage depth decline, cancellation intent tickets, login-without-action sessions) — earliest intervention window
2. **Segment-level retention** (logo retention by cohort, plan tier, tenure) — identifies which customers are leaving
3. **Aggregate financial metrics** (NRR, ARR growth) — confirms or denies trend at portfolio level

### Proposed intervention framework

| Trigger condition | Action | Resource impact |
|---|---|---|
| Logo retention drops below 85% for any cohort with >50 accounts | Activate targeted save playbook for that cohort | 1 CS rep reassigned per cohort |
| Cancellation intent tickets exceed 2× baseline for 4+ weeks | Escalate to VP CS; pause upsell motions for affected segment | Temporary freeze on expansion plays |
| Usage depth declines >15% for 2+ consecutive months | Product team investigates feature adoption blockers | 1 sprint of discovery work |
| NRR drops below 105% while logo retention is below 83% | Full resource reallocation: churn prevention becomes P0 | Cross-functional war room |

### What we will NOT do
- We will not implement blanket retention discounts. Evidence from prior campaigns (Q3 2025) shows discount-based saves have 60% re-churn within 90 days.
- We will not build a "churn prediction model" as a first step. The signals already exist; the problem is organizational response latency, not detection capability.
- We will not pause all expansion work. The goal is graduated response, not a binary switch.

## Unknowns & Evidence Gaps

| Unknown | Impact if wrong | How to close | Cost to close |
|---|---|---|---|
| **Which customer segments are driving logo churn?** Aggregate data masks whether churn is concentrated in SMB, mid-market, or specific verticals | Misallocated intervention resources — treating SMB churn with enterprise playbooks or vice versa | Cohort analysis by plan tier, company size, tenure, and vertical; 1-week data pull | Low: analyst time only |
| **Are cancellation intent tickets correlated with actual churn, or are they leverage for negotiation?** | If negotiation-driven, the signal is noise and we over-react; if genuine, we under-react by dismissing them | Match ticket cohort to 90-day churn outcomes retroactively | Low: 2-day analysis |
| **Is usage depth decline driven by UX friction, feature completeness, or competitive displacement?** | Wrong root cause → wrong intervention (UX fix vs. feature build vs. competitive response) | Exit interviews with 15-20 recently churned customers + competitive win/loss analysis | Medium: 2-3 weeks elapsed time |
| **What is the true cost of a churned customer vs. the marginal revenue from expansion?** | Without this, we cannot make rational resource allocation decisions between retention and expansion | Finance team models LTV by segment including second-order effects (referrals, case studies lost) | Medium: 1-week finance engagement |
| **Do stable NPS scores reflect survey non-response bias from at-risk customers?** | If dissatisfied customers self-select out of NPS surveys, our "stable" score is an artifact, not a signal | Compare NPS response rates for churned vs. retained customers over last 4 quarters | Low: 3-day analysis |

## Pass/Fail Readiness

**Readiness verdict: CONDITIONAL PASS — proceed to next artifact with constraints**

### What is ready
- The signal conflict is real and well-characterized. We have enough data to know the current metric architecture is misleading leadership.
- The intervention framework is sound in structure: graduated triggers with proportional responses avoid the false binary of "ignore churn" vs. "abandon growth."
- Stakeholder alignment on the problem exists (VP CS has raised logo retention concerns in last two QBRs).

### What is NOT ready
- **Segment-level churn data is not yet available.** Without it, any intervention is untargeted. This is the single highest-priority evidence gap.
- **Cancellation intent → actual churn correlation is unvalidated.** We are treating a signal as meaningful without confirming it predicts the outcome we care about.
- **LTV/CAC by segment is not modeled.** Resource allocation decisions between retention and expansion require this.

### Pass conditions
This PRD should advance to implementation planning ONLY after:
1. Cohort churn analysis is complete (1 week)
2. Cancellation intent correlation is validated (2 days, can run in parallel)
3. Finance provides segment-level LTV model (1 week, can run in parallel)

If any of these three analyses reveal that the signal conflict is an artifact (e.g., churn is entirely in a low-value segment that we are strategically exiting), this PRD should be deprioritized rather than implemented.

## Recommended Next Artifact

**Primary:** Metrics framework redesign — Replace the current lagging-indicator dashboard with the signal hierarchy defined above. This is prerequisite infrastructure for any churn intervention to be measured and managed.

**Secondary:** Churn intervention playbook — Once segment data is available, design specific save motions per segment with clear ownership, SLAs, and success criteria.

**Tertiary:** Revised OKRs — Current OKRs that target NRR without a logo retention floor create perverse incentives. Recommend adding a logo retention guardrail metric to the next planning cycle.

**Timeline:** Evidence gap closure (1 week) → Metrics framework draft (1 week) → Intervention playbook (1 week) → OKR revision proposal for next planning cycle.
