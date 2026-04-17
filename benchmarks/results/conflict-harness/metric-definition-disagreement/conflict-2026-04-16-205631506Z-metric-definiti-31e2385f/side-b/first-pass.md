# North Star Metric Recommendation: Resolving the Active User Trilemma

## Decision Frame

Leadership has asked for a single number. The honest answer is: picking one of the three existing definitions without first resolving *what question the metric must answer* will produce a number that satisfies no one and misleads everyone.

The 40% spread between definitions is not a data quality problem — it is a strategic ambiguity problem. Each definition encodes a different theory of value:

- **Finance's definition** likely anchors on revenue-correlated behavior (e.g., a paid action, a billing event). It answers: *Are we retaining customers who generate revenue?*
- **Product's definition** likely anchors on core feature engagement. It answers: *Are users experiencing the product's intended value?*
- **Growth's definition** likely uses a broader activity signal (e.g., any login). It answers: *How large is our reachable active base?*

All three questions are legitimate. None is wrong. But they produce different numbers because they are measuring different things. Forcing a single number before resolving the underlying question does not create alignment — it creates the appearance of alignment while the underlying disagreement persists and resurfaces at every quarterly review.

**The recommended frame:** Leadership should define the north star as the metric that best predicts long-term sustainable value delivery to customers. The selection criterion is predictive validity, not political compromise. The immediate deliverable is not a number — it is a decision about which user behavior, when sustained, indicates the product is working.

**Interim position:** Until the north star is validated, report all three definitions transparently in a single dashboard with explicit labels. Name the divergence publicly. This prevents any one team from winning by default through the choice of which number gets surfaced in the board deck.

---

## Unknowns & Evidence Gaps

1. **No retention or revenue correlation data is available.** The case does not contain evidence about which definition of active correlates with retention, expansion revenue, or customer lifetime value. Without this, any choice between definitions is a guess dressed as a decision.

2. **The causal theory is unstated.** What behavior does the product believe drives value? If the product team has not written down a falsifiable hypothesis connecting user behavior to business outcome, there is no principled basis for selecting a metric.

3. **Trend direction per definition is unknown beyond the label.** We know the three definitions disagree on whether the product is growing, flat, or declining — but we do not know the magnitude of divergence over time, which definitions have been stable, or whether any definition has historically tracked what leadership actually cares about.

4. **Stakeholder incentives are opaque.** Finance, product, and growth each have organizational incentives that may shape their preferred definition independent of its predictive validity. Understanding those incentives is required to assess whether alignment is achievable through analysis or requires executive arbitration.

5. **No user segmentation data is present.** A metric that aggregates across segments may obscure that the product is simultaneously growing with one customer type and declining with another — making the grow/flat/decline disagreement a segmentation artifact rather than a definitional one.

---

## Pass/Fail Readiness

**This recommendation is NOT ready to produce a single north star number.**

Pass criteria for a north star selection decision:
- [ ] At least one definition has been tested for correlation with a downstream outcome the business agrees matters (retention, revenue, or a leading indicator thereof)
- [ ] The product team has documented a falsifiable value hypothesis linking user behavior to business outcome
- [ ] Leadership has explicitly chosen whether the north star should optimize for breadth (reachable base), depth (core engagement), or monetization correlation — these are mutually exclusive priorities at the definition level
- [ ] A time-bounded validation process has been commissioned to test predictive validity of candidate definitions

**What is ready now:** A structured definition audit and a 30-day validation sprint design. The receiving team (analytics or strategy) can begin immediately without waiting for executive resolution.

---

## Recommended Next Artifact

**Artifact:** Definition Validation Sprint Brief

**Owner:** Analytics lead, with sign-off from Finance, Product, and Growth leads

**Contents:**
1. Formal write-up of each definition's inclusion/exclusion criteria (makes the implicit explicit)
2. Hypothesis statement for each: *If this definition is the right one, then users who qualify should show [outcome] at [rate] within [timeframe]*
3. A 30-day backtest plan against historical cohorts using retention or revenue as the downstream signal
4. A pre-agreed decision rule: whichever definition shows the strongest predictive correlation within the defined timeframe becomes the north star candidate, subject to executive review

**Why this artifact, not a metric choice:** Choosing a number now without validation data would require leadership to accept one team's framing on faith. The validation sprint produces evidence that makes the choice defensible to all three stakeholders and to the board. It also surfaces the possibility that none of the three existing definitions is optimal — a finding that is better to discover in a sprint than after committing to a metric publicly.
