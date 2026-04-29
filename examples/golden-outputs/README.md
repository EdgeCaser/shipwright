# Golden Outputs

These examples show the difference between what a generic AI produces and what Shipwright produces for the same prompt. Each example uses the same fictional product context: **ComplianceOS**, a B2B SaaS compliance automation platform (see `examples/CLAUDE.md.b2b-saas` for full context).

## Why these exist

Skills and workflows define *structure*, but structure alone doesn't prove quality. These examples let you judge the output for yourself before adopting Shipwright.

Each example shows:

1. **Scenario**, what the PM is trying to accomplish
2. **Input prompt**, what you'd actually type
3. **Baseline output**, what a capable AI produces without Shipwright (typical ChatGPT/Claude response)
4. **Shipwright output**, what the same AI produces when guided by a Shipwright skill or workflow
5. **Why it's better**, specific annotations on what changed and why it matters

## The examples

| Example | Skill / Workflow | What it demonstrates |
|---|---|---|
| [PRD](prd.md) | `/write-prd` workflow | Working Backwards method forces customer-first thinking; structured phases prevent requirements-first tunnel vision |
| [Strategy](strategy.md) | `/strategy` workflow | Falsifiable bets with kill criteria replace vague strategic direction; boundaries make the strategy actionable |
| [Design Review](design-review.md) | `design-review` skill | 7-perspective review catches blind spots that single-perspective reviews miss; forced verdicts prevent hand-waving |
| [A/B Analysis](ab-analysis.md) | `ab-test-analysis` skill | Structured rigor checks prevent premature ship decisions; segment analysis and guardrails catch hidden regressions |
| [Adversarial Review](adversarial-review.md) | `adversarial-review` skill | 5-vector sweep with calibrated severity replaces theatrical skepticism; specific claims challenged with resolution conditions |

## How to read these

Start with [PRD](prd.md), it's the most common PM artifact and the contrast is sharpest.

The baseline outputs are not intentionally bad. They represent what a competent AI produces when given a reasonable prompt and no framework guidance. The point is not "AI is bad without us", it's "frameworks produce more rigorous, decision-ready artifacts."

## Generating your own

Run any workflow or skill with your real product context and compare the output against what you'd get from a vanilla prompt. The difference compounds across a full workflow chain, a `/write-prd` that chains press release → FAQ → stories → full PRD produces a fundamentally different artifact than "write me a PRD."
