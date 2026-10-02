import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildCacheKey,
  buildPrimarySource,
  collectResearch,
  extractFactsPack,
  readCachePack,
} from '../scripts/collect-research.mjs';

test('primary source context retains short headings and table cells with retrieval metadata', () => {
  const body = '<html><body><main><h2 class="tier">Starter</h2><table><tr><th>Plan</th><th>Price</th></tr><tr><td class="plan">Starter</td><td>$8</td></tr></table></main></body></html>';
  const primary = buildPrimarySource({
    url: 'https://example.com/pricing', body, contentType: 'text/html',
    retrievedAt: '2026-04-01T00:00:00Z', excerptChars: 40,
  });
  assert.equal(primary.kind, 'primary-passage');
  assert.equal(primary.url, 'https://example.com/pricing');
  assert.equal(primary.retrievedAt, '2026-04-01T00:00:00Z');
  assert.match(primary.context, /Starter\nPlan\nPrice\nStarter\n\$8/);
  assert.ok(primary.context.includes(primary.passage));
  assert.match(primary.contentSha256, /^[0-9a-f]{64}$/);
  assert.equal(primary.contextTruncated, false);
});

test('non-text response does not become a primary passage', () => {
  assert.equal(buildPrimarySource({
    url: 'https://example.com/file', body: '{}', contentType: 'application/json',
    retrievedAt: '2026-04-01T00:00:00Z',
  }), null);
});

test('direct URL capture works without search provider and retains final source identity', { concurrency: false }, async (t) => {
  const cwd = await createTempDir(t);
  const fetchedUrls = [];
  const result = await collectResearch({
    urls: ['https://example.com/start', 'https://example.com/file.pdf'],
    mode: 'auto', outDir: 'direct-output', cacheTtlHours: 24,
  }, {
    cwd, now: new Date('2026-04-01T00:00:00Z'), logger: NOOP_LOGGER,
    publicSourceFetch: async (url) => {
      fetchedUrls.push(url);
      if (url.endsWith('.pdf')) return {
        ok: false, requestedUrl: url, finalUrl: url, redirects: [],
        status: 200, contentType: 'application/pdf', maxBytes: 1024 * 1024,
        error: 'unsupported-content-type',
      };
      return {
        ok: true, requestedUrl: url, finalUrl: 'https://example.com/pricing',
        redirects: [{ from: url, to: 'https://example.com/pricing', status: 301 }],
        status: 200, contentType: 'text/html', maxBytes: 1024 * 1024,
        bytesRead: 120, body: '<html><title>Pricing</title><body><h2>Plan</h2><table><tr><th>Price</th></tr><tr><td>$8 per seat/month billed annually</td></tr></table></body></html>',
      };
    },
  });
  assert.deepEqual(fetchedUrls, ['https://example.com/start', 'https://example.com/file.pdf']);
  assert.equal(result.pack.providerStatus, 'direct-url');
  assert.equal(result.pack.escalation.status, 'needs-interactive-followup');
  assert.equal(result.pack.results[0].primarySource.url, 'https://example.com/pricing');
  assert.match(result.pack.results[0].primarySource.context, /Plan\nPrice\n\$8/);
  assert.equal(result.pack.results[0].fetched.redirects.length, 1);
  assert.equal(result.pack.results[1].primarySource, undefined);
  assert.equal(result.pack.results[1].fetched.error, 'unsupported-content-type');
  const saved = JSON.parse(await readFile(result.jsonPath, 'utf8'));
  assert.equal(saved.results[0].primarySource.url, 'https://example.com/pricing');
});

const NOOP_LOGGER = {
  log() {},
  warn() {},
};

function createArgs(overrides = {}) {
  return {
    query: 'mid-market AI support pricing',
    provider: 'auto',
    mode: 'standard',
    maxResults: 1,
    minUsableSources: 1,
    cacheTtlHours: 24,
    outDir: 'research-output',
    ...overrides,
  };
}

function createProviderPlan(overrides = {}) {
  return {
    providers: ['fixture'],
    providerStatus: 'configured',
    providerNote: '',
    ...overrides,
  };
}

function createEvidencePack(overrides = {}) {
  return {
    generatedAt: '2026-04-01T00:00:00.000Z',
    query: 'acme pricing',
    mode: 'standard',
    providerRequest: 'fixture',
    providerStatus: 'configured',
    providersAttempted: ['fixture'],
    escalation: {
      status: 'complete',
      nextAction: 'Programmatic retrieval reached the target evidence threshold.',
      suggestedInteractiveQueries: [],
      coverage: {
        totalResults: 1,
        successfulFetches: 1,
        usableSources: 1,
        uniqueDomains: 1,
        thinCoverage: false,
      },
      stages: [],
    },
    results: [],
    ...overrides,
  };
}

async function createTempDir(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'shipwright-research-cache-'));
  t.after(async () => {
    await rm(dir, { recursive: true, force: true });
  });
  return dir;
}

let searchCalls = null;
const FIXTURE_SEARCH = {
  fixture: async (query) => {
    searchCalls?.push(`search:${query}`);
    return [{
      rank: 1,
      title: 'Pricing Example',
      url: 'https://example.com/pricing',
      site: '',
      searchSnippet: 'A compact pricing summary for testing cache behavior.',
      published: '',
    }];
  },
};

function mockProviderFetch(t) {
  const originalFetch = globalThis.fetch;
  const calls = [];
  searchCalls = calls;
  const html = `
    <html>
      <head>
        <title>Pricing Example</title>
        <meta name="description" content="Pricing example description" />
      </head>
      <body>
        <main>${'pricing evidence '.repeat(60)}</main>
      </body>
    </html>
  `;

  globalThis.fetch = async (url) => {
    const target = String(url);
    calls.push(target);

    if (target === 'https://example.com/pricing') {
      return new Response(html, {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=utf-8',
        },
      });
    }

    throw new Error(`Unexpected fetch: ${target}`);
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  return calls;
}

test('buildCacheKey uses resolved maxPages and ignores providerNote', { concurrency: false }, () => {
  const argsWithoutMaxPages = createArgs({ maxResults: 5 });
  const argsWithMaxPages = createArgs({ maxResults: 5, maxPages: 5 });

  const keyWithoutMaxPages = buildCacheKey(argsWithoutMaxPages, createProviderPlan({ providerNote: 'first note' }));
  const keyWithMaxPages = buildCacheKey(argsWithMaxPages, createProviderPlan({ providerNote: 'second note' }));

  assert.equal(keyWithoutMaxPages, keyWithMaxPages);
});

test('buildCacheKey changes when keyed inputs change', { concurrency: false }, () => {
  const baseArgs = createArgs();
  const basePlan = createProviderPlan();
  const baseKey = buildCacheKey(baseArgs, basePlan);

  assert.notEqual(baseKey, buildCacheKey(createArgs({ query: 'different query' }), basePlan));
  assert.notEqual(baseKey, buildCacheKey(createArgs({ provider: 'other' }), basePlan));
  assert.notEqual(baseKey, buildCacheKey(createArgs({ mode: 'deep' }), basePlan));
  assert.notEqual(baseKey, buildCacheKey(createArgs({ excerptChars: 500 }), basePlan));
  assert.notEqual(baseKey, buildCacheKey(baseArgs, createProviderPlan({ providers: ['fixture', 'other'] })));
});

test('extractFactsPack emits attributed atomic pricing facts from representative evidence', { concurrency: false }, () => {
  const factsPack = extractFactsPack(createEvidencePack({
    results: [
      {
        title: 'Acme Pricing',
        url: 'https://acme.com/pricing',
        searchSnippet: 'Starter starts at $29 per user / month for small teams.',
        published: '2026-03-15',
        fetched: {
          ok: true,
          status: 200,
          finalUrl: 'https://acme.com/pricing',
        },
        extracted: {
          title: 'Pricing | Acme',
          description: 'Plans for growing teams.',
          excerpt: 'Starter - $29 per user / month for up to 10 seats.\nBusiness plans are available for larger teams.',
          wordCount: 20,
        },
      },
    ],
  }), {
    extractedAt: '2026-04-01T00:00:00.000Z',
    sourcePackPath: '/tmp/evidence.json',
  });

  assert.equal(factsPack.meta.version, 1);
  assert.equal(factsPack.meta.sourcePackPath, '/tmp/evidence.json');
  assert.match(factsPack.meta.coverageHint, /usable=1/);

  assert.ok(factsPack.facts.find((fact) => fact.field === 'company' && fact.value === 'Acme'));
  assert.ok(factsPack.facts.find((fact) => fact.field === 'product' && fact.value === 'Acme'));
  assert.ok(factsPack.facts.find((fact) => fact.field === 'plan_name' && fact.value === 'Starter'));
  assert.ok(factsPack.facts.find((fact) => fact.field === 'price' && fact.value === '29'));
  assert.ok(factsPack.facts.find((fact) => fact.field === 'currency' && fact.value === 'USD'));
  assert.ok(factsPack.facts.find((fact) => fact.field === 'billing_period' && fact.value === 'user/month'));
  assert.ok(factsPack.facts.find((fact) => fact.field === 'published_or_observed_date' && fact.value === '2026-03-15'));

  for (const fact of factsPack.facts) {
    assert.ok(fact.source_url);
    assert.ok(fact.excerpt);
    assert.equal(fact.observed_at, '2026-04-01T00:00:00.000Z');
  }
});

test('extractFactsPack stays sparse when values are ambiguous or missing', { concurrency: false }, () => {
  const factsPack = extractFactsPack(createEvidencePack({
    query: 'generic market overview',
    escalation: {
      status: 'needs-interactive-followup',
      nextAction: 'Use interactive WebSearch/WebFetch only for the unresolved gaps.',
      suggestedInteractiveQueries: ['generic market overview pricing'],
      coverage: {
        totalResults: 1,
        successfulFetches: 1,
        usableSources: 0,
        uniqueDomains: 1,
        thinCoverage: true,
      },
      stages: [],
    },
    results: [
      {
        title: 'Market overview',
        url: 'https://example.com/blog/post',
        searchSnippet: 'Pricing ranges from $20 to $40 depending on usage.',
        published: '3 days ago',
        fetched: {
          ok: true,
          status: 200,
          finalUrl: 'https://example.com/blog/post',
        },
        extracted: {
          title: 'Market overview',
          description: 'Broad overview without stable product facts.',
          excerpt: 'Pricing ranges from $20 to $40 depending on usage and contract length.',
          wordCount: 12,
        },
      },
    ],
  }), {
    extractedAt: '2026-04-01T00:00:00.000Z',
    sourcePackPath: '/tmp/evidence.json',
  });

  assert.equal(factsPack.facts.length, 0);
  assert.match(factsPack.meta.notes.join(' '), /No deterministic facts were extracted/);
  assert.match(factsPack.meta.notes.join(' '), /Coverage was thin/);
});

test('configured-provider run writes cache on miss and reuses it on hit without network calls', { concurrency: false }, async (t) => {
  const cwd = await createTempDir(t);
  const calls = mockProviderFetch(t);
  const first = await collectResearch(createArgs(), {
    cwd,
    searchProviders: FIXTURE_SEARCH,
    now: new Date('2026-04-01T00:00:00.000Z'),
    logger: NOOP_LOGGER,
  });

  assert.equal(first.pack.cache.status, 'miss');
  assert.equal(first.pack.cache.persisted, true);
  assert.equal(calls.length, 2);
  assert.equal(first.pack.results[0].primarySource.kind, 'primary-passage');
  assert.ok(first.pack.results[0].primarySource.context.includes('pricing evidence'));
  assert.equal(first.factsPathLabel, path.join('research-output', 'facts.json'));

  const cacheKey = buildCacheKey(createArgs(), createProviderPlan());
  const cachedPack = await readCachePack(path.join(cwd, '.shipwright', 'cache', 'research', 'v1', cacheKey));
  assert.ok(cachedPack);
  assert.equal(cachedPack.cache.status, 'miss');

  const factsJson = JSON.parse(await readFile(first.factsPath, 'utf8'));
  assert.equal(factsJson.meta.query, 'mid-market AI support pricing');
  assert.ok(factsJson.facts.every((fact) => Boolean(fact.source_url)));

  const evidenceJson = JSON.parse(await readFile(first.jsonPath, 'utf8'));
  assert.equal(evidenceJson.results[0].primarySource.kind, 'primary-passage');

  const cachedFactsJson = JSON.parse(await readFile(path.join(cwd, '.shipwright', 'cache', 'research', 'v1', cacheKey, 'facts.json'), 'utf8'));
  assert.equal(cachedFactsJson.meta.query, 'mid-market AI support pricing');

  globalThis.fetch = async () => {
    throw new Error('Fetch should not be called on a cache hit.');
  };

  const second = await collectResearch(createArgs({ outDir: 'research-output-hit' }), {
    cwd,
    searchProviders: FIXTURE_SEARCH,
    now: new Date('2026-04-01T01:00:00.000Z'),
    logger: NOOP_LOGGER,
  });

  assert.equal(second.pack.cache.status, 'hit');
  assert.equal(second.pack.cache.persisted, true);
  assert.equal(second.pack.generatedAt, first.pack.generatedAt);
  assert.equal(second.pack.cache.storedAt, first.pack.cache.storedAt);

  const markdown = await readFile(path.join(cwd, 'research-output-hit', 'evidence.md'), 'utf8');
  assert.match(markdown, /## Cache Summary/);
  assert.match(markdown, /- Status: hit/);

  const hitFactsJson = JSON.parse(await readFile(path.join(cwd, 'research-output-hit', 'facts.json'), 'utf8'));
  assert.equal(hitFactsJson.meta.sourcePackPath, path.join(cwd, 'research-output-hit', 'evidence.json'));
});

test('stale cache entry refreshes and preserves previous cache metadata', { concurrency: false }, async (t) => {
  const cwd = await createTempDir(t);
  let calls = mockProviderFetch(t);
  const first = await collectResearch(createArgs(), {
    cwd,
    searchProviders: FIXTURE_SEARCH,
    now: new Date('2026-04-01T00:00:00.000Z'),
    logger: NOOP_LOGGER,
  });

  assert.equal(first.pack.cache.status, 'miss');
  assert.equal(calls.length, 2);

  calls.length = 0;
  const refreshed = await collectResearch(createArgs({ outDir: 'research-output-refresh' }), {
    cwd,
    searchProviders: FIXTURE_SEARCH,
    now: new Date('2026-04-02T01:00:00.000Z'),
    logger: NOOP_LOGGER,
  });

  assert.equal(refreshed.pack.cache.status, 'refresh');
  assert.equal(refreshed.pack.cache.persisted, true);
  assert.equal(refreshed.pack.cache.previousStoredAt, first.pack.cache.storedAt);
  assert.equal(refreshed.pack.cache.previousAgeMs, 25 * 60 * 60 * 1000);
  assert.equal(calls.length, 2);
});

test('corrupt cache falls back to normal retrieval', { concurrency: false }, async (t) => {
  const cwd = await createTempDir(t);
  const calls = mockProviderFetch(t);
  await collectResearch(createArgs(), {
    cwd,
    searchProviders: FIXTURE_SEARCH,
    now: new Date('2026-04-01T00:00:00.000Z'),
    logger: NOOP_LOGGER,
  });

  const cacheKey = buildCacheKey(createArgs(), createProviderPlan());
  const cacheJsonPath = path.join(cwd, '.shipwright', 'cache', 'research', 'v1', cacheKey, 'evidence.json');
  await writeFile(cacheJsonPath, '{not-json}\n', 'utf8');

  calls.length = 0;

  const result = await collectResearch(createArgs({ outDir: 'research-output-corrupt' }), {
    cwd,
    searchProviders: FIXTURE_SEARCH,
    now: new Date('2026-04-01T02:00:00.000Z'),
    logger: NOOP_LOGGER,
  });

  assert.equal(result.pack.cache.status, 'miss');
  assert.equal(result.pack.cache.persisted, true);
  assert.equal(calls.length, 2);
});

test('no-provider run writes output but does not create a cache entry', { concurrency: false }, async (t) => {
  const cwd = await createTempDir(t);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error('Fetch should not be called without a configured provider.');
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const result = await collectResearch(createArgs({ outDir: 'research-output-no-provider' }), {
    cwd,
    now: new Date('2026-04-01T00:00:00.000Z'),
    logger: NOOP_LOGGER,
  });

  assert.equal(result.pack.providerStatus, 'not-configured');
  assert.equal(result.pack.cache.status, 'miss');
  assert.equal(result.pack.cache.persisted, false);
  assert.equal(result.pack.cache.skipReason, 'provider-not-configured');

  const cacheKey = buildCacheKey(createArgs(), {
    providers: [],
    providerStatus: 'not-configured',
    providerNote: 'No search provider configured.',
  });
  const cachedPack = await readCachePack(path.join(cwd, '.shipwright', 'cache', 'research', 'v1', cacheKey));
  assert.equal(cachedPack, null);

  const json = await readFile(path.join(cwd, 'research-output-no-provider', 'evidence.json'), 'utf8');
  assert.match(json, /"providerStatus": "not-configured"/);

  const factsJson = JSON.parse(await readFile(path.join(cwd, 'research-output-no-provider', 'facts.json'), 'utf8'));
  assert.equal(factsJson.facts.length, 0);
  assert.match(factsJson.meta.notes.join(' '), /no built-in search provider/);
});

test('clear-cache removes cached entries without requiring a query', { concurrency: false }, async (t) => {
  const cwd = await createTempDir(t);
  mockProviderFetch(t);
  await collectResearch(createArgs(), {
    cwd,
    searchProviders: FIXTURE_SEARCH,
    now: new Date('2026-04-01T00:00:00.000Z'),
    logger: NOOP_LOGGER,
  });

  const cacheKey = buildCacheKey(createArgs(), createProviderPlan());
  const cacheDir = path.join(cwd, '.shipwright', 'cache', 'research', 'v1', cacheKey);
  assert.ok(await readCachePack(cacheDir));

  const cleared = await collectResearch({ clearCache: true }, {
    cwd,
    now: new Date('2026-04-01T03:00:00.000Z'),
    logger: NOOP_LOGGER,
  });

  assert.equal(cleared.cacheCleared, true);
  assert.equal(cleared.cleared, true);
  assert.equal(await readCachePack(cacheDir), null);

  const clearedAgain = await collectResearch({ clearCache: true }, {
    cwd,
    now: new Date('2026-04-01T04:00:00.000Z'),
    logger: NOOP_LOGGER,
  });

  assert.equal(clearedAgain.cacheCleared, true);
  assert.equal(clearedAgain.cleared, false);
});

// ---------------------------------------------------------------------------
// v2 fact extractor — adapter facts
// ---------------------------------------------------------------------------

test('extractFactsPack converts adapterData fields into source-attributed facts', { concurrency: false }, () => {
  const factsPack = extractFactsPack(createEvidencePack({
    results: [
      {
        title: 'Acme',
        url: 'https://acme.com/pricing',
        searchSnippet: '',
        published: '',
        fetched: {
          ok: true,
          status: 200,
          finalUrl: 'https://acme.com/pricing',
        },
        extracted: {
          title: 'Acme Pricing',
          description: '',
          excerpt: '',
          wordCount: 0,
        },
        adapterData: {
          adapterName: 'json-ld',
          fields: [
            { field: 'product_name', value: 'Acme Pro', confidence: 'high' },
            { field: 'star_rating', value: '4.7', confidence: 'high' },
            { field: 'review_count', value: '2350', confidence: 'high' },
          ],
        },
      },
    ],
  }), {
    extractedAt: '2026-04-01T00:00:00.000Z',
    sourcePackPath: '/tmp/evidence.json',
  });

  assert.ok(factsPack.facts.find((f) => f.field === 'product_name' && f.value === 'Acme Pro'));
  assert.ok(factsPack.facts.find((f) => f.field === 'star_rating' && f.value === '4.7'));
  assert.ok(factsPack.facts.find((f) => f.field === 'review_count' && f.value === '2350'));

  // All adapter facts should be source-attributed
  for (const fact of factsPack.facts.filter((f) => f.field === 'star_rating')) {
    assert.ok(fact.source_url, 'adapter facts must have source_url');
    assert.equal(fact.confidence_hint, 'high');
  }
});

// ---------------------------------------------------------------------------
// v2 fact extractor — review facts from text patterns
// ---------------------------------------------------------------------------

test('extractFactsPack extracts review_count and star_rating from text patterns', { concurrency: false }, () => {
  const factsPack = extractFactsPack(createEvidencePack({
    results: [
      {
        title: 'Acme Reviews',
        url: 'https://g2.com/products/acme',
        searchSnippet: 'Acme has 1,234 reviews and is rated 4.5 out of 5 stars.',
        published: '',
        fetched: {
          ok: true,
          status: 200,
          finalUrl: 'https://g2.com/products/acme',
        },
        extracted: {
          title: 'Acme Reviews',
          description: 'Based on 1,234 reviews.',
          excerpt: 'Acme scored 4.5/5 stars across 1,234 reviews.',
          wordCount: 40,
        },
      },
    ],
  }), {
    extractedAt: '2026-04-01T00:00:00.000Z',
    sourcePackPath: '/tmp/evidence.json',
  });

  assert.ok(factsPack.facts.find((f) => f.field === 'review_count'), 'should extract review_count');
  assert.ok(factsPack.facts.find((f) => f.field === 'star_rating'), 'should extract star_rating');
});

test('extractFactsPack skips text-pattern review facts when adapter already provided them', { concurrency: false }, () => {
  const factsPack = extractFactsPack(createEvidencePack({
    results: [
      {
        title: 'Acme',
        url: 'https://acme.com',
        searchSnippet: 'Acme has 1,234 reviews and rated 4.5 out of 5 stars.',
        published: '',
        fetched: { ok: true, status: 200, finalUrl: 'https://acme.com' },
        extracted: { title: '', description: '', excerpt: '', wordCount: 40 },
        adapterData: {
          adapterName: 'json-ld',
          fields: [
            { field: 'star_rating', value: '4.7', confidence: 'high' },
            { field: 'review_count', value: '9999', confidence: 'high' },
          ],
        },
      },
    ],
  }), {
    extractedAt: '2026-04-01T00:00:00.000Z',
    sourcePackPath: '/tmp/evidence.json',
  });

  // Should have the adapter's values, not the text-pattern values
  const starRatings = factsPack.facts.filter((f) => f.field === 'star_rating');
  assert.ok(starRatings.length >= 1);
  // Adapter value should be present
  assert.ok(starRatings.find((f) => f.value === '4.7'), 'adapter star_rating should be present');
  // Text-pattern value should not be present when adapter provided the field
  assert.equal(starRatings.find((f) => f.value === '4.5'), undefined, 'text-pattern star_rating should be suppressed when adapter provides it');
});

// ---------------------------------------------------------------------------
// v2 fact extractor — acquisition facts
// ---------------------------------------------------------------------------

test('extractFactsPack extracts acquisition facts from active-voice pattern', { concurrency: false }, () => {
  const factsPack = extractFactsPack(createEvidencePack({
    results: [
      {
        title: 'Acquisition News',
        url: 'https://techcrunch.com/2025/acquisition',
        searchSnippet: 'Microsoft acquired GitHub in 2018 for $7.5 billion.',
        published: '2025-01-15',
        fetched: { ok: true, status: 200, finalUrl: 'https://techcrunch.com/2025/acquisition' },
        extracted: {
          title: 'Microsoft acquired GitHub',
          description: 'Microsoft acquired GitHub in 2018.',
          excerpt: 'Microsoft acquired GitHub in 2018 for $7.5 billion.',
          wordCount: 50,
        },
      },
    ],
  }), {
    extractedAt: '2026-04-01T00:00:00.000Z',
    sourcePackPath: '/tmp/evidence.json',
  });

  assert.ok(factsPack.facts.find((f) => f.field === 'acquisition_event' && f.value === 'true'));
  assert.ok(factsPack.facts.find((f) => f.field === 'acquirer' && f.value === 'Microsoft'));
  assert.ok(factsPack.facts.find((f) => f.field === 'acquired_company' && f.value === 'GitHub'));
});

test('extractFactsPack extracts acquisition facts from passive-voice pattern', { concurrency: false }, () => {
  const factsPack = extractFactsPack(createEvidencePack({
    results: [
      {
        title: 'Acquisition',
        url: 'https://example.com/news',
        searchSnippet: 'Figma was acquired by Adobe in 2022.',
        published: '',
        fetched: { ok: true, status: 200, finalUrl: 'https://example.com/news' },
        extracted: {
          title: '',
          description: 'Figma was acquired by Adobe.',
          excerpt: 'Figma was acquired by Adobe in 2022.',
          wordCount: 30,
        },
      },
    ],
  }), {
    extractedAt: '2026-04-01T00:00:00.000Z',
    sourcePackPath: '/tmp/evidence.json',
  });

  assert.ok(factsPack.facts.find((f) => f.field === 'acquisition_event'));
  assert.ok(factsPack.facts.find((f) => f.field === 'acquirer' && f.value === 'Adobe'));
  assert.ok(factsPack.facts.find((f) => f.field === 'acquired_company' && f.value === 'Figma'));
});

// ---------------------------------------------------------------------------
// v2 fact extractor — funding facts
// ---------------------------------------------------------------------------

test('extractFactsPack extracts funding_event from "raised ... Series A" pattern', { concurrency: false }, () => {
  const factsPack = extractFactsPack(createEvidencePack({
    results: [
      {
        title: 'Funding News',
        url: 'https://techcrunch.com/funding',
        searchSnippet: 'The company announced it raised $15M in a Series A round led by Accel.',
        published: '',
        fetched: { ok: true, status: 200, finalUrl: 'https://techcrunch.com/funding' },
        extracted: {
          title: '',
          description: '',
          excerpt: 'The company raised $15M in a Series A round.',
          wordCount: 30,
        },
      },
    ],
  }), {
    extractedAt: '2026-04-01T00:00:00.000Z',
    sourcePackPath: '/tmp/evidence.json',
  });

  assert.ok(
    factsPack.facts.find((f) => f.field === 'funding_event' && f.value === 'Series A'),
    'should extract Series A funding event',
  );
});

test('extractFactsPack extracts funding_event from Seed round pattern', { concurrency: false }, () => {
  const factsPack = extractFactsPack(createEvidencePack({
    results: [
      {
        title: 'Startup raises seed',
        url: 'https://news.com/seed',
        searchSnippet: 'Startup closed a $2M Seed round from angel investors.',
        published: '',
        fetched: { ok: true, status: 200, finalUrl: 'https://news.com/seed' },
        extracted: { title: '', description: '', excerpt: 'Startup closed a $2M Seed round.', wordCount: 20 },
      },
    ],
  }), {
    extractedAt: '2026-04-01T00:00:00.000Z',
    sourcePackPath: '/tmp/evidence.json',
  });

  assert.ok(
    factsPack.facts.find((f) => f.field === 'funding_event' && f.value === 'Seed'),
  );
});

// ---------------------------------------------------------------------------
// v2 fact extractor — platform facts
// ---------------------------------------------------------------------------

test('extractFactsPack extracts supported_platform when availability context is present', { concurrency: false }, () => {
  const factsPack = extractFactsPack(createEvidencePack({
    results: [
      {
        title: 'DevTool',
        url: 'https://devtool.io',
        searchSnippet: 'Available for Windows, macOS, and Linux.',
        published: '',
        fetched: { ok: true, status: 200, finalUrl: 'https://devtool.io' },
        extracted: {
          title: '',
          description: 'Available for Windows, macOS, and Linux.',
          excerpt: '',
          wordCount: 10,
        },
      },
    ],
  }), {
    extractedAt: '2026-04-01T00:00:00.000Z',
    sourcePackPath: '/tmp/evidence.json',
  });

  const platforms = factsPack.facts
    .filter((f) => f.field === 'supported_platform')
    .map((f) => f.value);

  assert.ok(platforms.includes('Windows'), 'should extract Windows');
  assert.ok(platforms.includes('macOS'), 'should extract macOS');
  assert.ok(platforms.includes('Linux'), 'should extract Linux');
});

test('extractFactsPack does not extract platforms without availability context', { concurrency: false }, () => {
  // Incidental mention of Windows without "available for / supports" context
  const factsPack = extractFactsPack(createEvidencePack({
    results: [
      {
        title: 'Blog Post',
        url: 'https://blog.example.com/post',
        searchSnippet: 'The developer was previously at Microsoft Windows division.',
        published: '',
        fetched: { ok: true, status: 200, finalUrl: 'https://blog.example.com/post' },
        extracted: {
          title: '',
          description: 'A developer blog post discussing Microsoft Windows.',
          excerpt: 'The developer worked on Windows before joining the startup.',
          wordCount: 30,
        },
      },
    ],
  }), {
    extractedAt: '2026-04-01T00:00:00.000Z',
    sourcePackPath: '/tmp/evidence.json',
  });

  const platformFacts = factsPack.facts.filter((f) => f.field === 'supported_platform');
  assert.equal(platformFacts.length, 0, 'should not extract platforms from incidental mentions');
});

test('search keys in the environment or .env are never read or sent', { concurrency: false }, async (t) => {
  const cwd = await createTempDir(t);
  await writeFile(path.join(cwd, '.env'), 'BRAVE_SEARCH_API_KEY=from-dotenv\nTAVILY_API_KEY=from-dotenv\n', 'utf8');
  const previous = process.env.BRAVE_SEARCH_API_KEY;
  process.env.BRAVE_SEARCH_API_KEY = 'from-environment';
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => { throw new Error(`Unexpected fetch: ${url}`); };
  t.after(() => {
    globalThis.fetch = originalFetch;
    if (previous === undefined) delete process.env.BRAVE_SEARCH_API_KEY; else process.env.BRAVE_SEARCH_API_KEY = previous;
  });

  const result = await collectResearch(createArgs({ provider: 'brave', outDir: 'research-output-keys' }), {
    cwd,
    now: new Date('2026-04-01T00:00:00.000Z'),
    logger: NOOP_LOGGER,
  });

  assert.equal(result.pack.providerStatus, 'not-configured');
  assert.deepEqual(result.pack.providersAttempted, []);
  assert.equal(process.env.TAVILY_API_KEY, undefined);
});
