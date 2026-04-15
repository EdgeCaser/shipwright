#!/usr/bin/env node

import path from 'node:path';
import { pathToFileURL } from 'node:url';

const RESEARCH_SIGNALS = ['market', 'tam', 'sam', 'som', 'pricing', 'competitive', 'competitor', 'research'];
const AUDIENCE_OUTSIDE_PRODUCT_RE = /\b(board|leadership|executive|exec|ceo|vp|sales|customer|engineering)\b/i;
const BUDGET_OR_ROADMAP_RE = /\b(budget|headcount|roadmap|approve|approval|funding)\b/i;
const ENGINEERING_HANDOFF_RE = /\b(tech handoff|technical spec|hand off to engineering|engineering handoff)\b/i;

// Decision analysis detection — high-stakes binary decision questions
const HIGH_STAKES_DECISION_RE = /\bshould\s+(?:we|i|the\s+(?:company|team|board))\b/i;
const SCENARIO_CLASS_PATTERNS = [
  { scenarioClass: 'governance', pattern: /\b(restructur|acqui(?:re|sition)|merger|divest|spin[- ]off|dissolv|reorgani[sz]|board\s+(?:vote|decision|approval))\b/i },
  { scenarioClass: 'publication', pattern: /\b(go\s+public|ipo|press\s+release|public\s+(?:statement|announcement)|publish\s+(?:the|our|a))\b/i },
  { scenarioClass: 'product_strategy', pattern: /\b(kill|sunset|shut\s+down|pivot|build\s+vs\.?\s+buy|make\s+vs\.?\s+buy|bet\s+(?:the|our)\s+company)\b/i },
  { scenarioClass: 'pricing', pattern: /\b(raise\s+(?:our\s+)?prices|lower\s+(?:our\s+)?prices|change\s+(?:our\s+)?pricing|reprice|price\s+increase|price\s+decrease)\b/i },
];

const ROUTE_RULES = [
  {
    route: 'decision-analysis',
    kind: 'analysis',
    exactPatterns: [
      /\bdecision[- ]analysis\b/i,
      /\brun[- ](?:a[- ])?(?:fast|rigorous?)[- ](?:mode[- ])?analysis\b/i,
      /\bshipwright[- ]analysis\b/i,
    ],
    keywords: ['restructure', 'acquisition', 'divestiture', 'merger', 'governance decision'],
  },
  {
    route: 'write-prd',
    kind: 'workflow',
    exactPatterns: [/\b\/write-prd\b/i, /\bwrite\s+(?:a\s+)?prd\b/i, /\bproduct requirements doc(?:ument)?\b/i],
    keywords: ['prd', 'requirements', 'spec', 'feature'],
  },
  {
    route: 'sprint',
    kind: 'workflow',
    exactPatterns: [/\b\/sprint\b/i, /\bsprint planning\b/i],
    keywords: ['sprint', 'planning', 'commitment', 'capacity'],
  },
  {
    route: 'strategy',
    kind: 'workflow',
    exactPatterns: [/\b\/strategy\b/i, /\bproduct strategy\b/i, /\bstrategic bets\b/i],
    keywords: ['strategy', 'vision', 'bets', 'boundaries'],
  },
  {
    route: 'pricing',
    kind: 'workflow',
    exactPatterns: [/\b\/pricing\b/i, /\bpricing strategy\b/i],
    keywords: ['pricing', 'package', 'plans', 'monetization'],
  },
  {
    route: 'competitive',
    kind: 'workflow',
    exactPatterns: [/\b\/competitive\b/i, /\bcompetitive analysis\b/i],
    keywords: ['competitive', 'competitor', 'comparison', 'landscape'],
  },
  {
    route: 'metrics',
    kind: 'workflow',
    exactPatterns: [/\b\/metrics\b/i, /\bmetrics framework\b/i, /\bnorth star\b/i],
    keywords: ['metrics', 'dashboard', 'north star', 'guardrail'],
  },
  {
    route: 'okrs',
    kind: 'workflow',
    exactPatterns: [/\b\/okrs\b/i, /\bwrite okrs\b/i, /\bobjectives and key results\b/i],
    keywords: ['okr', 'okrs', 'objectives', 'key results'],
  },
  {
    route: 'retro',
    kind: 'workflow',
    exactPatterns: [/\b\/retro\b/i, /\bretrospective\b/i],
    keywords: ['retro', 'retrospective', 'what went well', 'action items'],
  },
  {
    route: 'status',
    kind: 'workflow',
    exactPatterns: [/\b\/status\b/i, /\bstatus update\b/i],
    keywords: ['status', 'update', 'stakeholder', 'progress'],
  },
  {
    route: 'challenge',
    kind: 'workflow',
    exactPatterns: [/\b\/challenge\b/i, /\bpressure[- ]test\b/i, /\bchallenge this\b/i],
    keywords: ['challenge', 'red team', 'stress test', 'critique'],
  },
  {
    route: 'tech-handoff',
    kind: 'workflow',
    exactPatterns: [/\b\/tech-handoff\b/i, /\btech handoff\b/i, /\bhand off to engineering\b/i],
    keywords: ['engineering', 'handoff', 'technical spec', 'epics'],
  },
  {
    route: 'customer-review',
    kind: 'workflow',
    exactPatterns: [/\b\/customer-review\b/i, /\bcustomer intelligence\b/i],
    keywords: ['customer', 'feedback', 'churn', 'journey'],
  },
  {
    route: 'plan-launch',
    kind: 'workflow',
    exactPatterns: [/\b\/plan-launch\b/i, /\blaunch plan\b/i, /\bgo to market\b/i],
    keywords: ['launch', 'gtm', 'go to market', 'battlecard'],
  },
  {
    route: 'discover',
    kind: 'workflow',
    exactPatterns: [/\b\/discover\b/i, /\bdiscovery\b/i, /\bopportunity solution tree\b/i],
    keywords: ['discover', 'discovery', 'opportunity', 'experiment'],
  },
  {
    route: 'personas',
    kind: 'workflow',
    exactPatterns: [/\b\/personas\b/i, /\bjobs to be done\b/i],
    keywords: ['persona', 'personas', 'jtbd', 'jobs to be done'],
  },
  {
    route: 'narrative',
    kind: 'workflow',
    exactPatterns: [/\b\/narrative\b/i, /\bexecutive briefing\b/i, /\b6-pager\b/i],
    keywords: ['memo', 'narrative', 'briefing', 'one-pager'],
  },
  {
    route: 'release-notes',
    kind: 'skill',
    exactPatterns: [/\brelease notes\b/i, /\bchangelog\b/i],
    keywords: ['release', 'notes', 'changelog', 'shipped'],
  },
];

const PREPARED_ROUTE_RULES = ROUTE_RULES.map((rule) => ({
  ...rule,
  compiledKeywords: rule.keywords.map((keyword) => ({
    keyword,
    pattern: compileKeywordPattern(keyword),
  })),
}));

export function routeRequest(input, options = {}) {
  const text = String(input || '').trim();
  if (!text) {
    return buildEmptyResult(text);
  }

  const normalized = text.toLowerCase();
  const matches = PREPARED_ROUTE_RULES.map((rule) => matchRule(rule, normalized))
    .filter((result) => result.score > 0 || result.exactMatch);
  matches.sort((a, b) => b.sortScore - a.sortScore || a.route.localeCompare(b.route));

  const winner = matches[0] || null;
  const tiedTop = winner
    ? matches.filter((candidate) => candidate.sortScore === winner.sortScore)
    : [];

  const signals = detectRequestSignals(normalized, winner, options);
  const blockers = inferBlockers(winner, signals);
  const escalateReasons = inferAutoEscalationReasons(signals);

  let routeConfidence = 'LOW';
  if (winner && tiedTop.length === 1) {
    if ((winner.exactMatch || winner.keywordHits.length >= 2) && blockers.length === 0) {
      routeConfidence = 'HIGH';
    } else {
      routeConfidence = 'MEDIUM';
    }
  }

  // Infer scenario class for high-stakes binary decision questions
  const isDecisionQuestion = HIGH_STAKES_DECISION_RE.test(normalized);
  const scenarioClassMatch = isDecisionQuestion
    ? SCENARIO_CLASS_PATTERNS.find(({ pattern }) => pattern.test(normalized))
    : null;
  const decisionClass = scenarioClassMatch?.scenarioClass
    || (winner?.route === 'decision-analysis' ? 'unclassified' : null);

  return {
    input: text,
    topRoute: winner ? { route: winner.route, kind: winner.kind } : null,
    routeConfidence,
    blockers,
    autoEscalate: escalateReasons.length > 0,
    escalateReasons,
    decisionClass,
    matchedRoutes: matches.map((match) => ({
      route: match.route,
      kind: match.kind,
      exactMatch: match.exactMatch,
      keywordHits: match.keywordHits,
      score: match.sortScore,
    })),
  };
}

function buildEmptyResult(input) {
  return {
    input,
    topRoute: null,
    routeConfidence: 'LOW',
    blockers: [],
    autoEscalate: false,
    escalateReasons: [],
    decisionClass: null,
    matchedRoutes: [],
  };
}

function matchRule(rule, normalizedInput) {
  const exactMatch = rule.exactPatterns.some((pattern) => pattern.test(normalizedInput));
  const keywordHits = rule.compiledKeywords
    .filter(({ pattern }) => matchKeywordPattern(normalizedInput, pattern))
    .map(({ keyword }) => keyword);
  const sortScore = (exactMatch ? 100 : 0) + keywordHits.length;

  return {
    route: rule.route,
    kind: rule.kind,
    exactMatch,
    keywordHits,
    score: exactMatch || keywordHits.length > 0 ? 1 : 0,
    sortScore,
  };
}

function detectRequestSignals(input, winner, options) {
  const contradictionWarningCount = Number(options.contradictionWarningCount || 0);
  return {
    requiresExternalResearch: hasAnyKeyword(input, RESEARCH_SIGNALS),
    multiStepDependency: winner ? winner.route === 'plan-launch' || winner.route === 'tech-handoff' : false,
    missingMandatoryInput: Array.isArray(options.missingInputs) && options.missingInputs.length > 0,
    audienceOutsideProduct: AUDIENCE_OUTSIDE_PRODUCT_RE.test(input),
    budgetOrRoadmapDecision: BUDGET_OR_ROADMAP_RE.test(input),
    engineeringHandoffArtifact: Boolean(winner?.route === 'tech-handoff' || ENGINEERING_HANDOFF_RE.test(input)),
    validatorContradictions: Number.isFinite(contradictionWarningCount) && contradictionWarningCount >= 2,
  };
}

function inferBlockers(winner, signals) {
  const blockers = [];
  if (!winner) {
    blockers.push('no-deterministic-route');
    return blockers;
  }

  if (signals.requiresExternalResearch) blockers.push('external-research-required');
  if (signals.multiStepDependency) blockers.push('multi-step-dependency');
  if (signals.missingMandatoryInput) blockers.push('missing-mandatory-input');
  if (signals.audienceOutsideProduct) blockers.push('audience-outside-product');

  return blockers;
}

function inferAutoEscalationReasons(signals) {
  const reasons = [];

  if (signals.requiresExternalResearch) reasons.push('external-research-required');
  if (signals.budgetOrRoadmapDecision) reasons.push('budget-or-roadmap-decision');
  if (signals.engineeringHandoffArtifact) reasons.push('engineering-handoff-artifact');
  if (signals.validatorContradictions) reasons.push('validator-contradictions');
  if (signals.audienceOutsideProduct) reasons.push('stakeholder-audience-outside-product');

  return reasons;
}

function hasAnyKeyword(input, keywords) {
  return keywords.some((keyword) => containsKeyword(input, keyword));
}

function containsKeyword(input, keyword) {
  return matchKeywordPattern(input, compileKeywordPattern(keyword));
}

function compileKeywordPattern(keyword) {
  if (keyword.includes(' ')) {
    return keyword.toLowerCase();
  }

  return new RegExp(`\\b${escapeRegex(keyword.toLowerCase())}\\b`, 'i');
}

function matchKeywordPattern(input, pattern) {
  if (typeof pattern === 'string') {
    return input.includes(pattern);
  }
  return pattern.test(input);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function main(argv = process.argv.slice(2)) {
  const formatFlag = argv.findIndex((entry) => entry === '--format');
  const contradictionFlag = argv.findIndex((entry) => entry === '--contradiction-warning-count');
  const outputFormat = formatFlag !== -1 && argv[formatFlag + 1] ? argv[formatFlag + 1] : 'text';
  const contradictionWarningCount =
    contradictionFlag !== -1 && argv[contradictionFlag + 1]
      ? Number(argv[contradictionFlag + 1])
      : 0;

  const input = argv.filter((entry, index) => {
    if (entry.startsWith('--')) return false;
    if (formatFlag !== -1 && index === formatFlag + 1) return false;
    if (contradictionFlag !== -1 && index === contradictionFlag + 1) return false;
    return true;
  }).join(' ').trim();

  if (!input) {
    console.error('Usage: node scripts/route-request.mjs "<request>" [--format json] [--contradiction-warning-count 2]');
    process.exitCode = 1;
    return;
  }

  const result = routeRequest(input, { contradictionWarningCount });
  if (outputFormat === 'json') {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`topRoute: ${result.topRoute ? `${result.topRoute.kind}:${result.topRoute.route}` : 'none'}`);
  console.log(`routeConfidence: ${result.routeConfidence}`);
  console.log(`autoEscalate: ${result.autoEscalate ? 'yes' : 'no'}`);
  if (result.blockers.length > 0) console.log(`blockers: ${result.blockers.join(', ')}`);
  if (result.escalateReasons.length > 0) console.log(`escalateReasons: ${result.escalateReasons.join(', ')}`);
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
