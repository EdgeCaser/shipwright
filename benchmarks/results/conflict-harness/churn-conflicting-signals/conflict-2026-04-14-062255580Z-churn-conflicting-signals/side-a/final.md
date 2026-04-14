# Revised artifact

## Churn Reduction PRD

### Product Requirement
Design and ship a churn-reduction program that can resolve conflicting churn signals while protecting strategy targets. Because the case packet provides no direct operating evidence, this PRD defines a bounded decision system: detect conflicts explicitly, rank evidence sources, run narrow interventions only when a conflict is resolved enough for action, and preserve a holding state when it is not. [Citations: ctx-1, ctx-2]

### Problem Statement
The team must reduce churn, but current signals point to different causes or different customer groups. In this condition, the main failure mode is not slow action alone; it is acting on the wrong signal and retaining the wrong customers, using the wrong lever, or hiding a strategic mismatch behind aggregate save metrics. [Citations: ctx-1, ctx-2]

### Goal
Reduce preventable churn in strategy-priority segments without degrading segment quality, margin quality, or product focus.

### Non-Goals
- Broad save campaigns across all churned accounts.
- Discounts as the default retention lever.
- Roadmap expansion for non-strategic segments.
- Treating all churn as equally bad.

### Users and Decision Owners
Primary users:
- Customers in strategy-priority segments with elevated churn risk.
- Product, lifecycle, and customer success teams deciding whether to intervene.

Decision owners:
- Product owner for churn program.
- GTM or success lead for outreach interventions.
- Finance or strategy owner for pricing or discount exceptions.

### Core Product Decision
When signals conflict, the product must not just classify churn; it must adjudicate which signal is credible enough to drive action. The first release therefore requires an explicit conflict-resolution method, not only segmentation and reporting. [Citations: ctx-1, ctx-2]

## Requirements

### 1. Conflict Detection
The system must mark an account or cohort as `conflicted` when two or more materially different explanations imply different interventions or different strategic treatment.

Minimum conflict types:
- stated reason conflicts with observed behavior
- high-value segment tag conflicts with poor-fit usage or service profile
- usage decline conflicts with stable outcome attainment
- pricing objection conflicts with low feature adoption
- support dissatisfaction conflicts with otherwise strong engagement

Each conflicted record must store:
- competing hypotheses
- source of each signal
- evidence timestamp
- affected segment
- decision status: `resolved`, `test`, or `hold`

### 2. Evidence Hierarchy and Trust Rules
The system must rank evidence sources before any intervention is chosen.

Default hierarchy for release one:
1. observed behavior tied to value realization or failure
2. realized outcomes such as renewal, contraction, downgrade, or unresolved support burden
3. repeated human-reported reasons from structured exit or success notes
4. one-off anecdotes or unstructured requests

Decision rules:
- If higher-ranked evidence and lower-ranked evidence conflict, default to the higher-ranked source unless the lower-ranked source repeats above a defined review threshold.
- If two high-ranked sources conflict, do not scale an intervention; assign the case to `test` or `hold`.
- If no source clears the minimum confidence rule, classify as `unknown`, not as a solved driver.

### 3. Resolution Paths
Every conflicted signal must be routed to one of three paths.

`resolved`:
- evidence hierarchy produces a clear preferred hypothesis
- intervention may launch for the defined target cohort

`test`:
- conflict remains between plausible causes
- run a narrow experiment designed to distinguish causes, such as onboarding recovery versus pricing conversation

`hold`:
- evidence is too weak or the account appears strategically misfit
- no save motion beyond standard service; record for pattern review

### 4. Segmentation and Guardrails
The system must classify accounts by:
- strategic segment
- tenure cohort
- pricing or contract tier
- usage or activation pattern
- fit status: `target-fit`, `borderline-fit`, `misfit`, `unknown`

Guardrails:
- no intervention may be declared successful if retained accounts shift mix away from target-fit customers
- no intervention may exceed pre-approved discount or servicing-cost limits
- no intervention may scale if post-save activation remains below the target cohort baseline for two review cycles
- misfit retention must not be counted as program success

### 5. Intervention Design
Allowed intervention types for release one:
- onboarding recovery for early activation failure
- adoption coaching for low-usage but target-fit accounts
- success outreach for high-value target accounts with verified decline
- pricing or packaging review only when value realization is otherwise present

Each intervention must define:
- target cohort
- hypothesis being tested
- disqualifying conflict conditions
- primary success metric
- guardrail metric
- stop condition

### 6. Review Cadence and Outputs
The release must generate a recurring review showing:
- percentage of churn or risk cases marked `conflicted`
- conflict types by segment
- resolution split across `resolved`, `test`, and `hold`
- intervention outcomes by hypothesis
- recommendation for each hypothesis: `scale`, `continue test`, `stop`, or `reclassify as acceptable churn`

## Success Metrics
Primary metrics:
- reduction in churn for target-fit strategy-priority segment
- improvement in retention for resolved-conflict cohorts versus matched baseline

Conflict-resolution metrics:
- share of churn-risk cases explicitly classified as conflicted or non-conflicted
- share of conflicted cases resolved within review SLA
- share of interventions launched only after `resolved` or approved `test` status
- unknown-rate trend over time

Guardrail metrics:
- retained-customer mix by fit status
- discount rate and servicing-cost impact
- post-save activation quality versus target cohort baseline

## Rollout Plan
Phase 1:
- standardize churn definition
- define strategic segment and fit taxonomy
- instrument conflict flags and evidence hierarchy
- establish baseline cohorts

Phase 2:
- review first conflicted cohorts
- run 2-3 discriminating tests where competing causes imply different actions
- keep unresolved or misfit cases in `hold`

Phase 3:
- scale only interventions that improve target-fit retention and pass guardrails
- retire hypotheses that fail discrimination tests

## Risks
- false confidence from weak reason coding
- overfitting to anecdotal save requests
- retaining non-strategic customers through discounts
- unresolved conflicts accumulating without decision ownership

## Decision Frame
Approve a churn program only if it includes an explicit conflict-resolution mechanism: detect conflicting signals, rank evidence, route cases to `resolved`, `test`, or `hold`, and scale only where target-fit retention improves without guardrail violations. The operative decision is not diagnosis-first in the abstract; it is evidence-adjudication first when signals disagree. [Citations: ctx-1, ctx-2]

## Unknowns & Evidence Gaps
- No direct evidence is provided on which signals are in conflict, how often they conflict, or which segments are affected. [Citations: ctx-2]
- Strategy targets are not numerically specified, so guardrail thresholds must be finalized by the owning team before launch. [Citations: ctx-1]
- The initial evidence hierarchy is a governance default, not an empirically validated ranking for this business yet. [Citations: ctx-2]

## Pass/Fail Readiness
Pass if:
- conflicting signals are explicitly defined and instrumented
- every case can be routed to `resolved`, `test`, or `hold`
- interventions cannot launch without a named hypothesis and disqualifying conditions
- success is judged on target-fit retention and guardrails, not aggregate saves

Fail if:
- the team only segments churn but cannot adjudicate signal conflicts
- broad retention tactics launch without evidence ranking or discrimination tests
- misfit retention counts as success
- unknown cases are silently forced into a false driver category

## Recommended Next Artifact
A churn-analysis brief that quantifies actual conflict patterns, validates the evidence hierarchy against historical churn outcomes, and sets numeric thresholds for fit status, discount limits, and post-save activation guardrails.
