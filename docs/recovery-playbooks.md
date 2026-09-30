# Recovery playbooks

Use the shared execution and handoff rules in `docs/workflow-contract.md`. Repair the affected section once, then recheck the failed gate. Preserve sound work. If the gate still fails, return the useful partial artifact with FAIL, missing evidence and one next action. Resume when new evidence or a user decision arrives.

| Failure | Repair | Recheck |
|---|---|---|
| Unsupported research | Trace each material claim to supplied/retrieved evidence; remove unsupported claims or label assumptions. Do not start a new research workflow if a citation repair suffices. | Sources actually support the claims; qualifiers survive synthesis. |
| Vague PRD | Resolve scope, metric definitions and material requirements. Keep unknown baselines, owners and dates explicit. | The selected depth's PRD gates; engineering readiness requires the full handoff checks. |
| Unfalsifiable strategy | Clarify the bet, supporting assumptions, boundary and kill criteria. | At most four supported bets; no manufactured alternatives. |
| Weak design review | Re-examine omitted checks at the selected depth (three core perspectives for Light, seven for Standard/Deep). | Every verdict cites what was checked. An evidenced all-clear is valid. |
| Overstated experiment | Recheck validity, uncertainty, guardrails and the precommitted analysis plan. | The recommendation follows the data; do not extend repeatedly until significance appears. |
| Missing structure | Add missing required content and signature elements without replacing the skill's native body. | One Decision Frame and one set of closing elements; no invented commitments. |
| Prose/JSON mismatch | Correct the representation that contradicts the evidence; preserve IDs and explain changes. | Compare both representations, then run the deterministic validator. |

## Challenge findings

A review report's PASS evaluates the review's quality. Its verdict evaluates the reviewed artifact:

- CLEAR: no material unresolved findings; document residual limits.
- DEFEND: author/PM must disposition the material findings before treating the artifact as settled.
- ESCALATE: a Critical finding needs PM attention before relying on the recommendation.
- INSUFFICIENT_EVIDENCE: return the incomplete review with FAIL and the missing inputs.

When revision is requested, pass the original artifact and all findings with IDs, severity, evidence and resolution conditions. Reuse the known producer, or select the role matching the artifact. Do not add a second permission step for an already-authorized revision. A review-only request does not by itself authorize contacting others or editing the source document.

Record each finding as resolved, waived by an explicitly authorized human, or deferred. A Critical finding remains a readiness blocker until resolved or explicitly waived with an owner and rationale. Do not suppress it in a downstream summary. Re-review only changed claims and unresolved findings; an unchanged artifact needs no duplicate full review.
