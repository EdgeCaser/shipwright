# Critique: finding-2

- Target Side: side_a
- Target Claim IDs: side_a-claim-1
- Attack Type: evidence_gap
- Severity: medium

## Claim Under Attack
Zillow should exit iBuying entirely because the Zestimate's 6.9% median error rate is structurally incompatible with the sub-2% accuracy required for positive margins in home flipping, and two algorithm pivots in 2021 failed to close this gap.

## Evidence Or Reason
This claim overreaches from mismatched evidence. The visible record gives a national Zestimate median error rate, but iBuying decisions are made in a narrower set of markets, home types, and with additional inspection/offer adjustments; the artifact does not show that the actual Zillow Offers purchase-pricing model in its active markets also operated at ~6.9% error. It also asserts that two 2021 algorithm pivots showed the gap was not closable, but provides no before/after accuracy data or unit-economics evidence from those pivots. The artifact's own stated critical gap on per-market pricing accuracy directly weakens the conclusion that the mismatch is definitively structural rather than a scaling/market-selection failure.

