import assert from 'node:assert/strict';
import test from 'node:test';

import {
  IssueType,
  Severity,
  validateArtifact,
} from '../scripts/validate-artifact.mjs';

// ---------------------------------------------------------------------------
// Citation anchor section
// ---------------------------------------------------------------------------

test('validateArtifact returns no issues when document has a Sources section', { concurrency: false }, () => {
  const text = `
# Market Analysis

The market is worth $4.5B and grew by 37% last year.

## Sources

- https://example.com/market-report-2026
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(issues.length, 0, 'Sources section should suppress citation checks');
});

test('validateArtifact returns no issues when document has a References section', { concurrency: false }, () => {
  const text = `
# Analysis

Revenue reached $2.1B in FY25.

## References

[1] Annual Report 2025
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(issues.length, 0);
});

test('validateArtifact returns no issues when document has an Evidence section', { concurrency: false }, () => {
  const text = `
# Competitive Brief

Competitor grew 200% year-over-year.

## Evidence

- Source: industry report
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(issues.length, 0);
});

// ---------------------------------------------------------------------------
// Dollar figure checks
// ---------------------------------------------------------------------------

test('validateArtifact flags dollar figure in prose without citation', { concurrency: false }, () => {
  const text = `
# Market Analysis

The market is worth $4.5 billion and has been growing rapidly.
  `.trim();

  const { issues } = validateArtifact(text);
  assert.ok(
    issues.some((i) => i.type === IssueType.UNSUPPORTED_DOLLAR),
    'should flag unsupported dollar figure',
  );
  const issue = issues.find((i) => i.type === IssueType.UNSUPPORTED_DOLLAR);
  assert.equal(issue.severity, Severity.WARNING);
  assert.ok(issue.lineNumber >= 1);
});

test('validateArtifact does not flag dollar figure when URL is in the paragraph', { concurrency: false }, () => {
  const text = `
# Analysis

The market is worth $4.5 billion according to https://example.com/report.
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(
    issues.filter((i) => i.type === IssueType.UNSUPPORTED_DOLLAR).length,
    0,
    'URL citation should suppress the flag',
  );
});

test('validateArtifact does not flag dollar figure when "According to" is present', { concurrency: false }, () => {
  const text = `
# Analysis

According to Gartner, the market reached $6.7B in 2025.
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(issues.filter((i) => i.type === IssueType.UNSUPPORTED_DOLLAR).length, 0);
});

test('validateArtifact does not flag dollar figures in table rows', { concurrency: false }, () => {
  const text = `
# Pricing Comparison

| Plan | Price |
|------|-------|
| Starter | $29/month |
| Pro | $99/month |
| Enterprise | $499/month |
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(
    issues.filter((i) => i.type === IssueType.UNSUPPORTED_DOLLAR).length,
    0,
    'table rows are exempt from citation checks',
  );
});

test('validateArtifact does not flag dollar figures in headings', { concurrency: false }, () => {
  const text = `
## Revenue Target: $50M ARR
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(issues.filter((i) => i.type === IssueType.UNSUPPORTED_DOLLAR).length, 0);
});

test('validateArtifact does not flag dollar figures in list items without claim context', { concurrency: false }, () => {
  const text = `
# Pricing

- Starter: $29/month
- Pro: $99/month
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(issues.filter((i) => i.type === IssueType.UNSUPPORTED_DOLLAR).length, 0);
});

test('validateArtifact does not flag dollar figures with footnote reference', { concurrency: false }, () => {
  const text = `
# Analysis

The market grew to $3.2B in FY25 [1].
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(issues.filter((i) => i.type === IssueType.UNSUPPORTED_DOLLAR).length, 0);
});

// ---------------------------------------------------------------------------
// Numeric claim checks
// ---------------------------------------------------------------------------

test('validateArtifact flags percentage claim in prose without citation', { concurrency: false }, () => {
  const text = `
# Market Dynamics

The segment accounts for 37% of total revenue and has grown substantially.
  `.trim();

  const { issues } = validateArtifact(text);
  assert.ok(
    issues.some((i) => i.type === IssueType.UNSUPPORTED_NUMERIC),
    'percentage claim should be flagged',
  );
});

test('validateArtifact flags large-number claim without citation', { concurrency: false }, () => {
  const text = `
# TAM Analysis

The total addressable market is estimated at 2.5 billion users globally.
  `.trim();

  const { issues } = validateArtifact(text);
  assert.ok(
    issues.some((i) => i.type === IssueType.UNSUPPORTED_NUMERIC),
    'large number claim should be flagged',
  );
});

test('validateArtifact does not flag numeric claims in code blocks', { concurrency: false }, () => {
  const text = `
# Example

\`\`\`
growth_rate = 0.37  # 37%
\`\`\`
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(issues.filter((i) => i.type === IssueType.UNSUPPORTED_NUMERIC).length, 0);
});

test('validateArtifact does not flag numeric claim with URL citation', { concurrency: false }, () => {
  const text = `
# Analysis

The growth rate was 43% in Q3 per https://example.com/quarterly-results.
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(issues.filter((i) => i.type === IssueType.UNSUPPORTED_NUMERIC).length, 0);
});

// ---------------------------------------------------------------------------
// Missing section checks
// ---------------------------------------------------------------------------

test('validateArtifact flags missing explicit section', { concurrency: false }, () => {
  const text = `
# Analysis

Some content here.
  `.trim();

  const { issues } = validateArtifact(text, { expectSections: ['Sources'] });
  assert.ok(
    issues.some((i) => i.type === IssueType.MISSING_SECTION && i.message.includes('Sources')),
  );
  const issue = issues.find((i) => i.type === IssueType.MISSING_SECTION);
  assert.equal(issue.severity, Severity.WARNING);
});

test('validateArtifact does not flag when expected section is present', { concurrency: false }, () => {
  const text = `
# Analysis

## Sources

- Evidence 1
  `.trim();

  const { issues } = validateArtifact(text, { expectSections: ['Sources'] });
  assert.equal(issues.filter((i) => i.type === IssueType.MISSING_SECTION).length, 0);
});

test('validateArtifact checks multiple expected sections independently', { concurrency: false }, () => {
  const text = `
# PRD

## Background

Some background.

## Goals

Some goals.
  `.trim();

  const { issues } = validateArtifact(text, {
    expectSections: ['Background', 'Goals', 'Success Metrics'],
  });

  const missingSections = issues.filter((i) => i.type === IssueType.MISSING_SECTION);
  assert.equal(missingSections.length, 1);
  assert.ok(missingSections[0].message.includes('Success Metrics'));
});

test('validateArtifact section check is case-insensitive', { concurrency: false }, () => {
  const text = `
# Doc

## sources

- link here
  `.trim();

  const { issues } = validateArtifact(text, { expectSections: ['Sources'] });
  assert.equal(issues.filter((i) => i.type === IssueType.MISSING_SECTION).length, 0);
});

// ---------------------------------------------------------------------------
// checkCitations: false
// ---------------------------------------------------------------------------

test('validateArtifact skips citation checks when checkCitations is false', { concurrency: false }, () => {
  const text = `
# Analysis

Revenue was $5.2B and growth was 42%.
  `.trim();

  const { issues } = validateArtifact(text, { checkCitations: false });
  assert.equal(
    issues.filter(
      (i) => i.type === IssueType.UNSUPPORTED_DOLLAR || i.type === IssueType.UNSUPPORTED_NUMERIC,
    ).length,
    0,
  );
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

test('validateArtifact handles empty input gracefully', { concurrency: false }, () => {
  const { issues, summary } = validateArtifact('');
  assert.equal(issues.length, 0);
  assert.ok(summary.length > 0);
});

test('validateArtifact handles null input gracefully', { concurrency: false }, () => {
  const { issues } = validateArtifact(null);
  assert.equal(issues.length, 0);
});

test('validateArtifact summary reflects issue count', { concurrency: false }, () => {
  const text = `
# Report

Revenue grew to $4.5B over the period, representing 38% market share.
  `.trim();

  const { issues, summary } = validateArtifact(text);
  assert.ok(issues.length > 0);
  assert.match(summary, /\d+\s+issue/);
});

test('validateArtifact returns "No issues found." summary for clean document with Sources', { concurrency: false }, () => {
  const text = `
# Report

Revenue grew to $4.5B.

## Sources

- https://example.com/annual-report
  `.trim();

  const { summary } = validateArtifact(text);
  assert.equal(summary, 'No issues found.');
});

test('validateArtifact issue includes line number and excerpt', { concurrency: false }, () => {
  const text = `
# Report

The market is worth $12 billion and continues to grow.
  `.trim();

  const { issues } = validateArtifact(text);
  const issue = issues.find((i) => i.type === IssueType.UNSUPPORTED_DOLLAR || i.type === IssueType.UNSUPPORTED_NUMERIC);
  if (issue) {
    assert.ok(Number.isFinite(issue.lineNumber) && issue.lineNumber >= 1);
    assert.ok(typeof issue.excerpt === 'string');
  }
});
