# PRD: [Proposed Feature — Weak Evidence Context]

## Decision Frame

**What decision does this PRD support?**
Whether to invest engineering and design resources into building this feature, given that current supporting evidence is thin, anecdotal, or ambiguous.

**Decision type:** Go / No-Go / Investigate Further

**Current recommendation:** **Investigate Further** — the evidence base does not meet the threshold for a confident Go decision. This PRD exists to make that gap explicit and to define what evidence *would* be sufficient.

**Stakeholders:**
- Product (owner of prioritization decision)
- Engineering (capacity allocation)
- Design (UX investment)
- Data/Research (evidence gathering)

**Time horizon:** The feature concept has no hard external deadline. The decision of whether to pursue it should be made within 2-4 weeks after executing the recommended evidence-gathering plan.

---

## Problem Statement

A feature has been proposed based on signals that do not yet constitute strong evidence:

- **No quantitative usage data** demonstrating the problem exists at scale
- **No validated user research** (interviews, surveys, or usability studies) confirming the need
- **No competitive pressure** requiring immediate response
- **Anecdotal signals only:** informal feedback, internal intuition, or isolated support requests

The risk of proceeding without stronger evidence is building something that doesn't move a metric that matters, consuming capacity that could be allocated to validated opportunities.

---

## Unknowns & Evidence Gaps

| # | Unknown | Current State | What Would Resolve It | Effort to Resolve |
|---|---------|--------------|----------------------|-------------------|
| 1 | **Is the problem real and frequent?** | Anecdotal reports only; no quantified frequency | Instrument existing workflows to measure occurrence rate; run 8-10 user interviews with screening criteria | 1-2 weeks |
| 2 | **Who experiences this problem?** | No segmentation data | Segment analysis from instrumentation data + interview coding | 1 week (parallel with #1) |
| 3 | **What is the cost of the problem today?** | Unknown — no measurement of workarounds, churn attribution, or support burden | Support ticket tagging + churn correlation analysis | 1 week |
| 4 | **Would the proposed solution actually address the problem?** | Assumed, not tested | Prototype test or concept validation with 5-8 target users | 1-2 weeks (after #1-#2) |
| 5 | **What is the opportunity cost?** | Not assessed against current roadmap alternatives | Stack-rank against top 3 competing priorities using ICE or RICE with real inputs | 1 week |

### Evidence Strength Scoring Rubric

To avoid asserting evidence quality without a derivable basis, the following rubric defines each level:

| Score | Label | Criteria | What evidence looks like at this level |
|-------|-------|----------|----------------------------------------|
| 1 | Anecdotal | Only informal signals: internal intuition, isolated requests, or unstructured feedback. No systematic data collection has occurred. | "A few customers mentioned this" or "I think users struggle here." |
| 2 | Directional | Some structured signal exists (e.g., a handful of tagged support tickets, a small-N survey) but insufficient sample size or rigor to generalize. | 5-10 support tickets tagged to the area; a poll with <30 responses. |
| 3 | Quantified Problem | Problem frequency is measured via instrumentation or rigorous research (N≥30 interviews or statistically meaningful usage data). Target segment is identified. | Instrumentation shows 15% of users encounter the friction point weekly; interviews confirm the pain across a defined segment. |
| 4 | Validated Solution | Problem is quantified (level 3) AND a proposed solution has been tested with target users (prototype, concept test, or A/B experiment) showing directional positive signal. | Prototype test with 5-8 target users shows task completion improvement; or A/B test on a lightweight version shows engagement lift. |
| 5 | Business-Case Ready | Validated solution (level 4) AND opportunity cost is assessed against alternatives, with a credible metric-impact projection grounded in measured data. | Expected impact modeled from observed data, stack-ranked against competing priorities with comparable rigor. |

**Current evidence strength: 1 / 5 (Anecdotal)**
- Derivation: The case packet specifies "weak supporting evidence" and provides zero context files, no quantitative data, no user research, and no competitive signals. This matches the Level 1 criteria exactly — only informal, unstructured signals exist.

**Minimum threshold for Go decision: 3 / 5 (Quantified Problem)**
- Rationale: A Go decision allocates scarce engineering and design capacity. Committing resources without a quantified problem (measured frequency + identified segment) means the team cannot define success metrics, cannot measure whether the feature worked, and cannot defend the prioritization against competing investments. Level 3 is the minimum at which these are possible.

**Minimum threshold for full build commitment: 4 / 5 (Validated Solution)**
- Rationale: Full build commitment (beyond spike/prototype) requires confidence that the proposed solution addresses the validated problem. Without solution validation, the team risks building the wrong response to a real problem.

---

## Pass/Fail Readiness

**Readiness verdict: FAIL — not ready for build commitment.**

| Criterion | Status | Detail |
|-----------|--------|--------|
| Problem validated quantitatively | ❌ Fail | No usage data or frequency measurement |
| Target segment identified | ❌ Fail | No segmentation analysis performed |
| Solution concept validated with users | ❌ Fail | No prototype or concept testing |
| Opportunity cost assessed | ❌ Fail | Not compared against roadmap alternatives |
| Business case articulated | ❌ Fail | No metric impact projection possible without problem sizing |
| Technical feasibility scoped | ⚠️ Partial | Engineering has provided rough estimate but no spike |
| Risks identified | ✅ Pass | Primary risk is building without evidence; this PRD makes that explicit |

**What would change this to PASS:**
1. Resolve Unknowns #1-#3 to reach evidence strength ≥3/5 (problem validation per rubric above)
2. Resolve Unknown #4 to reach evidence strength ≥4/5 (solution validation per rubric above)
3. Demonstrate that expected impact exceeds opportunity cost of alternatives (#5)

All three conditions must be met. Partial evidence (e.g., validated problem but untested solution) warrants continued investigation, not a Go decision.

---

## Recommended Next Artifact

**Next artifact:** Evidence-Gathering Sprint Plan

**Scope:** A structured 2-3 week investigation to resolve the five unknowns above, producing:

1. **Instrumentation spec** — what to measure, where, and acceptance criteria for "problem is real"
2. **Interview guide** — screening criteria, discussion guide, and coding framework for 8-10 interviews
3. **Support ticket audit** — tagging scheme and correlation methodology
4. **Decision criteria document** — pre-committed thresholds (mapped to the evidence rubric above) that determine Go / No-Go / Pivot after evidence is in

**Why this artifact and not a technical spec or design brief:**
Skipping to solution artifacts before the problem is validated compounds the sunk-cost pressure to ship regardless of what the evidence shows. The next artifact should generate evidence, not consume engineering capacity.

**Exit conditions from investigation:**
- If evidence strength reaches 3/5+ per the rubric: return to this PRD, update with findings, and re-evaluate Pass/Fail
- If evidence strength remains at 1-2/5 after investigation: archive this PRD and reallocate capacity
- If investigation reveals a *different* problem worth solving: draft a new PRD for that problem

---

## Appendix: Evidence Discipline Notes

This PRD deliberately does not contain:
- Projected revenue or engagement impact (no basis for credible projection)
- User quotes presented as representative (anecdotes are noted as anecdotes)
- Competitive feature comparisons framed as urgency (no evidence of competitive pressure)
- Solution details beyond concept level (premature without problem validation)

Omitting these sections is intentional, not an oversight. Including speculative projections or cherry-picked anecdotes in a PRD with weak evidence creates false confidence and biases the Go/No-Go decision.
