# Revised artifact

# Churn Reduction PRD: Conflicting Signals

## Overview
Build a churn-reduction program that first resolves decision-critical uncertainty, then deploys segment-specific retention interventions. The product should not assume current strategy targets are the correct retention priority until segment churn, segment value, and strategy-fit baselines are established.

## Problem
Current churn signals conflict, and the team lacks the baseline required to know whether the problem is:
- concentrated in a strategically important segment
- concentrated in a low-fit or wrongly acquired segment
- caused by product gaps, onboarding failures, pricing mismatch, or weak value communication
- exposing that current strategy targets are themselves misaligned with the retained customer base

Without this baseline, a churn program risks optimizing for the wrong cohort or defending a strategy that the churn pattern is disproving.

## Goal
Create a decision-ready churn system that:
- makes churn measurable by segment, value tier, tenure, and use-case fit
- distinguishes retention opportunities from strategy-misalignment signals
- enables targeted, reversible interventions only after baseline validation

## Non-Goals
- Reduce aggregate churn at any cost.
- Treat existing strategy targets as automatically correct.
- Commit roadmap changes before root-cause evidence exists.
- Scale retention interventions globally before segment validation.

## Users
- Existing customers at risk of churn.
- PM, Success, Growth, and Leadership teams making retention tradeoffs.

## Product Requirements
1. Instrument churn reporting by segment, plan, tenure, revenue tier, acquisition source, and use-case fit.
2. Create a baseline view that compares:
- observed churn cohorts
- current strategy-priority segments
- revenue and expansion value by segment
3. Require every retention proposal to specify:
- target segment
- evidence source
- hypothesized churn driver
- expected retention impact
- effect on strategic fit
4. Add a decision layer that classifies churn drivers into:
- product gap
- onboarding failure
- value communication failure
- pricing/packaging mismatch
- wrong-customer acquisition
- strategy-target misalignment
5. Gate intervention rollout in two stages:
- Diagnostic stage: collect segment baseline and validate whether strategy targets match retained-value cohorts.
- Action stage: run reversible experiments only for segments with sufficient evidence.
6. Trigger a strategy review when evidence shows that high-value churn is concentrated outside current target segments or that target segments exhibit structurally weak retention.
7. Track guardrails so retention gains are not produced by excessive discounting, support burden, or preservation of persistently low-fit customers.

## Success Metrics
- Primary: revenue churn reduction in evidence-validated priority segments.
- Secondary: activation rate, save rate, retained revenue after intervention, and time-to-diagnosis of churn driver.
- Guardrails: support cost per retained account, discount dependency, retention of low-fit cohorts, and false-positive intervention rate.

## Rollout
- Phase 1: establish segment and strategy-alignment baseline.
- Phase 2: classify churn drivers and identify whether the issue is retention execution or strategy fit.
- Phase 3: run targeted, reversible experiments in validated priority segments.
- Phase 4: scale successful interventions or escalate to strategy revision.

## Decision Frame
The first decision is not which segment to save. The first decision is whether the current strategy targets are valid retention priorities once churn, value, and fit are viewed together. If baseline evidence confirms that strategically intended segments are both high-value and meaningfully at risk, prioritize retention there. If evidence shows churn is exposing a flawed targeting strategy, escalate to strategy review rather than forcing retention work through an invalid segment hierarchy. [ctx-1]

## Unknowns & Evidence Gaps
- Which segments have the highest churn by revenue, logo count, and strategic value.
- Whether current strategy-priority segments are the same segments producing retained value.
- Whether churn is driven by product gaps, onboarding failures, pricing mismatch, wrong-customer acquisition, or strategy misalignment.
- What interventions have already been attempted and with what measured outcomes.

## Pass/Fail Readiness
Pass if:
- segment-level churn and value baselines exist
- the team can compare strategy targets against actual churn cohorts
- each intervention is tied to an explicit segment and churn-driver hypothesis
- the PRD includes a clear trigger for strategy review when evidence contradicts current targets

Fail if:
- segment churn cannot be measured
- the plan assumes current strategy targets are correct without validation
- interventions are launched before baseline evidence exists
- the team cannot distinguish retention execution problems from strategy-misalignment problems

## Recommended Next Artifact
Segmented churn diagnostic brief with baseline tables, strategy-alignment assessment, and experiment recommendations.
