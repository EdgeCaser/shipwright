# Pass/Fail Quality Gates

This is the enforcement layer for Shipwright outputs.

Use this file **before** scoring with artifact rubrics. Rubrics optimize quality; gates block bad outputs from being treated as done.

## How to apply

1. Check applicable gates below at the selected skill depth. Gate analysis quality, not whether the business outcome is positive. A sound no-go analysis can PASS.
2. Mark pass/fail
3. If any required gate fails, artifact status is **FAIL**; repair defects or return a labeled partial artifact with missing evidence.
4. If all required gates pass, artifact status is **PASS (can score and polish)**

## Core required gates (all artifact types)

| Gate | Pass condition | Fail condition |
|---|---|---|
| **Structure** | Uses the selected skill's depth-appropriate body plus the four signature elements | Missing one or more required sections |
| **Decision Frame** | Includes complete Decision Frame block (recommendation, trade-off, confidence, owner, date, revisit trigger) | Any Decision Frame field missing |
| **Evidence Integrity** | Material claims are sourced or explicitly marked assumptions | Unsourced factual claims presented as truth |
| **Action Ownership** | Every action item has owner + due date | Actions with no owner and/or no date |
| **Scope Clarity** | Out-of-scope or non-goals are explicit (or equivalent boundary section) | No clear boundary; scope ambiguous |

## Artifact-specific required gates

### PRD

These are engineering-handoff requirements. A Light directional brief follows the PRD skill's lighter gate and must explicitly state its baseline, target and requirements gaps before further use.

- Success metrics include baseline + target + timeframe
- Guardrail metrics are present
- Open questions include owner + due date

### Strategy

- Max 4 major bets
- Every bet includes kill criteria
- Explicit "We will NOT" boundaries are present

### Design Review

- Standard/Deep: all 7 perspectives are present; Light: Engineering, Customer Voice and Devil's Advocate are present
- Synthesis separates blockers from recommendations
- Tensions have owner + resolution path

### A/B Analysis

- Power is explicitly stated
- Guardrail status is explicitly assessed
- Recommendation is consistent with significance + guardrails

## Verdict rubric

- **PASS**: All core gates pass and all artifact-specific gates pass
- **FAIL**: Any required gate fails

No partial pass. A partial artifact may be useful, but must retain FAIL and cannot be handed off as approved. A completed review can PASS while its reviewed artifact remains blocked.

## Repair workflow

If artifact status is FAIL:

1. Identify failed gates
2. Apply relevant playbook in `docs/recovery-playbooks.md`
3. Re-run gates
4. If the same gate fails again, stop rewriting; name the missing input and return the partial artifact. Otherwise, when scoring is needed, run the scoring rubric (`evals/prd.md`, `evals/strategy.md`, etc.)

## Prompt to run gates quickly

```
Apply evals/pass-fail.md to this artifact.
Return: PASS or FAIL, failed gates, and exact fixes required.
```

## Deterministic checks versus semantic review

The CLI checks a subset: envelope structure, evidence links, likely citation gaps, and selected cross-document conflicts. It does not verify source truth, all action ownership, guardrail adequacy, or prose/JSON agreement. Passing the CLI never substitutes for these gates. Scoring is useful for improvement or requested evaluation; it need not add a separate pass to every small task.
