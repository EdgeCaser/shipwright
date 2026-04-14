# Revised artifact

# Churn Reduction PRD: Bounded Diagnosis With Mandatory Intervention Gates

## Problem
The team needs to reduce churn while the available signals conflict with strategy targets. The case packet provides no churn baseline, segment breakdown, strategy metric, customer evidence, telemetry, or prior intervention results. That evidence gap means this PRD cannot responsibly prescribe a single permanent churn fix. It also cannot stop at research. The product decision is therefore to run a time-boxed diagnostic window that must convert into targeted action, a stop decision, or an explicit strategy escalation.

## Goal
Reduce avoidable churn in the strategically prioritized customer segment by identifying the highest-confidence churn pattern within a bounded window and launching a matched intervention without waiting for perfect attribution.

## Non-Goals
- Do not optimize aggregate churn if the strategy target is strategic-account retention, GRR, NRR, ICP retention, or margin-adjusted retention.
- Do not ship broad discounting, blanket roadmap commitments, or one-off rescue workflows without segment guardrails.
- Do not allow diagnosis to continue indefinitely after the decision gates below are reached.

## Target Users
Primary users are customers in the strategic retention segment, defined before launch as the segment tied to the current company strategy target. Examples include high-fit accounts, expansion-ready accounts, enterprise accounts, or customers aligned with the current ICP.

Secondary users are Customer Success, Sales, Support, Product Operations, and Product teams responsible for detecting and acting on churn risk.

## Requirements

### 1. Strategy Target Lock
Before any intervention is launched, the team must pick exactly one primary retention target for this PRD cycle: strategic-segment logo retention, strategic-segment GRR, strategic-segment NRR, ICP retention, or margin-adjusted retention.

If the executive owner cannot select a target within 5 business days, the default target for this cycle is strategic-segment GRR, because it focuses the work on retained revenue before expansion effects.

### 2. Ten-Business-Day Diagnostic Window
The team will run a 10-business-day diagnostic window, not an open-ended research phase. During this window, the team must produce:

- Segment-level churn baseline for strategic and non-strategic customers.
- Churn reason taxonomy with source labels: customer-stated reason, product telemetry, account-health signal, support signal, sales or renewal context, and commercial context.
- Top three churn hypotheses ranked by revenue exposure in the strategic segment, evidence strength, reversibility, and intervention speed.
- At-risk account list for the next renewal or usage-risk window.

If complete data is unavailable by day 10, the team must proceed using the best available segment proxy and mark confidence as low rather than extending diagnosis by default.

### 3. Prioritization Heuristic
Rank churn hypotheses using this scoring model:

- Strategic revenue exposure: 40%.
- Evidence strength across at least two signal types: 25%.
- Speed to test within 30 days: 20%.
- Reversibility and operational cost: 15%.

The highest-scoring hypothesis becomes the primary intervention unless it would primarily retain non-strategic customers or require an irreversible roadmap, pricing, or contract change.

### 4. Mandatory Intervention Gates
The diagnostic phase must convert into one of these decisions by business day 11:

- Launch an activation intervention if the leading strategic-segment signal is failed onboarding, low activation milestone completion, or slow time-to-value.
- Launch a value-realization intervention if the leading signal is usage without perceived ROI, stakeholder disengagement, or weak success-plan adoption.
- Launch a support or reliability intervention if churn risk concentrates in unresolved support issues, service quality, implementation blockers, or reliability incidents.
- Launch a commercial intervention if churn risk concentrates in packaging mismatch, renewal friction, downgrade need, or budget pressure, with discounting tracked as a guardrail.
- Escalate strategy fit if churn concentrates in low-fit accounts and strategic-segment churn is stable.

The team may choose no intervention only if strategic-segment churn is stable against the chosen target and the churn exposure is concentrated outside the strategic segment.

### 5. Intervention Playbook
Each intervention must include target segment, trigger, owner, customer action, internal action, measurement window, expected leading indicator, and rollback condition.

Initial intervention options:

- Activation gap: guided onboarding, milestone nudges, implementation support, and executive sponsor follow-up for strategic accounts stuck before first value.
- Value realization gap: ROI recap, success-plan reset, stakeholder mapping, and use-case expansion path.
- Product capability gap: workaround, beta eligibility, or roadmap escalation only when corroborated by strategic revenue exposure and at least one non-verbatim signal.
- Commercial gap: packaging review, downgrade path, renewal restructuring, or discount exception with finance-approved guardrails.
- Low-fit acquisition gap: ICP qualification update and handoff to GTM rather than a product retention rescue.

### 6. Measurement
Primary metric: the selected strategy target for the strategic segment.

Default primary metric if no target is selected by day 5: strategic-segment GRR.

Secondary metrics:

- Activation milestone completion.
- Renewal save rate for strategic accounts.
- Product-qualified retention risk.
- Support resolution time for at-risk strategic accounts.
- Retention persistence through the next renewal cycle.

Guardrails:

- Discount dependency.
- Retention of low-fit accounts at the expense of strategic accounts.
- Support burden.
- Roadmap distortion.
- Short-term save rate that reverses at renewal.

## Decision Frame
Decision to make: Should the team launch broad churn reduction, continue diagnosis, or commit to a targeted churn intervention under uncertainty?

Recommendation: Do not launch a broad churn motion. Run the 10-business-day diagnostic window, then force a business-day-11 decision using the gates in this PRD. The default outcome should be a targeted intervention, not more analysis, unless the evidence shows strategic-segment churn is stable and churn is concentrated outside the strategic segment.

Decision criteria:

- If strategic-segment churn is worse than the selected strategy target, launch the highest-scoring matched intervention by business day 11.
- If aggregate churn is high but strategic-segment churn is stable, do not launch broad retention work unless it materially affects acquisition efficiency, brand, support economics, or future ICP quality.
- If customer-stated churn reasons conflict with telemetry or account-health signals, select the intervention with the highest combined score across strategic revenue exposure and evidence strength.
- If churn is concentrated in low-fit customers, revise ICP, qualification, onboarding fit checks, or packaging rather than treating churn as a general product failure.
- If evidence remains incomplete after 10 business days, choose the reversible intervention with the largest strategic-segment exposure rather than extending diagnosis.

## Unknowns & Evidence Gaps
- No churn baseline is provided.
- No strategic target is defined.
- No segment-level churn data is provided.
- No customer verbatims, support themes, cancellation survey data, renewal data, win/loss notes, or product telemetry are provided.
- No evidence is provided on whether churn is voluntary, involuntary, budget-driven, competitive, implementation-driven, support-driven, or product-fit-driven.
- No data is provided on prior retention interventions.

These gaps lower confidence, but they do not block action after the diagnostic window. They determine which intervention is safest and how aggressively to roll it out.

## Pass/Fail Readiness
Pass if:

- A primary strategy target is selected by business day 5 or defaults to strategic-segment GRR.
- A strategic retention segment is identified by business day 5.
- Segment-level churn baseline or a documented proxy exists by business day 10.
- Top churn hypotheses are ranked using the prioritization heuristic.
- A matched intervention is selected by business day 11.
- The intervention has a 30-day leading-indicator check and a renewal-cycle persistence check.

Fail if:

- The team still has only aggregate churn by business day 10 and refuses to use a proxy.
- The strategy owner rejects the default target without naming an alternative.
- The proposed fix is based on one evidence source and would create irreversible roadmap, pricing, or contract commitments.
- The intervention primarily retains non-strategic customers while consuming capacity needed for strategic customers.
- Success is measured only by short-term save rate without renewal-cycle persistence.

Kill criteria:

- Stop the intervention if guardrail breach exceeds the pre-agreed tolerance for discounting, support burden, or low-fit retention.
- Stop the intervention if the 30-day leading indicator does not move and qualitative review shows no plausible mechanism for delayed impact.
- Stop the intervention if new evidence shows the targeted churn pattern is not present in the strategic segment.

## Launch Plan
Phase 1: Target and evidence lock, business days 1-5.

- Name the executive owner for the retention strategy target.
- Select the primary metric or accept strategic-segment GRR as the default.
- Define the strategic retention segment.
- Pull churn, revenue, usage, support, and renewal signals for strategic and non-strategic customers.

Phase 2: Diagnostic scoring, business days 6-10.

- Normalize churn reasons into the evidence model.
- Rank the top three hypotheses using the prioritization heuristic.
- Identify at-risk strategic accounts and the fastest reversible intervention.

Phase 3: Intervention commitment, business day 11.

- Commit to one targeted intervention, one owner, one measurement window, and one rollback condition.
- Launch to a targeted cohort or matched comparison group where feasible.
- Review leading indicators at 30 days and persistence at the next renewal cycle.

## Recommended Next Artifact
Create a churn evidence brief and intervention scorecard with the selected strategy target, strategic segment definition, baseline or proxy baseline, ranked hypotheses, chosen intervention, owner, 30-day leading indicator, guardrails, and renewal-cycle persistence check.
