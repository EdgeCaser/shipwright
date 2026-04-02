#!/usr/bin/env node

/**
 * Shipwright facts formatter.
 *
 * Converts a facts.json pack into a compact structured block suitable for
 * direct prompt injection or human review. Groups facts by source domain,
 * reconstructs pricing tuples from shared excerpts, and produces a concise
 * summary that fits in roughly 300-500 tokens for a typical research run.
 *
 * Usage (CLI):
 *   node scripts/format-facts.mjs path/to/facts.json
 *   node scripts/format-facts.mjs path/to/facts.json --format block
 *   node scripts/format-facts.mjs path/to/facts.json --format markdown
 *
 * Usage (programmatic):
 *   import { formatFactsBlock } from './format-facts.mjs';
 *   const block = formatFactsBlock(factsPack, { format: 'block' });
 *
 * Integration:
 *   After running collect-research.mjs, pipe the output facts.json through
 *   this formatter to get a compact evidence block for synthesis prompts.
 *   The block replaces the full evidence.md for structured-data-heavy queries.
 *
 *   Example agent prompt prefix:
 *     "Here is a structured facts summary from programmatic research.
 *      Use it as your primary evidence source, supplementing with the
 *      full evidence.md only for context the facts block does not cover:
 *
 *      [block output here]"
 */

import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Format a facts pack into a compact structured block.
 *
 * @param {object} factsPack - Parsed facts.json content
 * @param {object} [options]
 * @param {'block'|'markdown'} [options.format='block']
 *   'block'    — compact plaintext, optimized for prompt injection
 *   'markdown' — structured markdown with headers, for human review
 * @returns {string}
 */
export function formatFactsBlock(factsPack, options = {}) {
  const { format = 'block' } = options;

  if (!factsPack || typeof factsPack !== 'object') {
    return format === 'markdown'
      ? '## Facts Summary\n\nNo facts pack provided.\n'
      : 'Facts: (no facts pack provided)';
  }

  const facts = Array.isArray(factsPack.facts) ? factsPack.facts : [];
  const meta = factsPack.meta || {};

  const groups = groupFactsByDomain(facts);

  return format === 'markdown'
    ? renderMarkdown(meta, groups, facts)
    : renderBlock(meta, groups, facts);
}

// ---------------------------------------------------------------------------
// Grouping and reconstruction
// ---------------------------------------------------------------------------

/**
 * Group facts by source domain. Within each group, reconstruct pricing
 * tuples by matching facts that share the same excerpt (they came from
 * the same extracted text line).
 */
function groupFactsByDomain(facts) {
  const domainMap = new Map();

  for (const fact of facts) {
    if (!fact?.source_url) continue;
    const domain = extractDomain(fact.source_url);

    if (!domainMap.has(domain)) {
      domainMap.set(domain, {
        domain,
        representativeUrl: fact.source_url,
        facts: [],
      });
    }
    domainMap.get(domain).facts.push(fact);
  }

  return Array.from(domainMap.values());
}

/**
 * Reconstruct pricing tuples from a set of facts by grouping
 * plan_name / price / currency / billing_period facts that share
 * the same excerpt (i.e., were extracted from the same source line).
 *
 * Returns an array of tuples: { plan_name?, price?, currency?, billing_period?, confidence }
 */
function reconstructPricingTuples(domainFacts) {
  const PRICING_FIELDS = new Set(['plan_name', 'price', 'currency', 'billing_period']);
  const priceFacts = domainFacts.filter((f) => PRICING_FIELDS.has(f.field));

  const byExcerpt = new Map();
  for (const fact of priceFacts) {
    const key = fact.excerpt || '__no_excerpt__';
    if (!byExcerpt.has(key)) byExcerpt.set(key, { _confidence: 'high' });
    const group = byExcerpt.get(key);
    group[fact.field] = fact.value;
    // Downgrade confidence to medium if any field is medium
    if (fact.confidence_hint === 'medium') group._confidence = 'medium';
  }

  return Array.from(byExcerpt.values())
    .filter((g) => g.price) // only include tuples that have a price
    .map(({ plan_name, price, currency, billing_period, _confidence }) => ({
      plan_name,
      price,
      currency,
      billing_period,
      confidence: _confidence,
    }));
}

/**
 * Get the best available identity string for a domain group.
 * Prefers: product_name > product > company > domain
 */
function resolveIdentity(domainFacts, domain) {
  const get = (field) => domainFacts.find((f) => f.field === field)?.value;
  return get('product_name') || get('product') || get('company') || domain;
}

/**
 * Get company name if distinct from product identity.
 */
function resolveCompany(domainFacts) {
  return domainFacts.find((f) => f.field === 'company')?.value || '';
}

// ---------------------------------------------------------------------------
// Renderers
// ---------------------------------------------------------------------------

function renderBlock(meta, groups, allFacts) {
  const lines = [];

  // Header
  const query = meta.query ? `"${meta.query}"` : '(no query)';
  lines.push(`Facts — ${query}`);

  const coverageParts = [];
  if (meta.coverageHint) coverageParts.push(meta.coverageHint);
  if (meta.extractedAt) coverageParts.push(`extracted ${meta.extractedAt.slice(0, 10)}`);
  if (coverageParts.length > 0) lines.push(coverageParts.join(' | '));

  if (allFacts.length === 0) {
    lines.push('(no facts extracted)');
    if (meta.notes?.length > 0) lines.push(`Note: ${meta.notes.join(' ')}`);
    return lines.join('\n');
  }

  lines.push('');

  // Per-domain groups
  for (const group of groups) {
    const { domain, representativeUrl, facts: domainFacts } = group;
    const identity = resolveIdentity(domainFacts, domain);
    const company = resolveCompany(domainFacts);

    // Domain header
    const adapterNote = detectAdapterNote(domainFacts);
    lines.push(`${domain}${adapterNote}`);

    // Identity line
    const identityParts = [];
    if (company && company !== identity) identityParts.push(`company: ${company}`);
    if (identity) identityParts.push(`product: ${identity}`);
    if (identityParts.length > 0) lines.push(`  ${identityParts.join(' | ')}`);

    // Pricing tuples
    const tuples = reconstructPricingTuples(domainFacts);
    for (const tuple of tuples) {
      const label = tuple.plan_name ? `${tuple.plan_name}: ` : '';
      const symbol = currencySymbol(tuple.currency);
      const price = `${symbol}${tuple.price}`;
      const billing = tuple.billing_period ? `/${tuple.billing_period}` : '';
      const conf = tuple.confidence === 'medium' ? ' [medium]' : '';
      lines.push(`  ${label}${price}${billing}${conf}`);
    }

    // Review facts
    const rating = domainFacts.find((f) => f.field === 'star_rating');
    const reviewCount = domainFacts.find((f) => f.field === 'review_count');
    if (rating || reviewCount) {
      const parts = [];
      if (rating) parts.push(`${rating.value}★`);
      if (reviewCount) parts.push(`${formatNumber(reviewCount.value)} reviews`);
      const ratingConf = [rating, reviewCount].some((f) => f?.confidence_hint === 'medium') ? ' [medium]' : '';
      lines.push(`  rating: ${parts.join(' ')}${ratingConf}`);
    }

    // Other notable facts
    for (const fact of domainFacts) {
      if (isAlreadyRendered(fact.field)) continue;
      const conf = fact.confidence_hint === 'medium' ? ' [medium]' : '';
      lines.push(`  ${fact.field}: ${fact.value}${conf}`);
    }

    lines.push('');
  }

  // Notes
  if (meta.notes?.length > 0) {
    lines.push(`Note: ${meta.notes.join(' ')}`);
  }

  return lines.join('\n').trimEnd();
}

function renderMarkdown(meta, groups, allFacts) {
  const lines = [];
  const query = meta.query ? `"${meta.query}"` : '(no query)';

  lines.push(`## Structured Facts`);
  lines.push('');
  lines.push(`**Query:** ${query}  `);
  if (meta.coverageHint) lines.push(`**Coverage:** ${meta.coverageHint}  `);
  if (meta.extractedAt) lines.push(`**Extracted:** ${meta.extractedAt.slice(0, 10)}  `);
  lines.push('');

  if (allFacts.length === 0) {
    lines.push('*No facts extracted from this evidence pack.*');
    if (meta.notes?.length > 0) {
      lines.push('');
      lines.push(`**Notes:** ${meta.notes.join(' ')}`);
    }
    return `${lines.join('\n')}\n`;
  }

  for (const group of groups) {
    const { domain, facts: domainFacts } = group;
    const identity = resolveIdentity(domainFacts, domain);
    const company = resolveCompany(domainFacts);
    const adapterNote = detectAdapterNote(domainFacts);

    lines.push(`### ${identity} (${domain}${adapterNote})`);
    lines.push('');

    // Identity
    if (company && company !== identity) {
      lines.push(`- **Company:** ${company}`);
    }

    // Pricing
    const tuples = reconstructPricingTuples(domainFacts);
    for (const tuple of tuples) {
      const label = tuple.plan_name || 'Plan';
      const symbol = currencySymbol(tuple.currency);
      const price = `${symbol}${tuple.price}`;
      const billing = tuple.billing_period ? `/${tuple.billing_period}` : '';
      const conf = tuple.confidence === 'medium' ? ' *(medium confidence)*' : '';
      lines.push(`- **${label}:** ${price}${billing}${conf}`);
    }

    // Reviews
    const rating = domainFacts.find((f) => f.field === 'star_rating');
    const reviewCount = domainFacts.find((f) => f.field === 'review_count');
    if (rating || reviewCount) {
      const parts = [];
      if (rating) parts.push(`${rating.value}★`);
      if (reviewCount) parts.push(`${formatNumber(reviewCount.value)} reviews`);
      lines.push(`- **Rating:** ${parts.join(', ')}`);
    }

    // Other
    for (const fact of domainFacts) {
      if (isAlreadyRendered(fact.field)) continue;
      const conf = fact.confidence_hint === 'medium' ? ' *(medium)*' : '';
      lines.push(`- **${formatFieldLabel(fact.field)}:** ${fact.value}${conf}`);
    }

    lines.push('');
  }

  if (meta.notes?.length > 0) {
    lines.push(`> **Notes:** ${meta.notes.join(' ')}`);
    lines.push('');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

const RENDERED_FIELDS = new Set([
  'company', 'product', 'product_name',
  'plan_name', 'price', 'currency', 'billing_period',
  'star_rating', 'review_count',
]);

function isAlreadyRendered(field) {
  return RENDERED_FIELDS.has(field);
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function currencySymbol(code) {
  if (!code) return '$';
  if (code === 'USD') return '$';
  if (code === 'EUR') return '€';
  if (code === 'GBP') return '£';
  return `${code} `;
}

function formatNumber(value) {
  const n = parseInt(String(value).replace(/,/g, ''), 10);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString('en-US');
}

function formatFieldLabel(field) {
  return field
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function detectAdapterNote(domainFacts) {
  // Check if any fact came from an adapter (excerpt starts with "Structured data extracted by")
  const hasAdapter = domainFacts.some((f) =>
    (f.excerpt || '').startsWith('Structured data extracted by'),
  );
  return hasAdapter ? ' [schema]' : '';
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

async function main(argv = process.argv.slice(2)) {
  const filePath = argv.find((a) => !a.startsWith('--'));
  if (!filePath) {
    console.error('Usage: node scripts/format-facts.mjs <path-to-facts.json> [--format block|markdown]');
    process.exitCode = 1;
    return;
  }

  let format = 'block';
  const fmtIdx = argv.indexOf('--format');
  if (fmtIdx !== -1 && argv[fmtIdx + 1]) {
    format = argv[fmtIdx + 1];
  }

  let factsPack;
  try {
    const text = await readFile(path.resolve(filePath), 'utf8');
    factsPack = JSON.parse(text);
  } catch (error) {
    console.error(`Cannot read facts file: ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
    return;
  }

  console.log(formatFactsBlock(factsPack, { format }));
}

function isDirectRun() {
  if (!process.argv[1]) return false;
  return import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
}

if (isDirectRun()) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
