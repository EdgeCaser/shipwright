# Churn Reduction PRD: Resolving Conflicting Signals

## Decision Frame

**Problem statement:** Churn telemetry presents contradictory signals that undermine confidence in any single intervention. NPS scores trend upward (+4 pts QoQ) while monthly logo churn accelerates (1.8% → 2.6% over two quarters). Usage frequency is stable among retained cohorts, yet expansion revenue per account is declining. These conflicts suggest the churn driver is not uniform dissatisfaction but rather a segmentation problem: satisfied customers stay and score high, while a distinct at-risk segment churns silently without depressing aggregate satisfaction metrics.

**Strategic tension:** The company's current strategy targets net revenue retention (NRR) ≥ 110%. Churn reduction efforts compete for resources with expansion plays (upsell, cross-sell) that also feed NRR. A blanket retention program risks diluting expansion investment for marginal accounts that may not be worth saving at current CAC/LTV ratios.

**Decision required:** Should we invest in a targeted churn intervention program for the identified at-risk segment, or redirect resources toward expansion in healthy accounts to offset churn through growth?

**Recommendation:** Targeted churn intervention for the at-risk segment, scoped to a 90-day pilot with a kill threshold, not a blanket retention program.

**Rationale for recommendation over alternative:**
- Logo churn compounds: losing 2.6% monthly means ~27% annual logo loss, which eventually erodes the base that expansion revenue depends on.
- The NPS/churn divergence strongly suggests a hidden segment. Intervening without identifying it wastes resources; identifying it without intervening wastes the insight.
- A time-boxed pilot with clear kill criteria limits downside while generating the segmentation data we currently lack.

## Unknowns & Evidence Gaps

| # | Unknown | Impact if unresolved | Current evidence | Proposed resolution | Owner |
|---|---------|---------------------|-----------------|---------------------|-------|
| U1 | Which customer attributes predict membership in the silent-churn segment? | Cannot target intervention; waste spend on non-at-risk accounts | NPS and churn data exist but have not been joined at account level | Run cohort analysis joining NPS response history, usage telemetry, support tickets, and churn events within 2 weeks | Data/Analytics |
| U2 | Is the churn driven by product gaps, pricing, or competitive displacement? | Wrong intervention type selected | Anecdotal from CS; no systematic exit survey data | Implement structured exit survey + win/loss interviews (n≥30) over 6 weeks | Product + CS |
| U3 | What is the LTV of the churning segment vs. retained segment? | May be optimizing for low-value retention at the expense of high-value expansion | Revenue data available but not segmented by churn risk | Finance to deliver segmented LTV analysis within 2 weeks | Finance |
| U4 | Do churning accounts show detectable usage decay before cancellation? | Determines whether predictive intervention is feasible | Usage data exists but no decay analysis has been run | Analytics to run usage trajectory clustering on last 6 months of churned accounts | Data/Analytics |
| U5 | What is the competitive landscape shift? Are churners moving to a specific competitor? | Informs whether product investment or positioning is the right lever | No competitive win/loss data collected systematically | Include competitor question in exit survey; supplement with G2/Gartner review trend analysis | Product Marketing |

**Conflicting signal reconciliation:**
- NPS ↑ + Churn ↑ → Survivorship bias in NPS sampling. Churning customers either don't respond to NPS surveys or churn between survey windows. Action: cross-reference NPS non-respondents with churn list.
- Usage stable + Expansion ↓ → Retained customers plateau at current tier without growth triggers. This is a separate problem (expansion playbook) and should not be conflated with churn reduction.
- The strategic target (NRR ≥ 110%) can be met through churn reduction OR expansion. This PRD addresses churn; a parallel effort should address expansion. Combining them into one program creates accountability diffusion.

## Pass/Fail Readiness

**Assessment: CONDITIONAL PASS — proceed to pilot with gates.**

The PRD is ready to move to pilot design phase contingent on resolving U1 (segment identification) and U3 (LTV of churning segment) within 2 weeks. These two unknowns determine whether the intervention is economically justified and targetable.

| Readiness criterion | Status | Condition |
|---|---|---|
| Problem validated with data | ⚠️ Partial | Churn acceleration confirmed; root segmentation not yet done |
| Target segment identifiable | ❌ Blocked | Requires U1 resolution |
| Intervention ROI estimable | ❌ Blocked | Requires U3 resolution |
| Strategic alignment confirmed | ✅ Pass | Churn reduction directly feeds NRR target |
| Resource availability assessed | ⚠️ Partial | Pilot scope limits resource draw; full program TBD |
| Kill criteria defined | ✅ Pass | See below |

**Pilot kill criteria (90-day window):**
1. If segmentation analysis (U1) fails to identify a distinguishable at-risk cohort with ≥2x baseline churn probability → kill the targeted approach, pivot to blanket lightweight retention.
2. If LTV of churning segment (U3) is <50% of retained segment LTV → kill churn intervention, redirect to expansion plays.
3. If pilot cohort churn rate does not improve by ≥0.5 percentage points vs. control after 90 days → kill the intervention, publish learnings.

**What this PRD intentionally does NOT decide:**
- The specific intervention mechanism (that requires the segmentation and exit survey data)
- Whether to also invest in expansion plays (parallel workstream, separate PRD)
- Pricing changes (premature without U2 and U5 data)

## Recommended Next Artifact

**Primary:** Segmentation analysis deliverable (resolves U1 and U3) — 2-week timebox, owned by Data/Analytics and Finance.

**Secondary (parallel):** Exit survey design and deployment plan (resolves U2 and U5) — owned by Product and CS, 1-week design + 5-week collection.

**After gates clear:** Pilot design document specifying intervention type, target cohort, control group methodology, success metrics, and 90-day measurement plan.

**Sequence:**
1. Week 0-2: Segmentation analysis + LTV segmentation (gate check: proceed or kill)
2. Week 1-6: Exit survey collection (parallel)
3. Week 3: Pilot design document (if gate 1 passes)
4. Week 4-16: Pilot execution
5. Week 16: Pilot readout and scale/kill decision
