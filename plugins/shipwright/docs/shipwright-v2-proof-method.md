# Benchmark proof method

Fixture replay is a regression check, not product performance evidence. Synthetic artifacts, injected runner tests and self-review must be labeled as such.

A publishable comparison needs independently generated baseline and Shipwright artifacts from the same fixed scenario inputs, actual model/version and environment records, equal evidence/tool budgets, preserved raw outputs and at least three independent reviewers blinded to condition. Keep failed and incomplete runs in the denominator. Record interventions and revisions; do not cherry-pick the best generation.

The harness checks metadata structure and declared provenance. `publishable_proof_ready` checks nonempty matching scenario sets, recorded independent generation/review and complete ratings. Those flags are producer assertions: software cannot certify reviewer independence, real blinding or honest sampling. A release owner must verify the underlying records. A provisional threshold policy remains provisional even if provenance fields are complete.

Archive the prompts, exact inputs, hashes, model versions, settings, run timestamps, raw outputs, scoring sheets, assignment/randomization key and exclusions with reasons. Reviewers must score before conditions are unblinded. A structured envelope may be requested for both conditions; it must not expose the condition to reviewers. Keep claim-level source verification separate from style preference.

Report findings with uncertainty and scope. Seven hand-authored fixtures do not justify claims such as 'always better,' 'airtight,' or 'validated across models.'
