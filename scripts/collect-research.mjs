#!/usr/bin/env node

import { createHash } from 'crypto';
import { mkdir, readFile, rm, stat, writeFile } from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

const HELP_TEXT = `Shipwright research collector

Build a compact evidence pack from programmatic web search so the model can
spend fewer tool calls and fewer tokens on raw retrieval.

The collector uses an internal escalation ladder:
  L1: primary query, small budget
  L2: automatic subqueries, same provider
  L3: secondary provider or deeper follow-up queries
  L4: explicit interactive-search follow-up recommendations

Usage:
  node scripts/collect-research.mjs --query "mid-market AI support pricing"

Options:
  --query <text>              Required. Search query to run.
  --provider <name>           brave | tavily | auto (default: auto)
  --mode <name>               standard | auto | deep (default: auto)
  --max-results <n>           Search results to collect in the first pass (default: 5)
  --max-pages <n>             Pages to fetch and extract in the first pass (default: same as max-results)
  --concurrency <n>           Parallel page fetches (default: 3)
  --timeout-ms <n>            Per-request timeout in ms (default: 12000)
  --subquery-limit <n>        Automatic subqueries to try in escalated passes (default: 3)
  --min-usable-sources <n>    Target number of usable sources before stopping (default: 3)
  --out-dir <path>            Output directory (default: .shipwright/research/<slug>-<timestamp>)
  --excerpt-chars <n>         Max chars per extracted excerpt (default: 1200)
  --cache-ttl-hours <n>       Fresh cache window in hours (default: 24)
  --clear-cache               Remove all entries under .shipwright/cache/research/v1 and exit
  --help                      Show this message

Providers:
  brave   Uses BRAVE_SEARCH_API_KEY
  tavily  Uses TAVILY_API_KEY
  auto    Uses the first configured provider and can escalate to the second

Outputs:
  evidence.json               Structured machine-readable results
  evidence.md                 AI-ready source digest
  facts.json                  Atomic source-attributed facts derived from evidence.json
                               v1 fields: company, product, plan_name, price, currency,
                               billing_period, published_or_observed_date, product_name,
                               star_rating, review_count, weekly_downloads, version,
                               acquisition_event, acquisition_date, acquirer,
                               acquired_company, funding_event, supported_platform
                               Only high and medium confidence_hint values are emitted.

Behavior:
  Loads .env from the current working directory if present.
  If no provider is configured, still writes a fallback evidence pack with
  'needs-interactive-followup' instead of failing.
  Source adapters run automatically when source-adapters.mjs is co-located.
  If the adapter module is missing, the collector continues without adapters.
`;

const DEFAULTS = {
  provider: 'auto',
  mode: 'auto',
  maxResults: 5,
  maxPages: undefined,
  concurrency: 3,
  timeoutMs: 12000,
  excerptChars: 1200,
  subqueryLimit: 3,
  minUsableSources: 3,
  cacheTtlHours: 24,
};

const CACHE_VERSION = 'v1';
const CACHE_ROOT = path.join('.shipwright', 'cache', 'research', CACHE_VERSION);

// ---------------------------------------------------------------------------
// Lazy source-adapter loader
// ---------------------------------------------------------------------------
// source-adapters.mjs must be co-located with this file (same directory).
// If it is missing — e.g. on a partial deployment — the collector continues
// without adapters rather than failing.

let _adaptersCache = null;

async function getAdapters() {
  if (_adaptersCache !== null) return _adaptersCache;
  try {
    const mod = await import('./source-adapters.mjs');
    _adaptersCache = mod;
  } catch {
    _adaptersCache = { applySourceAdapter: () => null };
  }
  return _adaptersCache;
}

function createDefaultArgs() {
  return {
    query: '',
    provider: DEFAULTS.provider,
    mode: DEFAULTS.mode,
    maxResults: DEFAULTS.maxResults,
    maxPages: DEFAULTS.maxPages,
    concurrency: DEFAULTS.concurrency,
    timeoutMs: DEFAULTS.timeoutMs,
    subqueryLimit: DEFAULTS.subqueryLimit,
    minUsableSources: DEFAULTS.minUsableSources,
    outDir: '',
    excerptChars: DEFAULTS.excerptChars,
    cacheTtlHours: DEFAULTS.cacheTtlHours,
    clearCache: false,
    help: false,
  };
}

function normalizeArgs(input = {}) {
  return {
    ...createDefaultArgs(),
    ...input,
  };
}

async function main(argv = process.argv.slice(2), options = {}) {
  const args = parseArgs(argv);

  if (args.help) {
    console.log(HELP_TEXT);
    return { helpShown: true };
  }

  const result = await collectResearch(args, options);
  const logger = options.logger || console;
  if (result.cacheCleared) {
    logger.log(`${result.cleared ? 'Cleared' : 'Cache already empty'}: ${result.cacheDirLabel}`);
    return result;
  }
  logCollectionSummary(result, logger);
  return result;
}

async function loadDotenv(filePath) {
  let contents = '';

  try {
    contents = await readFile(filePath, 'utf8');
  } catch {
    return;
  }

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const normalized = line.startsWith('export ') ? line.slice(7).trim() : line;
    const separatorIndex = normalized.indexOf('=');
    if (separatorIndex <= 0) continue;

    const key = normalized.slice(0, separatorIndex).trim();
    if (!key || process.env[key]) continue;

    let value = normalized.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

export async function collectResearch(rawArgs, options = {}) {
  const args = normalizeArgs(rawArgs);
  const cwd = options.cwd || process.cwd();
  const now = resolveNow(options.now);
  const logger = options.logger || console;

  if (args.clearCache) {
    return clearResearchCache({ cwd, logger });
  }

  if (!args.query) {
    throw new Error('Missing required --query. Run with --help for usage.');
  }

  await loadDotenv(path.resolve(cwd, '.env'));

  const providerPlan = resolveProviderPlan(args.provider);
  const cacheKey = buildCacheKey(args, providerPlan);
  const cacheState = await resolveCacheState({
    cacheKey,
    cacheTtlHours: args.cacheTtlHours,
    cwd,
    now,
    providerPlan,
    logger,
  });

  let pack;
  if (cacheState.status === 'hit') {
    pack = buildHitPack({
      cachedPack: cacheState.pack,
      cacheKey,
      cacheTtlHours: args.cacheTtlHours,
      now,
      storedAt: cacheState.storedAt,
      ageMs: cacheState.ageMs,
    });
  } else {
    const basePack = await runEscalatingResearch(args, providerPlan, { now });
    pack = await finalizeCollectedPack({
      basePack,
      cacheKey,
      cacheState,
      cacheTtlHours: args.cacheTtlHours,
      cwd,
      now,
      logger,
    });
  }

  const output = resolveOutputPaths(args.query, args.outDir, cwd);
  await writePackFiles(output.outDir, pack, { artifactNow: now });

  return {
    pack,
    outDir: output.outDir,
    jsonPath: output.jsonPath,
    mdPath: output.mdPath,
    factsPath: output.factsPath,
    jsonPathLabel: output.jsonPathLabel,
    mdPathLabel: output.mdPathLabel,
    factsPathLabel: output.factsPathLabel,
  };
}

async function clearResearchCache({ cwd, logger }) {
  const cacheDir = path.resolve(cwd, CACHE_ROOT);
  const existed = await pathExists(cacheDir);

  try {
    await rm(cacheDir, { recursive: true, force: true });
  } catch (error) {
    logCacheNote(
      logger,
      `Unable to clear cache directory ${cacheDir}: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }

  return {
    cacheCleared: true,
    cleared: existed,
    cacheDir,
    cacheDirLabel: CACHE_ROOT,
  };
}

function resolveNow(value) {
  if (!value) return new Date();
  if (value instanceof Date) return new Date(value.getTime());
  return new Date(value);
}

function resolveOutputPaths(query, outDir, cwd) {
  const outputDirValue = outDir || defaultOutDir(query);
  const outputDir = path.resolve(cwd, outputDirValue);
  return {
    outDir: outputDir,
    jsonPath: path.join(outputDir, 'evidence.json'),
    mdPath: path.join(outputDir, 'evidence.md'),
    factsPath: path.join(outputDir, 'facts.json'),
    jsonPathLabel: path.join(outputDirValue, 'evidence.json'),
    mdPathLabel: path.join(outputDirValue, 'evidence.md'),
    factsPathLabel: path.join(outputDirValue, 'facts.json'),
  };
}

function resolveMaxPages(args) {
  return args.maxPages ?? args.maxResults;
}

function normalizeCacheQuery(query) {
  return cleanInlineText(query).toLowerCase();
}

function createCacheFingerprint(args, providerPlan) {
  return {
    query: normalizeCacheQuery(args.query),
    providerRequest: args.provider,
    providers: [...(providerPlan.providers || [])],
    mode: args.mode,
    settings: {
      maxResults: args.maxResults,
      maxPages: resolveMaxPages(args),
      timeoutMs: args.timeoutMs,
      subqueryLimit: args.subqueryLimit,
      minUsableSources: args.minUsableSources,
      excerptChars: args.excerptChars,
    },
  };
}

export function buildCacheKey(rawArgs, providerPlan) {
  const args = normalizeArgs(rawArgs);
  const fingerprint = JSON.stringify(createCacheFingerprint(args, providerPlan));
  return createHash('sha256').update(fingerprint).digest('hex');
}

function resolveCacheDir(cwd, cacheKey) {
  return path.resolve(cwd, CACHE_ROOT, cacheKey);
}

function getPackStoredAt(pack) {
  return pack?.cache?.storedAt || pack?.generatedAt || null;
}

function calculateAgeMs(now, storedAt) {
  if (!storedAt) return Number.NaN;
  const storedTime = new Date(storedAt).getTime();
  if (!Number.isFinite(storedTime)) return Number.NaN;
  return Math.max(0, now.getTime() - storedTime);
}

async function resolveCacheState({
  cacheKey,
  cacheTtlHours,
  cwd,
  now,
  providerPlan,
  logger,
}) {
  const cacheDir = resolveCacheDir(cwd, cacheKey);

  if (providerPlan.providerStatus === 'not-configured') {
    return {
      status: 'miss',
      cacheDir,
      skipReason: 'provider-not-configured',
    };
  }

  let pack;
  try {
    pack = await readCachePack(cacheDir);
  } catch (error) {
    logCacheNote(
      logger,
      `Ignoring invalid cache entry for ${cacheKey}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return {
      status: 'miss',
      cacheDir,
      skipReason: 'invalid-cache-entry',
    };
  }

  if (!pack) {
    return {
      status: 'miss',
      cacheDir,
    };
  }

  const storedAt = getPackStoredAt(pack);
  const ageMs = calculateAgeMs(now, storedAt);
  if (!Number.isFinite(ageMs)) {
    logCacheNote(logger, `Ignoring cache entry for ${cacheKey} because storedAt is invalid.`);
    return {
      status: 'miss',
      cacheDir,
      skipReason: 'invalid-cache-entry',
    };
  }

  if (ageMs <= hoursToMs(cacheTtlHours)) {
    return {
      status: 'hit',
      cacheDir,
      pack,
      storedAt,
      ageMs,
    };
  }

  return {
    status: 'refresh',
    cacheDir,
    pack,
    storedAt,
    ageMs,
  };
}

async function finalizeCollectedPack({
  basePack,
  cacheKey,
  cacheState,
  cacheTtlHours,
  cwd,
  now,
  logger,
}) {
  const cacheStatus = cacheState.status === 'refresh' ? 'refresh' : 'miss';
  const previous = cacheState.status === 'refresh'
    ? {
        previousStoredAt: cacheState.storedAt,
        previousAgeMs: cacheState.ageMs,
      }
    : {};

  if (basePack.providerStatus === 'not-configured') {
    return withCacheMetadata(basePack, {
      version: CACHE_VERSION,
      key: cacheKey,
      status: cacheStatus,
      ttlHours: cacheTtlHours,
      servedAt: now.toISOString(),
      storedAt: null,
      ageMs: null,
      persisted: false,
      skipReason: cacheState.skipReason || 'provider-not-configured',
      ...previous,
    });
  }

  const persistedPack = withCacheMetadata(basePack, {
    version: CACHE_VERSION,
    key: cacheKey,
    status: cacheStatus,
    ttlHours: cacheTtlHours,
    servedAt: now.toISOString(),
    storedAt: now.toISOString(),
    ageMs: 0,
    persisted: true,
    ...previous,
  });

  try {
    await writeCachePack(resolveCacheDir(cwd, cacheKey), persistedPack, { artifactNow: now });
    return persistedPack;
  } catch (error) {
    logCacheNote(
      logger,
      `Unable to persist cache entry for ${cacheKey}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return withCacheMetadata(basePack, {
      version: CACHE_VERSION,
      key: cacheKey,
      status: cacheStatus,
      ttlHours: cacheTtlHours,
      servedAt: now.toISOString(),
      storedAt: null,
      ageMs: null,
      persisted: false,
      skipReason: 'cache-write-failed',
      ...previous,
    });
  }
}

function buildHitPack({ cachedPack, cacheKey, cacheTtlHours, now, storedAt, ageMs }) {
  return withCacheMetadata(cachedPack, {
    version: CACHE_VERSION,
    key: cacheKey,
    status: 'hit',
    ttlHours: cacheTtlHours,
    servedAt: now.toISOString(),
    storedAt,
    ageMs,
    persisted: true,
  });
}

function withCacheMetadata(pack, cache) {
  return {
    ...pack,
    cache,
  };
}

function hoursToMs(hours) {
  return hours * 60 * 60 * 1000;
}

async function writePackFiles(dir, pack, options = {}) {
  const artifactNow = resolveNow(options.artifactNow || pack.generatedAt).toISOString();
  const evidenceJsonPath = path.join(dir, 'evidence.json');
  const factsPack = extractFactsPack(pack, {
    extractedAt: artifactNow,
    sourcePackPath: evidenceJsonPath,
  });

  await mkdir(dir, { recursive: true });
  await writeFile(evidenceJsonPath, `${JSON.stringify(pack, null, 2)}\n`, 'utf8');
  await writeFile(path.join(dir, 'evidence.md'), renderMarkdown(pack), 'utf8');
  await writeFile(path.join(dir, 'facts.json'), `${JSON.stringify(factsPack, null, 2)}\n`, 'utf8');
}

async function pathExists(target) {
  try {
    await stat(target);
    return true;
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

export async function readCachePack(cacheDir) {
  try {
    const contents = await readFile(path.join(cacheDir, 'evidence.json'), 'utf8');
    return JSON.parse(contents);
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export async function writeCachePack(cacheDir, pack, options = {}) {
  await writePackFiles(cacheDir, pack, options);
}

function formatAgeMs(ageMs) {
  if (!Number.isFinite(ageMs) || ageMs === null) return 'n/a';
  if (ageMs < 1000) return `${ageMs}ms`;
  if (ageMs < 60_000) return `${Math.round(ageMs / 1000)}s`;
  if (ageMs < 3_600_000) return `${Math.round(ageMs / 60_000)}m`;
  return `${(ageMs / 3_600_000).toFixed(ageMs >= 10 * 3_600_000 ? 0 : 1)}h`;
}

function logCacheNote(logger, message) {
  if (typeof logger?.warn === 'function') {
    logger.warn(`Cache note: ${message}`);
  }
}

function logCollectionSummary(result, logger) {
  const {
    pack,
    jsonPathLabel,
    mdPathLabel,
    factsPathLabel,
  } = result;

  logger.log(`Collected ${pack.results.length} result(s) using ${formatProvidersAttempted(pack.providersAttempted)}.`);
  if (pack.cache) {
    const ageText = pack.cache.storedAt
      ? ` (age ${formatAgeMs(pack.cache.ageMs)}, ttl ${pack.cache.ttlHours}h)`
      : ` (ttl ${pack.cache.ttlHours}h)`;
    logger.log(`Cache: ${pack.cache.status}${ageText}`);
    if (!pack.cache.persisted && pack.cache.skipReason) {
      logger.log(`Cache note: ${pack.cache.skipReason}`);
    }
  }
  logger.log(`Coverage status: ${pack.escalation.status}`);
  if (pack.providerNote) {
    logger.log(`Provider note: ${pack.providerNote}`);
  }
  logger.log(`JSON: ${jsonPathLabel}`);
  logger.log(`Markdown: ${mdPathLabel}`);
  logger.log(`Facts: ${factsPathLabel}`);
}

async function runEscalatingResearch(args, providerPlan, options = {}) {
  const generatedAt = resolveNow(options.now).toISOString();
  const initialMaxPages = resolveMaxPages(args);
  const followupQueries = buildInteractiveFollowupQueries(args.query);
  const secondaryQueries = buildAutomaticSubqueries(args.query, args.subqueryLimit);
  const providers = providerPlan.providers;
  const stages = [];
  let results = [];

  if (providers.length === 0) {
    return buildNoProviderPack({
      args,
      generatedAt,
      initialMaxPages,
      followupQueries,
      providerNote: providerPlan.providerNote,
    });
  }

  results = await runStage({
    results,
    queries: [args.query],
    provider: providers[0],
    level: 'L1',
    strategy: 'primary-query',
    searchResultsPerQuery: args.maxResults,
    fetchLimit: initialMaxPages,
    args,
    stages,
  });

  let coverage = summarizeCoverage(results);

  if (shouldRunLevelTwo(args.mode, coverage, args.minUsableSources) && secondaryQueries.length > 0) {
    results = await runStage({
      results,
      queries: secondaryQueries,
      provider: providers[0],
      level: 'L2',
      strategy: 'expanded-subqueries',
      searchResultsPerQuery: Math.max(4, Math.min(args.maxResults, 6)),
      fetchLimit: Math.max(initialMaxPages + 2, args.minUsableSources + 2),
      args,
      stages,
    });
    coverage = summarizeCoverage(results);
  }

  if (shouldRunLevelThree(args.mode, coverage, args.minUsableSources)) {
    const levelThreeProvider = providers[1] || providers[0];
    const levelThreeQueries = providers[1]
      ? [args.query, ...secondaryQueries.slice(0, Math.min(2, secondaryQueries.length))]
      : followupQueries.slice(0, Math.max(2, Math.min(args.subqueryLimit, 4)));

    results = await runStage({
      results,
      queries: unique(levelThreeQueries),
      provider: levelThreeProvider,
      level: 'L3',
      strategy: providers[1] ? 'secondary-provider' : 'deep-followup-queries',
      searchResultsPerQuery: Math.max(args.maxResults, 6),
      fetchLimit: Math.max(initialMaxPages + 3, args.minUsableSources + 3),
      args,
      stages,
    });
    coverage = summarizeCoverage(results);
  }

  const status = coverage.usableSources >= args.minUsableSources
    ? stages.length > 1 ? 'escalated-complete' : 'complete'
    : 'needs-interactive-followup';

  const nextAction = status === 'needs-interactive-followup'
    ? 'Use interactive WebSearch/WebFetch only for the unresolved gaps and suggested follow-up queries.'
    : 'Programmatic retrieval reached the target evidence threshold.';

  return {
    generatedAt,
    query: args.query,
    mode: args.mode,
    providerRequest: args.provider,
    providerStatus: providerPlan.providerStatus,
    providerNote: providerPlan.providerNote,
    providersAttempted: unique(stages.map((stage) => stage.provider)),
    budget: {
      maxResults: args.maxResults,
      maxPages: initialMaxPages,
      concurrency: args.concurrency,
      timeoutMs: args.timeoutMs,
      subqueryLimit: args.subqueryLimit,
      minUsableSources: args.minUsableSources,
    },
    escalation: {
      status,
      nextAction,
      suggestedInteractiveQueries: status === 'needs-interactive-followup'
        ? followupQueries
        : [],
      coverage,
      stages,
    },
    results,
  };
}

function buildNoProviderPack({ args, generatedAt, initialMaxPages, followupQueries, providerNote }) {
  const coverage = {
    totalResults: 0,
    successfulFetches: 0,
    usableSources: 0,
    uniqueDomains: 0,
    thinCoverage: true,
  };

  return {
    generatedAt,
    query: args.query,
    mode: args.mode,
    providerRequest: args.provider,
    providerStatus: 'not-configured',
    providerNote,
    providersAttempted: [],
    budget: {
      maxResults: args.maxResults,
      maxPages: initialMaxPages,
      concurrency: args.concurrency,
      timeoutMs: args.timeoutMs,
      subqueryLimit: args.subqueryLimit,
      minUsableSources: args.minUsableSources,
    },
    escalation: {
      status: 'needs-interactive-followup',
      nextAction: 'No programmatic search provider is configured. Use interactive WebSearch/WebFetch only for the suggested follow-up queries or configure BRAVE_SEARCH_API_KEY/TAVILY_API_KEY and rerun the collector.',
      suggestedInteractiveQueries: followupQueries,
      coverage,
      stages: [
        {
          level: 'L0',
          strategy: 'no-configured-provider',
          provider: 'none',
          queries: [args.query],
          candidateCount: 0,
          fetchedCount: 0,
          usableSourcesAfterStage: 0,
          successfulFetchesAfterStage: 0,
          uniqueDomainsAfterStage: 0,
          note: providerNote,
        },
      ],
    },
    results: [],
  };
}

async function runStage({
  results,
  queries,
  provider,
  level,
  strategy,
  searchResultsPerQuery,
  fetchLimit,
  args,
  stages,
}) {
  const candidateGroups = await mapLimit(
    queries,
    Math.min(args.concurrency, Math.max(1, queries.length)),
    async (query) => {
      const matches = await search(provider, query, searchResultsPerQuery, args.timeoutMs);
      return matches.map((result, index) => ({
        ...result,
        search: {
          query,
          provider,
          level,
          strategy,
          sourceRank: index + 1,
        },
      }));
    },
  );

  const candidates = candidateGroups.flat();
  const fetchCandidates = pickFetchCandidates(candidates, results, fetchLimit);
  const fetched = await mapLimit(
    fetchCandidates,
    args.concurrency,
    (candidate) => fetchAndExtract(candidate, args.timeoutMs, args.excerptChars),
  );

  const merged = mergeResults(results, candidates, fetched);
  const coverage = summarizeCoverage(merged);
  stages.push({
    level,
    strategy,
    provider,
    queries,
    candidateCount: candidates.length,
    fetchedCount: fetched.length,
    usableSourcesAfterStage: coverage.usableSources,
    successfulFetchesAfterStage: coverage.successfulFetches,
    uniqueDomainsAfterStage: coverage.uniqueDomains,
  });

  return merged;
}

function parseArgs(argv) {
  const args = createDefaultArgs();

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    switch (token) {
      case '--query':
        args.query = argv[++i] || '';
        break;
      case '--provider':
        args.provider = argv[++i] || DEFAULTS.provider;
        break;
      case '--mode':
        args.mode = parseMode(argv[++i]);
        break;
      case '--max-results':
        args.maxResults = parseNumber(argv[++i], '--max-results');
        break;
      case '--max-pages':
        args.maxPages = parseNumber(argv[++i], '--max-pages');
        break;
      case '--concurrency':
        args.concurrency = parseNumber(argv[++i], '--concurrency');
        break;
      case '--timeout-ms':
        args.timeoutMs = parseNumber(argv[++i], '--timeout-ms');
        break;
      case '--subquery-limit':
        args.subqueryLimit = parseNumber(argv[++i], '--subquery-limit');
        break;
      case '--min-usable-sources':
        args.minUsableSources = parseNumber(argv[++i], '--min-usable-sources');
        break;
      case '--out-dir':
        args.outDir = argv[++i] || '';
        break;
      case '--excerpt-chars':
        args.excerptChars = parseNumber(argv[++i], '--excerpt-chars');
        break;
      case '--cache-ttl-hours':
        args.cacheTtlHours = parseNumber(argv[++i], '--cache-ttl-hours');
        break;
      case '--clear-cache':
        args.clearCache = true;
        break;
      case '--help':
      case '-h':
        args.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }

  return args;
}

function parseMode(value) {
  const normalized = normalizeModeAlias(value);
  if (!['standard', 'auto', 'deep'].includes(normalized || '')) {
    throw new Error(`Invalid --mode: ${value}. Expected standard, auto, or deep.`);
  }
  return normalized;
}

function normalizeModeAlias(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return normalized;

  if (['pricing', 'research', 'news', 'general'].includes(normalized)) {
    return 'auto';
  }

  return normalized;
}

function parseNumber(value, flagName) {
  const parsed = Number.parseInt(value || '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid value for ${flagName}: ${value}`);
  }
  return parsed;
}

function resolveProviderPlan(requested) {
  if (requested && requested !== 'auto') {
    assertSupportedProvider(requested);
    if (isProviderConfigured(requested)) {
      return {
        providers: [requested],
        providerStatus: 'configured',
        providerNote: '',
      };
    }

    return {
      providers: [],
      providerStatus: 'not-configured',
      providerNote: `Provider "${requested}" is not configured. Set ${providerEnvVar(requested)} or rerun with --provider auto after configuring a provider.`,
    };
  }

  const providers = [];
  if (process.env.BRAVE_SEARCH_API_KEY) providers.push('brave');
  if (process.env.TAVILY_API_KEY) providers.push('tavily');

  if (providers.length === 0) {
    return {
      providers: [],
      providerStatus: 'not-configured',
      providerNote: 'No search provider configured. Set BRAVE_SEARCH_API_KEY or TAVILY_API_KEY to enable programmatic collection.',
    };
  }

  return {
    providers,
    providerStatus: 'configured',
    providerNote: '',
  };
}

function assertSupportedProvider(provider) {
  if (!['brave', 'tavily'].includes(provider)) {
    throw new Error(`Unsupported provider: ${provider}`);
  }
}

function isProviderConfigured(provider) {
  if (provider === 'brave') return Boolean(process.env.BRAVE_SEARCH_API_KEY);
  if (provider === 'tavily') return Boolean(process.env.TAVILY_API_KEY);
  return false;
}

function providerEnvVar(provider) {
  if (provider === 'brave') return 'BRAVE_SEARCH_API_KEY';
  if (provider === 'tavily') return 'TAVILY_API_KEY';
  return 'UNKNOWN_PROVIDER_ENV';
}

function defaultOutDir(query) {
  const slug = slugify(query).slice(0, 60) || 'research';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join('.shipwright', 'research', `${slug}-${timestamp}`);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function shouldRunLevelTwo(mode, coverage, minUsableSources) {
  if (mode === 'standard') return false;
  if (mode === 'deep') return true;
  return coverage.usableSources < minUsableSources;
}

function shouldRunLevelThree(mode, coverage, minUsableSources) {
  if (mode === 'standard') return false;
  if (mode === 'deep') return true;
  return coverage.usableSources < minUsableSources;
}

function buildAutomaticSubqueries(query, limit) {
  const normalized = cleanInlineText(query);
  const lower = normalized.toLowerCase();
  let suggestions = [];

  if (containsAny(lower, ['pricing', 'price', 'packaging', 'plan'])) {
    suggestions = [
      `${normalized} pricing`,
      `${normalized} plans`,
      `${normalized} comparison`,
      `${normalized} enterprise pricing`,
    ];
  } else if (containsAny(lower, ['market size', 'tam', 'sam', 'som', 'cagr', 'forecast'])) {
    suggestions = [
      `${normalized} market size`,
      `${normalized} industry report`,
      `${normalized} forecast`,
      `${normalized} CAGR`,
    ];
  } else if (containsAny(lower, ['competitor', 'competitive', 'alternatives', 'vs'])) {
    suggestions = [
      `${normalized} competitors`,
      `${normalized} alternatives`,
      `${normalized} comparison`,
      `${normalized} review`,
    ];
  } else if (containsAny(lower, ['review', 'reddit', 'forum', 'sentiment', 'feedback'])) {
    suggestions = [
      `${normalized} reviews`,
      `${normalized} reddit`,
      `${normalized} forum discussion`,
      `${normalized} complaints`,
    ];
  } else if (containsAny(lower, ['regulation', 'regulatory', 'compliance', 'legal', 'policy'])) {
    suggestions = [
      `${normalized} regulation`,
      `${normalized} compliance`,
      `${normalized} policy`,
      `${normalized} legal analysis`,
    ];
  } else {
    suggestions = [
      `${normalized} market overview`,
      `${normalized} competitors`,
      `${normalized} pricing`,
      `${normalized} customer reviews`,
    ];
  }

  return unique(
    suggestions.filter((item) => item.toLowerCase() !== lower),
  ).slice(0, limit);
}

function buildInteractiveFollowupQueries(query) {
  const normalized = cleanInlineText(query);
  const lower = normalized.toLowerCase();
  const suggestions = [...buildAutomaticSubqueries(query, 2)];

  if (containsAny(lower, ['pricing', 'price', 'packaging', 'plan'])) {
    suggestions.push(`${normalized} site:g2.com pricing`);
    suggestions.push(`${normalized} site:capterra.com pricing`);
  } else if (containsAny(lower, ['market size', 'tam', 'sam', 'som', 'cagr', 'forecast'])) {
    suggestions.push(`${normalized} filetype:pdf report`);
    suggestions.push(`${normalized} analyst report`);
  } else if (containsAny(lower, ['competitor', 'competitive', 'alternatives', 'vs'])) {
    suggestions.push(`${normalized} site:g2.com alternatives`);
    suggestions.push(`${normalized} site:capterra.com alternatives`);
  } else if (containsAny(lower, ['review', 'reddit', 'forum', 'sentiment', 'feedback'])) {
    suggestions.push(`${normalized} site:reddit.com`);
    suggestions.push(`${normalized} site:news.ycombinator.com`);
  } else {
    suggestions.push(`${normalized} filetype:pdf`);
    suggestions.push(`${normalized} site:reddit.com`);
  }

  return unique(suggestions).slice(0, 4);
}

function containsAny(haystack, needles) {
  return needles.some((needle) => haystack.includes(needle));
}

async function search(provider, query, maxResults, timeoutMs) {
  if (provider === 'brave') {
    return braveSearch(query, maxResults, timeoutMs);
  }
  if (provider === 'tavily') {
    return tavilySearch(query, maxResults, timeoutMs);
  }
  throw new Error(`Unsupported provider: ${provider}`);
}

async function braveSearch(query, maxResults, timeoutMs) {
  const url = new URL('https://api.search.brave.com/res/v1/web/search');
  url.searchParams.set('q', query);
  url.searchParams.set('count', String(maxResults));
  url.searchParams.set('search_lang', 'en');
  url.searchParams.set('country', 'us');

  const response = await fetchWithTimeout(url.toString(), {
    headers: {
      Accept: 'application/json',
      'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY,
      'User-Agent': 'ShipwrightResearchCollector/1.0',
    },
  }, timeoutMs);

  const payload = await readJson(response);
  const results = payload.web?.results || [];

  return results.map((item, index) => ({
    rank: index + 1,
    title: item.title || item.profile?.name || item.url,
    url: item.url,
    site: item.profile?.name || '',
    searchSnippet: cleanInlineText(item.description || ''),
    published: item.age || item.page_age || '',
  }));
}

async function tavilySearch(query, maxResults, timeoutMs) {
  const response = await fetchWithTimeout('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'ShipwrightResearchCollector/1.0',
    },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: 'basic',
      max_results: maxResults,
      include_answer: false,
      include_raw_content: false,
    }),
  }, timeoutMs);

  const payload = await readJson(response);
  const results = payload.results || [];

  return results.map((item, index) => ({
    rank: index + 1,
    title: item.title || item.url,
    url: item.url,
    site: '',
    searchSnippet: cleanInlineText(item.content || ''),
    published: item.published_date || '',
  }));
}

function pickFetchCandidates(candidates, existingResults, fetchLimit) {
  const fetchedKeys = new Set(
    existingResults
      .filter((result) => result.fetched)
      .map((result) => normalizeUrl(result.fetched.finalUrl || result.url)),
  );
  const seenKeys = new Set();
  const selected = [];

  for (const candidate of candidates) {
    const key = normalizeUrl(candidate.url);
    if (!key || seenKeys.has(key)) continue;
    seenKeys.add(key);
    if (fetchedKeys.has(key)) continue;
    selected.push(candidate);
    if (selected.length >= fetchLimit) break;
  }

  return selected;
}

async function fetchAndExtract(result, timeoutMs, excerptChars) {
  try {
    const response = await fetchWithTimeout(result.url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8',
        'User-Agent': 'ShipwrightResearchCollector/1.0',
      },
      redirect: 'follow',
    }, timeoutMs);

    const body = await response.text();
    const contentType = response.headers.get('content-type') || '';
    const extracted = extractPage(body, contentType, excerptChars);

    // Run source adapter while the raw HTML body is still available.
    // Adapter errors must never surface — fail soft and continue without data.
    let adapterData = null;
    try {
      const adapters = await getAdapters();
      adapterData = adapters.applySourceAdapter(response.url, body);
    } catch {
      // adapter failure is silent
    }

    return {
      ...result,
      fetched: {
        ok: response.ok,
        status: response.status,
        finalUrl: response.url,
        contentType,
      },
      extracted,
      ...(adapterData ? { adapterData } : {}),
    };
  } catch (error) {
    return {
      ...result,
      fetched: {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      extracted: {
        title: result.title,
        description: '',
        excerpt: '',
        wordCount: 0,
      },
    };
  }
}

function mergeResults(existingResults, candidates, fetchedResults) {
  const merged = new Map();

  for (const result of existingResults) {
    const key = normalizeUrl(result.fetched?.finalUrl || result.url);
    merged.set(key, {
      ...result,
      searchHistory: [...(result.searchHistory || [])],
    });
  }

  for (const candidate of candidates) {
    const key = normalizeUrl(candidate.url);
    const current = merged.get(key);

    if (!current) {
      merged.set(key, {
        ...candidate,
        searchHistory: [candidate.search],
      });
      continue;
    }

    current.searchHistory = mergeSearchHistory(current.searchHistory || [], candidate.search);
    if (!current.searchSnippet && candidate.searchSnippet) current.searchSnippet = candidate.searchSnippet;
    if (!current.published && candidate.published) current.published = candidate.published;
    if (!current.site && candidate.site) current.site = candidate.site;
    if (!current.title && candidate.title) current.title = candidate.title;
    if (!current.search) current.search = candidate.search;
  }

  for (const fetched of fetchedResults) {
    const key = normalizeUrl(fetched.fetched?.finalUrl || fetched.url);
    const current = merged.get(key);
    if (!current) {
      merged.set(key, {
        ...fetched,
        searchHistory: [fetched.search],
      });
      continue;
    }

    current.fetched = fetched.fetched;
    current.extracted = fetched.extracted;
    if (!current.title && fetched.title) current.title = fetched.title;
    if (!current.searchSnippet && fetched.searchSnippet) current.searchSnippet = fetched.searchSnippet;
  }

  return Array.from(merged.values()).map((result, index) => ({
    ...result,
    rank: index + 1,
  }));
}

function mergeSearchHistory(existing, incoming) {
  const items = [...existing];
  const serialized = new Set(items.map((item) => JSON.stringify(item)));
  const encodedIncoming = JSON.stringify(incoming);
  if (!serialized.has(encodedIncoming)) {
    items.push(incoming);
  }
  return items;
}

function summarizeCoverage(results) {
  const successfulFetches = results.filter((result) => result.fetched?.ok).length;
  const usableSources = results.filter(isUsableSource).length;
  const uniqueDomains = new Set(
    results
      .filter(isUsableSource)
      .map((result) => extractDomain(result.fetched?.finalUrl || result.url))
      .filter(Boolean),
  ).size;

  return {
    totalResults: results.length,
    successfulFetches,
    usableSources,
    uniqueDomains,
    thinCoverage: usableSources < 3,
  };
}

function isUsableSource(result) {
  const excerptWords = result.extracted?.wordCount || 0;
  const snippetLength = (result.searchSnippet || '').length;
  const successfulFetch = result.fetched?.ok === true;

  if (successfulFetch && excerptWords >= 30) return true;
  if (!result.fetched && snippetLength >= 120) return true;
  if (successfulFetch && snippetLength >= 120) return true;
  return false;
}

function extractPage(body, contentType, excerptChars) {
  if (!contentType.includes('html') && !contentType.includes('text/plain')) {
    return {
      title: '',
      description: '',
      excerpt: '',
      wordCount: 0,
    };
  }

  if (contentType.includes('text/plain')) {
    const excerpt = truncate(cleanInlineText(body), excerptChars);
    return {
      title: '',
      description: '',
      excerpt,
      wordCount: countWords(excerpt),
    };
  }

  const title = extractTagText(body, 'title');
  const description = extractMetaDescription(body);
  const lines = htmlToLines(body);
  const excerpt = buildExcerpt(lines, excerptChars);

  return {
    title,
    description,
    excerpt,
    wordCount: countWords(excerpt),
  };
}

function extractTagText(html, tagName) {
  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, 'i');
  const match = html.match(pattern);
  return match ? cleanInlineText(decodeEntities(match[1])) : '';
}

function extractMetaDescription(html) {
  const patterns = [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i,
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["'][^>]*>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return cleanInlineText(decodeEntities(match[1]));
    }
  }

  return '';
}

function htmlToLines(html) {
  const text = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<template[\s\S]*?<\/template>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<(br|\/p|\/div|\/li|\/section|\/article|\/h[1-6]|\/tr|\/ul|\/ol)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');

  return decodeEntities(text)
    .split(/\n+/)
    .map((line) => cleanInlineText(line))
    .filter((line) => line.length >= 40);
}

function buildExcerpt(lines, excerptChars) {
  const selected = [];
  let used = 0;

  for (const line of lines) {
    if (used >= excerptChars) break;
    const next = truncate(line, Math.max(excerptChars - used, 0));
    if (!next) continue;
    selected.push(next);
    used += next.length + 1;
  }

  return truncate(selected.join('\n'), excerptChars);
}

function decodeEntities(input) {
  const named = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
    ndash: '-',
    mdash: '-',
    hellip: '...',
    rsquo: "'",
    lsquo: "'",
    rdquo: '"',
    ldquo: '"',
    copy: '(c)',
    reg: '(r)',
    trade: '(tm)',
  };

  return input.replace(/&(#x?[0-9a-fA-F]+|\w+);/g, (_, entity) => {
    if (entity.startsWith('#x') || entity.startsWith('#X')) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }
    if (entity.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    }
    return named[entity] || `&${entity};`;
  });
}

function cleanInlineText(input) {
  return input.replace(/\s+/g, ' ').trim();
}

function truncate(input, maxChars) {
  if (!input || input.length <= maxChars) return input;
  return `${input.slice(0, Math.max(0, maxChars - 3)).trimEnd()}...`;
}

function countWords(input) {
  if (!input) return 0;
  return input.split(/\s+/).filter(Boolean).length;
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function readJson(response) {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Search request failed (${response.status}): ${truncate(body, 300)}`);
  }
  return response.json();
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const current = nextIndex;
      nextIndex += 1;
      results[current] = await mapper(items[current], current);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function normalizeUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    url.hash = '';
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'gclid',
      'fbclid',
      'ref',
    ];
    for (const key of trackingParams) {
      url.searchParams.delete(key);
    }
    url.hostname = url.hostname.replace(/^www\./, '');
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    const normalized = url.toString();
    return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
  } catch {
    return rawUrl;
  }
}

function extractDomain(rawUrl) {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function unique(items) {
  return Array.from(new Set(items.filter(Boolean)));
}

function formatProvidersAttempted(providers) {
  return providers.length > 0 ? providers.join(', ') : 'none';
}

export function extractFactsPack(pack, options = {}) {
  const extractedAt = resolveNow(options.extractedAt || pack?.generatedAt).toISOString();
  const facts = dedupeFacts(extractFacts(pack, extractedAt));

  return {
    meta: {
      version: 1,
      query: pack?.query || '',
      provider: determineFactsProvider(pack),
      mode: pack?.mode || '',
      extractedAt,
      sourcePackPath: options.sourcePackPath || '',
      coverageHint: buildCoverageHint(pack),
      notes: buildFactsNotes(pack, facts),
    },
    facts,
  };
}

function determineFactsProvider(pack) {
  if (Array.isArray(pack?.providersAttempted) && pack.providersAttempted.length > 0) {
    return pack.providersAttempted.join(',');
  }
  return pack?.providerRequest || '';
}

function buildCoverageHint(pack) {
  const coverage = pack?.escalation?.coverage;
  const parts = [];

  if (pack?.escalation?.status) parts.push(pack.escalation.status);
  if (Number.isFinite(coverage?.usableSources)) parts.push(`usable=${coverage.usableSources}`);
  if (Number.isFinite(coverage?.uniqueDomains)) parts.push(`domains=${coverage.uniqueDomains}`);
  if (coverage?.thinCoverage) parts.push('thin');

  return parts.join('; ');
}

function buildFactsNotes(pack, facts) {
  const notes = [];

  if (pack?.providerNote) {
    notes.push(pack.providerNote);
  }

  if (pack?.escalation?.coverage?.thinCoverage) {
    notes.push('Coverage was thin; facts may be incomplete.');
  }

  if (facts.length === 0) {
    notes.push('No deterministic facts were extracted from the collected evidence.');
  }

  return unique(notes);
}

function extractFacts(pack, observedAt) {
  const facts = [];
  const results = Array.isArray(pack?.results) ? pack.results : [];

  for (const result of results) {
    const sourceUrl = result?.fetched?.finalUrl || result?.url || '';
    if (!sourceUrl) continue;

    // v1: identity and pricing (unchanged)
    facts.push(...extractIdentityFacts(result, sourceUrl, observedAt));

    const publishedDateFact = extractPublishedDateFact(result, sourceUrl, observedAt);
    if (publishedDateFact) facts.push(publishedDateFact);

    facts.push(...extractPricingFacts(result, sourceUrl, observedAt));

    // v2: structured adapter data (highest confidence, runs from raw HTML)
    facts.push(...extractAdapterFacts(result, sourceUrl, observedAt));

    // v2: text-pattern extractors (conservative, medium confidence)
    facts.push(...extractReviewFacts(result, sourceUrl, observedAt));
    facts.push(...extractAcquisitionFacts(result, sourceUrl, observedAt));
    facts.push(...extractFundingFacts(result, sourceUrl, observedAt));
    facts.push(...extractPlatformFacts(result, sourceUrl, observedAt));
  }

  return facts;
}

function extractIdentityFacts(result, sourceUrl, observedAt) {
  const titleCandidates = unique([
    cleanInlineText(result?.extracted?.title || ''),
    cleanInlineText(result?.title || ''),
  ]);
  const domainRoot = extractDomainRootToken(sourceUrl);

  for (const title of titleCandidates) {
    const product = parsePricingTitleIdentity(title);
    if (!product) continue;

    const facts = [];
    const company = deriveCompanyFromProduct(product, title, domainRoot);

    if (company) {
      facts.push(createFact({
        field: 'company',
        value: company,
        sourceUrl,
        excerpt: title,
        observedAt,
        confidenceHint: company.toLowerCase() === product.toLowerCase() ? 'high' : 'medium',
      }));
    }

    facts.push(createFact({
      field: 'product',
      value: product,
      sourceUrl,
      excerpt: title,
      observedAt,
      confidenceHint: 'high',
    }));

    return facts.filter(Boolean);
  }

  return [];
}

function extractPublishedDateFact(result, sourceUrl, observedAt) {
  const rawPublished = cleanInlineText(result?.published || '');
  const normalizedDate = normalizeFactDate(rawPublished);

  if (!normalizedDate) return null;

  return createFact({
    field: 'published_or_observed_date',
    value: normalizedDate,
    sourceUrl,
    excerpt: `Published: ${rawPublished}`,
    observedAt,
    confidenceHint: /^\d{4}-\d{2}-\d{2}/.test(rawPublished) ? 'high' : 'medium',
  });
}

function extractPricingFacts(result, sourceUrl, observedAt) {
  const facts = [];

  for (const segment of collectTextSegments(result)) {
    facts.push(...extractPriceFactsFromLine(segment, sourceUrl, observedAt));
  }

  return facts;
}

function collectTextSegments(result) {
  return unique([
    cleanInlineText(result?.searchSnippet || ''),
    cleanInlineText(result?.extracted?.description || ''),
    ...splitExcerptLines(result?.extracted?.excerpt || ''),
  ]).filter(Boolean);
}

// ---------------------------------------------------------------------------
// v2 fact extractors
// ---------------------------------------------------------------------------

/**
 * Convert result.adapterData.fields (set by source-adapters.mjs) into facts.
 * Adapter fields carry the highest confidence because they come from structured
 * schema data (JSON-LD, stable HTML patterns) rather than free text.
 */
function extractAdapterFacts(result, sourceUrl, observedAt) {
  const adapterData = result?.adapterData;
  if (!adapterData?.fields?.length) return [];

  const adapterLabel = adapterData.adapterName || 'adapter';

  return adapterData.fields
    .map(({ field, value, confidence }) =>
      createFact({
        field,
        value: String(value),
        sourceUrl,
        excerpt: `Structured data extracted by ${adapterLabel} adapter.`,
        observedAt,
        confidenceHint: confidence || 'medium',
      }),
    )
    .filter(Boolean);
}

/**
 * Extract review_count and star_rating from text segments.
 * Skipped when adapter data already provides these fields (adapter = higher confidence).
 */
function extractReviewFacts(result, sourceUrl, observedAt) {
  const adapterFields = new Set(
    (result?.adapterData?.fields || []).map((f) => f.field),
  );
  const facts = [];

  for (const segment of collectTextSegments(result)) {
    // review_count: "1,234 reviews", "Based on 500 ratings"
    if (!adapterFields.has('review_count')) {
      const reviewMatch =
        segment.match(/\b(\d{1,3}(?:,\d{3})*)\s+(?:reviews?|ratings?)\b/i) ||
        segment.match(/\bbased on\s+(\d{1,3}(?:,\d{3})*)\s+(?:reviews?|ratings?)\b/i);
      if (reviewMatch) {
        const count = reviewMatch[1].replace(/,/g, '');
        if (parseInt(count, 10) > 0) {
          facts.push(
            createFact({
              field: 'review_count',
              value: count,
              sourceUrl,
              excerpt: truncate(segment, 180),
              observedAt,
              confidenceHint: 'medium',
            }),
          );
        }
      }
    }

    // star_rating: "4.5 out of 5", "4.5/5 stars", "rated 4.5"
    if (!adapterFields.has('star_rating')) {
      const ratingMatch =
        segment.match(/\b(\d(?:\.\d)?)\s*(?:out of\s*5|\/5|stars?)\b/i) ||
        segment.match(/\brated\s+(\d(?:\.\d)?)\b/i);
      if (ratingMatch) {
        const rating = parseFloat(ratingMatch[1]);
        if (rating >= 0 && rating <= 5) {
          facts.push(
            createFact({
              field: 'star_rating',
              value: String(rating),
              sourceUrl,
              excerpt: truncate(segment, 180),
              observedAt,
              confidenceHint: 'medium',
            }),
          );
        }
      }
    }
  }

  return facts;
}

/**
 * Extract acquisition facts from text segments.
 * Only fires on high-signal active/passive patterns with proper-noun entities.
 * Conservative: requires capital-initial entities and known verb patterns.
 */
function extractAcquisitionFacts(result, sourceUrl, observedAt) {
  const facts = [];

  for (const segment of collectTextSegments(result)) {
    // Active: "Google acquired YouTube"
    const activeMatch = segment.match(
      /\b([A-Z][A-Za-z0-9]{2,}(?:\s+[A-Z][A-Za-z0-9]{2,})?)\s+(?:has\s+)?acquired\s+([A-Z][A-Za-z0-9]{2,}(?:\s+[A-Z][A-Za-z0-9]{2,})?)\b/,
    );
    // Passive: "YouTube was acquired by Google"
    const passiveMatch = segment.match(
      /\b([A-Z][A-Za-z0-9]{2,}(?:\s+[A-Z][A-Za-z0-9]{2,})?)\s+was\s+acquired\s+by\s+([A-Z][A-Za-z0-9]{2,}(?:\s+[A-Z][A-Za-z0-9]{2,})?)\b/,
    );
    // Bare passive: "acquired by Google" without full subject context
    const barePassiveMatch =
      !passiveMatch &&
      segment.match(
        /\bacquired\s+by\s+([A-Z][A-Za-z0-9]{2,}(?:\s+[A-Z][A-Za-z0-9]{2,})?)\b/,
      );

    if (!activeMatch && !passiveMatch && !barePassiveMatch) continue;

    const excerpt = truncate(segment, 180);

    facts.push(
      createFact({
        field: 'acquisition_event',
        value: 'true',
        sourceUrl,
        excerpt,
        observedAt,
        confidenceHint: 'medium',
      }),
    );

    if (activeMatch) {
      const acquirer = cleanInlineText(activeMatch[1]);
      const acquired = cleanInlineText(activeMatch[2]);
      if (isValidEntityName(acquirer)) {
        facts.push(createFact({ field: 'acquirer', value: acquirer, sourceUrl, excerpt, observedAt, confidenceHint: 'medium' }));
      }
      if (isValidEntityName(acquired)) {
        facts.push(createFact({ field: 'acquired_company', value: acquired, sourceUrl, excerpt, observedAt, confidenceHint: 'medium' }));
      }
    } else if (passiveMatch) {
      const acquired = cleanInlineText(passiveMatch[1]);
      const acquirer = cleanInlineText(passiveMatch[2]);
      if (isValidEntityName(acquirer)) {
        facts.push(createFact({ field: 'acquirer', value: acquirer, sourceUrl, excerpt, observedAt, confidenceHint: 'medium' }));
      }
      if (isValidEntityName(acquired)) {
        facts.push(createFact({ field: 'acquired_company', value: acquired, sourceUrl, excerpt, observedAt, confidenceHint: 'medium' }));
      }
    } else if (barePassiveMatch) {
      const acquirer = cleanInlineText(barePassiveMatch[1]);
      if (isValidEntityName(acquirer)) {
        facts.push(createFact({ field: 'acquirer', value: acquirer, sourceUrl, excerpt, observedAt, confidenceHint: 'medium' }));
      }
    }

    // Year near the acquisition mention
    const yearMatch = segment.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      facts.push(
        createFact({
          field: 'acquisition_date',
          value: yearMatch[1],
          sourceUrl,
          excerpt,
          observedAt,
          confidenceHint: 'medium',
        }),
      );
    }
  }

  return facts;
}

/**
 * Extract funding round facts from text segments.
 * Only fires on clear "raised/closed/secured ... Series X/Seed" patterns
 * or "Series X ... $amount" patterns. Conservative.
 */
function extractFundingFacts(result, sourceUrl, observedAt) {
  const facts = [];

  for (const segment of collectTextSegments(result)) {
    const roundType = matchFundingRound(segment);
    if (!roundType) continue;

    facts.push(
      createFact({
        field: 'funding_event',
        value: normalizeRoundType(roundType),
        sourceUrl,
        excerpt: truncate(segment, 180),
        observedAt,
        confidenceHint: 'medium',
      }),
    );
  }

  return facts;
}

function matchFundingRound(segment) {
  // "raised/closed/secured/announced ... Series A/Seed" (action → round)
  const actionFirst = segment.match(
    /\b(?:raised|closed|secured|announced)\b[\s\S]{0,60}?\b(Series\s+[A-E]|[Ss]eed|[Pp]re-[Ss]eed|[Gg]rowth)\b/i,
  );
  if (actionFirst) return actionFirst[1];

  // "Series A/Seed ... $amount" (round → dollar signal)
  const roundFirst = segment.match(
    /\b(Series\s+[A-E]|[Ss]eed|[Pp]re-[Ss]eed)\b[\s\S]{0,40}?[$€£]\d/i,
  );
  if (roundFirst) return roundFirst[1];

  return null;
}

function normalizeRoundType(raw) {
  const lower = raw.trim().toLowerCase();
  if (lower.startsWith('series ')) {
    return `Series ${raw.trim().slice(-1).toUpperCase()}`;
  }
  if (lower === 'seed') return 'Seed';
  if (lower === 'pre-seed') return 'Pre-Seed';
  if (lower === 'growth') return 'Growth';
  return raw.trim();
}

/**
 * Extract supported platform facts from text segments.
 * Only fires when a clear "available for / supports / compatible with / runs on"
 * context precedes the platform name. Avoids noisy incidental mentions.
 */
function extractPlatformFacts(result, sourceUrl, observedAt) {
  const facts = [];
  const knownPlatforms = ['Windows', 'macOS', 'Linux', 'iOS', 'Android', 'Web'];

  for (const segment of collectTextSegments(result)) {
    const contextMatch = segment.match(
      /(?:available for|supports?|compatible with|runs? on|works? on|platforms?:)\s*([^.]{5,80})/i,
    );
    if (!contextMatch) continue;

    const context = contextMatch[1];
    for (const platform of knownPlatforms) {
      if (new RegExp(`\\b${platform}\\b`, 'i').test(context)) {
        facts.push(
          createFact({
            field: 'supported_platform',
            value: platform,
            sourceUrl,
            excerpt: truncate(segment, 180),
            observedAt,
            confidenceHint: 'medium',
          }),
        );
      }
    }
  }

  return facts;
}

/**
 * Returns true for proper-noun entity names suitable for acquisition facts.
 * Filters out common articles, pronouns, and very short tokens.
 */
function isValidEntityName(value) {
  if (!value || value.length < 3 || value.length > 50) return false;
  if (!/^[A-Z]/.test(value)) return false;
  const lower = value.toLowerCase();
  return ![
    'the', 'its', 'their', 'they', 'this', 'that', 'when',
    'after', 'before', 'which', 'what', 'how', 'who', 'where',
  ].includes(lower);
}

function splitExcerptLines(excerpt) {
  return excerpt
    .split(/\n+/)
    .flatMap((line) => line.split(/\s+\|\s+/))
    .map((line) => cleanInlineText(line))
    .filter(Boolean);
}

function extractPriceFactsFromLine(line, sourceUrl, observedAt) {
  const matches = Array.from(line.matchAll(/(?:\b(USD|EUR|GBP)\b\s*|([$€£])\s*)(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/gi));

  if (matches.length !== 1) return [];
  if (hasAmbiguousPriceContext(line)) return [];

  const match = matches[0];
  const currency = normalizeCurrency(match[1] || match[2] || '');
  const price = (match[3] || '').replace(/,/g, '');
  const matchIndex = match.index ?? 0;
  const tail = line.slice(matchIndex + match[0].length, matchIndex + match[0].length + 60);
  const planName = detectPlanName(line, matchIndex);
  const billingPeriod = normalizeBillingPeriod(tail);
  const confidenceHint = billingPeriod ? 'high' : 'medium';
  const excerpt = truncate(line, 180);
  const facts = [];

  if (planName) {
    facts.push(createFact({
      field: 'plan_name',
      value: planName,
      sourceUrl,
      excerpt,
      observedAt,
      confidenceHint,
    }));
  }

  facts.push(createFact({
    field: 'price',
    value: price,
    sourceUrl,
    excerpt,
    observedAt,
    confidenceHint,
  }));

  if (currency) {
    facts.push(createFact({
      field: 'currency',
      value: currency,
      sourceUrl,
      excerpt,
      observedAt,
      confidenceHint,
    }));
  }

  if (billingPeriod) {
    facts.push(createFact({
      field: 'billing_period',
      value: billingPeriod,
      sourceUrl,
      excerpt,
      observedAt,
      confidenceHint,
    }));
  }

  return facts.filter(Boolean);
}

function hasAmbiguousPriceContext(line) {
  return /(?:[$€£]|USD|EUR|GBP)\s*\d[\d,.]*(?:\s*[-–]\s*|\s+to\s+)\d/i.test(line)
    || /\bbetween\b/i.test(line);
}

function detectPlanName(line, priceIndex) {
  const prefix = line.slice(0, priceIndex);
  const matches = Array.from(prefix.matchAll(/\b(Free|Basic|Starter|Standard|Pro|Professional|Premium|Business|Team|Enterprise|Growth|Plus|Advanced|Scale)\b/gi));

  if (matches.length === 0) return '';

  const match = matches[matches.length - 1];
  if ((priceIndex - (match.index ?? 0)) > 40) return '';
  return cleanInlineText(match[0]);
}

function normalizeCurrency(token) {
  const upper = cleanInlineText(token).toUpperCase();
  if (upper === '$' || upper === 'USD') return 'USD';
  if (upper === '€' || upper === 'EUR') return 'EUR';
  if (upper === '£' || upper === 'GBP') return 'GBP';
  return '';
}

function normalizeBillingPeriod(input) {
  const lower = cleanInlineText(input).toLowerCase();

  let match = lower.match(/(?:per\s+|\/\s*)(user|seat)\s*(?:\/|per\s+)?\s*(month|mo|year|yr|monthly|yearly|annually|annual)/);
  if (match) {
    return `${match[1]}/${normalizePeriodToken(match[2])}`;
  }

  match = lower.match(/\b(user|seat)\s*\/\s*(month|mo|year|yr|monthly|yearly|annually|annual)\b/);
  if (match) {
    return `${match[1]}/${normalizePeriodToken(match[2])}`;
  }

  match = lower.match(/\b(per\s+|\/\s*)(month|mo|year|yr|monthly|yearly|annually|annual)\b/);
  if (match) {
    return normalizePeriodToken(match[2]);
  }

  if (/\bmonthly\b/.test(lower)) return 'month';
  if (/\b(yearly|annually|annual)\b/.test(lower)) return 'year';
  if (/\bper user\b|\b\/user\b/.test(lower)) return 'user';
  if (/\bper seat\b|\b\/seat\b/.test(lower)) return 'seat';

  return '';
}

function normalizePeriodToken(token) {
  const lower = token.toLowerCase();
  if (['month', 'mo', 'monthly'].includes(lower)) return 'month';
  if (['year', 'yr', 'yearly', 'annually', 'annual'].includes(lower)) return 'year';
  return lower;
}

function parsePricingTitleIdentity(title) {
  const directPrefix = title.match(/^(.+?)\s+(pricing|plans?)\b/i);
  if (directPrefix) {
    return cleanIdentityCandidate(directPrefix[1]);
  }

  const directSuffix = title.match(/\b(pricing|plans?)\b\s*[-|:]\s*(.+)$/i);
  if (directSuffix) {
    return cleanIdentityCandidate(directSuffix[2]);
  }

  const segments = title
    .split(/\s*[-|:]\s*/)
    .map((segment) => cleanInlineText(segment))
    .filter(Boolean);

  for (let index = 0; index < segments.length; index += 1) {
    if (!/\b(pricing|plans?)\b/i.test(segments[index])) continue;

    const previous = cleanIdentityCandidate(segments[index - 1] || '');
    if (previous) return previous;

    const next = cleanIdentityCandidate(segments[index + 1] || '');
    if (next) return next;
  }

  return '';
}

function cleanIdentityCandidate(value) {
  const cleaned = cleanInlineText(
    value
      .replace(/\b(pricing|plans?|compare|comparison)\b/gi, ' ')
      .replace(/[()]/g, ' '),
  );

  if (!isValidIdentityCandidate(cleaned)) return '';
  return cleaned;
}

function isValidIdentityCandidate(value) {
  if (!value) return false;
  if (!/[A-Za-z]/.test(value)) return false;
  if (countWords(value) > 5) return false;
  if (value.length > 60) return false;

  const lower = value.toLowerCase();
  return ![
    'pricing',
    'plans',
    'plan',
    'compare',
    'comparison',
    'features',
  ].includes(lower);
}

function extractDomainRootToken(rawUrl) {
  const domain = extractDomain(rawUrl);
  const parts = domain.split('.').filter(Boolean);

  if (parts.length === 0) return '';
  if (parts.length >= 3 && parts[parts.length - 1].length === 2 && parts[parts.length - 2].length <= 3) {
    return normalizeAlphaNumeric(parts[parts.length - 3]);
  }
  return normalizeAlphaNumeric(parts[parts.length - 2] || parts[0]);
}

function deriveCompanyFromProduct(product, title, domainRoot) {
  if (!domainRoot) return '';

  for (const token of unique([
    ...product.split(/\s+/),
    ...title.split(/\s+/),
  ].map((item) => item.replace(/[^A-Za-z0-9]/g, '')))) {
    if (normalizeAlphaNumeric(token) === domainRoot) {
      return token;
    }
  }

  if (normalizeAlphaNumeric(product) === domainRoot) {
    return product;
  }

  return '';
}

function normalizeAlphaNumeric(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeFactDate(value) {
  if (!value) return '';
  if (!/\d{4}/.test(value) && !/^\d{4}-\d{2}-\d{2}/.test(value)) return '';

  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return '';

  return new Date(parsed).toISOString().slice(0, 10);
}

function createFact({
  field,
  value,
  sourceUrl,
  excerpt,
  observedAt,
  confidenceHint,
}) {
  if (!field || !value || !sourceUrl) return null;

  return {
    field,
    value: String(value),
    source_url: sourceUrl,
    excerpt: truncate(cleanInlineText(excerpt || ''), 180),
    observed_at: observedAt,
    confidence_hint: confidenceHint || 'medium',
  };
}

function dedupeFacts(facts) {
  const seen = new Set();
  const deduped = [];

  for (const fact of facts) {
    if (!fact?.source_url) continue;
    const key = [
      fact.field,
      fact.value,
      fact.source_url,
    ].join('::');

    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(fact);
  }

  return deduped;
}

function renderMarkdown(pack) {
  const lines = [
    '# Evidence Pack',
    '',
    `- Query: ${pack.query}`,
    `- Generated: ${pack.generatedAt}`,
    `- Mode: ${pack.mode}`,
    `- Provider status: ${pack.providerStatus || 'configured'}`,
    `- Providers attempted: ${formatProvidersAttempted(pack.providersAttempted)}`,
    `- Results collected: ${pack.results.length}`,
    '',
  ];

  if (pack.cache) {
    lines.push('## Cache Summary', '');
    lines.push(`- Status: ${pack.cache.status}`);
    lines.push(`- TTL hours: ${pack.cache.ttlHours}`);
    lines.push(`- Cache key: ${pack.cache.key}`);
    lines.push(`- Persisted: ${pack.cache.persisted ? 'yes' : 'no'}`);
    lines.push(`- Served at: ${pack.cache.servedAt}`);
    if (pack.cache.storedAt) lines.push(`- Stored at: ${pack.cache.storedAt}`);
    if (pack.cache.ageMs !== null && pack.cache.ageMs !== undefined) {
      lines.push(`- Age: ${formatAgeMs(pack.cache.ageMs)}`);
    }
    if (pack.cache.previousStoredAt) lines.push(`- Previous stored at: ${pack.cache.previousStoredAt}`);
    if (pack.cache.previousAgeMs !== null && pack.cache.previousAgeMs !== undefined) {
      lines.push(`- Previous age: ${formatAgeMs(pack.cache.previousAgeMs)}`);
    }
    if (pack.cache.skipReason) lines.push(`- Note: ${pack.cache.skipReason}`);
    lines.push('');
  }

  lines.push(
    '## Escalation Summary',
    '',
    `- Status: ${pack.escalation.status}`,
    `- Next action: ${pack.escalation.nextAction}`,
    `- Usable sources: ${pack.escalation.coverage.usableSources}`,
    `- Successful fetches: ${pack.escalation.coverage.successfulFetches}`,
    `- Unique domains: ${pack.escalation.coverage.uniqueDomains}`,
    '',
    '## Escalation Stages',
    '',
  );

  for (const stage of pack.escalation.stages) {
    lines.push(`### ${stage.level} - ${stage.strategy}`);
    lines.push(`- Provider: ${stage.provider}`);
    lines.push(`- Queries: ${stage.queries.join(' | ')}`);
    lines.push(`- Search candidates: ${stage.candidateCount}`);
    lines.push(`- Pages fetched: ${stage.fetchedCount}`);
    lines.push(`- Usable sources after stage: ${stage.usableSourcesAfterStage}`);
    if (stage.note) lines.push(`- Note: ${stage.note}`);
    lines.push('');
  }

  if (pack.escalation.suggestedInteractiveQueries.length > 0) {
    lines.push('## Suggested Interactive Follow-Up Queries', '');
    for (const query of pack.escalation.suggestedInteractiveQueries) {
      lines.push(`- ${query}`);
    }
    lines.push('');
  }

  lines.push(
    '## Source Table',
    '',
    '| # | Title | URL | Search Snippet |',
    '|---|---|---|---|',
  );

  if (pack.results.length === 0) {
    lines.push('| - | No programmatic results collected in this run | - | Configure a provider or use the suggested interactive follow-up queries |');
  } else {
    for (const result of pack.results) {
      lines.push(
        `| ${result.rank} | ${escapePipes(result.title || '')} | ${escapePipes(result.url || '')} | ${escapePipes(result.searchSnippet || '')} |`,
      );
    }
  }

  lines.push('', '## AI-Ready Digest', '');

  if (pack.results.length === 0) {
    lines.push('No programmatic sources were collected in this run.');
    if (pack.providerNote) {
      lines.push('');
      lines.push(`Reason: ${pack.providerNote}`);
    }
    lines.push('');
    lines.push('Use the suggested interactive follow-up queries above, or configure a search provider and rerun the collector.');
    lines.push('');
  } else {
    for (const result of pack.results) {
      lines.push(`### ${result.rank}. ${result.title || result.url}`);
      lines.push(`- URL: ${result.url}`);
      if (result.published) lines.push(`- Published: ${result.published}`);
      if (result.site) lines.push(`- Source: ${result.site}`);
      if (result.search?.query) lines.push(`- Found via: ${result.search.query}`);
      if (result.searchSnippet) lines.push(`- Search snippet: ${result.searchSnippet}`);
      if (result.fetched?.ok === false && result.fetched?.error) {
        lines.push(`- Fetch status: failed (${result.fetched.error})`);
      } else if (result.fetched?.status) {
        lines.push(`- Fetch status: ${result.fetched.status}`);
      }
      if (result.extracted?.description) {
        lines.push(`- Page description: ${result.extracted.description}`);
      }
      if (result.extracted?.excerpt) {
        lines.push('- Extracted excerpt:');
        lines.push('');
        lines.push(result.extracted.excerpt);
        lines.push('');
      } else {
        lines.push('- Extracted excerpt: unavailable');
        lines.push('');
      }
    }
  }

  return `${lines.join('\n')}\n`;
}

function escapePipes(value) {
  return value.replace(/\|/g, '\\|');
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
