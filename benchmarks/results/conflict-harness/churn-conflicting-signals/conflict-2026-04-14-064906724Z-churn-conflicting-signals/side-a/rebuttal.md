# Critique: finding-1

- Target Side: side_b
- Target Claim IDs: side_b-claim-1
- Attack Type: evidence_gap
- Severity: medium

## Claim Under Attack
A constrained pilot is the correct first move when churn signals conflict with strategy targets and underlying evidence is absent.

## Evidence Or Reason
The artifact asserts a constrained pilot is 'correct' but provides no decision criteria for when a pilot would be the wrong move. If churn is acute and accelerating, a slow pilot could lose the very customers it aims to study. The claim references ctx-1 and ctx-2 but the case packet contains no actual evidence entries — these citations point to nothing. Without defining a churn severity threshold that would trigger faster action, the 'constrained pilot' recommendation is unfalsifiable: it sounds prudent but cannot be evaluated against any baseline urgency. A decision-useful PRD must specify the conditions under which its own recommended approach would be inadequate.

