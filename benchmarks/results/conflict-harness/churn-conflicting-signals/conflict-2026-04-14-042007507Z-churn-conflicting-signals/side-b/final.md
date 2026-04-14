# Churn Reduction PRD: Resolving Conflicting Signals

## Decision Frame

**Problem statement:** Churn telemetry presents contradictory signals that undermine confident intervention design. Usage frequency is stable or increasing for a segment of churning users, NPS scores remain neutral-to-positive pre-churn, yet cancellation rates are rising. Meanwhile, strategy targets emphasize net-new acquisition growth, creating resource tension with retention investment.

**Core tension:** The signals that historically predicted churn (declining usage, negative sentiment) are not firing for a meaningful portion of recent churners. This means either (a) our churn model is miscalibrated to a new churn archetype, (b) churn is being driven by external/competitive factors invisible to product telemetry, or (c) the metric definitions themselves have drifted (e.g., "active usage" includes passive/automated sessions that mask disengagement).

**Decision required:** Which interventions, if any, can proceed now with acceptable risk, and which require signal clarification first?

**Recommendation:** Pursue a two-track approach — (1) immediately deploy low-regret retention interventions that are valuable regardless of root cause, while (2) running a diagnostic sprint to resolve signal conflicts before committing to larger, hypothesis-dependent feature investments.

**Stakeholder impact:**
- **Growth team:** Acquisition targets remain primary; retention work must not cannibalize growth roadmap without clear ROI evidence. Low-regret interventions (cancellation flow, CS-led saves) draw minimal engineering resources.
- **Finance:** Each 1pp reduction in monthly churn at current base = ~$X00K ARR saved; low-regret plays can capture partial value immediately while diagnostics proceed.
- **CS/Support:** Frontline teams report qualitative signals (pricing complaints, competitor mentions) not yet systematically captured in telemetry. CS-led retention plays leverage this qualitative signal now.

---

## Unknowns & Evidence Gaps

| # | Unknown | Impact if unresolved | Current evidence quality | Proposed resolution | Blocking status |
|---|---------|---------------------|------------------------|--------------------|-----------------|
| U1 | Whether "active usage" metric masks passive/automated engagement that correlates with churn | High — large-scale engagement interventions would be misdirected | **Weak.** Current usage metric does not distinguish intentional vs. automated sessions | Instrument session-type tagging; run cohort analysis on churners vs. retained with refined activity definition | **Blocks** engagement-focused feature builds |
| U2 | Whether churn is driven by competitive displacement vs. product dissatisfaction | High — determines whether response is feature-building vs. pricing/positioning | **Anecdotal only.** CS reports competitor mentions but no systematic exit data | Deploy structured exit survey with forced-choice driver attribution; supplement with win/loss interviews (n=20) | **Blocks** large feature investment; does NOT block cancellation-flow optimization or CS save plays |
| U3 | Whether NPS timing creates survivorship bias (surveyed users self-select as engaged) | Medium — could explain why NPS doesn't predict churn | **Unknown.** NPS survey response rate and timing relative to churn not analyzed | Cross-reference NPS response timestamps with churn dates; analyze non-responder churn rates | **Non-blocking** — informational for model recalibration |
| U4 | Magnitude of revenue impact by churn segment (high-value vs. long-tail) | High — determines intervention priority and ROI | **Partial.** Aggregate churn rate known; per-segment revenue impact not broken out | Run revenue-weighted churn segmentation analysis | **Blocks** prioritization of targeted interventions; does NOT block broad-base retention plays |
| U5 | Whether strategy's acquisition-first prioritization is based on assumptions that still hold (e.g., CAC:LTV ratio, market growth rate) | Medium — if unit economics have shifted, retention may now have higher marginal ROI than acquisition | **Stale.** Last CAC:LTV analysis was 2+ quarters ago | Refresh unit economics model with current cohort data | **Non-blocking** — runs in parallel; informs resource allocation decisions at sprint end |

---

## Pass/Fail Readiness

**Readiness verdict: READY for low-regret interventions now. NOT READY for hypothesis-dependent feature investment.**

### Tier 1 — Proceed immediately (low-regret, cause-agnostic):

| Intervention | Why low-regret | Dependency on diagnostics |
|-------------|---------------|-------------------------|
| Cancellation flow optimization (save offers, reason capture) | Generates exit data AND saves some users regardless of churn driver | None — also feeds diagnostic sprint |
| CS-led proactive retention outreach to high-value at-risk accounts | Leverages existing qualitative signal from CS; worst case produces interview data | None |
| Structured exit survey deployment | Pure data collection; zero product risk | None — is part of diagnostic sprint |

### Tier 2 — Blocked pending diagnostic resolution:

| Criterion | Status | Blocking? |
|-----------|--------|-----------|
| Churn driver attribution is evidence-based (not assumed) | **FAIL** — conflicting signals mean we cannot confidently design targeted features | Yes — blocks engagement features, pricing changes |
| Usage metrics reliably distinguish engaged from passive users | **FAIL** — metric definition has not been validated against churn outcomes | Yes — blocks engagement-focused interventions |
| Revenue-weighted churn segmentation available | **FAIL** — aggregate only | Yes — blocks segment-targeted investment |

### What IS ready:
- Churn rate trend data is reliable and shows clear upward trajectory
- Product telemetry infrastructure exists to add session-type instrumentation
- CS team is available and willing to support structured exit interviews and proactive outreach
- Survey tooling is deployed and can support exit survey within days
- Cancellation flow is a known-quantity product surface with low implementation risk

### Risk of skipping diagnostics entirely:
- **Wasted build capacity:** Engineering an engagement-boosting feature when churn is pricing-driven wastes a full sprint (est. 4-6 weeks)
- **False confidence:** Leadership may interpret intervention launch as "churn handled" when root cause remains unaddressed
- **Mitigated by two-track approach:** Low-regret plays capture value now while diagnostics derisk the larger investment

---

## Recommended Next Artifact

**Two parallel workstreams:**

### Track A — Immediate (Week 1 start):
Cancellation Flow + CS Retention Playbook — lightweight implementation spec for save offers, exit survey integration, and CS outreach protocol for high-value accounts.

### Track B — Diagnostic Sprint (2-3 weeks):
1. **Week 1:** Instrument session-type tagging; deploy structured exit survey; begin revenue-weighted churn segmentation
2. **Week 1-2:** Run 10-20 structured exit interviews with recent churners across segments
3. **Week 2-3:** Analyze refined usage data against churn; cross-reference NPS timing; synthesize exit survey + interview findings
4. **Week 3:** Produce Churn Driver Attribution Report with confidence levels per driver

**Decision gate at sprint end:** If driver attribution reaches ≥70% confidence for primary churn driver, proceed to full Intervention PRD for targeted feature investment. If signals remain ambiguous, escalate to leadership with recommendation to expand diagnostic scope or accept current churn rate as cost of acquisition-first strategy.

**Artifact sequence:**
1. **Now:** Cancellation Flow Spec + CS Retention Playbook (Track A)
2. **Now:** Diagnostic Sprint Brief (Track B)
3. Churn Driver Attribution Report (output of diagnostic sprint, Week 3)
4. Churn Reduction Intervention PRD (if warranted by findings)
5. Metrics Framework for retention interventions

**Why the two-track approach:** The conflicting signals are a genuine finding that blocks confident large-scale investment. But the critique is correct that not every intervention requires full diagnostic clarity. Low-regret plays — cancellation flow, CS saves, exit data collection — are valuable under any churn scenario and generate the very data the diagnostic sprint needs. Blocking everything on five resolved unknowns would sacrifice near-term value and slow the diagnostic loop itself.
