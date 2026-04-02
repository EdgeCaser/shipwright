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

import {
  extractStructuredArtifact,
  validateStructuredArtifact,
} from './extract-structured-artifact.mjs';

// ---------------------------------------------------------------------------
// Public constants
// ---------------------------------------------------------------------------

export const IssueType = Object.freeze({
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
  if (!text || typeof text !== 'string') {
    return { issues: [], summary: 'No content to validate.', artifact: null };
  }

  const {
    expectSections = [],
    checkCitations = true,
    expectStructured = false,
    artifactType,
    relatedArtifacts = [],
  } = options;

  const issues = [];

  const hasCitationAnchor = detectCitationAnchorSection(text);
  if (checkCitations && !hasCitationAnchor) {
    issues.push(...checkUnsupportedDollarFigures(text));
    issues.push(...checkUnsupportedNumericClaims(text));
  }

  for (const section of expectSections) {
    const issue = checkMissingSection(text, section);
    if (issue) issues.push(issue);
  }

  const extracted = extractStructuredArtifact(text);
  const shouldCheckStructured =
    expectStructured || Boolean(artifactType) || Boolean(extracted.artifact) || Boolean(extracted.error);

  if (shouldCheckStructured) {
    if (extracted.error) {
      issues.push({
        type: IssueType.INVALID_STRUCTURED_ARTIFACT,
        severity: Severity.ERROR,
        message: `Structured artifact block contains invalid JSON: ${extracted.error}`,
        lineNumber: extracted.startLine,
        excerpt: truncateExcerpt(extracted.raw || '', 150),
      });
    } else if (!extracted.artifact && expectStructured) {
      issues.push({
        type: IssueType.MISSING_STRUCTURED_ARTIFACT,
        severity: Severity.WARNING,
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

      issues.push(
        ...checkDecisionFrameContract(extracted.artifact, extracted.startLine),
        ...checkPassFailContract(extracted.artifact, extracted.startLine),
        ...checkEvidenceContract(extracted.artifact, extracted.startLine),
        ...checkMetricContradictions(extracted.artifact, relatedArtifacts, extracted.startLine),
        ...checkSegmentContradictions(extracted.artifact, relatedArtifacts, extracted.startLine),
        ...checkChallengePropagation(extracted.artifact, relatedArtifacts, extracted.startLine),
      );
    }
  }

  return { issues, summary: buildSummary(issues), artifact: extracted.artifact || null };
}

// ---------------------------------------------------------------------------
// Detectors
// ---------------------------------------------------------------------------

function detectCitationAnchorSection(text) {
  return /^#{1,4}\s*(sources?|references?|evidence|footnotes?|citations?|bibliography)\s*$/im.test(
    text,
  );
}

function checkUnsupportedDollarFigures(text) {
  const issues = [];

  for (const { content, startLine } of splitIntoParagraphs(text)) {
    if (isExemptParagraph(content)) continue;
    if (hasCitationMarker(content)) continue;

    const dollarPattern = /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:[BMKbmk](?:illion)?)?/g;
    let matched = false;

    for (const match of content.matchAll(dollarPattern)) {
      if (!isClaimContext(content, match.index ?? 0)) continue;
      matched = true;
      break;
    }

    if (matched) {
      issues.push({
        type: IssueType.UNSUPPORTED_DOLLAR,
        severity: Severity.WARNING,
        message: 'Dollar figure in prose without a nearby citation marker.',
        lineNumber: startLine,
        excerpt: truncateExcerpt(content, 150),
      });
    }
  }

  return issues;
}

function checkUnsupportedNumericClaims(text) {
  const issues = [];

  for (const { content, startLine } of splitIntoParagraphs(text)) {
    if (isExemptParagraph(content)) continue;
    if (hasCitationMarker(content)) continue;

    const hasPercent = /\b\d{1,3}(?:\.\d+)?\s*%/.test(content);
    const hasLargeNumber =
      /\b\d+(?:\.\d+)?\s*(?:million|billion|trillion)\b/i.test(content);

    if (!hasPercent && !hasLargeNumber) continue;
    if (!hasVerbPhrase(content)) continue;

    issues.push({
      type: IssueType.UNSUPPORTED_NUMERIC,
      severity: Severity.WARNING,
      message: hasPercent
        ? 'Percentage claim in prose without a nearby citation marker.'
        : 'Large numeric claim in prose without a nearby citation marker.',
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
  const evidenceIds = new Set(evidence.map((item) => item?.evidence_id).filter(Boolean));
  const supportsIndex = buildEvidenceSupportIndex(evidence);
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

function checkMetricContradictions(artifact, relatedArtifacts, lineNumber) {
  const issues = [];
  const currentMetrics = extractMetrics(artifact);
  const seen = new Set();

  for (const related of relatedArtifacts || []) {
    const relatedMetrics = extractMetrics(related);

    for (const currentMetric of currentMetrics) {
      for (const otherMetric of relatedMetrics) {
        if (currentMetric.key !== otherMetric.key) continue;
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
  const resolutionMap = new Map(
    (Array.isArray(artifact?.challenge_resolution) ? artifact.challenge_resolution : [])
      .filter((item) => item && item.finding_id)
      .map((item) => [item.finding_id, item]),
  );

  for (const related of relatedArtifacts || []) {
    if (related?.artifact_type !== 'challenge-report') continue;
    const findings = Array.isArray(related?.payload?.findings) ? related.payload.findings : [];

    for (const finding of findings) {
      const resolution = resolutionMap.get(finding.finding_id);
      const severity = severityForChallengeFinding(finding?.severity, resolution?.state);

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

      if (resolution.state === 'waived' && (!resolution.waiver_reason || !resolution.owner)) {
        issues.push({
          type: IssueType.CHALLENGE_FINDING_UNRESOLVED,
          severity: Severity.ERROR,
          message: `Waived challenge finding "${finding.finding_id}" must include waiver_reason and owner.`,
          lineNumber,
          excerpt: '',
        });
      }

      if (resolution.state === 'deferred') {
        issues.push({
          type: IssueType.CHALLENGE_FINDING_UNRESOLVED,
          severity,
          message: `Challenge finding "${finding.finding_id}" is still deferred.`,
          lineNumber,
          excerpt: '',
        });
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
  return metrics.some((metric) => /\b(percent|percentage|%)\b/i.test(metric?.unit || ''));
}

function hasContradictionExplanation(metric) {
  return typeof metric?.explanation === 'string' && metric.explanation.trim().length > 0;
}

function parseComparableNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;

  const normalized = value.replace(/,/g, '').replace(/%/g, '').trim();
  if (!normalized) return null;

  const parsed = Number.parseFloat(normalized);
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
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (/^```/.test(line)) {
      inCodeBlock = !inCodeBlock;
      if (inCodeBlock && current.length > 0) {
        paragraphs.push({ content: current.join('\n'), startLine });
        current = [];
      }
      continue;
    }

    if (inCodeBlock) continue;

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

function isExemptParagraph(content) {
  const firstLine = (content.split('\n')[0] || '').trimStart();

  if (firstLine.startsWith('|')) return true;
  if (/^#{1,6}\s/.test(firstLine)) return true;
  if (firstLine.startsWith('<!--')) return true;
  if (content.trim().length < 60) return true;

  return false;
}

function hasCitationMarker(paragraph) {
  if (/https?:\/\/\S+/.test(paragraph)) return true;
  if (/\[\d+\]/.test(paragraph)) return true;
  if (/\((?:source|via|from|see|ref)\s*:/i.test(paragraph)) return true;
  if (/\[[^\]]+\]\(https?:\/\//.test(paragraph)) return true;
  if (/\baccording to\b/i.test(paragraph)) return true;
  return false;
}

function isClaimContext(content, matchIndex) {
  const before = content.slice(Math.max(0, matchIndex - 200), matchIndex);
  const after = content.slice(matchIndex, Math.min(content.length, matchIndex + 100));

  const lastNewline = before.lastIndexOf('\n');
  const lineStart = before.slice(lastNewline + 1).trimStart();
  if (/^[-*+]\s/.test(lineStart)) return false;
  if (/^\|/.test(lineStart)) return false;

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
  const filePath = argv.find((arg) => !arg.startsWith('--'));
  if (!filePath) {
    console.error('Usage: node scripts/validate-artifact.mjs <path-to-markdown> [--expect-sections "Section1,Section2"] [--expect-structured] [--artifact-type prd] [--related path] [--format json]');
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
    console.log(JSON.stringify({ issues: result.issues, summary: result.summary }, null, 2));
  } else if (result.issues.length === 0) {
    console.log('OK: No issues found.');
  } else {
    console.log(`\n${result.summary}\n`);
    for (const issue of result.issues) {
      console.log(`[${issue.severity.toUpperCase()}] Line ${issue.lineNumber} — ${issue.type}`);
      console.log(`  ${issue.message}`);
      if (issue.excerpt) console.log(`  > ${issue.excerpt}`);
      console.log('');
    }
  }

  if (result.issues.length > 0) {
    process.exitCode = 1;
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
