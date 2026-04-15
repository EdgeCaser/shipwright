# Revised artifact

## PRD: Churn Reduction Under Conflicting Signals

### Problem
Observed churn indicators point in different directions, while strategy targets constrain the response: the business needs lower churn without broad discounting, premature roadmap resets, or a forced single-cause narrative. The PRD therefore needs to support action under uncertainty.

### Goal
Reduce preventable churn over the next two quarters through interventions that are measurable, reversible, and explicitly designed to improve diagnosis as well as retention outcomes.

### Non-Goals
- Declare a single root cause of churn before validation
- Commit to permanent pricing or packaging changes in this phase
- Reorganize the product roadmap around an unvalidated churn theory

### Users / Segments
- Newly activated accounts showing early-value risk
- Existing accounts with declining usage or unresolved workflow breakdowns
- Renewal-stage accounts where commercial friction may be present

### Product Requirement
The churn program must route at-risk accounts into provisional intervention paths based on observable signals, while preserving the ability to reclassify accounts as evidence improves.

### Proposed Scope
1. Stand up a churn-ops decision layer that uses provisional risk tags rather than fixed causal buckets.
2. Start with an initial operating taxonomy for intervention design, not as a validated model of churn causality:
   - Early value-realization risk
   - Ongoing engagement or workflow breakdown risk
   - Renewal or commercial-friction risk
3. Require each tagged account to support multi-factor classification so overlapping drivers are visible rather than forced into a single bucket.
4. Launch targeted interventions per provisional path:
   - Early value-realization risk: onboarding assist, setup completion prompts, success outreach
   - Engagement or workflow breakdown risk: usage-triggered nudges, workflow recovery prompts, support escalation
   - Renewal or commercial-friction risk: save playbook, packaging exception review, contract-friction triage
5. Instrument outcomes by signal pattern, intervention type, overlap rate, and retained cohort performance.
6. Review the taxonomy after the first measurement window and merge, split, or replace categories if the evidence does not support them.

### Success Metrics
- Gross churn rate for targeted cohorts
- Save rate by intervention type
- Time-to-intervention after risk detection
- Percent of at-risk accounts with multi-factor classification
- Share of churn explained by current taxonomy versus unclassified or overlapping cases

### Risks
- The initial taxonomy may anchor teams on the wrong operating model
- Overlap across drivers may be high enough that simple routing degrades decision quality
- Commercial saves may temporarily suppress churn without improving product-value retention

### Decision Frame
Choose a provisional, evidence-building churn program over a fixed three-bucket diagnosis. The decision is to act now with reversible intervention paths, while treating the starting taxonomy as an operational hypothesis that must earn its way into permanence.

### Unknowns & Evidence Gaps
- No validated evidence shows which churn drivers explain the largest share of churn
- Unknown whether the initial operating taxonomy captures most preventable churn or omits major drivers such as competitive displacement or integration failure
- Unknown how often accounts will exhibit overlapping signals across product, engagement, and commercial factors
- Unknown which interventions produce durable retention improvement versus temporary saves

### Pass/Fail Readiness
Pass if the team can operationalize provisional tagging, allow overlapping classifications, measure cohort outcomes, and commit to a formal taxonomy review after the first learning cycle.
Fail if stakeholders require a fixed causal model before acting, or if the system cannot track overlap, reclassification, and intervention outcomes well enough to update the model.

### Recommended Next Artifact
A churn driver evidence brief that tests the provisional taxonomy against real cohort data, quantifies overlap across signal families, identifies missing driver categories, and recommends whether to keep, split, merge, or discard the initial intervention paths.
