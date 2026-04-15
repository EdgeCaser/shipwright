# Revised artifact

## PRD: Churn Reduction Under Conflicting Signals

### Problem Statement
Churn is rising or materially concerning, but current signals do not support a confident single-cause diagnosis. Strategy targets also constrain the solution space, so the PRD must specify how to reduce churn without drifting into broad pricing, packaging, or roadmap changes that have not been validated.

### Goal
Reduce avoidable churn in priority segments while preserving strategy guardrails.

### Non-Goals
- Declaring a single root cause before evidence is sufficient
- Launching parallel retention programs without sequencing logic
- Making company-wide pricing or packaging changes from weak churn evidence
- Retaining poor-fit customers at the expense of margin or positioning

### Users / Segments in Scope
- New customers at risk of failed activation
- Existing customers with measurable usage decline before cancellation
- High-value accounts entering explicit cancellation or downgrade flows

### Product Requirement
Build a churn-reduction program that starts with structured diagnosis, ranks candidate causes by evidence quality and business impact, and only then expands targeted interventions.

### Decision Logic
The PRD should treat churn causes as a ranked backlog, not an equal-weight set of bets.

Prioritization criteria:
1. Signal strength: existing data can distinguish the cause from noise.
2. Addressability: the product, lifecycle, or support team can act on it quickly.
3. Revenue exposure: the affected segment represents meaningful churn value.
4. Strategic fit: the intervention does not conflict with pricing discipline, margin, or target-customer strategy.
5. Time to learn: the intervention can produce a readable result in a bounded period.

### Ranked Hypothesis Backlog
1. Activation failure in early-life cohorts
Reason for inclusion: it is usually observable through onboarding completion and early adoption events, and it is often fast to test.
2. Value-realization gap in established accounts
Reason for inclusion: this is testable through engagement decline and outcome proxy measures and matters if retained accounts fail to adopt core product behavior.
3. Cancellation-flow recovery for high-value accounts
Reason for inclusion: this is a late-stage intervention with clear exposure sizing and tight operational control, but it should be used only where strategic-fit and margin guardrails pass.
4. Deferred hypotheses pending evidence
Examples: pricing sensitivity, contract structure, competitive displacement, procurement/budget cuts.
Rule: these remain in scope for diagnosis and can be promoted only if evidence quality exceeds the top-ranked backlog items.

### Why These First Bets
These are not asserted as dominant churn causes. They are the first candidates because they combine relatively high observability, short time-to-learn, and clear intervention paths. Pricing redesign, contract changes, and competitive-response plays are explicitly deferred because they are more strategy-coupled and should require stronger evidence before entering MVP scope.

### MVP Scope
Phase 1: Diagnostic foundation
- Standardize churn taxonomy across activation failure, value-realization gap, cancellation-intent recovery, pricing sensitivity, competitive displacement, and external/budget churn.
- Instrument pre-churn signals by segment, tenure, plan tier, and contract type.
- Produce a weekly ranked view of candidate churn causes using the prioritization criteria.

Phase 2: Two highest-ranked interventions only
- Launch at most two interventions at a time based on the current ranked backlog.
- Default starting interventions are activation rescue and value-realization outreach only if the first diagnostic read supports them.
- Cancellation-flow save offers require an additional guardrail check for margin, customer fit, and strategic consistency before launch.

### Intervention Requirements
1. Every intervention must name the target segment, causal hypothesis, expected mechanism, and stop/go threshold.
2. No intervention can be launched without a named owner and measurable leading indicator.
3. Resource allocation follows ranking; lower-ranked causes stay in backlog unless promoted by new evidence.
4. Pricing, contract, and competitive-response experiments require explicit approval once evidence clears the promotion threshold.

### Success Metrics
- Primary: gross churn, net revenue retention, and logo retention in in-scope segments
- Secondary: activation completion, recovery of core usage, cancellation save rate where permitted
- Guardrails: margin, support load, target-segment mix, and strategic product adoption

### Risks
- Ranking the wrong causes because telemetry quality is weak
- Treating late-stage save tactics as a substitute for fixing upstream value failure
- Allowing short-term retention wins to preserve poor-fit customers
- Delaying higher-leverage pricing or contract changes if the promotion threshold is too strict

## Decision Frame
Adopt a staged churn PRD built around ranked hypotheses, not equal-weight interventions and not a single-cause rewrite. The decision is to fund diagnosis first, then run only the highest-ranked, strategy-compatible interventions. This makes the artifact more decision-useful because it converts conflicting signals into an explicit sequencing method rather than an unsupported bundle of parallel bets.

## Unknowns & Evidence Gaps
- No evidence in the case packet establishes which churn cause dominates.
- The current relative weight of activation, value realization, pricing, competition, and external-budget churn is unknown.
- It is not yet known whether the default top-ranked causes will survive the first diagnostic read.
- The intervention promotion threshold for pricing or contract changes still needs numeric definition.

## Pass/Fail Readiness
Pass if the team can produce a ranked cause backlog from real telemetry, name promotion criteria for deferred hypotheses, and launch no more than two bounded interventions with guardrails. Fail if the team cannot distinguish causes credibly, insists on parallelizing all candidate plays, or uses save tactics that violate strategic-fit or margin constraints.

## Recommended Next Artifact
A churn evidence brief that scores candidate churn causes by signal strength, revenue exposure, strategic fit, and time to learn, followed by a sequenced experiment plan that names which two interventions enter MVP and which remain deferred.
