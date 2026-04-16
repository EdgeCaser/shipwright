# API Deprecation Strategy Memo
## Legacy API Sunset Under Enterprise Contract Constraints

---

## Decision Frame

**The core tension:** The business seeks to retire the legacy API within 6 months to eliminate ongoing maintenance cost, but three enterprise customers on annual contracts have made API stability an explicit renewal condition — and migration requires 3–6 months of customer engineering effort on their end.

These timelines are nearly irreconcilable as stated. A 6-month hard sunset against a 3–6 month customer migration window leaves zero buffer for contract negotiation, scoping, kickoff, and inevitable delays. The business is effectively asking customers to begin migration the moment a deprecation notice lands.

**The real decision is not when to deprecate — it is which risk the business is willing to own:**

| Option | Business Risk | Customer Risk |
|--------|--------------|---------------|
| Hard sunset at Month 6 | Potential churn of 3 enterprise accounts | Migration crunch; likely failure for slower orgs |
| Conditional extension to Month 12 | Continued maintenance burden 6 more months | Incentivized migration with runway |
| Tiered sunset (phased read/write deprecation) | Moderate — partial maintenance continues | Reduced — customers can migrate incrementally |
| Negotiated per-contract SLA | Low churn risk | Custom timelines create support fragmentation |

**Recommended decision posture:** Treat this as a contract risk problem first and a technical timeline problem second. The business cannot unilaterally set a sunset date that violates renewal conditions without triggering churn or legal exposure. The 6-month target should be treated as aspirational, not committed, until contract review confirms otherwise.

Note: All four options in the table above are candidates pending evidence — not ranked recommendations. Whether a tiered or extended approach is preferable to a hard sunset depends on contract terms, maintenance cost structure, and migration feasibility data that have not yet been gathered. The evidence gaps below must be closed before any option can be confidently preferred.

---

## Unknowns & Evidence Gaps

The following gaps must be closed before a deprecation date can be publicly committed:

**1. Contract language (Critical)**
- Do the three enterprise contracts specify the legacy API by name, version, or capability?
- Is "API stability" defined as no breaking changes, no deprecation, or something else?
- What are the renewal dates for each account, and do any fall within the 6-month window?
- What remedies or notice periods do contracts specify for material platform changes?
- Would customers accept a structured extension offer, or does their stability clause require the API to remain indefinitely?

**2. Revenue concentration (Critical)**
- What is the combined ARR of the three enterprise accounts?
- What is the estimated churn probability under each timeline option?
- What is the maintenance cost (engineering-hours/month) of running the legacy API — and does partial support (security-only mode) materially reduce that cost?
- Does the cost-of-maintenance exceed the churn-adjusted revenue at risk under the hard sunset scenario?

**3. Migration effort calibration (High)**
- Is the 3–6 month estimate the customers' own estimate or an internal assumption?
- Has any customer begun migration scoping? Are blockers known?
- Does the new API achieve functional parity, or are there gaps customers would need to work around?
- Is a tiered/phased deprecation technically feasible given the new API's architecture, or would partial support require significant additional engineering?
- What migration support (SDKs, tooling, dedicated engineering) is the business prepared to offer?

**4. Legacy API actual maintenance burden (Medium)**
- Is maintenance cost driven by bug fixes, security patching, infrastructure, or staffing?
- Is there a specific incident or cost spike driving the 6-month urgency, or is this a planning horizon choice?
- Could a security-only maintenance mode reduce cost without full deprecation, and if so, by how much?

**5. Competitive and ecosystem dynamics (Low-Medium)**
- Are competitors offering stable long-term API guarantees?
- Would a hard deprecation affect ISV or integration partners beyond the three named accounts?

---

## Pass/Fail Readiness

This strategy is **not ready to execute** on the 6-month timeline. The following conditions must be met before committing a public deprecation date:

**Pass conditions (all required):**
- [ ] Legal review of all three enterprise contracts confirms the business has the right to deprecate with adequate notice
- [ ] Revenue-at-risk model completed (ARR × churn probability vs. maintenance cost savings) across at least two timeline scenarios
- [ ] At least one customer has confirmed migration feasibility within the proposed window
- [ ] Migration support package defined (tooling, dedicated CSE hours, SLA during transition)
- [ ] Internal go/no-go owner designated with authority to slip the date if blockers emerge

**Fail conditions (any one blocks go-live commitment):**
- Contract language prohibits deprecation within the renewal term without consent
- Combined churn-adjusted ARR loss exceeds 18-month maintenance cost savings
- No customer can confirm a credible migration plan within 6 months
- New API has known capability gaps vs. legacy that block migration
- Tiered or extended support is not technically feasible without significant new engineering investment

**Current status:** At least three of five pass conditions are unconfirmed. The business should not communicate a deprecation date externally until pass conditions are met.

---

## Recommended Next Artifact

**Artifact:** Contract & Revenue Risk Assessment  
**Owner:** Legal + Finance + Customer Success  
**Deadline:** 3 weeks from memo approval

This assessment should produce:
1. A per-account contract summary (renewal date, API clause language, notice requirements, and whether customers would accept an extension structure)
2. A revenue model: worst-case churn cost vs. 12-month maintenance savings under hard sunset vs. conditional extension scenarios
3. A migration readiness interview summary from each of the three accounts, including customer-sourced effort estimates and known blockers
4. A feasibility note on tiered/phased deprecation from engineering (cost to support partial API vs. full retirement)
5. A recommended sunset date range (best case / expected / conservative) based on findings

Only after this artifact is complete should the business select a deprecation approach, schedule an announcement, or communicate timelines to customers.

**Interim action (immediate):** Inform the three enterprise customers that the business is actively planning a new API migration program and will be in contact within 30 days with timeline and support details. This signals forward motion without committing to a date the business cannot yet defend.

