# AI-Assisted Content Moderation PRD

## Product Decision
Build the system around AI-assisted triage and recommendation, but do not promise a universal removal-within-60-seconds outcome while every removal requires human approval. The current requirements are internally incompatible because the removal SLA is measured in seconds while the approval queue operates on an average measured in hours.

## Problem
The system is expected to:
- flag content automatically
- require human approval for every removal
- complete removals within 60 seconds

Those three requirements cannot all be true at the same time under the stated operating conditions.

## Goals
- Preserve AI-assisted detection and prioritization.
- Preserve mandatory human approval for removal decisions unless policy changes.
- Produce an implementable operating model instead of an unfulfillable promise.

## Non-Goals
- Fully autonomous removals.
- Pretending the current SLA is achievable without changing workflow or policy.

## Proposed Product Behavior
### 1. Automated Flagging
The system automatically scores and flags content for review.

### 2. Queueing and Prioritization
Flagged items enter a human review queue with urgency metadata so the most critical items are surfaced first.

### 3. Human-Gated Removal
No content is removed until a reviewer approves the removal decision.

### 4. User-Visible State Handling
Until review completes, content remains in a pending state defined by policy and operations. The PRD should explicitly distinguish detection time from removal completion time.

## Requirements
### Functional Requirements
- The system must automatically flag content for review.
- The system must record a recommended action for the reviewer.
- The system must route all proposed removals to human review.
- The system must log the timestamps for flagging, queue entry, reviewer action, and final enforcement outcome.
- The system must expose queue status and aging so operations can manage backlog.

### Operational Requirements
- The PRD must separate AI detection SLA from human enforcement SLA.
- The PRD must not claim a 60-second removal SLA for all removals while universal human approval remains mandatory.
- The PRD must identify the requirement conflict as a blocking dependency for launch.

## Risks
- Shipping against the current combined requirement creates guaranteed SLA breach.
- Teams may conflate fast flagging with fast removal and misstate system capability.
- Without an explicit exception policy, urgent cases still depend on a slow queue.

## Decision Frame
The decision is whether to write the PRD as if the current requirements are jointly achievable. Recommendation: do not. The PRD should explicitly reject the combined promise and require one of these changes before commitment: revise the SLA, change the approval requirement, or introduce a separate policy path for exceptional cases.

## Unknowns & Evidence Gaps
- No evidence is provided about whether any subset of cases may bypass standard review.
- No evidence is provided about whether the 60-second SLA applies to detection, hiding, removal, or final enforcement.
- No evidence is provided about whether queue performance can be materially changed.
- No evidence is provided about policy tolerance for temporary states before final removal.

## Pass/Fail Readiness
Fail.
The PRD is not ready for approval if it keeps all three conditions unchanged: automatic flagging, universal human approval for removals, and removals within 60 seconds. It becomes passable only once the conflict is resolved in policy or scope.

## Recommended Next Artifact
A decision memo resolving the policy and SLA conflict. It should choose the governing rule for enforcement timing, define whether any exception path exists, and restate the launch SLA in terms that match the required human-review model.
