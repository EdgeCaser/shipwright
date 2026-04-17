# Revised artifact

## Decision Frame
The current PRD should not proceed as written because it combines two incompatible product requirements in one pipeline contract: near-real-time updates within 2 seconds of any event and nightly batch aggregation as the sole source of truth for all reporting. The immediate product decision is not to approve a rewritten two-tier model as final, but to explicitly split the unresolved decision into two candidate requirement paths and force stakeholder choice.

Path A: preserve nightly batch as the sole authoritative reporting source and allow a separate near-real-time operational view with clearly bounded status and reconciliation rules.

Path B: require a single authoritative near-real-time experience and therefore reopen the previously rejected architectural tradeoff, since the current batch-source-of-truth constraint would no longer hold as written.

The PRD should be revised to state that these are mutually exclusive requirement directions until product and engineering jointly select one. That is more decision-useful than pretending the current requirements can coexist unchanged.

## Product Requirement
### Goal
Resolve the requirement conflict before implementation by forcing an explicit product choice about freshness, authority, and acceptable consistency risk.

### Non-Goals
- Approving an implementation against the current contradictory requirement set.
- Assuming stakeholder acceptance of provisional real-time values before validation.
- Treating both real-time and nightly batch outputs as co-equal authoritative sources.

### User Problem
Users appear to need fast visibility into incoming events, while the reporting model requires nightly batch outputs as the authoritative source of truth. As currently written, the PRD does not define which requirement wins when those needs diverge.

### Proposed Requirement Language
1. The system shall not be implemented against a requirement set that simultaneously mandates sub-2-second updates for all event-driven dashboard views and nightly batch aggregation as the sole source of truth for all reporting unless the product explicitly defines how conflicts are handled.
2. The PRD shall require selection of one of two product models before build commitment:
   - a near-real-time operational model distinct from authoritative nightly reporting, with explicit labeling, surface scope, and reconciliation behavior; or
   - a single-authority near-real-time model that supersedes the current nightly-source-of-truth requirement and requires renewed architectural review.
3. The PRD shall identify the user decisions supported by the 2-second requirement so the team can determine whether provisional or delayed values are acceptable.
4. The PRD shall define which surfaces, workflows, and decisions depend on authoritative values versus freshest-available values.
5. The PRD shall not hide unresolved consistency and authority tradeoffs behind ambiguous pipeline language.

### Rationale
The critique is correct that stakeholder acceptance of provisional real-time values has not been established. Because that acceptance is unproven, the two-tier model should be treated as one candidate resolution, not as a settled requirement rewrite. The stronger decision is to reject the contradictory PRD as currently framed and require an explicit choice about which product contract matters more.

### Acceptance Criteria
- The revised PRD identifies the contradiction between freshness and authority requirements instead of embedding both as unconditional guarantees.
- The revised PRD presents mutually exclusive requirement paths rather than implying both can be satisfied in one unchanged pipeline contract.
- The revised PRD documents the user decisions or workflows that justify the 2-second requirement.
- The revised PRD defines what kind of discrepancy, delay, or consistency risk is acceptable for the selected path.
- The revised PRD prevents implementation from proceeding until the product authority model is chosen.

## Unknowns & Evidence Gaps
- What business decision or workflow requires the 2-second update contract.
- Whether stakeholders will accept a split between freshest-available operational views and authoritative nightly reporting.
- Whether the real-time requirement is for awareness only or for actions that demand authoritative correctness.
- Whether reopening the previously rejected consistency-risk architecture is acceptable if a single authoritative real-time experience is required.

## Pass/Fail Readiness
Pass if:
- Stakeholders choose one requirement path instead of preserving both incompatible guarantees.
- The PRD specifies the intended decision use of the real-time experience.
- The PRD makes authority, freshness, and discrepancy handling explicit.

Fail if:
- The PRD continues to require both sub-2-second updates and nightly batch as sole authority without a governing product choice.
- The PRD assumes provisional real-time values are acceptable without validation.
- The PRD leaves engineering to absorb the contradiction as an implementation detail.

## Recommended Next Artifact
A decision memo or PRD addendum that compares the two requirement paths side by side:
- operational freshness separated from authoritative reporting
- single authoritative real-time experience with reopened architecture tradeoff

That artifact should name the user decisions supported, acceptable discrepancy behavior, and the product owner decision on which contract governs.
