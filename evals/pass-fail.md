# Pass/Fail Quality Gates

This is the enforcement layer for Shipwright outputs.

Use this file **before** scoring with artifact rubrics. Rubrics optimize quality; gates block bad outputs from being treated as done.

## How to apply

1. Check each gate below
2. Mark pass/fail
3. If any required gate fails, artifact status is **FAIL (rewrite required)**
4. If all required gates pass, artifact status is **PASS (can score and polish)**

## Core required gates (all artifact types)

| Gate | Pass condition | Fail condition |
|---|---|---|
| **Structure** | Uses required top-level sections from `docs/output-standard.md` | Missing one or more required sections |
| **Decision Frame** | Includes complete Decision Frame block (recommendation, trade-off, confidence, owner, date, revisit trigger) | Any Decision Frame field missing |
| **Evidence Integrity** | Material claims are sourced or explicitly marked assumptions | Unsourced factual claims presented as truth |
| **Action Ownership** | Every action item has owner + due date | Actions with no owner and/or no date |
| **Scope Clarity** | Out-of-scope or non-goals are explicit (or equivalent boundary section) | No clear boundary; scope ambiguous |

## Artifact-specific required gates

### PRD

- Success metrics include baseline + target + timeframe
- Guardrail metrics are present
- Open questions include owner + due date

### Strategy

- Max 4 major bets
- Every bet includes kill criteria
- Explicit "We will NOT" boundaries are present

### Design Review

- All 7 perspectives are present
- Synthesis separates blockers from recommendations
- Tensions have owner + resolution path

### A/B Analysis

- Power is explicitly stated
- Guardrail status is explicitly assessed
- Recommendation is consistent with significance + guardrails

## Verdict rubric

- **PASS**: All core gates pass and all artifact-specific gates pass
- **FAIL**: Any required gate fails

No partial pass. No "good enough" override.

## Repair workflow

If artifact status is FAIL:

1. Identify failed gates
2. Apply relevant playbook in `docs/recovery-playbooks.md`
3. Re-run gates
4. Only then run scoring rubric (`evals/prd.md`, `evals/strategy.md`, etc.)

## Prompt to run gates quickly

```
Apply evals/pass-fail.md to this artifact.
Return: PASS or FAIL, failed gates, and exact fixes required.
```
