# Deprecation Strategy Memo

## Recommendation
Do not fully sunset the legacy API in 6 months. Announce a two-track deprecation plan now: freeze new feature development on the legacy API immediately, begin a structured migration program for contracted enterprise accounts within 30 days, and set general legacy API end-of-sale at 6 months with full shutdown contingent on named customer migration readiness. Default target for full shutdown should move to 9-12 months unless the three renewal-sensitive enterprise customers complete migration earlier.

## Rationale
The current business objective is valid: the legacy API creates ongoing maintenance burden and slows platform focus. But a hard 6-month shutdown conflicts directly with renewal risk from enterprise customers who have explicitly tied contract renewal to API stability, while their own migration effort is estimated at 3-6 months. That makes a universal 6-month cutoff operationally possible only under best-case execution, with no buffer for customer delays, integration defects, procurement cycles, or security review.

A forced shutdown inside that window creates asymmetric downside. Maintenance savings are meaningful but likely incremental and recoverable over time; losing multiple annual enterprise renewals would create immediate revenue risk, reputational damage, and a credibility problem for future platform commitments. The better strategy is to preserve the cost-reduction goal while converting the deprecation into a managed commercial program rather than a date-only technical event.

## Proposed Strategy
1. Announce deprecation now with clear milestones.
Legacy API enters maintenance-only status immediately. No net-new features. Only security, reliability, and contractual support fixes.

2. Segment customers by commercial and migration risk.
Treat the three enterprise accounts as named migration programs with executive oversight. All other customers receive standard migration communications and tooling.

3. Keep the 6-month date, but narrow what it means.
At 6 months, stop onboarding new legacy API integrations, stop expansion of legacy usage, and require approved migration plans for any customer requesting continued access.

4. Make full shutdown conditional, not automatic.
Require objective readiness gates before turning off the legacy API for renewal-sensitive enterprise accounts: validated feature parity, completed customer testing, cutover plan, and account-level commercial signoff.

5. Create a paid or contractual transition path if needed.
If one or more enterprise customers cannot complete migration inside the target window for reasons outside the provider's control, offer a time-bound premium legacy support extension rather than indefinite free continuation.

6. Put product and customer engineering on a single operating plan.
Migration success depends on more than notice. Provide migration tooling, documentation, office hours, account-specific technical guidance, and escalation paths for blockers.

## Decision Frame
The decision is not whether to deprecate the legacy API; it is whether to force a universal 6-month shutdown or run a controlled migration that protects enterprise renewals while still exiting the legacy surface. The recommended choice is controlled migration with an immediate maintenance freeze and a conditional shutdown timeline.

## Unknowns & Evidence Gaps
Key unknowns are the revenue concentration of the three enterprise contracts, the exact maintenance cost of the legacy API, the current parity gap between old and new APIs, and whether customer engineering estimates assume active provider support. These unknowns matter because they determine whether the business case supports temporary extension, premium support pricing, or accelerated internal investment in migration tooling.

## Pass/Fail Readiness
Pass if the organization can name executive owners for the three at-risk accounts, publish a migration readiness checklist, deliver a feature-parity gap list within 2 weeks, and commit customer engineering capacity to active migration support. Fail if leadership insists on a fixed shutdown date without account-level readiness data, if the new API still lacks required enterprise capabilities, or if no commercial fallback exists for customers who cannot cut over in time.

## Recommended Next Artifact
Produce an account-by-account migration risk register and executive renewal protection plan. It should map each enterprise customer's contract timeline, required API capabilities, migration effort estimate, blockers, support needs, and the latest acceptable cutover date tied to renewal risk.
