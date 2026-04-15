# Orchestrator Decision Spec

**Date:** 2026-04-15  
**Purpose:** Define how Shipwright should act as a user decision aid: choosing a judging mode, recommending when to add rigor, and routing results back in a way that helps the user decide what to do next.

**Scope note:** This spec covers Rigor Mode only. For mode selection and Fast Mode definition, see `two-mode-spec-2026-04-15.md`.

## Summary

Shipwright should actively advise the user on:

- which model to start with
- whether a single analysis is enough
- when to recommend a double panel
- when to escalate to a third-model judge
- when to stop chasing a winner and instead route toward evidence collection

The core product shift is:

- from "run one model and show a winner"
- to "help the user decide what to trust, what to re-run, and what evidence is missing"

This spec adopts a staged panel policy:

1. start with a recommended single model for lower-risk work
2. if a single run comes back below the internal routing threshold, recommend a double panel
3. if the double panel disagrees, escalate to a third-model judge when available
4. if the final verdict is still low-confidence, review-flagged, or directionally incoherent, route to uncertainty-first follow-up instead of forcing convergence

The top-level UX should stay simple:

- `provisional`
- `more_rigor_recommended`
- `not_ready`

Substates should remain accessible on demand so users can see why a result landed there.

## Core Design Principle

The orchestrator should be proactive, cost-aware, and availability-aware.

It should:

- recommend the next adjudication step automatically and explain why
- ask for confirmation before launching another model or panel stage
- adapt its recommendation to the providers the user actually has access to

## Scenario-Class Defaults

Only governance is policy-backed in V1. All non-governance classes should be encoded as provisional in config until calibration data exists.

### Governance / Board / Restructuring

Default mode:

- start at `double panel`, not single analysis

V1 config note:

- `provisional: false`
- `cross_family_required: true`

### Pricing / Packaging

Default mode:

- start with `single analysis`

V1 config note:

- `provisional: true`

### Product Strategy / Prioritization

Default mode:

- start with `single analysis`

V1 config note:

- `provisional: true`

### Customer-Evidence Synthesis / Discovery

Default mode:

- treat as `unclassified` for V1 unless explicit routing criteria are added

V1 config note:

- either collapse this into product strategy or mark it `provisional: true` with explicit classification criteria before shipping

### Publication-Claim Work

Default mode:

- start at `double panel` or `triple panel`, depending on class risk

## Confidence Threshold Policy

Shipwright should use an internal routing threshold equivalent to 80% as the trigger for recommending a double panel.

This is an internal routing rule, not a calibrated statistical probability.

The orchestrator should not display numeric confidence percentages to users in V1. It should use normalized internal routing bands and user-facing labels like `high`, `medium`, and `low`.

Recommended temporary mapping:

- `high` confidence => above routing threshold
- `medium` confidence => below routing threshold
- `low` confidence => well below routing threshold

## Panel Recommendation Logic

### Single-To-Double Rule

If a single analysis returns:

- below the internal routing threshold
- or `needs_human_review: true`
- or uncertainty payload present

then Shipwright should recommend:

- "Run a double panel"

If the user declines:

- preserve the stronger-path recommendation visibly
- keep the result in `provisional` or `not_ready` depending on the existing readiness signals
- attach substate `user_declined_escalation`

### Double-To-Judge Rule

If a double panel returns:

- the same winner from both models
- no review flags
- acceptable confidence

then Shipwright may treat the result as:

- top-level state `provisional`
- substate `panel_converged`

If a double panel returns disagreement, materially different rationale, or review flags, Shipwright should recommend:

- "Escalate to a judge"

If no third provider is available, Shipwright should say:

- "The panel disagreed, but no third judge family is available."
- "This is not just low confidence; the system found no stable direction with the providers currently available."
- "Treat this as unresolved and route to evidence gathering or human review."

### Judge-To-Uncertainty Rule

If the judge returns:

- `judge_confidence: low`
- or `needs_human_review: true`
- or uncertainty payload indicating missing evidence

then Shipwright should not keep recursively paneling.

If the judge disagrees directionally with both panel models, Shipwright should treat that as:

- top-level state: `not_ready`
- substate: `directionally_incoherent`

Suggested explanation:

- "The models did not converge on a stable direction."
- "This is not a close call between two options; it is a sign that the current evidence and framing do not support a reliable adjudication."

## Provider Availability Policy

Shipwright should not assume every user has access to GPT, Claude, and Gemini.

Recommendations should adapt to:

- available providers
- unavailable providers
- temporary provider outages

If only one provider is available:

- allow single-analysis mode
- clearly mark that cross-family confirmation is unavailable
- avoid pretending that a panel recommendation can be fulfilled

If two providers are available:

- allow a double panel
- if the panel disagrees and no third provider is available, route to `not_ready`

If three providers are available:

- support the full single -> double -> judge escalation path

## UX States

The orchestrator should map results into three top-level user-facing states, with accessible substates that explain why the system landed there.

### 1. Provisional

Common substates:

- `single_run_acceptable`
- `panel_converged`
- `user_declined_escalation`

### 2. More Rigor Recommended

Common substates:

- `double_panel_recommended`
- `judge_recommended`
- `cross_family_required`

### 3. Not Ready

Common substates:

- `needs_more_evidence`
- `limited_provider_availability`
- `directionally_incoherent`
- `user_declined_escalation`

In unresolved cases, the uncertainty payload should be treated as primary output rather than as a secondary explanation.

## Minimal Routing Algorithm

1. Determine scenario class.
2. Detect which providers are available.
3. Check whether the class is `single_judge_allowed` or `cross_family_required`.
4. Recommend initial mode.
5. Ask for confirmation before any additional panel stage that increases token spend.
6. If a single analysis is run and confidence is below threshold, recommend double panel if a second provider is available.
7. If the user declines escalation, preserve that as an inspectable substate.
8. If the double panel disagrees, recommend judge escalation only if a third provider is available.
9. If no third provider is available, route to `not_ready` with a clear unresolved-disagreement explanation.
10. If the judge returns low confidence, review flag, or directional incoherence, stop adjudicating and route to uncertainty-first follow-up.

## Recommended V1 Policy

For V1:

- governance / publication-sensitive work starts with double panel
- non-governance classes remain provisional or unclassified unless explicitly marked otherwise in config
- below-threshold single analyses trigger a recommendation for double panel
- double-panel disagreement triggers judge escalation when available
- every extra stage requires explicit user confirmation before spend
- recommendations must degrade gracefully when only one or two providers are available
- low-confidence, review-flagged, or directionally incoherent final outcomes trigger `not_ready`
- `needs_human_review` outranks winner label

## Decision Frame

Shipwright should implement proactive orchestration guidance now. The biggest product win is not better hidden model selection, but a visible adjudication policy that tells the user when to trust a single run, when to add a second model, and when to stop forcing convergence.
