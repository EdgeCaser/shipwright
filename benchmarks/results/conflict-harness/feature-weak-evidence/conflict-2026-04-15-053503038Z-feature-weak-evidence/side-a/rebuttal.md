# Critique: finding-1

- Target Side: side_b
- Target Claim IDs: side_b-claim-3
- Attack Type: evidence_gap
- Severity: medium

## Claim Under Attack
Predefined success thresholds, instrumentation, and stop/go criteria are required for this feature to be actionable under weak-evidence conditions.

## Evidence Or Reason
The PRD asserts that numeric thresholds 'should be set before build approval' but then explicitly admits 'none are provided in the packet' and defers their definition to a future validation plan. This is self-undermining: the PRD claims pass/fail readiness requires predefined thresholds as a condition of pilot approval, yet approves the pilot artifact without supplying any thresholds, even illustrative ones. A decision-useful PRD under weak-evidence conditions should at minimum provide example threshold ranges, a method for deriving them (e.g., baseline lift required to beat opportunity cost), or a bounded discovery sprint to produce them before build begins. Leaving all numeric criteria undefined while simultaneously declaring them a pass condition makes the stop/go criteria unenforceable at the moment they are most needed. The claim is structurally correct in principle but operationally hollow as written — the PRD does not fulfill the requirement it defines.

