# Critique: finding-1

- Target Side: side_b
- Target Claim IDs: side_b-claim-1
- Attack Type: evidence_gap
- Severity: high

## Claim Under Attack
Zillow should exit Zillow Offers rather than reform it because the business is structurally incompatible with Zillow's current pricing accuracy and thin iBuying margins.

## Evidence Or Reason
The artifact treats the 6.9% national median Zestimate error as proof of structural pricing incapability, but this conflates a consumer-facing estimate with the internal purchase algorithm. Zillow Offers does not use the public Zestimate as its buy-price model — it uses a separate, proprietary offer model with local comps, inspection data, and manual overrides. The case packet provides the Zestimate error rate but no data on the actual Offers purchase-model error rate by metro. Side B's own Unknowns section concedes that 'market-by-market contribution margins are not provided; some metros may be materially better than the national picture' and that 'the exact break-even accuracy threshold after financing, repairs, and holding costs is not quantified for Zillow specifically.' This means the central pillar — that a 6.9% error makes iBuying structurally impossible — rests on an unverified proxy metric rather than actual purchase-model performance data. A reform path that narrows to metros where the purchase model demonstrably outperforms the national Zestimate error could close the precision gap, but Side B dismisses this without evidence that metro-level accuracy is equally poor.

