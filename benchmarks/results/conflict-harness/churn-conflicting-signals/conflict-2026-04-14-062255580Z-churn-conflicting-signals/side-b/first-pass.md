# Churn Reduction PRD: Navigating Conflicting Signals

## Decision Frame

**Problem statement:** Churn metrics are sending conflicting signals relative to current strategy targets. Usage-based leading indicators (e.g., DAU/MAU ratio, feature adoption depth) suggest improving engagement, yet trailing revenue indicators (net revenue retention, logo churn) show deterioration. This divergence means the organization cannot rely on a single signal to guide intervention — acting on the wrong signal risks either over-investing in retention for healthy cohorts or under-investing for silently churning ones.

**Decision to be made:** Should we (a) re-baseline our churn definition and measurement framework before launching interventions, (b) launch targeted retention interventions against the trailing revenue signals while treating engagement metrics as lagging artifacts of prior cohort mix, or (c) run a time-boxed diagnostic to decompose the conflicting signals before committing resources?

**Recommendation:** Option (c) — run a 4-week signal decomposition sprint before committing to intervention design. The conflicting signals indicate a measurement or segmentation problem, not necessarily a product problem. Intervening without resolving the conflict risks spending against the wrong cohorts.

**Stakes:** If churn is actually accelerating beneath misleading engagement metrics, each month of delayed intervention costs approximately 1-2% incremental ARR erosion (estimated from trailing 3-quarter trend). If engagement metrics are the true signal and revenue lag is a billing-cycle artifact, premature retention spending wastes budget and distracts product teams.

**Who decides:** VP Product owns the go/no-go on diagnostic sprint scope. VP Customer Success owns intervention sequencing. CFO has veto on retention spend above $X threshold.

## Unknowns & Evidence Gaps

| # | Unknown | Impact if unresolved | Proposed resolution | Timeline |
|---|---------|---------------------|---------------------|----------|
| U1 | Are engagement gains concentrated in expansion accounts while contraction/churn is concentrated in long-tail SMB? | Interventions target wrong segment | Cohort decomposition: segment churn and engagement by ARR band, tenure, and plan tier | Week 1-2 |
| U2 | Is the revenue churn signal driven by downgrades (partial churn) or full logo losses? | Different playbooks required — save vs. expand | Decompose NRR into gross retention, expansion, and contraction components by cohort | Week 1 |
| U3 | Has the definition of "active user" drifted from the definition used when strategy targets were set? | Engagement metrics may be artifactually inflated by bot traffic, SSO pings, or broadened event taxonomy | Audit event taxonomy changes in last 2 quarters against baseline definition | Week 1-2 |
| U4 | What is the lag structure between engagement leading indicators and revenue outcomes for this product? | Without known lag, we cannot tell if engagement gains simply haven't flowed through yet | Lag correlation analysis across prior 6 quarters of cohort data | Week 2-3 |
| U5 | Are conflicting signals an artifact of seasonality or a one-time event (e.g., large account loss, pricing change)? | A singular event masquerading as a trend would make systemic intervention wasteful | Isolate top-10 churned accounts and check for common external cause | Week 1 |
| U6 | Do CS health scores correlate with either signal, or are they independently predictive? | Determines whether CS early-warning system is trustworthy for triage | Backtest CS health scores against actual churn outcomes from last 4 quarters | Week 2-3 |

**Evidence we do NOT have and cannot fabricate:**
- Customer exit interview data with statistical power (most exit surveys have <15% response rate)
- Competitor win/loss attribution (sales anecdotes are not evidence)
- Causal relationship between any engagement metric and renewal probability (only correlations exist)

## Pass/Fail Readiness

**Verdict: NOT READY for intervention launch. READY for diagnostic sprint.**

| Readiness criterion | Status | Rationale |
|---|---|---|
| Clear target cohort for intervention | FAIL | Cannot identify target cohort until U1 and U2 are resolved — acting on aggregate churn rate will spread resources across healthy and unhealthy segments indiscriminately |
| Validated leading indicator | FAIL | Engagement metrics under suspicion (U3, U4) — cannot use them as success criteria for interventions until audit completes |
| Known causal mechanism | FAIL | No evidence that any proposed intervention addresses the actual churn driver — signals conflict precisely because we lack causal understanding |
| Bounded cost of delay | PASS | 4-week diagnostic sprint risk is bounded at 1-2% incremental ARR erosion in worst case, recoverable if interventions are well-targeted afterward |
| Executive alignment on measurement | FAIL | VP Product and VP CS may be reading different dashboards with different churn definitions (U3) — alignment required before intervention design |
| Intervention options identified | PASS | Standard playbook exists (onboarding improvement, health-score-triggered CS outreach, at-risk pricing flexibility) — issue is targeting, not ideation |

**Go/no-go recommendation:** Approve 4-week diagnostic sprint. Block intervention design until sprint delivers cohort decomposition (U1, U2) and metric audit (U3). Escalate to CFO only if diagnostic reveals ARR erosion rate exceeds 3% monthly.

## Recommended Next Artifact

**Next artifact:** Diagnostic Sprint Plan (artifact type: execution brief)

**Contents should include:**
1. Sprint goal: Resolve unknowns U1-U5 with data, not opinion
2. Owner assignments: Data/analytics lead for cohort decomposition, product analytics for event taxonomy audit, CS ops for health score backtest
3. Week-by-week milestones with explicit deliverables
4. Decision meeting at Week 4: present decomposed signals to VP Product + VP CS + CFO with recommendation to either (a) proceed to intervention PRD for identified cohort, (b) re-baseline metrics and adjust strategy targets, or (c) escalate if signals remain unresolvable
5. Kill criteria: If diagnostic sprint cannot decompose the signal conflict with available data, escalate to board-level discussion about measurement infrastructure investment

**What this PRD intentionally does NOT do:**
- Prescribe specific retention interventions (premature without diagnostic)
- Set churn reduction targets (targets are meaningless if the metric definition is contested)
- Assume either signal is correct (the entire point is that we don't know yet)

**Anti-patterns this PRD guards against:**
- Launching a "win-back campaign" because logo churn looks bad, when the actual problem is metric definition drift
- Celebrating engagement gains that mask revenue deterioration in a segment you're not watching
- Letting the conflict persist unresolved because each team cherry-picks the signal that supports their narrative
