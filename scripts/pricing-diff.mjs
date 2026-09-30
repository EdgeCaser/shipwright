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
 *   node scripts/pricing-diff.mjs --dir path/to/comparison-set/
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

import { access, readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { realpathSync } from 'node:fs';
import path from 'node:path';
import { pricingProductLabel, reconstructPricingTuples } from './pricing-tuples.mjs';

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
  lines.push('*Extracted from structured facts. Verify against source evidence before citing.*');
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
 * Returns a source summary even when no pricing rows are found so callers
 * can still see coverage gaps in the final output.
 */
function extractSourceSummary(factsPack) {
  if (!factsPack || !Array.isArray(factsPack.facts)) return null;

  // Malformed entries carry no evidence; skip them instead of failing the comparison.
  const facts = factsPack.facts.filter(fact => fact && typeof fact === 'object' && !Array.isArray(fact));
  const meta = factsPack.meta || {};

  // Determine label: prefer company/product name, fall back to domain from first fact
  const label = resolveLabel(facts, meta);

  // Reconstruct pricing tuples
  const plans = reconstructPricingTuples(facts)
    .map(plan => ({ ...plan, product_label: pricingProductLabel(plan, facts, label) }));

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
  // Several named products are all shown; picking the first would misattribute the rest.
  for (const field of ['product_name', 'product']) {
    const names = [...new Set(facts.filter(fact => fact.field === field && fact.value).map(fact => fact.value))];
    if (names.length > 0) return names.join(' / ');
  }
  const company = facts.find(fact => fact.field === 'company' && fact.value)?.value;
  if (company) return company;

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
      const row = [source.label, '-', '-'];
      if (hasBilling) row.push('-');
      if (hasFree) row.push(source.hasFreeEntry ? 'Yes' : '-');
      row.push('-');
      rows.push(row);
      continue;
    }

    // Rows sharing a displayed product share one free-tier value; distinct unnamed products stay separate.
    const productKey = entry => (entry.product_label === 'Unnamed product' ? entry.product_id : entry.product_label);
    for (let i = 0; i < source.plans.length; i += 1) {
      const plan = source.plans[i];
      const product = plan.product_label;
      const firstForProduct = i === 0 || productKey(plan) !== productKey(source.plans[i - 1]);
      const label = firstForProduct ? product : '';
      const price = formatPrice(plan.price, plan.currency);
      const row = [label, plan.plan_name || '-', price];
      if (hasBilling) row.push(plan.billing_period || '-');
      if (hasFree) {
        if (firstForProduct) {
          const productPlans = source.plans.filter(entry => productKey(entry) === productKey(plan));
          row.push(productPlans.some(entry => entry.price === '0' || /\bfree\b/i.test(entry.plan_name)) ? 'Yes' : 'No');
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
    s.starRating ? `${s.starRating}★` : '-',
    s.reviewCount ? formatNumber(s.reviewCount) : '-',
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
  if (!code) return '';
  if (code === 'USD') return '$';
  if (code === 'EUR') return '€';
  if (code === 'GBP') return '£';
  return `${code} `;
}

function formatPrice(value, currency) {
  return `${currencySymbol(currency)}${value}`;
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
  let filePaths;
  let dir;

  try {
    ({ filePaths, dir } = parseCliArgs(argv));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
    return;
  }

  if (dir) {
    try {
      const discovered = await discoverFactsPaths(dir);
      filePaths = [...filePaths, ...discovered];
    } catch (error) {
      console.error(`Cannot read directory: ${dir}: ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
      return;
    }
  }

  if (filePaths.length < 1) {
    console.error(
      'Usage: node scripts/pricing-diff.mjs <facts1.json> [facts2.json ...]\n' +
      '       node scripts/pricing-diff.mjs --dir path/to/comparison-set/',
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

function parseCliArgs(argv) {
  const filePaths = [];
  let dir = '';

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === '--dir') {
      dir = argv[i + 1] || '';
      if (!dir) {
        throw new Error('Missing value for --dir.');
      }
      i += 1;
      continue;
    }

    if (token.startsWith('--')) {
      throw new Error(`Unknown argument: ${token}`);
    }

    filePaths.push(token);
  }

  return { filePaths, dir };
}

async function discoverFactsPaths(dir) {
  const resolvedDir = path.resolve(dir);
  const discovered = [];
  const directFactsPath = path.join(resolvedDir, 'facts.json');

  if (await pathExists(directFactsPath)) {
    discovered.push(directFactsPath);
  }

  const entries = await readdir(resolvedDir, { withFileTypes: true });
  const sortedEntries = entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of sortedEntries) {
    if (!entry.isDirectory()) continue;
    const factsPath = path.join(resolvedDir, entry.name, 'facts.json');
    if (await pathExists(factsPath)) {
      discovered.push(factsPath);
    }
  }

  return discovered;
}

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function isDirectRun() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isDirectRun()) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
