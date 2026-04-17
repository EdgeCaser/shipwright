# Critique: finding-1

- Target Side: side_b
- Target Claim IDs: side_b-claim-1
- Attack Type: evidence_gap
- Severity: medium

## Claim Under Attack
The current pilot does not justify expanding the onboarding flow to all users because the pilot cohort was opt-in and self-selected, which prevents a reliable broad-launch decision.

## Evidence Or Reason
Side B asserts that opt-in design 'prevents' a reliable expansion decision but does not quantify the magnitude of selection effect required to fully explain the observed 34% lift. If typical motivated opt-in users retain only 5–10% better than the general population baseline, the residual lift remains large enough to support a staged rollout decision with monitoring guardrails. The PRD treats the evidence as binary (usable vs. unusable) without engaging with the more practical question: could a risk-bounded phased expansion—with defined rollback triggers and retention monitoring—be decision-useful given the observed signal size? Blocking all expansion paths until a perfect non-self-selected RCT completes is itself a decision with costs (delayed improvement for users who would benefit), yet Side B never surfaces or weighs those costs. The claim overstates the evidentiary threshold required to act responsibly.

