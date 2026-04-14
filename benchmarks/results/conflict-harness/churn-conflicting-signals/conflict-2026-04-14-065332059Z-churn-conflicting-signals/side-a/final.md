# Churn Reduction PRD: Resolving Conflicting Signals

## Decision Frame

**Problem Statement:** Churn metrics are sending conflicting signals relative to strategic growth targets. Specifically:

- **Signal Conflict 1 — Volume vs. Value:** Logo churn (customer count) is declining quarter-over-quarter, suggesting improving retention. However, revenue churn (dollar-weighted) is increasing, indicating that higher-value customers are leaving at accelerating rates. These two metrics point in opposite directions and cannot both guide the same intervention.

- **Signal Conflict 2 — Engagement vs. Satisfaction:** Product usage metrics (DAU/WAU, feature adoption) show stable or increasing engagement among retained customers. Yet NPS and CSAT scores have dropped 8-12 points over the same period. Customers are using the product more but liking it less — a pattern consistent with switching-cost lock-in rather than genuine satisfaction.

- **Signal Conflict 3 — Cohort vs. Aggregate:** Aggregate retention appears healthy at 88% annual. But cohort analysis reveals that recent cohorts (last 6 months) retain at only 79%, masked by the loyalty of older cohorts. The blended number is a lagging indicator that obscures a deteriorating trend.

**Strategic Tension:** The company's current strategy targets net revenue retention (NRR) of 110%+ to support a growth narrative. Churn reduction efforts optimized for logo retention (keeping customer count high) may conflict with efforts optimized for NRR (keeping and expanding high-value accounts). These require different interventions, different team focus, and different success metrics.

**Decision Required:** Which churn definition governs prioritization — logo churn, gross revenue churn, net revenue churn, or a segment-specific composite — and what intervention portfolio follows from that choice?

**Recommendation:** The governing metric cannot be definitively selected until the evidence gaps below are resolved. However, the working hypothesis favors **gross revenue churn** as the primary candidate, with important caveats:

- *Why not net revenue churn alone:* NRR blends expansion and contraction into a single number. If expansion revenue is concentrated in a few accounts while gross churn is broad-based, NRR can look healthy while the base erodes. We do not currently know the concentration profile of expansion revenue — this is evidence gap U6 below.
- *Why not logo churn:* Logo churn is declining, which is positive but misleading if the retained logos are low-ACV accounts while high-value accounts leave. Logo churn does not weight for value.
- *Why not a segment-specific metric:* A segment-specific metric (e.g., churn rate for accounts >$50K ACV) may ultimately prove superior, but requires the root-cause segmentation in U1 before it can be designed. Choosing a segment-specific metric prematurely risks anchoring on the wrong segment boundary.
- *Why gross revenue churn as working hypothesis:* It isolates the loss signal without masking it behind expansion, and it is computable today without the segmentation work that other options require. It serves as the best available interim governing metric while evidence is gathered to validate or replace it.

This recommendation is provisional. The Evidence Synthesis Brief (see Recommended Next Artifact) must include a metric selection validation as a required output.

---

## Unknowns & Evidence Gaps

| # | Unknown | Why It Matters | Current Evidence State | Resolution Method | Timeline |
|---|---------|---------------|----------------------|-------------------|----------|
| U1 | Root cause segmentation for high-value churners | Without knowing *why* high-value customers leave, interventions are guesswork. Price? Product gaps? Support quality? Competitive displacement? | **Gap.** Exit surveys have 23% response rate and are not segmented by ACV tier. No win/loss analysis exists for churned accounts >$50K ACV. | Structured exit interviews with 15-20 churned accounts in top two ACV tiers. Supplement with CRM notes review and sales debrief synthesis. | 3-4 weeks |
| U2 | Whether engagement-satisfaction divergence predicts churn | If high-usage/low-satisfaction customers churn at higher rates than low-usage/high-satisfaction ones, the engagement metrics are false reassurance. | **Partial.** We have usage data and satisfaction scores but have not joined them to churn outcomes in a predictive model. | Survival analysis joining usage telemetry, NPS responses, and churn events at account level. | 2-3 weeks |
| U3 | Cohort quality drivers | Are recent cohorts weaker because of channel mix shift (e.g., more self-serve, less enterprise sales), product-market fit drift, or onboarding quality degradation? | **Gap.** Cohort retention is measured but not decomposed by acquisition channel, segment, or onboarding completion. | Cohort decomposition analysis by channel, segment, plan tier, and onboarding milestone completion. | 2 weeks |
| U4 | Competitive landscape shift | Are high-value customers leaving for a specific competitor, or is churn diffuse? Concentrated competitive loss requires different response than diffuse dissatisfaction. | **Gap.** No systematic competitive loss tracking. Anecdotal signal from 3 sales reps is insufficient. | Add structured "primary alternative" field to exit flow. Review Gong/call recordings from last 90 days of churned accounts for competitive mentions. | 2-3 weeks |
| U5 | Price sensitivity vs. value perception | Recent price increase (12% list price, 8% effective) coincides temporally with revenue churn acceleration. Correlation is not causation — but the timing demands investigation. | **Ambiguous.** Price increase shipped 5 months ago; revenue churn trend inflected ~3 months ago. Lag is plausible but alternative explanations exist. | Isolate price-increase cohort churn rate vs. grandfathered-price cohort. Conduct 10 price-sensitivity interviews with current at-risk accounts. | 3 weeks |
| U6 | Expansion revenue concentration and NRR composition | If expansion revenue is concentrated in a small number of accounts, NRR may mask broad-based gross churn. The choice between gross revenue churn and NRR as governing metric depends on this decomposition. | **Gap.** NRR is reported as a blended number. No breakdown exists showing expansion vs. contraction vs. churn components by account tier or concentration. | Decompose NRR into gross churn, contraction, and expansion components by ACV tier. Calculate Herfindahl index or top-10 concentration ratio for expansion revenue. | 1-2 weeks |

**Critical dependency:** Unknowns U1 and U4 must be resolved before committing to an intervention portfolio. U6 must be resolved before finalizing the governing metric selection — the current gross-revenue-churn recommendation is a working hypothesis, not a settled decision.

---

## Pass/Fail Readiness

**Readiness Verdict: NOT READY to commit to a specific intervention portfolio.**

The conflicting signals are themselves the primary finding. Proceeding to build features, adjust pricing, or restructure CS coverage without resolving the evidence gaps above risks:

1. **Wasted investment** — Building retention features for a problem driven by pricing, or cutting prices for a problem driven by product gaps.
2. **Metric gaming** — Optimizing for logo retention (easy wins with discounts to small accounts) while high-value churn continues unchecked.
3. **False confidence** — Using the 88% aggregate retention number to defer action while cohort quality deteriorates beneath it.
4. **Governing metric misalignment** — Anchoring on gross revenue churn if NRR composition analysis reveals that a segment-specific or net metric would better isolate the actionable signal.

### What IS ready now (low-risk, evidence-independent):

- **Instrument the gaps:** Deploy structured exit flow, join usage-satisfaction-churn data, decompose cohorts, and decompose NRR components. These are measurement improvements, not bets.
- **Establish a working governing metric:** Align leadership on gross revenue churn as the interim primary KPI, with explicit commitment to revisit after U6 is resolved. This is a framing decision, not a permanent intervention.
- **At-risk account flagging:** Using existing data, build a simple composite health score (usage trend + NPS + support ticket velocity + contract renewal date) to identify accounts needing proactive CS outreach. This is defensive triage, not a strategic intervention.

### What is NOT ready:

- Committing engineering resources to retention features (unknown if product is the lever)
- Pricing adjustments or discounting programs (unknown if price is the lever)
- CS team restructuring or coverage model changes (unknown if service is the lever)
- Setting a specific churn reduction target (current measurement is unreliable for target-setting)
- Finalizing the governing metric without NRR decomposition data

---

## Recommended Next Artifact

**Next artifact: Evidence Synthesis Brief (2-3 week timeframe)**

After the six evidence gaps above are investigated, produce a synthesis brief that:

1. **Segments churn root causes** by ACV tier with confidence levels
2. **Validates or falsifies** the engagement-satisfaction divergence as a churn predictor
3. **Attributes cohort quality decline** to specific acquisition or onboarding factors
4. **Sizes the revenue impact** of each root cause segment to enable prioritized intervention design
5. **Decomposes NRR** into gross churn, contraction, and expansion components by tier to validate or replace the gross-revenue-churn governing metric
6. **Recommends the final governing metric** with supporting evidence and trade-off analysis
7. **Recommends an intervention portfolio** with expected ROI ranges per intervention

This brief becomes the input to a **Churn Intervention Roadmap** (the artifact after next), which would contain specific features, programs, and resource commitments with measurable targets.

**Sequencing:**
1. *(Now)* This PRD — establishes the problem frame, working governing metric, and evidence plan
2. *(+3 weeks)* Evidence Synthesis Brief — resolves unknowns, validates metric choice, sizes opportunities
3. *(+5 weeks)* Churn Intervention Roadmap — commits to specific bets with success criteria
4. *(+8 weeks)* First intervention pilot results — validates or adjusts the portfolio

**Anti-pattern to avoid:** Skipping step 2 and jumping directly to an intervention roadmap. The conflicting signals exist precisely because the organization has been acting on incomplete data. Adding more action on incomplete data compounds the problem.
