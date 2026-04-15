# Orchestrator Decision Spec

**Date:** 2026-04-15  
**Purpose:** Define how Shipwright should choose a judging mode, when it should recommend a second or third model, and how it should route results back to the user in a way that is reliable and usable.

## Summary

Shipwright should stop treating orchestration as a hidden implementation detail. It should actively advise the user on:

- which model to start with
- whether a single analysis is enough
- when to recommend a double panel
- when to escalate to a third-model judge
- when to stop chasing a winner and instead route toward evidence collection

The core product shift is:

- from "run one model and show a winner"
- to "choose an adjudication mode based on risk, confidence, and disagreement"

This spec adopts a staged panel policy:

1. start with a recommended single model for low-risk classes
2. if a single run comes back below the confidence threshold, recommend a double panel
3. if the double panel disagrees, escalate to a third-model judge
4. if the final verdict is still low-confidence or review-flagged, route to uncertainty-first follow-up instead of forcing convergence

## Product Goals

The orchestrator should optimize for:

- usable recommendations, not just completed runs
- explicit handling of uncertainty
- lower risk of overconfident single-model outputs
- clear user guidance about when more adjudication is worth the cost
- class-aware behavior rather than one global default

## Core Design Principle

The orchestrator should be proactive.

It should not wait for the user to know:

- which model family is safer for a given class
- when a second opinion is warranted
- when disagreement means "ask a judge"
- when even the judge should not be treated as final

Instead, it should recommend the next adjudication step automatically and explain why.

It should also be cost-aware and availability-aware:

- recommend the next step before spending more tokens
- ask for confirmation before launching another model or panel stage
- adapt its recommendation to the providers the user actually has access to

## Adjudication Modes

### Mode 1: Single Analysis

Use when:

- the scenario class is provisionally single-judge allowed
- the task is not intended for publication or external citation
- the user has not explicitly requested a panel

Output posture:

- present this as the fastest, cheapest path
- make clear that it is a provisional recommendation

### Mode 2: Double Panel

Use when:

- a single analysis returns below the confidence threshold
- or the scenario class is medium-risk and benefits from confirmation
- or the user explicitly asks for extra rigor without full panel cost

Output posture:

- present this as a disagreement / confirmation check
- explain that Shipwright is testing whether another family converges on the same recommendation
- ask for confirmation before running the second model

### Mode 3: Third-Model Judge

Use when:

- the double panel disagrees on winner
- or the scenario class is cross-family required
- or the task supports a publication-grade or externally cited claim

Output posture:

- present this as adjudication, not mere additional opinion
- explain that the third model is being used to evaluate the competing artifacts, not to generate another first-pass answer
- ask for confirmation before running the judge

### Mode 4: Uncertainty-First Routing

Use when:

- the final verdict is `low` confidence
- or `needs_human_review: true`
- or the uncertainty payload shows that the real blocker is missing evidence

Output posture:

- do not frame the result as "winner selected"
- frame it as "decision not ready yet; here is what would resolve it"

## Scenario-Class Defaults

### Governance / Board / Restructuring

Default mode:

- start at `double panel`, not single analysis

Rationale:

- this class is already marked single-judge unsafe
- recent evidence showed strong judge-family sensitivity

Escalation:

- if the first two models disagree, always escalate to a third-model judge
- if the judge returns low confidence or review flag, route to evidence gathering or a governance redesign artifact

### Pricing / Packaging

Default mode:

- start with `single analysis`

Rationale:

- likely more stable than governance
- lower cost of being directionally wrong
- still not fully calibrated, so caution remains appropriate

Escalation:

- if confidence is below threshold, recommend `double panel`
- if double panel disagrees, escalate to judge

### Product Strategy / Prioritization

Default mode:

- start with `single analysis`

Rationale:

- often benefits from speed and directional usefulness
- still judgment-heavy enough to justify panel escalation when confidence drops

Escalation:

- if confidence is below threshold, recommend `double panel`
- if double panel disagrees, escalate to judge

### Customer-Evidence Synthesis / Discovery

Default mode:

- start with `single analysis`, but bias toward uncertainty-aware output

Rationale:

- the main value is often missing-evidence identification rather than side selection

Escalation:

- if confidence is below threshold, recommend `double panel`
- if uncertainty payload triggers, prefer follow-up evidence collection over more winner-chasing

### Publication-Claim Work

Default mode:

- start at `double panel` or `triple panel`, depending on class risk

Rationale:

- publication changes the trust threshold

Escalation:

- require cross-family adjudication before externally meaningful claims

## Confidence Threshold Policy

For now, Shipwright should use an 80% threshold as the operational trigger for recommending a double panel.

Interpretation:

- `>= 80%`: single analysis may be sufficient if the class permits it and no review flag is raised
- `< 80%`: recommend a double panel

This should be treated as a product threshold, not a claim of calibrated statistical probability.

That matters because current confidence labels are ordinal and model-shaped, not yet proven as literal probabilities. The orchestrator can still use an "80% confidence" display or equivalent user-facing wording, but internally it should map to a normalized confidence band rather than assume perfect calibration.

Recommended temporary mapping:

- `high` confidence => treated as `>= 80%`
- `medium` confidence => treated as `60-79%`
- `low` confidence => treated as `< 60%`

If numeric confidence becomes available later, the orchestrator should preserve the same routing logic but use the true score.

## Panel Recommendation Logic

### Entry Rule

When a user starts a task, Shipwright should recommend an initial mode based on scenario class and intended use:

- low-risk, non-publication classes: recommend `single analysis`
- governance or publication-sensitive classes: recommend `double panel`

### Single-To-Double Rule

If a single analysis returns:

- below 80% confidence
- or `needs_human_review: true`
- or uncertainty payload present

then Shipwright should recommend:

- "Run a double panel"

Suggested user-facing explanation:

- "This result is directionally useful, but not yet reliable enough to stand alone. A second model can test whether the recommendation converges across families."
- "Run the double panel?" should be an explicit confirmation step, not an automatic spend

### Double-To-Judge Rule

If a double panel returns:

- same winner from both models
- no review flags
- acceptable confidence

then Shipwright may present:

- "Panel converged"

If a double panel returns:

- winner disagreement
- materially different rationale
- one or both models flagged review

then Shipwright should recommend:

- "Escalate to a judge"

Suggested user-facing explanation:

- "The panel did not converge. A third-model judge can evaluate the competing artifacts directly."
- "Escalate to a judge?" should be an explicit confirmation step, not an automatic spend

### Judge-To-Uncertainty Rule

If the judge returns:

- `judge_confidence: low`
- or `needs_human_review: true`
- or uncertainty payload indicating missing evidence

then Shipwright should not keep recursively paneling.

It should instead say:

- "The system is not ready to force a winner."
- "Here is the missing evidence or follow-up artifact needed next."

## Recommended Model Roles

Shipwright should recommend roles, not just raw model names.

### First-Pass Analyst

Purpose:

- generate the first recommendation quickly

Recommended use:

- single-analysis mode
- first seat in a double panel

### Second Opinion

Purpose:

- test whether another model family converges on the same outcome

Recommended use:

- second seat in a double panel

Design rule:

- prefer a different model family from the first-pass analyst

### Judge

Purpose:

- evaluate the two competing artifacts or panel outputs

Recommended use:

- third stage after disagreement
- first stage for high-risk, cross-family-required adjudication workflows only if the underlying artifacts already exist

Design rule:

- judge should ideally come from a third family when available

## Provider Availability Policy

Shipwright should not assume every user has access to GPT, Claude, and Gemini.

The orchestrator should detect or be configured with:

- available providers
- unavailable providers
- temporary provider outages

Recommendations should then adapt to the reachable set.

### If only one provider is available

Shipwright should:

- allow single-analysis mode
- clearly mark that cross-family confirmation is unavailable
- avoid pretending that a panel recommendation can be fulfilled
- lean harder on uncertainty routing, review flags, and follow-up artifacts

For cross-family-required classes, Shipwright should say:

- "A more reliable cross-family check is recommended, but only one provider is currently available."
- "Treat this as provisional and do not use it as a publication-grade conclusion."

### If two providers are available

Shipwright should:

- allow a double panel
- use disagreement to trigger a recommendation for a judge only if a third provider is actually available

If no third provider is available, Shipwright should say:

- "The panel disagreed, but no third judge family is available."
- "Treat this as unresolved and route to evidence gathering or human review."

### If three providers are available

Shipwright should:

- support the full single -> double -> judge escalation path
- prefer a third family for adjudication rather than reusing one of the panel families

### If a provider is temporarily down

Shipwright should distinguish:

- structural lack of access
- temporary service outage or capacity issue

That matters because the user-facing recommendation is different:

- if the provider is not part of the user's plan, suggest the best available fallback
- if the provider is temporarily unavailable, suggest retrying later or continuing with a weaker-confidence path

## Recommended Initial Model Guidance

Shipwright should expose recommendations like:

- "Fastest path: single GPT analysis"
- "Safer path: GPT + Gemini double panel"
- "Governance mode: start with a cross-family panel"
- "Only two providers available, so Shipwright can run a double panel but not a third-family judge"

The recommendation should be based on:

- scenario class
- intended use
- cost / latency tolerance
- provider availability
- whether this is exploratory work or publication-sensitive work

The product should advise, but still allow the user to override.

## UX States

The orchestrator should map results into a small set of user-facing states.

### 1. Provisional Recommendation

Conditions:

- class permits single use
- confidence at or above threshold
- no review flag

Display priority:

1. recommendation
2. confidence
3. optional note that this is the best current adjudication

### 2. Recommend Double Panel

Conditions:

- single analysis below threshold
- or review flag
- or uncertainty payload triggered

Display priority:

1. current lean
2. why it is not strong enough alone
3. button / action to run a double panel
4. note that this will use an additional provider / tokens

### 3. Panel Converged

Conditions:

- two models agree
- no major review flags
- confidence acceptable

Display priority:

1. converged recommendation
2. note that two families aligned
3. whether additional judging is optional or required by class

### 4. Escalate To Judge

Conditions:

- panel disagreement
- or class requires adjudication

Display priority:

1. disagreement summary
2. why a judge is appropriate
3. button / action to run adjudication
4. note that this will use an additional provider / tokens, if available

### 5. Not Ready / Gather More Evidence

Conditions:

- low-confidence judge
- review-flagged final verdict
- uncertainty payload identifies specific missing evidence

Display priority:

1. decision not ready
2. uncertainty drivers
3. recommended next artifact
4. recommended next action

## Minimal Routing Algorithm

1. Determine scenario class.
2. Detect which providers are available.
3. Check whether the class is `single-judge allowed` or `cross-family required`.
4. Recommend initial mode.
5. Ask for confirmation before any additional panel stage that increases token spend.
6. If a single analysis is run and confidence is below threshold, recommend double panel if a second provider is available.
7. If the double panel disagrees, recommend judge escalation only if a third provider is available.
8. If the judge returns low confidence or review flag, stop adjudicating and route to uncertainty-first follow-up.

## Why This Is The Right First Product Move

This design gives Shipwright the biggest immediate usability win because it:

- reduces false confidence from single-model outputs
- makes paneling legible and intentional
- uses the uncertainty payload as product value rather than exception handling
- does not require solving global judge ranking first

It also creates a better path for future learning. Once this is live, Shipwright can measure:

- how often single analyses trigger panel recommendations
- how often double panels converge
- which classes most often escalate to judge
- whether users find the uncertainty-first outcome useful

That data is more actionable than more abstract model debate.

## Open Product Questions

- Should the 80% threshold be global at first, or vary by class from the start?
- Should a review flag automatically override high confidence?
- When a class is cross-family required, should Shipwright ever offer a one-click single-analysis "fast preview" anyway?

One question now appears resolved for V1:

- Shipwright should ask for confirmation before any additional token-spending stage beyond the user's current run

## Recommended V1 Policy

For V1:

- governance / publication-sensitive work starts with double panel
- other classes start with single analysis
- below 80% confidence triggers a recommendation for double panel
- double-panel disagreement triggers judge escalation
- every extra stage requires explicit user confirmation before spend
- recommendations must degrade gracefully when only one or two providers are available
- low-confidence or review-flagged judge verdict triggers uncertainty-first follow-up
- `needs_human_review` outranks winner label

This is simple enough to implement now and strong enough to make the UX meaningfully safer.

## Decision Frame

Shipwright should implement proactive orchestration guidance now. The biggest product win is not better hidden model selection, but a visible adjudication policy that tells the user when to trust a single run, when to add a second model, and when to stop forcing convergence.

## Unknowns & Evidence Gaps

- whether 80% is the best initial threshold across all classes
- whether users prefer automatic escalation or explicit confirmation between panel stages
- whether confidence labels map cleanly enough to normalized thresholds for stable routing
- which non-governance classes will ultimately justify single-analysis defaults

## Pass/Fail Readiness

Pass:

- enough evidence exists to justify a staged single -> double -> judge policy
- enough evidence exists to mark governance as a double-panel-by-default class
- enough evidence exists to use uncertainty-first routing as the terminal state for unresolved cases

Fail:

- not enough evidence exists to claim that the 80% threshold is fully calibrated
- not enough evidence exists to finalize class-specific policies beyond governance without more calibration

## Recommended Next Artifact

Produce a short **orchestrator implementation plan** that translates this policy into:

- UI states
- backend routing rules
- model-role selection defaults
- telemetry needed to learn whether the policy is working
