# Critique: finding-1

- Target Side: side_b
- Target Claim IDs: side_b-claim-1
- Attack Type: evidence_gap
- Severity: medium

## Claim Under Attack
Zillow's 6.9% Zestimate error rate is structurally incompatible with the sub-2% accuracy required for profitable home flipping, and two algorithm pivots in 2021 failed to close the gap — this is an architectural limitation, not a tuning problem.

## Evidence Or Reason
The visible evidence does not establish an architectural limit. It leaps from a national Zestimate median error rate to the economics of Zillow Offers without showing that the same metric governed the actual acquisition model, target geographies, or the subset of homes Zillow was buying. A national median also does not prove local market performance at the purchase cohort level, and two 2021 pivots are insufficient by themselves to show the system could not be improved through narrower geography, lower volume, or human overrides. The claim overstates what the cited facts support: they show a serious execution failure, not conclusively that reform is impossible.

