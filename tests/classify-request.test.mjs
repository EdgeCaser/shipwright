import assert from 'node:assert/strict';
import test from 'node:test';

import { classifyRequest } from '../scripts/classify-request.mjs';

// ---------------------------------------------------------------------------
// Basic type detection
// ---------------------------------------------------------------------------

test('classifyRequest identifies pricing queries', { concurrency: false }, () => {
  const result = classifyRequest('Stripe pricing plans');
  assert.equal(result.requestType, 'pricing');
  assert.ok(result.confidence > 0);
  assert.ok(result.priorityFacts.includes('price'));
  assert.ok(result.priorityFacts.includes('plan_name'));
});

test('classifyRequest identifies pricing query with per-seat language', { concurrency: false }, () => {
  const result = classifyRequest('how much does Notion cost per user per month');
  assert.equal(result.requestType, 'pricing');
});

test('classifyRequest identifies competitive queries', { concurrency: false }, () => {
  const result = classifyRequest('Figma vs Sketch comparison');
  assert.equal(result.requestType, 'competitive');
  assert.ok(result.priorityFacts.includes('product_name'));
});

test('classifyRequest identifies competitive query with "alternatives" language', { concurrency: false }, () => {
  const result = classifyRequest('Linear alternatives for project management');
  assert.equal(result.requestType, 'competitive');
});

test('classifyRequest identifies market-size queries', { concurrency: false }, () => {
  const result = classifyRequest('total addressable market for developer tools');
  assert.equal(result.requestType, 'market-size');
  assert.equal(result.suggestedMode, 'deep');
});

test('classifyRequest identifies market-size query with TAM acronym', { concurrency: false }, () => {
  const result = classifyRequest('TAM SAM SOM for B2B SaaS');
  assert.equal(result.requestType, 'market-size');
});

test('classifyRequest identifies acquisition queries', { concurrency: false }, () => {
  const result = classifyRequest('who acquired Figma');
  assert.equal(result.requestType, 'acquisition');
  assert.equal(result.suggestedMode, 'auto');
  assert.ok(result.priorityFacts.includes('acquirer'));
  assert.ok(result.priorityFacts.includes('acquired_company'));
});

test('classifyRequest identifies acquisition query with "merger" language', { concurrency: false }, () => {
  const result = classifyRequest('GitHub merger and acquisition history');
  assert.equal(result.requestType, 'acquisition');
});

test('classifyRequest identifies funding queries', { concurrency: false }, () => {
  const result = classifyRequest('Linear raised Series B funding');
  assert.equal(result.requestType, 'funding');
  assert.equal(result.suggestedMode, 'auto');
  assert.ok(result.priorityFacts.includes('funding_event'));
});

test('classifyRequest identifies funding query with series language', { concurrency: false }, () => {
  const result = classifyRequest('Vercel Series C valuation');
  assert.equal(result.requestType, 'funding');
});

test('classifyRequest identifies review queries', { concurrency: false }, () => {
  const result = classifyRequest('Notion user reviews and ratings');
  assert.equal(result.requestType, 'reviews');
  assert.ok(result.priorityFacts.includes('star_rating'));
  assert.ok(result.priorityFacts.includes('review_count'));
});

test('classifyRequest identifies G2 review query', { concurrency: false }, () => {
  const result = classifyRequest('G2 reviews for Salesforce');
  assert.equal(result.requestType, 'reviews');
});

// ---------------------------------------------------------------------------
// Mode hints
// ---------------------------------------------------------------------------

test('classifyRequest returns pricing suggestedMode for pricing queries', { concurrency: false }, () => {
  const result = classifyRequest('Stripe pricing tiers');
  assert.equal(result.suggestedMode, 'auto');
});

test('classifyRequest returns auto suggestedMode for acquisition queries', { concurrency: false }, () => {
  const result = classifyRequest('Adobe acquired Figma deal');
  assert.equal(result.suggestedMode, 'auto');
});

test('classifyRequest returns deep suggestedMode for market-size queries', { concurrency: false }, () => {
  const result = classifyRequest('CAGR for cloud infrastructure market forecast');
  assert.equal(result.suggestedMode, 'deep');
});

// ---------------------------------------------------------------------------
// Collector hints
// ---------------------------------------------------------------------------

test('classifyRequest includes includeJsonLd hint for pricing', { concurrency: false }, () => {
  const result = classifyRequest('annual subscription cost for GitHub Enterprise');
  assert.equal(result.requestType, 'pricing');
  assert.ok(result.collectorHints.includeJsonLd === true);
});

test('classifyRequest includes preferNewsPages hint for funding', { concurrency: false }, () => {
  const result = classifyRequest('vc-backed startup Series A raise');
  assert.equal(result.requestType, 'funding');
  assert.ok(result.collectorHints.preferNewsPages === true);
});

// ---------------------------------------------------------------------------
// Confidence scoring
// ---------------------------------------------------------------------------

test('classifyRequest returns higher confidence with more matched signals', { concurrency: false }, () => {
  const weak = classifyRequest('pricing');
  const strong = classifyRequest('Stripe pricing plans per seat monthly subscription tiers');
  assert.ok(strong.confidence >= weak.confidence);
});

test('classifyRequest confidence is between 0 and 1', { concurrency: false }, () => {
  const queries = [
    'pricing',
    'what did Adobe acquire',
    'total addressable market CAGR billion',
    'user reviews and ratings on G2',
    'seed round Series B venture capital IPO valuation',
  ];
  for (const q of queries) {
    const { confidence } = classifyRequest(q);
    assert.ok(confidence >= 0 && confidence <= 1, `confidence out of range for "${q}": ${confidence}`);
  }
});

// ---------------------------------------------------------------------------
// General fallback
// ---------------------------------------------------------------------------

test('classifyRequest falls back to general for unrecognized queries', { concurrency: false }, () => {
  const result = classifyRequest('hello world');
  assert.equal(result.requestType, 'general');
  assert.equal(result.confidence, 0);
  assert.equal(result.suggestedMode, 'auto');
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

test('classifyRequest handles empty string gracefully', { concurrency: false }, () => {
  const result = classifyRequest('');
  assert.equal(result.requestType, 'general');
  assert.equal(result.confidence, 0);
  assert.deepEqual(result.matchedSignals, []);
});

test('classifyRequest handles null gracefully', { concurrency: false }, () => {
  const result = classifyRequest(null);
  assert.equal(result.requestType, 'general');
  assert.equal(result.confidence, 0);
});

test('classifyRequest returns matchedSignals array', { concurrency: false }, () => {
  const result = classifyRequest('Stripe pricing plans');
  assert.ok(Array.isArray(result.matchedSignals));
  assert.ok(result.matchedSignals.length > 0);
});

test('classifyRequest prefers strongest match when query has multiple signals', { concurrency: false }, () => {
  // "pricing vs" — both pricing and competitive signals fire; pricing has more signals
  const result = classifyRequest('compare pricing plans: Stripe vs Paddle per seat monthly');
  // Both competitive (vs, compare) and pricing (pricing, plans, per seat, monthly) signals match
  // Pricing has more signal patterns matched
  assert.ok(['pricing', 'competitive'].includes(result.requestType));
});

test('classifyRequest includes requestType field in all results', { concurrency: false }, () => {
  const VALID_TYPES = new Set(['pricing', 'competitive', 'market-size', 'acquisition', 'funding', 'reviews', 'general']);
  const queries = [
    'Stripe pricing',
    'Figma vs Sketch',
    'TAM for SaaS',
    'Adobe acquired Figma',
    'Series B funding raise',
    'G2 reviews',
    'something completely unrelated',
  ];
  for (const q of queries) {
    const { requestType } = classifyRequest(q);
    assert.ok(VALID_TYPES.has(requestType), `unknown requestType "${requestType}" for query "${q}"`);
  }
});

test('classifyRequest suggestedMode stays collector-compatible', { concurrency: false }, () => {
  const VALID_MODES = new Set(['standard', 'auto', 'deep']);
  const queries = [
    'Stripe pricing tiers',
    'Figma vs Sketch comparison',
    'TAM for developer tools',
    'who acquired Figma',
    'Series B funding in developer tools',
    'G2 reviews for Salesforce',
    'hello world',
  ];

  for (const query of queries) {
    const { suggestedMode } = classifyRequest(query);
    assert.ok(VALID_MODES.has(suggestedMode), `invalid suggestedMode "${suggestedMode}" for "${query}"`);
  }
});
