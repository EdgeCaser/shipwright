# Revised artifact

## Churn Reduction PRD

### Overview
This PRD defines a churn reduction program for a product facing conflicting signals between headline churn pressure and strategy targets. The decision is to act now on reversible churn risk, but only through a provisional classification model with explicit confidence levels, thresholds, and escalation rules. The PRD no longer assumes the team already has a validated strategic-versus-non-strategic taxonomy; it introduces a bounded method to create one and limits intervention scope until confidence improves.

### Problem
The organization sees churn pressure, but current signals conflict:
- Aggregate churn may be rising while strategy intentionally deprioritizes some segments.
- Top cancellation reasons may be noisy, biased, or non-causal.
- Teams may overreact to visible churn without knowing whether the lost customers are strategically desirable to retain.

Without an operational classification method, retention work becomes either generic and strategy-blind or blocked by analysis paralysis.

### Goal
Reduce reversible churn in economically and strategically desirable cohorts while establishing a reliable decision system for classifying churn under uncertainty.

### Non-Goals
- Reducing churn uniformly across the full customer base.
- Scaling save tactics before cohort classification reaches minimum confidence.
- Treating self-reported cancellation reasons as sufficient proof of root cause.

### Users and Stakeholders
- Primary users: customers in high-value or potentially high-value cohorts showing reversible churn risk.
- Internal stakeholders: Product, Lifecycle/CRM, Support, Sales/CS, Finance, Leadership, Data/Analytics.

### Decision Logic
Retention work proceeds in two tracks:
1. Classification track: create a provisional churn taxonomy using observable data available now.
2. Intervention track: run only low-cost experiments in cohorts that meet minimum confidence and value thresholds.

A cohort is eligible for intervention only if all conditions hold:
1. Confidence: the cohort can be classified using current observable rules.
2. Value: the cohort meets a minimum economic threshold.
3. Reversibility: the suspected churn driver is plausibly addressable with a bounded intervention.
4. Cost: the intervention is low-cost enough to justify action before full causal proof.

### Operational Classification Method
The PRD establishes a three-level classification instead of assuming a finished taxonomy:

#### Level 1: Provisional Strategic Fit
Assign each churned or at-risk account a provisional fit label using fields already available in CRM, billing, and product analytics:
- Target fit: matches ICP attributes, plan type, use case, and revenue profile aligned to strategy.
- Unclear fit: missing or contradictory data.
- Non-target fit: outside ICP, chronically low-value, or dependent on unsupported use cases.

Minimum required inputs:
- plan tier
- ACV or ARR band
- acquisition source
- tenure band
- activation/adoption status
- support burden or exception handling level
- stated use case or segment tag if available

#### Level 2: Economic Attractiveness
Classify each cohort as retain, test, or do-not-rescue using explicit thresholds set by Finance and Product:
- Retain: positive retained value after expected intervention cost.
- Test: value uncertain; only low-cost experiments allowed.
- Do-not-rescue: negative or clearly unattractive unit economics.

#### Level 3: Driver Confidence
Label the churn driver as:
- Observed: backed by behavioral or operational signals, such as failed activation or repeated support incidents.
- Claimed-only: based only on cancellation reason text or survey response.
- Unknown: insufficient evidence.

Only cohorts with `Target fit` or `Unclear fit`, `Retain` or `Test`, and `Observed` or high-plausibility `Claimed-only` drivers can enter intervention experiments.

### Requirements
#### Functional Requirements
1. Build a churn decision table at the account and cohort level with fit label, value label, driver confidence, and intervention eligibility.
2. Instrument churn reporting by plan tier, tenure, acquisition source, activation status, and support burden before adding richer segmentation.
3. Route accounts with missing classification inputs into an `unknown` bucket rather than forcing a false strategic label.
4. Enable low-cost interventions only for eligible cohorts.
5. Record intervention exposure, save outcome, 30/60/90-day retention, and downstream support or margin impact.

#### Decisioning Requirements
1. Publish the exact provisional rules used for fit, value, and driver-confidence labels.
2. Require leadership sign-off on the minimum economic threshold for rescue actions.
3. Treat `unknown` as a first-class operating state with its own backlog for data quality and analysis.
4. Escalate any cohort representing material churn volume but remaining `unknown` for two review cycles.
5. Block scale-up if measured wins come mainly from non-target or negative-economics cohorts.

#### Measurement Requirements
1. Primary metric: retained revenue or customer retention improvement within eligible target/test cohorts.
2. Secondary metrics: save rate, activation recovery, 30/60/90-day retained saves, support load.
3. Guardrails: gross margin, expansion rate, low-fit retention rate, roadmap capacity, discount leakage.
4. Confidence metric: share of churn volume classified with complete inputs and non-unknown status.

### Proposed Solution
#### Phase 1: Bootstrap Classification
Stand up a minimum viable churn model using existing systems only. Do not wait for a full causal analysis. The immediate output is a weekly decision table with explicit unknowns.

#### Phase 2: Run Bounded Experiments
Launch 2-3 low-cost interventions in eligible cohorts only:
- activation rescue for early-tenure accounts with clear adoption failure
- cancellation-flow routing by observed risk pattern
- selective outreach where retained value exceeds cost threshold

#### Phase 3: Tighten the Model
Use experiment results and churn analysis to refine thresholds, reduce the `unknown` bucket, and either promote cohorts into scaled retention treatment or explicitly classify them as acceptable churn.

### User Stories
- As a PM, I want a provisional classification system so that retention work can start without pretending uncertainty is resolved.
- As a lifecycle owner, I want eligible cohorts defined by observable rules so that interventions can be targeted and auditable.
- As a leadership stakeholder, I want unknown churn separated from non-strategic churn so that missing evidence does not get mistaken for strategic intent.

### Acceptance Criteria
1. A weekly churn decision table exists with fit label, value label, driver confidence, and unknown status.
2. Every intervention names the exact cohort rule and minimum economic threshold used for entry.
3. No cohort is labeled non-strategic without at least one documented fit rule and one economic signal.
4. Unknown churn is reported separately from confirmed non-target churn.
5. At least one low-cost experiment runs in a cohort that satisfies the eligibility logic above.
6. Scale decisions require both retention lift and guardrail pass within eligible cohorts.

### Risks
- False precision risk: provisional labels may be mistaken for validated truth.
- Data quality risk: missing segment fields may inflate the unknown bucket.
- Strategy drift risk: teams may still chase aggregate churn if leadership does not enforce guardrails.
- Delay risk: the unknown backlog may grow faster than the team can resolve it.

## Decision Frame
Choose a bootstrap retention program, not a fully mature churn taxonomy and not blanket churn suppression. The core decision is to operationalize uncertainty: use provisional fit, value, and driver-confidence labels now; allow only low-cost actions in eligible cohorts; and keep unknown churn visible instead of collapsing it into either strategic or non-strategic churn. This resolves the original conflict by replacing an assumed taxonomy with an explicit interim operating model.

## Unknowns & Evidence Gaps
- Which segments produce the largest share of retained-value opportunity after applying the economic threshold.
- How much of current cancellation-reason data is causal versus descriptive.
- What percentage of churn will remain in the `unknown` bucket after minimum viable instrumentation.
- Which provisional fit rules are most likely to be revised after deeper churn analysis.

## Pass/Fail Readiness
Pass if the team can produce the weekly decision table, define provisional thresholds, isolate unknown churn, and run at least one low-cost experiment in an eligible cohort. Fail if the team still relies on aggregate churn alone, cannot distinguish unknown from confirmed non-target churn, or cannot state the rules used to classify intervention eligibility.

## Recommended Next Artifact
A churn analysis artifact that validates or revises the provisional fit, value, and driver-confidence rules, quantifies unknown-bucket size, and recommends which cohorts should graduate from bounded tests to scaled retention programs.
