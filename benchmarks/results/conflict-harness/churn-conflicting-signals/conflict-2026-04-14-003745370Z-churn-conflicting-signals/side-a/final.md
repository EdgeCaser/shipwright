# Churn Reduction PRD: Navigating Conflicting Signals

## Decision Frame

**Problem statement:** Churn metrics are sending conflicting signals relative to stated strategy targets. Specifically, the organization faces a tension between:

1. **Usage-based signals suggest satisfaction** — active usage metrics (DAU/MAU, feature adoption, session depth) remain stable or improving for a segment of churning customers, contradicting the assumption that low engagement predicts churn.
2. **Strategy targets prioritize growth over retention** — current OKRs emphasize new logo acquisition and expansion revenue, creating resource contention with retention investments.
3. **NPS/CSAT diverge from actual behavior** — survey scores remain neutral-to-positive among customers who subsequently churn, suggesting satisfaction metrics are lagging or misleading indicators.

**Decision to be made:** Should we invest in a dedicated churn reduction program now, or defer until we resolve the signal conflicts through better instrumentation?

**Stakeholders:** Product (owns intervention design), Data/Analytics (owns signal resolution), CS/Success (owns relationship layer), Finance (owns unit economics case), Growth (competing for same engineering resources).

**Recommendation:** Pursue a sequenced approach — (A) validate whether an aligned-signal segment actually exists through rapid cohort analysis before deploying any interventions, then (B) invest in instrumentation to resolve conflicting signals before committing to larger retention programs. No interventions should ship until the aligned-signal segment is confirmed with data, not assumed.

---

## Unknowns & Evidence Gaps

| # | Unknown | Impact if unresolved | Proposed resolution | Timeline |
|---|---------|---------------------|---------------------|----------|
| U0 | Does a segment exist where churn signals are actually aligned (i.e., declining usage reliably precedes churn)? | Critical — the entire phased approach depends on this segment being real, not assumed. Without confirmation, any "quick win" intervention is speculative. | Run cohort analysis on last 12 months of churned accounts: segment by usage trajectory in T-90 window, test whether declining-usage cohort churns at statistically higher rate than stable-usage cohort. Minimum sample: 50 accounts per cohort. | 1-2 weeks |
| U1 | Why do usage metrics remain healthy for churning accounts? Possible explanations: (a) wrong usage metrics tracked, (b) contractual lock-in masks intent, (c) power users stay active while decision-makers disengage | High — any intervention designed on current usage signals may target the wrong accounts | Instrument decision-maker engagement separately from end-user engagement; cohort analysis of churned accounts at T-90, T-60, T-30 | 4-6 weeks |
| U2 | What is the actual leading indicator of churn if NPS and usage are unreliable? | Critical — without a reliable signal, any automated intervention will have poor precision | Survival analysis on churned cohort with expanded feature set (support tickets, billing inquiries, executive sponsor changes, competitive evaluation signals) | 6-8 weeks |
| U3 | What is the true cost of churn vs. cost of acquisition? Current CAC:LTV ratio may justify growth-first strategy | Medium — determines whether churn reduction ROI exceeds growth investment ROI | Finance deep-dive on segment-level unit economics, not blended averages | 2-3 weeks |
| U4 | Are churning customers in strategic segments or low-value tail? | High — determines whether churn is a revenue problem or a natural portfolio pruning | Segment churned accounts by ARR tier, industry, and expansion potential | 1-2 weeks |
| U5 | Do competitors offer migration incentives that explain churn despite satisfaction? | Medium — external signal invisible to internal instrumentation | Win/loss interviews with 15-20 recently churned accounts, focused on competitive alternatives | 4-6 weeks |

---

## Pass/Fail Readiness

### Assessment: NOT READY for any intervention deployment

**Criteria evaluation:**

| Criterion | Status | Rationale |
|-----------|--------|-----------|
| Aligned-signal segment confirmed with data | FAIL | The hypothesis that 35-45% of churn volume correlates with declining usage is untested. This estimate was a structural assumption, not an empirical finding. U0 must resolve before any intervention is scoped. |
| Reliable churn prediction signal exists | FAIL | Current signals (usage, NPS) demonstrably conflict with actual churn behavior. Interventions built on unreliable signals waste resources and erode customer trust through false-positive outreach. |
| Unit economics case is segment-specific | FAIL | Only blended CAC:LTV available. Cannot determine if retention investment outperforms acquisition investment per dollar without segment-level analysis. |
| Resource contention with growth OKRs is resolved | FAIL | No explicit prioritization framework exists for allocating shared engineering/product resources between growth and retention. |
| Intervention designs are evidence-backed | FAIL | No specific interventions have been designed, and none should be until the target segment and its churn drivers are confirmed. Standard playbook interventions (health score outreach, QBR acceleration) are only appropriate if the aligned-signal segment is validated and the interventions can be paired with measurable success criteria. |
| Competitive displacement understood | FAIL | No systematic win/loss data on recent churn. Cannot distinguish voluntary churn from competitive displacement. |

**Go/No-Go verdict:** NO-GO on all intervention tracks until U0 is resolved (1-2 weeks). If U0 confirms an aligned-signal segment of meaningful size (>30% of churn volume, >50 accounts), proceed to design Track A interventions with explicit success criteria and a controlled rollout. Full program (Track B) remains NO-GO until U1, U2, and U3 are resolved.

---

## Recommended Next Artifact

**Immediate (Week 1-2):** Cohort validation analysis — resolve U0. This is a data task, not a product task. Deliverable: confirmed or rejected hypothesis that a declining-usage segment exists with sufficient volume and signal reliability to justify intervention.

**If U0 confirms aligned segment:** Intervention design brief for Track A — specific interventions, success metrics, rollout plan, and kill criteria. This was previously excluded from the PRD; it should not remain excluded if the segment is real.

**Parallel (Weeks 1-6):** Metrics framework artifact — design the churn signal instrumentation plan that resolves U1 and U2. This should define:
- Decision-maker engagement metrics distinct from end-user metrics
- Survival model feature set and validation criteria
- Signal reliability threshold required before Track B greenlight

**Parallel (Weeks 2-6):** Competitive intelligence brief — structured win/loss interview program to resolve U5.

**Gate review (Week 8):** Updated Pass/Fail assessment with U0-U3 resolved, determining whether Track B is warranted or whether the growth-first strategy is correct.

**What this PRD deliberately excludes and why:** Specific intervention designs and success metrics — not because they are unimportant, but because designing them before confirming the target segment exists would repeat the uninformed-action pattern this PRD identifies as the core risk.
