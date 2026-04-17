# North Star Metric Recommendation: Resolving the Active User Definition Conflict

## Decision Frame

Leadership has requested a single number, but three incompatible definitions of "active user" produce outcomes differing by 40% — enough to indicate opposite growth trajectories depending on which you choose. This is not a measurement discrepancy to be resolved by averaging or by executive decree. It is a decision architecture failure: each team built a definition to serve a different purpose, and those purposes were never reconciled.

The core decision leadership must make is not *which number is right* but *what behavior this metric is meant to change*. A north star metric is only useful if it creates a shared incentive. A number that finance uses for revenue forecasting, product uses for feature prioritization, and growth uses for funnel optimization will generate conflicting roadmap decisions regardless of which definition wins.

**What the gap reveals:** A 40% difference between definitions means the definitions are counting events that do not reliably co-occur. At least one definition is either (a) counting events too early in the user journey to reflect sustained value, (b) using a time window that inflates or deflates the cohort, or (c) counting a different user population entirely. The gap is diagnostic, not just inconvenient.

**Provisional framing for leadership:** Before a single number is chosen, leadership must answer one question: *Is the north star metric intended to be a leading indicator of future value, a lagging indicator of current health, or an operational dashboard signal?* These purposes require different definitions. Conflating them is likely how three incompatible definitions emerged in the first place.

**Provisional recommendation on selection:** When definitions conflict, default to the most behaviorally specific and most restrictive definition — the one that requires the most intentional user action to qualify. Permissive definitions inflate the numerator, delay detection of churn, and produce optimism that does not survive contact with revenue outcomes. The restrictive definition may show the product as flat or declining; if so, that is the signal leadership needs, not a reason to reject the definition.

---

## Unknowns & Evidence Gaps

The following are unresolved before any definition can be declared authoritative:

1. **Behavioral triggers are unspecified.** What action qualifies a user as active under each definition — login, session initiation, core feature touch, transaction, API call — has not been documented in this engagement. Without this, no comparison is possible and no selection is defensible.

2. **Time windows are unconfirmed.** A 7-day vs. 30-day activity window can alone produce a gap of the magnitude described, with no behavioral difference between definitions. Whether the 40% gap is primarily a window artifact or a behavioral artifact is unknown.

3. **Population scope may differ.** Finance may count only paying accounts. Product may count all registered users. Growth may count marketing-qualified leads or trial activations. If the populations are non-overlapping, the definitions are not competing — they measure different things — and forcing a single number would obscure all three.

4. **Retention correlation is unknown.** The definition with the strongest documented relationship to 90-day retention should anchor the north star. Whether any team has run this analysis is not established.

5. **External disclosure exposure is unconfirmed.** If any definition has been reported to investors, board members, or in public filings, changing the canonical definition mid-stream carries a disclosure obligation independent of the operational question. This has not been surfaced.

6. **Metric governance ownership is absent.** No team has been identified as having authority to set or change the canonical definition. Without governance ownership, any recommendation will be re-litigated at the next planning cycle or whenever a new team finds the current number inconvenient.

---

## Pass/Fail Readiness

**This artifact is NOT ready to name a single north star number.**

Readiness criteria not yet met:
- [ ] Behavioral triggers for all three definitions documented side by side
- [ ] Time-window parameters confirmed for each definition
- [ ] Population scope confirmed (are all three definitions counting the same users?)
- [ ] Retention correlation analysis completed or confirmed unavailable
- [ ] External disclosure implications reviewed
- [ ] Metric governance owner designated

**This artifact IS ready to:**
- Frame the structural decision leadership must make before a number is selected
- Block a premature commitment that embeds the wrong incentive into roadmap and compensation
- Specify the minimum evidence required to reach a defensible recommendation
- Describe the selection rule that should govern the final choice

Committing to a number before diagnosing the source of the 40% gap does not resolve the disagreement — it suppresses it. The gap will re-emerge the next time finance, product, and growth compare notes, and leadership will have less standing to adjudicate because they will have already picked a side.

---

## Recommended Next Artifact

**Definition Audit Memo** — a structured side-by-side comparison of all three active-user definitions, produced by data engineering with sign-off from each team's analytics owner.

Required columns for each definition:

| Dimension | Finance Definition | Product Definition | Growth Definition |
|---|---|---|---|
| Behavioral trigger | ? | ? | ? |
| Time window | ? | ? | ? |
| User population included | ? | ? | ? |
| Current reported figure | ? | ? | ? |
| 90-day retention correlation (if available) | ? | ? | ? |

Target turnaround: one business week from agreement to proceed.

**Selection rule once memo is populated:** The definition whose behavioral trigger has the strongest documented relationship to 90-day retention becomes the north star. If retention data is unavailable, the most restrictive definition (lowest qualifying count) is adopted as the conservative baseline, labeled as pending validation, and revisited after one retention cohort cycle.

**Governance artifact to follow immediately after:** A metric governance charter that designates a single owner for the active-user definition, requires cross-functional sign-off before any redefinition, and mandates a minimum notice period before changes take effect in leadership reporting. Without this, the 40% gap will silently reconstitute itself within two planning cycles.
