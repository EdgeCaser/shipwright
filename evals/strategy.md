# Strategy Evaluation Rubric

Evaluates strategy documents produced by the `/strategy` workflow or the `product-strategy-session` skill.

## Universal dimensions

Apply the 4 dimensions from the [universal rubric](rubric.md): Clarity, Completeness, Actionability, Correctness.

## Strategy-specific dimensions

### 5. Decision Courage

**What it measures:** Does the strategy make hard choices — or does it try to do everything?

| Score | Anchor |
|---|---|
| **3 (Weak)** | No explicit trade-offs. Strategy lists 6+ priorities with no ranking. "We will NOT" section is absent or empty. Reads like a wish list. |
| **6 (Adequate)** | Some boundaries exist, but they're safe choices. "We will not pursue a market we've never considered" is not a hard decision. The strategy avoids the genuinely painful trade-offs. |
| **9 (Strong)** | 2-4 bets maximum, with explicit "We will NOT" decisions that a reasonable person might disagree with. "We will NOT add ISO 27001 this half" when 30% of prospects ask for it — that's a real choice with a real cost, stated openly. |

**Common failure mode:** More than 4 strategic bets. If everything is a priority, the strategy provides no focus. A 9/10 strategy says "we're NOT doing this valuable thing because this other thing matters more."

### 6. Falsifiability

**What it measures:** Can the strategy be proven wrong? Are bets structured as testable hypotheses with kill criteria?

| Score | Anchor |
|---|---|
| **3 (Weak)** | Bets are stated as facts ("we need to go enterprise") rather than hypotheses. No kill criteria. No conditions under which the team would change course. |
| **6 (Adequate)** | Bets have success metrics but no kill criteria. The team will know if the bet *works* but has no pre-committed trigger for *stopping* if it doesn't. |
| **9 (Strong)** | Every bet has a thesis ("we believe X because Y"), conditions ("what would have to be true"), success metrics, AND kill criteria ("abandon if Z by date"). The strategy can be disproven — and the team has agreed in advance on what disconfirming evidence looks like. |

**Common failure mode:** Kill criteria that are impossible to trigger. "Abandon if we have zero customers" is not a real kill criterion. "Abandon if enterprise pipeline doesn't reach 10 qualified opportunities by end of Q3" is — it's specific, time-bound, and plausible.

## Scored example: 9/10 vs. 6/10

The full golden output is in [examples/golden-outputs/strategy.md](../examples/golden-outputs/strategy.md).

### Strategic Bet — scored 9/10

> **Bet: Evidence Auto-Collection (Major)**
>
> **Thesis:** We believe that automatically collecting 60%+ of compliance evidence from cloud infrastructure will reduce time-to-audit-ready by 40% and become our primary competitive differentiator, because the #1 pain point across our customer base is manual evidence gathering and our win rate drops 23 points against Vanta when prospects use AWS + GitHub.
>
> **What would have to be true:**
> - Cloud provider APIs expose sufficient evidence
> - Evidence-to-control mapping can be automated at >95% accuracy
> - Customers will grant read-only infrastructure access
>
> **Investment level:** Major — 2 engineers, 10 weeks
> **Kill criteria:** Abandon if evidence mapping accuracy falls below 90% after 4 weeks of iteration, or if fewer than 40% of existing customers connect at least one integration within 60 days of launch.

**Why 9/10:** The thesis is falsifiable ("reduce time-to-audit-ready by 40%"). Assumptions are explicit and testable. Kill criteria are specific, time-bound, and tied to metrics the team can actually measure. Resource commitment is stated.

### Strategic Bet — scored 6/10

> **Enterprise Readiness**
>
> Build features needed to serve larger organizations (500+ employees), including role-based access control, SSO/SAML, audit trails, and multi-team workspaces. This is critical to moving upmarket as the board requires.
>
> **Success Metrics:**
> - Land 3 enterprise customers by end of year

**Why 6/10:** Structured as a feature list, not a bet. No thesis explaining *why* these specific features unlock enterprise deals. No assumptions stated. No kill criteria — the team will invest for a full year with no pre-agreed exit ramp. "As the board requires" is an appeal to authority, not a strategic argument.

### Boundaries — scored 9/10

> **We will NOT:**
> - **Add ISO 27001 or GDPR in H2 2026** — Rationale: international frameworks add localization, legal review, and support complexity. Our current 3 frameworks serve 95% of our customer base.
> - **Pursue SMB (sub-100 employees)** — Rationale: our pricing and support model doesn't work below 100 employees. This is Vanta's strongest segment.
>
> **We will DEFER:**
> - Azure and GitLab integrations — Revisit: Q1 2027 or when 3+ enterprise customers request them

**Why 9/10:** Each "no" has a rationale, a data point, and a revisit trigger. The SMB decision is genuinely painful (leaving money on the table) and openly stated. Deferrals are distinguished from permanent no's.

### Boundaries — scored 6/10

> **Risks:**
> - Moving upmarket too fast could strain our support team
> - International frameworks add compliance complexity

**Why 6/10:** Risks are identified but not decided upon. "Could strain" is an observation, not a boundary. A reader doesn't know whether the team has *decided* not to pursue international frameworks or is simply worried about it.

## Weights

| Dimension | Weight | Rationale |
|---|---|---|
| Clarity | 10% | Important but strategy docs are read by senior audiences who tolerate nuance |
| Completeness | 15% | Missing sections (especially boundaries) fundamentally weaken a strategy |
| Actionability | 20% | Strategy must drive execution decisions |
| Correctness | 10% | Framework application is secondary to strategic judgment |
| Decision Courage | 25% | The primary purpose of strategy is to make choices |
| Falsifiability | 20% | Unfalsifiable strategies can never be evaluated or improved |
