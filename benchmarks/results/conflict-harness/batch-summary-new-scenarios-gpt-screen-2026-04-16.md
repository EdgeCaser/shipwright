# Conflict Harness Batch Summary

Runs completed: 17
Errors: 1

## Run Results

| Scenario | Side A | Side B | Judge | Status | Winner | Margin | Confidence | Human Review | Disagreement | Declared | Revised |
|---|---|---|---|---|---|---|---|---|---|---|---|
 | adjacent-market-proxy | claude | gpt | gpt-judge | completed | tie | 0.00 | low | true | 0.25 | 1.00 | 1.00 | 
 | ai-moderation-human-review | claude | gpt | gpt-judge | completed | side_a | 0.20 | medium | true | 0.42 | 1.00 | 1.00 | 
 | anecdotal-enterprise-extrapolation | claude | gpt | gpt-judge | completed | side_b | 0.20 | medium | false | 0.17 | 1.00 | 1.00 | 
 | api-deprecation-customer-pressure | claude | gpt | gpt-judge | completed | side_b | 0.20 | medium | false | 0.25 | 1.00 | 1.00 | 
 | async-realtime-conflict | claude | gpt | gpt-judge | completed | side_a | 0.30 | medium | false | 0.50 | 1.00 | 1.00 | 
 | churn-correlation-causation | claude | gpt | gpt-judge | completed | side_a | 0.20 | medium | false | 0.50 | 1.00 | 1.00 | 
 | competitor-parity-no-demand | claude | gpt | gpt-judge | completed | side_b | 0.20 | medium | false | 0.75 | 1.00 | 1.00 | 
 | compliance-launch-speed | claude | gpt | gpt-judge | error | — | — | — | — | — | — | — | 
 | data-privacy-personalization | claude | gpt | gpt-judge | completed | side_b | 0.30 | medium | false | 0.25 | 1.00 | 1.00 | 
 | launch-date-stakeholder-conflict | claude | gpt | gpt-judge | completed | side_a | 0.20 | medium | false | 0.42 | 1.00 | 1.00 | 
 | metric-definition-disagreement | claude | gpt | gpt-judge | completed | tie | 0.02 | low | true | 0.75 | 1.00 | 1.00 | 
 | mobile-first-single-survey | claude | gpt | gpt-judge | completed | side_b | 0.20 | medium | false | 0.25 | 1.00 | 1.00 | 
 | multi-tenant-shared-learning | claude | gpt | gpt-judge | completed | side_b | 0.50 | medium | false | 0.33 | 1.00 | 1.00 | 
 | pilot-survivorship-bias | claude | gpt | gpt-judge | completed | tie | 0.05 | low | true | 0.17 | 1.00 | 1.00 | 
 | retention-vs-growth-tradeoff | claude | gpt | gpt-judge | completed | side_b | 0.60 | medium | false | 0.42 | 1.00 | 1.00 | 
 | roadmap-resource-deadlock | claude | gpt | gpt-judge | completed | side_b | 0.40 | medium | false | 0.17 | 1.00 | 1.00 | 
 | underpowered-ab-test | claude | gpt | gpt-judge | completed | side_a | 0.10 | medium | true | 0.33 | 1.00 | 1.00 | 

## Flagged Verdicts — Uncertainty Payload

These runs triggered the Phase 2 uncertainty payload. Each entry includes actionable routing guidance.

### adjacent-market-proxy
**Winner:** tie | **Confidence:** low | **Human review:** true

**Why uncertain:**
- The two artifacts converge on the same core recommendation, so the judgment turns on quality differences at the margin rather than substantive disagreement.
- Neither side had external evidence beyond the case packet, which limits how confidently fine-grained differences in evidence discipline and decision usefulness can be scored.
- The rubric mixes analytical rigor and artifact usefulness; Side B is stronger on the former while Side A is stronger on the latter, producing a near-balance.

**Questions to resolve:**
- In this harness, should a PRD be judged more heavily on analytical evidence discipline or on operational readiness and gating specificity?

**Evidence needed:**
- A weighting rule or tie-break policy clarifying whether decision-usefulness or evidence-discipline should dominate when both sides reach the same substantive recommendation.
- Examples from prior benchmark judgments showing how much specificity is expected in a validation-stage PRD versus a launch-stage refusal artifact.

**Next action:** Escalate this run for human tie-break review or rerun judgment with explicit rubric weights.

**Escalation:** Gather rubric-weighting guidance and rejudge; if unavailable, escalate to human review.

### ai-moderation-human-review
**Winner:** side_a | **Confidence:** medium | **Human review:** true

**Why uncertain:**
- The scenario provides no external evidence on what 'approve every removal decision' legally or operationally means.
- Neither side had jurisdiction-specific evidence for whether temporary containment satisfies the stated requirement.
- Both artifacts rely on prompt-level facts only, so several compliance and operating-model claims remain inferential.

**Questions to resolve:**
- Does 'human reviewer approves every removal decision' mean pre-removal authorization for any visibility restriction, or only for permanent removal?

**Evidence needed:**
- A written policy/legal interpretation of the approval requirement and whether temporary containment qualifies as removal.
- Operating-model data on flagged volume, severity mix, and whether a rapid-review lane is feasible within 60 seconds.

**Next action:** Escalate to legal, policy, and operations stakeholders to decide whether the spec will be enforced as written or formally rewritten before engineering proceeds.

**Escalation:** Gather targeted policy/legal evidence and then rejudge; keep human review in the loop for the final decision.

### metric-definition-disagreement
**Winner:** tie | **Confidence:** low | **Human review:** true

**Why uncertain:**
- The overall score gap is below the verdict threshold.
- Neither side had packet-level evidence for the actual three definitions, so both relied on inference about what finance, product, and growth likely mean.
- Side A made a consequential exclusion claim without direct support.
- Side B's recommendation depends on unresolved choices about value event and counted entity, limiting direct comparability against Side A's more concrete proposal.

**Questions to resolve:**
- What are the exact finance, product, and growth definitions currently in use, and how do they map to value realization, revenue recognition, and engagement reach?

**Evidence needed:**
- The literal current definitions used by finance, product, and growth.
- Historical backfill showing how the three definitions diverge over time.
- Evidence about which definition is most actionable, timely, stable, and predictive of durable value.
- Leadership's actual decision constraint: whether they need a permanent north star now or an explicitly interim reporting rule.

**Next action:** Run a rejudge after adding the exact three active-user definitions and any available backfill, because the current packet leaves too much inferred.

**Escalation:** Gather more evidence and rejudge; escalate to human review only if the exact metric definitions still do not materially separate the two artifacts.

### pilot-survivorship-bias
**Winner:** tie | **Confidence:** low | **Human review:** true

**Why uncertain:**
- The final score gap is below the minimum margin for verdict.
- Both artifacts are strong, structurally compliant, and converge on the same practical recommendation to block full rollout.
- The benchmark asks for a PRD, and reasonable judges could differ on whether Side A's analysis-heavy structure or Side B's more implementation-oriented structure better fits that contract.
- There is no external scoring-spec text in the packet to disambiguate how heavily to weight PRD form versus evidence rigor.

**Questions to resolve:**
- In this benchmark, should a stronger score favor the artifact that most rigorously interrogates the current evidence package, or the artifact that more directly specifies the next controlled rollout plan as a PRD?

**Evidence needed:**
- The detailed benchmark scoring guidance for how to trade off PRD form against analytical rigor.
- Any validator preference on whether the Recommended Next Artifact should be a scoping memo first or an experiment brief directly.
- Human adjudication on whether Side A's structure is acceptably PRD-like for this scenario.

**Next action:** Escalate this run for a human tie-break focused on artifact-type fit and the intended weighting of evidence rigor versus PRD operationalization.

**Escalation:** Escalate to human review, using the scoring spec to decide whether Side A's evidence-gating rigor or Side B's cleaner PRD framing better matches the benchmark objective.

### underpowered-ab-test
**Winner:** side_a | **Confidence:** medium | **Human review:** true

**Why uncertain:**
- The overall score gap is narrow and both final artifacts are strong.
- Neither side had actual quantitative power assumptions, confidence intervals, or business-value thresholds from the case packet.
- The operational feasibility of persistent holdout or safe partial exposure is unresolved in the source scenario.

**Questions to resolve:**
- Can this feature be expanded in stages with a valid persistent holdout and without systemwide effects that would undermine risk reduction or measurement quality?

**Evidence needed:**
- The data science team's actual power assumptions, minimum detectable effect, and confidence interval around the observed 6% lift.
- A concrete engineering assessment of whether partial exposure and rollback are technically feasible.
- A quantified estimate of the business cost of waiting versus the cost of a false-positive rollout.

**Next action:** Obtain joint analytics and engineering sign-off on the statistical frame and staged-rollout feasibility before approving any expansion beyond the current test.

**Escalation:** Gather the missing statistical and implementation evidence, then rejudge; use human review if leadership still wants immediate expansion without that evidence.

## Errors

- **compliance-launch-speed** (gpt-judge): Model output is not valid JSON: Unterminated string in JSON at position 7532 (line 5 column 7413)
