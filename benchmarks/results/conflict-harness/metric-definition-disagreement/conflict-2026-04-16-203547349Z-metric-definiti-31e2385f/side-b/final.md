# North Star Metric Recommendation: Resolving the Active User Definition Conflict

## Decision Frame

Leadership has asked for a single number. The underlying problem is not which definition is numerically largest — it is that the three definitions answer three different business questions, and collapsing them without arbitration will embed the losing teams' concerns into a metric they will quietly ignore or contest.

**The real decision is not "which number" but "what question is the business trying to answer at the north star level."**

The three definitions in conflict are:

| Team | Implicit Question | Typical Definition Shape |
|---|---|---|
| Finance | Who is paying or at risk of churning? | Monetizable engagement threshold |
| Product | Who is deriving core value from the product? | Feature-depth or session-quality threshold |
| Growth | Who can be counted as acquired and retained? | Any signal of return visit or activation |

These produce a 40% spread in outcomes — meaning the same underlying user base reads as growth under one lens and decline under another. A north star metric adopted under these conditions will fracture into three shadow metrics within one planning cycle.

**Recommended decision posture:** Do not select a definition on technical grounds alone. Convene a brief leadership alignment session (not a working group) to answer one question first: *Is the business currently optimizing for acquisition breadth, retention depth, or monetization quality?* The answer to that question — not analytical preference — should determine which definition becomes the north star.

If leadership cannot answer that question, the right output is a **metric architecture** (one north star + two diagnostic metrics), not a single consolidated number. A single number that satisfies no one produces worse decisions than three numbers that are honestly labeled.

---

## Unknowns & Evidence Gaps

The following are unresolved before a defensible recommendation can be finalized:

1. **Strategic phase of the business.** A growth-phase business should weight acquisition breadth; a maturity-phase business should weight retention depth or monetization quality. The correct definition depends on which phase leadership believes the company is in — this is not in the available evidence.

2. **Behavioral overlap between definitions.** Without knowing what fraction of users qualify under all three definitions vs. only one, it is impossible to determine whether the definitions are measuring genuinely different populations or are simply threshold variants of the same behavior. The 40% spread could reflect a real segmentation gap or a threshold sensitivity artifact. This distinction also determines whether any provisional definition is a neutral holding position or a biased one — a broader definition is not automatically safer if it masks churn or product-value loss for users who qualify under Growth but not Finance or Product.

3. **Downstream metric dependencies.** If compensation, board reporting, or investor commitments are already anchored to one team's definition, the political cost of switching is asymmetric. This is a constraint, not a recommendation driver, but it must be surfaced before a final call.

4. **Reversibility horizon.** If a definition is adopted and later proves wrong, how long until the error is detectable? A metric that takes two quarters to show a signal cannot be corrected quickly. Short reversibility horizon favors conservatism (higher threshold = fewer false positives).

5. **Whether a composite is technically feasible.** A weighted composite of all three definitions might satisfy all teams in principle — but only if the weighting methodology is agreed in advance and the components are independently measurable without double-counting.

---

## Pass/Fail Readiness

**Ready to proceed to definition selection:** No.

**Blocker checklist:**

- [ ] Leadership has stated the current strategic phase (acquisition / retention / monetization)
- [ ] Behavioral overlap between the three user populations has been quantified
- [ ] Downstream dependency audit is complete (comp plans, board decks, investor materials)
- [ ] Composite metric feasibility has been assessed by data engineering

**If all four blockers are resolved:** Proceed to definition selection or composite design with full stakeholder buy-in.

**If leadership requires a number before blockers are resolved:** Issue a provisional north star with an explicit sunset date (one planning cycle), paired with a mandate to resolve the above blockers before the next planning cycle. Do not present it as a permanent decision. Document the provisional status in writing.

The provisional definition should be selected by leadership — not by this recommendation — using the following tiebreaker logic:

- If the business is in active acquisition mode and false-alarm risk is low, prefer the broader definition.
- If the business has investor or board commitments anchored to a specific definition, prefer that definition to avoid a mid-cycle reporting rupture.
- If neither condition is met, prefer the most conservative (highest-threshold) definition, because over-counting disguises problems while under-counting triggers investigation.

This recommendation deliberately withholds a named provisional winner because the behavioral overlap between the three populations is unknown. A definition that appears broader may not be a neutral holding position — it may systematically undercount deterioration among users who qualify under Finance or Product but not Growth. Choosing it as a default without knowing this would embed an unverified assumption into the north star from day one.

---

## Recommended Next Artifact

**Metric Architecture Document** — a one-page specification that formalizes:

1. The provisional north star with its exact operational definition, measurement cadence, and sunset trigger
2. Two retained diagnostic metrics (the non-selected definitions) with explicit questions they answer and owners responsible for them
3. A reconciliation protocol — when the three metrics diverge by more than a defined threshold, who convenes and what is the decision process
4. A timeline for resolving the four blockers listed above, with named owners

This document should be reviewed and signed by all three team leads and the executive sponsor before being published. The signing step is not ceremonial — it is the mechanism that prevents each team from continuing to use their own definition in practice while nominally accepting the north star.

Without the Metric Architecture Document, a north star selection is a naming exercise. With it, it becomes an operating agreement.
