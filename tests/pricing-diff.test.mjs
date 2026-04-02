import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { buildPricingDiff } from '../scripts/pricing-diff.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePack(label, plans = [], opts = {}) {
  const facts = [];

  // Identity
  if (label) {
    facts.push({ field: 'product_name', value: label, source_url: `https://${label.toLowerCase().replace(/\s+/g, '')}.com/pricing`, excerpt: '', confidence_hint: 'high' });
  }

  for (const plan of plans) {
    const url = opts.url || `https://${label.toLowerCase().replace(/\s+/g, '')}.com/pricing`;
    const excerpt = `${plan.name}: $${plan.price}`;
    if (plan.name) facts.push({ field: 'plan_name', value: plan.name, source_url: url, excerpt, confidence_hint: plan.conf || 'high' });
    facts.push({ field: 'price', value: plan.price, source_url: url, excerpt, confidence_hint: plan.conf || 'high' });
    if (plan.currency) facts.push({ field: 'currency', value: plan.currency, source_url: url, excerpt, confidence_hint: plan.conf || 'high' });
    if (plan.billing) facts.push({ field: 'billing_period', value: plan.billing, source_url: url, excerpt, confidence_hint: plan.conf || 'high' });
  }

  if (opts.starRating) {
    facts.push({ field: 'star_rating', value: opts.starRating, source_url: `https://${label.toLowerCase().replace(/\s+/g, '')}.com`, excerpt: 'Rating', confidence_hint: 'high' });
  }
  if (opts.reviewCount) {
    facts.push({ field: 'review_count', value: opts.reviewCount, source_url: `https://${label.toLowerCase().replace(/\s+/g, '')}.com`, excerpt: 'Reviews', confidence_hint: 'high' });
  }

  return {
    meta: { query: opts.query || label, extractedAt: opts.extractedAt || '' },
    facts,
  };
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

test('buildPricingDiff handles empty array', { concurrency: false }, () => {
  const result = buildPricingDiff([]);
  assert.ok(result.includes('## Pricing Comparison'));
  assert.ok(result.includes('No facts packs provided'));
});

test('buildPricingDiff handles null', { concurrency: false }, () => {
  const result = buildPricingDiff(null);
  assert.ok(result.includes('## Pricing Comparison'));
  assert.ok(result.includes('No facts packs provided'));
});

test('buildPricingDiff handles packs with no pricing facts', { concurrency: false }, () => {
  const pack = { meta: { query: 'test' }, facts: [{ field: 'company', value: 'Acme', source_url: 'https://acme.com', excerpt: 'Acme Corp', confidence_hint: 'high' }] };
  const result = buildPricingDiff([pack]);
  // A source with no pricing plans still emits a table row with dash placeholders
  assert.ok(result.includes('## Pricing Comparison'));
  assert.ok(result.includes('| --- |'));
  // The source label or dash should appear
  assert.ok(result.includes('—') || result.includes('Acme'));
});

// ---------------------------------------------------------------------------
// Single source
// ---------------------------------------------------------------------------

test('buildPricingDiff renders header and disclaimer', { concurrency: false }, () => {
  const pack = makePack('Acme', [{ name: 'Starter', price: '29' }]);
  const result = buildPricingDiff([pack]);
  assert.ok(result.includes('## Pricing Comparison'));
  assert.ok(result.includes('verify against source evidence'));
});

test('buildPricingDiff renders competitor name in table', { concurrency: false }, () => {
  const pack = makePack('Acme', [{ name: 'Starter', price: '29' }]);
  const result = buildPricingDiff([pack]);
  assert.ok(result.includes('Acme'));
});

test('buildPricingDiff renders plan name and price', { concurrency: false }, () => {
  const pack = makePack('Acme', [{ name: 'Pro', price: '99', currency: 'USD' }]);
  const result = buildPricingDiff([pack]);
  assert.ok(result.includes('Pro'));
  assert.ok(result.includes('$99'));
});

test('buildPricingDiff renders billing period column when present', { concurrency: false }, () => {
  const pack = makePack('Acme', [{ name: 'Starter', price: '29', billing: 'month' }]);
  const result = buildPricingDiff([pack]);
  assert.ok(result.includes('Billing'));
  assert.ok(result.includes('month'));
});

test('buildPricingDiff omits billing column when not present', { concurrency: false }, () => {
  const pack = makePack('Acme', [{ name: 'Starter', price: '29' }]);
  const result = buildPricingDiff([pack]);
  assert.ok(!result.includes('| Billing |'));
});

// ---------------------------------------------------------------------------
// Free tier column
// ---------------------------------------------------------------------------

test('buildPricingDiff includes Free Tier column when free plan exists', { concurrency: false }, () => {
  const pack = makePack('Acme', [
    { name: 'Free', price: '0' },
    { name: 'Pro', price: '99' },
  ]);
  const result = buildPricingDiff([pack]);
  assert.ok(result.includes('Free Tier'));
  assert.ok(result.includes('Yes'));
});

test('buildPricingDiff marks No free tier for paid-only products', { concurrency: false }, () => {
  const packA = makePack('Acme', [{ name: 'Free', price: '0' }]);
  const packB = makePack('Rival', [{ name: 'Basic', price: '49' }]);
  const result = buildPricingDiff([packA, packB]);
  assert.ok(result.includes('Yes'));
  assert.ok(result.includes('No'));
});

// ---------------------------------------------------------------------------
// Multi-source comparison
// ---------------------------------------------------------------------------

test('buildPricingDiff renders multiple competitors', { concurrency: false }, () => {
  const packA = makePack('Acme', [{ name: 'Starter', price: '29', currency: 'USD' }]);
  const packB = makePack('Rival', [{ name: 'Basic', price: '49', currency: 'USD' }]);
  const result = buildPricingDiff([packA, packB]);
  assert.ok(result.includes('Acme'));
  assert.ok(result.includes('Rival'));
  assert.ok(result.includes('$29'));
  assert.ok(result.includes('$49'));
});

test('buildPricingDiff renders coverage notes for each source', { concurrency: false }, () => {
  const packA = makePack('Acme', [{ name: 'Starter', price: '29' }]);
  const packB = makePack('Rival', [{ name: 'Basic', price: '49' }]);
  const result = buildPricingDiff([packA, packB]);
  assert.ok(result.includes('### Coverage Notes'));
  assert.ok(result.includes('**Acme**'));
  assert.ok(result.includes('**Rival**'));
});

test('buildPricingDiff renders plan count in coverage notes', { concurrency: false }, () => {
  const pack = makePack('Acme', [
    { name: 'Starter', price: '29' },
    { name: 'Pro', price: '99' },
  ]);
  const result = buildPricingDiff([pack]);
  assert.ok(result.includes('2 plan(s)'));
});

// ---------------------------------------------------------------------------
// Confidence
// ---------------------------------------------------------------------------

test('buildPricingDiff renders confidence column', { concurrency: false }, () => {
  const pack = makePack('Acme', [{ name: 'Starter', price: '29' }]);
  const result = buildPricingDiff([pack]);
  assert.ok(result.includes('Confidence'));
  assert.ok(result.includes('high'));
});

test('buildPricingDiff renders medium confidence for medium-confidence plans', { concurrency: false }, () => {
  const pack = makePack('Acme', [{ name: 'Enterprise', price: '299', conf: 'medium' }]);
  const result = buildPricingDiff([pack]);
  assert.ok(result.includes('medium'));
});

test('buildPricingDiff notes medium confidence in coverage notes', { concurrency: false }, () => {
  const pack = makePack('Acme', [{ name: 'Enterprise', price: '299', conf: 'medium' }]);
  const result = buildPricingDiff([pack]);
  assert.ok(result.includes('some medium confidence'));
});

// ---------------------------------------------------------------------------
// Review signals
// ---------------------------------------------------------------------------

test('buildPricingDiff renders review signals table when ratings present', { concurrency: false }, () => {
  const pack = makePack('Acme', [{ name: 'Pro', price: '99' }], { starRating: '4.5', reviewCount: '1200' });
  const result = buildPricingDiff([pack]);
  assert.ok(result.includes('### Review Signals'));
  assert.ok(result.includes('4.5★'));
  assert.ok(result.includes('1,200') || result.includes('1200'));
});

test('buildPricingDiff omits review signals table when no ratings', { concurrency: false }, () => {
  const pack = makePack('Acme', [{ name: 'Pro', price: '99' }]);
  const result = buildPricingDiff([pack]);
  assert.ok(!result.includes('### Review Signals'));
});

// ---------------------------------------------------------------------------
// Currency symbols
// ---------------------------------------------------------------------------

test('buildPricingDiff uses EUR symbol for EUR currency', { concurrency: false }, () => {
  const pack = makePack('EuroApp', [{ name: 'Basic', price: '25', currency: 'EUR' }]);
  const result = buildPricingDiff([pack]);
  assert.ok(result.includes('€25'));
});

test('buildPricingDiff uses GBP symbol for GBP currency', { concurrency: false }, () => {
  const pack = makePack('UKApp', [{ name: 'Basic', price: '20', currency: 'GBP' }]);
  const result = buildPricingDiff([pack]);
  assert.ok(result.includes('£20'));
});

test('buildPricingDiff does not imply USD when currency is missing', { concurrency: false }, () => {
  const pack = makePack('Acme', [{ name: 'Starter', price: '29' }]);
  const result = buildPricingDiff([pack]);
  assert.ok(result.includes('| Acme | Starter | 29 | high |'));
  assert.ok(!result.includes('| Acme | Starter | $29 | high |'));
});

// ---------------------------------------------------------------------------
// Coverage notes metadata
// ---------------------------------------------------------------------------

test('buildPricingDiff includes extractedAt date in coverage notes', { concurrency: false }, () => {
  const pack = makePack('Acme', [{ name: 'Pro', price: '99' }], { extractedAt: '2026-03-15T12:00:00Z' });
  const result = buildPricingDiff([pack]);
  assert.ok(result.includes('2026-03-15'));
});

test('buildPricingDiff includes research query in coverage notes', { concurrency: false }, () => {
  const pack = makePack('Acme', [{ name: 'Pro', price: '99' }], { query: 'Acme pricing research' });
  const result = buildPricingDiff([pack]);
  assert.ok(result.includes('Acme pricing research'));
});

// ---------------------------------------------------------------------------
// CLI directory discovery
// ---------------------------------------------------------------------------

test('pricing-diff --dir only loads discovered facts files', { concurrency: false }, async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-pricing-diff-'));
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  const acmeDir = path.join(dir, 'acme');
  const rivalDir = path.join(dir, 'rival');
  const emptyDir = path.join(dir, 'empty');
  await mkdir(acmeDir, { recursive: true });
  await mkdir(rivalDir, { recursive: true });
  await mkdir(emptyDir, { recursive: true });
  await writeFile(path.join(acmeDir, 'facts.json'), `${JSON.stringify(makePack('Acme', [{ name: 'Starter', price: '29', currency: 'USD' }]), null, 2)}\n`, 'utf8');
  await writeFile(path.join(rivalDir, 'facts.json'), `${JSON.stringify(makePack('Rival', [{ name: 'Basic', price: '49', currency: 'USD' }]), null, 2)}\n`, 'utf8');

  const result = spawnSync(process.execPath, ['scripts/pricing-diff.mjs', '--dir', dir], {
    cwd: '/Users/ianbrillembourg/Documents/GitHub/shipwright',
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Acme/);
  assert.match(result.stdout, /Rival/);
  assert.doesNotMatch(result.stderr, /EISDIR/);
  assert.doesNotMatch(result.stderr, /Skipping/);
});
