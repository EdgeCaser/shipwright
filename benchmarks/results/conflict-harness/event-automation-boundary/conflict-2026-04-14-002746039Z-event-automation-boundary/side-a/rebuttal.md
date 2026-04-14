# Critique: finding-1

- Target Side: side_b
- Target Claim IDs: side_b-claim-1
- Attack Type: evidence_gap
- Severity: high

## Claim Under Attack
Phase 1 should use the LLM for language tasks while deterministic application logic owns workflow state, pricing calculations, approval gates, and side-effect execution.

## Evidence Or Reason
The artifact repeatedly asserts that deterministic logic 'owns' workflow state and pricing, but never specifies the enforcement architecture that makes this boundary real rather than aspirational. The functional requirements say 'workflow state must be owned by application code, not by the LLM' and 'any action with external side effects must be represented as a typed command produced by application logic,' yet the PRD provides no mechanism design: no capability-based access control preventing the LLM from reaching APIs directly, no sandboxing model, no schema for the typed commands, no description of how the orchestration layer intercepts and validates LLM outputs before they can affect state. The pass/fail section even identifies the exact failure mode ('exceptions rely on prompt instructions alone rather than application-level controls') but the PRD's own requirements are stated at precisely that prompt-instruction level of abstraction. Without specifying how the boundary is enforced — whether via API gateway restrictions, a tool-use allow-list, output parsing with rejection, or an explicit capability model — the claim that deterministic logic 'owns' these concerns is a design intention, not a requirement that engineering can implement or QA can verify.

