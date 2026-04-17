# Deprecation Strategy Memo

## Decision Frame
Do not fully sunset the legacy API within 6 months. Instead, announce a controlled deprecation path now, keep the legacy API available through the next renewal window for the three enterprise customers that have tied renewal to API stability, and make migration to the new API the primary path for all net-new development.

This is the more decision-useful path because the stated business objective is lower maintenance burden, but the available case facts show direct renewal risk if stability is disrupted and a migration timeline that can consume most or all of the proposed 6-month window. A hard 6-month shutdown creates avoidable commercial risk before customers have a realistic chance to complete migration.

Recommended operating posture:
- Freeze major feature work on the legacy API.
- Commit only to stability, security, and critical fixes on the legacy API during the transition.
- Publish a migration program centered on the new API.
- Use customer-specific migration plans for the three enterprise accounts before setting a final shutdown date.

## Unknowns & Evidence Gaps
The case packet does not establish several facts that would materially affect the final deprecation date and contract posture:
- The exact contractual language behind the renewal condition tied to API stability.
- Whether the three enterprise customers can begin migration immediately or have dependency blockers.
- Whether the 3-6 month migration effort applies uniformly or varies materially by customer.
- The degree to which maintenance burden is driven by routine support versus deeper platform complexity.
- Whether the new API has parity gaps that could prolong migration even if customer engineering is staffed.

These gaps do not block the first-pass recommendation against a hard 6-month sunset, but they do limit confidence in choosing an exact retirement date.

## Pass/Fail Readiness
Pass:
- A deprecation notice is framed as transition-first, not shutdown-first.
- The legacy API remains stable for existing enterprise customers during the initial migration period.
- The business limits further investment in the legacy API to reduce burden without breaking renewals.
- Each enterprise account has a named migration plan, owner, and target sequence.
- Final sunset timing is gated on migration readiness and contract exposure, not only on internal cost pressure.

Fail:
- The team commits to a hard shutdown inside 6 months without customer-specific migration confirmation.
- Stability commitments to enterprise customers are weakened before renewal risk is resolved.
- The migration plan assumes best-case effort despite the stated 3-6 month customer engineering requirement.
- The organization keeps supporting the legacy API indefinitely with no narrowing of scope or exit criteria.

## Recommended Next Artifact
Create an executive deprecation decision memo with three parts:
- Customer-by-customer renewal and migration risk table for the affected enterprise accounts.
- Transition policy defining what legacy support continues and what is frozen immediately.
- Date-gated deprecation plan that ties final sunset approval to migration completion, contract timing, and unresolved parity blockers.

That artifact should be the basis for aligning product, engineering, customer success, and sales before any external deprecation announcement.
