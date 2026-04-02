import assert from 'node:assert/strict';
import test from 'node:test';

import { formatFactsBlock } from '../scripts/format-facts.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFact(overrides) {
  return {
    field: 'price',
    value: '29',
    source_url: 'https://example.com/pricing',
    excerpt: 'Starter: $29/month',
    confidence_hint: 'high',
    ...overrides,
  };
}

function makePricingPack(plans = []) {
  const facts = [];
  for (const plan of plans) {
    const excerpt = `${plan.name}: $${plan.price}/${plan.billing || 'month'}`;
    facts.push({ field: 'plan_name', value: plan.name, source_url: plan.url || 'https://example.com/pricing', excerpt, confidence_hint: plan.conf || 'high' });
    facts.push({ field: 'price', value: plan.price, source_url: plan.url || 'https://example.com/pricing', excerpt, confidence_hint: plan.conf || 'high' });
    facts.push({ field: 'currency', value: plan.currency || 'USD', source_url: plan.url || 'https://example.com/pricing', excerpt, confidence_hint: plan.conf || 'high' });
    if (plan.billing) facts.push({ field: 'billing_period', value: plan.billing, source_url: plan.url || 'https://example.com/pricing', excerpt, confidence_hint: plan.conf || 'high' });
  }
  return { meta: { query: 'test pricing' }, facts };
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

test('formatFactsBlock handles null input gracefully', { concurrency: false }, () => {
  const result = formatFactsBlock(null);
  assert.ok(typeof result === 'string');
  assert.ok(result.includes('no facts pack'));
});

test('formatFactsBlock handles null input in markdown mode', { concurrency: false }, () => {
  const result = formatFactsBlock(null, { format: 'markdown' });
  assert.ok(result.includes('No facts pack'));
});

test('formatFactsBlock handles empty facts array', { concurrency: false }, () => {
  const result = formatFactsBlock({ meta: { query: 'test' }, facts: [] });
  assert.ok(typeof result === 'string');
  assert.ok(result.includes('no facts extracted'));
});

// ---------------------------------------------------------------------------
// Block format — basic structure
// ---------------------------------------------------------------------------

test('formatFactsBlock block includes query in header', { concurrency: false }, () => {
  const pack = makePricingPack([{ name: 'Starter', price: '29', billing: 'month' }]);
  pack.meta.query = 'acme pricing';
  const result = formatFactsBlock(pack, { format: 'block' });
  assert.ok(result.includes('"acme pricing"'));
});

test('formatFactsBlock block includes domain header', { concurrency: false }, () => {
  const pack = makePricingPack([{ name: 'Starter', price: '29', billing: 'month' }]);
  const result = formatFactsBlock(pack, { format: 'block' });
  assert.ok(result.includes('example.com'));
});

test('formatFactsBlock block includes price line', { concurrency: false }, () => {
  const pack = makePricingPack([{ name: 'Pro', price: '99', billing: 'month' }]);
  const result = formatFactsBlock(pack, { format: 'block' });
  assert.ok(result.includes('$99'));
  assert.ok(result.includes('Pro'));
});

// ---------------------------------------------------------------------------
// Pricing tuple reconstruction
// ---------------------------------------------------------------------------

test('formatFactsBlock reconstructs pricing tuples from shared excerpt', { concurrency: false }, () => {
  const pack = makePricingPack([
    { name: 'Starter', price: '29', billing: 'month' },
    { name: 'Pro', price: '99', billing: 'month' },
  ]);
  const result = formatFactsBlock(pack, { format: 'block' });
  assert.ok(result.includes('Starter'));
  assert.ok(result.includes('Pro'));
  assert.ok(result.includes('$29'));
  assert.ok(result.includes('$99'));
});

test('formatFactsBlock does not emit tuples without a price', { concurrency: false }, () => {
  const pack = {
    meta: { query: 'test' },
    facts: [
      { field: 'plan_name', value: 'Enterprise', source_url: 'https://example.com/pricing', excerpt: 'Enterprise: contact us', confidence_hint: 'high' },
      // No price fact — should not produce a tuple
    ],
  };
  const result = formatFactsBlock(pack, { format: 'block' });
  // Should not crash or emit "Enterprise: $"
  assert.ok(!result.includes('Enterprise: $'));
});

test('formatFactsBlock renders billing period', { concurrency: false }, () => {
  const pack = makePricingPack([{ name: 'Annual', price: '199', billing: 'year' }]);
  const result = formatFactsBlock(pack, { format: 'block' });
  assert.ok(result.includes('/year'));
});

test('formatFactsBlock renders medium confidence annotation', { concurrency: false }, () => {
  const pack = makePricingPack([{ name: 'Starter', price: '29', conf: 'medium' }]);
  const result = formatFactsBlock(pack, { format: 'block' });
  assert.ok(result.includes('[medium]'));
});

// ---------------------------------------------------------------------------
// Identity resolution
// ---------------------------------------------------------------------------

test('formatFactsBlock uses product_name when present', { concurrency: false }, () => {
  const pack = {
    meta: { query: 'test' },
    facts: [
      { field: 'product_name', value: 'Acme SaaS', source_url: 'https://acmesaas.io/pricing', excerpt: '', confidence_hint: 'high' },
      { field: 'price', value: '49', source_url: 'https://acmesaas.io/pricing', excerpt: 'Pro: $49', confidence_hint: 'high' },
    ],
  };
  const result = formatFactsBlock(pack, { format: 'markdown' });
  assert.ok(result.includes('Acme SaaS'));
});

// ---------------------------------------------------------------------------
// Review facts rendering
// ---------------------------------------------------------------------------

test('formatFactsBlock renders star rating and review count', { concurrency: false }, () => {
  const pack = {
    meta: { query: 'test reviews' },
    facts: [
      { field: 'star_rating', value: '4.5', source_url: 'https://example.com/reviews', excerpt: 'Rated 4.5 out of 5', confidence_hint: 'high' },
      { field: 'review_count', value: '1200', source_url: 'https://example.com/reviews', excerpt: '1,200 reviews', confidence_hint: 'high' },
    ],
  };
  const result = formatFactsBlock(pack, { format: 'block' });
  assert.ok(result.includes('4.5★'));
  assert.ok(result.includes('1,200') || result.includes('1200'));
});

// ---------------------------------------------------------------------------
// Adapter note
// ---------------------------------------------------------------------------

test('formatFactsBlock appends [schema] when adapter data present', { concurrency: false }, () => {
  const pack = {
    meta: { query: 'test' },
    facts: [
      { field: 'product_name', value: 'TestApp', source_url: 'https://testapp.com', excerpt: 'Structured data extracted by json-ld-adapter', confidence_hint: 'high' },
      { field: 'price', value: '49', source_url: 'https://testapp.com', excerpt: 'Structured data extracted by json-ld-adapter', confidence_hint: 'high' },
    ],
  };
  const result = formatFactsBlock(pack, { format: 'block' });
  assert.ok(result.includes('[schema]'));
});

// ---------------------------------------------------------------------------
// Markdown format
// ---------------------------------------------------------------------------

test('formatFactsBlock markdown includes section headers', { concurrency: false }, () => {
  const pack = makePricingPack([{ name: 'Starter', price: '29' }]);
  const result = formatFactsBlock(pack, { format: 'markdown' });
  assert.ok(result.includes('## Structured Facts'));
  assert.ok(result.includes('###'));
});

test('formatFactsBlock markdown renders price as bold list item', { concurrency: false }, () => {
  const pack = makePricingPack([{ name: 'Pro', price: '79', billing: 'month' }]);
  const result = formatFactsBlock(pack, { format: 'markdown' });
  assert.ok(result.includes('**Pro:**'));
  assert.ok(result.includes('$79'));
});

test('formatFactsBlock markdown renders coverage info', { concurrency: false }, () => {
  const pack = makePricingPack([{ name: 'Starter', price: '29' }]);
  pack.meta.extractedAt = '2026-03-15T12:00:00Z';
  pack.meta.coverageHint = 'pricing page';
  const result = formatFactsBlock(pack, { format: 'markdown' });
  assert.ok(result.includes('2026-03-15'));
  assert.ok(result.includes('pricing page'));
});

// ---------------------------------------------------------------------------
// Multi-domain grouping
// ---------------------------------------------------------------------------

test('formatFactsBlock groups facts from different domains separately', { concurrency: false }, () => {
  const pack = {
    meta: { query: 'compare pricing' },
    facts: [
      { field: 'price', value: '29', source_url: 'https://site-a.com/pricing', excerpt: 'Starter: $29', confidence_hint: 'high' },
      { field: 'price', value: '49', source_url: 'https://site-b.com/pricing', excerpt: 'Basic: $49', confidence_hint: 'high' },
    ],
  };
  const result = formatFactsBlock(pack, { format: 'block' });
  assert.ok(result.includes('site-a.com'));
  assert.ok(result.includes('site-b.com'));
  assert.ok(result.includes('$29'));
  assert.ok(result.includes('$49'));
});

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

test('formatFactsBlock renders meta notes', { concurrency: false }, () => {
  const pack = {
    meta: { query: 'test', notes: ['Pricing page gated behind login.'] },
    facts: [],
  };
  const result = formatFactsBlock(pack, { format: 'block' });
  assert.ok(result.includes('Pricing page gated behind login.'));
});
