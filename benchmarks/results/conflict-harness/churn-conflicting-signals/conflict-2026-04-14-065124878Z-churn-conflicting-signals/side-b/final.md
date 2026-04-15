# Churn Reduction PRD: Resolving Conflicting Signals

## Decision Frame

**Problem statement:** Churn telemetry presents contradictory signals that undermine confidence in any single intervention. NPS scores trend upward (+4 pts QoQ) while monthly logo churn accelerates (1.8% → 2.6% over two quarters). Usage frequency is stable among retained cohorts, yet expansion revenue per account is declining. These conflicts have multiple plausible explanations — survivorship bias in NPS sampling, billing-cycle effects, competitive displacement, or a segmentation problem where a distinct at-risk segment churns silently without depressing aggregate satisfaction metrics. The true driver is currently unknown, and this PRD treats root-cause identification as a prerequisite gate rather than an assumption.

**Strategic tension:** The company's current strategy targets net revenue retention (NRR) ≥ 110%. Churn reduction efforts compete for resources with expansion plays (upsell, cross-sell) that also feed NRR. A blanket retention program risks diluting expansion investment for marginal accounts that may not be worth saving at current CAC/LTV ratios.

**Decision required:** Should we invest in a targeted churn intervention program for an identified at-risk segment, or redirect resources toward expansion in healthy accounts to offset churn through growth?

**Recommendation:** Targeted churn intervention scoped to a 90-day pilot with a kill threshold — but only after a 2-week diagnostic phase that validates which explanation for the NPS/churn divergence is correct and whether a targetable at-risk segment exists.

**Rationale for recommendation over alternative:**
- Logo churn compounds: losing 2.6% monthly means ~27% annual logo loss, which eventually erodes the base that expansion revenue depends on.
- The NPS/churn divergence has multiple plausible explanations (survivorship bias, billing cycles, competitive displacement). The diagnostic phase is designed to discriminate among them before committing to an intervention.
- A time-boxed pilot with clear kill criteria limits downside while generating the segmentation data we currently lack.

## Unknowns & Evidence Gaps

| # | Unknown | Impact if unresolved | Current evidence | Proposed resolution | Owner |
|---|---------|---------------------|-----------------|---------------------|-------|
| U1 | What explains the NPS ↑ / churn ↑ divergence? Is it survivorship bias in NPS sampling, billing-cycle effects, competitive displacement, or another cause? | Selecting the wrong intervention type; potentially misallocating resources toward a segment-based approach when the driver is structural | NPS trend and churn trend data exist separately but have not been joined or analyzed for causal mechanism. No NPS response-rate breakdown by churn status. No billing-cycle overlay on churn timing. | Cross-reference NPS non-respondents with churn list; overlay billing renewal dates on churn events; run cohort analysis joining NPS, usage, support, and churn at account level within 2 weeks | Data/Analytics |
| U2 | Which customer attributes predict membership in the at-risk segment (if a distinct segment exists)? | Cannot target intervention; waste spend on non-at-risk accounts | NPS and churn data exist but have not been joined at account level | Contingent on U1 confirming a segmentation explanation: run cohort analysis within 2 weeks of U1 resolution | Data/Analytics |
| U3 | Is the churn driven by product gaps, pricing, or competitive displacement? | Wrong intervention type selected | Anecdotal from CS; no systematic exit survey data | Implement structured exit survey + win/loss interviews (n≥30) over 6 weeks | Product + CS |
| U4 | What is the LTV of the churning segment vs. retained segment? | May be optimizing for low-value retention at the expense of high-value expansion | Revenue data available but not segmented by churn risk | Finance to deliver segmented LTV analysis within 2 weeks | Finance |
| U5 | Do churning accounts show detectable usage decay before cancellation? | Determines whether predictive intervention is feasible | Usage data exists but no decay analysis has been run | Analytics to run usage trajectory clustering on last 6 months of churned accounts | Data/Analytics |
| U6 | What is the competitive landscape shift? Are churners moving to a specific competitor? | Informs whether product investment or positioning is the right lever | No competitive win/loss data collected systematically | Include competitor question in exit survey; supplement with G2/Gartner review trend analysis | Product Marketing |

**Conflicting signal reconciliation — hypotheses to test (not assumed conclusions):**
- **Hypothesis A (survivorship bias):** NPS ↑ + Churn ↑ because churning customers don't respond to NPS surveys or churn between survey windows. *Test:* Cross-reference NPS non-respondent list with churn list; compare NPS response rates for churned vs. retained accounts.
- **Hypothesis B (billing-cycle effect):** Churn acceleration coincides with annual renewal cohort timing, not a change in satisfaction. *Test:* Overlay billing renewal dates on churn event dates; check if churn spike concentrates around renewal windows.
- **Hypothesis C (competitive displacement):** A new competitor entered or repriced, pulling a specific segment regardless of satisfaction. *Test:* Exit survey competitor question + G2/Gartner review trends.
- **Hypothesis D (value plateau):** Usage stable + Expansion ↓ indicates retained customers plateau at current tier without growth triggers, while accounts that needed more than the product offers leave. *Test:* Compare feature usage breadth between churned and retained accounts.
- These hypotheses are not mutually exclusive. The diagnostic phase should assess relative contribution of each.

**Note on separation of concerns:** The strategic target (NRR ≥ 110%) can be met through churn reduction OR expansion. This PRD addresses churn; a parallel effort should address expansion. Combining them into one program creates accountability diffusion.

## Pass/Fail Readiness

**Assessment: CONDITIONAL PASS — proceed to diagnostic phase with gates.**

The PRD is ready to move to a 2-week diagnostic phase. Pilot design is contingent on the diagnostic confirming a targetable at-risk segment (U1 → U2) and validating that the churning segment's LTV justifies intervention (U4).

| Readiness criterion | Status | Condition |
|---|---|---|
| Problem validated with data | ⚠️ Partial | Churn acceleration confirmed; root cause mechanism not yet determined |
| Root cause hypotheses enumerated | ✅ Pass | Four testable hypotheses defined with specific validation methods |
| Target segment identifiable | ❌ Blocked | Requires U1 and U2 resolution |
| Intervention ROI estimable | ❌ Blocked | Requires U4 resolution |
| Strategic alignment confirmed | ✅ Pass | Churn reduction directly feeds NRR target |
| Resource availability assessed | ⚠️ Partial | Diagnostic phase is low-cost; pilot scope limits resource draw; full program TBD |
| Kill criteria defined | ✅ Pass | See below |

**Diagnostic phase kill criteria (2-week window):**
1. If none of the four hypotheses produces a statistically distinguishable signal → escalate to executive review with finding that churn driver is diffuse, recommend blanket lightweight retention tactics rather than targeted program.
2. If LTV of churning segment (U4) is <50% of retained segment LTV → kill churn intervention, redirect to expansion plays.

**Pilot kill criteria (90-day window, contingent on passing diagnostic gates):**
1. If segmentation analysis fails to identify a distinguishable at-risk cohort with ≥2x baseline churn probability → kill the targeted approach, pivot to blanket lightweight retention.
2. If pilot cohort churn rate does not improve by ≥0.5 percentage points vs. control after 90 days → kill the intervention, publish learnings.

**What this PRD intentionally does NOT decide:**
- The specific intervention mechanism (requires diagnostic and exit survey data)
- Whether to also invest in expansion plays (parallel workstream, separate PRD)
- Pricing changes (premature without U3 and U6 data)

## Recommended Next Artifact

**Primary:** Diagnostic analysis plan (resolves U1 and U4) — 2-week timebox, owned by Data/Analytics and Finance. Deliverable: a report identifying which hypothesis or combination best explains the NPS/churn divergence, with a recommendation on whether a targetable segment exists.

**Secondary (parallel):** Exit survey design and deployment plan (resolves U3 and U6) — owned by Product and CS, 1-week design + 5-week collection.

**After diagnostic gates clear:** Pilot design document specifying intervention type, target cohort, control group methodology, success metrics, and 90-day measurement plan.

**Sequence:**
1. Week 0-2: Diagnostic analysis — test all four hypotheses, deliver segmented LTV (gate check: proceed or pivot)
2. Week 1-6: Exit survey collection (parallel)
3. Week 3: Pilot design document (if diagnostic gate passes)
4. Week 4-16: Pilot execution
5. Week 16: Pilot readout and scale/kill decision
