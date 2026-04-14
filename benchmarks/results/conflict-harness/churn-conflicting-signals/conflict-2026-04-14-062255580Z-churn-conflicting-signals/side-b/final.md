# Churn Reduction PRD: Navigating Conflicting Signals

## Decision Frame

**Problem statement:** Churn metrics are sending conflicting signals relative to current strategy targets. Usage-based leading indicators (e.g., DAU/MAU ratio, feature adoption depth) suggest improving engagement, yet trailing revenue indicators (net revenue retention, logo churn) show deterioration. This divergence means the organization cannot rely on a single signal to guide intervention — acting on the wrong signal risks either over-investing in retention for healthy cohorts or under-investing for silently churning ones.

**Decision to be made:** Should we (a) re-baseline our churn definition and measurement framework before launching any interventions, (b) launch targeted retention interventions against the trailing revenue signals while treating engagement metrics as lagging artifacts of prior cohort mix, or (c) run a time-boxed diagnostic to decompose the conflicting signals while simultaneously executing low-regret interventions that are warranted regardless of which signal is correct?

**Recommendation:** Option (c) — run a 4-week signal decomposition sprint AND concurrently authorize low-regret retention actions (CS outreach to accounts with upcoming renewals, health-score-triggered check-ins) that are defensible under either interpretation of the signals. The diagnostic resolves which cohorts need targeted, higher-cost interventions; the parallel low-regret actions ensure we are not fully idle on retention while diagnostics proceed.

**Stakes:** If churn is actually accelerating beneath misleading engagement metrics, each month of fully delayed intervention costs approximately 1-2% incremental ARR erosion (estimated from trailing 3-quarter trend). However, low-regret actions (CS outreach, renewal preparation) partially mitigate this downside even before diagnostics conclude. If engagement metrics are the true signal and revenue lag is a billing-cycle artifact, the low-regret actions still deliver value as standard customer success practice while avoiding premature high-cost interventions (win-back campaigns, pricing concessions) against the wrong cohorts.

**Who decides:** VP Product owns the go/no-go on diagnostic sprint scope. VP Customer Success owns low-regret intervention sequencing and has standing authority to execute standard CS playbook actions immediately. CFO has veto on retention spend above $X threshold.

## Unknowns & Evidence Gaps

| # | Unknown | Impact if unresolved | Proposed resolution | Timeline |
|---|---------|---------------------|---------------------|----------|
| U1 | Are engagement gains concentrated in expansion accounts while contraction/churn is concentrated in long-tail SMB? | Higher-cost interventions target wrong segment | Cohort decomposition: segment churn and engagement by ARR band, tenure, and plan tier | Week 1-2 |
| U2 | Is the revenue churn signal driven by downgrades (partial churn) or full logo losses? | Different playbooks required — save vs. expand | Decompose NRR into gross retention, expansion, and contraction components by cohort | Week 1 |
| U3 | Has the definition of "active user" drifted from the definition used when strategy targets were set? | Engagement metrics may be artifactually inflated by bot traffic, SSO pings, or broadened event taxonomy | Audit event taxonomy changes in last 2 quarters against baseline definition | Week 1-2 |
| U4 | What is the lag structure between engagement leading indicators and revenue outcomes for this product? | Without known lag, we cannot tell if engagement gains simply haven't flowed through yet — conflicting signals may reflect normal temporal offset rather than a measurement problem | Lag correlation analysis across prior 6 quarters of cohort data | Week 2-3 |
| U5 | Are conflicting signals an artifact of seasonality or a one-time event (e.g., large account loss, pricing change)? | A singular event masquerading as a trend would make systemic intervention wasteful | Isolate top-10 churned accounts and check for common external cause | Week 1 |
| U6 | Do CS health scores correlate with either signal, or are they independently predictive? | Determines whether CS early-warning system is trustworthy for triage and whether low-regret CS outreach is well-targeted | Backtest CS health scores against actual churn outcomes from last 4 quarters | Week 2-3 |

**Evidence we do NOT have and cannot fabricate:**
- Customer exit interview data with statistical power (most exit surveys have <15% response rate)
- Competitor win/loss attribution (sales anecdotes are not evidence)
- Causal relationship between any engagement metric and renewal probability (only correlations exist)
- Proof that the signal conflict is necessarily a measurement problem rather than a normal lag structure or localized cohort effect — this is a hypothesis to be tested, not a confirmed diagnosis

## Pass/Fail Readiness

**Verdict: NOT READY for high-cost targeted interventions. READY for diagnostic sprint AND concurrent low-regret retention actions.**

| Readiness criterion | Status | Rationale |
|---|---|---|
| Clear target cohort for high-cost intervention | FAIL | Cannot identify target cohort until U1 and U2 are resolved — acting on aggregate churn rate will spread expensive resources across healthy and unhealthy segments indiscriminately |
| Validated leading indicator | FAIL | Engagement metrics under suspicion (U3, U4) — cannot use them as success criteria for targeted interventions until audit completes |
| Known causal mechanism | FAIL | No evidence that any proposed targeted intervention addresses the actual churn driver — signals conflict precisely because we lack causal understanding |
| Bounded cost of delay on low-regret actions | PASS | Low-regret actions (CS outreach, renewal check-ins) can proceed immediately with no dependency on diagnostics — these are warranted under either signal interpretation |
| Bounded cost of diagnostic delay | PASS | 4-week diagnostic sprint risk is partially mitigated by concurrent low-regret actions; residual risk bounded at incremental ARR erosion from delayed high-cost interventions |
| Executive alignment on measurement | FAIL | VP Product and VP CS may be reading different dashboards with different churn definitions (U3) — alignment required before high-cost intervention design |
| Intervention options identified | PASS | Standard playbook exists (onboarding improvement, health-score-triggered CS outreach, at-risk pricing flexibility) — issue is targeting the high-cost options, not ideation |

**Go/no-go recommendation:** Approve 4-week diagnostic sprint. Immediately authorize VP CS to execute low-regret retention playbook (renewal outreach, health-score-triggered check-ins) in parallel. Block high-cost intervention design (win-back campaigns, pricing concessions, dedicated save teams) until sprint delivers cohort decomposition (U1, U2) and metric audit (U3). Escalate to CFO only if diagnostic reveals ARR erosion rate exceeds 3% monthly.

## Recommended Next Artifact

**Next artifact:** Diagnostic Sprint Plan (artifact type: execution brief)

**Contents should include:**
1. Sprint goal: Resolve unknowns U1-U5 with data, not opinion; explicitly test the hypothesis that signal conflict reflects measurement drift vs. normal lag vs. localized cohort effects
2. Parallel track: Low-regret CS retention actions with lightweight measurement to establish baseline for future comparison
3. Owner assignments: Data/analytics lead for cohort decomposition, product analytics for event taxonomy audit, CS ops for health score backtest and immediate outreach execution
4. Week-by-week milestones with explicit deliverables
5. Decision meeting at Week 4: present decomposed signals to VP Product + VP CS + CFO with recommendation to either (a) proceed to targeted intervention PRD for identified cohort, (b) re-baseline metrics and adjust strategy targets, or (c) escalate if signals remain unresolvable
6. Kill criteria: If diagnostic sprint cannot decompose the signal conflict with available data, escalate to board-level discussion about measurement infrastructure investment

**What this PRD intentionally does NOT do:**
- Prescribe specific high-cost retention interventions (premature without diagnostic)
- Set churn reduction targets (targets are meaningless if the metric definition is contested)
- Assume either signal is correct (the entire point is that we don't know yet)
- Block all action pending diagnosis — low-regret interventions proceed immediately

**Anti-patterns this PRD guards against:**
- Launching a "win-back campaign" because logo churn looks bad, when the actual problem is metric definition drift
- Celebrating engagement gains that mask revenue deterioration in a segment you're not watching
- Letting the conflict persist unresolved because each team cherry-picks the signal that supports their narrative
- Analysis paralysis: using diagnostic uncertainty as an excuse to take no action at all when low-regret options exist
