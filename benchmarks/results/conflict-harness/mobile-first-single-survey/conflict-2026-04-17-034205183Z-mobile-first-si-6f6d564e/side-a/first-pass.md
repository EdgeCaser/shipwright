# PRD: Mobile-First Core Product Redesign
**Status:** NOT APPROVED — Pending Evidence Gate  
**Effort Estimate:** 6 months engineering  
**Prepared by:** Product  

---

## Decision Frame

**The decision on the table:** Commit 6 months of engineering effort to a full mobile-first redesign of the core product.

**What makes this hard:** The triggering signal is a single NPS survey of 50 power users conducted last quarter. 72% of respondents named mobile experience as their top pain point. No behavioral data, session recordings, or broader user sample corroborates or contextualizes this signal.

**Stakes:** A 6-month engineering commitment is not reversible mid-stream without significant sunk cost. If the mobile pain point is real but scoped narrowly (e.g., specific flows rather than the full product), a full redesign will over-invest. If the 50-user sample is unrepresentative of the broader user base, the redesign could harm adoption among segments that weren't surveyed.

**Framing constraint:** This PRD does not approve the redesign. It frames what would need to be true to approve it, identifies what we don't know, and recommends the next artifact required before a go/no-go decision.

---

## Proposed Scope (Conditional)

If evidence gates below are passed, the redesign would:

- Restructure navigation, layout, and interaction patterns to prioritize mobile viewport and touch-first interaction
- Establish a mobile design system as the canonical layer (desktop adapts from mobile, not vice versa)
- Require full regression coverage of existing desktop workflows before launch
- Require usability validation with a representative user sample before engineering handoff

This scope is held in conditional status. It does not proceed to engineering planning until the readiness criteria below are met.

---

## Unknowns & Evidence Gaps

### Gap 1 — Sample Representativeness
**What we know:** 50 power users were surveyed. 72% named mobile as their top pain point.  
**What we don't know:** Whether power users represent the broader user base. Power users tend to have higher engagement and may access the product from more contexts (including mobile) than average users. Their pain distribution may not generalize.  
**Risk if ignored:** We optimize for a vocal minority while degrading experience for a majority whose pain profile is unknown.

### Gap 2 — Behavioral Corroboration
**What we know:** Self-reported pain via NPS survey.  
**What we don't know:** Actual mobile session volume, task completion rates on mobile vs. desktop, drop-off points, or whether users attempt mobile and abandon it. Survey responses capture perceived pain, not observed behavior.  
**Risk if ignored:** Users may report mobile as painful because they tried it once and it was awkward — not because it's a primary workflow blocker. Or the inverse: mobile drop-off is worse than reported because frustrated users stop trying.

### Gap 3 — Pain Specificity
**What we know:** "Mobile experience" was named as top pain point.  
**What we don't know:** Which specific flows or features drive the pain. A full redesign assumes the problem is systemic. If 80% of the mobile pain is concentrated in two or three workflows, targeted fixes would cost far less than 6 months and deliver faster relief.  
**Risk if ignored:** Over-engineering the solution scope.

### Gap 4 — Survey Timing and Drift
**What we know:** The survey was conducted last quarter.  
**What we don't know:** Whether conditions have changed, whether any incremental mobile improvements shipped since, or whether the pain point ranking reflects a specific release that may already be partially addressed.  
**Risk if ignored:** Committing to a 6-month roadmap against a pain snapshot that may be stale.

### Gap 5 — Opportunity Cost
**What we know:** This requires 6 months of engineering effort.  
**What we don't know:** What else that engineering capacity would produce, and whether the mobile pain point is the highest-ROI use of that capacity across the full user base.  
**Risk if ignored:** Locking capacity against an incompletely validated problem while higher-confidence opportunities wait.

---

## Pass/Fail Readiness

The following criteria must be met before this PRD advances to engineering planning. Each is a hard gate — partial evidence does not clear a gate.

| Gate | Criterion | Status |
|------|-----------|--------|
| G1 | Behavioral data confirms mobile usage is a material share of sessions OR that mobile drop-off is measurably higher than desktop | ❌ Not met |
| G2 | Pain is confirmed across a broader, representative user sample (not limited to 50 power users) | ❌ Not met |
| G3 | Flow-level analysis identifies whether pain is systemic (justifying full redesign) or concentrated (justifying targeted fixes) | ❌ Not met |
| G4 | Opportunity cost analysis confirms mobile redesign is highest-ROI use of 6 months of engineering relative to alternatives | ❌ Not met |

**Current gate status: 0 of 4 passed. This PRD does not advance.**

---

## Recommended Next Artifact

**Do not write an engineering spec or begin redesign work.**

The next artifact is a **Discovery Sprint Brief** with the following scope:

1. **Analytics pull (1 week):** Extract mobile vs. desktop session split, task completion rates by device type, and top drop-off flows on mobile from existing instrumentation. If instrumentation doesn't cover this, that finding is itself a gate-blocker that must be resolved.

2. **Targeted user research (2–3 weeks):** Run moderated usability sessions on mobile with a sample that includes both power users and median-engagement users. Identify which specific flows drive the most friction.

3. **Broader survey replication (1 week):** Re-run a shorter version of the NPS mobile question across a larger and more representative sample to test whether the 72% finding holds.

4. **Scope decision:** After discovery, bring a revised decision frame: full mobile-first redesign vs. targeted mobile fixes for the top 2–3 flows. Estimate effort for both paths.

**Timeline to next decision point:** 4–6 weeks.  
**Engineering commitment before that point:** Zero.

If discovery confirms systemic mobile pain across a representative population, this PRD should be re-opened and gates G1–G4 re-evaluated against the new evidence. If discovery reveals concentrated pain, the PRD scope should be revised down to targeted fixes before engineering commitment.

---

## What This PRD Is Not

This document does not recommend proceeding with the redesign. It does not validate the survey finding as sufficient for a 6-month commitment. It exists to make the decision frame explicit, surface what is unknown, and prevent the team from confusing a strong survey signal with a strong evidence base. A 72% response rate on a 50-person sample is a credible hypothesis — it is not a mandate.

