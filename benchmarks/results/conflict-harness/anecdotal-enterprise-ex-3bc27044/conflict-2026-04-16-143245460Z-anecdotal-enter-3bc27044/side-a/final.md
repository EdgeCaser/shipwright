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
- **Resolution path:** Customer discovery calls across 2–3 verticals; review of lost deal notes mentioning integration friction; analysis of support tickets for integration-related friction signals. **Feasibility caveat:** The case packet provides no data on how many accessible non-requesting enterprise contacts exist, their responsiveness, or sales-cycle timing constraints. The PM must first audit addressable discovery candidates before committing to a timeline. If fewer than 8–10 reachable non-requesting enterprise contacts exist, discovery will yield inconclusive data regardless of sprint duration.

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
The current evidence supports initiating a **structured discovery effort** to resolve the critical unknowns above. This is not a reason to do nothing — 18% of ARR asking for the same thing is a meaningful signal. It is a reason to validate before committing irreversible capacity.

**Important scope caveat on discovery timeline:** The 2–3 week estimate for a discovery sprint is a planning assumption, not a guarantee. Its feasibility depends on factors not established in the current case packet: how many reachable enterprise contacts exist outside the requesting vertical, whether sales and CS teams have the bandwidth and relationships to schedule calls quickly, and whether lost-deal data is coded in a way that supports integration-friction analysis. The PM must first conduct a 2–3 day feasibility check — inventorying available discovery candidates and data sources — before committing to a sprint timeline. If the candidate pool is thin, the discovery effort may require 4–6 weeks or a different approach (e.g., third-party survey, analyst briefing).

### Pass criteria for full investment
If the discovery effort yields:
- ≥5 enterprise customers outside the originating vertical expressing the same pain (unprompted or lightly prompted)
- Technical requirements sufficiently overlapping to support a shared integration spec
- Lightweight alternatives assessed and ruled out
- No credible lightweight substitute at <25% cost

...then a revised PRD with full scoping and a build recommendation is appropriate.

---

## Recommended Next Artifact

### Immediate (before discovery sprint): Discovery Feasibility Check
**Purpose:** Before committing to a 2–3 week sprint, the PM should spend 2–3 days answering: how many non-requesting enterprise contacts are reachable, are lost-deal notes coded for integration friction, and is CS bandwidth available? This step converts the discovery plan from an assertion into a scoped commitment.  
**Owner:** PM  
**Output:** A short memo confirming or revising the sprint timeline, with a list of committed discovery candidates.

### Primary: Discovery Sprint Brief
**Purpose:** Define the structured validation effort that resolves the evidence gaps above.  
**Owner:** PM  
**Contents should include:**
- List of 6–8 target discovery call candidates (across ≥3 verticals, confirmed reachable)
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
Until the discovery effort resolves the vertical-specificity question, technical scoping work risks being invalidated entirely.

---

## Appendix: What This PRD Deliberately Does Not Do

This PRD does not construct a confident business case from two data points. The temptation to treat 18% ARR as a mandate is understandable, but the right move is to note that 18% ARR *requesting* something is evidence of desire in a sample, not evidence of enterprise-general need.

Equally, this PRD does not assert that a discovery sprint will cheaply and quickly resolve the uncertainty. Discovery feasibility depends on access and data quality that are not yet established. The recommended next step is to check that feasibility before the sprint begins — not to assume it.
