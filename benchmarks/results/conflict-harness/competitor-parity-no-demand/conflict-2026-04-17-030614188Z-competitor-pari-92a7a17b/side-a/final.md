# PRD: Advanced Export Feature

**Status:** NOT READY FOR SCOPING — evidence gate not cleared  
**Requesting team:** Product  
**Date:** 2026-04-17  
**Engineering estimate on file:** 10 weeks

---

## Decision Frame

This PRD documents a proposed investment in an advanced export feature. The triggering input is competitive: two named competitors shipped similar functionality within the past month. No other initiating signal is present in the brief.

The decision this document must support is not "how do we build this" but rather: **Is there sufficient justification to authorize 10 weeks of engineering time on this feature?**

Competitor parity is a legitimate signal category but is not, on its own, a demand signal. It tells us what the market supply looks like; it does not tell us whether our users want this capability, whether absence of the feature is costing us deals, or whether 10 weeks is a proportionate response. A competitor shipping something is evidence that they made a bet — not evidence that the bet was correct, nor that our user base shares the same profile as theirs.

This PRD takes the position that the investment case is currently underdetermined and that authorizing the full build would be premature. The recommended path is a demand discovery effort before any build commitment.

---

## Unknowns & Evidence Gaps

The following gaps must be resolved before a build decision is defensible:

**1. User demand — not established**  
No user research is present. No customer interviews, survey data, or behavioral signals (e.g., export-related workarounds, API usage patterns) have been cited. We do not know whether our users perceive a gap here or consider it a priority.

**2. Support and sales signal — not established**  
No support ticket volume referencing export limitations has been cited. No sales calls, deal loss records, or CRM notes attributing lost or stalled deals to the missing feature have been provided. Without this, we cannot estimate revenue impact or support cost avoidance.

**3. Competitor feature scope — not characterized**  
We know competitors shipped "similar features" but have no description of what those features actually do, which user segments they serve, or how they are positioned. "Advanced export" is not a specification.

**4. Our user segment overlap — not established**  
Even if competitor demand is real, we do not know whether our user base resembles theirs closely enough that the demand transfers. Competitor parity is weaker signal when our segments diverge.

**5. Opportunity cost — not assessed**  
A 10-week engineering block displaces other work. No comparison against the queue of demand-backed items has been presented. The relative priority claim is unsubstantiated.

**6. Definition of "advanced" — undefined**  
The feature is unnamed in functional terms. Any estimate built on this brief carries high scope uncertainty.

---

## Pass/Fail Readiness

| Readiness Gate | Status |
|---|---|
| User demand signal (research, tickets, or sales data) | FAIL — not present |
| Feature scope defined to estimation quality | FAIL — "advanced export" is a label, not a spec |
| Competitor feature characterized | FAIL — no description on file |
| Opportunity cost assessed against backlog | FAIL — not addressed |
| Engineering estimate tied to a defined scope | CONDITIONAL — estimate exists but scope does not |

**Overall readiness: NOT CLEARED**

A PRD that clears all gates would authorize scoping. This document does not clear the gates and therefore does not authorize scoping. Proceeding directly to a 10-week build on current evidence would be a policy exception, not a normal investment decision.

---

## Recommended Next Artifact

**Demand discovery brief**

The requesting team should produce a discovery brief that addresses the evidence gaps above before returning with a build PRD. The scope, staffing, and timeline of that discovery effort should be determined by the team based on current capacity and backlog priorities — this document does not have the information needed to prescribe a specific duration or method mix.

At minimum, the discovery brief should attempt to answer:

1. **User demand:** Have existing users expressed friction, workarounds, or requests related to export limitations? Document sources and volume.
2. **Support and sales signal:** Have export limitations appeared in support tickets, deal reviews, or renewal conversations? Report volume and representative quotes.
3. **Competitor feature characterization:** What specifically did the two competitors ship? Document scope, target segments, and positioning.
4. **Segment overlap:** Is there reason to believe our user base has similar export needs to the competitors' user bases?
5. **Opportunity cost:** How does this item rank against the top demand-backed items in the current queue?

The requesting team should assess whether these questions can be answered through lightweight desk research (changelog review, CRM query, support search) or require primary research, and should size the discovery effort accordingly before committing to it.

If the discovery brief returns positive demand signal across multiple sources, a scoped build PRD is warranted. If it returns weak or absent signal, the recommended disposition is to park the feature and revisit in the next planning cycle.

This document is not a rejection of the feature. It is a request for the minimum evidence that makes a 10-week commitment defensible.
