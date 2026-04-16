# PRD: Advanced Export Feature

**Status:** HOLD — Readiness gate not met  
**Requested investment:** 10 weeks engineering  
**Sole justification on intake:** Two competitors shipped similar features in the past 30 days

---

## Decision Frame

### What decision does this PRD need to enable?

Should the team commit 10 weeks of engineering capacity to build an advanced export feature, or redirect that investment toward higher-confidence priorities?

This is **not** a question about whether export functionality is generically valuable. It is a question about whether this team, at this moment, has sufficient evidence that building this feature will produce meaningful outcomes — for users, for retention, for revenue, or for competitive positioning.

### Why this matters right now

The intake justification is that two competitors shipped advanced export features last month. Competitive moves are a legitimate signal worth investigating. They are not, by themselves, a sufficient basis for committing 10 engineering weeks. Competitor behavior is evidence about competitor strategy — it is not evidence about what our users need or what they will do differently if we ship this.

The risk of proceeding without demand validation:
- We build something no current user has asked for
- We occupy 10 weeks of roadmap with low-confidence work
- We create maintenance surface for a feature with unknown adoption
- We do not learn whether the feature gap is actually causing sales loss or churn

The risk of not proceeding:
- If the feature is genuinely table-stakes for a buyer segment, continued absence may cost deals
- Competitors establish a perception advantage in analyst/comparison contexts

These risks are **not symmetric**. The cost of a 2–3 week validation sprint is far lower than the cost of a 10-week build that produces low adoption.

---

## Unknowns & Evidence Gaps

The following items are unknown and must be resolved before this PRD can advance to execution-ready status.

| # | Unknown | Why It Matters | How to Resolve | Est. Time |
|---|---------|---------------|----------------|-----------|
| U-1 | Has any user, prospect, or churned customer ever requested advanced export? | If zero requests exist, the feature likely serves a user segment we do not yet have | Support ticket audit, CRM search, CS interview, churn exit survey review | 3–5 days |
| U-2 | Have we lost deals or experienced churn attributed to missing export capability? | This is the strongest possible signal — if sales can attribute losses, the investment justification is immediate | Sales loss report audit, deal debrief interviews with AEs | 3–5 days |
| U-3 | What specifically did competitors ship? Are their features equivalent to what we would build? | "Advanced export" is vague. Competitor features may target segments we don't serve, or may be poorly received | Competitive teardown (free trial, G2/Capterra reviews, release notes) | 2–3 days |
| U-4 | Which user workflows would advanced export unlock, and how frequently do those workflows occur? | Without this, we cannot scope the feature or measure success post-launch | 5–8 user interviews with power users or export-adjacent workflows | 1–2 weeks |
| U-5 | What does "advanced" mean in our context — formats, automation, volume, API access, scheduling? | Scope ambiguity makes the 10-week estimate unreliable | Internal scoping session after U-3 and U-4 are resolved | 2 days |
| U-6 | What is the opportunity cost of 10 weeks? What does not get built? | Competitor parity as a frame ignores the full portfolio tradeoff | Roadmap review with current prioritization context | 1 day |

**Evidence discipline note:** None of the above unknowns require user research from scratch. U-1 and U-2 are internal data audits. U-3 is a competitive teardown. Only U-4 requires primary research. The full validation set can be completed in 2–3 weeks with a single researcher or PM.

---

## Pass/Fail Readiness

This PRD is evaluated against minimum readiness criteria for proceeding to scoping and execution.

| Criterion | Required | Current Status | Pass/Fail |
|-----------|----------|---------------|-----------|
| At least one user-articulated pain point tied to export | Yes | Not established | **FAIL** |
| Quantified demand signal (tickets, requests, deal loss) | Yes | Not established | **FAIL** |
| Defined feature scope sufficient for estimation | Yes | Not established — "advanced export" is undefined | **FAIL** |
| Opportunity cost assessed against roadmap alternatives | Yes | Not established | **FAIL** |
| Success metric defined with baseline | Yes | Not established | **FAIL** |
| Competitive teardown completed | Recommended | Not completed | **FAIL** |

**Readiness verdict: NOT READY TO PROCEED**

The current basis — two competitor launches in the past 30 days — fails every readiness criterion. This does not mean the feature is wrong. It means we do not yet know whether it is right.

**What would change this verdict:**  
Any one of the following, discovered during validation, would unlock a fast-track path to execution:
- A pattern of user requests (even 5–10 tickets) for export capabilities we do not currently offer
- A confirmed deal loss or churn case attributable to missing export
- A competitive teardown showing that the competitor feature is now featured in analyst comparisons in our target segment

---

## Recommended Next Artifact

**Do not produce a full PRD at this stage.**

The recommended next artifact is a **Discovery Brief** with a 2-week time-box.

### Discovery Brief scope

**Owner:** Product (1 PM, 0.25 design, no engineering)

**Time-box:** 2 weeks

**Deliverables:**
1. Support ticket + CRM audit for any export-related requests in the past 12 months (U-1)
2. Sales loss report pull + 3–5 AE interviews on whether export has come up in deals (U-2)
3. Competitive teardown: what exactly did the two competitors ship, and what are users saying about it (U-3)
4. 5–8 power user interviews focused on data workflows and export needs (U-4)
5. One-page synthesis: proceed / do not proceed / redirect, with supporting evidence

**Decision gate:** At the end of the 2-week brief, the team reviews findings and makes one of three calls:
- **Proceed to full PRD** — demand signal confirmed, scope can be defined, engineering estimate can be validated
- **Redirect** — evidence shows a different, smaller export improvement is the actual user need
- **Deprioritize** — no demand signal found; competitive parity framing was insufficient; team moves to next priority

### Why not start the PRD now?

Starting a full PRD before these unknowns are resolved produces a document built on assumptions. That document will either (a) get revised substantially once research is completed, wasting the writing effort, or (b) never get revised, resulting in engineering building to assumptions rather than evidence. Neither outcome is acceptable for a 10-week commitment.

Two weeks of discovery protects 10 weeks of engineering.

---

## Appendix: What This PRD Would Look Like If Readiness Were Met

If the Discovery Brief returns a strong demand signal, the full PRD should include:

- **Problem statement** grounded in user quotes and quantified request volume
- **User segment** — which users need this, in what workflow context, at what frequency
- **Scope definition** — specific export formats, triggers, volume, access model
- **Success metrics** — feature adoption rate at 90 days, support ticket deflection, AE win-rate in affected deals
- **Engineering scope review** — 10-week estimate should be re-validated after scope is defined
- **Rollout plan** — beta cohort, feedback loop, GA criteria

This section is provided so the team has a clear view of what "PRD-ready" looks like and can move quickly once validation is complete.
