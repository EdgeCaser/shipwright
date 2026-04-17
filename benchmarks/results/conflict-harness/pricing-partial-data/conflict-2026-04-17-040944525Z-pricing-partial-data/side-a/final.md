# Pricing Strategy Recommendation Under Partial Market Data

## Decision Frame

The core decision is whether to act on a pricing change now, defer pending further data collection, or move forward with a staged approach that preserves optionality.

**Decision type:** Reversibility asymmetry matters. A price increase that alienates customers at scale is harder to walk back than a targeted pilot. A price decrease trains buyer expectations and is costly to reverse. The strategy chosen must reflect which direction is being contemplated and what rollback looks like.

**Framing constraint:** No external market data appears in this case packet. Conditional recommendations are offered below with their assumptions stated explicitly. A team that can confirm or deny those assumptions should do so before committing to a number.

---

## Unknowns & Evidence Gaps

The following gaps are material. Each is either a decision blocker or an assumption that must be made explicit before any recommendation can be executed:

1. **Competitive price floor/ceiling** — Without knowing where comparable offerings are priced, any proposed number is untethered.
2. **Willingness-to-pay signal** — No customer survey data, cohort elasticity analysis, or win/loss records appear in the packet.
3. **Current margin structure** — Whether a price change is necessary for unit economics vs. aspirational for revenue growth changes the urgency and acceptable risk profile.
4. **Churn trigger threshold** — At what price point do current customers defect?
5. **Segment heterogeneity** — If buyer segments have meaningfully different price sensitivity, a uniform strategy forfeits value or drives unnecessary churn.

---

## Conditional Recommendations

The following conditional options are structured to be usable now, with their governing assumptions surfaced. Teams should select the branch whose assumptions they can confirm.

**Option A — Hold list price, test packaging (lowest data requirement)**
- *Assumption:* Current list price is not a known barrier to conversion or retention.
- *Action:* Run a time-bounded test of segmented packaging (e.g., feature-gated tiers) for new customers only. Existing customer pricing is unchanged.
- *Learning objective:* Does packaging restructuring affect conversion without touching headline price?
- *Rollback:* Revert new-customer offer; no existing customer impact.

**Option B — Bounded increase for new customers only (moderate data requirement)**
- *Assumption:* There is directional internal signal (win/loss, sales feedback) that current pricing is below market for at least one segment.
- *Action:* Apply a defined price increase to new customer acquisition only, with a hard sunset date. Measure conversion rate delta against the prior period.
- *Rollback:* Sunset clause reverts to prior price if conversion drops beyond a pre-defined threshold.
- *Required before launch:* Name the threshold. A move without a pre-committed exit condition is not a pilot — it is a full rollout with extra steps.

**Option C — Defer committed price change (highest data requirement)**
- *Assumption:* None of the above internal signals exist or can be confirmed.
- *Action:* Treat this recommendation as a process artifact. Produce the Pricing Readiness Brief described below before any price move.

---

## Pass/Fail Readiness

| Condition | Option A | Option B | Option C |
|---|---|---|---|
| Competitive price reference | Not required | Directional only | Required |
| Internal margin floor known | Not required | Recommended | Required |
| WTP signal (any source) | Not required | Required | Required |
| Reversibility mechanism defined | Required | Required | N/A |
| Decision owner identified | Required | Required | Required |

**Verdict:** Options A and B are executable under partial data if their stated assumptions are confirmed and a rollback threshold is pre-committed. Option C is the correct path only if the team cannot confirm any internal signal.

---

## Recommended Next Artifact

**If Option A or B is chosen:** Produce a Pilot Definition Sheet — one page covering: pilot scope, target segment, baseline metric, success threshold, rollback trigger, and named decision owner with sign-off date.

**If Option C is chosen:** Produce a Pricing Readiness Brief covering: three competitive price references with source and date, internal margin floor, one directional WTP signal, proposed pilot scope and rollback definition, and named decision owner.

**Hand-off condition:** The receiving team uses whichever artifact is produced to either execute the pilot or commission the data collection needed for a committed recommendation. This artifact is superseded once either output exists.
