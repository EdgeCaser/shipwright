# Revised artifact

# Deprecation Strategy Memo

## Recommendation
Do not commit to an unconditional full shutdown of the legacy API at 6 months. Announce a staged deprecation now: place the legacy API into maintenance-only status immediately, stop new legacy integrations at 6 months, and set full shutdown as a gated milestone tied to migration readiness for the three renewal-sensitive enterprise customers. Internally, plan against a 6-month target, but externally preserve the option for a time-bound extension if readiness gates are not met.

## Rationale
The business goal is legitimate: reducing maintenance burden and focusing investment on the new API. But the case packet also states that three enterprise customers cite API stability as a renewal condition and that migration requires 3-6 months of customer engineering effort. That does not prove a 6-month shutdown is impossible, but it does establish that the proposed shutdown window overlaps the stated migration window closely enough to create material execution and renewal risk unless migration assumptions are validated and actively managed.

The key issue is not whether deprecation should happen. It is whether leadership should treat 6 months as a fixed shutdown commitment before confirming feature parity, provider-side migration support, and account-by-account readiness. On current evidence, a staged plan is more decision-useful than a hard deadline because it preserves cost-reduction momentum while avoiding an unnecessary commercial bet on best-case migration execution.

## Proposed Strategy
1. Move the legacy API to maintenance-only now.
Only security, reliability, and contractual support fixes continue. No new feature work.

2. Define the 6-month milestone as a policy transition, not automatic shutdown.
At 6 months, stop onboarding new legacy API usage and require approved migration plans for any continued enterprise access.

3. Put the three enterprise customers on named migration programs within 30 days.
Each account gets an owner, migration plan, blocker log, cutover date, and executive review.

4. Make full shutdown contingent on explicit readiness gates.
Minimum gates should include required feature parity, completed customer validation, cutover runbook, and account-level commercial signoff.

5. Offer a time-bound paid extension if needed.
If a customer is making good-faith migration progress but cannot complete cutover on time, use a premium legacy support extension rather than indefinite continuation.

6. Reassess the full shutdown date once the migration assumptions are validated.
If provider-assisted migrations truly compress to 2-3 months, leadership can preserve or tighten the 6-month target. If not, the organization should shift to a 9-12 month shutdown path for the named at-risk accounts.

## Decision Frame
The decision is whether to enforce a universal 6-month shutdown now or to run a staged deprecation that keeps business pressure on the legacy API while protecting renewal-critical accounts from a premature cutoff. The recommended choice is staged deprecation with gated shutdown.

## Unknowns & Evidence Gaps
The biggest unknown is whether the stated 3-6 month migration effort assumes strong provider-side support. That assumption could materially change the viability of a 6-month shutdown. Other important gaps are the ARR and renewal timing for the three enterprise customers, the exact feature-parity gaps between the legacy and new APIs, and the real maintenance burden of keeping the legacy API alive for an additional quarter or two.

## Pass/Fail Readiness
Pass if the company can validate migration assumptions within 2 weeks, assign owners to the three at-risk accounts, publish readiness gates, and resource provider-side migration support. Fail if leadership insists on an unconditional shutdown before validating parity and timeline assumptions, or if the new API still lacks required enterprise capabilities.

## Recommended Next Artifact
Produce an account-level migration and renewal risk register that quantifies, for each of the three enterprise customers, contract timing, revenue exposure, feature gaps, migration dependencies, required provider support, earliest realistic cutover date, and whether a temporary paid extension is likely to be needed.
