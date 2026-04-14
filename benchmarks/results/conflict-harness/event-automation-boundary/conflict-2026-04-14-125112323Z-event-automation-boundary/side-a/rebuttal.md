# Critique: finding-1

- Target Side: side_b
- Target Claim IDs: side_b-claim-2
- Attack Type: evidence_gap
- Severity: high

## Claim Under Attack
LLM usage should be restricted to bounded assistive tasks such as extraction, summarization, and draft wording, with deterministic validation and human fallback.

## Evidence Or Reason
The artifact asserts 'deterministic validation of any LLM-produced structured output before persistence or downstream use' but provides no mechanism or criteria for what deterministic validation of inherently non-deterministic outputs (summarization, draft wording) actually looks like. Extraction can be schema-validated, but summarization and response drafting produce free text—there is no deterministic validator that can confirm a summary is accurate or a draft is safe without human review. The PRD conflates two very different LLM use cases (structured extraction vs. free-text generation) under one validation policy, creating a false sense of boundedness. Without specifying which LLM outputs require human review vs. automated validation, and what automated validation concretely checks, the 'bounded LLM layer' is an aspirational label rather than an enforceable boundary. The claim's evidence is limited to restating the scenario prompt requirements (ctx-1) rather than demonstrating how these boundaries would be operationalized.

