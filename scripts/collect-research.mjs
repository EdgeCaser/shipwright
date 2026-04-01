#!/usr/bin/env node

import { createHash } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
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
  --help                      Show this message

Providers:
  brave   Uses BRAVE_SEARCH_API_KEY
  tavily  Uses TAVILY_API_KEY
  auto    Uses the first configured provider and can escalate to the second

Outputs:
  evidence.json               Structured machine-readable results
  evidence.md                 AI-ready source digest

Behavior:
  Loads .env from the current working directory if present.
  If no provider is configured, still writes a fallback evidence pack with
  'needs-interactive-followup' instead of failing.
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
  await writePackFiles(output.outDir, pack);

  return {
    pack,
    outDir: output.outDir,
    jsonPath: output.jsonPath,
    mdPath: output.mdPath,
    jsonPathLabel: output.jsonPathLabel,
    mdPathLabel: output.mdPathLabel,
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
    jsonPathLabel: path.join(outputDirValue, 'evidence.json'),
    mdPathLabel: path.join(outputDirValue, 'evidence.md'),
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
    await writeCachePack(resolveCacheDir(cwd, cacheKey), persistedPack);
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

async function writePackFiles(dir, pack) {
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'evidence.json'), `${JSON.stringify(pack, null, 2)}\n`, 'utf8');
  await writeFile(path.join(dir, 'evidence.md'), renderMarkdown(pack), 'utf8');
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

export async function writeCachePack(cacheDir, pack) {
  await writePackFiles(cacheDir, pack);
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
  const { pack, jsonPathLabel, mdPathLabel } = result;

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
  if (!['standard', 'auto', 'deep'].includes(value || '')) {
    throw new Error(`Invalid --mode: ${value}. Expected standard, auto, or deep.`);
  }
  return value;
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

    return {
      ...result,
      fetched: {
        ok: response.ok,
        status: response.status,
        finalUrl: response.url,
        contentType,
      },
      extracted,
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
