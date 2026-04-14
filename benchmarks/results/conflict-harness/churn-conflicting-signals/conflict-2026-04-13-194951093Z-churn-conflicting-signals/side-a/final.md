# Churn Reduction PRD: Navigating Conflicting Signals

## Decision Frame

**Problem statement:** Churn rate has increased over the trailing 90 days, but the signals driving churn contradict current strategic targets. Specifically:

- **Signal A (Usage decay):** Power-user cohorts show declining weekly active usage (WAU down 12% QoQ), suggesting product-market fit erosion in the core segment.
- **Signal B (Expansion revenue up):** Net revenue retention among surviving accounts is *increasing* (NRR 118% → 124%), suggesting the product is delivering more value to those who stay.
- **Signal C (Support ticket shift):** CSAT on resolved tickets is stable (4.2/5), but volume of "cancellation intent" tickets rose 34%. This increase in explicit cancellation signals through the support channel — without a corresponding improvement in save rate or drop in overall churn — suggests the support funnel is capturing more at-risk customers but not converting them to retained accounts.

These signals conflict with the current strategy target of **prioritizing new logo acquisition over retention**, set during the last planning cycle when churn was below threshold.

**Decision to be made:** Should we redirect resources from acquisition to retention, and if so, under what conditions and constraints?

**Stakeholders:** VP Product, VP Customer Success, CFO (unit economics owner), Growth team lead.

**Decision deadline:** End of current quarter planning cycle. Delayed action compounds churn — each month of inaction at current trajectory loses ~2.3% of ARR that would otherwise retain.

---

## Unknowns & Evidence Gaps

| # | Unknown | Why it matters | Current evidence quality | Proposed resolution |
|---|---------|---------------|------------------------|--------------------|
| U1 | **Is churn concentrated in a specific segment or broadly distributed?** | Concentration means targeted intervention; broad distribution means systemic issue. | LOW — aggregate churn rate available but no cohort breakdown shared. | Run segmented churn analysis by plan tier, tenure, industry, and acquisition channel within 1 week. |
| U2 | **What is the causal relationship between usage decay and churn?** | Usage decay could be a *leading* indicator (fixable) or *lagging* symptom of a decision already made (too late). | MEDIUM — correlation observed but no causal model. Time-to-churn after usage drop unknown. | Survival analysis on usage-decline cohorts: median days from WAU drop >20% to cancellation. |
| U3 | **Why is NRR rising while logos churn?** | If small accounts churn while large accounts expand, the revenue story masks a unit-count crisis that hits later when large accounts also reconsider. | LOW — NRR is a blended metric; no size-stratified view. | Decompose NRR into expansion, contraction, and churn by account size quartile. |
| U4 | **Are churned customers reachable for exit interviews?** | Without voice-of-churned-customer data, any intervention is guesswork. | NONE — no structured exit interview program exists. | Deploy automated exit survey (5 questions, <2 min) triggered on cancellation confirmation. Begin manual outreach to 20 recent churns within 2 weeks. |
| U5 | **What is the true cost of reacquisition vs. retention?** | Strategy targets assume acquisition CAC; if reacquisition of churned logos costs 3-5x, the acquisition-first strategy has a hidden tax. | LOW — CAC tracked for new logos only, no win-back cost data. | Finance team to estimate win-back CAC from any prior re-engagement campaigns. |
| U6 | **What is the relationship between cancellation-intent tickets and actual churn?** | The 34% rise in cancellation-intent ticket volume is directionally concerning, but without base volume, denominator (total tickets or total active accounts), ticket-to-churn conversion rate, or comparison against churned customers who never filed tickets, we cannot determine whether this signal represents a rising share of at-risk customers or merely a shift in support-seeking behavior. | LOW — ticket volume trend available but no linkage to churn outcomes or population-level context. | Join cancellation-intent tickets to churn events: what % of churns filed a ticket first? What % of filers were saved? What is the base rate trend? |

---

## Pass/Fail Readiness

**Readiness verdict: NOT READY to commit to a full retention pivot.**

Rationale:

- **FAIL — Evidence foundation:** Four of six critical unknowns (U1, U3, U5, U6) are rated LOW or NONE. We cannot confidently design an intervention without segment-level data and validated signal interpretation.
- **FAIL — Causal model:** We have correlation (usage drops → churn) but no validated causal chain. Interventions built on correlation risk treating symptoms.
- **FAIL — Signal interpretation:** The cancellation-intent ticket increase is a real signal warranting investigation, but its meaning is ambiguous. It could indicate: (a) more at-risk customers are surfacing through support, (b) a policy or UX change is routing more customers through support before cancellation, or (c) a genuine acceleration of churn intent. Without ticket-to-churn linkage (U6), we cannot distinguish these interpretations.
- **PASS — Urgency signal:** The convergence of rising churn rate, declining WAU in power-user cohorts, and increasing cancellation-intent ticket volume — even without proven causal links between them — constitutes sufficient directional evidence to justify accelerated investigation.
- **PASS — Reversibility:** Proposed next steps (analysis + exit interviews) are low-cost and non-destructive. They do not require abandoning acquisition targets.

**Conditional readiness:** If segmented analysis (U1) reveals churn concentrated in 1-2 segments, exit interviews (U4) surface actionable friction, AND ticket-to-churn linkage (U6) clarifies the support signal, we can draft a targeted retention intervention PRD within 3 weeks without pausing acquisition investment.

**Risk of inaction:** At current trajectory, compounding churn erodes ~7% of addressable ARR over the next quarter. Even if NRR masks this in revenue terms today, logo loss reduces expansion surface area for future quarters.

---

## Recommended Next Artifact

**Immediate (this week):**
1. **Churn segmentation analysis** — quantitative artifact decomposing churn by tier, tenure, channel, and size. Resolves U1 and U3.
2. **Exit interview protocol** — 5-question survey + manual outreach script for 20 recent churns. Resolves U4.
3. **Cancellation-intent ticket analysis** — join ticket data to churn outcomes: filing rate among churned customers, save/conversion rate among filers, base volume trend normalized to active accounts. Resolves U6.

**Conditional (week 2-3, if segments identified):**
4. **Targeted retention experiment brief** — hypothesis-driven intervention for the highest-churn segment, designed as a 30-day experiment with clear success/failure criteria before any permanent resource reallocation.

**Decision gate:** Reconvene stakeholders after artifacts 1, 2, and 3 are complete. If evidence confirms concentrated, addressable churn with validated leading indicators, proceed to artifact 4. If churn is broadly distributed with no clear lever, escalate to strategy review — the conflict between signals may indicate a market positioning problem, not a product problem.

**What this PRD intentionally does NOT do:** It does not recommend a specific retention feature, pricing change, or CS program. Those are premature without the evidence this PRD identifies as missing. Shipping a solution before understanding the problem is how conflicting signals become conflicting initiatives.
