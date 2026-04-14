# Critique: finding-2

- Target Side: side_a
- Target Claim IDs: side_a-claim-2
- Attack Type: evidence_gap
- Severity: medium

## Claim Under Attack
A useful PRD for this request needs concrete workflow, requirements, non-goals, and success metrics so the team can implement handoff improvement without drifting into adjacent systems.

## Evidence Or Reason
The PRD lists success metrics (reduction in redundant touches, time to next action, reopened pings, first-response continuation rate) but provides zero baseline data, no targets, and no measurement methodology. These metrics are aspirational labels, not concrete instrumentation a team can implement against. Without current-state numbers or even a stated plan to collect them before build, the team cannot distinguish success from failure post-launch. The claim that these metrics prevent drift is undermined by the fact that unmeasurable metrics provide no actual guardrail — a team could ship anything and declare the metrics unmeasured rather than unmet. The Unknowns section even acknowledges 'current baseline frequency and failure modes of handoffs are not provided,' which directly contradicts the claim that the PRD is concrete enough to prevent scope drift, since without baselines the team has no empirical anchor to reject adjacent feature requests.

