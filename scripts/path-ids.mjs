#!/usr/bin/env node

import crypto from 'node:crypto';

const DEFAULT_SEGMENT_LIMIT = 32;
const DEFAULT_SCENARIO_LIMIT = 24;

export function compactPathSegment(value, maxLength = DEFAULT_SEGMENT_LIMIT) {
  const normalized = normalizeSegment(value);
  if (normalized.length <= maxLength) {
    return normalized;
  }

  const hash = shortHash(normalized);
  const prefixLength = Math.max(8, maxLength - hash.length - 1);
  return `${normalized.slice(0, prefixLength)}-${hash}`;
}

export function compactScenarioId(value) {
  return compactPathSegment(value, DEFAULT_SCENARIO_LIMIT);
}

export function buildTimestampToken(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '').replace('T', '-').replace('Z', 'Z');
}

export function buildRunId(prefix, scenarioId, explicitValue) {
  if (typeof explicitValue === 'string' && explicitValue.trim().length > 0) {
    return explicitValue.trim();
  }

  return `${prefix}-${buildTimestampToken()}-${compactScenarioId(scenarioId)}`;
}

function normalizeSegment(value) {
  return (typeof value === 'string' ? value : String(value ?? ''))
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function shortHash(value) {
  return crypto.createHash('sha1').update(value).digest('hex').slice(0, 8);
}
