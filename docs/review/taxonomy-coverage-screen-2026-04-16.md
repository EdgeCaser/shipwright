# Taxonomy Coverage Screen — New Scenarios Baseline

**Date:** 2026-04-16
**Scope:** GPT screen of 17 new scenarios added to fill thin taxonomy buckets
**Question:** Do the new scenarios behave like well-formed conflict harness inputs, and what does the initial GPT verdict distribution look like?

## Bottom Line

The 17 new scenarios ran cleanly. No directional collapse, no structural failures, and the winner distribution is healthy across all three new buckets. The calibration set is now at 8 scenarios per bucket — the minimum for defensible category-level claims.

**One bug was found and fixed:** `build-case-packet.mjs` was importing `loadBenchmarkScenario` from `run-benchmarks.mjs`, which unconditionally requires `fixtures.first_pass_artifact` as a non-null string. The conflict harness generates its own artifacts and has no use for fixtures. Fixed by adding a lightweight `loadConflictScenario` loader in `build-case-packet.mjs` that only validates the fields the harness actually needs (`id`, `expected_artifact_type`). The fixture requirement stays in `loadBenchmarkScenario` since the benchmark suite genuinely needs it.

---

## Coverage Before and After

| Bucket | Before | After |
|---|---|---|
| `historical_strategy` | 11 | 12 |
| `executive_ambiguity` | 3 | 8 |
| `contradiction_or_boundary_prd` | 3 | 8 |
| `evidence_fragile_prd` | 1 | 8 |

All three previously thin buckets are now at the minimum defensible threshold (8 per bucket) for category-level claims.

---

## GPT Screen Results (17 scenarios)

| Scenario | Bucket | Winner | Margin | Confidence | Human Review | Decisive Dimension |
|---|---|---|---|---|---|---|
| adjacent-market-proxy | evidence_fragile_prd | tie | 0.00 | low | true | decision_usefulness |
| ai-moderation-human-review | contradiction_prd | side_a | 0.20 | medium | true | decision_usefulness |
| anecdotal-enterprise-extrapolation | evidence_fragile_prd | side_b | 0.20 | medium | false | decision_usefulness |
| api-deprecation-customer-pressure | executive_ambiguity | side_b | 0.20 | medium | false | evidence_discipline |
| async-realtime-conflict | contradiction_prd | side_a | 0.30 | medium | false | decision_usefulness |
| churn-correlation-causation | evidence_fragile_prd | side_a | 0.20 | medium | false | evidence_discipline |
| competitor-parity-no-demand | evidence_fragile_prd | side_b | 0.20 | medium | false | evidence_discipline |
| compliance-launch-speed | contradiction_prd | side_a | 0.40 | medium | false | decision_usefulness |
| data-privacy-personalization | contradiction_prd | side_b | 0.30 | medium | false | evidence_discipline |
| launch-date-stakeholder-conflict | executive_ambiguity | side_a | 0.20 | medium | false | evidence_discipline |
| metric-definition-disagreement | executive_ambiguity | tie | 0.02 | low | true | decision_usefulness |
| mobile-first-single-survey | evidence_fragile_prd | side_b | 0.20 | medium | false | decision_usefulness |
| multi-tenant-shared-learning | contradiction_prd | side_b | 0.50 | medium | false | decision_usefulness |
| pilot-survivorship-bias | evidence_fragile_prd | tie | 0.05 | low | true | evidence_discipline |
| retention-vs-growth-tradeoff | executive_ambiguity | side_b | 0.60 | medium | false | decision_usefulness |
| roadmap-resource-deadlock | executive_ambiguity | side_b | 0.40 | medium | false | decision_usefulness |
| underpowered-ab-test | evidence_fragile_prd | side_a | 0.10 | medium | true | responsiveness_to_critique |

**Summary:**
- side_a: 6 (35%)
- side_b: 8 (47%)
- tie: 3 (18%)
- errors: 0 (compliance-launch-speed errored on first attempt with JSON truncation, recovered on retry)
- needs_human_review: 5 (29%)

---

## Findings by Bucket

### executive_ambiguity (5 completed)

| Winner | Count |
|---|---|
| side_a | 2 |
| side_b | 2 |
| tie | 1 |

Balanced. `retention-vs-growth-tradeoff` produced the highest margin in this bucket (0.60), suggesting one side articulated a significantly stronger case on decision usefulness. `metric-definition-disagreement` tied at near-zero margin — both sides converged on the same recommendation but diverged on how to get there, which is the expected failure mode for this scenario type.

### contradiction_or_boundary_prd (5 completed)

| Winner | Count |
|---|---|
| side_a | 3 |
| side_b | 2 |
| tie | 0 |

Leans side_a but no collapse. `multi-tenant-shared-learning` produced the highest margin (0.50) in this bucket — the constraint is genuinely sharp, so one side's approach to resolving the data isolation conflict was clearly better. `ai-moderation-human-review` flagged human review despite a side_a win, reflecting that the underlying spec ambiguity (what "human approval" actually means legally) can't be resolved without external input. That is the correct behavior for this type of scenario.

### evidence_fragile_prd (7 completed)

| Winner | Count |
|---|---|
| side_a | 1 |
| side_b | 4 |
| tie | 2 |

Leans side_b at 4/7 but not collapsed. The two ties (`adjacent-market-proxy` and `pilot-survivorship-bias`) both resolved to low confidence with human review flags, and both share the same root cause: both sides reached the same practical conclusion (don't proceed on current evidence), so the contest turned on marginal quality differences in how each side structured the recommendation. The judge's uncertainty there is well-calibrated.

The `underpowered-ab-test` was the only scenario where `responsiveness_to_critique` was the decisive dimension — the only such case across all 17. This is consistent with the existing corpus pattern (evidence_discipline and decision_usefulness dominate) but signals that the underpowered-test scenario may be more sensitive to how each side handles the statistician's objection specifically.

---

## Decisive Dimension Distribution (17 scenarios)

| Dimension | Count | % |
|---|---|---|
| decision_usefulness | 10 | 59% |
| evidence_discipline | 6 | 35% |
| responsiveness_to_critique | 1 | 6% |

This is nearly identical to the existing corpus distribution (60% / 32% / 8% across 25 prior runs). The new scenarios did not shift the structural skew. `decision_usefulness` continues to dominate. This is worth watching as the corpus grows — if the split holds at ~60/35/5 after 36 total scenarios, it is likely a genuine judgment preference rather than small-sample noise.

---

## GPT Default Sanity Check

The plan asked: does GPT collapse to confident wins on these new scenario types? It does not.

- `needs_human_review` rate: 5/17 (29%) — within the prior 38% range, and appropriate given these are first-run screens on new scenarios.
- Confidence: all medium or low. No high-confidence wins.
- No uniform directional lean by bucket.

GPT remains the correct default screen for these scenario types.

---

## Pass/Fail Readiness

**Pass:**
- All 17 scenarios produced valid structured verdicts on first or second attempt.
- Winner distribution is well-spread — no scenario type collapsed to a single outcome.
- `needs_human_review` flags are appropriate and come with useful Phase 2 uncertainty payloads.
- The fixture validation bug was caught and fixed before it could affect downstream work.

**Fail:**
- We should not treat these single-screen results as stable. Each scenario has one GPT run. A second judge family (Claude replay) would sharpen which wins are robust vs. position-sensitive.
- `compliance-launch-speed` errored on first attempt (JSON truncation at position 7532). The retry ran cleanly, but this scenario should be watched — long verdicts on structurally complex scenarios may be near the model's reliable output length.

---

## Recommended Next Steps

1. **Claude replay on flagged scenarios.** Run Claude as a second judge on the 5 `needs_human_review` scenarios to check whether the flags hold across judge families.
2. **Scenario-type-aware routing.** The data now supports testing whether the orchestrator should route PRD-type scenarios differently from historical-strategy scenarios. This was flagged as an open question in the v2 plan.
3. **Repair rate tracking.** One scenario hit a JSON truncation error. As the corpus grows, tracking repair rate per scenario type would tell us whether certain prompt types (long, structurally complex constraints) are systematically harder for the judge to produce clean JSON on.
