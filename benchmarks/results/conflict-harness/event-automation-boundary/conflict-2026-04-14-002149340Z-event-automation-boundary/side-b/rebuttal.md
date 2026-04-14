# Critique: finding-2

- Target Side: side_a
- Target Claim IDs: side_a-claim-2
- Attack Type: evidence_gap
- Severity: medium

## Claim Under Attack
Output filter must hard-block commitment vocabulary and currency patterns with 100% coverage on adversarial test corpus before launch.

## Evidence Or Reason
The claim overstates what a deterministic output filter can prove. A finite adversarial corpus with 100% pass rate does not establish 100% coverage in live WhatsApp conversations, and the proposed blocked patterns are incomplete: pricing and commitment can be expressed without currency symbols, percentage discounts, or the listed words, such as written-out prices or softer reservation language. The artifact does not specify the exact prohibited pattern set, semantic test strategy, or architectural control that prevents approved templates from becoming a bypass.

