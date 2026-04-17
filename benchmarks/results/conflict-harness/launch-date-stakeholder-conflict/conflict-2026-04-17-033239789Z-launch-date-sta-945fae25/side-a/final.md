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

1. **Announce at conference (Week 3), ship nothing** — CEO gets the moment; engineering ships later; sales commits become "coming soon" language. Risk: customer expectation mismatch depending on commitment language.
2. **Ship a scoped version by Week 3** — Engineering scopes to what is shippable in 3 weeks; sales re-qualifies Q1 commits against that scope. Risk: scope is unknown and may not satisfy sales commitments.
3. **Decouple announcement from general availability** — Conference becomes a preview or waitlist moment; Q1 ship date becomes the contractual milestone; engineering holds to 8-week estimate. Risk: conference moment is diluted, but downstream commitments remain intact.

**Default posture under current uncertainty:** Path 3 — decoupling announcement from GA — is the lowest-destruction option given what is known. It preserves the CEO's conference moment, keeps the engineering timeline intact, and converts sales commitments to a Q1 GA date rather than a conference availability date. This is the recommended provisional position unless evidence gathered in the next 48 hours rules it out.

This default posture does not foreclose Path 2. If engineering can confirm a shippable 3-week scope that satisfies Q1 sales commitments, Path 2 supersedes Path 3 as the preferred option.

---

## Unknowns & Evidence Gaps

No evidence was provided in the case packet. The following gaps materially affect whether the default posture holds or whether a different path should be chosen:

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
- What is the cost of not announcing at conference vs. announcing a preview?

**Cross-cutting:**
- Who has final authority to make the launch date decision if stakeholders cannot align?
- Are the Q1 sales commits documented in writing or are they verbal?

---

## Pass/Fail Readiness

The default posture (Path 3) is **provisionally actionable** but should be confirmed or revised once the following criteria are evaluated:

| Criterion | Status | Impact on Default Posture |
|---|---|---|
| Engineering confirms whether a shippable 3-week scope exists | **Not available** | If yes, Path 2 may supersede Path 3 |
| Sales clarifies whether Q1 commitments require a specific feature set or a GA date | **Not available** | If commitments require a GA date, Path 3 holds; if feature set, check against 3-week scope |
| CEO clarifies minimum viable conference outcome (announce vs. demo vs. ship) | **Not available** | If demo or ship is required, Path 3 fails and Path 2 must be evaluated |
| Decision owner is named with authority to override any one stakeholder if needed | **Not available** | Required if stakeholders cannot align on the default posture |

**Fail condition for default posture:** If the CEO requires a live demo or GA claim at the conference, Path 3 does not satisfy the constraint and the decision must escalate before any public commitment is made.

**Upgrade condition:** If engineering confirms a viable 3-week scope and sales confirms that scope satisfies Q1 commitments, Path 2 becomes the recommended path and the conference announcement can proceed with a real availability claim.

---

## Recommended Next Artifact

**Produce a Scope-Feasibility Matrix within 48 hours.**

Engineering and product should jointly produce a two-column artifact:
- Column A: Features confirmed shippable in 3 weeks
- Column B: Features requiring the full 8-week estimate

Sales then maps Q1 customer commitments against Column A. The intersection determines whether Path 2 is viable.

Simultaneously, the CEO or a delegate should confirm the minimum viable conference outcome in writing — announcement only, preview with waitlist, or live availability required.

If both inputs return within 48 hours and the intersection of Column A and Q1 commitments is non-empty, and the conference accepts a preview framing, the decision is resolved at Path 2 or Path 3 without escalation.

If either input is missing or incompatible, the decision escalates to a named decision owner with a clear framing: *a conference announcement can happen, but the Q1 customer commitments cannot be honored on the current timeline without additional resourcing or re-negotiation.*

This artifact converts a three-way stakeholder conflict into a bounded, answerable question. It should be owned by the product lead and completed before any public commitment is made.
