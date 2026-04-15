# Churn Reduction PRD: Resolving Conflicting Signals

## Decision Frame

**Problem:** Churn signals (usage decline, support ticket spikes, NPS drops) conflict with strategy targets (aggressive growth, new feature investment, upmarket shift). The org must decide how to allocate resources when retention data says "fix what we have" but strategy says "build what's next."

**Decision to make:** Should we prioritize churn reduction interventions now (delaying growth initiatives by 1-2 quarters), pursue growth targets while accepting elevated churn as a known cost, or find a sequencing that addresses both within acceptable risk bounds?

**Who decides:** VP Product with sign-off from CEO, informed by Finance (LTV/CAC impact) and CS (capacity constraints).

**Decision deadline:** End of current planning cycle. Delaying past this forces a de facto choice — growth investments proceed, churn interventions slip to next half.

**Irreversibility:** Medium. Growth investments are partially reversible (reprioritize backlog), but churned customers are expensive to win back (3-5x acquisition cost vs. retention cost). Each month of elevated churn compounds the damage.

### Signal Conflict Map

| Signal | Says | Confidence | Source |
|--------|------|------------|--------|
| 90-day cohort retention | Declining 3pp QoQ | Medium — only 2 quarters of data | Product analytics |
| NPS detractor verbatims | "Core workflows broken since v4.2 migration" | High — consistent theme across segments | CS surveys |
| Expansion revenue | Up 18% YoY in enterprise segment | High — bookings data | Finance |
| Strategy target | 40% ARR growth requires net-new logos | High — board-approved | Exec team |
| Support ticket volume | 2.1x increase in "reliability" category | High — tagged and validated | CS ops |
| Logo churn rate | Flat at 8% annually | Medium — lagging indicator, masks cohort-level shifts | Finance |

**Core tension:** Logo churn appears stable (supporting growth-first), but cohort retention is declining and qualitative signals are deteriorating (supporting fix-first). The lag between these signals means by the time logo churn moves, the damage is 2-3 quarters deep.

## Unknowns & Evidence Gaps

### Critical unknowns (must resolve before committing)

1. **Cohort segmentation by plan tier** — Is retention decline concentrated in SMB (acceptable if upmarket strategy is working) or spreading to mid-market/enterprise (existential)? *Evidence needed:* Cohort retention cuts by segment, available from product analytics within 1 week.

2. **Causal link between v4.2 migration and churn signals** — NPS verbatims point here, but is this the driver or just the loudest complaint? *Evidence needed:* Correlation analysis between v4.2 migration timing and usage decline per account. 2 weeks with data team support.

3. **Revenue impact of doing nothing** — What does the CFO's model show if current cohort trends continue for 2 more quarters? *Evidence needed:* Finance scenario model, 1 week.

### Important but deferrable unknowns

4. **Competitive loss rate** — Are churning customers leaving for competitors or leaving the category? Different interventions for each.

5. **CS capacity for intervention programs** — Can CS run a save program without additional headcount?

6. **Feature usage overlap** — Do churning accounts use different features than expanding accounts? Would inform targeted investment.

### What we'll likely never know

7. **True counterfactual** — We cannot run the "what if we paused growth" experiment. We must decide under uncertainty.

## Pass/Fail Readiness

**Current readiness: FAIL — not ready to commit to either path.**

| Criterion | Status | Blocker? |
|-----------|--------|----------|
| Segment-level churn data available | ❌ Not yet cut | Yes — cannot assess if churn is strategic or systemic |
| Revenue impact modeled | ❌ No scenario model | Yes — cannot size the cost of inaction |
| Root cause validated beyond verbatims | ❌ Correlation only | Yes — wrong diagnosis = wrong intervention |
| CS capacity assessed | ❌ Not scoped | No — can proceed in parallel |
| Exec alignment on tradeoff framing | ❌ Not yet presented | No — follows from evidence |

**What would move this to PASS:**
- Items 1-3 from Unknowns resolved (2 weeks)
- Decision frame presented to VP Product + CEO with scenario model
- Clear segment-level data showing WHERE churn is happening

**Kill criteria (abandon this PRD direction if):**
- Cohort decline is entirely in segments we're deliberately deprioritizing (upmarket shift working as intended)
- Logo churn begins moving >12% annually before analysis completes (skip analysis, act immediately)

## Recommended Next Artifact

**Immediate next artifact:** Evidence brief (1-2 pages) resolving unknowns 1-3, due in 2 weeks.

**Sequence after evidence brief:**

1. **If churn is segment-concentrated (SMB only):** → Strategy memo confirming acceptable churn bounds + monitoring dashboard. No PRD needed — the strategy is working.

2. **If churn is spreading across segments:** → Full intervention PRD with three workstreams:
   - **Quick wins** (reliability fixes mapped to v4.2 regression, 4-week sprint)
   - **Retention program** (CS-led save motion for at-risk accounts, 2-week launch)
   - **Sequencing proposal** (which growth initiatives can slip 1 quarter without killing ARR target)

3. **If root cause is NOT v4.2 but something structural:** → Discovery sprint to identify actual driver before solutioning.

**Owner for next artifact:** Product Analytics lead (data cuts) + Finance partner (scenario model), with PM coordinating.

**Decision meeting:** Scheduled for 2 weeks from PRD approval, with evidence brief as pre-read.
