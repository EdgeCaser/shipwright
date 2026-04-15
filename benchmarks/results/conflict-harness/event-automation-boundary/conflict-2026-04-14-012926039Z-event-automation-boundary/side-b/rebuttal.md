# Critique: finding-2

- Target Side: side_a
- Target Claim IDs: side_a-claim-1
- Attack Type: evidence_gap
- Severity: medium

## Claim Under Attack
LLM outputs must pass through a deterministic validation pipeline (regex + classifier gates) before reaching clients, with commitment-language detection requiring ≥99% recall — this is the core safety mechanism that makes automation viable without unauthorized financial exposure.

## Evidence Or Reason
The claim overstates certainty on two visible fronts. First, no evidence is provided that a regex plus classifier gate can actually achieve the stated ≥99% recall on real event-management conversations, adversarial phrasing, or multilingual/code-switched WhatsApp messages. Second, the artifact labels the pipeline 'deterministic' while relying on a 'classifier' and 'low-confidence retrieval' checks, which are themselves thresholded statistical components unless further specified; that leaves the core safety boundary underdefined. Without a demonstrated test corpus, threshold policy, and proof that all commitment variants are caught, this cannot yet support the conclusion that the mechanism makes automation safely viable.

