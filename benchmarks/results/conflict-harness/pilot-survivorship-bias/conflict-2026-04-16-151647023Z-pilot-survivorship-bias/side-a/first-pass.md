# PRD: Onboarding Flow Expansion — Evidence Review & Decision Gate

**Status:** BLOCKED — Evidence gaps must be resolved before expansion is approved  
**Decision Owner:** Head of Product  
**Last Updated:** 2026-04-16

---

## Decision Frame

The product team is evaluating whether to expand a redesigned onboarding flow from a 90-day pilot to the full user base. The pilot reported 34% better 30-day retention compared to a control group.

**The decision is not** "should we ship this feature?" — that may well be the right answer. **The decision is** whether the evidence currently in hand is sufficient to justify full rollout, or whether a targeted follow-on analysis would de-risk the investment.

### What the pilot shows
- Pilot users retained at a 34% higher rate vs. control at 30 days.
- The pilot ran for 90 days.

### What the pilot does not show
- Whether the retention lift is attributable to the onboarding flow, or to the self-selection behavior of users who opted in.
- How users behaved inside the pilot funnel (no within-pilot drop-off data reported).
- Whether users who declined the opt-in email are meaningfully different from those who accepted — in motivation, intent, or baseline engagement.

### Why this matters for the decision
If the retention difference is largely explained by opt-in intent (i.e., users who respond to "try something new" emails are inherently more engaged), then expanding the flow to all users — including those who would never have opted in — may produce materially weaker retention outcomes than the pilot implies. Shipping based on the current read risks over-investing in a feature whose causal lift is unknown, and generates misleading baseline metrics for future product decisions.

---

## Unknowns & Evidence Gaps

### Gap 1 — Opt-in Confound (Critical)

**What we don't know:** Whether users who responded to the opt-in email have systematically higher engagement intent than non-respondents, independent of the new onboarding flow.

**Why it's critical:** This is the primary alternative explanation for the 34% lift. If email-responsive users retain at higher rates regardless of which onboarding they receive, the lift belongs to the audience, not the product.

**Minimum evidence needed to close:** A comparison of historical 30-day retention for email-responsive vs. non-responsive user segments using pre-pilot data, or a holdout arm within the pilot (opted-in users, old onboarding) if one exists.

---

### Gap 2 — Within-Pilot Drop-off Not Reported (High)

**What we don't know:** At what step(s) in the new onboarding flow do users exit? What is the completion rate?

**Why it matters:** A retention lift measured at 30 days could be driven by a small segment of users who completed onboarding and became highly active, while a large fraction dropped off early and were effectively unaffected. This changes the product story — and the fix, if any.

**Minimum evidence needed to close:** Step-by-step funnel analysis for pilot users (reach, start, each step, completion).

---

### Gap 3 — Control Group Composition (Medium)

**What we don't know:** How the control group was constructed. Was it:
- Users who received the email and did not respond?
- A random holdout of all new users during the pilot period?
- Users who signed up outside the pilot window?

**Why it matters:** A control group of non-respondents to the same email is a stronger confound signal, not a clean control. A truly randomized holdout would substantially strengthen the causal claim.

**Minimum evidence needed to close:** Documentation of control group assignment methodology.

---

### Gap 4 — Retention Decay Beyond 30 Days (Low / Opportunistic)

**What we don't know:** Whether the 30-day retention advantage holds at 60 and 90 days. With a 90-day pilot, this data exists but was not reported.

**Why it matters:** Onboarding improvements that pull users through early activation sometimes show washout as novelty fades. If the 34% gap narrows by day 90, the business case weakens.

**Minimum evidence needed to close:** Pull 60- and 90-day retention curves for pilot vs. control from existing data.

---

## Pass/Fail Readiness

Full expansion should be gated on the following criteria. Each is independently blocking.

| # | Criterion | Current Status | Owner |
|---|-----------|---------------|-------|
| 1 | Opt-in confound addressed (Gap 1) | ❌ Not analyzed | Analytics |
| 2 | Within-pilot funnel data reviewed (Gap 2) | ❌ Not reported | Analytics |
| 3 | Control group methodology confirmed (Gap 3) | ❌ Unclear | Analytics / PM |
| 4 | 60/90-day retention reviewed (Gap 4) | ⚠️ Data exists, not pulled | Analytics |

**Current recommendation:** Do not proceed to full rollout. Proceed to follow-on analysis (see Recommended Next Artifact).

### Conditional approval path
If Gap 1 and Gap 2 are closed with findings that support the causal claim, expansion to a broader randomized A/B test (not full rollout) is the appropriate next step. Full rollout requires the A/B test to replicate the retention lift in a non-self-selected population.

---

## Recommended Next Artifact

**Artifact:** Analysis Brief — Pilot Validity Assessment  
**Owner:** Analytics  
**Turnaround:** 5–7 business days  
**Scope:**

1. Run pre-pilot historical retention comparison: email-responsive vs. non-responsive user cohorts (closes Gap 1).
2. Pull step-level funnel data for pilot cohort (closes Gap 2).
3. Document control group assignment method (closes Gap 3).
4. Pull 60/90-day retention curves (closes Gap 4).

**Output:** A one-page findings memo with a single recommendation: (a) proceed to broad A/B test, (b) redesign the study, or (c) abandon the expansion.

**If findings support proceeding:** The follow-on artifact is a **Test Plan PRD** for a randomized A/B test targeting a representative 20% of new users, with pre-registered success metrics and a commit to read results before any further expansion.

---

## Appendix: What a Strong Evidence Package Would Look Like

For reference, the evidence bar for a full-rollout decision on an onboarding change of this scope should include:

- Randomized assignment (not opt-in) in the test population
- Documented control group construction
- Step-level funnel analysis with statistical significance at each drop-off
- 30-, 60-, and 90-day retention curves
- Segment analysis confirming lift is not concentrated in one acquisition channel or cohort
- No interaction with other in-flight tests during the pilot window

The current pilot meets none of these bars. That does not mean the feature is bad — it means the evidence is immature for a full-rollout decision.
