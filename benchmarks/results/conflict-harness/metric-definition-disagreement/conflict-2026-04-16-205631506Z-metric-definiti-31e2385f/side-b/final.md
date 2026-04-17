# North Star Metric Recommendation: Resolving the Active User Trilemma

## Decision Frame

Leadership has asked for a single number. The honest answer is: picking one of the three existing definitions without first resolving *what question the metric must answer* will produce a number that satisfies no one and misleads everyone.

The 40% spread between definitions is not a data quality problem — it is a strategic ambiguity problem. Each definition encodes a different theory of value:

- **Finance's definition** likely anchors on revenue-correlated behavior (e.g., a paid action, a billing event). It answers: *Are we retaining customers who generate revenue?*
- **Product's definition** likely anchors on core feature engagement. It answers: *Are users experiencing the product's intended value?*
- **Growth's definition** likely uses a broader activity signal (e.g., any login). It answers: *How large is our reachable active base?*

All three questions are legitimate. None is wrong. But they produce different numbers because they are measuring different things. Forcing a single number before resolving the underlying question does not create alignment — it creates the appearance of alignment while the underlying disagreement persists and resurfaces at every quarterly review.

**The recommended frame:** Leadership should define the north star as the metric that best predicts long-term sustainable value delivery to customers. The selection criterion is predictive validity, not political compromise. The immediate deliverable is not necessarily a permanent number — it is a decision about which user behavior, when sustained, indicates the product is working.

**Interim position:** Until the north star is validated, report all three definitions transparently in a single dashboard with explicit labels. Name the divergence publicly. This prevents any one team from winning by default through the choice of which number gets surfaced in the board deck.

---

## Unknowns & Evidence Gaps

1. **No retention or revenue correlation data is available.** The case does not contain evidence about which definition of active correlates with retention, expansion revenue, or customer lifetime value. Without this, any choice between definitions is a guess dressed as a decision.

2. **The causal theory is unstated.** What behavior does the product believe drives value? If the product team has not written down a falsifiable hypothesis connecting user behavior to business outcome, there is no principled basis for selecting a metric.

3. **Trend direction per definition is unknown beyond the label.** We know the three definitions disagree on whether the product is growing, flat, or declining — but we do not know the magnitude of divergence over time, which definitions have been stable, or whether any definition has historically tracked what leadership actually cares about.

4. **Stakeholder incentives are opaque.** Finance, product, and growth each have organizational incentives that may shape their preferred definition independent of its predictive validity. Understanding those incentives is required to assess whether alignment is achievable through analysis or requires executive arbitration.

5. **No user segmentation data is present.** A metric that aggregates across segments may obscure that the product is simultaneously growing with one customer type and declining with another — making the grow/flat/decline disagreement a segmentation artifact rather than a definitional one.

6. **Historical data availability is unknown.** Whether a backtest against retention or revenue outcomes is feasible depends on data that is not present in this case. If no usable historical record exists, an analytical validation path is not available.

7. **Stakeholder appetite for delay is unknown.** Leadership has asked for a single number now. Whether they will accept a structured validation process — and for how long — is not established by the case.

---

## Pass/Fail Readiness

**This recommendation is NOT ready to produce a validated, permanent north star number.**

Pass criteria for a permanent north star selection:
- [ ] At least one definition has been tested for correlation with a downstream outcome the business agrees matters (retention, revenue, or a leading indicator thereof)
- [ ] The product team has documented a falsifiable value hypothesis linking user behavior to business outcome
- [ ] Leadership has explicitly chosen whether the north star should optimize for breadth (reachable base), depth (core engagement), or monetization correlation — these are mutually exclusive priorities at the definition level

**What leadership must choose between now:** Two delivery paths with different risk profiles.

---

## Recommended Next Artifact

Leadership must choose one of two paths. Both are defensible depending on organizational constraints the case does not resolve.

### Path A — Provisional Recommendation (if a number is required immediately)

**Artifact:** Provisional North Star Decision Memo

**Contents:**
1. Explicitly select one definition — the one most tightly connected to a downstream outcome the business already tracks — as the provisional north star
2. Document the selection rationale and its known limitations in the memo itself
3. Attach a sunset clause: the provisional definition is subject to replacement within a defined timeframe if a competing definition is shown to be more predictive
4. Require all three teams to continue reporting their definitions internally during the provisional period so the divergence remains visible

**Risk:** The provisional choice will be perceived as a political win for one team. The sunset clause is the only structural hedge against that perception calcifying into permanent lock-in.

### Path B — Validation Sprint (if leadership will accept a short delay)

**Artifact:** Definition Validation Sprint Brief

**Owner:** Analytics lead, with sign-off from Finance, Product, and Growth leads

**Contents:**
1. Formal write-up of each definition's inclusion/exclusion criteria (makes the implicit explicit)
2. Hypothesis statement for each: *If this definition is the right one, then users who qualify should show [outcome] at [rate] within [timeframe]*
3. A backtest plan against historical cohorts using retention or revenue as the downstream signal — contingent on historical data being available
4. A pre-agreed decision rule: whichever definition shows the strongest predictive correlation becomes the north star candidate, subject to executive review

**Risk:** This path assumes historical data exists and that stakeholders will accept a delay. Neither is established by the available case. If either assumption fails, the sprint stalls and leadership is no better positioned than before.

**Which path to take:** If leadership cannot accept ambiguity for even a short window, Path A with a well-structured sunset clause is the less-bad option. If leadership is willing to invest time in analytical resolution, Path B produces a more defensible outcome. The case does not contain enough information to prescribe one over the other — that judgment belongs to the executive who understands organizational constraints not visible here.
