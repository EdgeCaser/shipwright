# Revised artifact

## PRD: Evidence-Limited Feature Validation

## Overview
This document does not authorize a feature build yet. The case packet provides no supporting evidence beyond the existence of a feature idea, so the immediate product decision is whether to fund a short discovery phase and only then decide whether an MVP is justified.

## Current Evidence Base
- No user research is provided.
- No usage data is provided.
- No market or competitive evidence is provided.
- No triggering signal is specified beyond a proposed feature concept.

Because the evidence base is effectively empty, the default recommendation is not full launch and not immediate MVP build. The correct near-term action is to establish whether any build is warranted.

## Problem
A feature concept exists without enough evidence to show that the problem is real, frequent, painful, and poorly served by current workflows. Building now would create a high risk of producing motion without decision value.

## Goal
Reduce uncertainty to the point where the team can make a defensible go/hold/stop decision on whether to build a validation MVP.

## Non-Goals
- Full feature launch
- Broad rollout
- Treating feature conception itself as proof of user demand
- Using low-signal prototype usage as a substitute for problem validation

## Proposed Approach
Use a two-step gate:
1. Run a short discovery phase to confirm the problem, target segment, and baseline workaround.
2. Approve a narrowly scoped MVP only if discovery produces enough evidence that testing the solution in-product is the next best step.

## Discovery Exit Criteria
An MVP becomes warranted only if discovery establishes all of the following:
- A specific target segment with a repeated problem
- Evidence that the problem is important enough to change behavior
- A clear current workaround or baseline for comparison
- A concrete hypothesis for how the feature improves the workflow
- Success thresholds that would justify further investment

## Conditional MVP Scope
If the discovery gate passes, the MVP should include only:
- Core workflow only
- Limited cohort exposure
- Event instrumentation for discovery, activation, repeat usage, and abandonment
- In-product feedback capture
- Pre-committed review date and go/hold/stop criteria

## Success Metrics
Discovery-phase metrics:
- Number of validated problem instances in the target segment
- Strength and consistency of reported pain
- Evidence of inadequate current workaround
- Clarity on segment-level demand and urgency

Conditional MVP metrics:
- Adoption within target cohort
- Activation through core workflow completion
- Repeat usage in the evaluation window
- Qualitative confirmation that the feature solved the intended problem
- Negative signals such as confusion, abandonment, or support load

## Risks
- Building before confirming a real problem
- Confusing interest in a concept with demand for a solution
- Running an MVP without a credible comparison baseline
- Escalating from experiment to roadmap commitment before evidence improves

## Decision Frame
The immediate decision is whether to authorize discovery, not whether to launch the feature and not yet whether to build even a small MVP. Recommendation: do not approve implementation until the team produces minimum discovery evidence. If discovery confirms a repeated, important problem and a plausible solution hypothesis, then approve a tightly scoped validation MVP.

## Unknowns & Evidence Gaps
- What concrete signal originated the feature idea
- Which user segment experiences the problem most often
- How users solve the problem today
- Whether the problem is painful enough to justify behavior change
- What evidence threshold should trigger MVP approval versus further discovery or stop

## Pass/Fail Readiness
Pass if:
- A named target segment is identified
- The team can cite concrete discovery evidence for the problem
- Baseline behavior or workaround is documented
- MVP approval criteria are defined before build work starts
- The team commits to a stop decision if discovery does not validate the need

Fail if:
- The only input is a feature idea
- No user or market signal is documented
- The team cannot specify what would justify building
- Scope pressure turns discovery into implementation by default
- There is no explicit hold/stop path

## Recommended Next Artifact
A feature evidence memo containing: origin signal, target segment, interview findings, current workaround analysis, problem frequency and severity assessment, and explicit criteria for whether an MVP should be built at all.
