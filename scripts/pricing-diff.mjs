#!/usr/bin/env node

/**
 * Shipwright pricing diff.
 *
 * Produces a deterministic pricing comparison table from two or more
 * facts.json files. Each file represents research on one competitor or
 * product. The output is a markdown table the AI can cite directly,
 * plus a summary of review signals and coverage notes.
 *
 * Usage (CLI):
 *   node scripts/pricing-diff.mjs facts-a.json facts-b.json [facts-c.json ...]
 *   node scripts/pricing-diff.mjs --dir .shipwright/research/
 *
 * Usage (programmatic):
 *   import { buildPricingDiff } from './pricing-diff.mjs';
 *   const table = buildPricingDiff([factsPackA, factsPackB]);
 *
 * Integration:
 *   Run after collecting research on each competitor individually.
 *   Feed the output table into pricing-strategy Step 5 or
 *   competitive-landscape Step 3 as pre-structured evidence.
 *
 *   Example:
 *     node scripts/pricing-diff.mjs \
 *       .shipwright/research/acme-pricing/facts.json \
 *       .shipwright/research/rival-pricing/facts.json
 */

import { readFile, readdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a pricing comparison from an array of facts packs.
 *
 * @param {object[]} factsPacks - Array of parsed facts.json objects
 * @returns {string} Markdown pricing comparison table
 */
export function buildPricingDiff(factsPacks) {
  if (!Array.isArray(factsPacks) || factsPacks.length === 0) {
    return '## Pricing Comparison\n\nNo facts packs provided.\n';
  }

  const sources = factsPacks
    .map(extractSourceSummary)
    .filter((s) => s !== null);

  if (sources.length === 0) {
    return '## Pricing Comparison\n\nNo pricing facts found in the provided evidence.\n';
  }

  const lines = [];
  lines.push('## Pricing Comparison');
  lines.push('');
  lines.push('*Extracted from structured facts — verify against source evidence before citing.*');
  lines.push('');

  // Main pricing table
  const hasBilling = sources.some((s) => s.plans.some((p) => p.billing_period));
  const hasFree = sources.some((s) => s.hasFreeEntry);

  lines.push(buildPricingTable(sources, { hasBilling, hasFree }));
  lines.push('');

  // Review signals table (only if at least one source has ratings)
  const sourcesWithRatings = sources.filter((s) => s.starRating || s.reviewCount);
  if (sourcesWithRatings.length > 0) {
    lines.push('### Review Signals');
    lines.push('');
    lines.push(buildReviewTable(sources));
    lines.push('');
  }

  // Coverage notes
  lines.push('### Coverage Notes');
  lines.push('');
  for (const source of sources) {
    const planCount = source.plans.length;
    const confNote = source.plans.some((p) => p.confidence === 'medium')
      ? ' (some medium confidence)'
      : '';
    const adapterNote = source.hasAdapterData ? ' via schema' : '';
    lines.push(`- **${source.label}**: ${planCount} plan(s) extracted${adapterNote}${confNote}`);
    if (source.query) lines.push(`  - Research query: "${source.query}"`);
    if (source.extractedAt) lines.push(`  - Extracted: ${source.extractedAt.slice(0, 10)}`);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Source extraction
// ---------------------------------------------------------------------------

/**
 * Extract a structured summary from one facts pack.
 * Returns null if no pricing data is found.
 */
function extractSourceSummary(factsPack) {
  if (!factsPack || !Array.isArray(factsPack.facts)) return null;

  const facts = factsPack.facts;
  const meta = factsPack.meta || {};

  // Determine label: prefer company/product name, fall back to domain from first fact
  const label = resolveLabel(facts, meta);

  // Reconstruct pricing tuples
  const plans = reconstructPricingTuples(facts);

  // Check for free entry (price = 0 or explicit "free" plan name)
  const hasFreeEntry = plans.some(
    (p) => p.price === '0' || /\bfree\b/i.test(p.plan_name || ''),
  );

  // Review signals
  const ratingFact = facts.find((f) => f.field === 'star_rating');
  const reviewFact = facts.find((f) => f.field === 'review_count');

  // Adapter data presence
  const hasAdapterData = facts.some((f) =>
    (f.excerpt || '').startsWith('Structured data extracted by'),
  );

  return {
    label,
    query: meta.query || '',
    extractedAt: meta.extractedAt || '',
    plans,
    hasFreeEntry,
    starRating: ratingFact?.value || null,
    reviewCount: reviewFact?.value || null,
    hasAdapterData,
  };
}

function resolveLabel(facts, meta) {
  const get = (field) => facts.find((f) => f.field === field)?.value;
  const name = get('product_name') || get('product') || get('company');
  if (name) return name;

  // Fall back to domain from the first fact URL
  const firstUrl = facts[0]?.source_url;
  if (firstUrl) {
    try {
      return new URL(firstUrl).hostname.replace(/^www\./, '');
    } catch { /* ignore */ }
  }

  return meta.query ? `"${meta.query.slice(0, 30)}"` : 'Unknown';
}

// ---------------------------------------------------------------------------
// Pricing tuple reconstruction (same logic as format-facts.mjs)
// ---------------------------------------------------------------------------

function reconstructPricingTuples(facts) {
  const PRICING_FIELDS = new Set(['plan_name', 'price', 'currency', 'billing_period']);
  const priceFacts = facts.filter((f) => PRICING_FIELDS.has(f.field));

  const byExcerpt = new Map();
  for (const fact of priceFacts) {
    const key = fact.excerpt || '__no_excerpt__';
    if (!byExcerpt.has(key)) byExcerpt.set(key, { _confidence: 'high' });
    const group = byExcerpt.get(key);
    group[fact.field] = fact.value;
    if (fact.confidence_hint === 'medium') group._confidence = 'medium';
  }

  return Array.from(byExcerpt.values())
    .filter((g) => g.price)
    .map(({ plan_name, price, currency, billing_period, _confidence }) => ({
      plan_name: plan_name || '',
      price,
      currency: currency || '',
      billing_period: billing_period || '',
      confidence: _confidence,
    }));
}

// ---------------------------------------------------------------------------
// Table builders
// ---------------------------------------------------------------------------

function buildPricingTable(sources, { hasBilling, hasFree }) {
  const headers = ['Competitor', 'Plan', 'Price'];
  if (hasBilling) headers.push('Billing');
  if (hasFree) headers.push('Free Tier');
  headers.push('Confidence');

  const separator = headers.map(() => '---');
  const rows = [];

  for (const source of sources) {
    if (source.plans.length === 0) {
      const row = [source.label, '—', '—'];
      if (hasBilling) row.push('—');
      if (hasFree) row.push(source.hasFreeEntry ? 'Yes' : '—');
      row.push('—');
      rows.push(row);
      continue;
    }

    for (let i = 0; i < source.plans.length; i += 1) {
      const plan = source.plans[i];
      const label = i === 0 ? source.label : '';
      const symbol = currencySymbol(plan.currency);
      const price = `${symbol}${plan.price}`;
      const row = [label, plan.plan_name || '—', price];
      if (hasBilling) row.push(plan.billing_period || '—');
      if (hasFree) {
        if (i === 0) {
          row.push(source.hasFreeEntry ? 'Yes' : 'No');
        } else {
          row.push('');
        }
      }
      row.push(plan.confidence === 'medium' ? 'medium' : 'high');
      rows.push(row);
    }
  }

  return [
    `| ${headers.join(' | ')} |`,
    `| ${separator.join(' | ')} |`,
    ...rows.map((r) => `| ${r.join(' | ')} |`),
  ].join('\n');
}

function buildReviewTable(sources) {
  const rows = sources.map((s) => [
    s.label,
    s.starRating ? `${s.starRating}★` : '—',
    s.reviewCount ? formatNumber(s.reviewCount) : '—',
  ]);

  return [
    '| Competitor | Rating | Reviews |',
    '| --- | --- | --- |',
    ...rows.map((r) => `| ${r.join(' | ')} |`),
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

async function main(argv = process.argv.slice(2)) {
  // Collect file paths (args that don't start with --)
  let filePaths = argv.filter((a) => !a.startsWith('--'));

  // --dir mode: discover all facts.json files in immediate subdirs
  const dirIdx = argv.indexOf('--dir');
  if (dirIdx !== -1 && argv[dirIdx + 1]) {
    const dir = path.resolve(argv[dirIdx + 1]);
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      const discovered = entries
        .filter((e) => e.isDirectory())
        .map((e) => path.join(dir, e.name, 'facts.json'));
      filePaths = [...filePaths, ...discovered];
    } catch (error) {
      console.error(`Cannot read directory: ${argv[dirIdx + 1]}: ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
      return;
    }
  }

  if (filePaths.length < 1) {
    console.error(
      'Usage: node scripts/pricing-diff.mjs <facts1.json> [facts2.json ...]\n' +
      '       node scripts/pricing-diff.mjs --dir .shipwright/research/',
    );
    process.exitCode = 1;
    return;
  }

  const factsPacks = [];
  for (const filePath of filePaths) {
    try {
      const text = await readFile(path.resolve(filePath), 'utf8');
      factsPacks.push(JSON.parse(text));
    } catch (error) {
      console.warn(`Skipping ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (factsPacks.length === 0) {
    console.error('No valid facts files could be loaded.');
    process.exitCode = 1;
    return;
  }

  console.log(buildPricingDiff(factsPacks));
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
