# Revised artifact

## Decision Frame
Do not execute a blanket legacy API shutdown within 6 months. Instead, announce a bounded deprecation program now: freeze major legacy expansion immediately, keep the legacy API available for the three enterprise customers during an active migration window, and require an explicit executive decision at the end of the initial 6-month period on remaining exceptions rather than allowing support to drift indefinitely.

This keeps the business focused on reducing maintenance burden while acknowledging the case facts that renewal is tied to API stability for three enterprise customers and that migration itself can require 3-6 months of customer engineering effort. A hard shutdown inside the same window creates renewal risk before those customers necessarily have a realistic path to finish migration. But an unbounded "wait until every customer is ready" posture is also not acceptable, because it turns deprecation into an open-ended support commitment.

Recommended operating posture:
- Freeze major feature work on the legacy API immediately.
- Limit legacy support to stability, security, and critical fixes during transition.
- Make the new API the default for all net-new development and migration effort.
- Create customer-specific migration plans now for the three enterprise accounts.
- At the end of the initial 6-month window, require a formal decision on any remaining legacy exceptions, with extensions granted only as explicit account-level exceptions tied to active migration plans and contract exposure.

## Unknowns & Evidence Gaps
Several case facts remain unresolved and affect the exact shape of the end-of-window decision:
- The specific contractual language behind the enterprise customers' renewal condition tied to API stability.
- Whether each of the three customers can start migration immediately or has dependency blockers.
- Whether the stated 3-6 month migration effort is similar across all three accounts.
- Whether the new API has parity gaps that would prevent completion even with staffed customer effort.
- How much of the maintenance burden can be removed immediately by freezing scope versus full retirement.

These gaps do not change the core recommendation against a blanket 6-month shutdown, but they do affect which customers, if any, justify a formal exception after the initial deprecation window.

## Pass/Fail Readiness
Pass:
- The company announces a transition-first deprecation plan rather than a blanket 6-month shutdown.
- Legacy scope is narrowed immediately to stability, security, and critical fixes only.
- Each enterprise account has a named migration plan and owner during the initial window.
- The end of the 6-month period triggers a required decision on exceptions rather than automatic continuation.
- Any continued legacy support after that point is explicit, account-specific, and justified by active migration status plus contract exposure.

Fail:
- The team commits to a universal shutdown inside 6 months without customer-specific migration confirmation.
- The team leaves shutdown timing entirely open-ended with no end-of-window decision point.
- Stability commitments are weakened before renewal risk is addressed.
- The migration plan assumes best-case completion despite the stated 3-6 month customer engineering effort.
- The organization continues broad legacy support without narrowed scope or explicit exception handling.

## Recommended Next Artifact
Create an executive deprecation decision memo with three parts:
- A customer-by-customer renewal and migration risk table for the three enterprise accounts.
- A transition policy defining what legacy support continues now and what is frozen immediately.
- An end-of-window exception decision template that forces leadership to either approve named temporary exceptions or proceed with narrower retirement steps rather than passively extending support.
