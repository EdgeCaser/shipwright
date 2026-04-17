# API Deprecation Strategy Memo

**To:** Engineering Leadership, Revenue Leadership  
**Re:** Legacy API Sunset — Reconciling Business Timeline with Enterprise Contract Obligations  
**Status:** Decision-pending

---

## Decision Frame

The business seeks to sunset the legacy API within 6 months to reduce maintenance burden. Three enterprise customers on annual contracts have each cited API stability as a renewal condition, and migration to the new API requires 3–6 months of customer engineering effort on their side.

The core tension is structural: a 6-month deprecation window and a 3–6 month customer migration window share the same calendar. A customer who begins migration the day this memo is published and experiences any delay will miss the sunset. There is no buffer.

This is not primarily an engineering scheduling problem. It is a contract risk and revenue sequencing problem. The decision frame must account for two simultaneous questions:

1. **Can the business absorb the cost of losing some or all of three enterprise renewals to hit the 6-month target?**
2. **Can the engineering organization absorb an extended maintenance window to protect those renewals?**

Neither question has a technically correct answer. Both require explicit ownership from Revenue and Engineering leadership jointly, not from either team alone.

**Default recommendation absent new information:** A two-track deprecation with a hard sunset for net-new API consumers at 6 months, and a contract-gated extended sunset (up to 12 months from memo date) for the three named enterprise accounts, conditioned on documented migration commitment within 60 days.

---

## Unknowns & Evidence Gaps

The following unknowns materially affect the decision. No action should be finalized until each is resolved or explicitly accepted as a known risk:

**1. Contract language specifics**  
Do the annual contracts contain explicit API stability guarantees, or is the renewal condition an informal expectation from the customer's side? The answer determines legal exposure, not just relationship risk.

**2. Renewal timing for each of the three accounts**  
If one customer renews in 2 months and another in 11 months, the risk profile differs substantially. A blanket policy may over-protect one relationship and under-protect another.

**3. Actual maintenance burden in dollar and engineering-hour terms**  
The stated motivation is reduced maintenance burden, but the magnitude is unspecified. If the annual cost of maintaining the legacy API is small relative to the revenue from the three enterprise accounts, the 6-month hard deadline is not economically justified on its merits alone.

**4. Migration support capacity**  
The 3–6 month estimate is for customer engineering effort, but it is unclear whether migration is self-service or requires active support from the internal team. If the internal team must co-migrate each customer, sequencing three simultaneous migrations may not be feasible regardless of timeline.

**5. What happens to customers who miss the sunset**  
Is the legacy API truly switched off, or throttled, or placed into read-only mode? The severity of "sunset" affects how hard a deadline it actually is.

---

## Pass/Fail Readiness

The following conditions must be true before committing to any public deprecation announcement:

| Condition | Current Status | Required By |
|---|---|---|
| Contract language reviewed by legal for stability guarantees | Unknown | Before any customer communication |
| Revenue leadership confirms acceptable churn threshold | Unknown | Before finalizing sunset date |
| Renewal dates confirmed for all three named accounts | Unknown | Before finalizing sunset date |
| Migration support model defined (self-serve vs. co-pilot) | Unknown | Before customer migration commitments are solicited |
| Engineering confirms extended maintenance cost for +6 month track | Unknown | Before two-track model is approved |

**Fail state:** Announcing a 6-month hard sunset before the above conditions are resolved creates a situation where the business may be forced to either reverse a public commitment or accept preventable enterprise churn. Both outcomes are more costly than a 2–4 week pre-announcement review period.

**Pass state:** All five conditions resolved, two-track model approved, and customer-facing migration commitment process documented. At that point, the deprecation announcement is a coordinated motion, not a unilateral engineering decision.

---

## Recommended Next Artifact

**A joint Revenue + Engineering readiness brief** — one page, produced within 10 business days — that answers the five unknown conditions listed above and returns a final recommendation on whether to proceed with:

- **Option A:** 6-month hard sunset for all customers (accept churn risk, quantified)
- **Option B:** Two-track deprecation (hard sunset for new consumers, contract-gated extended sunset for the three named accounts)
- **Option C:** Full timeline extension (delay sunset until all three accounts have confirmed migration completion or contract expiration, whichever comes first)

The brief should be signed off by both the engineering lead and the account executive responsible for the three named accounts. Without joint ownership, the decision will be made by default under time pressure rather than by design.
