# PRD: Enterprise Platform Workflow Integration
**Status:** Pending Validation Gate  
**Requested Investment:** 4 months platform engineering  
**Author:** PM — Initial Draft  
**Date:** 2026-04-16

---

## Decision Frame

### What decision does this document support?
Whether to commit 4 months of platform engineering capacity to build a workflow integration layer targeting enterprise customers.

### What outcome are we optimizing for?
Retain and expand ARR from enterprise accounts by reducing integration friction between our platform and their existing workflow tooling.

### Investment snapshot
| Dimension | Value |
|---|---|
| Engineering cost | 4 months platform eng (~$200–300K fully-loaded estimate) |
| Requesting customers | 2 enterprise accounts |
| ARR represented | ~18% of total ARR |
| Vertical of requesting customers | Same niche vertical (both) |
| Broader survey data | None |
| Competing priorities displaced | Unknown — not assessed |

### Why this is a conditional PRD
The originating signal for this investment is two customer requests. Both customers share the same niche vertical. This creates a material risk that the need is vertical-specific rather than enterprise-general. Proceeding to full build without validating scope would risk delivering a feature that serves a narrow segment while consuming resources priced for broad leverage.

This PRD is structured to surface that risk explicitly and define what evidence would resolve it before commit.

---

## Problem Statement

### Observed pain
Two enterprise customers (collectively ~18% ARR) have formally requested a workflow integration. Their stated need: reduce manual steps required to move data and trigger actions between our platform and their internal workflow orchestration tools.

### Assumed general pattern
The PM hypothesis is that these two customers represent a broader enterprise pattern — that enterprise buyers generally have workflow orchestration tooling (e.g., internal iPaaS, ServiceNow, Salesforce Flow, custom middleware) and that our platform's lack of native integration creates adoption friction and expansion ceiling.

### Evidence quality assessment
| Claim | Evidence | Quality |
|---|---|---|
| "Enterprises want workflow integration" | 2 customer requests | Weak — n=2, same vertical |
| "This represents 18% ARR risk" | ARR data | Strong — factual |
| "The two customers represent general enterprise need" | No survey, no win/loss data, no NPS verbatim analysis | Not established |
| "4 months is sufficient scope" | Not sized against a defined spec | Not validated |

---

## Unknowns & Evidence Gaps

### Critical unknowns (must resolve before commit)

**1. Is this need vertical-specific or enterprise-general?**  
Both requesting customers operate in the same niche vertical. The integration need may be driven by compliance patterns, vendor tooling conventions, or data governance requirements specific to that vertical — not a general enterprise pattern. Before investing 4 months of platform capacity, we need evidence from enterprises *outside* this vertical.

- **Gap:** No customer survey, no win/loss analysis, no NPS verbatim coding  
- **Resolution path:** 6–8 customer discovery calls across 2–3 verticals; review of lost deal notes mentioning integration friction; analysis of support tickets for integration-related friction signals

**2. What is the actual integration surface requested?**  
Two customers requesting "workflow integration" may mean materially different things (webhooks, bidirectional sync, event-driven triggers, SSO-adjacent auth flows). If their needs are non-overlapping, the 4-month estimate may be scoped to neither.

- **Gap:** No requirements document from either customer; no reference architecture  
- **Resolution path:** Technical discovery sessions with both customers; produce a shared requirements matrix

**3. What is the opportunity cost of this investment?**  
4 months of platform engineering is a significant allocation. What roadmap items are displaced? If the integration turns out to be vertical-specific, we will have deferred broader-leverage work for a feature that benefits a single niche.

- **Gap:** No roadmap tradeoff analysis included  
- **Resolution path:** Capacity planning review with engineering leadership

**4. What are the retention/expansion economics of *not* building?**  
Is there a credible churn signal from the two requesting customers? Have they issued RFPs, mentioned competitors, or signaled timeline pressure? The urgency of the investment depends on this.

- **Gap:** No churn risk quantification  
- **Resolution path:** Account team input on renewal risk; review of customer success notes

### Secondary unknowns (should resolve before scoping)
- Do competitors offer this integration? Is it a table-stakes expectation in this vertical?
- Can a lighter-weight solution (e.g., Zapier/Make connector, open webhook spec) satisfy the core need at 20% of the cost?
- What is the long-term maintenance burden of a bespoke integration layer?

---

## Pass/Fail Readiness

### Readiness assessment: **NOT READY to commit full investment**

This PRD does not currently clear the bar for committing 4 months of platform engineering. The following conditions must be met:

| Condition | Status | Owner |
|---|---|---|
| Evidence of need outside requesting vertical | ❌ Not met | PM |
| Technical requirements aligned across both requesting customers | ❌ Not met | PM + Eng |
| Churn risk quantified for both accounts | ❌ Not met | PM + CS |
| Roadmap opportunity cost assessed | ❌ Not met | PM + Eng Lead |
| Lightweight solution ruled out | ❌ Not met | Eng |

### What *is* justified now
The current evidence supports a **time-boxed discovery sprint** (2–3 weeks, minimal engineering involvement) to resolve the critical unknowns above. This is not a reason to do nothing — 18% of ARR asking for the same thing is a meaningful signal. It is a reason to validate before committing irreversible capacity.

### Pass criteria for full investment
If the discovery sprint yields:
- ≥5 enterprise customers outside the originating vertical expressing the same pain (unprompted or lightly prompted)
- Technical requirements sufficiently overlapping to support a shared integration spec
- Lightweight alternatives assessed and ruled out
- No credible lightweight substitute at <25% cost

...then a revised PRD with full scoping and a build recommendation is appropriate.

---

## Recommended Next Artifact

### Immediate: Discovery Sprint Brief
**Purpose:** Define the 2–3 week validation effort that resolves the evidence gaps above.  
**Owner:** PM  
**Contents should include:**
- List of 6–8 target discovery call candidates (across ≥3 verticals)
- Lost deal review protocol (filter for integration-friction mentions)
- Support ticket analysis query
- Technical discovery session agenda for both requesting customers
- Lightweight solution evaluation checklist (Zapier connector, webhook spec, etc.)
- Decision rule: what outcome triggers full PRD vs. scoped vertical feature vs. pass

### Conditional: Revised PRD with build recommendation
If discovery confirms enterprise-general need, return to this document and add:
- Validated requirements matrix
- Revised scope and estimate (informed by technical discovery)
- Go-to-market motion (how we announce, price, and support this integration)
- Success metrics (integration adoption rate, expansion ARR from integrated accounts, churn reduction in requesting segment)

### Do not proceed to: Technical spec or sprint planning
Until the discovery sprint resolves the vertical-specificity question, technical scoping work risks being invalidated entirely.

---

## Appendix: What This PRD Deliberately Does Not Do

This PRD does not construct a confident business case from two data points. The temptation to treat 18% ARR as a mandate is understandable, but the right move is to note that 18% ARR *requesting* something is evidence of desire in a sample, not evidence of enterprise-general need. The cost of a 2-week validation sprint is orders of magnitude lower than the cost of building the wrong surface for a niche vertical and deferring higher-leverage work.

A PRD that papers over this uncertainty with optimistic extrapolation would be a disservice to the team making the investment decision.
