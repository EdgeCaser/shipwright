# Launch Decision Memo
## Launch Date with Conflicting Stakeholder Commitments

---

## Decision Frame

Three independent commitments have been made without a shared decision authority sign-off:

| Stakeholder | Commitment | Implied Launch Window |
|---|---|---|
| Engineering | 8-week build estimate | ~Week 8 from today |
| Sales | Q1 customer commitments already made | End of Q1 |
| CEO | Conference announcement | Week 3 from today |

**The conflict is structural, not interpersonal.** Each constraint is real: the CEO announcement creates market expectation; the sales commits create contractual or relational risk; the engineering estimate reflects build time before the product is shippable. No stakeholder is wrong about their constraint in isolation.

**What this memo is deciding:** Not which stakeholder wins. The decision is: *what can be true on what date, and what is the minimum viable position each stakeholder can accept without organizational damage?*

Three paths exist:

1. **Announce at conference (Week 3), ship nothing** — CEO gets the moment; engineering ships later; sales commits become "coming soon" language. Risk: customer expectation mismatch.
2. **Ship a scoped version by Week 3** — Engineering scopes to what is shippable in 3 weeks; sales re-qualifies Q1 commits against that scope. Risk: scope unknown; may not satisfy sales commitments.
3. **Decouple announcement from availability** — Conference becomes a preview/waitlist moment; Q1 ship date becomes the contractual milestone; engineering holds to 8-week estimate. Risk: conference moment is diluted.

This memo does not recommend a path. It establishes the evidence needed before a path can be chosen responsibly.

---

## Unknowns & Evidence Gaps

No evidence was provided in the case packet. The following gaps must be resolved before a launch date decision is defensible:

**Engineering scope:**
- What is the definition of "done" at 8 weeks? Is there a smaller shippable scope at 3 weeks, and if so, what features are excluded?
- What are the hard dependencies (infrastructure, compliance, integrations) that cannot be compressed regardless of resourcing?
- Is the 8-week estimate a median, a P90, or a best-case?

**Sales commitments:**
- What exactly was committed to Q1 customers — a ship date, a demo, a contract start, or access to a specific feature set?
- How many customers are affected and what is the consequence of a slip: contract penalty, churn risk, or reputational only?
- Can the sales team re-scope the commitment to a subset of features that might be available earlier?

**CEO / conference:**
- What is the nature of the conference slot — keynote with live demo, press release, or announcement-only?
- Is the conference date fixed or movable?
- What is the cost of *not* announcing at conference vs. announcing a preview?

**Cross-cutting:**
- Who has final authority to make the launch date decision? This memo cannot be resolved without a named decision owner.
- Are the Q1 sales commits documented in writing or are they verbal?

---

## Pass/Fail Readiness

A launch date decision is **not ready to be made** until the following pass criteria are met:

| Criterion | Status |
|---|---|
| Engineering provides a scoped 3-week deliverable with explicit feature exclusions | **Not available** |
| Sales provides written summary of Q1 customer commitments with consequence of slip | **Not available** |
| CEO or delegate clarifies minimum viable conference outcome (announce vs. demo vs. ship) | **Not available** |
| Decision owner is named and has authority to override any one stakeholder | **Not available** |

**Fail condition:** Proceeding to a launch date decision without the above will produce a date that at least one stakeholder did not genuinely accept, creating execution risk downstream.

**Conditional pass:** If engineering can confirm a shippable 3-week scope *and* sales confirms that scope satisfies Q1 commitments, Path 2 becomes viable and the conference announcement can proceed with a real ship claim. This is the highest-value scenario to investigate first.

---

## Recommended Next Artifact

**Produce a Scope-Feasibility Matrix within 48 hours.**

Engineering and product should jointly produce a two-column artifact:
- Column A: Features confirmed shippable in 3 weeks
- Column B: Features requiring the full 8-week estimate

Sales then maps Q1 customer commitments against Column A. If the intersection is non-empty and sufficient, the conference announcement proceeds on Column A scope and the decision is resolved.

If the intersection is empty — i.e., Q1 commitments require Column B features — the decision escalates to the CEO with a clear framing: *the conference announcement can happen, but the Q1 customer commitments cannot be honored on the current timeline without additional resourcing or re-negotiation.*

This artifact converts a three-way stakeholder conflict into a bounded, answerable question. It should be owned by the product lead and completed before any public commitment is made.
