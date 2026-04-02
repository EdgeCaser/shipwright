import assert from 'node:assert/strict';
import test from 'node:test';

import { applySourceAdapter } from '../scripts/source-adapters.mjs';

// ---------------------------------------------------------------------------
// JSON-LD adapter — Product with Offer
// ---------------------------------------------------------------------------

test('applySourceAdapter extracts product name, price, and currency from JSON-LD Product', { concurrency: false }, () => {
  const html = `
    <html>
    <head>
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Acme Pro",
          "offers": {
            "@type": "Offer",
            "price": "99",
            "priceCurrency": "USD",
            "name": "Pro Plan"
          }
        }
      </script>
    </head>
    <body>Acme Pro pricing page</body>
    </html>
  `;

  const result = applySourceAdapter('https://acme.com/pricing', html);

  assert.ok(result, 'should return a result');
  assert.equal(result.adapterName, 'json-ld');
  assert.ok(result.fields.find((f) => f.field === 'product_name' && f.value === 'Acme Pro'));
  assert.ok(result.fields.find((f) => f.field === 'price' && f.value === '99'));
  assert.ok(result.fields.find((f) => f.field === 'currency' && f.value === 'USD'));
  assert.ok(result.fields.find((f) => f.field === 'plan_name' && f.value === 'Pro Plan'));

  // All extracted fields should have high or medium confidence
  for (const field of result.fields) {
    assert.ok(['high', 'medium'].includes(field.confidence), `unexpected confidence: ${field.confidence}`);
  }
});

// ---------------------------------------------------------------------------
// JSON-LD adapter — AggregateRating embedded in Product
// ---------------------------------------------------------------------------

test('applySourceAdapter extracts star_rating and review_count from AggregateRating in Product', { concurrency: false }, () => {
  const html = `
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Widget",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.5",
          "reviewCount": 1234
        }
      }
    </script>
  `;

  const result = applySourceAdapter('https://example.com/widget', html);

  assert.ok(result);
  assert.ok(result.fields.find((f) => f.field === 'star_rating' && f.value === '4.5'));
  assert.ok(result.fields.find((f) => f.field === 'review_count' && f.value === '1234'));
  // Confidence should be high for schema-sourced values
  const ratingField = result.fields.find((f) => f.field === 'star_rating');
  assert.equal(ratingField.confidence, 'high');
});

// ---------------------------------------------------------------------------
// JSON-LD adapter — @graph wrapper
// ---------------------------------------------------------------------------

test('applySourceAdapter handles @graph wrapper', { concurrency: false }, () => {
  const html = `
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "AggregateRating",
            "ratingValue": "4.2",
            "reviewCount": 567
          }
        ]
      }
    </script>
  `;

  const result = applySourceAdapter('https://example.com/product', html);

  assert.ok(result);
  assert.ok(result.fields.find((f) => f.field === 'star_rating' && f.value === '4.2'));
  assert.ok(result.fields.find((f) => f.field === 'review_count' && f.value === '567'));
});

// ---------------------------------------------------------------------------
// JSON-LD adapter — SoftwareApplication type
// ---------------------------------------------------------------------------

test('applySourceAdapter handles SoftwareApplication @type', { concurrency: false }, () => {
  const html = `
    <script type="application/ld+json">
      {
        "@type": "SoftwareApplication",
        "name": "DevTool Pro",
        "offers": { "price": "49", "priceCurrency": "EUR" }
      }
    </script>
  `;

  const result = applySourceAdapter('https://devtool.io/pricing', html);

  assert.ok(result);
  assert.ok(result.fields.find((f) => f.field === 'product_name' && f.value === 'DevTool Pro'));
  assert.ok(result.fields.find((f) => f.field === 'price' && f.value === '49'));
  assert.ok(result.fields.find((f) => f.field === 'currency' && f.value === 'EUR'));
});

// ---------------------------------------------------------------------------
// JSON-LD adapter — multiple offers (array)
// ---------------------------------------------------------------------------

test('applySourceAdapter extracts all offers when offers is an array', { concurrency: false }, () => {
  const html = `
    <script type="application/ld+json">
      {
        "@type": "Product",
        "name": "MultiPlan",
        "offers": [
          { "price": "29", "priceCurrency": "USD", "name": "Starter" },
          { "price": "99", "priceCurrency": "USD", "name": "Pro" }
        ]
      }
    </script>
  `;

  const result = applySourceAdapter('https://multiplan.com/pricing', html);

  assert.ok(result);
  assert.ok(result.fields.find((f) => f.field === 'plan_name' && f.value === 'Starter'));
  assert.ok(result.fields.find((f) => f.field === 'plan_name' && f.value === 'Pro'));
  assert.ok(result.fields.find((f) => f.field === 'price' && f.value === '29'));
  assert.ok(result.fields.find((f) => f.field === 'price' && f.value === '99'));
});

// ---------------------------------------------------------------------------
// JSON-LD adapter — ratingCount fallback
// ---------------------------------------------------------------------------

test('applySourceAdapter uses ratingCount when reviewCount is absent', { concurrency: false }, () => {
  const html = `
    <script type="application/ld+json">
      {
        "@type": "AggregateRating",
        "ratingValue": "3.8",
        "ratingCount": 99
      }
    </script>
  `;

  const result = applySourceAdapter('https://example.com/p', html);

  assert.ok(result);
  assert.ok(result.fields.find((f) => f.field === 'review_count' && f.value === '99'));
});

// ---------------------------------------------------------------------------
// JSON-LD adapter — rejects out-of-range star rating
// ---------------------------------------------------------------------------

test('applySourceAdapter rejects star rating > 5', { concurrency: false }, () => {
  const html = `
    <script type="application/ld+json">
      {
        "@type": "AggregateRating",
        "ratingValue": "9.5",
        "reviewCount": 100
      }
    </script>
  `;

  const result = applySourceAdapter('https://example.com/p', html);

  // review_count may still be extracted but star_rating should not be
  if (result) {
    assert.equal(result.fields.find((f) => f.field === 'star_rating'), undefined);
  }
});

// ---------------------------------------------------------------------------
// JSON-LD adapter — deduplication
// ---------------------------------------------------------------------------

test('applySourceAdapter deduplicates identical field+value pairs', { concurrency: false }, () => {
  const html = `
    <script type="application/ld+json">
      {
        "@type": "Product",
        "name": "Acme",
        "offers": [
          { "price": "29", "priceCurrency": "USD" },
          { "price": "29", "priceCurrency": "USD" }
        ]
      }
    </script>
  `;

  const result = applySourceAdapter('https://acme.com/pricing', html);

  assert.ok(result);
  const priceFields = result.fields.filter((f) => f.field === 'price' && f.value === '29');
  assert.equal(priceFields.length, 1, 'duplicate price fields should be deduped');
});

// ---------------------------------------------------------------------------
// Malformed / missing structured data
// ---------------------------------------------------------------------------

test('applySourceAdapter returns null for pages with no structured data', { concurrency: false }, () => {
  const html = '<html><body><p>Generic page with no structured data or JSON-LD.</p></body></html>';
  assert.equal(applySourceAdapter('https://example.com/page', html), null);
});

test('applySourceAdapter fails soft on malformed JSON-LD', { concurrency: false }, () => {
  const html = `
    <html>
    <head>
      <script type="application/ld+json">{not valid json at all}</script>
    </head>
    <body>Some page</body>
    </html>
  `;

  // Must not throw — should return null
  let result;
  assert.doesNotThrow(() => {
    result = applySourceAdapter('https://example.com/page', html);
  });
  assert.equal(result, null);
});

test('applySourceAdapter returns null for empty inputs', { concurrency: false }, () => {
  assert.equal(applySourceAdapter('', ''), null);
  assert.equal(applySourceAdapter(null, null), null);
  assert.equal(applySourceAdapter('https://example.com', ''), null);
});

// ---------------------------------------------------------------------------
// npm adapter
// ---------------------------------------------------------------------------

test('applySourceAdapter extracts weekly_downloads from npm package page', { concurrency: false }, () => {
  // Minimal SSR'd structure that the npm adapter looks for
  const html = `
    <html>
    <body>
      <p>Weekly Downloads</p>
      <p><span>1,234,567</span></p>
    </body>
    </html>
  `;

  const result = applySourceAdapter('https://www.npmjs.com/package/express', html);

  assert.ok(result, 'should return a result for npm package page');
  assert.equal(result.adapterName, 'npm');
  assert.ok(result.fields.find((f) => f.field === 'weekly_downloads' && f.value === '1234567'));
});

test('applySourceAdapter does not apply npm adapter to non-npm URLs', { concurrency: false }, () => {
  const html = `<html><body><p>Weekly Downloads</p><p>1,000,000</p></body></html>`;

  // GitHub is not an npm page — should not use npm adapter
  const result = applySourceAdapter('https://github.com/expressjs/express', html);

  // May return null or JSON-LD result but must not return npm adapter result
  if (result) {
    assert.notEqual(result.adapterName, 'npm');
  }
});

test('applySourceAdapter prefers JSON-LD over npm when both match', { concurrency: false }, () => {
  // Page is at npmjs.com AND has JSON-LD — JSON-LD should win (tried first)
  const html = `
    <html>
    <head>
      <script type="application/ld+json">
        { "@type": "SoftwareApplication", "name": "my-pkg", "offers": { "price": "0" } }
      </script>
    </head>
    <body>
      <p>Weekly Downloads</p><p>50,000</p>
    </body>
    </html>
  `;

  const result = applySourceAdapter('https://www.npmjs.com/package/my-pkg', html);

  assert.ok(result);
  assert.equal(result.adapterName, 'json-ld', 'JSON-LD should take priority over npm adapter');
});
