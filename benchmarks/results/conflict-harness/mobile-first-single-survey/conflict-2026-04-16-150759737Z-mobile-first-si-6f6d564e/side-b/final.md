# Revised artifact

## PRD: Mobile Evidence Program and Quantified Redesign Gate

## Summary
A full mobile-first redesign is not approved on current evidence. The current signal is strong enough to justify immediate investigation and targeted remediation, but not a 6-month rebuild. This PRD defines a time-bounded validation program with quantified redesign gates so the team can reach a clear go/no-go decision rather than delay indefinitely.

## Problem Statement
A last-quarter NPS survey of 50 power users found that 72% named mobile experience as their top pain point. That is a meaningful warning signal, but it is not sufficient by itself to justify a full mobile-first redesign because it does not show prevalence across the broader user base, identify the failing workflows, or quantify the business impact relative to a 6-month engineering investment.

## Goal
1. Reduce the highest mobile friction quickly.
2. Produce enough behavioral and user evidence within 8-10 weeks to decide whether a full redesign is warranted.

## Non-Goals
- Approving a full mobile-first rebuild immediately
- Rewriting desktop-first flows with no demonstrated mobile impact
- Extending discovery beyond the defined decision window without an explicit exec decision

## Users
- Active users who attempt core workflows on mobile
- Power users represented in the survey
- Broader non-power-user segments who may experience different mobile constraints

## Hypotheses
1. Mobile pain is concentrated in a limited number of high-value workflows.
2. Targeted fixes may recover most of the lost user experience without a full redesign.
3. A full redesign is justified only if mobile friction is broad, severe, persistent after targeted fixes, and material to business outcomes.

## Requirements
### R1. Instrumentation
Instrument the top 3-5 core mobile workflows with funnel entry, completion, drop-off, error, retry, and time-to-complete events.

### R2. Evidence Collection
Within 2 weeks of instrumentation launch, collect:
- Mobile usage share for each core workflow
- Completion and drop-off rates by device class and user segment
- At least 12 session observations or recordings across power and non-power users
- At least 15 follow-up user interviews or structured surveys, with at least 50% from non-power users

### R3. Rapid Improvements
By week 6, ship targeted fixes for the top 2-3 highest-friction mobile workflows identified in Phase 1.

### R4. Quantified Redesign Gate
Approve a full mobile-first redesign only if all four conditions are met during the 8-10 week program:
- Reach: at least 25% of active users, or at least 40% of users in a strategically important segment, attempt at least one core workflow on mobile each month.
- Severity: mobile completion rate on at least 2 core workflows is at least 15 percentage points worse than desktop, or mobile error/drop-off rate is at least 1.5x desktop.
- Persistence: targeted fixes improve the affected workflow completion gap by less than 30% relative to baseline, or leave the mobile completion gap above 10 percentage points.
- Business case: the projected benefit of redesign is tied to a material outcome such as retention, conversion, expansion, or support-cost reduction, with a documented impact estimate large enough to justify 6 months of engineering time versus the next-best roadmap use.

## Success Metrics
- Mobile share of core-workflow usage
- Mobile completion rate by workflow
- Mobile drop-off and error rate by workflow
- Time-to-complete for core mobile tasks
- Change in mobile-related support complaints
- Post-fix user satisfaction for affected mobile workflows

## Delivery Plan
### Phase 1: Weeks 1-2
- Add instrumentation
- Collect baseline behavioral data
- Run user interviews and session reviews
- Identify top 3-5 mobile friction points

### Phase 2: Weeks 3-6
- Ship targeted fixes for top issues
- Measure pre/post change on workflow metrics

### Phase 3: Weeks 7-10
- Re-measure against redesign gate
- Produce go/no-go decision memo
- If gates are met, draft a scoped redesign PRD for the affected workflows

## Risks
- Survey signal may over-represent power-user frustration versus broader demand
- Instrumentation may miss meaningful friction if workflow definitions are poor
- The team may overfit to anecdotal complaints without confirming behavioral severity
- A full redesign may still be unjustified if targeted fixes resolve most of the gap

## Decision Frame
Do not approve a full mobile-first redesign now. Approve an 8-10 week mobile evidence and remediation program with quantified gates that force a go/no-go decision.

## Unknowns & Evidence Gaps
- What percentage of the active base relies on mobile for core workflows
- Which mobile workflows create the largest completion and error gaps
- Whether mobile pain is broad product design failure or a smaller set of workflow defects
- Whether targeted fixes materially close the gap before a rebuild is needed
- Whether the business impact is large enough to justify 6 months of engineering effort

## Pass/Fail Readiness
Pass if all redesign-gate thresholds are met within the 8-10 week program. Fail if mobile usage is not sufficiently broad, severity is confined to isolated workflows, targeted fixes close at least 30% of the baseline gap, or the business case remains weaker than alternative roadmap investments.

## Recommended Next Artifact
A decision memo at the end of week 10 with segmented mobile usage, workflow funnel data, pre/post fix results, business impact sizing, and an explicit recommendation to either continue targeted iteration or fund a scoped redesign.
