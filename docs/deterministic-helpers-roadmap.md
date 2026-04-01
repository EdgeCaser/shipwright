# Deterministic Helpers Roadmap

This document holds the implementation backlog and workflow-specific idea inventory that sits behind the higher-level guidance in [AI vs Non-AI Design Guide](ai-vs-non-ai-design-guide.md).

Use the design guide for architectural decisions. Use this document for candidate helpers, sequencing, and future implementation work.

## Current foundation

Shipwright now has a collector-level research cache in `scripts/collect-research.mjs`:

- keyed by normalized query, provider plan, mode, and major retrieval settings
- stored under `.shipwright/cache/research/v1/`
- reused within a freshness window instead of recollecting identical evidence
- designed to fail soft when the cache is missing, stale, corrupt, or not writable
- emits a collector-layer `facts.json` sidecar with atomic, source-attributed pricing/product/date facts when extraction is deterministic enough to support them

## Near-term implementation backlog

If Shipwright continues investing in deterministic acceleration, the next highest-value additions are:

1. Broaden the structured fact extractor beyond the v1 pricing/product/date field set into review counts, acquisitions, and richer pricing/page adapters.
2. Citation and signature validator for final artifacts.
3. Source adapters for high-value structured sites like Unity Asset Store, Fab, and major vendor pricing pages.
4. Checkpoint and resume support for multi-phase runs.

## Workflow-specific candidates

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
