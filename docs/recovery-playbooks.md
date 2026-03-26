# Recovery Playbooks

This is the operational layer for failure modes. Use these playbooks when outputs fail quality checks.

Each playbook is deterministic: trigger -> action -> expected correction.

## How to use

1. Run `evals/pass-fail.md` checks on the artifact
2. Identify the failed gate(s)
3. Apply the matching playbook below
4. Re-run pass/fail checks

---

## Playbook 1: Weak or fabricated research

**Trigger:** Claims are unsourced, generic, or not traceable to provided data.

**Action:**

1. Re-run discovery with strict evidence constraints:
   ```
   Only use evidence from the materials I provided. For every claim, include source.
   If evidence is missing, write "No data available".
   ```
2. Run `skills/discovery/user-research-synthesis/SKILL.md`
3. Require a table: claim | source | confidence

**Expected correction:** Evidence-backed findings, explicit unknowns, fewer fabricated insights.

---

## Playbook 2: PRD is vague or non-actionable

**Trigger:** Missing baselines/targets, no out-of-scope rationale, open questions without owners.

**Action:**

1. Re-run `skills/execution/prd-development/SKILL.md` with constraints:
   ```
   Enforce numeric metrics with baseline, target, timeframe.
   Every out-of-scope item needs rationale + revisit trigger.
   Every open question must have owner + due date.
   Include the required Decision Frame block.
   ```
2. Validate against `evals/prd.md` and `evals/pass-fail.md`

**Expected correction:** Decision-ready PRD with scope discipline and accountable follow-through.

---

## Playbook 3: Strategy is generic or unfalsifiable

**Trigger:** Too many bets, no kill criteria, no hard "not doing" decisions.

**Action:**

1. Re-run `skills/strategy/product-strategy-session/SKILL.md` with constraints:
   ```
   Max 4 strategic bets.
   Each bet requires thesis, assumptions, success metric, and kill criteria.
   Include explicit "We will NOT" decisions with rationale.
   Include the required Decision Frame block.
   ```
2. Validate against `evals/strategy.md` and `evals/pass-fail.md`

**Expected correction:** Focused, falsifiable strategy with visible trade-offs.

---

## Playbook 4: Design review lacks rigor

**Trigger:** All-green verdicts, weak devil's advocate, no blockers/tensions.

**Action:**

1. Re-run `skills/technical/design-review/SKILL.md` with constraints:
   ```
   Keep all 7 perspectives.
   Devil's Advocate must challenge at least 2 assumptions.
   Synthesis must separate Blockers vs Recommendations.
   Include a tension table with owner and resolution date.
   Include the required Decision Frame block.
   ```
2. Validate against `evals/design-review.md` and `evals/pass-fail.md`

**Expected correction:** Credible multi-perspective review with actionable conflict resolution.

---

## Playbook 5: A/B analysis over-claims results

**Trigger:** "Ship" recommendation without statistical power, guardrail failure ignored.

**Action:**

1. Re-run `skills/measurement/ab-test-analysis/SKILL.md` with constraints:
   ```
   State power explicitly.
   If any guardrail degrades, default recommendation cannot be "Ship" without mitigation.
   Require segment analysis caveats for low-power segments.
   Include the required Decision Frame block.
   ```
2. Validate against `evals/pass-fail.md`

**Expected correction:** Statistically honest decision with explicit risk handling.

---

## Playbook 6: Output structure drifts from Shipwright signature

**Trigger:** Missing top-level sections or inconsistent decision formatting.

**Action:**

1. Reformat using `docs/output-standard.md` required section order
2. Add missing `Decision Frame` block
3. Add owner/date to every action item

**Expected correction:** Distinctive, recognizable Shipwright artifact.

---

## Escalation rule

If an artifact fails the same gate twice:

- Stop iterating on wording
- Request missing input data from the PM
- Re-run the skill from scratch with explicit constraints

Do not "polish" a structurally weak artifact. Rebuild it with better inputs.
