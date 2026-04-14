# Churn Reduction PRD: Resolving Conflicting Signals

## Decision Frame

**Problem statement:** Customer churn metrics are sending conflicting signals relative to stated strategy targets. Specifically:

- **Signal conflict 1:** Net revenue retention (NRR) appears healthy at 105%, but logo retention has dropped from 88% to 81% over two quarters — indicating we are masking churn through expansion revenue from surviving accounts rather than actually retaining customers.
- **Signal conflict 2:** NPS scores remain stable (42), yet support ticket escalation rate has increased 35%. Satisfied customers on surveys are simultaneously filing more complaints — suggesting survey fatigue or selection bias in who responds.
- **Signal conflict 3:** Product usage (DAU/MAU) is flat, but feature adoption of the last three releases is below 15%. Customers are using the product but ignoring new capabilities — a leading indicator of eventual churn as competitors ship comparable base functionality.

**Strategic tension:** The current strategy targets 120% NRR through upsell motions. A churn reduction initiative competes for the same CS bandwidth currently allocated to expansion. Investing in save plays may reduce short-term NRR even if it improves long-term logo retention.

**Decision required:** Should we redirect CS capacity from expansion to retention, invest in a dedicated churn prevention function, or treat the conflicting signals as measurement artifacts requiring better instrumentation before action?

**Recommendation:** Pursue a time-boxed diagnostic phase (4 weeks) to resolve signal conflicts before committing to a full retention program. The conflicting signals make it premature to commit resources to a specific churn reduction mechanism — we risk solving the wrong problem.

## Unknowns & Evidence Gaps

| # | Unknown | Impact if unresolved | Proposed resolution | Timeline |
|---|---------|---------------------|---------------------|----------|
| U1 | Are churned logos concentrated in a specific segment (SMB, mid-market, enterprise)? | We may over-invest in retention for a segment that was never ICP-fit, diluting ROI | Segment-level cohort analysis of churned accounts from last 3 quarters | Week 1-2 |
| U2 | Is NPS stability an artifact of survey non-response bias among at-risk accounts? | NPS becomes unreliable as a health signal; we lose early warning capability | Compare NPS response rates between churned and retained cohorts; instrument in-app micro-surveys for non-respondents | Week 2-3 |
| U3 | What is the causal relationship between low feature adoption and churn? | If low adoption causes churn, onboarding investment is the lever. If low adoption reflects poor product-market fit in new features, the lever is product strategy | Survival analysis: does feature adoption of releases N-1 and N-2 predict churn at 90/180 days? | Week 2-4 |
| U4 | What proportion of "healthy" NRR is driven by contractual lock-in vs. genuine expansion intent? | If expansion is contractual, NRR will cliff when renewals come due rather than degrade gradually | Audit expansion revenue: distinguish mid-contract upsells from auto-renewals with price increases | Week 1 |
| U5 | Is CS bandwidth actually the binding constraint, or is it tooling/data access? | Redirecting headcount may not help if the team lacks churn prediction signals to act on | CS team time-study: how much time is spent on reactive save plays vs. proactive health checks vs. expansion motions? | Week 1-2 |

## Pass/Fail Readiness

**Verdict: NOT READY to commit to a churn reduction program.**

Rationale:

| Readiness criterion | Status | Detail |
|---------------------|--------|--------|
| Root cause identified | FAIL | Three conflicting signal pairs remain unresolved; any of three different root causes could dominate |
| Target segment defined | FAIL | No segmentation of churned accounts completed; intervention design requires knowing who is churning |
| Intervention mechanism validated | FAIL | Cannot design save plays without knowing whether the driver is adoption, support quality, pricing, or product gaps |
| ROI model defensible | FAIL | Cannot model retention ROI without resolving whether NRR masks or compensates for logo churn |
| Measurement plan viable | PARTIAL | We have the raw data for most analyses in U1-U5; instrumentation gap only for U2 (NPS non-response) |
| Organizational capacity confirmed | PARTIAL | CS team exists but allocation trade-off (expansion vs. retention) requires leadership decision informed by U4-U5 findings |

**Gate criteria to proceed to full PRD:**
1. U1 segmentation complete — churned logos attributed to segments with >80% coverage
2. U3 survival analysis shows statistically significant (p<0.05) relationship between feature adoption and churn, OR rules it out
3. U4 audit distinguishes contractual vs. intent-driven expansion with >90% revenue coverage
4. Leadership alignment on CS bandwidth allocation trade-off, informed by U5 time-study

## Recommended Next Artifact

**Artifact:** Diagnostic Sprint Brief (4-week time-boxed investigation plan)

**Contents:**
- Analyst assignments for U1-U5 workstreams
- Data access requirements and engineering support needed
- Weekly check-in cadence with findings synthesis
- Decision meeting at Week 4 with go/no-go criteria for full churn reduction PRD
- Escalation path if diagnostic reveals urgent churn cluster requiring immediate intervention before full program design

**Why this artifact next:** Committing to a churn reduction program now — when we cannot distinguish measurement artifacts from real deterioration, and when we cannot identify the dominant churn mechanism — risks building an expensive solution to the wrong problem. The diagnostic sprint is low-cost (analyst time, no engineering build) and high-information-value. If the signals resolve clearly, the full PRD can be written in Week 5 with confidence. If they don't resolve, that finding itself is valuable — it means our instrumentation needs investment before any churn program can be managed effectively.

**Alternative artifacts considered and rejected:**
- *Full churn reduction PRD now:* Rejected because intervention design without root cause is guesswork
- *Competitive analysis:* Premature — only relevant if U3 analysis reveals product gap as the driver
- *CS playbook redesign:* Premature — depends on U5 findings about current time allocation
