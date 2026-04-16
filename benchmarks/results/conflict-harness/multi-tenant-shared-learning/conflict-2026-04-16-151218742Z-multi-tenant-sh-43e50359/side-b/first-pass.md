# PRD: Tenant-Isolated Fraud Detection

## Product Requirement
Build a fraud detection capability that improves risk screening for enterprise customers without violating contractual data-isolation clauses. The feature must not use any customer's raw or derived tenant-specific data in a shared training corpus or shared model when contracts prohibit that use.

## Problem
The requested outcome is production-grade fraud detection accuracy. The stated technical path depends on cross-tenant learning, but the governing contracts prohibit shared-model training across tenants. Shipping the originally requested design would create legal and trust risk that outweighs model-performance upside.

## Goals
- Deliver a contract-compliant fraud detection product for enterprise tenants.
- Improve fraud detection precision and recall versus customer rules-only baselines.
- Preserve strict tenant isolation for data storage, feature generation, training, and inference where required.
- Create a path to stronger accuracy through compliant data rights, not policy exceptions.

## Non-Goals
- No shared training corpus built from prohibited tenant data.
- No shared global model trained on enterprise-customer transactions covered by isolation clauses.
- No PRD commitment to production-grade accuracy at launch without evidence from compliant approaches.

## Users
- Enterprise risk operations teams.
- Enterprise security and legal stakeholders who must approve data handling.
- Internal product and ML teams responsible for model quality and compliance.

## Proposed Product
Ship a tenant-isolated fraud detection offering with three modes:
1. Per-tenant model mode for customers with enough labeled volume.
2. Rules + anomaly detection mode for lower-volume tenants.
3. Optional shared-learning mode only for customers that explicitly contract into pooled training rights.

The default enterprise offer is modes 1 and 2 only. Shared-learning is a separate future SKU or contract path, not part of the default PRD.

## Core Requirements
### 1. Data Isolation
- Each enterprise tenant's raw events, features, labels, and model artifacts are logically and operationally isolated.
- No training job may read another prohibited tenant's data.
- Feature store, model registry, and evaluation pipelines must enforce tenant boundaries.

### 2. Detection Capabilities
- Score transactions in near real time.
- Support supervised learning for tenants with sufficient labels.
- Support unsupervised anomaly detection and configurable heuristics for tenants without sufficient labels.
- Allow customer-defined policy rules to combine with model scores.

### 3. Explainability and Controls
- Provide reason codes for flagged events.
- Expose threshold tuning by tenant.
- Support analyst feedback loops and label capture within each tenant.

### 4. Compliance and Auditability
- Log training lineage, data sources, model versions, and isolation checks.
- Produce customer-reviewable documentation describing isolation guarantees.
- Block deployment if a pipeline attempts cross-tenant access for a prohibited tenant.

## User Stories
- As a fraud analyst, I want risky transactions scored in real time so I can review them before approval.
- As an enterprise admin, I want assurance that my data is not used to train other customers' models.
- As legal/compliance, I want auditable controls showing tenant isolation is enforced.
- As an ML operator, I want a supported path for low-volume tenants that does not depend on prohibited pooled data.

## Success Metrics
- Percentage of enterprise tenants onboarded without contract exception.
- Improvement over tenant baseline in precision at review capacity.
- Reduction in false positives for tenants with tuned thresholds.
- Time to first useful model or rules deployment per tenant.
- Zero compliance incidents involving prohibited cross-tenant training.

## Risks
- Per-tenant data volume may be too low for acceptable supervised-model quality.
- Rules + anomaly mode may underperform against sophisticated fraud patterns.
- Operational cost may increase due to many tenant-specific pipelines and models.
- Sales pressure may push for shared learning before legal rights exist.

## Dependencies
- Legal review of contract-safe architecture and product claims.
- Platform support for tenant-scoped feature and model infrastructure.
- Sufficient per-tenant labeling workflows.
- Product packaging for optional opt-in pooled-learning rights.

## Recommendation
Do not approve a PRD that assumes shared cross-tenant training under current enterprise contracts. Approve a revised PRD for a tenant-isolated fraud product, and treat pooled learning as a separately permissioned future offering.

## Decision Frame
The decision is whether to write the PRD around the originally requested shared-learning design or around a contract-compliant tenant-isolated design. The recommended choice is the tenant-isolated design, because the requested shared model conflicts directly with the stated enterprise data-isolation clauses.

## Unknowns & Evidence Gaps
- What fraction of enterprise tenants have enough labeled fraud data for useful per-tenant supervised models?
- How much performance gap exists between compliant tenant-isolated approaches and prohibited pooled training?
- Which customers would accept explicit opt-in amendments for shared-learning rights?
- What are the infrastructure and margin implications of operating many tenant-specific models?

## Pass/Fail Readiness
Pass if:
- Legal confirms the revised architecture is contract-compliant.
- Product accepts that launch goals are framed around compliant risk-reduction outcomes, not guaranteed pooled-model accuracy.
- Engineering can enforce hard tenant isolation in training and serving.
- GTM agrees shared-learning requires explicit contractual opt-in.

Fail if:
- The product requirement still depends on prohibited pooled training for baseline viability.
- Leadership insists on production claims that cannot be met with compliant data rights.
- Isolation controls cannot be audited or enforced technically.

## Recommended Next Artifact
A decision memo comparing three compliant launch options: per-tenant supervised models, rules plus anomaly detection, and an opt-in pooled-learning addendum program, including legal viability, expected accuracy, operating cost, and launch sequencing.
