# PRD Evaluation Rubric

Evaluates PRDs produced by the `/write-prd` workflow or the `prd-development` skill.

## Universal dimensions

Apply the 4 dimensions from the [universal rubric](rubric.md): Clarity, Completeness, Actionability, Correctness.

## PRD-specific dimensions

### 5. Scope Discipline

**What it measures:** Are boundaries explicit? Is "out of scope" defined with rationale, not just omitted?

| Score | Anchor |
|---|---|
| **3 (Weak)** | No out-of-scope section. In-scope items are vague enough that scope could expand indefinitely. "Build a great onboarding experience" with no boundaries. |
| **6 (Adequate)** | Out-of-scope section exists but is a simple list without rationale. "Out of scope: internationalization." Why? When would you revisit? Unknown. |
| **9 (Strong)** | Every out-of-scope item has a rationale and a revisit trigger. "Out of scope: Azure integration, 89% of customers use AWS/GCP. Revisit when 3+ enterprise customers request it." In-scope items are bounded enough that an engineer can estimate. |

### 6. Evidence Grounding

**What it measures:** Are decisions backed by data, customer evidence, or explicit reasoning, not just assertions?

| Score | Anchor |
|---|---|
| **3 (Weak)** | Decisions are asserted without evidence. "Customers need this feature." Which customers? How many? What did they say? |
| **6 (Adequate)** | Some decisions cite evidence, but it's generic. "Based on customer feedback" without specifics. Metrics exist but baselines are missing. |
| **9 (Strong)** | Key decisions cite specific evidence: "8/12 CAB members independently raised this; support tickets up 34% QoQ; win rate drops 23pp when competing against Vanta on this dimension." Metrics have baselines and targets. |

## Scored example: 9/10 vs. 6/10

The following excerpts show the same PRD section at two quality levels. The full golden output is in [examples/golden-outputs/prd.md](../examples/golden-outputs/prd.md).

### Context & Motivation, scored 9/10

> **Customer evidence:** Q1 customer health reviews identified manual evidence collection as the #1 churn risk factor. 8/12 CAB members independently raised this as their top pain point. Support tickets related to "evidence upload" increased 34% QoQ.
>
> **Business case:** 60% of Q2 pipeline deals cite integration depth as an evaluation criterion. Win rate against Vanta drops from 45% to 22% when the prospect uses AWS + GitHub.
>
> **Opportunity cost:** This displaces the "Custom Report Builder" initiative from the Q3 roadmap. Report Builder had a RICE score of 34; Evidence Auto-Collection scored 67.

**Why 9/10:** Every claim cites a specific source (CAB, support tickets, pipeline data, win/loss). The opportunity cost is quantified with RICE scores. A reader can evaluate whether the evidence justifies the decision.

### Context & Motivation, scored 6/10

> **Customer evidence:** Customers have told us that manual evidence collection is painful and time-consuming. Multiple customers have requested integrations with cloud providers.
>
> **Business case:** Better integrations would improve our competitive position and help us win more deals.
>
> **Opportunity cost:** We will deprioritize some other initiatives to focus on this.

**Why 6/10:** The structure is correct (customer evidence, business case, opportunity cost are all present), but the content is vague. "Multiple customers" is not a number. "Improve competitive position" is not a metric. "Some other initiatives" is not a trade-off.

### Goals & Success Metrics, scored 9/10

> | Goal | Metric | Current | Target | Timeframe |
> |---|---|---|---|---|
> | Automate evidence collection | % controls with auto-collected evidence | 0% | 60% | 8 weeks post-launch |
> | Reduce audit prep time | Time to first framework completion | 47 days | 30 days | Q3 2026 |
>
> **Guardrail metrics:**
> - Evidence mapping accuracy must stay above 95%
> - Integration setup completion rate must stay above 80%

**Why 9/10:** Every metric has a baseline, a target, and a timeframe. Guardrail metrics define what must NOT get worse. A PM can look at this 8 weeks post-launch and know unambiguously whether the feature succeeded.

### Goals & Success Metrics, scored 6/10

> **Success Metrics:**
> - Reduce evidence collection time by 70%
> - 90% of evidence collected automatically
> - Customer satisfaction improvement

**Why 6/10:** Metrics exist but have no baselines (70% reduction from what?), no timeframe, and the last one ("customer satisfaction improvement") is unmeasurable as stated. No guardrails.

## Weights

When averaging across dimensions for an overall PRD score, weight as follows:

| Dimension | Weight | Rationale |
|---|---|---|
| Clarity | 15% | Important but table-stakes for any document |
| Completeness | 20% | PRDs must cover all sections to be useful |
| Actionability | 20% | PRDs exist to drive engineering action |
| Correctness | 15% | Framework application matters but is secondary to content |
| Scope Discipline | 15% | Scope creep is the #1 PRD failure mode |
| Evidence Grounding | 15% | Prevents "solution in search of a problem" PRDs |
