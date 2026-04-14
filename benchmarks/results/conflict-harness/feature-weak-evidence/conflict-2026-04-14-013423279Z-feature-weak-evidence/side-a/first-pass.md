# PRD: [Proposed Feature] — Weak Evidence Assessment

## Decision Frame

**What decision are we making?** Whether to invest engineering and design resources in building [Proposed Feature] given the current state of supporting evidence.

**Who needs this decision?** Product leadership, engineering leads, and the sponsoring stakeholder.

**What is the default if we do nothing?** The product continues without this feature. Users continue using existing workflows. No resources are diverted from the current roadmap.

**Decision type:** Reversible (Type 2) — if built and unsuccessful, the feature can be deprecated without structural damage to the platform.

**Recommendation:** Do NOT proceed to build. Proceed to evidence-gathering sprint instead.

---

## Problem Statement

A proposed feature has been surfaced — likely from a stakeholder request, a single customer conversation, or an internal hypothesis — but lacks the evidentiary foundation required to justify prioritization over existing roadmap commitments.

This PRD exists not to greenlight the feature but to honestly assess what we know, what we don't know, and what we need before a build decision is defensible.

---

## Evidence Inventory

| Evidence type | Status | What we have | What's missing |
|---|---|---|---|
| User research (interviews, surveys) | **None** | No direct user validation of the problem or proposed solution | Minimum 5 problem-validation interviews with target segment |
| Usage data / analytics | **None** | No behavioral signals indicating user need | Funnel analysis showing where users drop off or work around the gap |
| Market / competitive signals | **Weak / anecdotal** | Possible competitor feature parity claim (unverified) | Structured competitive audit confirming feature presence, adoption, and differentiation value |
| Business case | **Speculative** | Informal revenue or retention estimate with no supporting model | TAM sizing, willingness-to-pay signal, or retention-impact projection with stated assumptions |
| Technical feasibility | **Unknown** | No spike or architectural assessment completed | Engineering spike estimating complexity, dependencies, and integration risk |

**Evidence strength rating: 1 / 5** — Essentially hypothesis-stage. No validated problem, no quantified opportunity, no technical assessment.

---

## Unknowns & Evidence Gaps

### Critical unknowns (must resolve before any build decision)

1. **Is this a real problem?** No user research confirms that the target segment experiences the pain this feature addresses. The problem may be assumed rather than observed.
2. **How many users would this affect?** No segmentation or sizing has been done. The addressable population could range from negligible to significant.
3. **What is the opportunity cost?** Building this displaces other roadmap items. Without a comparative value estimate, we cannot make a rational trade-off.

### Important unknowns (should resolve before scoping)

4. **What does the solution space look like?** The proposed feature is one possible solution. Alternatives (configuration changes, integrations, documentation, process changes) have not been explored.
5. **What is the technical cost?** No engineering spike has assessed feasibility, dependencies, or maintenance burden.
6. **Does this align with product strategy?** No explicit mapping to current OKRs or strategic bets has been articulated.

### Nice-to-know unknowns

7. **Competitive positioning impact** — Would this feature meaningfully change win/loss dynamics?
8. **Ecosystem effects** — Would this feature create or close integration opportunities?

---

## Pass/Fail Readiness

### Readiness criteria for proceeding to build

| Criterion | Required threshold | Current status | Pass/Fail |
|---|---|---|---|
| Problem validated by ≥5 user interviews | 5 interviews with consistent pain signal | 0 interviews conducted | **FAIL** |
| Addressable segment sized | ≥500 users or ≥$X ARR impact | No sizing attempted | **FAIL** |
| At least one alternative solution evaluated | 1 alternative explored and rejected with rationale | No alternatives considered | **FAIL** |
| Engineering spike completed | Complexity estimate within 1 sprint | No spike conducted | **FAIL** |
| Strategic alignment confirmed | Mapped to active OKR or bet | No mapping provided | **FAIL** |
| Sponsor willing to trade roadmap priority | Explicit trade-off acknowledged | Not discussed | **FAIL** |

**Overall readiness: FAIL (0/6 criteria met)**

This feature is not ready for build prioritization. Proceeding now would be building on assumption, not evidence.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Building a feature nobody uses | High (no validation) | Medium (wasted sprint, maintenance burden) | Conduct problem-validation research first |
| Opportunity cost of displaced work | High | Depends on what's displaced | Require explicit trade-off analysis before prioritization |
| Stakeholder frustration at "no" | Medium | Low (if evidence path is clear) | Present this PRD as "not yet" with a concrete next step |
| Feature becomes technically expensive | Unknown | Potentially high | Run engineering spike before committing |

---

## Recommended Next Artifact

**Next step: Evidence-gathering sprint (1-2 weeks)**

Do not proceed to solution design. Instead, commission the following:

1. **Discovery research brief** — 5 problem-validation interviews with target users. Use the Shipwright `discover` workflow to structure the interview guide around the hypothesized problem. Deliverable: validated (or invalidated) problem statement with verbatim evidence.

2. **Quantitative sizing** — Pull usage analytics to estimate the addressable population and current workaround behavior. If no analytics exist, this is itself a gap to flag.

3. **Competitive audit** — Structured review of 3-5 competitors to confirm or deny the feature-parity claim. Deliverable: battlecard update.

4. **Engineering spike** — 2-day timeboxed investigation of technical feasibility, dependencies, and rough complexity estimate.

**Decision gate:** Reconvene after evidence sprint. If ≥4/6 readiness criteria pass, proceed to solution-design PRD. If <4/6, shelve with documented rationale.

**If evidence validates the problem:** The next artifact is a full PRD with solution design, success metrics, and launch plan.

**If evidence invalidates the problem:** Archive this document as the decision record. The hypothesis was tested and rejected — that is a productive outcome.

---

## Appendix: Why This PRD Says "No" (For Now)

A PRD that recommends building without evidence is more dangerous than one that recommends waiting. The purpose of product management is not to ship features — it is to make good decisions about what to build. This document is doing its job by preventing premature commitment.

The bar is not "can we build this?" — it is "should we build this, given everything else we could build instead?" That question cannot be answered without evidence.
