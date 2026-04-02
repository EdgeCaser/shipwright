#!/usr/bin/env node

/**
 * Shipwright request classifier.
 *
 * Classifies a research query string into a request type and returns
 * collector hints. Pure pattern-matcher — no network calls, no AI.
 *
 * Usage (CLI):
 *   node scripts/classify-request.mjs "how does Stripe pricing compare to Paddle?"
 *   node scripts/classify-request.mjs --json "Series B funding in developer tools"
 *
 * Usage (programmatic):
 *   import { classifyRequest } from './classify-request.mjs';
 *   const classification = classifyRequest("Stripe vs Paddle pricing");
 *
 * Integration:
 *   Run at the start of a research workflow to configure the collector
 *   for the right extraction mode. Feed the returned `collectorHints`
 *   into collect-research.mjs mode/provider selection, and use
 *   `priorityFacts` to set expected fields in the facts sidecar.
 *
 *   Example:
 *     const { requestType, suggestedMode, collectorHints } = classifyRequest(query);
 *     // suggestedMode → 'standard' | 'auto' | 'deep'
 */

import { pathToFileURL } from 'node:url';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * @typedef {'pricing'|'competitive'|'market-size'|'acquisition'|'funding'|'reviews'|'general'} RequestType
 */

/**
 * @typedef {object} Classification
 * @property {RequestType} requestType
 * @property {number} confidence - 0–1, how strongly this type was matched
 * @property {string} suggestedMode - collector mode hint: 'standard'|'auto'|'deep'
 * @property {string[]} priorityFacts - fact fields most likely to be useful
 * @property {object} collectorHints - key/value config hints for the collector
 * @property {string[]} matchedSignals - which patterns fired (for debugging)
 */

// ---------------------------------------------------------------------------
// Pattern definitions
// ---------------------------------------------------------------------------

// Each rule: { type, signals, mode, priorityFacts, collectorHints }
// Signals are arrays of regex patterns — a rule fires if ≥1 signal matches.
// Rules are evaluated in order; first match wins for type assignment, but all
// matching signals are accumulated for the returned matchedSignals array.

const RULES = [
  {
    type: 'pricing',
    mode: 'auto',
    priorityFacts: ['plan_name', 'price', 'currency', 'billing_period', 'product_name'],
    collectorHints: { preferPricingPages: true, includeJsonLd: true },
    signals: [
      /\bpric(?:e|es|ing|ed)\b/i,
      /\bplan[s]?\b.*\b(cost|price|monthly|annual|tier)/i,
      /\b(tier|tiers|pricing tier)\b/i,
      /\b(per seat|per user|per month|per year|\/mo|\/yr|monthly|annually)\b/i,
      /\b(free tier|freemium|free plan|paid plan|enterprise plan|starter plan|pro plan)\b/i,
      /\b(cost[s]?|costs? how much|how much does)\b/i,
      /\bvs\.?\s+\w+.*pric/i,
      /\bpric.*vs\.?\s+\w+/i,
      /\b(subscription|license fee|licensing cost)\b/i,
    ],
  },
  {
    type: 'competitive',
    mode: 'deep',
    priorityFacts: ['product_name', 'company', 'plan_name', 'price', 'star_rating', 'review_count'],
    collectorHints: { includeJsonLd: true, includeReviews: true },
    signals: [
      /\bvs\.?\s+\w+/i,
      /\bcompet(?:itor|itive|ition|es|ing)\b/i,
      /\balternative[s]?\b/i,
      /\bcompare[sd]?\b/i,
      /\b(landscape|market map|competitive analysis|feature comparison)\b/i,
      /\b(rival[s]?|challenger[s]?|incumbent[s]?)\b/i,
      /vs\s+/i,
    ],
  },
  {
    type: 'market-size',
    mode: 'deep',
    priorityFacts: ['company', 'product_name', 'published_or_observed_date'],
    collectorHints: { preferAnalystReports: true },
    signals: [
      /\b(tam|sam|som)\b/i,
      /\bmarket size\b/i,
      /\btotal addressable market\b/i,
      /\bmarket (share|opportunity|growth|forecast)\b/i,
      /\b(billion|trillion|million)[\s\-]dollar market\b/i,
      /\b(cagr|compound annual growth)\b/i,
      /\bmarket research\b/i,
      /\bindustry (size|report|analysis|forecast)\b/i,
    ],
  },
  {
    type: 'acquisition',
    mode: 'auto',
    priorityFacts: ['acquisition_event', 'acquisition_date', 'acquirer', 'acquired_company', 'company'],
    collectorHints: { preferNewsPages: true, preferRecentResults: true },
    signals: [
      /\bacquir(?:ed|es|ing|ition|itions)\b/i,
      /\bbought by\b/i,
      /\bmerger[s]?\b/i,
      /\bm&a\b/i,
      /\btakeover[s]?\b/i,
      /\b(acquisition history|who acquired|was acquired)\b/i,
    ],
  },
  {
    type: 'funding',
    mode: 'auto',
    priorityFacts: ['funding_event', 'company', 'product_name', 'acquisition_event'],
    collectorHints: { preferNewsPages: true, preferRecentResults: true },
    signals: [
      /\b(series [a-f])\b/i,
      /\b(seed (round|funding)|seed stage)\b/i,
      /\braised\s+\$[\d.]+/i,
      /\bfunding (round|history|raise|announcement)\b/i,
      /\bventure (capital|funding|backed)\b/i,
      /\b(vc[- ]backed|investor|investors)\b/i,
      /\b(ipo|spac|went public)\b/i,
      /\bvaluation\b/i,
    ],
  },
  {
    type: 'reviews',
    mode: 'auto',
    priorityFacts: ['star_rating', 'review_count', 'product_name', 'company'],
    collectorHints: { includeJsonLd: true, preferReviewSites: true },
    signals: [
      /\breview[s]?\b/i,
      /\brating[s]?\b/i,
      /\bstar[s]?\s+rating\b/i,
      /\b(g2|capterra|trustpilot|product hunt)\b/i,
      /\bwhat (users?|customers?|people) (say|think|feel)\b/i,
      /\b(sentiment|nps|satisfaction score)\b/i,
      /\buser feedback\b/i,
    ],
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Classify a research query string and return collector hints.
 *
 * @param {string} query
 * @returns {Classification}
 */
export function classifyRequest(query) {
  if (!query || typeof query !== 'string') {
    return buildResult('general', 0, []);
  }

  const q = query.trim();

  // Accumulate hits per rule type
  const hits = new Map(); // type → { rule, matchedSignals: string[] }

  for (const rule of RULES) {
    const matched = [];
    for (const signal of rule.signals) {
      if (signal.test(q)) {
        matched.push(signal.source);
      }
    }
    if (matched.length > 0) {
      hits.set(rule.type, { rule, matchedSignals: matched });
    }
  }

  if (hits.size === 0) {
    return buildResult('general', 0, []);
  }

  // Pick the type with the most matched signals; break ties by rule order
  let bestType = null;
  let bestCount = 0;

  for (const rule of RULES) {
    if (!hits.has(rule.type)) continue;
    const count = hits.get(rule.type).matchedSignals.length;
    if (count > bestCount) {
      bestCount = count;
      bestType = rule.type;
    }
  }

  const { rule, matchedSignals } = hits.get(bestType);

  // Confidence rises with additional matched signals and caps at 1.0.
  const confidence = Math.min(1.0, 0.5 + bestCount * 0.17);

  return buildResult(bestType, confidence, matchedSignals, rule);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildResult(type, confidence, matchedSignals, rule = null) {
  const defaults = {
    pricing: {
      mode: 'auto',
      priorityFacts: ['plan_name', 'price', 'currency', 'billing_period', 'product_name'],
      collectorHints: { preferPricingPages: true, includeJsonLd: true },
    },
    competitive: {
      mode: 'deep',
      priorityFacts: ['product_name', 'company', 'plan_name', 'price', 'star_rating', 'review_count'],
      collectorHints: { includeJsonLd: true, includeReviews: true },
    },
    'market-size': {
      mode: 'deep',
      priorityFacts: ['company', 'product_name', 'published_or_observed_date'],
      collectorHints: { preferAnalystReports: true },
    },
    acquisition: {
      mode: 'auto',
      priorityFacts: ['acquisition_event', 'acquisition_date', 'acquirer', 'acquired_company'],
      collectorHints: { preferNewsPages: true, preferRecentResults: true },
    },
    funding: {
      mode: 'auto',
      priorityFacts: ['funding_event', 'company', 'product_name'],
      collectorHints: { preferNewsPages: true, preferRecentResults: true },
    },
    reviews: {
      mode: 'auto',
      priorityFacts: ['star_rating', 'review_count', 'product_name', 'company'],
      collectorHints: { includeJsonLd: true, preferReviewSites: true },
    },
    general: {
      mode: 'auto',
      priorityFacts: ['company', 'product_name', 'published_or_observed_date'],
      collectorHints: {},
    },
  };

  const config = rule
    ? {
        mode: rule.mode,
        priorityFacts: rule.priorityFacts,
        collectorHints: rule.collectorHints,
      }
    : defaults[type] || defaults.general;

  return {
    requestType: type,
    confidence,
    suggestedMode: config.mode,
    priorityFacts: config.priorityFacts,
    collectorHints: config.collectorHints,
    matchedSignals,
  };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

async function main(argv = process.argv.slice(2)) {
  const jsonFlag = argv.includes('--json');
  const query = argv.filter((a) => !a.startsWith('--')).join(' ');

  if (!query) {
    console.error('Usage: node scripts/classify-request.mjs [--json] "<query>"');
    process.exitCode = 1;
    return;
  }

  const result = classifyRequest(query);

  if (jsonFlag) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`Request type:    ${result.requestType}`);
  console.log(`Confidence:      ${(result.confidence * 100).toFixed(0)}%`);
  console.log(`Suggested mode:  ${result.suggestedMode}`);
  console.log(`Priority facts:  ${result.priorityFacts.join(', ')}`);
  if (Object.keys(result.collectorHints).length > 0) {
    console.log(`Collector hints: ${JSON.stringify(result.collectorHints)}`);
  }
  if (result.matchedSignals.length > 0) {
    console.log(`Matched signals: ${result.matchedSignals.length}`);
  }
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
