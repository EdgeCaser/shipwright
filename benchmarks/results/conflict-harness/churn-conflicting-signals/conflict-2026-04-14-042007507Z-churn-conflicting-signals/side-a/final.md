# Revised artifact

## Title
Conflict-Tolerant Churn Reduction PRD

## Problem
Churn signals are inconsistent across sources. Product usage and account behavior indicate elevated risk in some cohorts, while strategy targets emphasize segments whose retention pattern is not yet well established. The team needs a retention program that reduces preventable churn without treating uncertain signals as settled fact.

## Goal
Reduce preventable churn while improving the reliability and actionability of churn diagnosis.

## Non-Goals
- Rewriting overall product strategy in this cycle
- Global retention offers applied to all segments
- Large pricing or packaging changes without segment validation

## Users / Segments
- Accounts with observed churn-risk signals
- Strategic target accounts with incomplete retention evidence
- Customer success and lifecycle teams executing interventions
- Product and analytics owners responsible for retention measurement

## Core Hypothesis
When signals conflict, the safest near-term approach is not a blanket program but a decision policy that separates clearly observed risk from ambiguous risk, applies a minimum-save treatment to all flagged accounts, and uses stronger interventions only where the signal is both material and repeatable.

## Decision Policy
Use two required tags on each flagged account:
- `Risk level`: `high`, `medium`, or `watch`
- `Signal confidence`: `validated`, `provisional`, or `insufficient`

### Signal Confidence Definition
`validated` means at least 2 independent indicators agree and the pattern has held for 2 consecutive measurement windows.
Examples: usage decline plus support distress; seat contraction plus executive disengagement.

`provisional` means only 1 material indicator is present or the pattern is recent and unconfirmed.

`insufficient` means evidence is incomplete, missing, or contradictory enough that the system cannot support targeted intervention selection.

### Minimum-Save Rule
No flagged account receives observation only. Every flagged account gets at least a low-cost save action within the SLA:
- human review or automated outreach within 5 business days for `high`
- within 10 business days for `medium`
- monitored with reinforcement messaging for `watch`

This prevents the framework from delaying action on accounts that may churn while still preserving stronger resource allocation for the most credible cases.

## Product Requirements
### 1. Churn Triage Model
Score accounts on:
- risk level
- signal confidence
- segment
- days since last meaningful value event

The first version may be rule-based rather than predictive if the team cannot yet validate a model.

### 2. Intervention Routing
Route accounts as follows:
- `high risk + validated`: proactive save play with CSM ownership
- `high risk + provisional`: minimum-save action plus diagnostic outreach
- `medium risk + validated`: lifecycle intervention or assisted save play
- `medium/high risk + insufficient`: minimum-save action plus data-completion task
- `strategic segment + insufficient`: onboarding reinforcement, executive check-in, and instrumentation review

### 3. Reason Capture
Require structured reason codes for every churn event and retention intervention:
- product value gap
- onboarding failure
- low feature adoption
- price / budget
- competitive displacement
- organizational change
- involuntary / billing
- unknown

### 4. Measurement Layer
Track:
- gross churn by segment and route
- save rate by intervention path
- percentage of flagged accounts moving from `provisional` to `validated`
- share of churn tagged `unknown`
- time from flag to first action
- false-negative review rate from recently churned accounts that were not flagged

### 5. False-Negative Safeguard
Run a weekly backtest on churned or contracted accounts to identify misses. If more than an agreed threshold of churned accounts sat in `provisional` or `insufficient` without save action, tighten routing and expand minimum-save coverage.

### 6. Decision Review Gate
Do not scale any costly retention tactic unless it beats baseline within the target segment and does not create unacceptable margin, experience, or support-capacity damage.

## Prioritization
### P0
- define risk and confidence rules
- instrument required inputs
- launch minimum-save routing for all flagged accounts
- add structured reason capture
- stand up segment and route dashboard

### P1
- add diagnostic survey and CSM workflow support
- implement weekly false-negative review
- create experiment framework for validated save plays

### P2
- automate next-best-action recommendations
- integrate qualitative signals into rule refinement

## User Stories
- As a CSM, I need to know both account risk and signal reliability so I can choose an intervention without overreacting to noise.
- As a retention owner, I need every flagged account to receive at least a minimum-save action so uncertain classification does not become inaction.
- As a product manager, I need churn reasons and route outcomes captured in a structured way so future retention decisions use stronger evidence.

## Success Metrics
### Primary
- reduced churn in `high risk + validated` cohorts
- reduced share of churn coded `unknown`
- reduced missed-churn rate from false-negative review

### Secondary
- faster time from flag to first action
- higher save rate for validated routes versus baseline
- no material retention decline in strategic target segments

## Rollout Plan
### Phase 1
Define rules, instrument data, and launch minimum-save routing.

### Phase 2
Run segment-specific interventions with comparison groups where feasible.

### Phase 3
Promote only interventions that improve retention and preserve acceptable unit economics.

## Risks
- confidence rules may be too loose or too strict in early versions
- teams may confuse provisional labels with low priority
- under-instrumented strategic segments may still hide real churn risk
- retention offers may improve short-term saves but hurt margin or experience

## Decision Frame
Proceed with a segmented churn program only as an operational triage policy, not as a proven optimal model. The decision is to distinguish validated from provisional risk so the team can target stronger interventions where evidence is repeatable, while still guaranteeing a minimum-save action for all flagged accounts. This keeps action moving without pretending certainty the team does not have.

## Unknowns & Evidence Gaps
- Which signal combinations are most predictive of preventable churn
- Whether current data quality is sufficient to classify confidence reliably
- What false-negative rate is acceptable before the routing policy must expand
- Which intervention types produce durable retention rather than temporary saves

## Pass/Fail Readiness
Pass if the team can operationalize explicit confidence rules, minimum-save routing, false-negative review, and segment-level measurement before launch. Fail if confidence remains undefined, if low-confidence cases receive no action, if `unknown` remains dominant, or if the team cannot compare intervention performance against baseline.

## Recommended Next Artifact
Churn analysis brief with the initial rule set, confidence definition worksheet, baseline false-negative analysis, and experiment design for the first two validated intervention plays.
