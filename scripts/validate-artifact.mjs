#!/usr/bin/env node

/**
 * Shipwright postflight artifact validator.
 *
 * Runs deterministic checks on a markdown artifact and returns a list of
 * issues. Conservative by design: false negatives are preferred over false
 * positives, so only high-signal patterns are flagged.
 *
 * Checks:
 *   unsupported-dollar   Dollar figures in prose without a nearby citation marker
 *   unsupported-numeric  Percentage or large-number claims in prose without citation
 *   missing-section      Expected section headings absent from the document
 *
 * NOT checked (intentionally deferred to a future pass):
 *   Contradictory claims — requires semantic understanding, not a reliable
 *   deterministic heuristic at this stage.
 *
 * Citation shortcut: if the document contains a Sources / References /
 * Evidence section, individual paragraph citation checks are skipped.
 * The section acts as a document-level citation anchor.
 *
 * Usage (programmatic):
 *   import { validateArtifact } from './validate-artifact.mjs';
 *   const { issues, summary } = validateArtifact(markdownText, {
 *     expectSections: ['Background', 'Success Metrics'],
 *   });
 *
 * Usage (CLI):
 *   node scripts/validate-artifact.mjs path/to/artifact.md
 *   node scripts/validate-artifact.mjs path/to/artifact.md --expect-sections "Sources,Risks"
 */

import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Public constants
// ---------------------------------------------------------------------------

export const IssueType = Object.freeze({
  UNSUPPORTED_DOLLAR: 'unsupported-dollar',
  UNSUPPORTED_NUMERIC: 'unsupported-numeric',
  MISSING_SECTION: 'missing-section',
});

export const Severity = Object.freeze({
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
 *   Section heading names that must be present (exact match, case-insensitive).
 *   Flags as WARNING if missing.
 * @param {boolean} [options.checkCitations]
 *   Check for unsupported dollar/numeric claims. Default: true.
 *   Automatically skipped when a Sources/References/Evidence section is found.
 * @returns {{ issues: ValidationIssue[], summary: string }}
 */
export function validateArtifact(text, options = {}) {
  if (!text || typeof text !== 'string') {
    return { issues: [], summary: 'No content to validate.' };
  }

  const { expectSections = [], checkCitations = true } = options;

  const issues = [];

  // If the document has a citation anchor section, individual paragraph
  // citation checks are unnecessary — all claims are implicitly sourced.
  const hasCitationAnchor = detectCitationAnchorSection(text);

  if (checkCitations && !hasCitationAnchor) {
    issues.push(...checkUnsupportedDollarFigures(text));
    issues.push(...checkUnsupportedNumericClaims(text));
  }

  for (const section of expectSections) {
    const issue = checkMissingSection(text, section);
    if (issue) issues.push(issue);
  }

  return { issues, summary: buildSummary(issues) };
}

// ---------------------------------------------------------------------------
// Detectors
// ---------------------------------------------------------------------------

/**
 * Returns true when the document contains a Sources / References / Evidence
 * section heading, which acts as a citation anchor for the whole document.
 */
function detectCitationAnchorSection(text) {
  return /^#{1,4}\s*(sources?|references?|evidence|footnotes?|citations?|bibliography)\s*$/im.test(
    text,
  );
}

/**
 * Scan prose paragraphs for dollar figures without a nearby citation marker.
 *
 * Exempt: table rows, headings, code blocks, very short paragraphs.
 * A dollar figure is flagged only when it reads as a factual claim
 * (contains a verb phrase) and no URL, footnote ref, or citation phrase
 * appears in the same paragraph.
 */
function checkUnsupportedDollarFigures(text) {
  const issues = [];

  for (const { content, startLine } of splitIntoParagraphs(text)) {
    if (isExemptParagraph(content)) continue;
    if (hasCitationMarker(content)) continue;

    // Match: $4.5B, $1,200, $29, $4.5 million, etc.
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

/**
 * Scan prose paragraphs for percentage or large-number claims without citation.
 *
 * Only flags when the paragraph reads as a factual claim (contains a verb
 * phrase). Skips table rows, headings, code blocks.
 */
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

/**
 * Check that a specific expected section heading exists.
 * Matching is case-insensitive, leading/trailing whitespace is ignored.
 */
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

// ---------------------------------------------------------------------------
// Paragraph helpers
// ---------------------------------------------------------------------------

/**
 * Split markdown text into paragraphs, tracking the starting line number of
 * each paragraph. Skips content inside fenced code blocks.
 *
 * @returns {{ content: string, startLine: number }[]}
 */
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
      // Flush any pending paragraph when entering a code block
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

/**
 * Returns true when the paragraph should be skipped for citation checks:
 *   - Table rows (start with |)
 *   - Section headings
 *   - HTML comments
 *   - Very short paragraphs unlikely to contain substantive claims (< 60 chars)
 */
function isExemptParagraph(content) {
  const firstLine = (content.split('\n')[0] || '').trimStart();

  if (firstLine.startsWith('|')) return true;     // table row
  if (/^#{1,6}\s/.test(firstLine)) return true;   // heading
  if (firstLine.startsWith('<!--')) return true;  // HTML comment

  // Short content is unlikely to carry a testable claim
  if (content.trim().length < 60) return true;

  return false;
}

/**
 * Returns true when the paragraph contains a citation marker:
 *   - URL
 *   - Numbered footnote reference [1]
 *   - Inline citation phrase (source:, via:, from:, see:, ref:)
 *   - Markdown link with URL
 *   - "According to"
 */
function hasCitationMarker(paragraph) {
  if (/https?:\/\/\S+/.test(paragraph)) return true;
  if (/\[\d+\]/.test(paragraph)) return true;
  if (/\((?:source|via|from|see|ref)\s*:/i.test(paragraph)) return true;
  if (/\[[^\]]+\]\(https?:\/\//.test(paragraph)) return true;
  if (/\baccording to\b/i.test(paragraph)) return true;
  return false;
}

/**
 * Returns true when the position in the content looks like a factual claim:
 * the figure appears in a sentence with a present/past verb, not in a
 * plain list item or table cell.
 */
function isClaimContext(content, matchIndex) {
  const before = content.slice(Math.max(0, matchIndex - 200), matchIndex);
  const after = content.slice(matchIndex, Math.min(content.length, matchIndex + 100));

  // Detect plain list items (- $29/month) — these are data, not claims
  const lastNewline = before.lastIndexOf('\n');
  const lineStart = before.slice(lastNewline + 1).trimStart();
  if (/^[-*+]\s/.test(lineStart)) return false;
  if (/^\|/.test(lineStart)) return false;

  // Require a claim verb near the figure
  const context = (before.slice(-120) + after).toLowerCase();
  return /\b(?:is|are|was|were|has|have|grew|shows?|increased?|decreased?|reached?|represents?|estimated|worth|valued?|raised?|grew to|stands at|sits at)\b/.test(
    context,
  );
}

/**
 * Returns true when the content contains a verb phrase suggesting a claim.
 */
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

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

async function main(argv = process.argv.slice(2)) {
  const filePath = argv.find((a) => !a.startsWith('--'));
  if (!filePath) {
    console.error('Usage: node scripts/validate-artifact.mjs <path-to-markdown> [--expect-sections "Section1,Section2"]');
    process.exitCode = 1;
    return;
  }

  let expectSections = [];
  const sectionsFlag = argv.findIndex((a) => a === '--expect-sections');
  if (sectionsFlag !== -1 && argv[sectionsFlag + 1]) {
    expectSections = argv[sectionsFlag + 1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  let text;
  try {
    text = await readFile(path.resolve(filePath), 'utf8');
  } catch (error) {
    console.error(`Cannot read file: ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
    return;
  }

  const { issues, summary } = validateArtifact(text, { expectSections });

  if (issues.length === 0) {
    console.log('OK: No issues found.');
    return;
  }

  console.log(`\n${summary}\n`);
  for (const issue of issues) {
    console.log(`[${issue.severity.toUpperCase()}] Line ${issue.lineNumber} — ${issue.type}`);
    console.log(`  ${issue.message}`);
    if (issue.excerpt) console.log(`  > ${issue.excerpt}`);
    console.log('');
  }

  process.exitCode = 1;
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
