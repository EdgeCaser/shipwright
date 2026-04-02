# Deterministic Helpers Roadmap

This document holds the implementation backlog and workflow-specific idea inventory that sits behind the higher-level guidance in [AI vs Non-AI Design Guide](ai-vs-non-ai-design-guide.md).

Use the design guide for architectural decisions. Use this document for candidate helpers, sequencing, and future implementation work.

## Current foundation

Shipwright now has a collector-level research cache in `scripts/collect-research.mjs`:

- keyed by normalized query, provider plan, mode, and major retrieval settings
- stored under `.shipwright/cache/research/v1/`
- reused within a freshness window instead of recollecting identical evidence
- designed to fail soft when the cache is missing, stale, corrupt, or not writable
- emits a collector-layer `facts.json` sidecar with atomic, source-attributed facts when extraction is deterministic enough to support them

### facts.json fields (current)

| Field | Source | Confidence |
|---|---|---|
| `company` | page title pattern | high/medium |
| `product` | page title pattern | high |
| `plan_name` | pricing text pattern | high/medium |
| `price` | pricing text pattern + JSON-LD | high/medium |
| `currency` | pricing text pattern + JSON-LD | high/medium |
| `billing_period` | pricing text pattern | high/medium |
| `published_or_observed_date` | result.published field | high/medium |
| `product_name` | JSON-LD Product/SoftwareApplication | high |
| `star_rating` | JSON-LD AggregateRating; text patterns | high/medium |
| `review_count` | JSON-LD AggregateRating; text patterns | high/medium |
| `weekly_downloads` | npm page HTML (SSR'd) | medium |
| `version` | npm page HTML / JSON-LD | high/medium |
| `acquisition_event` | text patterns (active/passive voice) | medium |
| `acquisition_date` | year near acquisition mention | medium |
| `acquirer` | text patterns | medium |
| `acquired_company` | text patterns | medium |
| `funding_event` | text patterns (raised/Series/Seed) | medium |
| `supported_platform` | "available for / supports" context | medium |

### Source adapters (`scripts/source-adapters.mjs`)

A new adapter module runs against the raw HTML body during page fetch, before it
is discarded, and writes structured fields to `result.adapterData`:

- **JSON-LD adapter** — extracts Product/SoftwareApplication/AggregateRating/Offer
  schema data from `<script type="application/ld+json">` blocks. Covers pricing
  pages, review aggregators, and product pages that use schema.org markup.
- **npm adapter** — extracts weekly download count and version from npmjs.com
  package pages (server-rendered, stable structure).

The adapter module loads lazily from `collect-research.mjs`. If the file is
missing on a partial deployment, the collector continues without adapters (fail soft).

### Postflight validator (`scripts/validate-artifact.mjs`)

A deterministic validator for Shipwright markdown artifacts:

- `unsupported-dollar` — dollar figures in prose without a nearby citation marker
- `unsupported-numeric` — percentage or large-number claims without citation
- `missing-section` — expected section headings absent from the document

Citation shortcut: if the document has a `## Sources` / `## References` /
`## Evidence` section, paragraph-level citation checks are skipped.

CLI: `node scripts/validate-artifact.mjs path/to/artifact.md --expect-sections "Sources,Risks"`

Wired into:
- `adversarial-review/SKILL.md` — Pre-Check step before manual review begins
- `artifact-quality-audit/SKILL.md` — Step 1b pre-pass to floor Correctness scoring

### Facts formatter (`scripts/format-facts.mjs`)

Converts a `facts.json` sidecar into a compact structured block (~300-500 tokens)
suitable for direct prompt injection, or a markdown report for human review.

```
node scripts/format-facts.mjs path/to/facts.json
node scripts/format-facts.mjs path/to/facts.json --format markdown
```

Groups facts by source domain, reconstructs pricing tuples from shared excerpts,
resolves product identity, and annotates adapter-sourced fields with `[schema]`.

Wired into:
- `shipwright-research-brief/SKILL.md` — Step 3 of the retrieval workflow

### Pricing diff (`scripts/pricing-diff.mjs`)

Builds a deterministic markdown comparison table from two or more `facts.json` packs.
Produces: Competitor × Plan × Price × Billing × Free Tier × Confidence table,
optional Review Signals table, and per-source Coverage Notes.

```
node scripts/pricing-diff.mjs facts-a.json facts-b.json
node scripts/pricing-diff.mjs --dir .shipwright/research/
```

Wired into:
- `pricing-strategy/SKILL.md` — Step 5 (Competitive Pricing Analysis)
- `competitive-landscape/SKILL.md` — Step 3 (Positioning Analysis)
- `shipwright-research-brief/SKILL.md` — multi-competitor pricing requests

### Request classifier (`scripts/classify-request.mjs`)

Pattern-matches a query string to a request type and returns collector hints.
No network calls. Returns: `requestType`, `suggestedMode`, `priorityFacts`,
`collectorHints`, `matchedSignals`, `confidence`.

Request types: `pricing`, `competitive`, `market-size`, `acquisition`, `funding`, `reviews`, `general`

```
node scripts/classify-request.mjs "how does Stripe pricing compare to Paddle?"
node scripts/classify-request.mjs --json "Series B funding in developer tools"
```

Wired into:
- `shipwright-research-brief/SKILL.md` — Step 1 of the retrieval workflow

## Remaining backlog

If Shipwright continues investing in deterministic acceleration, the next
highest-value additions are:

1. **Checkpoint and resume support** for multi-phase runs — save phase outputs
   so the system can restart from `research-complete` or `synthesis-complete`
   instead of rerunning the entire pipeline.
2. **Additional source adapters** — extend the adapter pattern with:
   - PyPI / crates.io package pages (same pattern as npm; useful for open-source
     competitive analysis)
   - Stripe / GitHub pricing pages (investigate static-HTML structure; may require
     per-page field mapping)
   - G2 / Capterra product pages (currently rely on JSON-LD; add fallback text
     patterns for when schema is absent)
3. **Contradiction detector** for the postflight validator — flag when the same
   metric appears with significantly different values in the same document.
   Deferred because reliable detection requires semantic context, not just regex.
4. **Marketplace-style adapters** — many structured catalog and listing pages
   (app stores, software directories, developer marketplaces) follow stable
   patterns. Add adapters once a consistently server-rendered example is
   identified; the adapter pattern is already in place.
5. **`marketplace_last_updated` field** — useful for currency-checking cached
   listing data; add once a stable adapter target is confirmed.
6. **Preflight classifier wiring into collect-research** — `classify-request.mjs`
   currently produces hints for the caller to use manually. A future iteration
   could have `collect-research.mjs` call it internally and auto-select `--mode`
   when none is specified, reducing required arguments for common queries.
7. **Pricing diff HTML output** — `pricing-diff.mjs` currently outputs markdown.
   An `--html` flag could produce a self-contained table for pasting into
   slide decks or Notion pages.

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
