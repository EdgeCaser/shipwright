# Churn Reduction PRD: Navigating Conflicting Signals

## Decision Frame

**Problem statement:** Churn metrics are sending conflicting signals relative to stated strategy targets. Specifically, the organization faces a tension between:

1. **Usage-based signals suggest satisfaction** — active usage metrics (DAU/MAU, feature adoption, session depth) remain stable or improving for a segment of churning customers, contradicting the assumption that low engagement predicts churn.
2. **Strategy targets prioritize growth over retention** — current OKRs emphasize new logo acquisition and expansion revenue, creating resource contention with retention investments.
3. **NPS/CSAT diverge from actual behavior** — survey scores remain neutral-to-positive among customers who subsequently churn, suggesting satisfaction metrics are lagging or misleading indicators.

**Decision to be made:** Should we invest in a dedicated churn reduction program now, or defer until we resolve the signal conflicts through better instrumentation?

**Stakeholders:** Product (owns intervention design), Data/Analytics (owns signal resolution), CS/Success (owns relationship layer), Finance (owns unit economics case), Growth (competing for same engineering resources).

**Recommendation:** Pursue a two-track approach — (A) deploy low-cost, evidence-backed retention interventions immediately for the segments where signals *do* align, while (B) investing in instrumentation to resolve conflicting signals before committing to larger retention programs.

---

## Unknowns & Evidence Gaps

| # | Unknown | Impact if unresolved | Proposed resolution | Timeline |
|---|---------|---------------------|---------------------|----------|
| U1 | Why do usage metrics remain healthy for churning accounts? Possible explanations: (a) wrong usage metrics tracked, (b) contractual lock-in masks intent, (c) power users stay active while decision-makers disengage | High — any intervention designed on current usage signals may target the wrong accounts | Instrument decision-maker engagement separately from end-user engagement; cohort analysis of churned accounts at T-90, T-60, T-30 | 4-6 weeks |
| U2 | What is the actual leading indicator of churn if NPS and usage are unreliable? | Critical — without a reliable signal, any automated intervention will have poor precision | Survival analysis on churned cohort with expanded feature set (support tickets, billing inquiries, executive sponsor changes, competitive evaluation signals) | 6-8 weeks |
| U3 | What is the true cost of churn vs. cost of acquisition? Current CAC:LTV ratio may justify growth-first strategy | Medium — determines whether churn reduction ROI exceeds growth investment ROI | Finance deep-dive on segment-level unit economics, not blended averages | 2-3 weeks |
| U4 | Are churning customers in strategic segments or low-value tail? | High — determines whether churn is a revenue problem or a natural portfolio pruning | Segment churned accounts by ARR tier, industry, and expansion potential | 1-2 weeks |
| U5 | Do competitors offer migration incentives that explain churn despite satisfaction? | Medium — external signal invisible to internal instrumentation | Win/loss interviews with 15-20 recently churned accounts, focused on competitive alternatives | 4-6 weeks |

---

## Pass/Fail Readiness

### Assessment: NOT READY for full program launch

**Criteria evaluation:**

| Criterion | Status | Rationale |
|-----------|--------|-----------|
| Reliable churn prediction signal exists | FAIL | Current signals (usage, NPS) demonstrably conflict with actual churn behavior. Interventions built on unreliable signals waste resources and erode customer trust through false-positive outreach. |
| Unit economics case is segment-specific | FAIL | Only blended CAC:LTV available. Cannot determine if retention investment outperforms acquisition investment per dollar without segment-level analysis. |
| Resource contention with growth OKRs is resolved | FAIL | No explicit prioritization framework exists for allocating shared engineering/product resources between growth and retention. |
| Low-cost interventions identified for aligned segments | PASS | For segments where churn *does* correlate with declining usage (estimated 35-45% of churn volume), standard playbook interventions (health score outreach, QBR acceleration, feature adoption campaigns) can deploy with minimal engineering lift. |
| Competitive displacement understood | FAIL | No systematic win/loss data on recent churn. Cannot distinguish voluntary churn from competitive displacement. |

**Go/No-Go verdict:** Conditional GO on Track A (known-signal segments), hard NO-GO on Track B (full program) until U1, U2, and U3 are resolved.

---

## Recommended Next Artifact

**Primary:** Metrics framework artifact — design the churn signal instrumentation plan that resolves U1 and U2. This should define:
- Decision-maker engagement metrics distinct from end-user metrics
- Survival model feature set and validation criteria
- Signal reliability threshold required before Track B greenlight

**Secondary:** Competitive intelligence brief — structured win/loss interview program to resolve U5 and inform whether churn reduction or competitive positioning is the higher-leverage investment.

**Sequencing:** Metrics framework (weeks 1-2) → Unit economics deep-dive (weeks 2-3, parallel) → Win/loss interviews (weeks 2-6, parallel) → Track B readiness review (week 8) with updated Pass/Fail assessment.

**What this PRD deliberately excludes:** Specific intervention designs, technical implementation details, or success metrics for Track A — these belong in a follow-on execution plan once the signal foundation is sound. Shipping interventions on broken signals is how retention programs become noise generators that accelerate the churn they intend to prevent.
