# Revised artifact

## Problem
Churn signals are conflicting, and strategy targets create pressure to act before causality is clear. The product needs a churn-reduction plan that permits action without letting ambiguous evidence justify strategy drift.

## Goal
Reduce preventable churn through a staged program that distinguishes reversible operational fixes from interventions that could alter pricing, positioning, or customer mix.

## Non-Goals
- Rewriting company strategy from ambiguous churn indicators
- Launching broad retention incentives without segment evidence
- Treating all churn as one cause or one customer problem

## Users / Segments
- Newly activated customers at risk of early-value failure
- Established customers with declining engagement
- High-value accounts where churn risk may justify assisted intervention
- Accounts whose churn appears driven by non-product factors

## Decision Rules
### Low-Regret Intervention
An intervention qualifies as low-regret only if all of the following are true:
- It is reversible within one release cycle.
- It does not change list price, package structure, or target ICP.
- It does not require net-new roadmap commitments outside retention operations.
- Expected downside is limited to local operational cost, not strategic dilution.
Examples: onboarding friction removal, churn-reason capture, cancellation-flow clarity, lifecycle messaging, CSM outreach for existing high-value accounts.

### Strategy-Sensitive Intervention
An intervention is strategy-sensitive if any of the following are true:
- It changes pricing, discounting, contract structure, or packaging.
- It expands support or product scope for off-target segments.
- It introduces roadmap commitments that primarily serve at-risk but non-core customers.
- It could worsen margin quality, target-customer mix, or product focus.
Examples: broad win-back discounts, custom feature promises, permanent service-heavy save motions, repositioning toward high-churn non-core segments.

### Escalation Threshold
No strategy-sensitive intervention moves from investigation to rollout until all gating criteria are met:
- A segmented churn baseline exists for lifecycle stage, plan type, and value cohort.
- The target segment represents a material churn opportunity.
- The suspected driver is supported by at least one observed behavioral or operational signal, not only anecdote.
- A guardrail owner is named for margin quality, ICP mix, and product-focus impact.
- The intervention is approved in joint review by product, success, and strategy.

## Proposed Approach
1. Establish a churn decisioning layer that classifies accounts by segment, risk signal, and intervention class.
2. Phase 1 is diagnostic only: instrument churn reasons, pre-churn behaviors, support history, save outcomes, and segment baselines.
3. After the baseline is created, Phase 2 may launch only low-regret interventions in limited cohorts.
4. Strategy-sensitive interventions remain in hypothesis status until escalation thresholds are satisfied.
5. Review impact against retention and guardrail metrics before any expansion.

## Requirements
- Segment churn by lifecycle stage, plan type, value cohort, and target/non-target customer profile.
- Distinguish observed symptoms from inferred causes in all reporting.
- Log each intervention as low-regret or strategy-sensitive with the rule used.
- Track intervention exposure, retention outcome, and downstream quality metrics.
- Require explicit cross-functional approval before scaling strategy-sensitive actions.

## Success Metrics
- Primary: reduction in preventable churn rate in targeted cohorts
- Secondary: improved activation, improved retained revenue, improved save rate
- Guardrails: no material decline in margin quality, target-customer mix, or product-focus metrics

## Rollout
- Phase 1: instrumentation, segmentation baseline, and intervention classification
- Phase 2: limited rollout of low-regret interventions only after baseline completion
- Phase 3: evaluate results and decide whether to expand low-regret actions, investigate deeper, or advance a strategy-sensitive proposal through review

## Risks
- Baseline evidence may remain too weak to support any escalation
- Teams may over-classify interventions as low-regret to move faster
- Short-term retention improvements may still mask poor fit if guardrails are ignored

## Decision Frame
Proceed with a gated churn program, not a generic retention push. Act only on interventions that meet explicit low-regret criteria after baseline instrumentation exists, and hold any pricing, positioning, or scope-changing response behind formal escalation thresholds.

## Unknowns & Evidence Gaps
- No direct churn evidence was provided in the case packet.
- Relative contribution of product, pricing, support, and market factors remains unknown.
- Predictive validity of current churn signals is unproven.
- Segment-level opportunity sizing is unspecified.

## Pass/Fail Readiness
Pass with conditions. The PRD is now operationally usable as a governance and sequencing document, but execution still depends on Phase 1 producing a segmented baseline and validated risk signals.

## Recommended Next Artifact
A churn analysis brief with segmented baseline metrics, observed-vs-inferred driver mapping, and a ranked intervention matrix scored against the low-regret and escalation rules.
