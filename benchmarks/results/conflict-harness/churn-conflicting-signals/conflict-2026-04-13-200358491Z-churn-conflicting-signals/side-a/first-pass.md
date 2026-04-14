# Churn Reduction PRD: Navigating Conflicting Signals

## Decision Frame

**Problem statement:** Churn metrics are sending conflicting signals relative to strategic growth targets. Specifically, leading indicators (e.g., engagement frequency, feature adoption depth) suggest improving health, while lagging indicators (e.g., logo churn rate, net revenue retention) show deterioration. This divergence makes it unsafe to commit resources to either a retention-first or acquisition-first strategy without resolving which signal set reflects ground truth.

**Decision to be made:** Should we invest in a retention intervention program now based on lagging churn indicators, or hold pending further investigation into why leading indicators contradict the churn trend?

**Stakeholders:** Product (owns intervention design), Growth (owns acquisition targets that compete for resources), Finance (owns NRR forecasts), CS (owns at-risk account management).

**Strategic context:** Current strategy targets 130% NRR and 20% logo growth. These targets were set assuming churn would hold at or below 8% annual logo churn. Observed logo churn is trending toward 11-12%, which — if sustained — makes the 130% NRR target unreachable without significant expansion revenue acceleration.

**Why signals may conflict:**
1. **Cohort composition shift** — newer cohorts may show strong engagement (lifting leading indicators) while older, higher-value cohorts churn (driving lagging indicators up). This is the most dangerous scenario because it masks revenue concentration risk.
2. **Measurement lag** — leading indicators may genuinely predict future improvement that hasn't yet appeared in lagging metrics. If true, intervention spend now would be premature.
3. **Engagement-without-value trap** — users may be active but not deriving business outcomes, meaning engagement metrics are decoupled from retention drivers.
4. **Segment-level cancellation** — churn may be concentrated in a specific segment (e.g., SMB, specific vertical, specific use case) that leading indicators are not weighted to reflect.

## Unknowns & Evidence Gaps

| # | Unknown | Why It Matters | Evidence Needed | Effort to Resolve |
|---|---------|---------------|-----------------|-------------------|
| 1 | Are leading indicators predictive of retention in our product? | If engagement doesn't predict retention, our health scoring model is broken and we're flying blind. | Retrospective correlation analysis: do accounts that showed strong leading indicators 90 days ago actually retain at higher rates? | Medium — requires data team, ~1 week |
| 2 | Is churn concentrated by cohort vintage? | Cohort-specific churn changes the intervention from product-wide to segment-specific. | Cohort-stratified churn analysis comparing pre-2025 vs. post-2025 accounts on both logo and revenue churn. | Low — data exists, needs slicing |
| 3 | Is churn concentrated by segment, vertical, or use case? | Determines whether we need a horizontal or vertical intervention. | Segment-level churn breakdown with statistical significance testing. | Low — same data, different cut |
| 4 | What are churned customers citing as reasons? | Qualitative signal to triangulate with quantitative conflict. | Exit survey analysis + CS win/loss notes for last 2 quarters. | Low — data exists but may not be aggregated |
| 5 | Has our definition of "engaged" drifted from value-delivering behavior? | If engagement metrics track activity but not outcomes, leading indicators are unreliable. | Map current engagement scoring inputs against customer-reported value drivers from last NPS/CSAT cycle. | Medium — requires cross-referencing two data sources |
| 6 | Are expansion revenue assumptions still valid given churn composition? | 130% NRR target depends on expansion from retained base — if high-value accounts churn, expansion pool shrinks. | Revenue-weighted churn analysis showing expansion potential of retained vs. churned cohort. | Medium |

## Pass/Fail Readiness

**Readiness verdict: FAIL — not ready to commit to a specific churn intervention.**

**Rationale:** The core conflict between leading and lagging indicators is unresolved. Committing resources to a retention program now risks one of two failure modes:
- **False alarm:** If leading indicators are correct and churn is a lagging artifact, we waste resources on an intervention the product is already self-correcting.
- **Wrong intervention:** If churn is segment-concentrated but we deploy a horizontal intervention, we treat symptoms while the root cause persists in the affected segment.

**What would change this to PASS:**
1. Unknowns #1 and #2 are resolved (predictive validity of leading indicators + cohort concentration analysis). These are the minimum evidence threshold.
2. A clear hypothesis emerges for *why* signals conflict, supported by data from at least two independent evidence sources.
3. The proposed intervention can be scoped to a testable cohort with defined success metrics and a 90-day evaluation window.

**What we can do now (low-risk, high-information actions):**
- Commission the cohort-stratified churn analysis (Unknown #2) — this is the single highest-leverage investigation because it disambiguates most conflict hypotheses.
- Aggregate exit survey and CS win/loss data (Unknown #4) — qualitative triangulation at near-zero cost.
- Place a hold on any planned reduction in CS coverage for at-risk accounts until the analysis completes.

## Recommended Next Artifact

**Next artifact: Evidence Brief (target: 2 weeks)**

A structured evidence brief that resolves Unknowns #1-4 and presents a clear hypothesis for the signal conflict. This brief should include:
- Cohort-stratified churn data with statistical significance
- Retrospective predictive validity test of leading indicators
- Segment-level churn concentration analysis
- Qualitative themes from exit surveys and CS notes
- A recommended intervention hypothesis with testable scope

Upon completion of the evidence brief, the team should reconvene to determine whether conditions now meet PASS readiness for a full churn intervention PRD with specific feature/program commitments, success metrics, and resource allocation.

**Escalation trigger:** If the cohort analysis reveals that churn is concentrated in accounts representing >30% of ARR, escalate immediately to executive team without waiting for the full evidence brief — this would indicate a revenue emergency requiring faster action than the standard 2-week timeline.
