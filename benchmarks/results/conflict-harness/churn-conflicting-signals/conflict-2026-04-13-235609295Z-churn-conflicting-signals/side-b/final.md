# Revised artifact

# Churn Reduction PRD: Conflicting Signals vs Strategy Targets

## Decision Frame

**Decision needed:** Approve a churn-reduction initiative that acts on a structured conflict model instead of waiting for perfect signal certainty or optimizing aggregate churn.

**Scenario interpretation:** The case states that churn signals conflict with strategy targets. This PRD therefore assumes the operating problem is not absence of signal, but disagreement between signals that could push the team toward the wrong retention work. Example conflict patterns to resolve are: aggregate churn improves while target-segment churn worsens; usage rises while renewal intent falls; off-strategy accounts expand while target accounts contract; or customer-stated churn reasons conflict with observed behavior.

**Product goal:** Reduce preventable churn in the strategy-target customer segment while avoiding retention investments that make off-strategy segments look healthier at the expense of the company strategy.

**Primary customer:** Existing customers in the strategy-target segment with renewal, downgrade, or usage-risk indicators.

**Internal users:** Customer Success, Sales, Product, Support, and Finance teams that need one retention decision path when segment, usage, sentiment, and revenue signals disagree.

**Non-goals:**
- Do not optimize aggregate churn if the improvement is driven mainly by off-strategy customers.
- Do not use broad discounting as the default save motion.
- Do not turn every customer-stated churn reason into roadmap work without behavioral or commercial corroboration.
- Do not block all intervention until research is complete; act first where the conflict model gives a clear segment-aligned path.

**Core decision rule:** When signals conflict, prioritize the action that protects strategy-target customer retention and has corroborating evidence from at least two signal types: behavior, commercial data, direct customer feedback, or frontline account context.

**Requirements:**
1. Create a churn conflict dashboard that shows target-segment logo churn, target-segment revenue churn, contraction, product usage trend, renewal health, support burden, customer sentiment, and discount exposure.
2. Classify each at-risk account into one of four conflict states: target churn confirmed, off-strategy churn confirmed, ambiguous churn signal, or false-positive churn risk.
3. Route target churn confirmed accounts into driver-specific interventions: onboarding repair, workflow adoption help, executive stakeholder reset, support escalation, pricing or packaging review, or product-fit escalation.
4. Route off-strategy churn confirmed accounts into low-cost retention support unless the revenue risk crosses an executive exception threshold.
5. Route ambiguous churn signal accounts into a two-week diagnosis lane with a required save/no-save decision at the end.
6. Require a churn-driver evidence grade for every intervention: behavioral, commercial, customer-stated, frontline-entered, inferred, or unknown.
7. Require Product review only when the churn driver is repeated in target-segment accounts and is supported by behavioral or commercial evidence.
8. Require Finance approval for discounting when the proposed save motion changes gross margin or creates renewal precedent risk.
9. Run an 8-week pilot on at-risk accounts from the strategy-target segment, with a matched comparison group where operationally feasible.
10. Scale only the interventions that reduce target-segment churn or contraction without increasing off-strategy roadmap demand, excessive discounting, or CS time burden.

**Success metrics:**
- Target-segment logo churn decreases versus baseline.
- Target-segment revenue churn or contraction decreases versus baseline.
- At-risk target accounts receiving matched interventions renew or stabilize at a higher rate than comparable accounts.
- Product roadmap requests tied to off-strategy churn do not increase materially.

**Guardrail metrics:**
- Discount rate and gross margin impact.
- CS and Sales time per saved account.
- Off-strategy save volume.
- Support escalation load.
- Customer satisfaction after intervention.
- Roadmap capacity consumed by churn-driven work.

**Pilot scope:**
- Duration: 8 weeks.
- Population: strategy-target accounts with at least one churn-risk signal and enough account history to classify the conflict state.
- Operating cadence: weekly churn review with CS, Product, Finance, and GTM representation.
- Decision output: each reviewed account receives one of four dispositions: intervene now, diagnose for two weeks, low-cost support only, or no action.

## Unknowns & Evidence Gaps

- The case does not define the strategy-target segment, so the PRD uses a placeholder target segment that must be filled before execution.
- The exact conflicting signals are not specified, so the PRD frames a conflict taxonomy rather than naming one unsupported root cause.
- Baseline churn, contraction, discounting, and segment economics are not provided.
- It is unknown which churn drivers dominate in the strategy-target segment.
- It is unknown whether current churn reason tags are reliable enough to automate decisions.
- It is unknown whether a matched holdout is operationally feasible.

## Pass/Fail Readiness

**Ready to approve a churn-reduction pilot:** Pass. The PRD defines how to act on conflicting signals through segment priority, conflict-state classification, intervention routing, and guardrails.

**Ready to approve broad roadmap changes:** Conditional pass only for repeated target-segment churn drivers with behavioral or commercial corroboration. Otherwise fail.

**Ready to approve discounting or packaging changes:** Conditional pass only when pricing friction is supported by commercial evidence and Finance approves margin and precedent risk. Otherwise fail.

**Ready to scale across all customers:** Fail. Scaling must wait until the pilot shows target-segment retention improvement without off-strategy retention drag.

**Ready to stop or revise:** Pass if the pilot fails to improve target-segment retention, increases discount dependence, or shows that churn is concentrated outside the strategy target.

## Recommended Next Artifact

Create a pilot operating brief with the conflict-state taxonomy, dashboard fields, account review workflow, intervention decision tree, Finance approval thresholds, and scale/stop criteria. This should be an execution companion to the PRD, not a replacement for it.
