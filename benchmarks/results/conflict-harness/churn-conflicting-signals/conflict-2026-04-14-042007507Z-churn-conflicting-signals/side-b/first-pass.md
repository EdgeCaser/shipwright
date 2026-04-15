# Churn Reduction PRD: Resolving Conflicting Signals

## Decision Frame

**Problem statement:** Churn telemetry presents contradictory signals that undermine confident intervention design. Usage frequency is stable or increasing for a segment of churning users, NPS scores remain neutral-to-positive pre-churn, yet cancellation rates are rising. Meanwhile, strategy targets emphasize net-new acquisition growth, creating resource tension with retention investment.

**Core tension:** The signals that historically predicted churn (declining usage, negative sentiment) are not firing for a meaningful portion of recent churners. This means either (a) our churn model is miscalibrated to a new churn archetype, (b) churn is being driven by external/competitive factors invisible to product telemetry, or (c) the metric definitions themselves have drifted (e.g., "active usage" includes passive/automated sessions that mask disengagement).

**Decision required:** Should we invest in a dedicated churn reduction initiative now despite ambiguous signal quality, or first invest in signal clarification before committing to intervention design?

**Recommendation:** Pursue a phased approach — a short diagnostic sprint (2-3 weeks) to resolve signal conflicts before committing engineering resources to intervention features. Premature intervention risks optimizing for the wrong churn driver and wasting a quarter of build capacity.

**Stakeholder impact:**
- **Growth team:** Acquisition targets remain primary; retention work must not cannibalize growth roadmap without clear ROI evidence.
- **Finance:** Each 1pp reduction in monthly churn at current base = ~$X00K ARR saved; but only if interventions address actual drivers.
- **CS/Support:** Frontline teams report qualitative signals (pricing complaints, competitor mentions) not yet systematically captured in telemetry.

---

## Unknowns & Evidence Gaps

| # | Unknown | Impact if unresolved | Current evidence quality | Proposed resolution |
|---|---------|---------------------|------------------------|--------------------|
| U1 | Whether "active usage" metric masks passive/automated engagement that correlates with churn | High — interventions targeting engagement would be misdirected | **Weak.** Current usage metric does not distinguish intentional vs. automated sessions | Instrument session-type tagging; run cohort analysis on churners vs. retained with refined activity definition |
| U2 | Whether churn is driven by competitive displacement vs. product dissatisfaction | High — determines whether response is feature-building vs. pricing/positioning | **Anecdotal only.** CS reports competitor mentions but no systematic exit data | Deploy structured exit survey with forced-choice driver attribution; supplement with win/loss interviews (n=20) |
| U3 | Whether NPS timing creates survivorship bias (surveyed users self-select as engaged) | Medium — could explain why NPS doesn't predict churn | **Unknown.** NPS survey response rate and timing relative to churn not analyzed | Cross-reference NPS response timestamps with churn dates; analyze non-responder churn rates |
| U4 | Magnitude of revenue impact by churn segment (high-value vs. long-tail) | High — determines intervention priority and ROI | **Partial.** Aggregate churn rate known; per-segment revenue impact not broken out | Run revenue-weighted churn segmentation analysis |
| U5 | Whether strategy's acquisition-first prioritization is based on assumptions that still hold (e.g., CAC:LTV ratio, market growth rate) | Medium — if unit economics have shifted, retention may now have higher marginal ROI than acquisition | **Stale.** Last CAC:LTV analysis was 2+ quarters ago | Refresh unit economics model with current cohort data |

---

## Pass/Fail Readiness

**Readiness verdict: NOT READY for intervention design. READY for diagnostic sprint.**

### Pass criteria for proceeding to intervention PRD:

| Criterion | Status | Blocking? |
|-----------|--------|-----------|
| Churn driver attribution is evidence-based (not assumed) | **FAIL** — conflicting signals mean we cannot confidently attribute churn drivers | Yes |
| Usage metrics reliably distinguish engaged from passive users | **FAIL** — metric definition has not been validated against churn outcomes | Yes |
| Revenue-weighted churn segmentation available | **FAIL** — aggregate only | Yes |
| Exit/cancellation reason data collected systematically | **FAIL** — anecdotal CS reports only | Yes |
| Retention ROI case validated against acquisition ROI | **FAIL** — stale unit economics | No (can run in parallel) |

### What IS ready:
- Churn rate trend data is reliable and shows clear upward trajectory
- Product telemetry infrastructure exists to add session-type instrumentation
- CS team is available and willing to support structured exit interviews
- Survey tooling is deployed and can support exit survey within days

### Risk of proceeding without resolution:
- **Wasted build capacity:** Engineering an engagement-boosting feature when churn is pricing-driven wastes a full sprint (est. 4-6 weeks)
- **False confidence:** Leadership may interpret intervention launch as "churn handled" when root cause remains unaddressed
- **Opportunity cost:** Diagnostic sprint costs 2-3 weeks; wrong intervention costs 4-6 weeks plus reputational risk of failed initiative

---

## Recommended Next Artifact

**Immediate next step:** Diagnostic Sprint Brief (not a full PRD)

**Scope of diagnostic sprint (2-3 weeks):**
1. **Week 1:** Instrument session-type tagging; deploy structured exit survey; begin revenue-weighted churn segmentation
2. **Week 1-2:** Run 10-20 structured exit interviews with recent churners across segments
3. **Week 2-3:** Analyze refined usage data against churn; cross-reference NPS timing; synthesize exit survey + interview findings
4. **Week 3:** Produce Churn Driver Attribution Report with confidence levels per driver

**Decision gate at sprint end:** If driver attribution reaches ≥70% confidence for primary churn driver, proceed to full Intervention PRD. If signals remain ambiguous, escalate to leadership with recommendation to expand diagnostic scope or accept current churn rate as cost of acquisition-first strategy.

**Artifact sequence:**
1. ~~Churn Reduction PRD~~ → **Diagnostic Sprint Brief** (this recommendation)
2. Churn Driver Attribution Report (output of diagnostic sprint)
3. Churn Reduction PRD (if warranted by findings)
4. Intervention Design Spec
5. Metrics Framework for retention interventions

**Why not skip to building interventions:** The conflicting signals are not a nuisance — they are the finding. Building without resolving them means we are gambling engineering capacity on an unvalidated hypothesis about why users leave. The diagnostic sprint is the cheapest way to derisk the full initiative.
