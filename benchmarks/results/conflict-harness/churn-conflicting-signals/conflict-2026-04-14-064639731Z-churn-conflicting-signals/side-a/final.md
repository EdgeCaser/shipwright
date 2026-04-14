# Revised artifact

## Churn Reduction PRD: Evidence-Gated Retention Decision System

## Overview
Build an evidence-gated churn decision system for situations where churn signals conflict with strategy targets. The immediate product need is not a full retention program. It is a disciplined way to identify what signals conflict, measure whether the conflict is material, and decide whether the organization has enough evidence to launch targeted churn interventions without undermining strategy.

## Problem
The business sees churn risk, but the signals do not point cleanly to one diagnosis. Some indicators may imply preventable churn, while strategy targets may imply that some attrition is acceptable or even desirable. Launching a broad churn program before resolving that conflict risks retaining the wrong customers, distorting pricing or positioning, and generating false confidence from noisy saves.

## Goal
Create a decision workflow that:
1. Enumerates the conflicting churn signals explicitly.
2. Quantifies which parts of churn are observable versus inferred.
3. Establishes the minimum evidence threshold required before any scaled intervention or durable churn taxonomy is adopted.
4. Allows only low-regret, reversible tests before that threshold is met.

## Non-Goals
1. Global save campaigns before signal conflict is resolved.
2. Permanent churn-taxonomy rollout without supporting evidence.
3. Broad discounting or pricing concessions outside explicit experiment approval.
4. Full CRM or lifecycle-stack rebuild.

## Users
1. PM or retention owner responsible for churn decisions.
2. Lifecycle or growth operators running limited tests.
3. Finance or strategy stakeholders validating fit and margin impact.
4. Leadership deciding whether churn action supports or dilutes strategy.

## Core Product Principle
Under conflicting signals, the first useful output is not a mature retention operating model. It is a decision-grade evidence layer that makes the conflict legible and defines when intervention is justified.

## Product Requirements
### 1. Conflict Register
The system must record the specific churn signals in conflict.

Required fields:
1. Signal name.
2. Source.
3. Observed metric or qualitative pattern.
4. Segment implicated.
5. Confidence level.
6. Strategic implication if true.
7. Competing interpretation.

Acceptance criteria:
1. Every material churn signal in scope is documented in a common register.
2. Contradictions are explicit rather than averaged together.
3. Each signal is tagged as observed behavior, proxy, or inference.

### 2. Evidence Threshold Gate
Before any durable churn classification model or scaled intervention is adopted, the team must pass a minimum evidence gate.

Minimum gate:
1. Segment-level churn breakdown exists for prioritized segments.
2. Current churn reasons are captured for a meaningful share of recent churn events.
3. Margin or strategic-fit context exists for the segments under review.
4. The team can state which churn signals are high-confidence versus unresolved.

Acceptance criteria:
1. The PRD defines what evidence is required for go/no-go.
2. If the threshold is not met, the output is "continue evidence collection," not "launch program."
3. Pass/fail status can be determined without subjective reinterpretation.

### 3. Provisional Churn Classification
A churn taxonomy may be used only as a provisional working model after the evidence threshold is partially met.

Initial buckets:
1. Likely preventable churn.
2. Unclear churn.
3. Likely strategic or acceptable churn.

Acceptance criteria:
1. Bucket assignment is explicitly provisional until evidence quality improves.
2. Unclear churn remains a first-class bucket rather than being forced into a false diagnosis.
3. Review output states what percent of churn is still unresolved.

### 4. Low-Regret Intervention Rules
Only reversible, segment-specific interventions may run before evidence quality is strong.

Allowed early interventions:
1. Exit capture improvements.
2. Onboarding rescue for clear activation failures.
3. Human outreach to high-value accounts with known blockers.

Acceptance criteria:
1. No intervention launches globally before segment readout exists.
2. Every intervention has a clear owner, target segment, and stop condition.
3. Early interventions are framed as learning motions first, scale motions second.

### 5. Strategy Guardrails
Retention work must not override strategy targets.

Guardrails:
1. Do not treat all churn as bad churn.
2. Do not preserve non-target or unprofitable customers without explicit approval.
3. Do not use discounts outside an approved pricing experiment.
4. Do not count saves as success if they worsen target-segment mix or margin.

Acceptance criteria:
1. Review outputs include segment-fit and margin implications.
2. Reported churn wins can be separated into strategic versus non-strategic impact.

### 6. Decision Cadence
The team must review evidence on a fixed cadence and choose one of four actions:
1. Collect more evidence.
2. Run limited tests.
3. Scale a targeted intervention.
4. Stop retention work for this segment.

Acceptance criteria:
1. Each review records evidence, unresolved conflicts, decision, and rationale.
2. Leadership can see whether the organization is learning, scaling, or stopping.
3. No scale decision occurs without the evidence threshold being passed.

## Success Metrics
Primary decision metrics:
1. Percent of prioritized churn signals documented in the conflict register.
2. Percent of recent churn events with usable segment and reason data.
3. Time required to move a segment from unresolved to decision-ready.

Conditional outcome metrics:
1. Preventable churn reduction in segments that passed the evidence gate.
2. Retained revenue from approved target segments.

Guardrail metrics:
1. Gross margin impact.
2. Share of retained customers inside target profile.
3. Discount incidence.
4. Percent of churn still classified as unclear.

## Rollout Plan
### Phase 0: Resolve the conflict
1. Enumerate conflicting signals.
2. Quantify evidence gaps by segment.
3. Define go/no-go evidence thresholds.

### Phase 1: Build minimum evidence layer
1. Improve churn reason capture.
2. Produce segment-level churn breakdown.
3. Add confidence labels to existing signals.

### Phase 2: Run low-regret tests
1. Launch reversible interventions only where evidence is strongest.
2. Measure effect by segment, margin, and strategic fit.
3. Stop or expand based on review outcome.

### Phase 3: Formalize operating model
1. Adopt a more durable taxonomy only if evidence quality is sufficient.
2. Scale interventions only in segments with validated preventable churn.

## Risks
1. Teams may rush from ambiguity to false precision.
2. Poor reason capture may make the unclear bucket too large to act on.
3. Leadership may pressure for action before evidence thresholds are met.
4. Short-term save tactics may still conflict with positioning or pricing discipline.

## Decision Frame
Proceed now only with an evidence-gated churn decision workflow. Do not proceed with a scaled churn reduction program until the team can name the conflicting signals, quantify the gap between them, and meet a minimum evidence threshold for prioritized segments. The immediate decision is whether enough evidence can be created to justify targeted retention work, not whether all churn should be attacked.

## Unknowns & Evidence Gaps
1. The specific conflicting churn signals are not yet enumerated.
2. No segment-level churn breakdown is currently provided.
3. No profitability or target-fit context is available for affected segments.
4. Current churn-reason coverage and reliability are unknown.
5. The threshold for moving from "unclear churn" to "likely preventable" is not yet calibrated.

## Pass/Fail Readiness
Pass if the team can document the conflicting signals, produce segment-level churn visibility, define evidence thresholds, and restrict early action to reversible tests with strategy guardrails.

Fail if the team intends to adopt a mature churn taxonomy, launch scaled interventions, or claim preventable churn reduction before evidence quality is sufficient to support those decisions.

## Recommended Next Artifact
Evidence resolution brief covering: conflict register, segment-level churn breakdown, minimum evidence thresholds, provisional taxonomy rules, and criteria for advancing to targeted retention experiments.
