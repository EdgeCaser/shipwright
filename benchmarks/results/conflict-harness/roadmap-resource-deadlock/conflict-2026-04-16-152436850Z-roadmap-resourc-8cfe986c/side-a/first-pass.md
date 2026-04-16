# Resource Allocation Recommendation: Roadmap Deadlock Resolution

## Decision Frame

**Situation:** Two SVP-level initiatives have competing, simultaneous claims on the same engineering team. Both sponsors assert higher business priority. CEO escalation is not available this quarter.

**Decision required:** Allocate engineering capacity across the two initiatives in a way that (a) minimizes company-level value destruction, (b) is defensible without CEO arbitration, and (c) preserves the working relationship between both sponsoring organizations.

**What this recommendation does NOT do:** Crown one initiative as more important than the other based on sponsor authority alone. Sponsor seniority is symmetric — that is precisely why this is a deadlock. The resolution must come from objective business criteria, not political weight.

**Governing principle:** Sequencing is not defeat. Phasing delivery to match real capacity is a stronger outcome than splitting an under-resourced team across two parallel tracks and delivering neither on time or at quality.

---

## Decision Framework: Three Resolution Paths

Given the constraints, three structural options exist:

### Option 1 — Sequential Prioritization (Recommended starting hypothesis)
One initiative gets the full team for Phase 1; the other begins discovery/design work with non-engineering resources and enters the queue for Phase 2. Sequencing order is determined by the criteria in Pass/Fail Readiness below.

**Upside:** Full team throughput on whichever initiative runs first; second initiative uses wait time productively.
**Downside:** The initiative that waits absorbs delivery schedule risk. Requires both sponsors to accept the framework.

### Option 2 — Capacity Negotiation with Scope Reduction
Both initiatives proceed in parallel, but each sponsor commits to a reduced MVP scope that fits within a defined engineering allocation (e.g., 60/40 or 50/50 split). Scope cuts are owned by the sponsoring SVP, not imposed by the team.

**Upside:** Both initiatives show forward momentum.
**Downside:** Risk of both delivering late or under-spec if scope reduction is insufficient. Engineering context-switching overhead reduces effective capacity by an estimated 15–25%.

### Option 3 — Surge Resourcing
Identify whether temporary capacity can be sourced: contractor augmentation, a team loan from an adjacent org, or acceleration of a pending hire. If feasible within budget authority below SVP level, this dissolves the deadlock without sequencing.

**Upside:** No zero-sum tradeoff.
**Downside:** Ramp time for external or loaned engineers typically costs 2–4 weeks of productivity. Not viable if the constraint is institutional knowledge, not headcount.

---

## Prioritization Criteria (Sequencing Tiebreaker)

When Option 1 applies, use the following criteria in rank order to determine which initiative runs first. Each criterion is answerable without CEO input:

1. **Contractual or regulatory deadline hardness** — Does either initiative have an external, non-negotiable date (customer SLA, regulatory filing, partner contract)? Hard external deadlines override internal priority debates.

2. **Revenue at risk vs. revenue opportunity** — Protecting committed revenue (existing customer churn, contract penalty) outweighs equivalent new revenue opportunity when probability-weighted ARR is comparable.

3. **Reversibility** — Which initiative, if delayed 6–8 weeks, causes the more permanent damage? Irreversible market windows (competitive launch timing, regulatory cycles) rank above recoverable delays.

4. **Engineering readiness** — Which initiative has completed prerequisites (design, discovery, dependency resolution) such that engineering time will not be blocked? Sequencing an initiative that is not engineering-ready first wastes the prioritization.

5. **Organizational dependency chain** — Which initiative gates the most downstream work across other teams? Unblocking a chain of dependent work has compounding value.

**Decision rule:** The initiative that wins on the first criterion that produces a clear asymmetry is sequenced first. If criteria 1–5 are genuinely tied, move to Option 2 with an explicit scope reduction negotiation.

---

## Unknowns & Evidence Gaps

This recommendation cannot be fully operationalized without the following inputs. These are not rhetorical — the recommendation may change if any of these resolve asymmetrically.

| # | Unknown | Why It Matters | How to Resolve |
|---|---------|---------------|----------------|
| 1 | Are there external deadlines (contractual, regulatory, partner) attached to either initiative? | Criterion 1 is dispositive if true | Each sponsor produces deadline documentation within 48 hours |
| 2 | What is the fully-loaded engineering scope of each initiative (story points, team-weeks)? | Without this, Option 2 scope splits are notional | Engineering lead produces rough-order-magnitude estimates for both, independent of sponsor input |
| 3 | Is surge resourcing (contractors, team loan) within budget authority of either SVP independently? | Option 3 dissolves the deadlock entirely if feasible | Finance and/or the relevant SVP confirms budget headroom within one business day |
| 4 | What is the current engineering team's effective available capacity? | Both initiatives may be over-estimated against actual team throughput | Engineering lead provides current-sprint velocity and committed obligations |
| 5 | Does either initiative have prerequisite work that is not yet engineering-ready? | Sequencing a not-ready initiative first destroys value | PM leads for each initiative confirm readiness against a standard definition of ready checklist |
| 6 | What is the cost of a 6–8 week delay to each initiative, in concrete business terms? | Required to apply criteria 2 and 3 | Each sponsor provides a written impact statement — revenue at risk, customer impact, competitive consequence |

**Critical gap:** Without evidence on items 1, 2, and 6, any sequencing recommendation is an informed hypothesis, not a defensible decision. The next 48–72 hours should be spent closing these three gaps before the sponsors are asked to commit.

---

## Pass/Fail Readiness

This recommendation is **ready to present to both sponsors** as a framework for resolution. It is **not yet ready** for a final sequencing commitment. The distinction matters: presenting the framework now aligns both sponsors on the decision process; committing to a sequence before evidence gaps close risks a decision that one sponsor successfully challenges on factual grounds.

**Pass conditions for moving to final decision:**
- [ ] Both sponsors have submitted written impact statements for a delay scenario (gap #6)
- [ ] Engineering lead has delivered scope estimates for both initiatives (gap #2)
- [ ] Surge resourcing feasibility is confirmed or ruled out (gap #3)
- [ ] Engineering readiness is confirmed for the initiative that would be sequenced first (gap #5)

**Fail conditions that require re-routing:**
- If a hard external deadline exists on one initiative (gap #1 resolves asymmetrically) → skip the framework and sequence on criterion 1 immediately; no further deliberation needed
- If surge resourcing is feasible within existing budget (gap #3) → move to Option 3; sequencing debate becomes moot
- If both initiatives are not engineering-ready → neither sequences first; use the wait time to achieve readiness, revisit in 2 weeks

**Sponsor agreement requirement:** Both SVPs must agree to the prioritization criteria framework before it is applied. If either sponsor rejects the framework itself (not the outcome), that is a new escalation requiring a different resolution path (e.g., CFO arbitration on business value, or a neutral third SVP as tiebreaker). Document the framework agreement in writing before proceeding.

---

## Recommended Next Artifact

**Artifact:** Joint Decision Brief — 1-page summary for both SVP sponsors, co-authored by the two initiative PMs, presenting:
1. The three resolution options with tradeoffs stated neutrally
2. The five prioritization criteria with definitions
3. The six evidence requests with owners and 48-hour deadline
4. A proposed decision date (recommend: 5 business days from today)

**Why this artifact:** The current deadlock is partly a process failure — there is no shared framework both sponsors have agreed to use. A co-authored brief forces alignment on the decision process before the decision is made. It also creates a paper trail that demonstrates good-faith resolution effort, which matters if the situation later requires executive visibility.

**Owner:** The initiative PMs (not the sponsors) draft the brief. Sponsor input is input, not authorship. Sponsors sign off on the final version.

**Success signal:** Both sponsors agree to submit their evidence requests by the deadline and attend a joint decision meeting. If one sponsor refuses to participate in the joint brief process, that refusal is itself a data point for escalation — it indicates the deadlock is political, not analytical, and requires a different intervention.

