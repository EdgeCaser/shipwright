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

## Architecture pattern to prefer

The default system pattern should be:

1. Deterministic preflight classifies the request.
2. Deterministic helpers gather and normalize evidence.
3. AI synthesizes from compact structured artifacts.
4. Deterministic postflight validates the output.
5. AI revises only if validation or judgment gaps remain.

This is the target shape for research-heavy flows.

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

## Highest-leverage deterministic work

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

### 3. Structured-source adapters

Many sources Shipwright cares about are highly structured:

- package registries (npm, PyPI, crates.io)
- Unity Asset Store
- Fab / Unreal Marketplace
- pricing pages
- docs pages
- app stores
- trade publication templates

These are often better served by small parsers or field extractors than by repeated AI reads.

### 4. Output scaffolding and validation

Document skeletons, section ordering, table shells, and appendix structures should be generated deterministically.

AI should fill in reasoning, not burn tokens on boilerplate.

Many Shipwright quality checks are deterministic:

- missing citations
- missing confidence tags
- missing Shipwright Signature sections
- stale dates
- unsupported dollar figures
- contradictory claims
- output sections out of order

These should be checked mechanically before asking AI to revise.

### 5. Caching and reuse

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

### 6. Resume and checkpointing

Long workflows should save phase outputs so the system can restart from:

- research complete
- synthesis complete
- validation failed

instead of restarting the entire run.

For workflow-specific helper ideas and backlog items, see [Deterministic Helpers Roadmap](deterministic-helpers-roadmap.md).

## Recommended order of investment

These layers are the recommended order for future system improvement.

1. Retrieval offload: highest immediate timeout reduction, fewer interactive search calls, better parallelism.
2. Fact normalization: smaller prompts, less hallucination pressure, easier validation.
3. Workflow splitting: lower timeout risk on broad asks, easier retries, clearer progress reporting.
4. Deterministic postflight: fewer wasted retries, more stable artifact quality, cheaper fixes.
5. Cache and resume: biggest medium-term speed gain, better reliability for iterative refinement.

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

## Success metrics

Use these to judge whether the architecture is improving:

- median wall-clock time for web-heavy runs
- timeout rate
- average tool calls per research run
- average number of raw `WebSearch` and `WebFetch` calls after helper use
- cache hit rate
- time to first useful answer
- percent of runs that end with explicit evidence gaps instead of timeout

## Roadmap and backlog

For workflow-specific helper candidates and the current deterministic-helper backlog, see [Deterministic Helpers Roadmap](deterministic-helpers-roadmap.md).

## Current working default

Until a better pattern replaces it, this should be the default Shipwright stance:

- deterministic helpers should do retrieval first
- helpers should return structured artifacts, not final judgments
- AI should synthesize from those artifacts
- interactive browsing should be a fallback, not the first move
- all fallback paths should stay usable even when optional configuration is missing
