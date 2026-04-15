# Technical Specification: Shipwright Cross-Model Conflict Harness

## Metadata

- Related context: `benchmarks/`, `docs/shipwright-v2-benchmark-scoring-spec.md`, `agents/red-team.md`
- Author: Codex with Shipwright frameworks
- Reviewers: Shipwright maintainer, Claude reviewer
- Status: Draft
- Last updated: April 13, 2026

## Context

**What we're building:** A provider-agnostic conflict harness that lets Shipwright run structured adversarial exchanges across model families, starting with Anthropic Claude and OpenAI ChatGPT, instead of relying on the same model family on both sides of a conflict.

**Why (business):** Shipwright's red-team value is weaker when the producer and challenger share the same blind spots, prompt priors, and stylistic habits. A cross-model harness makes challenge results more credible, benchmark outcomes more interesting, and adversarial review less vulnerable to single-family failure modes.

**Why (technical):** The current repo already has benchmark fixtures, scoring conventions, and adversarial-review patterns, but it does not yet define a runtime contract for multi-provider opposition, limited transcript sharing, or blind adjudication. We need a deterministic protocol before adding more models or more elaborate agent topologies.

## Scope

**In scope:**

- Define a reusable harness for structured conflict runs between providers
- Support 3 execution modes:
  - `head_to_head`
  - `coalition_vs_coalition`
  - `swap_test`
- Standardize what is shared across sides:
  - same case packet
  - same rubric
  - committed outputs only
  - critiques only
- Explicitly disallow shared scratchpads, hidden reasoning exchange, and free-form cross-side chat
- Define provider adapter contracts for Anthropic and OpenAI
- Define run, packet, verdict, and transcript shapes suitable for benchmark storage
- Define fairness controls, cost caps, and judge-blinding rules
- Specify how the harness plugs into `benchmarks/` without rewriting the existing scoring spec

**Out of scope:**

- Fine-tuning or training data generation
- Real-time voice, multimodal, or browser-driven conflict sessions
- Unlimited debate loops or open-ended agent swarms
- Replacing human review for high-stakes benchmark publication
- Repo-wide implementation of every file named in this spec

**Assumptions:**

- Provider access is available through stable CLI or subprocess interfaces backed by active subscription plans
- Phase 1 must use Claude Max and ChatGPT Pro style plan access rather than pay-per-token API access
- Early runs are text-first and tool-light
- Judge prompts can be normalized enough to compare outputs fairly
- Provider names can be hidden from judges during scoring
- Benchmark scenarios are a better starting point than live user traffic

## Architecture

### High-Level Design

The harness separates 5 responsibilities: packet construction, side execution, exchange gating, adjudication, and run storage.

```text
[Scenario or case file]
  -> [Case Packet Builder]
  -> [Conflict Runner]
       -> [Side A Adapter] -> first pass
       -> [Side B Adapter] -> first pass
       -> [Exchange Gate]  -> rebuttals
       -> [Revision Gate]  -> final submissions
       -> [Judge Adapter]  -> verdict
  -> [Run Store]
  -> [Benchmark Summary / Review Queue]
```

### Components Affected

| Component | Change Type | Description |
|---|---|---|
| `docs/shipwright-cross-model-conflict-harness-spec.md` | New | This specification |
| `scripts/run-conflict-harness.mjs` | New | CLI entry point for running a conflict session |
| `scripts/score-conflict-run.mjs` | New | Applies rubric scoring and emits a verdict payload |
| `scripts/build-case-packet.mjs` | New | Normalizes scenario input, rubric, role definitions, and round budgets |
| `schemas/conflict-case.schema.json` | New | Validates the shared case packet |
| `schemas/conflict-run.schema.json` | New | Validates per-run metadata and transcript references |
| `schemas/conflict-verdict.schema.json` | New | Validates judge output |
| `benchmarks/scenarios/` | Modify | Allow conflict-mode configuration alongside existing scenario definitions |
| `benchmarks/results/conflict-harness/` | New | Versioned outputs for run transcripts and verdicts |
| `benchmarks/reviews/` | Modify | Optional blind human review packets for tie-breaks or calibration |

### Architecture Decision Records (ADRs)

#### ADR 1: Require independent first-pass submissions before any exchange

- **Context:** If both sides see each other's drafts too early, they quickly converge in style and argument shape, which removes the main reason to run cross-model opposition.
- **Options considered:**
  - Option A: Let sides see each other's prompts and partial drafts in real time
    - Pros: More conversational, may surface faster consensus
    - Cons: High convergence risk, weak provenance, hard-to-score independence
  - Option B: Force each side to commit a first-pass artifact before any exchange
    - Pros: Preserves model diversity signal, cleaner transcript, easier judging
    - Cons: Adds one more protocol step
- **Decision:** Choose Option B.
- **Rationale:** The harness exists to measure disagreement quality and error-finding power, not to optimize for casual collaboration.
- **Consequences:** The runner must support a sealed first-pass phase and store those artifacts separately.

#### ADR 2: Build a provider-agnostic harness, not a hardcoded Claude-vs-ChatGPT feature

- **Context:** The immediate use case is Claude vs ChatGPT, but the durable value is a framework that can compare any pair or coalition of providers.
- **Options considered:**
  - Option A: Hardcode `anthropic` and `openai` as named sides
    - Pros: Fastest short-term implementation
    - Cons: Brittle, leaks provider semantics into scoring and storage
  - Option B: Use generic side bindings backed by provider adapters
    - Pros: Extensible, easier to benchmark new model families later
    - Cons: Slightly more abstraction upfront
- **Decision:** Choose Option B.
- **Rationale:** The repo should learn a reusable harness pattern, not a one-off rivalry script.
- **Consequences:** Provider-specific logic lives behind adapters, while run protocols stay neutral. In Phase 1 those adapters are CLI/subprocess wrappers over subscription plans, not SDK clients.

#### ADR 3: Share committed outputs and critiques, but never hidden reasoning

- **Context:** The user wants the models to share inputs and outputs. Sharing the same case packet is useful; sharing chain-of-thought or hidden scratchpads is not.
- **Options considered:**
  - Option A: Share all intermediate reasoning across sides
    - Pros: Maximum context transfer
    - Cons: Collapses independence, increases leakage risk, muddies attribution
  - Option B: Share only case packets, committed artifacts, and explicit critiques
    - Pros: Keeps the exchange legible and adversarial
    - Cons: Less collaborative synthesis
- **Decision:** Choose Option B.
- **Rationale:** The harness needs auditable disagreement, not merged cognition.
- **Consequences:** Prompts must forbid internal reasoning disclosure, and transcript storage must capture only user-visible artifacts.

#### ADR 4: Blind the judge to side labels, acknowledge family bias, and support optional role swap

- **Context:** A single judge can introduce provider affinity bias. Side-label blinding helps, but it does not fully remove model-family bias when the judge shares a family with one competitor. A role swap catches prompt-side bias and some judge overfitting.
- **Options considered:**
  - Option A: Judge once with visible provider labels
    - Pros: Simple
    - Cons: Easy bias leakage
  - Option B: Judge with `Side A` / `Side B` labels, document family-bias limits honestly, and optionally rerun with role assignments swapped
    - Pros: Better fairness signal, compatible with current provider availability
    - Cons: Higher cost and latency
- **Decision:** Choose Option B.
- **Rationale:** Side-label blindness and swap stability are cheap compared to publishing a bad conclusion with false confidence, but the spec must stay honest that v1 is not fully family-blind.
- **Consequences:** The run schema must track provider identity separately from the judge-facing transcript labels, and Phase 2 must include alternate-judge calibration before published benchmark claims rely on single-judge confidence.

## Conflict Modes

| Mode | Description | Best For | Default Round Budget |
|---|---|---|---|
| `head_to_head` | One provider-backed side vs one provider-backed side | Early harness validation, benchmark scenarios, low-cost runs | `first_pass -> rebuttal -> final -> verdict` |
| `coalition_vs_coalition` | Each side has a `lead` and `wing` model; the side emits one shared submission | Harder scenarios where intra-side critique is valuable | `internal draft -> side merge -> rebuttal -> final -> verdict` |
| `swap_test` | Reruns the same case with side labels or role framing swapped | Bias detection and robustness checks | Same as parent mode plus one rerun |

### Mode Rules

#### `head_to_head`

- Both sides receive the same case packet at the same time
- Neither side sees the other side until both first-pass artifacts are committed
- Each side gets exactly one rebuttal and one final revision unless the run config explicitly raises the cap

#### `coalition_vs_coalition`

- Each side contains:
  - one `lead` model
  - one `wing` model
- `lead` and `wing` receive the same side-specific role packet
- `lead` and `wing` produce independent internal drafts
- The side merger step produces exactly one committed side artifact
- The opposing side never sees the internal drafts; it sees only the merged side artifact

#### `swap_test`

- Reuse the same scenario, rubric, and round budget
- Swap one of:
  - side labels
  - proposer/challenger framing
  - lead/wing role order in coalition mode
- Treat a materially different verdict as a calibration warning, not as an automatic failure
- `materially_different_swap_result` is `true` when the winner changes or `abs(primary.margin - swap.margin) >= 0.20`

## Conflict Protocol

### Shared Packet Types

#### Case Packet

The same packet is sent to every side in the run.

Required fields:

- `scenario_id`
- `prompt`
- `artifact_type`
- `rubric`
- `constraints`
- `evidence`
- `max_rounds`
- `tool_policy`
- `sharing_policy`
- `success_condition`

#### Committed Artifact Packet

One visible artifact per side per visible round:

- `run_id`
- `side_id`
- `round`
- `artifact_markdown`
- `claims` - array of claim objects: `{ claim_id, summary, evidence_refs, is_major }`
- `citations`
- `open_questions`
- `critique_responses` - required in `final` round: array of `{ finding_id, disposition, rationale }`

#### Critique Packet

Explicit attack surface only:

- `target_side`
- `finding_id` - runner-assigned sequential ID within the run
- `target_claim_ids`
- `claim_under_attack`
- `attack_type`
- `evidence_or_reason`
- `severity`

#### Verdict Packet

- `winner`
- `margin`
- `rubric_scores`
- `decisive_findings`
- `judge_confidence` - enum: `high` | `medium` | `low`
- `needs_human_review`

### Sharing Policy

The default policy is deliberately narrow:

- **Shared with all sides:** case packet, rubric, public evidence, final visible outputs
- **Shared only after first-pass commit:** committed artifacts
- **Shared only after critique stage opens:** critique packets
- **Never shared across sides:** hidden reasoning, draft fragments, token logs, provider names, internal coalition drafts

### Identity Leakage Handling

Identity leakage is treated as a best-effort containment problem, not a solved guarantee.

- The runner performs a post-processing scan on every visible artifact before exchange-gate reveal and before judge-packet construction
- Minimum v1 detection is explicit string/pattern matching for self-identification phrases such as:
  - `I am Claude`
  - `As an OpenAI model`
  - `As ChatGPT`
  - `Anthropic`
  - `OpenAI`
- If explicit identity leakage is detected before reveal:
  - issue one repair retry with a prompt to remove provider self-identification
  - if the retry still leaks, log `identity_leak_warning`, preserve the original transcript, and redact explicit provider strings from the judge-facing packet only
- Style leakage, refusal-style leakage, or family-inference from prose remains an acknowledged v1 limitation and is not grounds for automatic run failure
- Referencing unseen opponent content is a separate protocol violation:
  - one repair retry is allowed
  - a second failure ends the run with `status = "protocol_violation"`

### Round Sequence

#### Step 0: Run initialization

- Materialize `run_id`
- Freeze model versions, side bindings, rubric version, and round limits
- Build the common case packet
- Validate against `schemas/conflict-case.schema.json`

#### Step 1: Independent first pass

- Send case packet to each side
- Collect one committed artifact from each side
- Apply the identity leakage policy before reveal
- Reject or retry responses that reference unseen opponent content according to the protocol-violation rule

#### Step 2: Exchange gate

- Reveal only the committed first-pass artifacts
- Label them `Side A` and `Side B`
- Do not expose provider or coalition composition

#### Step 3: Rebuttal round

- Each side emits one critique packet against the other
- Critiques must reference visible claims, not guessed internal reasoning

#### Step 4: Final revision

- Each side may revise once in response to visible critiques
- Final revision must either:
  - incorporate the critique, or
  - explicitly reject it with evidence or reasoning

#### Step 5: Adjudication

- Judge sees:
  - case packet
  - first-pass artifacts
  - critique packets
  - final artifacts
- Judge packet must include the configured `budgets.min_margin_for_verdict`
- Judge returns verdict packet only
- Judge prompt forbids provider inference and hidden-reasoning requests

#### Step 6: Optional swap rerun

- Re-execute the run with swapped framing
- Compare winner, margin, decisive findings, and score spread

### Hard Limits

- Default visible rounds: `3`
- Default critique count per side: `1`
- Default final revision count per side: `1`
- Default time budget per model turn: `120s`
- Default response budget per visible turn: `4,000` output tokens
- Runs exceeding configured cost caps terminate according to the Budget Enforcement Rules section: `budget_exhausted` after a cleanly completed visible phase, or `budget_exhausted_no_verdict` when reserved adjudication budget is insufficient

### Budget Enforcement Rules

- Budget fairness is enforced at phase boundaries, not after each individual side turn
- If Side A completes a turn that pushes estimated spend over budget, Side B still receives the matching turn for that phase
- After all sides complete the current phase, the runner evaluates:
  - whether another visible phase may begin
  - whether reserved judge budget remains for adjudication
- If the run exceeds budget after a completed visible phase, terminate with `status = "budget_exhausted"` and do not start the next phase
- If visible phases complete but the remaining reserved budget is insufficient for adjudication, terminate with `status = "budget_exhausted_no_verdict"`
- No verdict may be emitted from an asymmetric partially completed phase

## Adapter Contract

### Provider Adapter Interface

```typescript
export interface ConflictModelAdapter {
  provider: 'anthropic' | 'openai' | string;
  model: string;
  invoke(request: ConflictTurnRequest): Promise<ConflictTurnResponse>;
}

export interface ConflictTurnRequest {
  runId: string;
  sideId: string;
  phase: 'first_pass' | 'rebuttal' | 'final' | 'judge';
  packet: object;
  prompt: string;
  maxOutputTokens: number;
  timeoutMs: number;
  temperature: number;
  toolPolicy: 'none' | 'symmetric';
}

export interface ConflictTurnResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd?: number;
  };
  latencyMs: number;
  stopReason: string;
  rawProviderResponsePath: string;
}
```

### Adapter Requirements

- Phase 1 adapters must use CLI or subprocess invocation against subscription-plan access, not API SDK calls
- Normalize timeout handling and error surfaces
- Emit token and latency accounting in a common shape
- Treat `estimatedCostUsd` as optional; subscription-mode runs may omit it or set it to `0`
- Record provider/model metadata in the run store, but not in the judge packet
- Support `toolPolicy = none` first; defer richer tool symmetry until after text-only validation

### Subscription-Mode Execution

Phase 1 uses subscription-backed local tooling rather than pay-per-token APIs.

- **Claude side:** invoke the local `claude` CLI in non-interactive single-turn mode
- **GPT side:** invoke the local ChatGPT/Codex-compatible CLI or subprocess entry point tied to the user's GPT Pro access
- **Timeouts:** enforced at the subprocess level, not HTTP request level
- **Rate limiting:** treated as local CLI or subscription concurrency behavior, not API header parsing
- **Usage accounting:** best-effort only; token counts and estimated cost may be missing from CLI outputs

The abstract adapter interface remains unchanged so API-backed adapters can exist later, but Phase 1 implementation must not require API keys or usage-based billing.

## Data Model

### Run Record Shape

```json
{
  "run_id": "conflict-2026-04-13T181500Z-prd-hidden-scope-creep",
  "scenario_id": "prd-hidden-scope-creep",
  "mode": "head_to_head",
  "status": "completed",
  "sides": {
    "side_a": {
      "provider": "openai",
      "model": "<competitor-model-slug>",
      "access_mode": "subscription_cli",
      "role": "challenger"
    },
    "side_b": {
      "provider": "anthropic",
      "model": "<competitor-model-slug>",
      "access_mode": "subscription_cli",
      "role": "proposer"
    }
  },
  "judge": {
    "provider": "<judge-provider>",
    "model": "<judge-model-slug>",
    "access_mode": "subscription_cli",
    "blind_labels": true,
    "family_blind": false,
    "selection_policy": "rotating_batch_judge"
  },
  "budgets": {
    "max_visible_rounds": 3,
    "max_cost_usd": 12,
    "max_latency_ms": 360000,
    "min_margin_for_verdict": 0.10
  },
  "results": {
    "winner": "side_b",
    "margin": 0.14,
    "judge_confidence": "medium",
    "swap_stable": true,
    "needs_human_review": false
  },
  "metrics": {
    "disagreement_rate": 0.43,
    "unsupported_claim_count": 1,
    "self_contradiction_count": 0,
    "total_estimated_cost_usd": 0
  }
}
```

### Transcript Layout

```text
benchmarks/results/conflict-harness/<scenario_id>/<run_id>/
  config.json
  case-packet.json
  state.json
  run.json
  side-a/
    first-pass.md
    rebuttal.md
    final.md
  side-b/
    first-pass.md
    rebuttal.md
    final.md
  judge/
    verdict.json
    verdict.md
  swap-test/
    run.json
    judge-verdict.json
  review/
    blind-review-packet.md
```

### Derived Metrics

The harness should compute these after every completed run:

- `disagreement_rate`: for each side, the fraction of `claims[].claim_id` with `is_major = true` in that side's first-pass artifact that are referenced by at least one opposing `target_claim_ids`; the run-level value is the mean of the two side-level rates
- `adopted_critique_rate`: fraction of critique `finding_id`s whose final `critique_responses[].disposition = "adopted"`
- `unsupported_claim_count`: visible claims without evidence support where support was required
- `swap_stability`: boolean plus margin delta across swapped reruns; `false` when the winner changes or `abs(primary.margin - swap.margin) >= 0.20`
- `judge_margin`: score difference between winner and loser
- `cost_per_resolved_run`: total estimated cost divided by runs that end with a non-tie verdict; subscription CLI runs may record `0`

## Adjudication Contract

### Judging Rules

- Judge sees only `Side A` and `Side B`
- Judge scores against the same rubric for both sides
- Judge must return a structured verdict even when the result is a tie
- Side-label blinding is required, but family-blindness is not guaranteed in v1 when the judge shares a model family with a competitor
- Published batch conclusions must either:
  - rotate judge family across runs, or
  - include alternate-judge calibration runs in Phase 2 before treating single-judge verdicts as strong evidence
- The judge prompt for a swap rerun must be structurally identical to the primary run prompt and must not mention swap framing, prior results, or rerun status
- Judge may set `needs_human_review = true` when:
  - score margin is below `budgets.min_margin_for_verdict`
  - both sides have material unsupported claims
  - swap rerun is materially different

### Rubric Dimensions

Default rubric dimensions:

- `claim quality`
- `evidence discipline`
- `responsiveness to critique`
- `internal consistency`
- `decision usefulness`

Each dimension is scored `1` to `5`. The verdict packet stores:

- raw scores by dimension
- weighted total
- decisive findings
- one-paragraph rationale

`judge_confidence` must use this enum and derivation rule:

- `high`: the winning side is clearly stronger on at least 3 rubric dimensions and has no major unsupported-claim problem
- `medium`: the winning side leads overall but has at least 1 weak dimension or absorbed only part of the opposing critique
- `low`: score margin is below `budgets.min_margin_for_verdict` or both sides have significant unsupported claims

The judge prompt must include this confidence rubric so the field is derived rather than improvised.

`judge_confidence` is a decisiveness signal for the current verdict, not a substitute for inter-rater reliability. Until Phase 2 calibration is complete, published benchmark summaries must treat it as advisory only.

### Blind Review Fallback

If `needs_human_review = true`, emit a stripped packet for `benchmarks/reviews/` with:

- scenario text
- rubric
- visible artifacts
- verdict packet without provider metadata

## Fairness and Safety Controls

### Fairness Controls

- Same case packet for every visible side
- Same visible output budget per side unless the mode explicitly says otherwise
- Same temperature by default
- Provider names hidden from judges
- Role-swap rerun available on the same scenario
- No side may use tools unless tool access is symmetric and logged
- Budget checks happen only at phase boundaries so both sides complete the same visible phase before termination
- Subscription-mode execution must not silently favor one side through richer local integration; if one side requires a local CLI wrapper, the other side must also run through a subprocess adapter rather than an API client

### Safety Controls

- Do not request or store hidden chain-of-thought
- Redact secrets from raw provider responses before long-term storage
- Fail closed on malformed packet schemas
- Reject final outputs that reference non-visible internal drafts

### Known Failure Modes and Mitigations

| Failure Mode | Risk | Control |
|---|---|---|
| Convergence after exchange | Both sides drift toward the same answer | Seal first pass; share only committed artifacts |
| Judge family affinity | A judge prefers outputs from its own model family even with hidden side labels | Treat v1 as label-blind only; rotate judge family or run alternate-judge calibration in Phase 2 |
| Judge monoculture | Winner reflects one judge's preferences more than argument quality | Blind labels; optional alternate judge; swap test |
| Tool asymmetry | One provider wins because it had better tool access | Default `toolPolicy = none`; require symmetry before enabling tools |
| Provider verbosity bias | Longer answers win despite weaker reasoning | Normalize token caps; score by rubric, not length |
| Identity leakage | Explicit self-identification contaminates blind judging | Best-effort string scan, one repair retry, judge-packet redaction, logged warning |
| Coalition leakage | Internal drafts leak to the opposing side | Expose only merged side artifacts |
| Prompt overfitting | Harness rewards style matched to one judge prompt | Rotate judges in calibration runs; compare against blind human review |

## Non-Functional Requirements

### Performance

| Metric | Requirement | Measurement Method |
|---|---|---|
| Head-to-head completion time (p95) | < 3 minutes | Runner telemetry |
| Coalition run completion time (p95) | < 6 minutes | Runner telemetry |
| Run store write success | 100% or fail closed | File write + schema validation |
| Judge packet generation failure rate | < 1% | Run status logs |

### Scalability

- Must support batch execution across existing benchmark scenarios
- Initial target: 20 sequential runs without manual cleanup
- Parallelism is optional in v1; correctness beats throughput

### Reliability

- Every run is resumable from the last completed phase
- Partial runs must still persist packet artifacts and failure reason
- A provider timeout on one side does not erase the other side's transcript
- `state.json` must record at least `{ run_id, last_completed_phase, next_action, status }`

### Observability

- Log per-turn latency, token counts, and estimated cost
- Log schema validation failures with packet path and phase
- Emit a per-run summary markdown file for human review
- When CLI tooling does not expose token or cost data, persist `null` or `0` rather than inventing estimates

## Rollout Plan

### Phase 1: Text-only head-to-head pilot

- Implement `head_to_head`
- Run on 3 existing benchmark scenarios
- Use one blind judge and manual transcript review
- Keep tools disabled

### Phase 2: Swap stability and scoring hardening

- Add `swap_test`
- Add `needs_human_review` thresholds
- Compare judge verdicts against blinded human review on a small sample
- Run alternate-judge calibration on at least one scenario per batch and record judge agreement rate before publishing benchmark conclusions

### Phase 3: Coalition mode

- Add `lead` / `wing` side structure
- Enforce merged side artifacts
- Measure whether coalition mode improves critique adoption without collapsing disagreement

### Feature Flags

| Flag | Description | Default |
|---|---|---|
| `CONFLICT_HARNESS_ENABLED` | Enables the runner entry point | Off |
| `CONFLICT_SWAP_TEST_ENABLED` | Enables optional reruns with swapped framing | Off |
| `CONFLICT_COALITION_MODE_ENABLED` | Enables coalition-vs-coalition runs | Off |

### Rollback

- Disable all conflict harness flags
- Preserve stored transcripts for audit
- Fall back to current single-family adversarial workflows until calibration issues are resolved

## Decision Frame
- **Recommendation:** Build the harness as a provider-agnostic, sealed-first-pass conflict runtime with Claude and ChatGPT as the first adapters, not as a free-form shared-chat experiment.
- **Trade-off:** We give up some spontaneity and conversational richness in exchange for cleaner attribution, stronger disagreement signals, and fairer scoring.
- **Confidence:** Medium - the protocol is technically straightforward and fits the repo's benchmark shape, but coalition mode and judge calibration still need empirical proof.
- **Owner:** Shipwright maintainer
- **Decision Date:** 2026-04-13
- **Revisit Trigger:** Revisit if pilot runs show low disagreement, unstable swap results, or judge-human disagreement above the accepted calibration threshold.

## Unknowns & Evidence Gaps

- Whether `coalition_vs_coalition` outperforms simpler `head_to_head` on real benchmark scenarios
- Whether one judge family produces meaningfully different verdicts than another on the same transcripts
- Coalition merge mechanism - model call, deterministic merge, or human editorial step - is not yet defined and must be resolved before Phase 3 design
- What score-margin threshold best predicts when a human tie-break is necessary
- Whether provider-specific tokenization or response-shaping quirks distort fairness even under equal token caps

## Pass/Fail Readiness

PASS if the first implementation can run a blinded `head_to_head` session on at least 3 benchmark scenarios, persist structured transcripts, and produce a verdict packet with stable schema validation; at Light depth, PASS requires only the protocol, schemas, and transcript layout to be defined in one reviewable spec. FAIL if the design still relies on shared hidden reasoning, exposes provider names to judges, or leaves visible-round limits unspecified.

## Recommended Next Artifact

Create a Phase 1 implementation plan that turns this spec into:

- `schemas/conflict-case.schema.json`
- `schemas/conflict-run.schema.json`
- `schemas/conflict-verdict.schema.json`
- `scripts/build-case-packet.mjs`
- `scripts/run-conflict-harness.mjs`
