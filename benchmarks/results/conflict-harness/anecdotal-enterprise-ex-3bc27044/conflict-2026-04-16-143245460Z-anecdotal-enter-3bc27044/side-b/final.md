# Revised artifact

## PRD: Enterprise Workflow Integration Decision and Validation Plan

### Product Requirement
Define a decision-ready path for an enterprise workflow integration requested by two customers representing 18% of ARR, while explicitly evaluating both build risk and cost-of-delay risk.

### Problem Statement
Two high-value customers in the same niche vertical have requested the same integration. That creates a credible commercial signal, but not yet a reliable basis for extrapolating a general enterprise platform need. The proposed investment is four months of platform engineering. The decision error is two-sided: the team could overbuild for a narrow use case, or delay too long and expose meaningful renewal or expansion revenue.

### Goal
Determine whether this request should be treated as:
- a generalized enterprise platform capability,
- a vertical-specific product need, or
- an account-specific accommodation,

and make that decision with explicit analysis of revenue-at-risk during any validation period.

### Non-Goals
- Do not approve a generalized platform build solely from two requests in one vertical.
- Do not assume validation is costless if the accounts face near-term renewal or escalation deadlines.
- Do not commit four months of platform capacity before comparing that path against narrower mitigations.

### Decision Frame
Recommendation: do not approve an immediate full platform build yet, but do run a time-boxed validation and retention-risk assessment with an explicit fast-track trigger.

Recommended operating rule:
- If renewal or churn exposure during the validation window is high and cannot be mitigated through service, roadmap commitments, or a limited workaround, escalate to an exception decision rather than treating validation-first as the default.
- If near-term revenue exposure is not acute, complete validation before authorizing platform investment.

This changes the decision from a false binary of "build now" versus "validate first" into a gated choice that tests both market generalizability and cost of delay.

### Requirements
#### Phase 1: Two-Track Validation
1. Customer track: interview the two requesting accounts to identify the exact blocked workflow, deadline, renewal timing, and acceptable interim mitigation.
2. Market track: test the same problem with additional enterprise accounts outside the originating vertical.
3. Commercial track: estimate retention risk, expansion upside, pipeline influence, and cost of delay over the validation window.
4. Solution track: compare four paths:
   - service/manual workaround,
   - limited customer-specific mitigation,
   - vertical-specific product feature,
   - generalized platform integration.
5. Engineering track: confirm whether four months includes hardening, dependencies, operational burden, and maintenance.

#### Phase 2: Conditional Delivery Planning
1. Approve generalized platform work only if evidence shows repeatable demand beyond the niche vertical or if concentrated revenue risk is large enough to justify an explicit exception.
2. Approve a narrower solution if value is real but concentrated in the originating vertical or specific accounts.
3. Use account-management and service mitigations if broader demand is weak and revenue can be protected without platform investment.

### Success Metrics
- Additional enterprise validation completed outside the current vertical
- Explicit classification of demand: cross-vertical, vertical-specific, or account-specific
- Quantified revenue-at-risk and cost-of-delay estimate for the validation period
- Decision memo comparing ROI and opportunity cost across all four solution paths

### Risks
- False generalization from two similar customers
- Underestimating churn risk during discovery
- Overbuilding a platform abstraction for a concentrated use case
- Hidden engineering scope beyond the nominal four-month estimate

### Unknowns & Evidence Gaps
- Whether the same workflow pain exists outside the current niche vertical
- Whether the two accounts have renewal or escalation dates that make delay materially dangerous
- Whether interim mitigations can protect the 18% ARR during validation
- Whether the request is truly platform-worthy versus better served as a narrower solution

### Pass/Fail Readiness
Pass if all are true:
- Broader demand is validated, or concentrated revenue risk is large enough to justify a documented exception
- Cost of delay has been estimated, not assumed away
- The selected solution shape is proportionate to the evidence
- Engineering confirms scope, dependencies, and opportunity cost

Fail if any are true:
- Demand remains anecdotal and concentrated with no exceptional revenue-risk case
- Delay risk is unknown because renewal timing and mitigation options were not assessed
- A lower-cost mitigation can credibly protect the accounts
- The platform build displaces higher-confidence work without sufficient return

### Recommended Next Artifact
A decision brief, not a standard execution PRD. It should contain:
- customer deadline and renewal-risk analysis,
- cross-vertical demand validation,
- cost-of-delay estimate,
- solution-path comparison,
- explicit recommendation: platform build, narrower feature, customer-specific mitigation, or no build.
