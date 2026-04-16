# Revised artifact

## PRD: Tenant-Isolated Fraud Detection

## Product Requirement
Build a fraud detection capability for enterprise customers that improves risk screening without violating contractual data-isolation clauses. The product must not use any customer's raw or derived tenant-specific data in a shared training corpus or shared model when contracts prohibit that use.

## Problem
The requested path to production-grade accuracy depends on cross-tenant learning, but the case states that every enterprise contract prohibits shared-model training on customer data. That creates a direct conflict between the requested ML design and the governing commercial terms. A valid PRD therefore cannot approve the originally requested shared-learning design as the default enterprise approach.

## Goals
- Deliver a contract-compliant fraud detection product for enterprise tenants.
- Improve fraud detection outcomes versus each tenant's current baseline.
- Preserve strict tenant isolation for data storage, feature generation, training, and inference where required.
- Create an explicit future path for pooled learning only where customers grant that right.

## Non-Goals
- No shared training corpus built from prohibited tenant data.
- No shared global model trained on enterprise-customer transactions covered by isolation clauses.
- No launch commitment to production-grade accuracy unless compliant modes are shown to meet an agreed acceptance bar.

## Proposed Product
Ship a tenant-isolated fraud detection offering with three modes:
1. Per-tenant supervised model mode for customers with sufficient labeled volume.
2. Rules plus anomaly-detection mode for lower-volume tenants.
3. Optional pooled-learning mode only for customers that explicitly opt in through separate contractual rights.

The enterprise default offer is modes 1 and 2 only. Mode 3 is excluded from the default PRD and treated as a future commercial path.

## Core Requirements
### 1. Data Isolation
- Each tenant's raw events, features, labels, and model artifacts must remain isolated.
- No training or evaluation job may read another prohibited tenant's data.
- Feature store, model registry, and serving layers must enforce tenant boundaries.

### 2. Detection Capabilities
- Score transactions in near real time.
- Support tenant-specific supervised learning where label volume is sufficient.
- Support anomaly detection and configurable heuristics where label volume is insufficient.
- Allow customer-defined policy rules to combine with model scores.

### 3. Explainability and Controls
- Provide reason codes for flagged events.
- Support tenant-level threshold tuning.
- Capture analyst feedback and labels within each tenant boundary.

### 4. Compliance and Auditability
- Log training lineage, data sources, model versions, and isolation checks.
- Produce customer-reviewable documentation describing isolation guarantees.
- Block deployment if a pipeline attempts prohibited cross-tenant access.

## Success Metrics
- Percentage of enterprise tenants onboarded without contract exception.
- Measured improvement versus each tenant's pre-launch baseline.
- False-positive reduction at the tenant's review capacity.
- Time to first useful deployment per tenant.
- Zero compliance incidents involving prohibited cross-tenant training.

## Key Product Decision
Do not approve a PRD that assumes shared cross-tenant training under current enterprise contracts. Approve a revised PRD only for a tenant-isolated fraud product, with pooled learning separated into an explicit opt-in future offering.

## Decision Frame
The decision is whether to approve the originally requested cross-tenant ML design or to rewrite the PRD around a contract-compliant tenant-isolated design. The recommended decision is to reject the original design and approve only the tenant-isolated version, because the case states that every enterprise contract prohibits the shared training the requested feature requires.

## Unknowns & Evidence Gaps
- The minimum fraud-detection performance bar for launch has not been defined.
- It is unknown how many target tenants have enough labeled data for a useful tenant-specific supervised model.
- The performance gap between compliant tenant-isolated modes and prohibited pooled training is unknown.
- It is unknown what operating-cost and margin burden tenant-specific models create.
- It is unknown whether any priority customers would grant explicit pooled-learning rights through contract amendments.

## Pass/Fail Readiness
Pass if:
- Legal confirms the revised architecture is contract-compliant.
- Product, ML, and GTM align on an explicit launch acceptance bar for compliant modes.
- Engineering can enforce auditable tenant isolation in training and serving.
- The team validates that at least one compliant mode can clear the agreed acceptance bar for the target launch segment.

Fail if:
- The product still depends on prohibited pooled training for baseline viability.
- No explicit launch acceptance bar is defined for compliant modes.
- Compliant modes cannot demonstrate acceptable performance for the target segment.
- Isolation controls cannot be technically enforced and audited.

## Recommended Next Artifact
A decision memo that defines the launch acceptance bar, compares compliant launch options by segment, and shows whether tenant-specific supervised models or rules-plus-anomaly mode can meet that bar without pooled training.
