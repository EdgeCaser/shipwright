# Churn Reduction PRD: Resolving Conflicting Signals

## Decision Frame

**Problem:** Churn metrics are sending conflicting signals relative to strategic growth targets. Specifically:

- **Signal conflict 1:** Logo churn is declining (positive), but revenue churn is increasing — indicating we're retaining small accounts while losing high-value ones.
- **Signal conflict 2:** NPS scores are stable/improving, yet churn intent surveys show rising dissatisfaction with product-market fit among power users.
- **Signal conflict 3:** Usage frequency is up, but depth-of-use (features per session) is declining — suggesting habitual but shallow engagement that doesn't build switching costs.

**Strategic tension:** The current strategy targets net revenue retention (NRR) > 110%, which requires expansion revenue from existing accounts. Churn reduction efforts focused on logo retention actively conflict with this target if they prioritize saving low-value accounts over deepening high-value relationships.

**Decision to be made:** Should we optimize churn interventions for logo retention, revenue retention, or a segmented approach — and how do we resolve the conflicting signals to know which interventions will actually move NRR?

**Stakeholders:** Product (owns engagement levers), CS (owns save motions), Finance (owns NRR target), Growth (owns expansion pipeline).

**Scope boundary:** This PRD covers the diagnostic framework and intervention design. It does NOT cover pricing changes or new product lines, which require separate decision frames.

## Unknowns & Evidence Gaps

| # | Unknown | Impact if unresolved | Proposed resolution | Cost/time |
|---|---------|---------------------|---------------------|-----------|
| U1 | Root cause of high-value account churn — is it competitive displacement, unmet needs, or budget pressure? | Cannot design targeted save motions; interventions will be generic and low-efficacy | Exit interview analysis + win/loss study on last 2 quarters of churned accounts >$50K ARR | 2-3 weeks, CS team effort |
| U2 | Whether rising NPS masks segment-level divergence (high NPS from small accounts inflating aggregate) | False confidence in product satisfaction; misallocated investment | Segment NPS by ARR tier and cohort vintage | 1 week, data team |
| U3 | Causal relationship between depth-of-use decline and churn probability | Cannot prioritize feature adoption vs. frequency interventions | Survival analysis correlating feature breadth with retention curves | 2 weeks, data science |
| U4 | Competitive landscape shifts — are churned accounts leaving for specific competitors or reducing category spend? | Determines whether intervention is product improvement vs. positioning vs. pricing | Competitive intel sweep + churned account destination tracking | 3 weeks, market research |
| U5 | Whether current CS save motions are being triggered too late in the churn lifecycle | Early intervention may resolve conflicts without product changes | Analyze time-from-first-risk-signal to save-motion-initiation across segments | 1 week, CS ops |
| U6 | Whether CS incentive structure is actively driving suboptimal save behavior or merely misaligned on paper | Determines urgency of incentive redesign vs. proceeding with segment-specific interventions in parallel | Audit last quarter's save motions: compare CS effort allocation across ARR tiers against churn-risk distribution | 1 week, CS ops + Finance |

**Critical dependency:** U1 and U2 must be resolved before committing to any intervention design. Without these, we risk optimizing the wrong metric for the wrong segment. U6 can be investigated in parallel and need not block intervention design.

## Pass/Fail Readiness

**Readiness verdict: NOT READY to commit to a specific intervention plan.**

| Criterion | Status | Rationale |
|-----------|--------|-----------|
| Problem is clearly defined | ⚠️ Partial | We know signals conflict but don't yet know which signal is the leading indicator |
| Root cause is understood | ❌ Fail | High-value churn drivers are hypothesized, not validated (U1) |
| Metrics are trustworthy | ❌ Fail | Aggregate NPS may be masking segment-level problems (U2) |
| Intervention has evidence basis | ❌ Fail | Cannot design interventions without resolving U1-U3 |
| Strategic alignment is clear | ⚠️ Partial | NRR target is clear; CS incentive alignment is a risk factor but not a proven blocker (U6 pending) |
| Stakeholder alignment exists | ⚠️ Partial | Logo vs. revenue optimization tension exists across CS and Finance; needs resolution but can be pursued in parallel with diagnostics |

**What would change this to READY:**
1. Resolve U1 and U2 (4-week sprint)
2. Clarity on primary optimization metric (logo vs. revenue churn) — can emerge from diagnostic findings rather than requiring upfront executive arbitration
3. Segmented intervention design based on validated root causes

## Recommended Next Artifact

**Immediate next step:** Commission a **Churn Diagnostic Brief** (2-4 week effort) that resolves U1 and U2 before any intervention PRD is written.

**Diagnostic brief should contain:**
1. Segmented churn analysis by ARR tier, cohort, and product usage pattern
2. Exit interview synthesis from churned accounts >$50K ARR (last 2 quarters)
3. NPS decomposition by segment with trend analysis
4. Survival curves correlating feature depth with retention
5. Recommendation on primary optimization metric with supporting evidence

**Parallel workstreams (can proceed without blocking on each other):**
- **Diagnostic brief** (U1, U2, U3): Core analytical work.
- **CS incentive audit** (U6): Determine whether current CS effort allocation is empirically skewed toward low-value saves. If confirmed, escalate to executive alignment session. If not, deprioritize incentive redesign.
- **Segment-specific intervention prototyping:** For any segment where root cause is already well-understood (e.g., if exit interviews quickly reveal a dominant churn driver for enterprise accounts), begin designing targeted interventions without waiting for full diagnostic completion.

**After diagnostic brief:** Return to this PRD with validated root causes and design a segmented intervention plan.

**Anti-pattern to avoid:** Do not launch broad-based retention campaigns (discounts, feature unlocks, CSM outreach blitzes) before the diagnostic completes. Generic interventions in the presence of conflicting signals will optimize noise, not signal, and may actively harm NRR by subsidizing accounts that were never at risk while ignoring the high-value accounts that are.
