# Golden Output: A/B Test Analysis

**Skill:** `ab-test-analysis`
**Framework:** Experiment summary → Results → Interpretation → Segments → Decision
**Product context:** ComplianceOS, B2B SaaS compliance automation (see `examples/CLAUDE.md.b2b-saas`)

---

## Scenario

ComplianceOS ran an A/B test on its onboarding flow. The treatment group got a new "guided setup checklist" that replaced the previous unstructured onboarding email sequence. The test ran for 6 weeks and the PM needs to decide whether to ship it.

## Input prompt

```
Analyze our onboarding A/B test results. We tested a guided setup checklist
vs. the current email sequence. The checklist group had 12% higher activation
(completing first framework) but 8% lower 30-day NPS. Test ran 6 weeks,
n=340 total (170 per group). Help me make the ship/no-ship decision.
```

---

## Baseline output (without Shipwright)

> The AI gives directional advice but doesn't apply statistical rigor. Notice the missing guardrail checks, segment analysis, and rigor validation.

### A/B Test Analysis: Onboarding Checklist

**Results Summary:**
- Checklist group: 12% higher activation rate (first framework completion)
- Checklist group: 8% lower 30-day NPS
- Sample: 170 per group, 6-week test

**Analysis:**

This is a mixed result. The activation improvement is meaningful, a 12% lift in framework completion directly impacts your North Star metric. However, the NPS decline is concerning, especially since your current NPS of 34 is already below target.

The tension is likely because the checklist pushes users through setup faster, which improves activation but may feel more mechanical and less supportive than the email sequence, which probably felt more personal.

**Recommendation:** Ship it, but with modifications. The activation gain is too important to leave on the table. However, address the NPS drop by:
1. Adding more personalization to the checklist
2. Keeping some of the email touchpoints alongside the checklist
3. Monitoring NPS closely after full rollout

The 12% activation lift will compound over time and likely improve retention, which may eventually bring NPS back up as customers see more value from the product.

---

## Shipwright output (with `ab-test-analysis` skill)

> The skill forces structured analysis: rigor checks before interpreting results, explicit effect classification, segment analysis, and a decision framework with rationale tied to data.

## Experiment: Onboarding Guided Setup Checklist

**Hypothesis:** We believe that replacing the unstructured email onboarding sequence with a guided setup checklist will increase activation (first framework completion within 30 days) because new users currently lack a clear path through setup and the checklist reduces decision fatigue.

**Test dates:** January 12, February 22, 2026
**Duration:** 42 days (6 weeks)
**Traffic allocation:** 50% control / 50% treatment
**Sample size:** Control: 170 | Treatment: 170
**Primary metric:** Activation rate (first framework completion within 30 days)
**Secondary metrics:** Time-to-first-framework-completion, setup step completion rate
**Guardrail metrics:** 30-day NPS, support ticket volume during onboarding

## Results

### Primary Metric: Activation Rate

| Variant | Activation Rate | Change vs. Control | 95% CI | Significant? |
|---|---|---|---|---|
| Control (email sequence) | 38.2% (65/170) |, |, |, |
| Treatment (checklist) | 42.9% (73/170) | +12.3% relative (+4.7pp absolute) | [-1.8pp, +11.2pp] | No |

**Statistical significance:** p = 0.14 (threshold: p < 0.05)
**Practical significance:** A 4.7 percentage point lift in activation is meaningful if real, translates to ~8 additional activated customers per quarter at current volume.
**Power:** With n=170 per group and a baseline of 38%, this test had 34% power to detect a 5pp lift. The test was significantly underpowered.

### Secondary Metrics

| Metric | Control | Treatment | Change | Significant? |
|---|---|---|---|---|
| Median time-to-first-completion | 51 days | 39 days | -23.5% | Yes (p=0.03) |
| Setup step completion (all 5 steps) | 44.1% | 67.1% | +52.2% | Yes (p<0.001) |

### Guardrail Metrics

| Metric | Control | Treatment | Change | Status |
|---|---|---|---|---|
| 30-day NPS | 28 | 21 | -25.0% relative (-7 points) | Degraded |
| Support tickets (per customer, first 30 days) | 2.1 | 1.4 | -33.3% | Improved |

## Interpretation

### Statistical Rigor Check
- [ ] **Sample size meets MDE requirements:** NO. With n=170 per group, the minimum detectable effect is ~10pp (not the 5pp we hoped to detect). This test needed ~500 per group for adequate power.
- [x] Test ran for at least 1 full business cycle: Yes (6 weeks covers multiple business cycles for B2B)
- [x] No sample ratio mismatch: 170/170 split is clean
- [ ] **Novelty/primacy effects considered:** UNCLEAR. The checklist is a new UX element, early users may engage more (novelty) or less (unfamiliar). 6 weeks may not be long enough to wash out novelty for B2B with long onboarding cycles.
- [x] Multiple comparison correction: N/A (single primary metric)

### Effect Classification

| Classification | Criteria | Our Result |
|---|---|---|
| Clear Win | Primary metric sig. positive, no guardrail degradation | No |
| Clear Loss | Primary metric sig. negative | No |
| Inconclusive | Not statistically significant | **Yes, primary metric** |
| Mixed | Primary positive but secondary/guardrail negative | **Yes, directional pattern** |
| Surprising | Result opposite to hypothesis | Partially, NPS degradation was not anticipated |

**Classification: Inconclusive with a concerning mixed signal.** The primary metric is not statistically significant due to insufficient power. The directional pattern (activation up, NPS down) suggests the checklist may trade user satisfaction for activation speed.

## Segment Analysis

| Segment | N (Control) | N (Treatment) | Activation Change | Significant? |
|---|---|---|---|---|
| Company size <200 employees | 98 | 95 | +18.4% relative | No (p=0.11) |
| Company size 200-500 employees | 52 | 54 | +3.1% relative | No (p=0.89) |
| Company size 500+ employees | 20 | 21 | -5.2% relative | No (p=0.81) |
| SOC 2 only (single framework) | 112 | 108 | +15.8% relative | No (p=0.09) |
| Multi-framework | 58 | 62 | +2.3% relative | No (p=0.91) |

**Segment insights:**
- The checklist effect appears concentrated in smaller companies and single-framework customers. This makes sense, simpler setups benefit more from a structured checklist. Complex multi-framework or enterprise setups may need more guidance than a checklist provides.
- Enterprise segment (500+) shows a slight negative direction, consistent with the NPS degradation, larger orgs may perceive the checklist as oversimplified.

**Caution:** All segment analyses are underpowered (small n per cell). These are hypotheses for future testing, not conclusions.

## Decision

### Recommendation: Iterate, do NOT ship as-is, do NOT revert

**Rationale:**
1. **Insufficient statistical power.** The primary metric is not significant. We cannot confidently claim the 12% lift is real. Shipping based on a p=0.14 result means accepting a ~14% chance this is noise.
2. **Guardrail degradation is real.** The NPS drop from 28 to 21 is significant in practical terms. NPS is already below target (34 vs. 45 goal). Shipping a change that further depresses NPS contradicts a strategic priority.
3. **Strong secondary signals suggest the mechanism works.** Setup step completion improved by 52% (highly significant). Time-to-completion dropped 12 days. The checklist clearly changes behavior, the question is whether the current version trades too much hand-holding for speed.
4. **Segment signal suggests a targeted approach.** The effect appears strongest for smaller, single-framework customers, exactly the segment where a self-serve checklist makes sense. Enterprise customers may need a different treatment.

### Next experiment:

**What we learned:** The checklist successfully drives setup completion and reduces support load, but the current version may feel impersonal or pushy, depressing NPS. The effect is likely segment-dependent.

**Next experiment:** Test a hybrid approach, checklist structure with embedded personal touchpoints (CSM check-in at step 3, human-written tips contextual to the customer's framework). Target single-framework customers under 200 employees only.

**Hypothesis:** A checklist with human touchpoints will maintain the activation lift while preserving NPS, specifically for smaller/simpler customers.

**Required sample size:** 500 per group (for 80% power to detect a 5pp activation lift)
**Estimated duration:** 12-16 weeks at current customer acquisition rate

## Learnings (for the experiment knowledge base)

- **What we expected:** Checklist improves activation without affecting satisfaction
- **What happened:** Activation trended up (not significant), NPS dropped meaningfully, support tickets decreased
- **What we learned:** Structured onboarding drives completion but may sacrifice perceived support quality. The effect is likely segment-dependent, simpler customers benefit, complex customers may feel rushed. Speed and satisfaction are not automatically aligned.
- **Impact on strategy:** Onboarding Acceleration (Strategic Bet 3) should be segmented, different treatments for different customer complexity levels. A one-size-fits-all approach risks hurting the customers we most need to retain.

---

## Why the Shipwright output is better

1. **Power analysis catches the fatal flaw.** The test was underpowered (34% power). The baseline recommends shipping based on a non-significant result. The Shipwright output identifies this immediately and adjusts the recommendation accordingly.

2. **Guardrails are checked explicitly.** The NPS decline is flagged as a guardrail degradation, not just a "concern." The baseline acknowledges the NPS drop but still recommends shipping, the Shipwright framework treats guardrail violations as blocking signals.

3. **Effect classification forces clarity.** Instead of "mixed results," the Shipwright output classifies this as "Inconclusive with a concerning mixed signal" and explains exactly why. The classification table makes it impossible to cherry-pick the positive result.

4. **Segment analysis generates actionable hypotheses.** The finding that the effect concentrates in smaller, single-framework customers directly shapes the next experiment. The baseline has no segment analysis and therefore no path to a better iteration.

5. **Decision includes a concrete next experiment.** The Shipwright output specifies what to test next, with an updated hypothesis and required sample size. The baseline says "ship with modifications" but doesn't define what success looks like for the modified version.

6. **Institutional learning is captured.** "Speed and satisfaction are not automatically aligned" is an insight that applies beyond this experiment. The baseline captures no reusable learning, the analysis dies when the decision is made.
