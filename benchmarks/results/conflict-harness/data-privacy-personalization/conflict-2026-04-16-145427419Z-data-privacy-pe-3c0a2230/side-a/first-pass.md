# PRD: Personalized Recommendation Engine
**Status:** Pre-approval — blocked on privacy policy resolution  
**Prepared by:** Product  
**Last updated:** 2026-04-16  
**Classification:** Internal draft — do not distribute externally

---

## Decision Frame

### What decision does this document support?
Whether to proceed with building a behavioral recommendation engine that requires 18-month user history retention, given that the current privacy policy commits to 90-day behavioral data deletion — a commitment made publicly as a trust differentiator.

This is not a build/don't-build decision yet. It is a **proceed-to-scoping vs. stop-and-resolve-preconditions** decision. The feature cannot enter detailed scoping until the privacy conflict is resolved upstream.

### The core tension
The feature's accuracy model has a hard dependency on longitudinal behavioral data. Internal analysis (unvalidated — see Unknowns) suggests meaningful recommendation lift requires a minimum 12–18 months of per-user event history. The current privacy policy states:

> *"We delete all behavioral data within 90 days. This is a commitment, not a default setting."*

This language was published deliberately as a competitive trust signal. Walking it back — or silently building around it — carries brand, legal, and regulatory risk that is not currently quantified.

### Options on the table

| Option | Description | Privacy policy change required? | Feasibility signal |
|--------|-------------|--------------------------------|--------------------|
| A | Build as specified (18-month retention) | Yes — major revision | Blocked until legal + comms sign off |
| B | Build with degraded accuracy on 90-day window | No | Accuracy floor unknown — may not meet product bar |
| C | Federated/on-device model — no server-side retention | No | Engineering feasibility unvalidated |
| D | Opt-in extended retention with explicit user consent | Partial — requires addendum | Adoption rate unknown; may produce biased training set |
| E | Do not build this feature at this time | No | Forgoes competitive upside |

This PRD does **not** recommend between these options. It is scoped to surface the decision clearly and identify what evidence is needed to make it responsibly.

---

## Feature Intent (conditional on preconditions clearing)

### Problem statement
Users with repeat sessions currently receive identical content orderings regardless of demonstrated preferences. Engagement data shows that users who self-curate (manually selecting categories) have 2.3× higher retention at 90 days than users who do not. A behavioral recommendation layer could extend this effect to users who do not manually curate.

### Target users
Users with ≥3 sessions in 30 days who have not explicitly configured preferences — estimated at 34% of MAU based on current cohort data.

### Success metrics (conditional)
- Primary: 90-day retention lift of ≥10% in treatment cohort vs. control
- Secondary: Session depth (pages/session) ≥8% lift
- Guardrail: User-reported trust score does not decline vs. baseline (measured via quarterly survey)
- Guardrail: Zero regulatory findings related to data retention practices

### What this feature does not include
- Cross-user collaborative filtering (out of scope for v1 due to data volume requirements)
- Real-time personalization (latency constraints — future phase)
- Personalization of pricing, promotions, or access tiers (separate governance track)

---

## Unknowns & Evidence Gaps

The following gaps must be resolved before this feature can proceed to scoping. Each is tagged with the team responsible for generating the evidence.

### Gap 1 — Accuracy floor at 90-day retention window [CRITICAL]
**What we don't know:** Whether a model trained on 90-day behavioral windows produces recommendation quality that clears the product accuracy bar, or whether the 18-month figure is a design assumption vs. a validated threshold.  
**Why it matters:** If 90-day windows are sufficient, Option B becomes viable and the privacy conflict dissolves.  
**Owner:** Data Science  
**Evidence needed:** Retrospective model evaluation using existing data, comparing 90-day vs. 180-day vs. 365-day training windows on a held-out test set. Deliverable: accuracy curve by training window length with confidence intervals.  
**Blocking?** Yes — this should be run before any other work proceeds.

### Gap 2 — On-device / federated learning feasibility [HIGH]
**What we don't know:** Whether the recommendation model can be trained locally on-device without server-side behavioral retention, and whether this is achievable within 2 engineering quarters.  
**Why it matters:** Option C would eliminate the privacy conflict entirely.  
**Owner:** ML Platform Engineering  
**Evidence needed:** Spike (2–3 days) to assess model size, device compute requirements, and iOS/Android API constraints. Deliverable: feasibility memo with go/no-go recommendation.  
**Blocking?** Parallel track — does not need to wait for Gap 1.

### Gap 3 — Legal exposure from policy revision [CRITICAL]
**What we don't know:** Whether revising the privacy policy to extend retention constitutes a material change requiring user re-consent, what the regulatory exposure is under GDPR/CCPA/applicable law, and whether the 90-day commitment creates contractual obligations for any enterprise customers.  
**Why it matters:** Even if the product decision favors policy revision, the legal path and timeline are unknown.  
**Owner:** Legal / Privacy Counsel  
**Evidence needed:** Written assessment covering: (a) re-consent requirements, (b) regulatory risk surface, (c) enterprise contract review, (d) estimated timeline for compliant policy update.  
**Blocking?** Yes for Option A.

### Gap 4 — Brand risk of policy rollback [HIGH]
**What we don't know:** How users and press would respond to a privacy policy change that reduces protections previously marketed as a trust differentiator. Whether the trust score guardrail is even measurable before damage occurs.  
**Why it matters:** The 90-day commitment was a deliberate positioning choice, not a technical accident. Reversing it is a brand decision, not just a legal one.  
**Owner:** Marketing / Brand, with input from Customer Success  
**Evidence needed:** User research (qualitative, n≥20 interviews) on how users interpret and value the 90-day commitment. Optional: press/analyst sentiment assessment. Deliverable: risk memo with user verbatims.  
**Blocking?** Parallel track — required before any public communication.

### Gap 5 — Opt-in adoption rate for extended retention [MEDIUM]
**What we don't know:** What fraction of users would consent to extended behavioral retention under Option D, and whether that cohort would produce a representative (non-biased) training dataset.  
**Why it matters:** If opt-in rate is <15%, the training set may not generalize; the feature would effectively personalize only for a self-selected power-user segment.  
**Owner:** Product Analytics + Data Science  
**Evidence needed:** Benchmark against comparable opt-in consent flows in similar products. Deliverable: adoption rate range estimate with methodology note.  
**Blocking?** Required before Option D can be evaluated seriously.

---

## Pass/Fail Readiness

This section defines explicit gates. The feature does not advance to detailed scoping until all CRITICAL gates are cleared. HIGH gates should be cleared before engineering kickoff.

| Gate | Criteria | Status | Severity |
|------|----------|--------|----------|
| G1 | Data Science delivers accuracy-by-window-length curve | Not started | CRITICAL |
| G2 | Legal delivers written retention-change risk assessment | Not started | CRITICAL |
| G3 | ML Eng delivers federated learning feasibility memo | Not started | HIGH |
| G4 | Brand delivers user research memo on policy rollback risk | Not started | HIGH |
| G5 | Product selects one of Options A–E based on G1–G4 evidence | Blocked on G1–G4 | CRITICAL |
| G6 | If Option A or D: Privacy Counsel approves updated policy draft | Blocked on G5 | CRITICAL |
| G7 | If Option A: Comms plan for policy change approved by Brand + Legal | Blocked on G5 | HIGH |

**Current readiness state: NOT READY.** Feature is blocked at G1 and G2. Scoping work, design, or engineering should not begin until G5 clears.

### What happens if we skip gates
Proceeding without G1: Engineering may build for 18-month retention only to discover 90-day is sufficient — sunk infrastructure cost plus unnecessary policy conflict.  
Proceeding without G2: Legal exposure from a policy change executed without counsel review; potential re-consent obligations unmet.  
Proceeding without G4: Brand damage from a public policy rollback may permanently impair the trust positioning that was a deliberate competitive asset.

---

## Recommended Next Artifact

**Immediate next artifact:** Data Science accuracy analysis (Gap 1) — a technical memo, not a PRD. This is the lowest-cost, highest-information piece of evidence available. It either dissolves the privacy conflict (if 90-day windows are sufficient) or confirms it (if they are not), which gates every subsequent decision.

**Parallel artifact:** ML Engineering federated learning feasibility spike memo (Gap 2). Two to three engineer-days. Should be commissioned simultaneously.

**If Gap 1 confirms 18-month window is required:**  
Next artifact escalates to an **Option Selection Brief** — a one-page document presented to the executive sponsor and legal counsel that lays out Options A, C, and D with the evidence from Gaps 1–5 and requests a binding option selection. That brief gates this PRD returning for revision.

**If Gap 1 finds 90-day window is sufficient:**  
Return to this PRD, remove the privacy conflict section, and proceed to standard scoping with a revised accuracy metric grounded in the window-length analysis.

**Do not commission design, engineering estimation, or go-to-market planning until the Option Selection Brief produces a decision.** Resource spend before that point is speculative and may be entirely wasted depending on which option is selected.

---

## Appendix: Why this PRD stops here

A PRD that specifies requirements for a feature that cannot be built as specified — without acknowledging the blocker — is a planning liability, not an asset. The value of this document is in making the decision structure visible and ensuring the right evidence is generated in the right order.

The privacy policy conflict is not a detail to be resolved in implementation. It is a product strategy question: whether to revise a publicly-made user trust commitment for competitive feature parity. That question has legal, brand, and regulatory dimensions that must be resolved above the product team level before build work begins.

This document will be updated when the Option Selection Brief produces a binding decision.
