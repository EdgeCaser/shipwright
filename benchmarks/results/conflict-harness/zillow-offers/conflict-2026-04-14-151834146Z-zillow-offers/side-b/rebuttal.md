# Critique: finding-2

- Target Side: side_a
- Target Claim IDs: side_a-claim-3
- Attack Type: evidence_gap
- Severity: high

## Claim Under Attack
A reform strategy is less attractive because Zillow already tried multiple pricing pivots and now faces a less forgiving housing market while carrying mispriced inventory.

## Evidence Or Reason
Side A treats two algorithm pivots in 2021 as proof that the pricing problem is unsolvable, but the case packet provides no information about what those pivots changed, how much they reduced error rates, or whether the second pivot had sufficient time to be evaluated. Two iterations is an extraordinarily thin basis for declaring a technical capability structurally unfixable — most machine-learning pricing systems require many more cycles of retraining on outcome data before convergence. Side A also conflates the 6.9% national median Zestimate error with the Zillow Offers acquisition model error, but these are different systems: the consumer-facing Zestimate is a broad estimator while the Offers pricing model can layer in inspection data, local comps, and seller-disclosed condition. The case packet does not provide the actual Offers acquisition pricing error rate, which means Side A's core quantitative anchor for 'structurally broken' unit economics rests on the wrong metric. Furthermore, claiming the macro environment is 'less forgiving' is speculative — the packet says prices are up 19.5% YoY with 'signs of cooling,' not an actual downturn. A reform model with tighter buy-boxes in strong-performing metros could exploit exactly the inventory Zillow already holds if those markets remain appreciating. Side A acknowledges in its own Unknowns section that market-by-market data might show viable cohorts, yet treats the national aggregate as dispositive for the recommendation — an internal tension that weakens the claim's decisiveness.

