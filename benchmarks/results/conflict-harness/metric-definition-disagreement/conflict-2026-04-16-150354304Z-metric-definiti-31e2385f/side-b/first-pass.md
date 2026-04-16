# North Star Metric Recommendation

Use a two-layer metric system rather than force one overloaded number to answer three different questions.

## Recommendation
Adopt **Core Active Users** as the leadership north star: the count of unique accounts that completed the product's primary value event within the reporting period. Publish it alongside two mandatory companion metrics: **Reach Active Users** for top-of-funnel engagement and **Recognized Active Accounts** for finance-grade revenue alignment. Leadership should treat Core Active Users as the single product health number because it is the closest measure of delivered customer value, least vulnerable to channel mix distortion, and most decision-useful for product direction.

## Why This Definition
A leadership metric should answer: "Are more customers successfully getting the core value of the product over time?" A finance definition often optimizes for auditability and monetization alignment, while a growth definition often optimizes for acquisition and engagement sensitivity. Both are useful, but neither is the best north star if the product can add low-intent activity or retain billable but low-value usage without improving real customer outcomes.

When competing definitions differ by 40%, the main issue is not arithmetic. It is that the organization is compressing different business questions into one label. The practical fix is to define one primary metric tied to the product's value moment and explicitly govern the other two as secondary operating metrics.

## Metric Specification
**Core Active Users**
Count unique users or accounts, depending on how value is naturally realized, that completed the primary value event at least once in the standard reporting window.

Definition rules:
- Primary value event must represent successful receipt of the product's intended benefit, not mere session presence.
- The entity counted must match the product's economic unit of value. If teams buy and use together, count accounts; if individual usage is the core behavior, count users.
- The reporting window should be fixed and published.
- Inclusion and exclusion rules must be versioned and auditable.
- Historical backfill must be recalculated under the chosen definition before leadership uses trend claims.

## Governance Rule
Do not ask one number to represent product value delivery, commercial recognition, and acquisition reach at the same time.

Use the following split:
- Product leadership: Core Active Users
- Finance leadership: Recognized Active Accounts
- Growth leadership: Reach Active Users

Dashboards should show all three, but only Core Active Users should be labeled as the north star.

## Decision Frame
The decision is not which department wins the naming dispute. The decision is which metric best represents durable product value creation for company-level steering. Core Active Users is the best choice because it measures value realization rather than attention or accounting status, while preserving the other definitions as governed secondary metrics.

## Unknowns & Evidence Gaps
- The packet does not specify the actual three definitions, so the recommendation assumes one is value-based, one finance-aligned, and one growth-engagement-based.
- The correct counting entity may be user-level or account-level; this must match how value is actually consumed.
- The primary value event is not yet named, which is the most important unresolved implementation detail.
- No historical recomputation is provided, so the trend impact of switching definitions is still unknown.

## Pass/Fail Readiness
Pass if:
- The executive team agrees that the north star should measure delivered product value.
- A single primary value event can be specified unambiguously.
- Historical data can be backfilled under the new definition.
- Finance and growth retain companion metrics for their operating needs.

Fail if:
- The company still expects one metric to simultaneously satisfy product, finance, and growth use cases.
- The primary value event is weak, gameable, or only loosely tied to customer benefit.
- Instrumentation cannot support stable backfill and ongoing governance.

## Recommended Next Artifact
Create a one-page **Metric Governance Memo** that contains:
- the formal definition of Core Active Users
- the companion metric definitions for finance and growth
- entity counted, window, exclusions, and event logic
- a 12-month backfilled trend under all three definitions
- explicit examples of included and excluded behaviors
- dashboard labeling and ownership rules
