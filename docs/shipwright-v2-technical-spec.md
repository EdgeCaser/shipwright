# Technical Specification: Shipwright v2 Runtime Hardening

## Metadata

- Strategy reference: `docs/shipwright-v2-strategy-brief.md`
- Benchmark scoring reference: `docs/shipwright-v2-benchmark-scoring-spec.md`
- Author: Codex with Shipwright frameworks
- Reviewers: Shipwright maintainer, future technical reviewer
- Status: Draft
- Last updated: April 2, 2026

## Context

**What we're building:** A v2 runtime hardening layer for Shipwright that introduces a lower-ceremony entry path, machine-readable artifact contracts, stronger postflight validation, and a benchmark harness for proof.

**Why (business):** Shipwright needs to improve daily usability and external credibility. The current system is strong at structure and artifact hygiene, but weaker at proving better decisions and enforcing quality mechanically.

**Why (technical):** Current rigor is spread across prompt instructions in files like `agents/orchestrator.md`, `commands/start.md`, and the skill library. The repo already has a deterministic validator in `scripts/validate-artifact.mjs`, but it does not yet validate structured artifact payloads or contradiction classes.

## Scope

**In scope:**

- Add top-level execution modes: `Fast` and `Rigorous`
- Add a deterministic routing confidence rubric and auto-escalation triggers
- Remove mandatory planning for obvious, high-confidence asks
- Define machine-readable schemas for 3 artifact types:
  - PRD
  - Strategy doc
  - Challenge report
- Extend `scripts/validate-artifact.mjs` with schema-aware checks and first-pass contradiction detection
- Add a benchmark harness with fixed scenarios and baseline comparison
- Optionally generate a small set of high-drift docs from `manifest.json` after proof work is complete

**Out of scope:**

- Full taxonomy/category refactor
- Repo split into `core/` and `adapters/`
- Full schema coverage for every Shipwright artifact
- Full semantic contradiction detection across all documents
- Production analytics pipeline or hosted service infrastructure

**Assumptions:**

- Shipwright remains a repo-first toolkit, not a standalone web app
- Markdown remains the primary human-readable artifact format
- Deterministic scripts in `scripts/` are the preferred enforcement layer
- Backward compatibility matters more than perfectly clean v2 abstractions in the first cycle

## Architecture

### High-Level Design

Shipwright v2 adds a thin runtime contract on top of the existing skill and workflow system.

```text
[User ask]
  -> [Intent routing]
  -> [Execution mode policy: Fast or Rigorous]
  -> [Skill/workflow execution]
  -> [Markdown artifact]
  -> [Optional structured artifact payload]
  -> [Postflight validator]
  -> [Pass/fail + contradiction checks + benchmark capture]
```

### Components Affected

| Component | Change Type | Description |
|---|---|---|
| `agents/orchestrator.md` | Modify | Remove mandatory planning for high-confidence obvious asks; introduce `Fast` and `Rigorous` as top-level execution modes |
| `commands/start.md` | Modify | Align `/start` with mode-based routing and conditional planning |
| `AGENTS.md` | Modify | Keep Codex bridge behavior aligned with the same mode model |
| `.codex/skills/shipwright-concierge/SKILL.md` | Modify | Route plain-language asks using the same mode policy |
| `scripts/route-request.mjs` | New | Deterministic routing helper for workflow/skill selection confidence and auto-escalation checks |
| `scripts/validate-artifact.mjs` | Modify | Add structured payload validation, contradiction checks, and challenge-propagation checks |
| `manifest.json` | Modify | Register schema-backed artifacts and doc-generation targets if needed |
| `scripts/validate.sh` | Modify | Verify generated-doc freshness and schema file presence |
| `schemas/artifacts/` | New | JSON Schemas for PRD, strategy doc, and challenge report |
| `scripts/extract-structured-artifact.mjs` | New | Extract structured payloads from markdown artifacts into JSON sidecars |
| `scripts/run-benchmarks.mjs` | New | Execute benchmark scenarios and summarize results |
| `benchmarks/` | New | Scenario definitions, baselines, scoring config, and output summaries |
| `scripts/generate-docs.mjs` | New | Generate README counts and selected routing tables from `manifest.json` |

### Architecture Decision Records (ADRs)

#### ADR 1: Expose `Fast` and `Rigorous` as top-level execution modes

- **Context:** Shipwright currently exposes `Quick`/`Standard`/`Deep` or `Light`/`Standard`/`Deep`, but the critique correctly points out that the user's real choice is usually "move quickly" vs "defend this decision."
- **Options considered:**
  - Option A: Replace all depth language repo-wide immediately
    - Pros: Conceptually clean
    - Cons: Requires touching nearly every skill and workflow at once
  - Option B: Add `Fast` and `Rigorous` above existing depth controls
    - Pros: Backward-compatible, faster to ship, lower migration risk
    - Cons: Creates a temporary two-layer abstraction model
- **Decision:** Choose Option B.
- **Rationale:** `Fast` vs `Rigorous` solves the user-facing ergonomics problem without forcing a repo-wide rewrite of skill depth tables in the same cycle.
- **Consequences:** Skills may continue to define `Light`/`Standard`/`Deep`, but orchestrators and bridges will map user intent into those depth settings instead of exposing depth as the first decision.

#### ADR 2: Use embedded structured payloads plus extracted sidecars for core artifacts

- **Context:** Shipwright artifacts need machine-readable structure for validation, chaining, and benchmarking, but markdown portability must remain intact.
- **Options considered:**
  - Option A: Replace markdown artifacts with standalone JSON/YAML files
    - Pros: Maximum machine readability
    - Cons: Breaks the repo's portability and human-first workflow
  - Option B: Require a visible `Structured Artifact` JSON block in every markdown file
    - Pros: Easy to inspect
    - Cons: Noisy for human readers; weak fit for customer-facing artifacts
  - Option C: Allow a hidden structured payload in markdown and extract it to a sidecar JSON file
    - Pros: Preserves markdown UX while enabling validation and downstream automation
    - Cons: Requires an extractor step and a clear convention
- **Decision:** Choose Option C.
- **Rationale:** A hidden payload keeps markdown as the canonical human artifact while enabling sidecar extraction for automation and tests.
- **Consequences:** Saved artifact workflows and benchmark fixtures will produce both `.md` and `.json`; inline conversational outputs can stay markdown-only unless structured output is explicitly requested. Markdown remains canonical for human review. The extracted JSON sidecar is canonical for validation, contradiction checks, automation, and benchmark scoring. If they diverge, validation fails.

#### ADR 3: Extend the existing validator instead of building a new enforcement engine

- **Context:** `scripts/validate-artifact.mjs` already performs deterministic postflight checks and is the natural place to concentrate v2 enforcement.
- **Options considered:**
  - Option A: Build a second validator for schemas and contradiction checks
    - Pros: Clean separation
    - Cons: Splits logic and increases maintenance burden
  - Option B: Extend `scripts/validate-artifact.mjs`
    - Pros: Reuses existing CLI, keeps enforcement centralized
    - Cons: Requires careful refactoring to keep the script readable
- **Decision:** Choose Option B.
- **Rationale:** The validator already represents Shipwright's deterministic enforcement layer.
- **Consequences:** The validator API will need versioning and better machine-readable output support.

## Execution Mode Contract

### Mode Definitions

| Mode | Default Behavior | Best For |
|---|---|---|
| `Fast` | Minimal ceremony, direct execution when route confidence is high | Obvious asks like "write a PRD", "draft OKRs", "make release notes" |
| `Rigorous` | Explicit checkpoints, stronger validation expectations, review-friendly outputs | High-stakes decisions, cross-functional artifacts, anything likely to be challenged |

### Deterministic Routing Confidence Policy

`route_confidence` is computed by rules, not model intuition.

| Level | Rule |
|---|---|
| `HIGH` | Exactly one workflow or skill matches by explicit command/skill name, or by at least 2 exact case-insensitive keyword hits from the routing table, and no blocker is present |
| `MEDIUM` | Exactly one route is favored, but it has only 1 keyword hit or one blocker is present |
| `LOW` | Multiple routes tie, no route has a deterministic win, or mandatory inputs are missing |

For v2, blockers are:

- external research required
- multi-agent chain required
- mandatory input missing from the selected workflow or skill
- explicit audience outside the product team

A `high-confidence obvious ask` is defined as `route_confidence = HIGH` and no auto-escalation trigger firing.

### Routing Rules

#### `Fast`

- Skip the mandatory planning step when all of the following are true:
  - a single workflow or single skill matches with high confidence
  - required inputs are present or can be reasonably inferred
  - no fresh public-web research is required
  - no multi-agent chain is needed
- Ask at most one clarifying question
- Default to the skill or workflow's standard depth unless the user explicitly asks for quicker or deeper treatment
- Do not run adversarial review automatically

#### `Rigorous`

- Present a plan when the task spans workflows, depends on external research, or has material downstream risk
- Require explicit assumptions, evidence gaps, and pass/fail framing
- Recommend or run adversarial review for artifacts tied to budget, roadmap, engineering handoff, or external stakeholder decisions
- Default to standard depth with optional elevation to deep when the user asks for exhaustive scrutiny

### Backward Compatibility

- Existing skill depth tables remain valid
- Existing slash workflows remain callable by name
- Existing direct-skill usage in standalone mode remains valid
- `Fast`/`Rigorous` are orchestration-layer concepts first; skill files may adopt them later if the repo chooses to converge terminology

### Auto-Escalation Triggers

`Fast` must auto-upgrade to `Rigorous` when any of the following are true:

- fresh external research is required
- the artifact recommends a budget, headcount, or roadmap choice
- the output is an engineering handoff artifact or feeds directly into one
- validator output includes any contradiction `error`
- validator output includes 2 or more contradiction `warning` findings
- the stated audience includes leadership, board, sales, customers, or engineering outside the product team

## Artifact Contract

### Canonical Envelope

Each schema-backed artifact uses a shared envelope:

```json
{
  "schema_version": "2.0.0",
  "artifact_type": "prd",
  "mode": "fast",
  "depth": "standard",
  "metadata": {
    "title": "Self-serve SSO PRD",
    "status": "draft",
    "authors": ["PM"],
    "updated_at": "2026-04-02"
  },
  "decision_frame": {
    "recommendation": "Ship SSO for mid-market customers first",
    "tradeoff": "Narrower initial segment vs broader perceived market coverage",
    "confidence": "medium",
    "owner": "PM",
    "decision_date": "2026-04-02",
    "revisit_trigger": "If activation remains below 20% after launch"
  },
  "unknowns": [],
  "pass_fail_readiness": {
    "status": "PASS",
    "reason": "Required sections present and evidence bar met"
  },
  "evidence": [],
  "relationships": [],
  "payload": {}
}
```

### Embedding Convention

When structured output is enabled, the markdown artifact includes a trailing payload block in an HTML comment envelope:

```html
<!-- shipwright:artifact
{ ...json payload... }
-->
```

`scripts/extract-structured-artifact.mjs` will:

1. read the markdown artifact
2. extract the payload
3. validate the JSON shape
4. write `<artifact-basename>.json`

### Authority Model

- Markdown is canonical for human reading, editing, and approval.
- The extracted JSON sidecar is canonical for validation, contradiction checks, automation, and benchmark scoring.
- If markdown and sidecar disagree, Shipwright must fail validation instead of guessing which one is correct.

### Evidence Contract

Every schema-backed artifact must include a non-empty `evidence[]` array unless it is explicitly marked exploratory draft-only.

Each `evidence` item must include:

- `evidence_id`
- `kind` (`metric`, `interview`, `research`, `experiment`, `document`, `assumption`)
- `source_ref`
- `confidence`
- `supports[]`

`supports[]` must reference stable IDs in the artifact payload. For v2, the validator must enforce evidence linkage for:

- decision-frame recommendation
- PRD problem statement and success metrics
- strategy bets
- challenge findings

Any claim without evidence linkage must be explicitly tagged as an assumption or hypothesis.

### Artifact-Specific Payloads

#### PRD payload

Required fields:

- `problem_statement` with `problem_id`
- `customer_evidence_ids[]`
- `success_metrics[]` with `metric_id`, baseline, target when available, and `evidence_ids[]`
- `scope.in`
- `scope.out`
- `open_questions[]`

#### Strategy payload

Required fields:

- `vision`
- `context.current_state`
- `bets[]` with `bet_id`, thesis, assumptions, investment level, success metric, kill criteria, and `evidence_ids[]`
- `boundaries.not_doing[]`
- `review_cadence`

#### Challenge report payload

Required fields:

- `reviewed_artifact`
- `depth`
- `findings[]` with `finding_id`, claim, vector, severity, rationale, resolution condition, and `evidence_ids[]`
- `verdict`
- `action_plan[]`

### Challenge Propagation Contract

Every challenge finding must have:

- `finding_id`
- `severity`
- `resolution_condition`

Any revised artifact that responds to a challenge report must include a `challenge_resolution[]` block with one entry per finding:

- `finding_id`
- `state` (`resolved`, `waived`, `deferred`)
- `note`

Rules:

- `critical` findings with missing state, or `deferred` state, are validator `error`
- `moderate` findings with missing state or `deferred` state are validator `warning`
- `low` findings with missing state are validator `info`
- `waived` requires `waiver_reason` and `owner`

## Validator Design

### Current State

`scripts/validate-artifact.mjs` already checks:

- unsupported dollar figures without citation anchors
- unsupported numeric claims without citation anchors
- missing sections

### New Checks

The validator will add:

1. **Schema presence**
   - warn if a schema-backed artifact is missing a structured payload when one is expected
2. **Schema validity**
   - fail if extracted JSON does not conform to the declared artifact schema
3. **Evidence contract validation**
   - fail if required evidence fields are missing or required claims lack evidence linkage or explicit assumption tags
4. **Decision frame completeness**
   - fail on missing recommendation, owner, or decision date
5. **Pass/fail completeness**
   - fail on missing PASS/FAIL status or missing reason text
6. **Metric contradiction checks**
   - warn when the same named metric appears with materially different baselines or targets in related artifacts without an explanation
7. **Segment contradiction checks**
   - warn when upstream strategy targets one segment and downstream artifacts assume another
8. **Unresolved contradiction flags**
   - fail or warn when contradiction findings have no matching explanation, waiver, deferment, or resolution state
9. **Challenge propagation checks**
   - fail or warn when a revised artifact references a prior challenge report but does not resolve, waive, or defer findings according to severity rules

### Operational Definitions

- `materially different baselines or targets` means the same metric name, segment, unit, and timeframe differ by more than `2` percentage points or `10%` relative for rate metrics, or more than `10%` relative for absolute metrics
- `unresolved contradiction flag` means a finding of type `metric-contradiction`, `segment-contradiction`, or `challenge-finding-unresolved` has no explicit resolution state or explanation
- `time-to-first-usable-artifact`, `revision_count`, and blind-rating normalization are governed by `docs/shipwright-v2-benchmark-scoring-spec.md`

### Contradiction Detection Non-Goals

For v2, contradiction detection will not attempt:

- semantic paraphrase matching across differently worded claims
- fuzzy metric aliasing unless an explicit metric mapping is provided
- inferred stakeholder-conflict detection from tone, framing, or implied disagreement
- freeform reasoning about contradictions that are not represented in structured fields or deterministic text patterns

If a contradiction class requires semantic interpretation rather than explicit structure or deterministic rules, it is out of scope for this cycle.

### Validator CLI

Proposed CLI:

```bash
node scripts/validate-artifact.mjs path/to/artifact.md \
  --artifact-type prd \
  --expect-structured \
  --related docs/strategy.json \
  --related docs/challenge-report.json \
  --format json
```

### Severity Model

| Severity | Meaning | Typical Action |
|---|---|---|
| `error` | Contract broken; artifact should not pass | Rewrite or regenerate |
| `warning` | Quality or consistency risk | Review before shipping |
| `info` | Helpful but non-blocking | Optional cleanup |

## Benchmark Contract

The canonical scoring rules for v2 benchmarks live in `docs/shipwright-v2-benchmark-scoring-spec.md`.

This spec treats the following as hard contract, not interpretation:

- what counts as a usable artifact
- how revision count is measured
- how contradiction count is counted
- how blind human rating is normalized
- what qualifies as materially worse first-pass quality

## Data Model

### New Directories

```text
schemas/
  artifacts/
    prd.schema.json
    strategy.schema.json
    challenge-report.schema.json

benchmarks/
  README.md
  scenarios/
    prd-hidden-scope-creep.json
    pricing-partial-data.json
    board-update-ambiguity.json
    churn-conflicting-signals.json
    feature-weak-evidence.json
    handoff-contradiction.json
  baselines/
  results/
```

### Benchmark Scenario Shape

```json
{
  "id": "prd-hidden-scope-creep",
  "title": "PRD with hidden scope creep",
  "inputs": {
    "prompt": "Write a PRD for ...",
    "context_files": ["examples/..."],
    "expected_artifact_type": "prd",
    "scoring_spec_ref": "docs/shipwright-v2-benchmark-scoring-spec.md"
  },
  "measures": [
    "time_to_first_usable_artifact",
    "revision_count",
    "contradiction_count",
    "blind_human_rating"
  ]
}
```

## Non-Functional Requirements

### Performance

| Metric | Requirement | Measurement Method |
|---|---|---|
| Validator runtime for a single artifact | < 2 seconds for a typical markdown artifact under 5,000 lines | Local benchmark script |
| Sidecar extraction runtime | < 500 ms per artifact | Unit test + local benchmark |
| Benchmark harness summary generation | < 30 seconds for the default 6-scenario suite excluding human review time | CLI timing |

### Reliability

- Validator output must be deterministic for the same inputs
- Missing structured payloads must fail gracefully with actionable messages
- Generated docs must be reproducible from `manifest.json`
- Routing confidence and auto-escalation decisions must be reproducible from the same input text and context

### Security

- No network access required for schema validation, contradiction checks, or doc generation
- Benchmark fixtures must avoid real customer data

### Observability

- Benchmark runs must emit machine-readable result summaries
- Validator failures must include error codes and line references where feasible

## Rollout Plan

### Phase 0: Measurement and Routing Contract

1. Publish the benchmark scoring spec
2. Freeze the routing confidence rubric and auto-escalation triggers
3. Capture baseline benchmark runs using the frozen contract

### Phase 1: Contract First

1. Add schemas for PRD, strategy, and challenge report
2. Add the structured payload extraction helper
3. Extend the validator with schema and evidence checks only

### Phase 2: Behavior Change

1. Update `agents/orchestrator.md`, `commands/start.md`, `AGENTS.md`, and `.codex/skills/shipwright-concierge/SKILL.md`
2. Introduce `Fast` and `Rigorous` routing behavior
3. Remove mandatory planning for high-confidence obvious asks
4. Apply auto-escalation triggers

### Phase 3: Proof and Consistency

1. Add contradiction and challenge-propagation checks
2. Add benchmark scenarios and baseline runs
3. Run blind human review and publish proof outputs

### Phase 4: Optional Stretch

1. Generate high-drift docs from `manifest.json`

### Rollback Plan

- Keep structured payload extraction optional until schemas and validator behavior are stable
- Preserve existing skill depth semantics
- If `Fast` mode creates regressions, default orchestrators back to current planning behavior while leaving validators and benchmarks intact

## Testing Requirements

- [ ] Unit tests for schema validation success and failure cases
- [ ] Unit tests for structured payload extraction from markdown comments
- [ ] Unit tests for evidence linkage validation and missing evidence failures
- [ ] Unit tests for deterministic routing confidence classification
- [ ] Unit tests for `Fast` to `Rigorous` auto-escalation triggers
- [ ] Fixture tests for contradiction detection on named metrics and segment mismatches
- [ ] Fixture tests for challenge finding IDs and resolution states on revised artifacts
- [ ] Snapshot tests for generated docs from `manifest.json`
- [ ] Benchmark harness smoke test for the default 6-scenario suite

## Open Questions

- Should structured payloads be emitted only for saved artifacts, or also for inline artifacts during benchmarked runs?
- Should contradiction detection remain heuristic in v2, or should some checks require explicit relationship metadata between artifacts?

## Decision Frame

Recommendation: implement Shipwright v2 by extending the existing orchestration and validation layers rather than inventing a new runtime surface.
Trade-off: this keeps some transitional complexity in the mode model, but it delivers faster with less migration risk.
Confidence: High, because the proposed design uses the repo's current strengths: markdown portability, deterministic helpers, and explicit artifact contracts.
Decision owner/date: Maintainer / April 2, 2026. Revisit after Phase 2 behavior changes and the first benchmark run.

## Unknowns & Evidence Gaps

- No benchmark baseline has been captured yet, so quantitative target movement is still hypothetical.
- The structured payload embedding convention has not yet been tested with multiple models and tools.
- Contradiction thresholds may still need calibration after the first benchmark pass, even though the initial v2 thresholds are now defined.

## Pass/Fail Readiness

PASS if the first implementation scope stays limited to 3 artifact types, first-pass contradiction classes, and one benchmark suite.
FAIL if this expands into a full taxonomy rewrite or a full repo re-architecture before the validator and benchmark layers are working.

## Recommended Next Artifact

An implementation plan that sequences the first code changes by file, starting with:

1. `schemas/artifacts/*`
2. `scripts/extract-structured-artifact.mjs`
3. `scripts/validate-artifact.mjs`
4. `agents/orchestrator.md` and `commands/start.md`
