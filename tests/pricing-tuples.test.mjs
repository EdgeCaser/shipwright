import assert from 'node:assert/strict';
import test from 'node:test';
import { applySourceAdapter } from '../scripts/source-adapters.mjs';
import { extractFactsPack } from '../scripts/collect-research.mjs';
import { reconstructPricingTuples } from '../scripts/pricing-tuples.mjs';
import { formatFactsBlock } from '../scripts/format-facts.mjs';
import { buildPricingDiff } from '../scripts/pricing-diff.mjs';

function packFromOffers(offers) {
  const url = 'https://example.com/pricing';
  const adapterData = applySourceAdapter(url, '<script type="application/ld+json">'
    + JSON.stringify({ '@type': 'Product', name: 'Example', offers }) + '</script>');
  return extractFactsPack({ query: 'Synthetic pricing', generatedAt: '2026-09-30T00:00:00Z',
    results: [{ url, adapterData }] });
}

test('JSON-LD offers cannot lend their price or currency to a different plan', () => {
  const pack = packFromOffers([
    { name: 'Basic', price: '10', priceCurrency: 'USD' },
    { name: 'Enterprise', priceCurrency: 'EUR' },
  ]);
  assert.deepEqual(reconstructPricingTuples(pack.facts).map(({ product_id, source_url, ...row }) => row), [
    { product_name: 'Example', plan_name: 'Basic', price: '10', currency: 'USD', billing_period: '', confidence: 'high' },
  ]);
  assert.match(formatFactsBlock(pack), /Basic: \$10/);
  assert.doesNotMatch(formatFactsBlock(pack), /Enterprise:|€10/);
  assert.match(buildPricingDiff([pack]), /Basic \| \$10/);
  assert.doesNotMatch(buildPricingDiff([pack]), /Enterprise|€10/);
});

test('equal prices and currencies survive deduplication for every distinct offer', () => {
  const pack = packFromOffers([
    { name: 'Basic', price: '10', priceCurrency: 'USD' },
    { name: 'Team', price: '10', priceCurrency: 'USD' },
    { name: 'Enterprise', price: '20', priceCurrency: 'USD' },
  ]);
  assert.equal(pack.facts.filter(fact => fact.field === 'currency').length, 3);
  assert.deepEqual(reconstructPricingTuples(pack.facts).map(row => [row.plan_name, row.price, row.currency]),
    [['Basic', '10', 'USD'], ['Team', '10', 'USD'], ['Enterprise', '20', 'USD']]);
});

test('pricing rows preserve product ownership on a multi-product source', () => {
  const url = 'https://example.com/catalog';
  const adapterData = applySourceAdapter(url, '<script type="application/ld+json">'
    + JSON.stringify({ '@graph': [
      { '@type': 'Product', name: 'CRM', offers: [{ name: 'Basic', price: '10', priceCurrency: 'USD' },
        { name: 'Free', price: '0', priceCurrency: 'USD' }] },
      { '@type': 'Product', name: 'ERP', offers: { name: 'Enterprise', price: '500', priceCurrency: 'USD' } },
    ] }) + '</script>');
  const pack = extractFactsPack({ generatedAt: '2026-09-30T00:00:00Z', results: [{ url, adapterData }] });
  assert.deepEqual(reconstructPricingTuples(pack.facts).map(row => [row.product_name, row.plan_name, row.price]),
    [['CRM', 'Basic', '10'], ['CRM', 'Free', '0'], ['ERP', 'Enterprise', '500']]);
  for (const format of ['block', 'markdown']) {
    const rendered = formatFactsBlock(pack, { format });
    assert.match(rendered, /CRM \/ Basic/);
    assert.match(rendered, /ERP \/ Enterprise/);
    assert.doesNotMatch(rendered, /CRM \/ Enterprise/);
  }
  const diff = buildPricingDiff([pack]);
  assert.match(diff, /\| CRM \| Basic \| \$10 \| Yes \|/);
  assert.match(diff, /\| ERP \| Enterprise \| \$500 \| No \|/);
  assert.doesNotMatch(diff, /\| CRM \| Enterprise/);
});

test('unnamed products retain unknown ownership instead of inheriting a named product', () => {
  const url = 'https://example.com/catalog';
  const adapterData = applySourceAdapter(url, '<script type="application/ld+json">'
    + JSON.stringify({ '@graph': [
      { '@type': 'Product', name: 'CRM', offers: { name: 'Basic', price: '10', priceCurrency: 'USD' } },
      { '@type': 'Product', offers: { name: 'Enterprise', price: '500', priceCurrency: 'USD' } },
      { '@type': 'Product', offers: { name: 'Free', price: '0', priceCurrency: 'USD' } },
    ] }) + '</script>');
  const pack = extractFactsPack({ generatedAt: '2026-09-30T00:00:00Z', results: [{ url, adapterData }] });
  const rows = reconstructPricingTuples(pack.facts);
  assert.equal(new Set(rows.map(row => row.product_id)).size, 3);
  assert.equal(rows[1].product_name, undefined);
  for (const format of ['block', 'markdown']) {
    const rendered = formatFactsBlock(pack, { format });
    assert.match(rendered, /Unnamed product \/ Enterprise/);
    assert.doesNotMatch(rendered, /CRM \/ Enterprise/);
  }
  const diff = buildPricingDiff([pack]);
  assert.match(diff, /\| CRM \| Basic \| \$10 \| No \|/);
  assert.match(diff, /\| Unnamed product \| Enterprise \| \$500 \| No \|/);
  assert.match(diff, /\| Unnamed product \| Free \| \$0 \| Yes \|/);
  assert.doesNotMatch(diff, /\| CRM \| Enterprise/);
});

test('text prices preserve repeated currency and billing fields across distinct lines', () => {
  const pack = extractFactsPack({ generatedAt: '2026-09-30T00:00:00Z', results: [{
    url: 'https://example.com/pricing', extracted: { excerpt: 'Basic $10 per month\nTeam $20 per month' },
  }] });
  const rows = reconstructPricingTuples(pack.facts);
  assert.equal(rows.length, 2);
  assert.ok(rows.every(row => row.currency === 'USD' && row.billing_period));
});

test('tuple identity is scoped to its source, even with identical excerpts or IDs', () => {
  for (const tuple_id of [undefined, 'offer-0']) {
    const facts = [
      { field: 'price', value: '10', source_url: 'https://example.com/us' },
      { field: 'currency', value: 'EUR', source_url: 'https://example.com/eu' },
    ].map(fact => ({ ...fact, tuple_id, excerpt: 'shared excerpt', confidence_hint: 'high' }));
    assert.equal(reconstructPricingTuples(facts)[0].currency, '');
  }
});

test('ambiguous legacy facts and flattened adapter groups never fabricate pricing tuples', () => {
  const facts = [['price', '10'], ['plan_name', 'Basic'], ['plan_name', 'Enterprise'], ['currency', 'EUR']]
    .map(([field, value]) => ({ field, value, source_url: 'https://example.com/pricing', excerpt: 'legacy text' }));
  assert.deepEqual(reconstructPricingTuples(facts), []);
  const flattened = facts.filter(fact => fact.value !== 'Basic')
    .map(fact => ({ ...fact, excerpt: 'Structured data extracted by json-ld adapter.' }));
  assert.deepEqual(reconstructPricingTuples(flattened), []);
  assert.doesNotMatch(formatFactsBlock({ facts: flattened }), /Enterprise:|€10/);
  assert.doesNotMatch(buildPricingDiff([{ facts: flattened }]), /Enterprise \| €10/);
});

test('text-extracted prices never borrow a named product from another offer or source', () => {
  const ld = value => '<script type="application/ld+json">' + JSON.stringify(value) + '</script>';
  const alpha = 'https://alpha.example/pricing';
  const other = 'https://other.example/pricing';
  const pack = extractFactsPack({ generatedAt: '2026-09-30T00:00:00Z', results: [
    { url: alpha, adapterData: applySourceAdapter(alpha, ld({ '@type': 'Product',
      offers: { name: 'Basic', price: '10', priceCurrency: 'USD' } })),
    extracted: { excerpt: 'Enterprise $99 per month' } },
    { url: other, adapterData: applySourceAdapter(other, ld({ '@type': 'Product', name: 'Gamma',
      offers: { name: 'Pro', price: '5', priceCurrency: 'USD' } })) },
  ] });
  const diff = buildPricingDiff([pack]);
  assert.match(diff, /\| alpha\.example \| Enterprise \| \$99 \|/);
  assert.match(diff, /\| Gamma \| Pro \| \$5 \|/);
  assert.doesNotMatch(diff, /\| Gamma \| Enterprise/);

  const crossSource = extractFactsPack({ generatedAt: '2026-09-30T00:00:00Z', results: [
    { url: other, adapterData: applySourceAdapter(other, ld({ '@type': 'Product', name: 'Gamma',
      offers: { name: 'Pro', price: '5', priceCurrency: 'USD' } })) },
    { url: 'https://reviews.example/beta', extracted: { excerpt: 'Enterprise $99 per month' } },
  ] });
  assert.match(buildPricingDiff([crossSource]), /\| reviews\.example \| Enterprise \| \$99 \|/);

  // One product named on the same page is that page's identity; two names are not a choice to make.
  const page = products => extractFactsPack({ generatedAt: '2026-09-30T00:00:00Z', results: [
    { url: alpha, adapterData: applySourceAdapter(alpha, ld({ '@graph': products.map((name, index) => ({
      '@type': 'Product', name, offers: { name: 'Plan ' + index, price: String(10 + index), priceCurrency: 'USD' } })) })),
    extracted: { excerpt: 'Enterprise $99 per month' } },
  ] });
  for (const format of ['block', 'markdown']) {
    const single = formatFactsBlock(page(['Alpha']), { format });
    assert.match(single, /Alpha/);
    assert.doesNotMatch(single, /alpha\.example \/ Enterprise/);
    const ambiguous = formatFactsBlock(page(['Alpha', 'Beta']), { format });
    assert.match(ambiguous, /alpha\.example \/ Enterprise/);
    assert.doesNotMatch(ambiguous, /(?:Alpha|Beta) \/ Enterprise/);
  }
  assert.match(buildPricingDiff([page(['Alpha'])]), /\| Alpha \| Enterprise \| \$99 \|/);
  assert.match(buildPricingDiff([page(['Alpha', 'Beta'])]), /\| alpha\.example \| Enterprise \| \$99 \|/);
});

test('a text-only pack keeps its pack label, and malformed fact entries are skipped', () => {
  const pack = extractFactsPack({ generatedAt: '2026-09-30T00:00:00Z', results: [{
    url: 'https://example.com/pricing', extracted: { excerpt: 'Basic $10 per month' } }] });
  const label = buildPricingDiff([pack]).match(/\n\| ([^|]+) \| Basic \|/)?.[1];
  assert.ok(label && !/Unattributed/.test(label));
  for (const facts of [[null, ...pack.facts], [...pack.facts, 7, []]]) {
    assert.match(buildPricingDiff([{ ...pack, facts }]), /\| Basic \| \$10 \|/);
  }
});

test('one product never shows conflicting free-tier values', () => {
  const url = 'https://alpha.example/pricing';
  const pack = extractFactsPack({ generatedAt: '2026-09-30T00:00:00Z', results: [{ url,
    adapterData: applySourceAdapter(url, '<script type="application/ld+json">' + JSON.stringify({ '@type': 'Product',
      name: 'Alpha', offers: { name: 'Pro', price: '20', priceCurrency: 'USD' } }) + '</script>'),
    extracted: { excerpt: 'Free $0 per month' } }] });
  const rows = buildPricingDiff([pack]).split('\n').filter(line => /\| (?:Free|Pro) \|/.test(line));
  assert.equal(rows.length, 2);
  assert.equal(rows.filter(row => /\| (?:Yes|No) \|/.test(row)).length, 1);
});

test('a page-title identity labels only prices from its own page', () => {
  const pack = extractFactsPack({ generatedAt: '2026-09-30T00:00:00Z', results: [
    { url: 'https://alpha.example/pricing', title: 'Alpha Pricing', extracted: { excerpt: 'Starter $10 per month' } },
    { url: 'https://reviews.example/beta', extracted: { excerpt: 'Enterprise $99 per month' } },
  ] });
  const diff = buildPricingDiff([pack]);
  assert.match(diff, /\| Alpha \| Starter \| \$10 \|/);
  assert.match(diff, /\| reviews\.example \| Enterprise \| \$99 \|/);
  assert.match(formatFactsBlock(pack, { format: 'markdown' }), /\*\*Starter:\*\* \$10/);
});

test('an identity from a page without prices does not label prices from another host', () => {
  const pack = extractFactsPack({ generatedAt: '2026-09-30T00:00:00Z', results: [
    { url: 'https://alpha.example/', title: 'Alpha Pricing', extracted: { excerpt: 'Alpha helps teams ship.' } },
    { url: 'https://reviews.example/beta', extracted: { excerpt: 'Enterprise $99 per month' } },
  ] });
  assert.ok(pack.facts.some(fact => fact.field === 'product' && fact.value === 'Alpha'));
  const diff = buildPricingDiff([pack]);
  assert.match(diff, /\| reviews\.example \| Enterprise \| \$99 \|/);
  assert.doesNotMatch(diff, /\| Alpha \| Enterprise/);
});
