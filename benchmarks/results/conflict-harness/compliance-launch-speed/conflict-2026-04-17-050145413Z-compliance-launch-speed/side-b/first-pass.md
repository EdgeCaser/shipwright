# Payment Disbursement Feature PRD

## Summary
This PRD reframes the committed Q2 launch around what can be shipped without creating material legal exposure. The feature as publicly described cannot be launched in Q2 under the current compliance process because the minimum review duration exceeds the remaining quarter. The product decision is therefore not whether to accelerate past review, but how to preserve customer trust while aligning scope, commitments, and delivery sequencing to the compliance constraint.

## Problem
Enterprise customers have been publicly promised a Q2 delivery for a new payment disbursement capability. Legal has confirmed the feature requires regulatory compliance review, and the current process takes a minimum of 14 weeks. Q2 ends in 10 weeks. Skipping or shortening review creates material legal exposure.

## Product Goal
Deliver a compliant payment disbursement capability as soon as possible without creating avoidable legal risk, while replacing the incompatible Q2 commitment with a revised customer-facing plan.

## Non-Goals
- Do not ship the full regulated feature before required review completes.
- Do not treat public commitment as sufficient reason to bypass legal process.
- Do not mask the timeline contradiction with ambiguous launch language.

## Users
- Enterprise customers expecting the committed capability
- Internal go-to-market teams managing customer commitments
- Legal and compliance stakeholders responsible for regulatory review

## Requirements
### Functional
- Define the intended payment disbursement capability and its regulated scope.
- Separate any preparatory or non-regulated deliverables from the regulated release, if such separation is validated by legal.
- Produce a customer communication plan for revised timing and interim expectations.

### Operational
- Compliance review must complete before launch of the regulated feature.
- Product, legal, and go-to-market must align on a revised milestone plan.
- External commitments must be updated to reflect an achievable release path.

## Launch Recommendation
- Do not launch the regulated payment disbursement feature in Q2.
- Immediately rebaseline the launch plan around the compliance review timeline.
- If legal confirms there is a meaningful non-regulated subset, define that as a separate deliverable; otherwise treat the launch as blocked pending review completion.

## Risks
- Legal exposure if review is skipped or informally compressed
- Customer trust erosion if revised timing is not communicated clearly
- Internal execution confusion if teams continue planning against the original Q2 date

## Decision Frame
The decision is whether to preserve the original Q2 launch promise or preserve compliance integrity. The evidence in the packet supports only one workable path: preserve compliance integrity, declare the original launch date unachievable for the regulated feature, and convert the PRD from a launch-specification document into a controlled replan with explicit scope and communication decisions.

## Unknowns & Evidence Gaps
- Whether any customer-visible subset can launch without triggering the same regulatory review
- Whether the 14-week minimum can change through a formal process change rather than an ad hoc shortcut
- What exactly was promised to customers: full availability, pilot access, configuration readiness, or general availability
- Whether contractual obligations or remedies exist tied to the Q2 commitment

## Pass/Fail Readiness
Pass:
- Legal confirms the launchable scope and review dependency
- Product publishes a revised milestone plan consistent with the compliance timeline
- Customer-facing teams align on updated external communication

Fail:
- Any plan assumes shipping the regulated feature before review completion
- Scope is artificially relabeled to preserve the Q2 date without legal validation
- External commitments remain unchanged despite the known schedule conflict

## Recommended Next Artifact
Create a decision memo that does three things: documents the launch-date contradiction, defines compliant release options including any legally separable subset, and provides a customer communication plan tied to a revised delivery timeline.
