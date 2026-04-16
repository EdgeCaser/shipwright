# Revised artifact

# PRD: Collaboration Activation Pilot for Churn-Risk Users

## Overview
This PRD defines a limited pilot for users who have not used collaboration in 30 days. The retention evidence is correlational: collaboration users show 4% annual churn versus 22% for non-users, but causation is unproven and selection bias is plausible. The initiative is justified only as a low-cost learning investment with explicit stop/go thresholds, not as a validated churn-reduction program.

## Problem Statement
Non-users of collaboration appear to churn at materially higher rates than collaboration users. That pattern may reflect product impact, or it may reflect self-selection by higher-intent, more mature, or larger accounts. The product decision is therefore whether to fund a bounded experiment-like pilot to test whether collaboration activation creates enough incremental behavioral lift to merit deeper investment.

## Decision Rule
Run the pilot only if all of the following are true before launch:
- Delivery cost is capped at a small exploratory budget and does not displace higher-confidence retention work.
- A randomized holdout or phased rollout is feasible.
- Leadership agrees that the pilot is a falsifiable learning program, not a retention commitment.

The working threshold for proceeding is: we believe there is at least a plausible, decision-relevant chance that some non-trivial portion of the observed 18-point churn gap is causal, and that this can be tested cheaply enough that the expected learning value exceeds pilot cost. In operational terms, this means the team must be willing to stop if the pilot fails to show incremental activation versus holdout.

## Product Goal
Determine whether targeted collaboration activation can produce incremental collaboration behavior in the eligible segment, and whether any observed lift is strong enough to justify a later retention study.

## Non-Goals
- Do not claim that collaboration usage reduces churn.
- Do not forecast retention savings from the 4% versus 22% gap.
- Do not scale the program based on correlation alone.

## Target Segment
Users who meet all of the following:
- No collaboration usage in the last 30 days.
- Still active in other core workflows.
- Have a credible collaboration use case, such as multi-user setup, shared workflows, or teammate presence.

## Hypotheses
1. Targeted prompts can increase first or renewed collaboration actions versus holdout.
2. If collaboration has real product value for this segment, some activated users will show repeat collaboration behavior rather than one-time compliance.
3. If the observed churn gap is mostly selection bias, the pilot will show little or no incremental lift versus holdout, or only shallow one-time activation without durable usage.

## Proposed Initiative
Launch a constrained pilot with:
- Contextual in-app prompts at moments where sharing or co-editing is naturally relevant.
- Lifecycle messaging tied to a guided collaboration action.
- A lightweight invite/share flow to reduce setup friction.
- Randomized holdout or phased rollout instrumentation for valid comparison.

## Requirements
### Functional
- Detect users with no collaboration usage in the prior 30 days.
- Restrict treatment to collaboration-eligible users.
- Deliver prompts and guided collaboration flows.
- Log exposure, click-through, activation, repeat use, and downstream engagement.

### Measurement
- Primary pilot metric: incremental collaboration activation rate versus holdout.
- Secondary metrics: repeat collaboration usage within 14 and 30 days, invite completion, shared artifact creation, and engagement depth.
- Guardrails: unsubscribe rate, prompt dismissal, workflow disruption, and support contacts.
- Long-horizon outcome: retention delta is monitored only as exploratory follow-up, not as pilot proof.

## Stop/Go Criteria
### Proceed to pilot
Proceed only if a valid comparison design exists and pilot cost remains bounded.

### Continue after pilot
Continue to a deeper retention study only if:
- Treatment beats holdout on collaboration activation by a pre-registered minimum effect threshold set before launch.
- A meaningful share of activated users repeat collaboration behavior within 30 days.
- Guardrails remain within acceptable limits.

### Stop the program
Stop if any of the following occur:
- No measurable activation lift versus holdout.
- Lift is limited to one-time clicks or setup completion without repeat collaboration use.
- Treatment effects appear only in clearly pre-committed power-user subsegments, suggesting the program is not expanding genuine adoption.
- Guardrail harm outweighs behavioral gains.

## Launch Recommendation
Approve only a bounded activation pilot with explicit falsification criteria. Reject any version of the initiative that is framed as a churn-reduction commitment before causal evidence improves.

## Decision Frame
The decision is whether to fund a low-cost, falsifiable collaboration activation pilot, not whether collaboration reduces churn. Recommendation: proceed only if the team can pre-register success and stop thresholds, run a valid holdout or phased comparison, and accept that a null result should terminate the initiative.

## Unknowns & Evidence Gaps
- How much of the 18-point churn gap is causal versus selection bias.
- Which subsegments have real collaboration potential.
- What minimum activation lift would justify a deeper retention study.
- Whether observed usage lift persists beyond short-term prompt response.

## Pass/Fail Readiness
Pass if:
- The pilot is explicitly budget-bounded and learning-oriented.
- A comparison design and pre-registered thresholds exist.
- Success is defined as incremental behavioral lift, not inferred retention impact.
- Leadership agrees to stop on null or shallow results.

Fail if:
- The team cannot define ex ante thresholds for success and stopping.
- No holdout or credible comparison method is available.
- The segment is not filtered for real collaboration relevance.
- The program is used to justify a retention forecast from correlation alone.

## Recommended Next Artifact
A pilot measurement brief that specifies segmentation logic, comparison design, pre-registered minimum effect thresholds, guardrail limits, and explicit stop/continue/escalate rules.
