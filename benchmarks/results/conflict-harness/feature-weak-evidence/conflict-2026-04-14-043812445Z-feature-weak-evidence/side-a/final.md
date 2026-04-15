# Revised artifact

## PRD: Evidence-Limited Feature Proposal

## Feature Summary
**Working title:** Guided Workspace Templates

**Problem hypothesis:** Some new users may experience blank-page friction during project creation, slowing activation and delaying first value.

**Proposed feature:** Offer a small set of guided workspace templates during project creation, each with pre-populated structure, starter tasks, and example content.

## Decision Frame
**Decision to make:** Whether to authorize engineering work on a Guided Workspace Templates pilot.

**Revised recommendation:** Do not approve a build pilot yet. Approve a short evidence-collection phase first.

**Why this is decision-useful now:**
- The current packet contains no direct evidence that blank-page friction is a major activation problem.
- The current packet contains no evidence that templates are the best intervention.
- Cheaper falsification steps exist and should be exhausted before productizing a solution.

**What is approved now:**
- Analytics review of new-project funnel behavior
- Review of support tickets, onboarding notes, and any existing qualitative feedback
- Lightweight user research or survey work focused on setup friction
- Comparison against lower-cost alternatives such as checklists, examples, and guided walkthroughs

**What is not approved now:**
- Engineering implementation of template picker or template generation flow
- Expansion into a template platform, marketplace, or personalization system

## Background
Current project setup appears generic, and the suspected user pain is that some users do not know how to structure their first workspace. However, this is still a hypothesis rather than an established problem statement.

The evidence packet is empty. As a result, the team cannot currently determine whether setup friction is common, severe, segment-specific, or among the highest-leverage activation problems.

## Users and Jobs To Be Done
**Candidate primary user:** New or infrequent users creating a project for the first time.

**Candidate job to be done:**
- Help me start with a useful structure so I can begin real work quickly.

**Candidate secondary user:** Team leads creating repeatable project setups.

These user definitions remain provisional until evidence confirms who actually experiences the problem.

## Product Hypothesis
If a meaningful share of new users stall because they do not know how to structure a workspace, then a guided starting point may improve activation.

This hypothesis is not yet strong enough to justify building. It first needs to clear a cheaper evidence gate.

## Evidence Standard Before Build
The feature may proceed to pilot only if the team can establish all of the following:
1. Setup friction is a measurable problem in the activation funnel.
2. The problem is large enough to matter relative to other onboarding issues.
3. A defined user segment experiences this pain disproportionately.
4. Templates are more promising than lighter alternatives.
5. The expected learning value of a pilot exceeds its implementation cost.

## Scope of Current Work
**In scope now:**
- Diagnose whether blank-page friction exists
- Size the problem using existing data where available
- Identify affected segments
- Evaluate solution options before selecting templates

**Out of scope now:**
- Building template selection UI
- Shipping starter content into production
- User-generated templates
- Template marketplace
- AI-generated recommendations

## Research and Decision Requirements
1. Review the project-creation funnel for drop-off points and time-to-first-meaningful-action patterns.
2. Audit existing support tickets, onboarding feedback, and internal anecdotal reports for setup-friction evidence.
3. Run lightweight user interviews or surveys with new users who stalled or abandoned setup.
4. Compare at least three interventions: templates, checklist/walkthrough, and example workspace.
5. Produce a rough effort estimate for each intervention.
6. Recommend the cheapest credible next test based on evidence gathered.

## Success Criteria for Advancing to Pilot
A build pilot is justified only if the evidence-collection phase shows:
- setup friction is a material driver of activation loss
- a target segment can be clearly identified
- templates outperform or materially complement simpler alternatives in hypothesis quality
- estimated implementation cost is proportionate to expected learning value
- pilot metrics and guardrails are specified in advance

## Risks
- The problem may be minor or nonexistent.
- The root cause may be onboarding clarity, not workspace structure.
- Templates may add choice friction or clutter.
- The team may over-invest in a solution before validating the problem.
- A pilot may consume engineering time that should have gone to cheaper evidence gathering.

## Unknowns & Evidence Gaps
- No quantified evidence shows blank-page friction is a top activation problem.
- No user research links templates to improved activation.
- No segment evidence shows who would benefit.
- No effort estimate exists for templates or for lower-cost alternatives.
- No comparison exists between templates and simpler interventions.
- No current evidence shows that a build pilot is the cheapest credible next step.

## Pass/Fail Readiness
**Current status:** Fail for pilot approval.

**Pass conditions:**
- Existing funnel and qualitative evidence have been reviewed.
- The team can state the problem size and affected segment with confidence.
- At least one lower-cost alternative has been assessed against templates.
- A pilot is shown to be the most efficient remaining way to reduce uncertainty.

**Fail conditions:**
- The team moves from plausibility to build without problem validation.
- The team cannot distinguish template value from general onboarding improvements.
- No effort-versus-learning comparison is produced.

## Recommended Next Artifact
Evidence brief for feature validation, including:
- funnel analysis summary
- support and research synthesis
- target segment definition
- alternatives comparison
- rough effort estimates
- recommendation on whether to kill, defer, or pilot Guided Workspace Templates

