#!/usr/bin/env node

/**
 * Shipwright postflight artifact validator.
 *
 * Runs deterministic checks on a markdown artifact and returns a list of
 * issues. Conservative by design: false negatives are preferred over false
 * positives, so only high-signal patterns are flagged.
 *
 * Checks:
 *   unsupported-dollar             Dollar figures in prose without citation
 *   unsupported-numeric            Percentage or large-number claims in prose without citation
 *   missing-section                Expected section headings absent from the document
 *   missing-structured-artifact    Structured artifact block expected but absent
 *   invalid-structured-artifact    Structured block exists but fails parsing/schema checks
 *   missing-decision-field         Decision frame contract incomplete
 *   missing-pass-fail              Pass/fail contract incomplete
 *   missing-evidence               Required evidence linkage missing
 *   metric-contradiction           Related artifacts disagree on the same metric
 *   segment-contradiction          Related artifacts disagree on target segment
 *   challenge-finding-unresolved   Challenge finding not resolved/waived/deferred correctly
 *
 * Usage (programmatic):
 *   import { validateArtifact } from './validate-artifact.mjs';
 *   const { issues, summary } = validateArtifact(markdownText, {
 *     expectSections: ['Background', 'Success Metrics'],
 *     expectStructured: true,
 *     artifactType: 'prd',
 *   });
 *
 * Usage (CLI):
 *   node scripts/validate-artifact.mjs path/to/artifact.md
 *   node scripts/validate-artifact.mjs path/to/artifact.md --expect-structured --artifact-type prd
 *   node scripts/validate-artifact.mjs path/to/artifact.md --related path/to/strategy.json --format json
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { visibleMarkdown } from './markdown-scan.mjs';

export { visibleMarkdown };

import {
  extractStructuredArtifact,
  validateStructuredArtifact,
} from './extract-structured-artifact.mjs';

// ---------------------------------------------------------------------------
// Public constants
// ---------------------------------------------------------------------------

export const IssueType = Object.freeze({
  EMPTY_ARTIFACT: 'empty-artifact',
  READINESS_FAILED: 'readiness-failed',
  INVALID_RELATED_ARTIFACT: 'invalid-related-artifact',
  UNSUPPORTED_DOLLAR: 'unsupported-dollar',
  UNSUPPORTED_NUMERIC: 'unsupported-numeric',
  MISSING_SECTION: 'missing-section',
  MISSING_STRUCTURED_ARTIFACT: 'missing-structured-artifact',
  INVALID_STRUCTURED_ARTIFACT: 'invalid-structured-artifact',
  MISSING_DECISION_FIELD: 'missing-decision-field',
  MISSING_PASS_FAIL: 'missing-pass-fail',
  MISSING_EVIDENCE: 'missing-evidence',
  METRIC_CONTRADICTION: 'metric-contradiction',
  SEGMENT_CONTRADICTION: 'segment-contradiction',
  CHALLENGE_FINDING_UNRESOLVED: 'challenge-finding-unresolved',
  PROSE_JSON_MISMATCH: 'prose-json-mismatch',
});

export const Severity = Object.freeze({
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
});

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} ValidationIssue
 * @property {string} type - One of IssueType
 * @property {string} severity - One of Severity
 * @property {string} message
 * @property {number} lineNumber - 1-indexed line where the issue starts
 * @property {string} excerpt - Relevant text (truncated)
 */

/**
 * Validate a Shipwright markdown artifact.
 *
 * @param {string} text - Markdown content to validate
 * @param {object} [options]
 * @param {string[]} [options.expectSections]
 * @param {boolean} [options.checkCitations]
 * @param {boolean} [options.expectStructured]
 * @param {string} [options.artifactType]
 * @param {object[]} [options.relatedArtifacts]
 * @returns {{ issues: ValidationIssue[], summary: string, artifact: object | null }}
 */
export function validateArtifact(text, options = {}) {
  if (typeof text !== 'string' || !text.trim()) {
    const issues = [{ type: IssueType.EMPTY_ARTIFACT, severity: Severity.ERROR,
      message: 'Artifact content is empty.', lineNumber: 1, excerpt: '' }];
    return finishValidation(issues, null, options);
  }

  const {
    expectSections = [],
    checkCitations = true,
    expectStructured = false,
    artifactType,
    relatedArtifacts = [],
  } = options;

  const issues = [];
  const visibleText = visibleMarkdown(text);

  if (checkCitations) {
    issues.push(...checkUnsupportedDollarFigures(text));
    issues.push(...checkUnsupportedNumericClaims(text));
  }

  for (const section of expectSections) {
    const issue = checkMissingSection(visibleText, section);
    if (issue) issues.push(issue);
  }

  const extracted = extractStructuredArtifact(text);
  // An envelope that sits only inside a code example is documentation, but if it
  // was meant to be the artifact's contract, skipping every check silently is worse.
  if (!extracted.artifact && !extracted.error && !expectStructured && !artifactType) {
    const inCode = text.split('\n').findIndex(line => /<!--\s*shipwright:artifact\b/.test(line));
    if (inCode >= 0) {
      issues.push({
        type: IssueType.MISSING_STRUCTURED_ARTIFACT,
        severity: Severity.WARNING,
        message: 'A shipwright:artifact block appears only inside a code example, so no contract checks ran.',
        lineNumber: inCode + 1,
        excerpt: '',
      });
    }
  }
  const shouldCheckStructured =
    expectStructured || Boolean(artifactType) || Boolean(extracted.artifact) || Boolean(extracted.error);

  if (shouldCheckStructured) {
    if (extracted.error) {
      issues.push({
        type: IssueType.INVALID_STRUCTURED_ARTIFACT,
        severity: Severity.ERROR,
        message: `Structured artifact block is unusable: ${extracted.error}`,
        lineNumber: extracted.startLine,
        excerpt: truncateExcerpt(extracted.raw || '', 150),
      });
    } else if (!extracted.artifact && (expectStructured || artifactType)) {
      issues.push({
        type: IssueType.MISSING_STRUCTURED_ARTIFACT,
        severity: Severity.ERROR,
        message: 'Expected a structured artifact block, but none was found.',
        lineNumber: 1,
        excerpt: '',
      });
    }

    if (extracted.artifact) {
      const validation = validateStructuredArtifact(extracted.artifact, { artifactType });
      for (const error of validation.errors) {
        issues.push({
          type: IssueType.INVALID_STRUCTURED_ARTIFACT,
          severity: Severity.ERROR,
          message: `${error.path}: ${error.message}`,
          lineNumber: extracted.startLine,
          excerpt: truncateExcerpt(extracted.raw || '', 150),
        });
      }

      // Semantic checks assume a schema-valid shape. Never crash on malformed input.
      const validRelated = [];
      for (const related of relatedArtifacts) {
        const result = validateStructuredArtifact(related);
        if (result.errors.length) {
          issues.push({ type: IssueType.INVALID_RELATED_ARTIFACT, severity: Severity.ERROR,
            message: `Related artifact is invalid: ${result.errors.map(e => `${e.path}: ${e.message}`).join('; ')}`,
            lineNumber: extracted.startLine, excerpt: '' });
        } else validRelated.push(related);
      }
      if (extracted.artifact?.decision_frame && typeof extracted.artifact.decision_frame === 'object'
        && extracted.artifact?.pass_fail_readiness && typeof extracted.artifact.pass_fail_readiness === 'object'
        && (!('payload' in extracted.artifact) || typeof extracted.artifact.payload === 'object')) {
        issues.push(...checkVisibleContract(
          visibleText, extracted.artifact,
        ));
      }
      if (validation.errors.length === 0) issues.push(
        ...checkDecisionFrameContract(extracted.artifact, extracted.startLine),
        ...checkPassFailContract(extracted.artifact, extracted.startLine),
        ...checkEvidenceContract(extracted.artifact, extracted.startLine),
        ...checkInternalConsistency(extracted.artifact, extracted.startLine),
        ...checkMetricContradictions(extracted.artifact, validRelated, extracted.startLine),
        ...checkSegmentContradictions(extracted.artifact, validRelated, extracted.startLine),
        ...checkChallengePropagation(extracted.artifact, validRelated, extracted.startLine),
      );
    }
  }

  return finishValidation(issues, extracted.artifact || null, {
    ...options, visibleText,
  });
}

function finishValidation(issues, artifact, options) {
  const valid = !issues.some(issue => issue.severity === Severity.ERROR);
  const reasons = [];
  const status = artifact?.pass_fail_readiness?.status || null;
  if (!artifact) reasons.push('No structured artifact was validated.');
  if (status !== 'PASS') reasons.push('Artifact declares FAIL or has no PASS readiness.');
  if (artifact?.metadata?.status === 'exploratory-draft') reasons.push('Exploratory draft.');
  const metrics = artifact?.artifact_type === 'prd'
    ? (Array.isArray(artifact.payload?.success_metrics) ? artifact.payload.success_metrics : [])
    : artifact?.artifact_type === 'strategy'
      ? (Array.isArray(artifact.payload?.bets) ? artifact.payload.bets.map(bet => bet?.success_metric) : []) : [];
  const incompleteMetrics = metrics.some(metric => isPlaceholder(metric?.baseline) || isPlaceholder(metric?.target));
  const light = artifact?.artifact_type === 'prd' && ['light', 'quick'].includes(artifact?.depth);
  if (incompleteMetrics && !light) reasons.push('Metric baseline or target is unresolved.');
  if (Object.values(artifact?.decision_frame || {}).some(isPlaceholder)) {
    reasons.push('Decision Frame contains an unresolved placeholder.');
  }
  if (issues.some(issue => issue.type === IssueType.CHALLENGE_FINDING_UNRESOLVED
    && issue.severity !== Severity.INFO)) reasons.push('Challenge findings block readiness.');
  if (!valid) reasons.push('Contract or visible artifact has errors.');
  const ready = reasons.length === 0;
  const engineeringReasons = [...reasons];
  if (incompleteMetrics) engineeringReasons.push('Metric baseline or target is unresolved for engineering.');
  if (light) engineeringReasons.push('Light brief needs detailed requirements for engineering.');
  if (artifact?.artifact_type === 'prd' && !/(?:^|\n) {0,3}#{1,6}\s+(?:\d+\.\s*)?(?:Detailed Requirements|Product Requirements Document)\b/im
    .test(options.visibleText || '')) {
    engineeringReasons.push('Detailed requirements are missing for engineering handoff.');
  }
  if (issues.some(issue => issue.severity === Severity.WARNING)) {
    engineeringReasons.push('Validation warnings need review before engineering handoff.');
  }
  const reviewFindings = (options.relatedArtifacts || [])
    .filter(related => related?.artifact_type === 'challenge-report')
    .flatMap(related => Array.isArray(related.payload?.findings) ? related.payload.findings : []);
  const resolutions = Array.isArray(artifact?.challenge_resolution) ? artifact.challenge_resolution : [];
  for (const resolution of resolutions) {
    if (!reviewFindings.some(finding => finding?.finding_id === resolution?.finding_id)) {
      engineeringReasons.push(`Related challenge report is required to verify resolution ${resolution?.finding_id}.`);
    }
  }
  for (const finding of reviewFindings) {
    if (!resolutions.some(resolution => resolution?.finding_id === finding?.finding_id)) {
      engineeringReasons.push(`Challenge finding ${finding?.finding_id} needs a recorded disposition.`);
    }
  }
  return { issues, summary: buildSummary(issues), artifact, valid,
    readiness: { status, ready, engineeringReady: engineeringReasons.length === 0,
      reasons: [...new Set(reasons)], engineeringReasons: [...new Set(engineeringReasons)] } };
}

function isPlaceholder(value) {
  return typeof value === 'string' && /^(?:\[?TBD\b|unknown\b|unmeasured\b|not measured\b|not tracked\b|\[requires:)/i.test(value.trim());
}

function checkVisibleContract(visible, artifact) {
  const issues = [];
  const fail = (message, lineNumber = 1) => issues.push({
    type: IssueType.PROSE_JSON_MISMATCH, severity: Severity.ERROR,
    message, lineNumber, excerpt: '',
  });
  const lines = visible.split('\n');
  const section = (name) => {
    const heading = new RegExp(`^#{1,6}\\s+${name}\\s*$`, 'i');
    const start = lines.findIndex(line => heading.test(line.trim()));
    if (start < 0) return { text: '', lineNumber: 1 };
    const end = lines.findIndex((line, index) => index > start && /^#{1,6}\s+/.test(line.trim()));
    return { text: lines.slice(start + 1, end < 0 ? undefined : end).join('\n'), lineNumber: start + 1 };
  };
  const decision = section('Decision Frame');
  if (!decision.text.trim()) fail('Visible Decision Frame is missing or empty.', decision.lineNumber);
  const labels = [
    ['recommendation', /recommendation/i],
    ['tradeoff', /trade[ -]?off/i],
    ['confidence', /confidence/i],
    ['owner', /owner/i],
    ['decision_date', /decision[ _-]?date/i],
    ['revisit_trigger', /revisit[ _-]?trigger/i],
  ];
  for (const [key, label] of labels) {
    const match = decision.text.split('\n').find(line => new RegExp(`^\\s*(?:[-*]\\s*)?(?:${label.source})\\s*:`, 'i').test(line.replace(/\*\*/g, '')));
    if (!match) { fail(`Visible Decision Frame is missing ${key}.`, decision.lineNumber); continue; }
    const value = match.replace(/\*\*/g, '').replace(/^\s*(?:[-*]\s*)?[^:]+:\s*/, '').trim();
    if (!value) { fail(`Visible Decision Frame has an empty ${key}.`, decision.lineNumber); continue; }
    if (key === 'confidence' || key === 'decision_date' || key === 'owner') {
      const normalized = normalizeProse(value);
      const expected = normalizeProse(String(artifact.decision_frame[key]));
      const matches = key === 'confidence'
        // The level leads and is not itself negated; a later explanation may say "no" or "not".
        ? normalized.match(/^(low|medium|high)\b/)?.[1] === expected
          && !/^(?:low|medium|high)\s+(?:(?:is|confidence)\s+)?(?:not|no|never)\b/i.test(value)
        : normalized === expected && !/^(?:not|no|never)\b/.test(normalized);
      if (!matches) {
        fail(`Visible Decision Frame ${key} disagrees with JSON.`, decision.lineNumber);
      }
    } else if (!substantivelyMatches(value, artifact.decision_frame[key])) {
      fail(`Visible Decision Frame ${key} differs materially from JSON.`, decision.lineNumber);
    }
  }
  const readiness = section('Pass/Fail Readiness');
  const verdictLine = readiness.text.split('\n').find(line => line.trim())?.replace(/\*\*/g, '').trim() || '';
  const visibleVerdict = verdictLine.match(/^(?:[-*]\s*)?(?:(?:status|readiness)\s*:\s*)?(PASS|FAIL)\b/i)?.[1]?.toUpperCase();
  if (visibleVerdict !== artifact.pass_fail_readiness.status) {
    fail('Visible Pass/Fail Readiness disagrees with JSON.', readiness.lineNumber);
  }
  for (const metric of (artifact.artifact_type === 'prd' && Array.isArray(artifact.payload?.success_metrics)
    ? artifact.payload.success_metrics : [])) {
    // Schema errors already identify malformed entries; comparison needs an object.
    if (!metric || typeof metric !== 'object' || Array.isArray(metric)) continue;
    const row = findMetricRow(lines, metric);
    if (!row) { fail(`Visible success metric "${metric.name}" is missing a field-labeled row.`); continue; }
    for (const field of ['baseline', 'target', 'unit', 'timeframe', 'segment']) {
      if (metric[field] === undefined) continue;
      if (!metricValueMatches(row.fields[field], metric[field])) {
        fail(`Visible metric "${metric.name}" ${field} disagrees with JSON.`, row.lineNumber);
      }
    }
  }
  return issues;
}

function normalizeProse(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function substantivelyMatches(visible, structured) {
  const negated = value => /\b(?:do not|don't|never|avoid|reject|stop|cancel)\b/i.test(value);
  if (negated(visible) !== negated(structured)) return false;
  const a = new Set(normalizeProse(visible).split(' ').filter(word => word.length > 3));
  const b = new Set(normalizeProse(structured).split(' ').filter(word => word.length > 3));
  if (a.size === 0 || b.size === 0) return false;
  const shared = [...a].filter(word => b.has(word)).length;
  return shared >= 1 && shared / Math.min(a.size, b.size) >= 0.35;
}

function metricValueMatches(text, value) {
  if (typeof text !== 'string' || !text.trim()) return false;
  // Remove attached citations, retaining the displayed value of a linked metric.
  text = text.replace(/\s+(?:\[[^\]]+\]\(https?:\/\/[^)]+\)|\((?:source|via|from|see|ref)\s*:[^)]*\))(?=\s|$)/gi, '')
    .replace(/\[\d+\](?!\()/g, '')
    .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/gi, '$1').trim();
  if (isPlaceholder(value)) return /\b(?:TBD|unknown|unmeasured|not measured|not tracked)\b/i.test(text);
  if (/\b(?:TBD|unknown|unmeasured|not measured|not tracked)\b/i.test(text)) return false;
  const numericValue = typeof value === 'number' ? value
    : typeof value === 'string' && /^[+-]?\d[\d,]*(?:\.\d+)?%?$/.test(value.trim())
      ? Number(value.replace(/[,%]/g, '')) : null;
  if (numericValue !== null) {
    const numbers = text.match(/[+-]?\d[\d,]*(?:\.\d+)?/g) || [];
    return numbers.length === 1 && Number(numbers[0].replace(/,/g, '')) === numericValue;
  }
  return normalizeProse(text) === normalizeProse(value);
}

function findMetricRow(lines, metric) {
  for (let index = 0; index < lines.length; index += 1) {
    if (!/^\s*\|/.test(lines[index])) continue;
    const headers = lines[index].split('|').slice(1, -1).map(cell => normalizeProse(cell));
    if (!headers.some(header => /^(metric|success metric|goal|name)$/.test(header))) continue;
    const columns = Object.fromEntries(headers.map((header, column) => [header, column]));
    const metricColumn = columns.metric ?? columns['success metric'] ?? columns.goal ?? columns.name;
    const end = lines.findIndex((line, next) => next > index && !/^\s*\|/.test(line));
    for (let row = index + 1; row < (end < 0 ? lines.length : end); row += 1) {
      if (/^\s*\|?\s*:?-{2,}/.test(lines[row])) continue;
      const cells = lines[row].split('|').slice(1, -1).map(cell => cell.trim());
      const name = normalizeProse(cells[metricColumn] || '');
      const id = typeof metric.metric_id === 'string' && metric.metric_id.trim()
        ? metric.metric_id.trim().replace(/[.*+?^{}()|[\]\\$]/g, '\\$&') : null;
      const idMatches = id && new RegExp('(^|[^\\p{L}\\p{N}_-])' + id + '(?=$|[^\\p{L}\\p{N}_-])', 'iu')
        .test(cells[metricColumn] || '');
      if (name !== normalizeProse(metric.name) && !idMatches) continue;
      const columnValue = (...aliases) => {
        const column = aliases.map(alias => columns[alias]).find(value => value !== undefined);
        return column === undefined ? undefined : cells[column];
      };
      return { lineNumber: row + 1, fields: {
        baseline: columnValue('baseline', 'current'),
        target: columnValue('target'),
        unit: columnValue('unit'),
        timeframe: columnValue('timeframe', 'time frame', 'window'),
        segment: columnValue('segment', 'cohort'),
      } };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Detectors
// ---------------------------------------------------------------------------

function checkUnsupportedDollarFigures(text) {
  const issues = [];

  for (const { content, startLine, table, source } of splitIntoClaims(text)) {
    if (hasCitationMarker(content) || source) continue;

    const dollarPattern = /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:[BMKbmk](?:illion)?)?/g;
    let matched = false;

    for (const match of content.matchAll(dollarPattern)) {
      if (!table && !isClaimContext(content, match.index ?? 0)) continue;
      matched = true;
      break;
    }

    if (matched) {
      issues.push({
        type: IssueType.UNSUPPORTED_DOLLAR,
        severity: Severity.WARNING,
        message: 'Dollar figure without a claim-local citation marker.',
        lineNumber: startLine,
        excerpt: truncateExcerpt(content, 150),
      });
    }
  }

  return issues;
}

function checkUnsupportedNumericClaims(text) {
  const issues = [];

  for (const { content, startLine, table, source } of splitIntoClaims(text)) {
    if (hasCitationMarker(content) || source) continue;

    const hasPercent = /\b\d{1,3}(?:\.\d+)?\s*%/.test(content);
    const hasLargeNumber =
      /\b\d+(?:\.\d+)?\s*(?:million|billion|trillion)\b/i.test(content);

    if (!hasPercent && !hasLargeNumber) continue;
    if (!table && !hasVerbPhrase(content)) continue;

    issues.push({
      type: IssueType.UNSUPPORTED_NUMERIC,
      severity: Severity.WARNING,
      message: hasPercent
        ? 'Percentage claim without a claim-local citation marker.'
        : 'Large numeric claim without a claim-local citation marker.',
      lineNumber: startLine,
      excerpt: truncateExcerpt(content, 150),
    });
  }

  return issues;
}

function checkMissingSection(text, sectionName) {
  const escaped = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^#{1,4}\\s+${escaped}\\s*$`, 'im');
  if (pattern.test(text)) return null;

  return {
    type: IssueType.MISSING_SECTION,
    severity: Severity.WARNING,
    message: `Expected section "${sectionName}" is missing from the document.`,
    lineNumber: 1,
    excerpt: '',
  };
}

function checkDecisionFrameContract(artifact, lineNumber) {
  const issues = [];
  const fields = [
    ['recommendation', 'Decision frame is missing recommendation.'],
    ['owner', 'Decision frame is missing owner.'],
    ['decision_date', 'Decision frame is missing decision_date.'],
  ];

  const decisionFrame = artifact?.decision_frame || {};
  if (decisionFrame.decision_date && !isPlaceholder(decisionFrame.decision_date)) {
    const date = new Date(`${decisionFrame.decision_date}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== decisionFrame.decision_date) {
      issues.push({ type: IssueType.MISSING_DECISION_FIELD, severity: Severity.ERROR,
        message: 'decision_date must be a real calendar date (YYYY-MM-DD).', lineNumber, excerpt: '' });
    }
  }
  for (const [field, message] of fields) {
    if (typeof decisionFrame[field] === 'string' && decisionFrame[field].trim().length > 0) continue;
    issues.push({
      type: IssueType.MISSING_DECISION_FIELD,
      severity: Severity.ERROR,
      message,
      lineNumber,
      excerpt: '',
    });
  }

  return issues;
}

function checkPassFailContract(artifact, lineNumber) {
  const readiness = artifact?.pass_fail_readiness || {};
  const issues = [];

  if (readiness.status === 'PASS') {
    const requiredValues = [...Object.values(artifact.decision_frame || {})];
    const metrics = artifact.artifact_type === 'prd' ? artifact.payload.success_metrics
      : artifact.artifact_type === 'strategy' ? artifact.payload.bets.map(bet => bet.success_metric) : [];
    const directionalPrd = artifact.artifact_type === 'prd' && ['light', 'quick'].includes(artifact.depth);
    if (!directionalPrd) {
      for (const metric of metrics || []) requiredValues.push(metric.baseline, metric.target);
    }
    if (requiredValues.some(isPlaceholder)) {
      issues.push({ type: IssueType.READINESS_FAILED, severity: Severity.WARNING,
        message: 'PASS contains unresolved placeholders in decision fields or metric baselines/targets.',
        lineNumber, excerpt: '' });
    }
  }

  if (readiness.status === 'FAIL' || artifact?.metadata?.status === 'exploratory-draft') {
    issues.push({ type: IssueType.READINESS_FAILED, severity: Severity.INFO,
      message: 'Artifact is marked FAIL or exploratory-draft; it is not ready for downstream use.',
      lineNumber, excerpt: '' });
  }

  if (!['PASS', 'FAIL'].includes(readiness.status)) {
    issues.push({
      type: IssueType.MISSING_PASS_FAIL,
      severity: Severity.ERROR,
      message: 'Pass/fail readiness is missing a valid status (PASS or FAIL).',
      lineNumber,
      excerpt: '',
    });
  }

  if (typeof readiness.reason !== 'string' || readiness.reason.trim().length === 0) {
    issues.push({
      type: IssueType.MISSING_PASS_FAIL,
      severity: Severity.ERROR,
      message: 'Pass/fail readiness is missing reason text.',
      lineNumber,
      excerpt: '',
    });
  }

  return issues;
}

function checkEvidenceContract(artifact, lineNumber) {
  const issues = [];
  const evidence = Array.isArray(artifact?.evidence) ? artifact.evidence : [];
  const factualEvidence = evidence.filter(item => item.kind !== 'assumption');
  const evidenceIds = new Set(factualEvidence.map((item) => item.evidence_id));
  const supportsIndex = buildEvidenceSupportIndex(factualEvidence);
  const allIds = new Set();
  for (const item of evidence) {
    if (allIds.has(item.evidence_id)) issues.push({ type: IssueType.MISSING_EVIDENCE, severity: Severity.ERROR,
      message: `Duplicate evidence ID: ${item.evidence_id}.`, lineNumber, excerpt: '' });
    allIds.add(item.evidence_id);
  }
  const isExploratory = artifact?.metadata?.status === 'exploratory-draft';

  if (!isExploratory && evidence.length === 0) {
    issues.push({
      type: IssueType.MISSING_EVIDENCE,
      severity: Severity.ERROR,
      message: 'Structured artifact requires at least one evidence entry unless marked exploratory-draft.',
      lineNumber,
      excerpt: '',
    });
    return issues;
  }

  for (const claim of collectRequiredClaims(artifact)) {
    for (const id of claim.evidenceIds) {
      if (!allIds.has(id)) issues.push({ type: IssueType.MISSING_EVIDENCE, severity: Severity.ERROR,
        message: `Unknown evidence ID "${id}" for ${claim.label}.`, lineNumber, excerpt: '' });
    }
    if (claimHasEvidence(claim, supportsIndex, evidenceIds)) continue;
    if (claimAllowsAssumption(claim)) continue;

    issues.push({
      type: IssueType.MISSING_EVIDENCE,
      severity: Severity.ERROR,
      message: `Missing evidence linkage for ${claim.label}.`,
      lineNumber,
      excerpt: '',
    });
  }

  return issues;
}

function checkInternalConsistency(artifact, lineNumber) {
  const issues = [];
  const fail = message => issues.push({ type: IssueType.INVALID_STRUCTURED_ARTIFACT,
    severity: Severity.ERROR, message, lineNumber, excerpt: '' });
  for (const [items, key] of [
    [artifact.payload.success_metrics, 'metric_id'], [artifact.payload.bets, 'bet_id'],
    [artifact.payload.findings, 'finding_id'], [artifact.challenge_resolution, 'finding_id'],
  ]) {
    if (!Array.isArray(items)) continue;
    const ids = new Set();
    for (const item of items) {
      if (ids.has(item[key])) fail(`Duplicate ${key}: ${item[key]}.`);
      ids.add(item[key]);
    }
  }
  if (artifact.artifact_type === 'challenge-report') {
    const { findings, verdict } = artifact.payload;
    if (findings.some(finding => finding.severity === 'critical') && verdict !== 'ESCALATE') {
      fail('Critical challenge findings require the ESCALATE verdict.');
    }
    if (verdict === 'CLEAR' && findings.some(finding => ['critical', 'moderate'].includes(finding.severity))) {
      fail('CLEAR cannot coexist with Critical or Moderate challenge findings.');
    }
  }
  return issues;
}

function checkMetricContradictions(artifact, relatedArtifacts, lineNumber) {
  const issues = [];
  const currentMetrics = extractMetrics(artifact);
  const seen = new Set();

  for (const related of relatedArtifacts || []) {
    const relatedMetrics = extractMetrics(related);

    for (const currentMetric of currentMetrics) {
      for (const otherMetric of relatedMetrics) {
        if (currentMetric.key !== otherMetric.key) continue;
        // Shared IDs cannot make different cohorts or measurement windows comparable.
        if (['segment', 'unit', 'timeframe'].some(field => currentMetric[field] && otherMetric[field]
          && currentMetric[field] !== otherMetric[field])) continue;
        const signature = `${currentMetric.key}:${related?.metadata?.title || related?.artifact_type || 'related'}`;
        if (seen.has(signature)) continue;

        const baselineConflict = compareMetricValue(
          currentMetric,
          otherMetric,
          'baseline',
        );
        const targetConflict = compareMetricValue(
          currentMetric,
          otherMetric,
          'target',
        );

        if (!baselineConflict && !targetConflict) continue;
        if (hasContradictionExplanation(currentMetric) || hasContradictionExplanation(otherMetric)) continue;

        seen.add(signature);
        issues.push({
          type: IssueType.METRIC_CONTRADICTION,
          severity: Severity.WARNING,
          message: `Metric "${currentMetric.name}" has materially different ${baselineConflict && targetConflict ? 'baseline and target values' : baselineConflict ? 'baseline values' : 'target values'} across related artifacts.`,
          lineNumber,
          excerpt: '',
        });
      }
    }
  }

  return issues;
}

function checkSegmentContradictions(artifact, relatedArtifacts, lineNumber) {
  const issues = [];
  const currentSegment = normalizeSegment(extractPrimarySegment(artifact));
  if (!currentSegment) return issues;

  const seen = new Set();
  for (const related of relatedArtifacts || []) {
    const otherSegment = normalizeSegment(extractPrimarySegment(related));
    if (!otherSegment || otherSegment === currentSegment) continue;

    const key = `${currentSegment}:${otherSegment}:${related?.metadata?.title || related?.artifact_type || 'related'}`;
    if (seen.has(key)) continue;
    seen.add(key);

    issues.push({
      type: IssueType.SEGMENT_CONTRADICTION,
      severity: Severity.WARNING,
      message: `Target segment differs across related artifacts: "${currentSegment}" vs "${otherSegment}".`,
      lineNumber,
      excerpt: '',
    });
  }

  return issues;
}

function checkChallengePropagation(artifact, relatedArtifacts, lineNumber) {
  const issues = [];
  const resolutions = Array.isArray(artifact?.challenge_resolution) ? artifact.challenge_resolution : [];
  const resolutionMap = new Map(
    resolutions
      .filter((item) => item && item.finding_id)
      .map((item) => [item.finding_id, item]),
  );
  const reportedFindings = new Map();
  for (const related of relatedArtifacts || []) {
    if (related?.artifact_type !== 'challenge-report') continue;
    for (const finding of related?.payload?.findings || []) {
      if (reportedFindings.has(finding.finding_id)) {
        issues.push({ type: IssueType.INVALID_RELATED_ARTIFACT, severity: Severity.ERROR,
          message: `Related challenge reports collide on finding ID "${finding.finding_id}".`, lineNumber, excerpt: '' });
      }
      reportedFindings.set(finding.finding_id, finding);
    }
  }
  for (const resolution of resolutions) {
    const relatedFinding = reportedFindings.get(resolution.finding_id);
    if (relatedFinding && resolution.severity && resolution.severity !== relatedFinding.severity) {
      issues.push({ type: IssueType.INVALID_STRUCTURED_ARTIFACT, severity: Severity.ERROR,
        message: `Challenge finding "${resolution.finding_id}" severity disagrees with related report.`,
        lineNumber, excerpt: '' });
    }
    const severity = resolution.severity || relatedFinding?.severity;
    if (!severity) {
      issues.push({ type: IssueType.CHALLENGE_FINDING_UNRESOLVED, severity: Severity.WARNING,
        message: `Challenge finding "${resolution.finding_id}" has no verifiable severity.`,
        lineNumber, excerpt: '' });
    }
    if (resolution.state === 'deferred') {
      issues.push({ type: IssueType.CHALLENGE_FINDING_UNRESOLVED,
        severity: severity === 'critical' ? Severity.WARNING : Severity.INFO,
        message: `Challenge finding "${resolution.finding_id}" is still deferred.`,
        lineNumber, excerpt: '' });
    }
  }

  for (const related of relatedArtifacts || []) {
    if (related?.artifact_type !== 'challenge-report') continue;
    const findings = Array.isArray(related?.payload?.findings) ? related.payload.findings : [];

    for (const finding of findings) {
      const resolution = resolutionMap.get(finding.finding_id);
      const severity = finding?.severity === 'critical' ? Severity.WARNING : Severity.INFO;

      if (!resolution) {
        issues.push({
          type: IssueType.CHALLENGE_FINDING_UNRESOLVED,
          severity,
          message: `Challenge finding "${finding.finding_id}" is missing a resolution state.`,
          lineNumber,
          excerpt: '',
        });
        continue;
      }

    }
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Structured artifact helpers
// ---------------------------------------------------------------------------

function collectRequiredClaims(artifact) {
  const claims = [
    {
      id: 'decision_frame.recommendation',
      label: 'decision frame recommendation',
      node: artifact?.decision_frame,
      evidenceIds: [],
    },
  ];

  switch (artifact?.artifact_type) {
    case 'prd': {
      const problem = artifact?.payload?.problem_statement;
      if (problem?.problem_id) {
        claims.push({
          id: problem.problem_id,
          label: `problem statement "${problem.problem_id}"`,
          node: problem,
          evidenceIds: artifact?.payload?.customer_evidence_ids || [],
        });
      }

      for (const metric of artifact?.payload?.success_metrics || []) {
        if (!metric?.metric_id) continue;
        claims.push({
          id: metric.metric_id,
          label: `success metric "${metric.name || metric.metric_id}"`,
          node: metric,
          evidenceIds: metric.evidence_ids || [],
        });
      }
      break;
    }
    case 'strategy': {
      for (const bet of artifact?.payload?.bets || []) {
        if (!bet?.bet_id) continue;
        claims.push({
          id: bet.bet_id,
          label: `strategy bet "${bet.name || bet.bet_id}"`,
          node: bet,
          evidenceIds: bet.evidence_ids || [],
        });
      }
      break;
    }
    case 'challenge-report': {
      for (const finding of artifact?.payload?.findings || []) {
        if (!finding?.finding_id) continue;
        claims.push({
          id: finding.finding_id,
          label: `challenge finding "${finding.finding_id}"`,
          node: finding,
          evidenceIds: finding.evidence_ids || [],
        });
      }
      break;
    }
    default:
      break;
  }

  return claims;
}

function buildEvidenceSupportIndex(evidence) {
  const index = new Map();
  for (const item of evidence) {
    if (!item || !Array.isArray(item.supports)) continue;
    for (const supportedId of item.supports) {
      if (!index.has(supportedId)) index.set(supportedId, new Set());
      if (item.evidence_id) index.get(supportedId).add(item.evidence_id);
    }
  }
  return index;
}

function claimHasEvidence(claim, supportsIndex, evidenceIds) {
  if (supportsIndex.has(claim.id) && supportsIndex.get(claim.id).size > 0) return true;
  if (Array.isArray(claim.evidenceIds) && claim.evidenceIds.some((id) => evidenceIds.has(id))) return true;
  return false;
}

function claimAllowsAssumption(claim) {
  return Boolean(claim?.node?.hypothesis || claim?.node?.assumption);
}

function extractMetrics(artifact) {
  const metrics = [];

  if (artifact?.artifact_type === 'prd') {
    for (const metric of artifact?.payload?.success_metrics || []) {
      metrics.push(normalizeMetric(metric));
    }
  }

  if (artifact?.artifact_type === 'strategy') {
    for (const bet of artifact?.payload?.bets || []) {
      metrics.push(normalizeMetric(bet?.success_metric));
    }
  }

  return metrics.filter(Boolean);
}

function normalizeMetric(metric) {
  if (!metric || typeof metric !== 'object') return null;
  const name = String(metric.name || metric.metric_id || '').trim();
  if (!name) return null;

  const segment = normalizeSegment(metric.segment);
  const unit = String(metric.unit || '').trim().toLowerCase();
  const timeframe = String(metric.timeframe || '').trim().toLowerCase();
  const key = metric.metric_id
    ? `id:${metric.metric_id}`
    : `name:${name.toLowerCase()}|segment:${segment || ''}|unit:${unit}|timeframe:${timeframe}`;

  return {
    key,
    name,
    segment,
    unit,
    timeframe,
    baseline: parseComparableNumber(metric.baseline),
    target: parseComparableNumber(metric.target),
    explanation: metric.explanation || '',
  };
}

function compareMetricValue(currentMetric, otherMetric, field) {
  const a = currentMetric[field];
  const b = otherMetric[field];
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;

  const diff = Math.abs(a - b);
  const denominator = Math.max(Math.abs(a), Math.abs(b), 1);
  const relativeDiff = diff / denominator;

  if (isRateMetric(currentMetric, otherMetric)) {
    return diff > 2 || relativeDiff > 0.1;
  }

  return relativeDiff > 0.1;
}

function isRateMetric(...metrics) {
  return metrics.some((metric) => /%|\b(percent|percentage)\b/i.test(metric?.unit || ''));
}

function hasContradictionExplanation(metric) {
  return typeof metric?.explanation === 'string' && metric.explanation.trim().length > 0;
}

function parseComparableNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;

  const normalized = value.replace(/,/g, '').replace(/%/g, '').trim();
  if (!normalized) return null;

  // Do not silently turn "10-20", "30 days" or "1M" into a different number.
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function extractPrimarySegment(artifact) {
  if (artifact?.artifact_type === 'strategy') return artifact?.payload?.primary_segment || null;
  if (artifact?.artifact_type === 'prd') return artifact?.payload?.target_segment || null;
  return null;
}

function normalizeSegment(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

function severityForChallengeFinding(findingSeverity, state) {
  if (state === 'resolved' || state === 'waived') return Severity.INFO;

  switch (String(findingSeverity || '').toLowerCase()) {
    case 'critical':
      return Severity.ERROR;
    case 'moderate':
      return Severity.WARNING;
    default:
      return Severity.INFO;
  }
}

// ---------------------------------------------------------------------------
// Paragraph helpers
// ---------------------------------------------------------------------------

function splitIntoParagraphs(text) {
  const lines = text.split('\n');
  const paragraphs = [];
  let current = [];
  let startLine = 1;

  // Input is visible text: fences and comments are already blank lines.
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (line.trim() === '') {
      if (current.length > 0) {
        paragraphs.push({ content: current.join('\n'), startLine });
        current = [];
      }
      startLine = i + 2;
    } else {
      if (current.length === 0) startLine = i + 1;
      current.push(line);
    }
  }

  if (current.length > 0) {
    paragraphs.push({ content: current.join('\n'), startLine });
  }

  return paragraphs;
}

function splitIntoClaims(text) {
  const visible = visibleMarkdown(text);
  const claims = [];
  let inSources = false;
  for (const paragraph of splitIntoParagraphs(visible)) {
    const lines = paragraph.content.split('\n');
    if (/^#{1,6}\s+(?:Sources|References|Evidence)\s*$/i.test(lines[0].trim())) {
      inSources = true;
      continue;
    }
    if (/^#{1,6}\s+/.test(lines[0].trim())) {
      inSources = false;
      continue;
    }
    if (inSources || /^<!--/.test(lines[0].trim())) continue;
    if (lines[0].trim().startsWith('|')) {
      const rows = lines.filter(line => line.trim().startsWith('|'));
      const headers = rows[0]?.split('|').slice(1, -1).map(cell => cell.trim().toLowerCase()) || [];
      for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
        if (/^\s*\|?\s*:?-{2,}/.test(rows[rowIndex])) continue;
        const cells = rows[rowIndex].split('|').slice(1, -1).map(cell => cell.trim());
        const sourceIndex = headers.findIndex(header => /^(?:source|citation|reference)$/.test(header));
        const sourceCell = cells[sourceIndex] || '';
        const source = sourceIndex >= 0
          && (hasCitationMarker(sourceCell) || /\bhttps?:\/\/\S+/i.test(sourceCell));
        for (let cellIndex = 0; cellIndex < cells.length; cellIndex += 1) {
          if (cellIndex === sourceIndex) continue;
          claims.push({ content: cells[cellIndex], startLine: paragraph.startLine + rowIndex, table: true, source });
        }
      }
      continue;
    }
    for (const line of lines) {
      const lineNumber = paragraph.startLine + lines.indexOf(line);
      for (const sentence of line.split(/(?<=[.!?])\s+(?=[A-Z0-9])/)) {
        if (sentence.trim()) claims.push({ content: sentence, startLine: lineNumber, table: false, source: false });
      }
    }
  }
  return claims;
}

function hasCitationMarker(claim) {
  if (/\[\d+\]/.test(claim)) return true;
  if (/\((?:source|via|from|see|ref)\s*:/i.test(claim)) return true;
  if (/\[[^\]]+\]\(https?:\/\//.test(claim)) return true;
  if (/\b(?:according to|per|source:|ref:|see)\s+https?:\/\/\S+/i.test(claim)) return true;
  return false;
}

function isClaimContext(content, matchIndex) {
  const before = content.slice(Math.max(0, matchIndex - 200), matchIndex);
  const after = content.slice(matchIndex, Math.min(content.length, matchIndex + 100));

  const context = (before.slice(-120) + after).toLowerCase();
  return /\b(?:is|are|was|were|has|have|grew|shows?|increased?|decreased?|reached?|represents?|estimated|worth|valued?|raised?|grew to|stands at|sits at)\b/.test(
    context,
  );
}

function hasVerbPhrase(content) {
  return /\b(?:is|are|was|were|has|have|grew|shows?|increased?|decreased?|reached?|represents?|estimated|worth|valued?|raised?|accounts? for|contributes?|grew to|stands at)\b/i.test(
    content,
  );
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function truncateExcerpt(text, maxChars) {
  const clean = text.replace(/\n+/g, ' ').trim();
  if (clean.length <= maxChars) return clean;
  return `${clean.slice(0, maxChars - 3).trimEnd()}...`;
}

function buildSummary(issues) {
  if (issues.length === 0) return 'No issues found.';

  const counts = {};
  for (const issue of issues) {
    counts[issue.type] = (counts[issue.type] || 0) + 1;
  }

  const parts = Object.entries(counts).map(
    ([type, count]) => `${count} ${type}`,
  );
  return `${issues.length} issue(s) found: ${parts.join(', ')}.`;
}

async function loadRelatedArtifact(filePath) {
  const resolved = path.resolve(filePath);
  const ext = path.extname(resolved).toLowerCase();
  const raw = await readFile(resolved, 'utf8');

  if (ext === '.json') {
    return JSON.parse(raw);
  }

  const extracted = extractStructuredArtifact(raw);
  if (extracted.error) {
    throw new Error(`Invalid structured artifact JSON in ${filePath}: ${extracted.error}`);
  }
  if (!extracted.artifact) {
    throw new Error(`No structured artifact block found in ${filePath}`);
  }
  return extracted.artifact;
}

function collectFlagValues(argv, flagName) {
  const values = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === flagName && argv[i + 1]) {
      values.push(argv[i + 1]);
      i += 1;
    }
  }
  return values;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

async function main(argv = process.argv.slice(2)) {
  // Skip the values of flags that take one, so the path may come after them.
  const VALUE_FLAGS = new Set(['--expect-sections', '--artifact-type', '--related', '--format']);
  const filePath = argv.find((arg, index) => !arg.startsWith('--') && !VALUE_FLAGS.has(argv[index - 1]));
  if (!filePath) {
    console.error('Usage: node scripts/validate-artifact.mjs <path-to-markdown> [--expect-sections "Section1,Section2"] [--expect-structured] [--artifact-type prd] [--related path] [--require-ready] [--format json]');
    process.exitCode = 1;
    return;
  }

  let expectSections = [];
  const sectionsFlag = argv.findIndex((arg) => arg === '--expect-sections');
  if (sectionsFlag !== -1 && argv[sectionsFlag + 1]) {
    expectSections = argv[sectionsFlag + 1]
      .split(',')
      .map((section) => section.trim())
      .filter(Boolean);
  }

  const expectStructured = argv.includes('--expect-structured');
  const requireReady = argv.includes('--require-ready');
  const formatFlag = argv.findIndex((arg) => arg === '--format');
  const outputFormat = formatFlag !== -1 && argv[formatFlag + 1] ? argv[formatFlag + 1] : 'text';
  const artifactTypeFlag = argv.findIndex((arg) => arg === '--artifact-type');
  const artifactType = artifactTypeFlag !== -1 && argv[artifactTypeFlag + 1] ? argv[artifactTypeFlag + 1] : undefined;
  const relatedPaths = collectFlagValues(argv, '--related');

  let text;
  try {
    text = await readFile(path.resolve(filePath), 'utf8');
  } catch (error) {
    console.error(`Cannot read file: ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
    return;
  }

  let relatedArtifacts = [];
  try {
    relatedArtifacts = await Promise.all(relatedPaths.map((entry) => loadRelatedArtifact(entry)));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
    return;
  }

  const result = validateArtifact(text, {
    expectSections,
    expectStructured,
    artifactType,
    relatedArtifacts,
  });

  if (outputFormat === 'json') {
    console.log(JSON.stringify({ issues: result.issues, summary: result.summary,
      valid: result.valid, readiness: result.readiness }, null, 2));
  } else if (result.issues.length === 0) {
    console.log(requireReady && !result.readiness.engineeringReady
      ? 'Contract valid; engineering handoff is NOT READY.' : 'OK: No issues found.');
  } else {
    console.log(`\n${result.summary}\n`);
    for (const issue of result.issues) {
      console.log(`[${issue.severity.toUpperCase()}] Line ${issue.lineNumber}: ${issue.type}`);
      console.log(`  ${issue.message}`);
      if (issue.excerpt) console.log(`  > ${issue.excerpt}`);
      console.log('');
    }
  }

  if (outputFormat !== 'json' && requireReady && !result.readiness.engineeringReady) {
    console.log('Engineering readiness blockers:');
    for (const reason of result.readiness.engineeringReasons) console.log(`  - ${reason}`);
  }

  if (!result.valid) process.exitCode = 1;
  else if (requireReady && !result.readiness.engineeringReady) process.exitCode = 2;
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
