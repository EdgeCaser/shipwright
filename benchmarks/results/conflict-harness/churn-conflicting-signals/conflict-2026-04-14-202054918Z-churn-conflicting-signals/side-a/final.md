# Churn Reduction PRD: Resolving Conflicting Signals

## Decision Frame

**Problem:** Churn signals (usage decline, support ticket spikes, NPS drops) conflict with strategy targets (aggressive growth, new feature investment, upmarket shift). The org must decide how to allocate resources when retention data says "fix what we have" but strategy says "build what's next."

**Decision to make:** The decision is not binary. Convergent warning signals — declining cohort retention, 2.1x reliability ticket spike, consistent v4.2 NPS complaints — already justify immediate low-regret retention actions. The outstanding decision is whether to commit to a larger resource reallocation (delaying growth initiatives by 1-2 quarters), which requires segment-level evidence we do not yet have.

**Who decides:** VP Product with sign-off from CEO, informed by Finance (LTV/CAC impact) and CS (capacity constraints).

**Decision deadline:** End of current planning cycle for the larger reallocation question. Low-regret interventions should begin immediately — they do not require the same evidence threshold.

**Irreversibility:** Mixed. Low-regret actions (reliability fixes, CS save motions) are cheap and reversible. The larger growth-vs-retention reallocation is medium-irreversibility: growth investments are partially reversible (reprioritize backlog), but churned customers are expensive to win back (3-5x acquisition cost vs. retention cost). Each month of elevated churn compounds the damage.

### Signal Conflict Map

| Signal | Says | Confidence | Source |
|--------|------|------------|--------|
| 90-day cohort retention | Declining 3pp QoQ | Medium — only 2 quarters of data | Product analytics |
| NPS detractor verbatims | "Core workflows broken since v4.2 migration" | High — consistent theme across segments | CS surveys |
| Expansion revenue | Up 18% YoY in enterprise segment | High — bookings data | Finance |
| Strategy target | 40% ARR growth requires net-new logos | High — board-approved | Exec team |
| Support ticket volume | 2.1x increase in "reliability" category | High — tagged and validated | CS ops |
| Logo churn rate | Flat at 8% annually | Medium — lagging indicator, masks cohort-level shifts | Finance |

**Core tension:** Logo churn appears stable (supporting growth-first), but cohort retention is declining and qualitative signals are deteriorating (supporting fix-first). The lag between these signals means by the time logo churn moves, the damage is 2-3 quarters deep. However, the convergence of multiple independent warning signals (cohort decline + ticket spike + NPS theme) is sufficient to act on low-regret interventions now, even without segment-level precision.

### Immediate Low-Regret Actions (start now, no further evidence needed)

| Action | Rationale | Cost | Reversibility |
|--------|-----------|------|----------------|
| v4.2 reliability hotfix sprint (2-week scope) | Three independent signals converge on v4.2 as a contributor; fixing regressions has no downside | 1 eng squad, 2 weeks | Fully reversible |
| CS proactive outreach to top-decile accounts showing usage decline | Protects highest-value accounts; generates qualitative intel for diagnosis | CS team capacity, no headcount | Fully reversible |
| Reliability ticket triage and tagging enrichment | Improves diagnosis quality for the evidence sprint at negligible cost | CS ops, 1 week | N/A — additive |

## Unknowns & Evidence Gaps

### Critical unknowns (must resolve before committing to larger reallocation)

1. **Cohort segmentation by plan tier** — Is retention decline concentrated in SMB (acceptable if upmarket strategy is working) or spreading to mid-market/enterprise (existential)? *Evidence needed:* Cohort retention cuts by segment, available from product analytics within 1 week.

2. **Causal link between v4.2 migration and churn signals** — NPS verbatims and ticket spikes point here, but is this the primary driver or the loudest of several? *Evidence needed:* Correlation analysis between v4.2 migration timing and usage decline per account. 2 weeks with data team support. Note: the low-regret hotfix sprint proceeds regardless; this analysis determines whether v4.2 explains enough of the variance to avoid a larger intervention.

3. **Revenue impact of doing nothing** — What does the CFO's model show if current cohort trends continue for 2 more quarters? *Evidence needed:* Finance scenario model, 1 week.

### Important but deferrable unknowns

4. **Competitive loss rate** — Are churning customers leaving for competitors or leaving the category? Different interventions for each.

5. **CS capacity for scaled intervention programs** — Can CS run a broader save program without additional headcount? (Proactive outreach to top-decile starts immediately regardless.)

6. **Feature usage overlap** — Do churning accounts use different features than expanding accounts? Would inform targeted investment.

### What we'll likely never know

7. **True counterfactual** — We cannot run the "what if we paused growth" experiment. We must decide under uncertainty.

## Pass/Fail Readiness

**Current readiness: CONDITIONAL PASS — ready to act on low-regret interventions immediately; NOT ready to commit to larger growth-vs-retention reallocation.**

| Criterion | Status | Blocker for low-regret actions? | Blocker for reallocation? |
|-----------|--------|-------------------------------|---------------------------|
| Convergent warning signals identified | ✅ Three independent signals | No | No |
| Segment-level churn data available | ❌ Not yet cut | No | Yes — cannot assess if churn is strategic or systemic |
| Revenue impact modeled | ❌ No scenario model | No | Yes — cannot size the cost of inaction |
| Root cause validated beyond verbatims | ⚠️ Convergent but correlational | No — enough for targeted hotfix | Yes — wrong diagnosis = wrong intervention at scale |
| CS capacity assessed | ❌ Not scoped for full program | No — top-decile outreach within capacity | Partially — needed for scaled program |
| Exec alignment on tradeoff framing | ❌ Not yet presented | No | Yes — follows from evidence |

**What would move full reallocation to PASS:**
- Items 1-3 from Unknowns resolved (2 weeks)
- Decision frame presented to VP Product + CEO with scenario model
- Clear segment-level data showing WHERE churn is happening

**Kill criteria (abandon larger intervention if):**
- Cohort decline is entirely in segments we're deliberately deprioritizing (upmarket shift working as intended)
- v4.2 hotfix resolves the reliability signal and cohort trends stabilize within one measurement period

**Escalation trigger (skip analysis, act immediately if):**
- Logo churn begins moving >12% annually before analysis completes

## Recommended Next Artifact

**Parallel tracks (starting now):**

- **Track 1 — Immediate action (starts this week):** Execute low-regret interventions listed above. No further approval needed. Owner: Engineering lead (hotfix) + CS lead (outreach).
- **Track 2 — Evidence sprint (2-week timebox):** Produce evidence brief resolving unknowns 1-3. Owner: Product Analytics lead + Finance partner, PM coordinating.

**Sequence after evidence brief:**

1. **If churn is segment-concentrated (SMB only) AND hotfix stabilizes signals:** Strategy memo confirming acceptable churn bounds + monitoring dashboard. No further PRD needed — the strategy is working.

2. **If churn is spreading across segments:** Full intervention PRD with three workstreams:
   - **Reliability fixes** beyond v4.2 hotfix (mapped to root cause analysis)
   - **Retention program** (CS-led save motion for at-risk accounts across segments)
   - **Sequencing proposal** (which growth initiatives can slip 1 quarter without killing ARR target)

3. **If root cause is NOT v4.2 but something structural:** Discovery sprint to identify actual driver before solutioning.

**Decision meeting:** Scheduled for 2 weeks from PRD approval, with evidence brief as pre-read.
