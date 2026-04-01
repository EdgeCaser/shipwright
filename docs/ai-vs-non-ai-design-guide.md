# AI vs Non-AI Design Guide

This document is the working rulebook for future Shipwright performance and reliability work.

The goal is not to remove AI from Shipwright. The goal is to use AI where it adds judgment, and use deterministic code where it removes latency, cost, and failure risk.

## Core rule of thumb

Use non-AI systems for work that is:

- deterministic
- repetitive
- I/O-heavy
- parallelizable
- easy to validate mechanically
- cheap to cache and reuse
- primarily about moving or reshaping data

Use AI for work that is:

- ambiguous
- judgment-heavy
- dependent on trade-offs
- sensitive to context and audience
- about reconciling conflicting evidence
- about deciding what matters most
- about producing a final narrative or recommendation

The shortest version:

```text
Non-AI for retrieval, extraction, normalization, validation.
AI for synthesis, prioritization, trade-offs, and story.
```

If a step sits on the boundary, ask this:

```text
Can we score the output mechanically?
```

If the answer is yes, prefer a deterministic helper first.

## Shipwright design principles

Any future acceleration work should preserve these principles:

- Keep the UX conversational. PMs should not have to think about the plumbing.
- Push deterministic work behind the scenes. The system should feel simpler, not more procedural.
- Emit structured intermediate artifacts. Prefer `json` or compact `md` over raw page dumps.
- Fail soft. Helpers should return bounded follow-up guidance instead of crashing.
- Prefer partial answers with explicit gaps over exhaustive runs that time out.
- Cache and reuse wherever possible. Repeated prompts should not repeat the same retrieval work.
- Keep each run to one primary deliverable. Research, synthesis, and packaging should be separable phases.

## What should stay AI

These are good AI jobs and should remain agentic by default:

- deciding which evidence matters most
- reconciling conflicting sources
- weighing strategic trade-offs
- choosing a recommendation under ambiguity
- framing a memo for a specific audience
- identifying implications, risks, and second-order effects
- turning structured facts into a coherent narrative

Do not try to replace these with rules engines unless the problem has become narrow enough to be scored deterministically.

## Best bets

These are the highest-leverage non-AI opportunities for Shipwright.

### 1. Retrieval and extraction

Programmatic search, fetch, readability extraction, deduping, and metadata capture should stay outside the model whenever possible.

Why it matters:

- reduces tool-call count
- parallelizes network work
- lowers token burn on raw pages
- shrinks timeout risk on research-heavy runs

Current example:

- `scripts/collect-research.mjs`

### 2. Structured evidence and facts

Instead of handing the model raw pages, produce compact machine-readable artifacts such as:

- `evidence.json`
- `facts.json`
- `pricing.json`
- `reviews.json`

Useful fields:

- source URL
- title
- publish date
- company
- product
- price
- plan name
- review count
- confidence hint
- extraction timestamp

Why it matters:

- makes synthesis faster
- makes validation possible
- makes downstream tools reusable

### 3. Marketplace and vendor adapters

Many sources Shipwright cares about are highly structured:

- Unity Asset Store
- Fab / Unreal Marketplace
- pricing pages
- docs pages
- app stores
- trade publication templates

These are often better served by small parsers or field extractors than by repeated AI reads.

### 4. Output scaffolding

Document skeletons, section ordering, table shells, and appendix structures should be generated deterministically.

AI should fill in reasoning, not burn tokens on boilerplate.

### 5. Validation and linting

Many Shipwright quality checks are deterministic:

- missing citations
- missing confidence tags
- missing Shipwright Signature sections
- stale dates
- unsupported dollar figures
- contradictory claims
- output sections out of order

These should be checked mechanically before asking AI to revise.

### 6. Caching

Cache by:

- query
- provider
- fetched URL
- extraction timestamp
- normalized fact payload

Why it matters:

- repeated work gets cheaper
- retries become faster
- broad prompts can reuse prior evidence packs

### 7. Resume and checkpointing

Long workflows should save phase outputs so the system can restart from:

- research complete
- synthesis complete
- validation failed

instead of restarting the entire run.

## Impact layers

These layers are the recommended order for future system improvement.

### Layer 1: Retrieval offload

Move public-web retrieval into scripts and adapters.

Expected impact:

- highest immediate timeout reduction
- fewer interactive search calls
- better parallelism

Examples:

- `collect-research.mjs`
- marketplace search helpers
- official-page fetchers

### Layer 2: Fact normalization

Turn retrieved material into stable structured facts.

Expected impact:

- smaller prompts
- less hallucination pressure
- easier validation

Examples:

- pricing extractors
- acquisition event extractors
- competitor matrix builders

### Layer 3: Workflow splitting

Automatically separate research, synthesis, and packaging into distinct phases.

Expected impact:

- lower timeout risk on broad requests
- easier retries
- clearer progress reporting

Examples:

- research pass first
- strategy memo second
- polished export third

### Layer 4: Deterministic postflight

Run linting and readiness checks before or after AI synthesis.

Expected impact:

- fewer wasted retries
- more stable artifact quality
- cheaper fixes

Examples:

- citation checker
- confidence-tag checker
- signature checker

### Layer 5: Cache and resume

Persist outputs so expensive work is not repeated.

Expected impact:

- biggest medium-term speed gain
- better reliability for large jobs
- better UX for iterative refinement

## Good non-AI candidates by workflow

These are especially strong places to add deterministic helpers.

### `/market-sizing`

- formula engine
- assumption table scaffolding
- source register generation
- top-down and bottom-up math templates

### `/competitive`

- competitor matrix builder
- pricing-page parser
- feature table normalizer
- acquisition and funding timeline collector

### `/pricing`

- plan and package extraction
- pricing diff across competitors
- seat and usage model normalizer
- historical pricing snapshot cache

### `/customer-review`

- review ingestion
- deduping
- sentiment pre-bucketing
- theme counts
- date and segment slicing

### `/challenge`

- claim-to-citation checker
- unsupported-number checker
- contradiction detector
- missing-risk-section checker

### `/status`

- artifact inventory
- freshness check
- missing dependency detection
- changed-source summary

### `/quality-check`

- signature linting
- structure validation
- confidence-tag coverage
- citation presence and formatting

### `/tech-handoff`

- section completeness checker
- acceptance-criteria linting
- dependency extraction
- epic/story count sanity checks

## Architecture pattern to prefer

The default system pattern should be:

1. Deterministic preflight classifies the request.
2. Deterministic helpers gather and normalize evidence.
3. AI synthesizes from compact structured artifacts.
4. Deterministic postflight validates the output.
5. AI revises only if validation or judgment gaps remain.

This is the target shape for research-heavy flows.

## Practical heuristics for future sessions

If a future session is trying to reduce timeout risk, follow this order:

1. Remove unnecessary orchestration before tuning prompts.
2. Offload retrieval and extraction before asking the model to search more efficiently.
3. Split broad prompts into phases before increasing budgets.
4. Add structured intermediate artifacts before asking for longer model outputs.
5. Add validation before adding more review agents.
6. Make every helper fail soft before shipping it.

## Anti-patterns to avoid

- Do not dump raw webpages into the model if a compact evidence pack would do.
- Do not ask one run to do research, synthesis, formatting, and file-writing unless that is truly necessary.
- Do not use AI to scrape fields from predictable pages when a parser can do it.
- Do not add recursive orchestration when a deterministic pre-step would solve the bottleneck.
- Do not make provider setup mandatory for basic usability if a graceful fallback is possible.
- Do not hide evidence gaps. Surface them explicitly.

## Recommended next implementation steps

If Shipwright continues investing in this direction, the next highest-value additions are:

1. Research cache keyed by query plus provider plus freshness window.
2. Structured fact extractor for prices, dates, review counts, acquisitions, and product names.
3. Citation and signature validator for final artifacts.
4. Source adapters for high-value structured sites like Unity Asset Store, Fab, and major vendor pricing pages.
5. Checkpoint and resume support for multi-phase runs.

## Success metrics

Use these to judge whether the architecture is improving:

- median wall-clock time for web-heavy runs
- timeout rate
- average tool calls per research run
- average number of raw `WebSearch` and `WebFetch` calls after helper use
- cache hit rate
- time to first useful answer
- percent of runs that end with explicit evidence gaps instead of timeout

## Current working default

Until a better pattern replaces it, this should be the default Shipwright stance:

- deterministic helpers should do retrieval first
- helpers should return structured artifacts, not final judgments
- AI should synthesize from those artifacts
- interactive browsing should be a fallback, not the first move
- all fallback paths should stay usable even when optional configuration is missing

