# Codex Proposal: Judge Uncertainty Schema and Orchestrator Escalation Policy

Status: Proposed
Date: 2026-04-14
Author: Codex

## Why this proposal exists

Recent judge-analysis work suggests three practical conclusions for Shipwright:

1. A single judge is often useful, but not reliably authoritative.
2. Triple-panel judging is valuable when disagreement itself is signal, but too expensive and noisy to run by default.
3. A `tie` or `low`-confidence verdict is only partially useful unless the judge also says what evidence or questions would help break the deadlock.

This proposal turns those conclusions into:

- a verdict-schema extension for uncertainty handling
- an orchestrator routing policy for when to escalate from single judge to triple panel

## Product-level position

Shipwright should not present judge verdicts as a universal oracle.

It should present them as:

- structured evaluation signals
- uncertainty-aware comparisons
- escalation inputs for the orchestrator

In practice:

- default to the lightest judge path that still protects decision quality
- escalate only when the verdict itself indicates ambiguity, fragility, or family disagreement risk

## Proposed verdict schema additions

These fields should be optional at first, but required whenever:

- `winner = tie`, or
- `judge_confidence = low`, or
- `needs_human_review = true`

### New fields

```json
{
  "uncertainty_drivers": [
    "Both artifacts make plausible claims, but neither substantiates the causal link."
  ],
  "disambiguation_questions": [
    "What evidence supports the claimed contradiction between strategy and implementation?"
  ],
  "needed_evidence": [
    "Source document showing the actual platform strategy constraints.",
    "Examples of real operator demand for the proposed workflow."
  ],
  "recommended_next_artifact": "discovery_brief",
  "recommended_next_action": "gather_missing_evidence",
  "can_resolve_with_more_evidence": true,
  "escalation_recommendation": "triple_panel"
}
```

### Field semantics

- `uncertainty_drivers`
  - Why the judge could not confidently separate the artifacts.
  - These should describe the uncertainty, not restate the winner.

- `disambiguation_questions`
  - The 1-3 highest-value questions whose answers would most reduce uncertainty.

- `needed_evidence`
  - Specific missing evidence, documents, or measurements that would help the judge decide.

- `recommended_next_artifact`
  - The most useful next Shipwright artifact to request.
  - Suggested enum:
    - `discovery_brief`
    - `technical_spec`
    - `research_pack`
    - `decision_memo`
    - `customer_evidence_summary`
    - `none`

- `recommended_next_action`
  - A concise routing hint for the orchestrator.
  - Suggested enum:
    - `gather_missing_evidence`
    - `run_triple_panel`
    - `request_human_review`
    - `revise_artifact`
    - `accept_tie`

- `can_resolve_with_more_evidence`
  - `true` if the judge believes more evidence would likely change or clarify the verdict.
  - `false` if the tie is principled and further evidence is unlikely to help much.

- `escalation_recommendation`
  - Suggested enum:
    - `none`
    - `second_judge`
    - `triple_panel`
    - `human_review`

## Why this helps

Today, a `tie` or low-confidence result mostly says:

- "do not fully trust this"

With the proposed extension, it would also say:

- "here is how to make progress"

That makes the judge useful not only as a scorer, but as a router.

## Proposed orchestrator policy

### Default policy

Use a single judge by default.

Do not run triple-panel evaluation on every artifact. Reserve it for cases where the additional disagreement signal is likely to change what the PM should do next.

### Agents-first resolution policy

When a judge returns a tie, low confidence, or explicit uncertainty fields, the orchestrator should try to resolve that uncertainty with agents before escalating to a human.

Default order:

1. judge identifies uncertainty
2. orchestrator routes the highest-value follow-up question to the appropriate agent or workflow
3. agents attempt to gather evidence or produce the next artifact
4. orchestrator re-runs evaluation if the uncertainty looks resolvable
5. escalate to human review only if the uncertainty is not agent-recoverable or remains unresolved after follow-up

Human review should be the fallback, not the default.

### Escalate to a second judge when

- `judge_confidence = low`
- `needs_human_review = true`
- `winner = tie`
- the scenario type is `contradiction_or_boundary_prd`
- the artifact is heading into engineering handoff or leadership review

### Escalate to triple panel when

- the first two judges disagree on the winner
- a contradiction-heavy or boundary-heavy case remains unresolved after the second judge
- the verdict includes `escalation_recommendation = triple_panel`
- the artifact informs a benchmark claim, prompt/schema change, or publishable evaluation result
- the cost of a wrong judgment is materially higher than the cost of the extra panel

### Do not escalate to triple panel when

- the first judge has `high` confidence, no review flag, and the artifact is low stakes
- the case is an obvious one-sided quality screen
- the PM is doing fast exploratory iteration and does not need adjudication-grade confidence

## Proposed orchestrator decision table

| Judge outcome | Orchestrator action |
|---|---|
| `high` confidence, no review flag, clear winner | accept result or continue workflow |
| `medium` confidence, clear winner, low-stakes task | accept with caveat |
| `low` confidence or `tie` | inspect uncertainty fields |
| `low` confidence + `can_resolve_with_more_evidence = true` | gather evidence or request next artifact |
| `tie` + `escalation_recommendation = triple_panel` | run triple panel |
| repeated disagreement after triple panel | route to human review |

## Recommended orchestrator behavior on ties

When the judge returns a tie, the orchestrator should not treat that as a dead end.

Instead:

1. Read:
   - `uncertainty_drivers`
   - `disambiguation_questions`
   - `needed_evidence`
   - `recommended_next_artifact`
2. Decide whether the tie is:
   - evidence-resolvable
   - a principled ambiguity
   - a sign the workflow asked for the wrong artifact too early
3. Route accordingly.

Examples:

- If the judge says missing customer evidence is the blocker:
  - route to discovery / customer-intelligence work

- If the judge says the artifact should really be a discovery brief, not a PRD:
  - route to the lighter artifact instead of forcing a winner

- If the judge says the current artifact lacks technical grounding:
  - route to execution-driver or technical-spec work before re-judging

- If two judges disagree and the third returns a tie:
  - escalate to human review rather than fabricating certainty

### When to escalate to a human immediately

Escalate without agent follow-up only when:

- the missing information is a true business judgment, political decision, or stakeholder preference
- the needed evidence does not exist in accessible artifacts or systems
- the PM must choose among tradeoffs that cannot be resolved analytically
- repeated agent follow-up still leaves the case unresolved

## Suggested prompt-contract addition

Judge prompts should add an instruction like:

```text
If the correct verdict is tie, low-confidence, or human-review-needed, do not stop at uncertainty.
State the top uncertainty drivers, the most helpful questions to answer next, and what evidence or next artifact would most help resolve the decision.
```

## Recommended implementation order

1. Add the new uncertainty fields to the verdict schema as optional.
2. Update judge prompts to populate them when:
   - tie
   - low confidence
   - human review
3. Update orchestrator guidance to use the escalation table above.
4. Only after that, decide whether to make those fields conditionally required in schema validation.

## Recommendation

The orchestrator should be explicitly aware that:

- triple panel is an escalation tool, not a default path
- ties and low-confidence verdicts are routing events, not just scoring outputs
- the best judge output is not always "which side won," but often "what evidence would let us decide responsibly"
