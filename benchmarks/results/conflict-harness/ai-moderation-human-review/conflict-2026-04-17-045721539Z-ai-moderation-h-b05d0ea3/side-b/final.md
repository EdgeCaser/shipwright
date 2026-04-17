# Revised artifact

## PRD: AI-Assisted Content Moderation With Human Approval Constraint

## Product Decision
Design the system around automatic AI flagging and human-approved removals, and treat the current combination of requirements as unresolved at the PRD level unless stakeholders redefine either the SLA, the approval rule, or the review operating model. The PRD should separate immediate machine actions from final removal actions and state that the current spec does not yet describe an implementable removal flow.

## Problem Statement
The requested system must do all of the following:
- Automatically flag content with AI.
- Require a human reviewer to approve every removal decision.
- Meet a removal SLA of 60 seconds.
- Operate with a human review queue that currently averages a 4-hour response time.

As written, these requirements conflict in the current operating model for any flow where final removal depends on prior human approval. A revised review design could change that, but that redesign is not yet specified in the case packet.

## Users and Stakeholders
- Trust and safety operations team reviewing flagged content.
- End users whose content may be flagged or removed.
- Product and policy owners responsible for enforcement quality and SLA compliance.

## Goals
- Detect potentially violative content automatically.
- Preserve human accountability for final removal decisions.
- Make the operating contract explicit for what happens immediately versus after review.
- Produce a PRD that is implementable only after the requirement conflict is resolved.

## Non-Goals
- Fully autonomous removals.
- Assuming the present review latency is immutable.
- Claiming the current spec is launch-ready without resolving the conflict.

## Proposed Product Behavior
### 1. AI Flagging
The system automatically evaluates incoming content and flags content that may require action.

### 2. Queueing for Human Review
All candidate removals are routed to human review for approval before final removal.

### 3. Interim System Actions
The PRD should explicitly define whether the product supports non-final actions before human review, such as hold, limited visibility, or pending status. These actions must be distinguished from final removal.

### 4. Final Enforcement
Content is removed only after human approval unless stakeholders change the approval rule for defined cases.

## Requirements
### Functional Requirements
- The system must automatically flag content for review.
- The system must record AI rationale and review status for each flagged item.
- The system must require explicit human approval before final removal unless policy defines an exception.
- The system must expose queue state and decision status to operations tooling.

### Policy Requirements
- Final removal must remain a human-authorized action under the current policy statement.
- Any machine-driven interim restriction must be explicitly distinguished from removal.

### SLA Requirements
- The PRD must not claim that the current operating model satisfies 60-second final removals when final removal depends on a review queue that currently averages 4 hours.
- The PRD must require a decision on whether to change the SLA, the approval rule, or the review operating model before launch.

## Risks
- Shipping against unresolved requirements creates either SLA breach or policy noncompliance.
- Teams may collapse provisional handling and final removal into one state.
- A redesigned review process may be assumed rather than specified, leaving the PRD ambiguous.

## Decision Frame
The decision is whether to write this as a launch-ready PRD under the current constraints or to surface the unresolved operating conflict. Recommendation: preserve AI flagging and mandatory human approval as stated, but classify the current removal flow as not yet implementable until stakeholders specify whether the SLA, the approval policy, or the review system design changes.

## Unknowns & Evidence Gaps
- Whether the 60-second SLA applies to final removal, provisional handling, or initial flagging.
- Whether any content categories may bypass prior human approval.
- Whether the review operating model will be redesigned enough to satisfy the SLA.
- What interim actions, if any, are policy-acceptable before human approval.

## Pass/Fail Readiness
Pass if stakeholders resolve the conflict by choosing one of these:
- Redefine the 60-second SLA to apply to flagging or provisional handling rather than final removal.
- Change the approval rule so some removals do not require prior human approval.
- Specify a redesigned review operating model that makes the removal SLA compatible with mandatory approval.

Fail if the requirement remains that every removal needs human approval, removals must occur within 60 seconds, and no redesigned review model is specified.

## Recommended Next Artifact
A decision memo that resolves which variable changes: the SLA definition, the human-approval policy, or the review operating design.
