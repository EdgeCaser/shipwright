# PRD: Mobile-First Redesign — Decision Gate Document

**Status:** NOT READY FOR EXECUTION  
**Prepared by:** Product  
**Date:** 2026-04-16  
**Effort estimate:** 6 months engineering  

---

## Decision Frame

**The question this document answers:** Should we commit 6 months of engineering capacity to a full mobile-first redesign of the core product?

**Current decision state:** Gate 0 — evidence insufficient to open a delivery track. This PRD functions as a pre-mortem and evidence audit, not a specification for execution.

**What is being proposed:** A complete rearchitecting of the product's UI/UX for mobile-primary interaction patterns. "Full redesign" is interpreted to mean layout, navigation, interaction model, and potentially data density tradeoffs — not a responsive polish pass.

**Business case as stated:** 72% of respondents in an NPS survey of 50 power users (conducted last quarter) cited mobile experience as their top pain point.

**Why this framing matters:** A 6-month engineering commitment at typical team sizing represents $600K–$1.2M in fully-loaded cost and near-complete opportunity cost for the team. The evidentiary threshold for that commitment is not met by a single attitudinal survey of a non-representative sample.

---

## Unknowns & Evidence Gaps

### Gap 1 — Sample representativeness (Critical)
- **What we know:** 50 power users surveyed. 36 said mobile experience was top pain point.
- **What we don't know:** What fraction of total users are power users? What do casual, infrequent, or new users experience on mobile? We do not know whether power users skew desktop-heavy, have more complex workflows, or express mobile pain without behavioral follow-through — these are plausible hypotheses that require behavioral data to confirm or refute.
- **Risk if wrong:** We redesign for a vocal minority while degrading the majority experience or missing a different priority entirely.
- **Required evidence:** Segmented behavioral data showing mobile vs. desktop session split across user cohorts (power, casual, new, churned).

### Gap 2 — Behavioral confirmation (Critical)
- **What we know:** Users *say* mobile is their top pain point.
- **What we don't know:** Whether users are actually attempting and failing mobile tasks (task abandonment, error rates, session length on mobile vs. desktop), or whether this is a preference signal with low behavioral consequence.
- **Risk if wrong:** We build for an aspirational use case. Users want to use the product on mobile but don't currently try to — so reducing mobile friction may not change core metrics.
- **Required evidence:** Session recordings, funnel analysis by device type, and mobile-specific task completion rates.

### Gap 3 — Pain specificity (High)
- **What we know:** "Mobile experience" was cited as top pain point.
- **What we don't know:** Whether the pain is layout/density, load time, specific feature unavailability, auth friction, notification behavior, or something else. "Mobile experience" is not a design target.
- **Risk if wrong:** A 6-month full redesign ships and doesn't address the actual friction. User satisfaction unchanged.
- **Required evidence:** Qualitative follow-up interviews (8–12 users who flagged mobile), tagged support tickets by issue type and device, and a Jobs-to-be-Done breakdown of mobile use cases.

### Gap 4 — Competitive and market signal (Medium)
- **What we know:** Nothing from this evidence base about whether mobile is a competitive disadvantage or a hygiene expectation.
- **What we don't know:** Whether churned users cite mobile, whether mobile gap affects acquisition, whether competitors have moved.
- **Required evidence:** Churn interview tagging, sales loss analysis, and a competitive mobile audit (2–3 days of work).

### Gap 5 — Redesign scope definition (Medium)
- **What we know:** "Full mobile-first redesign" and "6 months."
- **What we don't know:** Whether 6 months assumes a parallel desktop maintenance track, a feature freeze, or a full team shift. Whether "mobile-first" means native app, PWA improvement, or responsive web. Whether existing desktop users face regression risk.
- **Risk if wrong:** Scope is misunderstood at kickoff; estimate is wrong by 2x; desktop experience degrades during execution.

---

## Pass/Fail Readiness

| Readiness Criterion | Status | Notes |
|---|---|---|
| Representative behavioral data on mobile usage | **FAIL** | No session data, no device split |
| Qualitative depth on pain specificity | **FAIL** | Survey only; no follow-up interviews |
| Broader user sample beyond power users | **FAIL** | N=50, power users only |
| Business case with metric targets | **FAIL** | No retention, conversion, or engagement targets stated |
| Scope definition and desktop regression plan | **FAIL** | Undefined |
| Competitive or churn signal | **FAIL** | Absent |
| Attitudinal signal from existing users | **PASS** | 72% of survey; directionally useful |

**Readiness verdict:** 1 of 7 criteria met. This initiative does not clear the gate for execution planning.

**What this is not saying:** Mobile experience is probably a real problem. The NPS signal is directionally meaningful. The recommendation is not to ignore mobile — it is to spend 4–6 weeks gathering evidence before committing 6 months of capacity.

---

## Recommended Next Artifact

**Artifact:** Mobile Evidence Sprint Brief  
**Owner:** Product + Analytics  
**Timeline:** 3–4 weeks  
**Effort:** 1 PM, 1 analyst, 0.5 design (research mode only)

### Sprint deliverables

1. **Device and session analysis** — Pull 90-day behavioral data: mobile vs. desktop session share by user segment, task completion rates by device, funnel drop-off by device at each key step. Target: understand whether mobile is a usage problem or a satisfaction problem.

2. **Follow-up interviews** — 8–12 users who cited mobile pain, recruited from NPS respondents. 30-minute sessions. Goal: map pain to specific jobs, flows, and failure modes. Tag to feature areas.

3. **Support ticket audit** — Tag last 90 days of tickets by device type and issue category. Quantify mobile-specific volume.

4. **Churn interview re-analysis** — If exit interviews exist, re-tag for mobile mentions. If not, flag for next churn cohort.

5. **Competitive audit** — Document 2–3 direct competitors' mobile experience. Identify table-stakes vs. differentiated features.

### Decision gate after sprint

If evidence confirms:
- Mobile sessions represent >25% of active sessions AND task completion rate on mobile is materially lower than desktop (>10pp gap), OR
- Mobile friction appears in >15% of churn interviews or support tickets

→ Proceed to scoped PRD with defined metric targets, phased delivery plan, and explicit desktop regression protection.

If evidence shows:
- Mobile is aspirational but rarely attempted, OR
- Pain concentrates in 1–2 specific flows rather than the full experience

→ Redirect to targeted intervention (specific flow fix or native feature) rather than full redesign. Revisit 6-month estimate entirely.

---

## Appendix: What a Full PRD Would Require

For reference, a PRD clearing this gate for execution would need:
- Metric targets: what does success look like in mobile session share, task completion rate, NPS improvement, and retention delta?
- Phased delivery plan: what ships at month 2, 4, 6? What is the rollback plan?
- Desktop non-regression commitment: explicit test coverage and monitoring plan
- Resource confirmation: is the 6-month estimate inclusive of design, QA, and platform work?
- Stakeholder alignment: has the business accepted opportunity cost of deprioritized roadmap items?

None of these can be responsibly written before the evidence sprint confirms the problem shape.

