# Revised artifact

# AI-Assisted Content Moderation PRD

## Product Requirement Document

### Problem Statement
The specification creates an unresolved delivery conflict: AI must flag content automatically, a human must approve every removal, removals are required within 60 seconds, and the current human review queue averages 4 hours. The prompt evidence does not prove this is mathematically impossible under every conceivable staffing model, but it does show the requirement is not build-ready as written because the workflow, SLA definition, and operating model are misaligned.

### Goal
Design a moderation workflow that stops harmful exposure quickly while preserving human accountability for irreversible enforcement.

### Non-Goals
- Eliminating human review from permanent removals
- Assuming the current 4-hour average queue can satisfy a 60-second permanent-removal SLA without explicit operating-model changes
- Treating AI-only irreversible removal as the default pattern

### Users and Stakeholders
- Trust and Safety operations
- End users exposed to harmful content
- Policy and legal teams
- Moderators and reviewer managers

### Decision Frame
Adopt a two-stage enforcement model unless leadership funds and defines a dedicated sub-60-second human review path.

1. AI performs immediate risk scoring on newly created content.
2. For eligible high-risk content, AI may place the content into a reversible temporary containment state within 60 seconds.
3. Human reviewers approve or reject permanent removal.
4. If the business insists on permanent removal within 60 seconds, that requirement is blocked pending a separate operating-model decision covering severity tiers, staffing, escalation, and reviewer SLA.

This reframes the system from "permanent removal in 60 seconds for every flagged item" to "harmful exposure contained in 60 seconds, permanent removal after human approval." That is the only decision-useful PRD path supported by the current prompt.

### Product Requirements
#### Functional Requirements
1. Ingest all new content and run AI classification immediately.
2. Assign each item a policy risk score, severity tier, and policy category.
3. For content above a configurable threshold and in approved categories, automatically place the item into a temporary hold state within 60 seconds.
4. Temporary hold must hide, quarantine, or sharply limit distribution pending review.
5. Create a review task for every held item.
6. Require human approval before permanent removal.
7. Allow reviewers to confirm removal, restore content, or escalate edge cases.
8. Record model output, timestamps, reviewer action, and policy rationale in an audit log.
9. Notify creators when content is placed on hold and when final action is taken, subject to policy exceptions.

#### Operational Requirements
1. Measure time to temporary containment separately from time to final removal.
2. Prioritize review queues by severity, virality, and regulatory sensitivity.
3. Support explicit hot-queue routing if leadership wants a subset of categories reviewed near-real-time.
4. Treat any sub-60-second permanent-removal target as an operational commitment that must be staffed and modeled separately from the current average queue.

#### Policy Requirements
1. Permanent deletion requires human approval.
2. AI-only action must be reversible and explicitly classified as temporary enforcement.
3. Policy must define which categories are eligible for temporary hold and which, if any, justify a dedicated rapid-review lane.

### User Experience
- Harmful content is rapidly contained from broad distribution.
- Reviewers receive prioritized queues with model rationale and severity indicators.
- Content creators receive clear status messaging: under review, removed, or restored.

### Success Metrics
- P95 time from upload to temporary containment for eligible high-risk content: under 60 seconds
- Percentage of permanent removals with human approval: 100%
- False-positive temporary hold rate: below policy-defined threshold
- Median and P95 review completion time by severity tier: tracked separately from containment SLA
- If a hot queue is approved, its achieved reviewer response SLA must be measured independently

### Risks
- False-positive temporary holds may create user frustration.
- Review backlog may still create long final-resolution times.
- A hot queue for rapid human approval may be operationally expensive.
- Poor threshold tuning may either miss harmful content or overwhelm reviewers.

### Unknowns & Evidence Gaps
- Whether the 60-second SLA is intended for temporary containment or permanent removal
- Flagged volume by hour, severity tier, and policy category
- Whether a dedicated rapid-review lane is financially and operationally acceptable
- What reviewer staffing is required to support any sub-60-second human approval path
- Whether temporary hold satisfies the legal and policy meaning of "removal"

### Pass/Fail Readiness
Pass if:
- Stakeholders accept a split SLA: containment within 60 seconds, permanent removal after review
- Policy approves reversible AI-driven temporary enforcement
- Operations can support prioritized review queues and audit logging
- Any sub-60-second human-review requirement is explicitly scoped to defined tiers and resourced with a dedicated operating model

Fail if:
- The requirement remains permanent removal within 60 seconds for all cases without an explicit rapid-review operating model
- Human approval is required before any visibility restriction
- No staffing, queue design, or policy change is permitted

### Recommended Next Artifact
A policy-and-operations decision memo that resolves the SLA definition, specifies whether a rapid-review lane exists, identifies eligible severity tiers, and quantifies reviewer capacity required before engineering commits to implementation.
