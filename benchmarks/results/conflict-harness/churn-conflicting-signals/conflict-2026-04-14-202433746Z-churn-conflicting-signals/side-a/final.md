# Churn Reduction PRD: Resolving Conflicting Signals

## Decision Frame

**Problem statement:** Churn signals (usage decline, support ticket volume, NPS trajectory, cohort drop-off) are contradicting strategic growth targets (expansion revenue, net-new logos, upsell velocity). Leadership needs a framework to decide whether to invest in retention interventions now or continue prioritizing acquisition-led growth.

**Core tension:** The business is optimizing for top-line growth metrics while leading indicators suggest the installed base is eroding. These goals conflict because:
1. **Resource allocation** — retention engineering and CS investment competes directly with growth headcount and marketing spend.
2. **Signal reliability** — churn indicators may reflect seasonal patterns, a specific cohort problem, or a systemic product-market fit drift. Without disambiguation, acting on either signal set risks misallocation.
3. **Strategy coherence** — growth targets were set assuming a baseline retention rate that may no longer hold. If churn is accelerating, the growth math breaks even if acquisition targets are hit.

**Decision to be made:** Should we (a) redirect 20-30% of growth investment toward retention, (b) run a time-boxed diagnostic before committing resources, or (c) maintain current allocation and monitor? This PRD recommends option (b) with a scoped diagnostic sprint.

**Stakeholders:** VP Product, VP Customer Success, CFO (unit economics owner), Growth Lead.

## Unknowns & Evidence Gaps

| # | Unknown | Why It Matters | Current State | What Would Resolve It |
|---|---------|---------------|---------------|----------------------|
| U1 | Is churn concentrated in a specific cohort or segment? | A cohort-specific problem has a scoped fix; broad churn signals a platform issue. | No segmented churn analysis available beyond top-line logo churn rate. | Cohort survival analysis by acquisition channel, plan tier, and onboarding quarter. |
| U2 | Are usage-decline signals leading or lagging indicators? | If leading, we have intervention runway. If lagging, churn has already been decided by customers. | Usage telemetry exists but no validated correlation model between usage drop and churn event timing. | Retrospective analysis: for customers who churned in last 6 months, what did usage look like 30/60/90 days prior? |
| U3 | What is the revenue-weighted churn rate vs. logo churn rate? | Logo churn may be high among low-value accounts while high-value accounts are stable (or vice versa). | Only logo churn is reported in current dashboards. | Revenue cohort analysis segmented by ARR band. |
| U4 | Do conflicting signals reflect measurement artifacts? | NPS survey timing, support ticket categorization changes, or usage tracking instrumentation gaps could produce false signals. | No audit of signal reliability has been conducted. | Signal integrity audit: when were tracking methods last changed, what is survey response rate by segment, are ticket categories consistent? |
| U5 | What is the cost-to-retain vs. cost-to-acquire ratio by segment? | If retention ROI exceeds acquisition ROI in affected segments, the resource allocation answer is clear. | CAC is tracked; cost-to-retain is not systematically measured. | CS team logs intervention effort; finance models LTV recovery per retained account. |

## Pass/Fail Readiness

**Readiness verdict: NOT READY to commit to a retention program.**

The conflicting signals are themselves the problem. Committing resources to a retention initiative without resolving the evidence gaps above risks:
- **False positive response:** Investing in retention for a segment that is churning for reasons outside product control (e.g., market consolidation, budget cycles) — money spent with no impact.
- **Opportunity cost:** Diverting growth resources based on ambiguous data while competitors capture market share.
- **Wrong intervention:** Churn driven by onboarding failure requires different investment than churn driven by feature gaps or pricing misalignment.

### Tiered readiness criteria

The diagnostic sprint addresses unknowns in priority order. The criteria below are split into two tiers: **must-have** criteria that are non-negotiable for any retention investment decision, and **should-have** criteria that improve decision quality but whose absence can be mitigated.

#### Tier 1 — Must-have (all required to proceed):

| Criterion | Threshold | Why non-negotiable | Status |
|-----------|-----------|-------------------|--------|
| Segmented churn analysis completed | Cohort-level data for top 5 segments | Without segmentation, any intervention is untargeted. This is the minimum to know *where* the problem is. | ❌ Not started |
| Revenue-weighted churn calculated | Calculated and segmented by ARR band | Logo churn alone cannot justify resource reallocation against growth targets; revenue impact is the CFO's decision input. | ❌ Not started |
| Signal integrity audit completed | All 4 signal sources validated or flagged with known limitations | If signals themselves are unreliable, the entire churn narrative may be a measurement artifact. Acting on bad data is worse than inaction. | ❌ Not started |

#### Tier 2 — Should-have (improve precision, not blocking):

| Criterion | Threshold | What happens without it | Status |
|-----------|-----------|------------------------|--------|
| Usage-to-churn correlation validated | ≥0.6 correlation with 60-day lead time confirmed | We proceed with segmented churn data but lack a predictive early-warning model. Intervention timing is less precise. | ❌ Not started |
| Retention ROI model drafted | Cost-to-retain vs. CAC comparison by segment | Resource allocation decision is directionally informed by churn severity but lacks precise ROI comparison. Acceptable for initial scoping. | ❌ Not started |
| Executive alignment on trade-off framework | VP Product + CFO sign off on resource reallocation criteria | Can be achieved in the same meeting where diagnostic findings are presented; does not require pre-work. | ❌ Not started |

### Diagnostic sprint design

**Timeline rationale:** The sprint is scoped to the capacity constraints that the evidence gaps themselves reveal. Tier 1 criteria depend on existing data (churn logs, usage telemetry, signal source metadata) that the data team can query without new instrumentation. Estimated effort: cohort survival analysis (3-5 days of analyst time), revenue-weighted churn (1-2 days, requires billing data join), signal audit (3-5 days across analytics and CS). With parallel execution and a dedicated analyst, 3-4 weeks is a realistic envelope.

**However, this timeline is an estimate, not a commitment.** The sprint should begin with a Week 0 feasibility check: can the data team confirm access to the required data sources within the first 3 business days? If data infrastructure gaps surface (e.g., usage telemetry not joinable to account records, billing data in a separate system without API access), the sprint scope must be revised before proceeding.

- **Week 0 (Days 1-3):** Data feasibility check. Confirm access to churn logs, usage telemetry, billing data, NPS/support ticket metadata. Identify blockers. If any Tier 1 data source is inaccessible, escalate to VP Product before continuing.
- **Week 1-2:** Data team runs cohort survival analysis and revenue-weighted churn calculation (U1, U3). Analytics begins signal integrity audit (U4).
- **Week 2-3:** Signal audit completes. If feasible, data team begins usage-to-churn correlation (U2). CS team begins intervention cost logging for retention ROI model (U5).
- **Week 3-4:** Synthesize findings into a decision brief. Present to leadership with trade-off framework.
- **Gate:** At end of sprint, revisit this PRD with evidence. All 3 Tier 1 criteria must be met to proceed to retention program design. Tier 2 criteria that remain incomplete become workstreams within the retention program itself. If any Tier 1 criterion fails, document why and determine whether the blocker is resolvable (extend diagnostic) or structural (deprioritize retention initiative).

## Recommended Next Artifact

**Next artifact:** Diagnostic Sprint Brief (scope, owners, and deliverables for the evidence-gathering sprint described above).

**Purpose:** Convert this PRD's evidence gaps into assigned workstreams with clear owners, data requirements, and output formats so the team can execute the diagnostic sprint without ambiguity. Must include the Week 0 feasibility check as an explicit gate.

**After the diagnostic sprint, the following artifacts become possible:**
1. **Churn Segmentation Report** — which segments are churning, why, and at what rate.
2. **Retention Program PRD** — scoped intervention design targeting validated churn drivers (only if Tier 1 pass criteria are met).
3. **Growth vs. Retention Resource Allocation Model** — quantified trade-off framework for executive decision-making.

Until the diagnostic sprint is complete, any retention program design would be premature and likely misallocated.
