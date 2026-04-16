# Critique: finding-1

- Target Side: side_b
- Target Claim IDs: side_b-claim-1
- Attack Type: evidence_gap
- Severity: medium

## Claim Under Attack
A launch PRD for SMB entry is not decision-ready because the current forecast uses unvalidated enterprise proxies and intuition rather than direct SMB evidence.

## Evidence Or Reason
Side B treats the proxy data as worthless rather than as a bounded prior. Three years of enterprise sales data is not zero evidence — it establishes a ceiling, not a fabrication. The artifact never attempts to quantify the uncertainty range on the 40% adjustment or identify which enterprise metrics are most likely to transfer (e.g., churn direction, not magnitude) versus least likely (e.g., contract value, acquisition motion). A rigorous PRD would distinguish between 'insufficient to launch' and 'insufficient to serve as any prior,' but Side B collapses both into a single rejection without doing the decomposition. This makes the artifact less decision-useful: it cannot tell the team which specific evidence gaps are launch-blocking versus nice-to-have, nor does it sequence the validation work by uncertainty reduction value.

