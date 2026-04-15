# Churn Reduction PRD: Resolving Conflicting Signals

## Decision Frame

**Problem Statement:** Customer churn signals are contradicting stated strategy targets, creating paralysis in prioritization. Specifically:

- **Signal conflict 1:** NPS scores are stable/improving while monthly churn rate is increasing — satisfaction metrics suggest health, but revenue loss tells a different story.
- **Signal conflict 2:** High-value cohorts show lower churn intent in surveys but higher actual churn in billing data — stated preference diverges from revealed preference.
- **Signal conflict 3:** Growth strategy targets net-new acquisition at 3:1 spend ratio vs. retention, but CAC is rising while existing-customer LTV is compressing due to churn.

**Decision to be made:** Should we redirect resources from acquisition toward retention interventions, and if so, which churn segments justify intervention given that our leading indicators (NPS, survey intent) are unreliable predictors of actual churn behavior?

**Stakeholders:** Product (owns intervention surface), Growth (owns acquisition budget allocation), Finance (owns LTV/CAC model), CS (owns relationship signals).

**Decision deadline:** End of Q3 planning cycle. Delay beyond this means the acquisition-heavy budget locks in for 6 months.

---

## Unknowns & Evidence Gaps

| # | Unknown | Why It Matters | Current Evidence Quality | Required Evidence |
|---|---------|---------------|------------------------|------------------|
| 1 | Why NPS and churn diverge | If NPS is a lagging/vanity metric for our segment, our entire health dashboard is miscalibrated | **Weak** — no causal analysis linking NPS movement to churn cohorts | Cohort-level NPS-to-churn correlation study (min 4 quarters) |
| 2 | What triggers high-value silent churn | High-value customers leave without complaint; survey intent doesn't predict | **Absent** — no exit interview or behavioral sequence data for this cohort | Behavioral event sequence analysis for churned high-value accounts (last 12mo) |
| 3 | True retention ROI vs. acquisition ROI | Strategy assumes acquisition is more efficient; churn suggests LTV denominator is broken | **Conflicting** — Finance model uses 24mo LTV but actual median tenure may be shorter | Recalculate LTV using actual observed tenure distributions, not projected |
| 4 | Whether churn is product-driven or market-driven | Competitive entry could explain churn independent of product quality | **Weak** — anecdotal sales loss reports only | Win/loss analysis with churned accounts (n≥30) |
| 5 | Intervention effectiveness baseline | No prior retention program to benchmark against | **Absent** | Controlled pilot required before budget commitment |

**Critical finding:** The conflicting signals are not a data problem to be resolved analytically — they indicate that our measurement framework was built for a market position we no longer occupy. NPS was calibrated during low-competition period; it measures satisfaction relative to expectations that competitors have now raised.

---

## Pass/Fail Readiness

**Readiness verdict: FAIL — not ready for full resource reallocation.**

### What we CAN decide now:
- **Approve a bounded retention pilot** (≤15% of one quarter's acquisition budget) targeting high-value silent churn cohort, because the cost of learning is low relative to the cost of continued ignorance.
- **Decommission NPS as a churn predictor** in executive dashboards. Replace with behavioral leading indicators (login frequency decay, feature breadth contraction, support ticket absence in previously-active accounts).
- **Commission the 4 evidence-gathering workstreams** identified above with 6-week delivery targets.

### What we CANNOT decide now:
- Full budget reallocation from acquisition to retention — the ROI comparison (Unknown #3) is genuinely unresolved, and acting on the assumption that retention is cheaper could be wrong if churn is market-driven (Unknown #4).
- Specific retention intervention design — without behavioral sequence data (Unknown #2), we'd be guessing at mechanisms.

### Failure criteria for the pilot:
- If pilot cohort shows <5% churn reduction vs. control after 90 days, retention intervention hypothesis is weak and acquisition-heavy strategy may be correct despite rising CAC.
- If behavioral indicators fail to predict churn better than NPS within 2 quarters, our observability problem is deeper than metric selection.

---

## Recommended Next Artifact

**Next artifact: Retention Pilot Design Brief**

Scope:
1. Define high-value silent churn cohort using behavioral (not survey) signals
2. Design 3 intervention variants for controlled test (re-engagement, value demonstration, preemptive CS outreach)
3. Specify success metrics, sample size, and duration for statistical validity
4. Include kill criteria — conditions under which the pilot is terminated early

**Parallel workstream:** Measurement Framework Audit — separate artifact examining which leading indicators actually correlate with churn across all segments, to replace the broken NPS-as-health-proxy assumption.

**Timeline:** Pilot design brief within 2 weeks. Evidence workstreams report at 6 weeks. Full retention-vs-acquisition decision at Q3 planning with pilot data + evidence workstream outputs.

---

### Key Principle: Resolve Conflicts by Trusting Revealed Preference Over Stated Preference

When billing data says customers leave and surveys say they're happy, billing data wins. The strategic implication is that we've been optimizing for a satisfaction metric that doesn't predict the behavior we care about. This PRD doesn't resolve the signal conflict — it acknowledges it as the central finding and structures decisions around learning which signal to trust, rather than prematurely picking one.
