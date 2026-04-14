# Revised artifact

## Pricing Strategy Recommendation Under Partial Market Data

## Recommendation
Do not treat a new-customer-only test as the default answer. Recommend a staged pricing decision with two admissible paths, chosen explicitly against opportunity cost and transfer-risk:

1. Use a new-customer or segment-fenced test if the primary objective is downside control and the team cannot safely experiment on the installed base.
2. Use a limited installed-base test at a natural renewal, expansion, or contract boundary if the primary risk is underpricing the current base and results from new-logo cohorts would not transfer.

The core recommendation is not "protect existing customers at all costs." It is to avoid a full-market permanent repricing until the team runs a bounded test that matches the population where the economic question actually matters.

## Why This Is The Best-Supported Recommendation
The scenario provides no competitor benchmarks, elasticity data, willingness-to-pay evidence, installed-base renewal behavior, or segment mix. With that evidence missing, a broad permanent pricing reset is weakly supported. But the prior version overstated confidence in one specific design. Under partial data, the stronger claim is narrower: prefer a reversible, decision-oriented test design over an irreversible full rollout, and choose the test population based on where uncertainty and economic exposure are greatest.

That framing addresses three risks simultaneously:
- transfer risk: new-customer behavior may not predict installed-base response;
- downside risk: repricing the full base without evidence can create avoidable churn or sales friction;
- opportunity-cost risk: delaying any test while remaining underpriced is itself a costly pricing choice.

## Test Design Rules
- Test one pricing variable at a time when possible: list price, discounting policy, or packaging fence.
- Match the test cohort to the decision being made. If the decision is about renewal monetization, test at renewal. If the decision is about top-of-funnel acquisition, test on new logos.
- Predefine duration, sample target, and minimum detectable effect so the test cannot run indefinitely without a decision.
- Measure both uplift and harm: conversion or renewal rate, realized revenue per account, win rate or expansion rate, and early retention/churn.
- Quantify status-quo cost alongside treatment risk. If current pricing is plausibly under market, estimate monthly foregone revenue while the test runs.
- Set rollback criteria in advance.

## Decision Frame
Recommend a reversible pricing experiment rather than a market-wide permanent change. The decision is not whether to be certain; it is whether to act in a way that produces useful evidence while bounding both downside and opportunity cost. The right test population depends on which population drives the decision value.

## Unknowns & Evidence Gaps
- No competitor pricing or packaging benchmarks are provided.
- No willingness-to-pay or elasticity evidence is provided.
- No installed-base renewal, contraction, or churn sensitivity data is provided.
- No segment mix is provided, so transferability across cohorts is unknown.
- No sample-size, traffic-volume, or sales-capacity data is provided, so test power cannot yet be confirmed.
- No estimate of current underpricing cost is provided, so the cost of delay remains unquantified.

## Pass/Fail Readiness
Pass for a bounded experiment if the team can name the target population, define the economic question, set sample and duration thresholds, and instrument both upside and harm.
Fail for a full repricing rollout today because the evidence base does not justify a durable market-wide decision.

## Recommended Next Artifact
A pricing experiment brief that specifies: target population, hypothesis, one-variable treatment, sample-size and duration assumptions, guardrail thresholds, rollback triggers, and a simple status-quo-versus-test opportunity-cost model.
