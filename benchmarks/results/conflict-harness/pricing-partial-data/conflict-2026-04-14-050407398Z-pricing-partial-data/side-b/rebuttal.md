# Critique: finding-2

- Target Side: side_a
- Target Claim IDs: side_a-claim-1, side_a-claim-2
- Attack Type: evidence_gap
- Severity: high

## Claim Under Attack
The highest-confidence recommendation under partial market data is a staged, reversible pricing test on new customers only, with existing customers protected from repricing.

## Evidence Or Reason
The artifact asserts that a new-customer-only staged test is the 'highest-confidence move' but provides no evidence or framework for why this particular test design dominates alternatives. Several weaknesses: (1) Testing on new customers only introduces severe selection bias — new customer price sensitivity may differ fundamentally from the installed base, making results non-transferable to the very population being 'protected.' The artifact acknowledges segment heterogeneity as an unknown yet designs a test that structurally cannot measure the segment it excludes. (2) The claim that protecting existing customers 'avoids avoidable churn without evidence' is circular — the same partial-data condition that motivates caution about repricing existing customers also means there is no evidence that existing customers would churn. The artifact treats one direction of uncertainty (price increase causes churn) as more credible than the other (existing customers are underpriced and would accept increases) without justification. (3) No consideration is given to the opportunity cost of delayed action — if the business is currently underpriced, every month of 'learning' on new customers only represents foregone revenue from the existing base. The artifact frames reversibility as pure upside but never quantifies the cost of the status quo, which is itself a pricing decision made with the same partial data. (4) The recommended four metrics (conversion, ARPU, win rate, retention) are standard but the artifact provides no power analysis, minimum detectable effect, or sample size guidance, meaning the test could run indefinitely without producing the 'decision-grade evidence' it promises.

