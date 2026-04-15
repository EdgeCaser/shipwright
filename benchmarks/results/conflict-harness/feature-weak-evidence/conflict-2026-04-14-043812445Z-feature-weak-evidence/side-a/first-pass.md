# PRD: Evidence-Limited Feature Proposal

## Feature Summary
**Working title:** Guided Workspace Templates

**Problem:** New users may face a blank-page problem when starting a project, which can slow activation and reduce early value realization.

**Proposed feature:** Offer a small set of guided workspace templates during project creation, each pre-populated with recommended structure, starter tasks, and example content.

## Decision Frame
**Decision to make:** Whether to invest in a limited pilot of Guided Workspace Templates despite weak supporting evidence.

**Recommendation:** Approve a narrowly scoped pilot, not a full rollout.

**Why this is decision-useful now:**
- The idea is plausible and low-to-moderate effort.
- The current evidence base is too weak to justify a broad commitment.
- A constrained pilot can cheaply test whether the feature improves activation without creating major product or operational drag.

**Non-goal:** Do not treat this PRD as approval for a platform-level templates system, marketplace, or broad personalization layer.

## Background
Current support for new project setup appears generic. The hypothesized user pain is that some users do not know how to structure their first workspace and need stronger starting guidance.

Evidence is currently anecdotal and incomplete. There is no validated proof in the packet that this problem is large, frequent, or among the top drivers of poor outcomes.

## Users and Jobs To Be Done
**Primary user:** New or infrequent users creating a project for the first time.

**Job to be done:**
- Help me start with a useful structure so I can begin real work quickly.

**Secondary user:** Team leads creating repeatable project setups.

## Hypothesis
If new users are offered a small number of opinionated templates at project creation, then more of them will complete setup and reach first meaningful use because the product removes blank-page friction.

## Scope
**In scope:**
- 3-5 curated templates for common starting scenarios
- Template picker in project creation flow
- Pre-filled starter content and task structure
- Basic tracking for template selection and downstream activation events

**Out of scope:**
- User-generated templates
- Template sharing marketplace
- Deep customization before project creation
- AI-generated template recommendations

## User Experience Requirements
- Users can create a blank workspace or choose a template.
- Template choices are labeled in plain language by use case.
- Each template shows a short preview of what will be created.
- Applying a template should be reversible or easy to clear.
- The flow should not add meaningful friction for users who prefer blank setup.

## Functional Requirements
1. System presents template options during new project creation.
2. User can preview template contents before applying.
3. Selected template creates predefined starter structure and sample items.
4. User can skip templates and create a blank project.
5. Product analytics logs template impressions, selections, setup completion, and early engagement events.

## Success Metrics
**Primary success metric:**
- Increase in project setup completion rate for eligible new users

**Secondary metrics:**
- Increase in time-to-first-meaningful-action completion rate within first session
- Increase in 7-day retention for pilot cohort
- Template selection rate

**Guardrails:**
- No material decrease in project creation completion due to added UI friction
- No meaningful increase in support burden related to confusing starter content

## Rollout Plan
- Phase 1: Internal dogfood with 3 templates
- Phase 2: Limited exposure to a small percentage of new users
- Phase 3: Expand only if pilot meets predefined success criteria

## Risks
- The problem may be real but too small to matter.
- The problem may be misdiagnosed; friction could come from onboarding, not structure setup.
- Templates may create clutter or make the product feel prescriptive.
- Added choice at creation may reduce completion instead of helping it.

## Unknowns & Evidence Gaps
- No quantified evidence in the packet shows blank-page friction is a top user problem.
- No interview, survey, or behavioral evidence is provided linking templates to improved activation.
- No segment evidence identifies which user types would benefit most.
- No effort estimate or opportunity-cost comparison is provided.
- No proof exists that templates outperform simpler alternatives such as checklists, walkthroughs, or examples.

## Pass/Fail Readiness
**Current status:** Fail for full-scale investment; pass for bounded experiment.

**Pass conditions for pilot approval:**
- Team agrees on a narrow scope and explicit success metrics.
- Instrumentation is in place before exposure.
- Pilot is limited to new users and reversible.
- A simpler alternative has been considered and rejected or deferred with rationale.

**Fail conditions:**
- Feature is treated as strategically validated without new evidence.
- Scope expands beyond curated templates in first release.
- No clear readout plan exists.

## Recommended Next Artifact
Experiment brief for a 2-4 week pilot, including:
- target segment
- instrumentation plan
- success thresholds
- rollout percentage
- readout template
- alternative solutions comparison

